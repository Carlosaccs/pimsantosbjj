// ================================================================
// BLOCO 1: CONFIGURAÇÕES GERAIS E VARIÁVEIS GLOBAIS
// ================================================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztJh9obvf4K0W4oHDzkGXoobOzYG8Dnts-lSqSYvx2cIyQDRtElddqGlMyF6wET7WY/exec';
let listaAlunosCache = []; 

// Usando addEventListener para não sobrescrever outros carregamentos
window.addEventListener('load', () => {
    carregarListaAlunos();
    const campoDataPresenca = document.getElementById('data-presenca');
    if(campoDataPresenca) campoDataPresenca.valueAsDate = new Date();
});

// ================================================================
// BLOCO 2: ENVIO DO FORMULÁRIO (PARA CASOS DE USO DIRETO)
// ================================================================
const formNovoAluno = document.getElementById('form-novo-aluno');
if (formNovoAluno) {
    formNovoAluno.addEventListener('submit', function(e) {
        e.preventDefault();

        const btn = document.getElementById('btn-submit');
        btn.innerText = "ENVIANDO...";
        btn.disabled = true;

        const formData = new FormData(this);
        const dados = {
            valores: [
                new Date().toLocaleString('pt-BR'), 
                formData.get('Aluno_Nome'),          
                formData.get('Aluno_Data_Nasc'),    
                formData.get('Aluno_Genero'),       
                "",                                 
                formData.get('Aluno_WhatsApp'),     
                formData.get('Aluno_Status'),       
                "", "",                             
                formData.get('Aluno_Bairro'),       
                "SÃO PAULO",                        
                "",                                 
                formData.get('Responsavel_Nome') || "", 
                formData.get('Responsavel_Condição') || "", 
                formData.get('Responsavel_CPF') || "",  
                formData.get('Aluno_Periodo') || "NÃO INFORMADO" 
            ]
        };

        fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        })
        .then(() => {
            alert("Sucesso! O aluno foi matriculado.");
            this.reset();
            // A lógica de esconder a seção agora é controlada pelo RegistroAlunos.html
            carregarListaAlunos(); 
        })
        .catch(err => alert("Erro ao salvar: " + err))
        .finally(() => {
            btn.innerText = "FINALIZAR MATRÍCULA";
            btn.disabled = false;
        });
    });
}

// ================================================================
// BLOCO 3: CHECK-IN TATAME (BUSCA E TABELA POR PERÍODO)
// ================================================================

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
    const textoOriginal = btn.innerText;

    btn.innerText = "OK!";
    btn.style.background = "#28a745";
    btn.disabled = true;

    const dadosPresenca = {
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
    .then(() => console.log("Presença registrada para: " + nomeAluno))
    .catch(err => {
        alert("Erro ao registrar presença: " + err);
        btn.innerText = textoOriginal;
        btn.style.background = "var(--primary)";
        btn.disabled = false;
    });
}

// ================================================================
// BLOCO 4: MÁSCARAS E PADRONIZAÇÃO VISUAL
// ================================================================

// Transformar em Maiúsculas nos inputs de texto
document.addEventListener('blur', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'text') {
        e.target.value = e.target.value.toUpperCase();
    }
}, true);

// Máscaras aplicadas por delegação (melhor para elementos dinâmicos)
document.addEventListener('input', (e) => {
    const target = e.target;
    
    // WhatsApp (Identifica pelo placeholder ou ID se o Name falhar)
    if (target.id === 'whatsapp' || target.id === 'respWhats') {
        let v = target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        else if (v.length > 0) v = v.replace(/^(\d{0,2})/, '($1');
        target.value = v;
    }

    // CPF
    if (target.id === 'cpf' || target.id === 'respCpf') {
        let v = target.value.replace(/\D/g, '').slice(0, 11);
        v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        target.value = v;
    }
});
