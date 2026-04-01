const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxPoaXxReHc0gx9SbDE6er3AJtv2wzI87KYQ7w4kxVjZN0tVA7AN_VUyVZXIvyry9b-/exec';
                    

function verificarMaioridade() {
    const dataNasc = document.getElementById('Aluno_Data_Nasc').value;
    if (!dataNasc) return;

    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    const secaoResp = document.getElementById('secao-responsavel');
    if (idade < 18) {
        secaoResp.style.display = 'block';
        document.getElementById('Responsavel_Nome').required = true;
    } else {
        secaoResp.style.display = 'none';
        document.getElementById('Responsavel_Nome').required = false;
    }
}

// FUNÇÃO DE ENVIO REAL PARA A PLANILHA
document.getElementById('form-novo-aluno').addEventListener('submit', async function(e) {
    e.preventDefault(); // Impede o recarregamento da página (aqueles ? na URL)
    
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "ENVIANDO...";
    btn.disabled = true;

    // Captura os dados do formulário
    const formData = new FormData(this);
    
    // Montamos a lista na ordem exata das colunas da sua tabela CADASTRO
    const valores = [
        Date.now(), 
        formData.get('Aluno_Nome'),
        formData.get('Aluno_Data_Nasc'),
        formData.get('Aluno_Genero'),
        '', 
        formData.get('Aluno_WhatsApp'),
        new Date().toLocaleDateString('pt-BR'), 
        formData.get('Aluno_Status'),
        '', 
        '', 
        formData.get('Aluno_Bairro'),
        'São Paulo', 
        '', 
        formData.get('Responsavel_Nome') || '',
        formData.get('Responsavel_Condição') || '',
        formData.get('Responsavel_CPF') || '',
        '', 
        '', 
        '', 
        '', 
        ''  
    ];

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                aba: "CADASTRO",
                acao: "inserir",
                valores: valores
            })
        });

        alert('Sucesso! O aluno ' + formData.get('Aluno_Nome') + ' foi matriculado.');
        this.reset(); 
        document.getElementById('secao-responsavel').style.display = 'none';

    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Ops! Algo deu errado ao salvar na planilha.');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});


// --- PADRONIZAÇÃO E MÁSCARAS ---

// 1. Transformar tudo em Maiúsculas ao sair do campo
document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('blur', function() {
        this.value = this.value.toUpperCase();
    });
});

// 2. Máscara de WhatsApp (00) 00000-0000
const campoWhatsApp = document.querySelector('input[name="Aluno_WhatsApp"]');

campoWhatsApp.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    
    if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos

    // Aplica a formatação visual
    if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else if (value.length > 0) {
        value = value.replace(/^(\d{0,2}).*/, '($1');
    }
    
    e.target.value = value;
});

// 3. Máscara de CPF (Opcional, para os campos de Responsável)
const campoCPF = document.querySelector('input[name="Responsavel_CPF"]');
if (campoCPF) {
    campoCPF.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        e.target.value = value.slice(0, 14);
    });
}
