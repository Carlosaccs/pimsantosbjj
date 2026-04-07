// ================================================================
// BLOCO 1: CONFIGURAÇÕES E PRESENÇA (CHAMADA RÁPIDA)
// ================================================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztJh9obvf4K0W4oHDzkGXoobOzYG8Dnts-lSqSYvx2cIyQDRtElddqGlMyF6wET7WY/exec';
let listaAlunosCache = []; 

window.addEventListener('load', () => {
    carregarListaAlunos();
    const campoDataPresenca = document.getElementById('data-presenca');
    if(campoDataPresenca) campoDataPresenca.valueAsDate = new Date();
});

function carregarListaAlunos() {
    fetch(SCRIPT_URL + "?action=getAlunos")
        .then(res => res.json())
        .then(data => {
            listaAlunosCache = data;
            renderizarTabelaPresenca();
        })
        .catch(err => console.error("Erro ao carregar alunos:", err));
}

function renderizarTabelaPresenca() {
    const filtroPeriodo = document.getElementById('filtro-periodo');
    const listaContainer = document.getElementById('corpo-tabela-presenca');
    const campoBusca = document.getElementById('busca-aluno');
    
    if (!listaContainer || !filtroPeriodo) return;
    
    const periodoSel = filtroPeriodo.value;
    const buscaNome = campoBusca ? campoBusca.value.toUpperCase() : "";
    
    listaContainer.innerHTML = "";

    const filtrados = listaAlunosCache.filter(aluno => {
        const matchesPeriodo = (periodoSel === "TODOS" || aluno.periodo === periodoSel);
        const matchesNome = aluno.nome.toUpperCase().includes(buscaNome);
        return matchesPeriodo && matchesNome;
    });

    filtrados.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #444";
        tr.innerHTML = `
            <td style="padding: 12px;"><strong>${aluno.nome}</strong></td>
            <td style="padding: 12px; font-size: 0.8rem; color: #aaa;">${aluno.periodo}</td>
            <td style="padding: 12px; text-align: center;">
                <button onclick="registrarPresenca('${aluno.nome}', event)" style="background: var(--primary); color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px;">CONFIRMAR</button>
            </td>
        `;
        listaContainer.appendChild(tr);
    });
}

function registrarPresenca(nomeAluno, event) {
    const dataTreino = document.getElementById('data-presenca').value;
    const btn = event.target;
    const textoOriginal = btn.innerText;

    btn.innerText = "OK!";
    btn.style.background = "#28a745";
    btn.disabled = true;

    const dadosPresenca = {
        action: "registrarPresenca", // Importante para o Google Script saber o que fazer
        valores: [
            new Date().toLocaleString('pt-BR'), 
            nomeAluno,                         
            dataTreino                         
        ]
    };

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(dadosPresenca)
    })
    .catch(err => {
        alert("Erro ao registrar presença: " + err);
        btn.innerText = textoOriginal;
        btn.style.background = "var(--primary)";
        btn.disabled = false;
    });
}

// ================================================================
// BLOCO 2: MÁSCARAS E PADRONIZAÇÃO (DENTRO DOS FORMULÁRIOS)
// ================================================================

document.addEventListener('input', (e) => {
    const target = e.target;
    
    // WhatsApp
    if (target.id === 'whats' || target.id === 'whatsapp') {
        let v = target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        else if (v.length > 0) v = v.replace(/^(\d{0,2})/, '($1');
        target.value = v;
    }

    // CPF
    if (target.id === 'cpf') {
        let v = target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
        else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, "$1.$2");
        target.value = v;
    }

    // CEP
    if (target.id === 'cep') {
        let v = target.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) v = v.replace(/(\d{5})(\d{3})/, "$1-$2");
        target.value = v;
    }
});
