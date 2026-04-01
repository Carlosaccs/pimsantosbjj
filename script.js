// SUSTITUA PELO SEU URL DO GOOGLE APPS SCRIPT
const SCRIPT_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT_k13hmYHAsfLhVy7DDixDqqXY7qHCg0Yotq2-ZzIoSO0LxPIf9PJDrSC2PUZHWplAfn74tWCzMt3R/pub?output=csv';

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
    e.preventDefault();
    
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "ENVIANDO...";
    btn.disabled = true;

    // Captura os dados do formulário
    const formData = new FormData(this);
    
    // Montamos a lista na ordem exata das colunas da sua tabela CADASTRO
    const valores = [
        Date.now(), // ID (Gera um número único baseado no tempo)
        formData.get('Aluno_Nome'),
        formData.get('Aluno_Data_Nasc'),
        formData.get('Aluno_Genero'),
        '', // Aluno_CPF (vazio por enquanto)
        formData.get('Aluno_WhatsApp'),
        new Date().toLocaleDateString('pt-BR'), // Data_Matricula
        formData.get('Aluno_Status'),
        '', // Aluno_Foto
        '', // Aluno_Endereco
        formData.get('Aluno_Bairro'),
        'São Paulo', // Aluno_Cidade
        '', // Aluno_CEP
        formData.get('Responsavel_Nome') || '',
        formData.get('Responsavel_Condição') || '',
        formData.get('Responsavel_CPF') || '',
        '', // Resp WhatsApp
        '', // Resp Endereço
        '', // Resp Bairro
        '', // Resp Cidade
        ''  // Resp CEP
    ];

    try {
        // Envia para o motor do Google Sheets
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
        this.reset(); // Limpa o formulário
        document.getElementById('secao-responsavel').style.display = 'none';

    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Ops! Algo deu errado ao salvar na planilha.');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});
