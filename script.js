// ================================================================
// BLOCO 1: CONFIGURAÇÕES GERAIS E VARIÁVEIS GLOBAIS
// ================================================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztJh9obvf4K0W4oHDzkGXoobOzYG8Dnts-lSqSYvx2cIyQDRtElddqGlMyF6wET7WY/exec';
let listaAlunosCache = []; // Guarda os alunos vindos da planilha

// Ao carregar a página, já busca os alunos e define a data de hoje no check-in
window.onload = () => {
    carregarListaAlunos();
    const campoData = document.getElementById('data-presenca');
    if(campoData) campoData.valueAsDate = new Date();
};

// ================================================================
// BLOCO 2: CADASTRO DE ALUNOS E VALIDAÇÃO DE MAIORIDADE
// ================================================================
function verificarMaioridade() {
    const campoData = document.getElementById('dataNasc');
    const secaoResp = document.getElementById('secao-responsavel');
    
    if (!campoData || !campoData.value) {
        secaoResp.style.display = 'none';
        return;
    }

    const dataNasc = new Date(campoData.value);
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const m = hoje.getMonth() - dataNasc.getMonth();
    
    if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) {
        idade--;
    }

    if (idade < 18) {
        secaoResp.style.display = 'block';
    } else {
        secaoResp.style.display = 'none';
        // Opcional: limparCamposResponsavel(); 
    }
}

// Garante que comece escondido ao carregar
window.onload = verificarMaioridade;

document.getElementById('form-novo-aluno').addEventListener('submit', function(e) {
    e.preventDefault();

    const secaoResponsavel = document.getElementById('secao-responsavel');
    const nomeResp = document.getElementById('Responsavel_Nome');
    const cpfResp = document.getElementById('Responsavel_CPF');

    // Validação para menores
    if (secaoResponsavel.style.display !== 'none') {
        if (!nomeResp.value.trim() || !cpfResp.value.trim()) {
            alert("⚠️ ATENÇÃO: Para menores de idade, o Nome e CPF do Responsável são obrigatórios!");
            nomeResp.focus();
            return;
        }
    }

    const btn = document.getElementById('btn-submit');
    btn.innerText = "ENVIANDO...";
    btn.disabled = true;

    const formData = new FormData(this);
    const dados = {
        valores: [
            new Date().toLocaleString('pt-BR'), // A: Data Matrícula
            formData.get('Aluno_Nome'),         // B: Nome
            formData.get('Aluno_Data_Nasc'),    // C: Nasc
            formData.get('Aluno_Genero'),       // D: Gênero
            "",                                 // E: CPF Aluno
            formData.get('Aluno_WhatsApp'),     // F: WhatsApp
            formData.get('Aluno_Status'),       // G: Status
            "", "",                             // H, I: Foto/Endereço
            formData.get('Aluno_Bairro'),       // J: Bairro
            "SÃO PAULO",                        // K: Cidade
            "",                                 // L: CEP
            formData.get('Responsavel_Nome') || "", // M: Nome Resp
            formData.get('Responsavel_Condição') || "", // N: Condição
            formData.get('Responsavel_CPF') || "",  // O: CPF Resp
            formData.get('Aluno_Periodo') || "NÃO INFORMADO" // P: Período (Novo!)
        ]
    };

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(dados)
    })
    .then(() => {
        alert("Sucesso! O aluno " + formData.get('Aluno_Nome') + " foi matriculado.");
        this.reset();
        secaoResponsavel.style.display = 'none';
        carregarListaAlunos(); // Atualiza a lista interna
    })
    .catch(err => alert("Erro ao salvar: " + err))
    .finally(() => {
        btn.innerText = "FINALIZAR MATRÍCULA";
        btn.disabled = false;
    });
});

// ================================================================
// BLOCO 3: CHECK-IN TATAME (BUSCA E TABELA POR PERÍODO)
// ================================================================

function carregarListaAlunos() {
    // Chamada GET para a planilha
    fetch(SCRIPT_URL + "?action=getAlunos")
        .then(res => res.json())
        .then(data => {
            listaAlunosCache = data;
            renderizarTabelaPresenca();
        })
        .catch(err => console.error("Erro ao carregar alunos:", err));
}

function renderizarTabelaPresenca() {
    const periodoSel = document.getElementById('filtro-periodo').value;
    const listaContainer = document.getElementById('corpo-tabela-presenca');
    const buscaNome = document.getElementById('busca-aluno').value.toUpperCase();
    
    if (!listaContainer) return;
    listaContainer.innerHTML = "";

    // Filtra por período E por nome (busca simultânea)
    const filtrados = listaAlunosCache.filter(aluno => {
        const matchesPeriodo = (periodoSel === "TODOS" || aluno.periodo === periodoSel);
        const matchesNome = aluno.nome.includes(buscaNome);
        return matchesPeriodo && matchesNome;
    });

    filtrados.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #444";
        tr.innerHTML = `
            <td style="padding: 12px;"><strong>${aluno.nome}</strong></td>
            <td style="padding: 12px; font-size: 0.8rem; color: #aaa;">${aluno.periodo}</td>
            <td style="padding: 12px; text-align: center;">
                <button onclick="registrarPresenca('${aluno.nome}')" style="background: var(--primary); color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px;">CONFIRMAR</button>
            </td>
        `;
        listaContainer.appendChild(tr);
    });
}

function registrarPresenca(nomeAluno) {
    const dataTreino = document.getElementById('data-presenca').value;
    const btn = event.target;
    btn.innerText = "OK!";
    btn.style.background = "#28a745";
    btn.disabled = true;

    const dadosPresenca = {
        valores: [
            new Date().toLocaleString('pt-BR'), // Data/Hora Registro
            nomeAluno,                         // Nome do Aluno
            dataTreino                         // Data do Treino selecionada
        ]
    };

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(dadosPresenca)
    })
    .then(() => console.log("Presença registrada para: " + nomeAluno))
    .catch(err => alert("Erro ao registrar presença: " + err));
}

// ================================================================
// BLOCO 4: MÁSCARAS E PADRONIZAÇÃO VISUAL
// ================================================================

// Transformar em Maiúsculas
document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('blur', function() {
        this.value = this.value.toUpperCase();
    });
});

// Máscara WhatsApp
const campoWhatsApp = document.querySelector('input[name="Aluno_WhatsApp"]');
if (campoWhatsApp) {
    campoWhatsApp.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        else if (v.length > 0) v = v.replace(/^(\d{0,2})/, '($1');
        e.target.value = v;
    });
}

// Máscara CPF
const campoCPF = document.querySelector('input[name="Responsavel_CPF"]');
if (campoCPF) {
    campoCPF.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        e.target.value = v;
    });
}
