/* script.js - Versão Final: Avatar Dinâmico + Painel Integrado */

// --- 1. BANCO DE DADOS LOCAL (LocalStorage) ---
function saveToLocal(key, data) {
    let existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.unshift(data);
    localStorage.setItem(key, JSON.stringify(existing));
    updateDashboardStats();
}

function getFromLocal(key) {
    return JSON.parse(localStorage.getItem(key) || "[]");
}

function deleteFromLocal(key, index) {
    let existing = getFromLocal(key);
    existing.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(existing));

    if (key === 'clickagro_reports') loadReportsView();
    if (key === 'clickagro_innovations') loadInnovationsView();
    if (key === 'clickagro_visits') loadVisitsView();
    updateDashboardStats();
}

// --- 2. CONTEÚDO DAS FASES ---
const popContent = {
    fase1: {
        title: "1. Diagnóstico Inteligente",
        body: `
            <p>Selecione as dificuldades identificadas na propriedade:</p>
            <form id="diag-form" onsubmit="runDiagnosis(event)">
                <div class="checkbox-group">
                    <label class="custom-check"><input type="checkbox" value="pragas"> 🐛 Pragas/Doenças</label>
                    <label class="custom-check"><input type="checkbox" value="seca"> ☀️ Seca/Água</label>
                    <label class="custom-check"><input type="checkbox" value="solo"> 🌱 Solo Fraco</label>
                    <label class="custom-check"><input type="checkbox" value="venda"> 💰 Comercialização</label>
                </div>
                <button type="submit" class="btn-primary">GERAR PLANO DE AÇÃO</button>
            </form>
            <div id="recommendation-box">
                <h4><i class="fas fa-robot"></i> Recomendação ClickAgro:</h4>
                <ul id="rec-list" style="margin-top:10px"></ul>
            </div>
        `
    },
    fase2: {
        title: "2. Central de Conteúdos (Envio Rápido)",
        body: `
            <p>Envie materiais técnicos via WhatsApp com um clique:</p>
            <div id="dynamic-content-list" style="margin-top: 20px; min-height: 100px;">
                <p style="text-align:center; color:#888;"><i class="fas fa-spinner fa-spin"></i> Buscando materiais do gestor...</p>
            </div>
        `
    },
    fase3: {
        title: "3. Diário de Bordo (Offline)",
        body: `
            <p>Registre suas visitas mesmo sem internet.</p>
            <form id="report-form" onsubmit="saveReport(event)">
                <input type="date" id="rep-date" required>
                <input type="number" id="rep-qtd" placeholder="Nº Produtores Alcançados" required>
                <select id="rep-tema">
                    <option value="" disabled selected>Tema Abordado</option>
                    <option value="Manejo">Manejo de Solo</option>
                    <option value="Gestao">Gestão Financeira</option>
                    <option value="Pragas">Controle de Pragas</option>
                </select>
                <textarea id="rep-obs" rows="3" placeholder="Dúvidas ou Observações..."></textarea>
                <button type="submit" class="btn-primary"><i class="fas fa-save"></i> SALVAR NO DIÁRIO</button>
            </form>
            <h4 style="margin-top:30px; border-bottom:1px solid #555; padding-bottom:10px">Registros Pendentes:</h4>
            <div id="saved-reports-list" style="margin-top:15px"></div>
        `
    },
    agenda: {
        title: "Agenda de Visitas Técnicas",
        body: `
            <p>Organize o roteiro de visitas conforme o POP.</p>
            <form onsubmit="addVisit(event)">
                <input type="text" id="visit-name" placeholder="Nome do Produtor / Propriedade" required>
                <input type="date" id="visit-date" required>
                <button type="submit" class="btn-primary">AGENDAR VISITA</button>
            </form>
            <div id="visit-list" style="margin-top:20px"></div>
        `
    },
    materiais: {
        title: "Banco de Microinovações",
        body: `
            <p>Registre soluções criativas desenvolvidas pelos produtores.</p>
            <form onsubmit="saveInnovation(event)">
                <input type="text" id="inova-titulo" placeholder="Título da Inovação" required>
                <textarea id="inova-desc" rows="4" placeholder="Descrição e resultados..." required></textarea>
                <button type="submit" class="btn-primary"><i class="fas fa-lightbulb"></i> REGISTRAR INOVAÇÃO</button>
            </form>
            <div id="innovations-list" style="margin-top:20px"></div>
        `
    },
    avaliacao: {
        title: "4.4 Avaliação Mensal",
        body: `
            <p>Avalie se os conteúdos estão sendo compreendidos.</p>
            <form onsubmit="alert('Avaliação enviada! Obrigado.'); return false;">
                <label style="display:block; margin-bottom:10px">O formato funcionou este mês?</label>
                <select>
                    <option>Sim, muito bem</option>
                    <option>Parcialmente</option>
                    <option>Não, precisam de ajustes</option>
                </select>
                <textarea rows="3" placeholder="Sugestões de ajustes..."></textarea>
                <button type="submit" class="btn-primary">ENVIAR RELATÓRIO</button>
            </form>
        `
    }
};

// --- 3. LÓGICAS DO DASHBOARD ---

function runDiagnosis(e) {
    e.preventDefault();
    const checks = document.querySelectorAll('#diag-form input:checked');
    const list = document.getElementById('rec-list');
    const box = document.getElementById('recommendation-box');
    list.innerHTML = "";
    if (checks.length === 0) { alert("Selecione uma dificuldade."); return; }

    checks.forEach(check => {
        let text = "";
        if (check.value === 'pragas') text = "<li><i class='fas fa-bug'></i> <b>Enviar:</b> Cartilha Defensivos</li>";
        if (check.value === 'seca') text = "<li><i class='fas fa-tint'></i> <b>Enviar:</b> Vídeo Palma Forrageira</li>";
        if (check.value === 'solo') text = "<li><i class='fas fa-seedling'></i> <b>Agendar:</b> Visita técnica (solo)</li>";
        if (check.value === 'venda') text = "<li><i class='fas fa-hand-holding-usd'></i> <b>Orientar:</b> PNAE/PAA</li>";
        list.innerHTML += text;
    });
    box.style.display = "block";
    box.scrollIntoView({ behavior: 'smooth' });
}

function shareZap(msg) {
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

function saveReport(e) {
    e.preventDefault();
    const data = {
        date: document.getElementById('rep-date').value,
        qtd: document.getElementById('rep-qtd').value,
        tema: document.getElementById('rep-tema').value,
        obs: document.getElementById('rep-obs').value,
        timestamp: new Date().toLocaleString()
    };
    saveToLocal('clickagro_reports', data);
    document.getElementById('report-form').reset();
    loadReportsView();
    alert("Salvo!");
}

function loadReportsView() {
    const list = document.getElementById('saved-reports-list');
    if (!list) return;
    const reports = getFromLocal('clickagro_reports');
    list.innerHTML = reports.length ? "" : "<p style='color:#888'>Nenhum registro.</p>";
    reports.forEach((rep, index) => {
        list.innerHTML += `
            <div class="saved-item">
                <button class="delete-btn" onclick="deleteFromLocal('clickagro_reports', ${index})"><i class="fas fa-trash"></i></button>
                <h4>${rep.date} - ${rep.tema}</h4>
                <p>Alcance: ${rep.qtd} | "${rep.obs}"</p>
            </div>`;
    });
}

function saveInnovation(e) {
    e.preventDefault();
    const data = {
        titulo: document.getElementById('inova-titulo').value,
        desc: document.getElementById('inova-desc').value
    };
    saveToLocal('clickagro_innovations', data);
    document.getElementById('inova-titulo').value = "";
    document.getElementById('inova-desc').value = "";
    loadInnovationsView();
    alert("Inovação registrada!");
}

function loadInnovationsView() {
    const list = document.getElementById('innovations-list');
    if (!list) return;
    const inovas = getFromLocal('clickagro_innovations');
    list.innerHTML = "";
    inovas.forEach((item, index) => {
        list.innerHTML += `
            <div class="saved-item" style="border-left-color: #25D366">
                 <button class="delete-btn" onclick="deleteFromLocal('clickagro_innovations', ${index})"><i class="fas fa-trash"></i></button>
                <h4>${item.titulo}</h4><p>${item.desc}</p>
            </div>`;
    });
}

function addVisit(e) {
    e.preventDefault();
    const data = { name: document.getElementById('visit-name').value, date: document.getElementById('visit-date').value };
    saveToLocal('clickagro_visits', data);
    document.getElementById('visit-name').value = "";
    loadVisitsView();
}

function loadVisitsView() {
    const list = document.getElementById('visit-list');
    if (!list) return;
    const visits = getFromLocal('clickagro_visits');
    visits.sort((a, b) => new Date(a.date) - new Date(b.date));
    list.innerHTML = "";
    visits.forEach((v, index) => {
        const d = new Date(v.date); d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        list.innerHTML += `
            <div class="saved-item" style="display:flex; justify-content:space-between; align-items:center;">
                <span>${d.getDate()}/${d.getMonth() + 1} - ${v.name}</span>
                <button class="delete-btn" style="position:static" onclick="deleteFromLocal('clickagro_visits', ${index})"><i class="fas fa-check"></i></button>
            </div>`;
    });
}

function updateDashboardStats() {
    const reports = getFromLocal('clickagro_reports');
    const innovations = getFromLocal('clickagro_innovations');
    let totalProd = 0;
    reports.forEach(r => totalProd += parseInt(r.qtd || 0));

    const barP = document.getElementById('bar-produtores');
    const txtP = document.getElementById('meta-produtores');
    if (barP) { barP.style.width = `${Math.min((totalProd / 50) * 100, 100)}%`; txtP.innerText = `${totalProd}/50`; }

    const barI = document.getElementById('bar-inovacoes');
    const txtI = document.getElementById('meta-inovacoes');
    if (barI) { barI.style.width = `${Math.min((innovations.length / 10) * 100, 100)}%`; txtI.innerText = `${innovations.length}/10`; }
}

// --- 4. CARREGAMENTO DO PAINEL DO GESTOR ---
async function loadTechnicianContents() {
    const container = document.getElementById('dynamic-content-list');
    if (!container) return;

    try {
        const response = await fetch('api.php?action=get');
        const contents = await response.json();

        if (contents.length === 0) {
            container.innerHTML = "<p style='color:#ccc; text-align:center'>Nenhum material novo.</p>";
            return;
        }

        container.innerHTML = "";
        const icons = { video: 'fa-video', audio: 'fa-microphone', pdf: 'fa-file-pdf', img: 'fa-image' };

        contents.forEach(item => {
            // Se tiver arquivo, usa o link do arquivo. Se não, usa o link externo (fallback)
            const linkArquivo = item.file_path ? item.file_path : item.url;
            const zapLink = `https://wa.me/?text=${encodeURIComponent(item.msg + ' ' + window.location.origin + '/' + linkArquivo)}`;

            container.innerHTML += `
                <div class="card" style="text-align:left; padding:15px; margin-bottom:10px">
                    <div style="display:flex; justify-content:space-between;">
                        <h4><i class="fas ${icons[item.type]}"></i> ${item.title}</h4>
                        <small style="color:#888">${item.date}</small>
                    </div>
                    <p style="font-size:0.9rem; color:#ccc; margin: 5px 0;">${item.msg.substring(0, 50)}...</p>
                    <a href="${zapLink}" target="_blank" class="btn-whatsapp" style="width:100%; justify-content:center; text-decoration:none">
                        <i class="fab fa-whatsapp"></i> Enviar no Zap
                    </a>
                    <a href="${linkArquivo}" target="_blank" download style="display:block; text-align:center; margin-top:10px; color:var(--agro-green); font-size:0.8rem; text-decoration:none">
                        <i class="fas fa-download"></i> Baixar / Visualizar
                    </a>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = "<p style='color:#ccc; text-align:center'>Conecte-se para ver novos materiais.</p>";
    }
}

// --- 5. LOGIN E NAVEGAÇÃO ---
document.addEventListener('DOMContentLoaded', function () {
    updateDashboardStats();

    const loginForm = document.getElementById('login-form');
    const usuariosAutorizados = {
        "admin": "SENHA_ADMIN",
        "tec01": "SENHA_TEC01", "tec02": "SENHA_TEC02", "tec03": "SENHA_TEC03",
        "tec04": "SENHA_TEC04", "tec05": "SENHA_TEC05", "tec06": "SENHA_TEC06",
        "tec07": "SENHA_TEC07", "tec08": "SENHA_TEC08", "tec09": "SENHA_TEC09",
        "tec10": "SENHA_TEC10", "jayne.dev": "SENHA_DEV"
    };
    // [IMPORTANTE] Edite as senhas acima para utilizar o sistema. No GitHub, elas ficam como placeholders por segurança.

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const idDigitado = document.getElementById('user-id').value.trim();
            const senhaDigitada = document.getElementById('user-pass').value.trim();

            if (usuariosAutorizados[idDigitado] && usuariosAutorizados[idDigitado] === senhaDigitada) {
                localStorage.setItem('usuarioLogado', idDigitado);

                // MUDANÇA DE AVATAR AQUI
                const iniciais = idDigitado.substring(0, 2).toUpperCase();
                document.querySelector('.avatar-circle').innerText = iniciais;
                document.querySelector('.user-profile span').innerText = `Téc: ${idDigitado}`;

                const loginScreen = document.getElementById('login-screen');
                const dashboard = document.getElementById('dashboard');
                loginScreen.style.opacity = '0';
                setTimeout(() => {
                    loginScreen.style.display = 'none';
                    dashboard.classList.remove('hidden');
                    dashboard.style.opacity = '0';
                    dashboard.style.display = 'block';
                    setTimeout(() => dashboard.style.opacity = '1', 50);
                }, 500);
            } else {
                alert('ID ou Senha incorretos!');
            }
        });
    }
});

function openSection(key) {
    const display = document.getElementById('content-display');
    const title = document.getElementById('panel-title');
    const bodyPanel = document.getElementById('panel-body');
    if (popContent[key]) {
        const content = popContent[key];
        title.innerText = content.title;
        bodyPanel.innerHTML = content.body;
        display.classList.remove('hidden-panel');
        display.style.display = "block";
        setTimeout(() => display.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

        if (key === 'fase2') loadTechnicianContents();
        if (key === 'fase3') loadReportsView();
        if (key === 'materiais') loadInnovationsView();
        if (key === 'agenda') loadVisitsView();
    }
}

function closePanel() {
    const display = document.getElementById('content-display');
    display.classList.add('hidden-panel');
    setTimeout(() => display.style.display = "none", 300);
}