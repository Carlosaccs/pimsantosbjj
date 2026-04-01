const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztJh9obvf4K0W4oHDzkGXoobOzYG8Dnts-lSqSYvx2cIyQDRtElddqGlMyF6wET7WY/exec';

                    

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
document.getElementById('form-novo-aluno').addEventListener('submit', function(e) {
    e.preventDefault();

    // 1. VALIDAÇÃO DE SEGURANÇA (MENORES)
    const secaoResponsavel = document.getElementById('secao-responsavel');
    const nomeResp = document.getElementById('Responsavel_Nome');
    const cpfResp = document.getElementById('Responsavel_CPF');

    // Se a seção estiver visível, os campos tornam-se obrigatórios
    if (secaoResponsavel.style.display !== 'none') {
        if (!nomeResp.value.trim() || !cpfResp.value.trim()) {
            alert("⚠️ ATENÇÃO: Para menores de idade, o Nome e CPF do Responsável são obrigatórios!");
            nomeResp.focus();
            return; // Interrompe o envio
        }
    }

    // 2. PREPARAÇÃO DOS DADOS
    const btn = document.getElementById('btn-submit');
    btn.innerText = "ENVIANDO...";
    btn.disabled = true;

    const formData = new FormData(this);
    
    // Captura os dados exatamente como estão no formulário (já em MAIÚSCULAS pelo blur)
    const dados = {
        valores: [
            new Date().toLocaleString('pt-BR'), // Data da Matrícula
            formData.get('Aluno_Nome'),
            formData.get('Aluno_Data_Nasc'),
            formData.get('Aluno_Genero'),
            "", // Espaço para CPF Aluno (se houver)
            formData.get('Aluno_WhatsApp'),
            "ATIVO",
            "", "", // Foto e Endereço
            formData.get('Aluno_Bairro'),
            "SÃO PAULO", // Cidade padrão
            "", // CEP
            formData.get('Responsavel_Nome') || "",
            formData.get('Responsavel_Condição') || "",
            formData.get('Responsavel_CPF') || ""
        ]
    };

    // 3. ENVIO PARA O GOOGLE SHEETS
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(dados)
    })
    .then(res => res.text())
    .then(txt => {
        alert("Sucesso! O aluno " + formData.get('Aluno_Nome') + " foi matriculado.");
        this.reset();
        secaoResponsavel.style.display = 'none'; // Esconde a seção após limpar
    })
    .catch(err => alert("Erro ao salvar: " + err))
    .finally(() => {
        btn.innerText = "FINALIZAR MATRÍCULA";
        btn.disabled = false;
    });
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
