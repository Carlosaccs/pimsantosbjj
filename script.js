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
    // Se menor de 18 anos, mostra os campos do responsável
    if (idade < 18) {
        secaoResp.style.display = 'block';
        document.getElementById('Responsavel_Nome').required = true;
    } else {
        secaoResp.style.display = 'none';
        document.getElementById('Responsavel_Nome').required = false;
    }
}

// Lógica para enviar o formulário (Integração futura com Apps Script)
document.getElementById('form-novo-aluno').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Matrícula enviada com sucesso! (Pronto para conectar ao Google Sheets)');
    // Aqui chamaremos a função de enviar para o seu Apps Script
});
