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
