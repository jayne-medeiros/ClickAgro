/* painel.js - Com Função de Editar */
const API_URL = 'api.php'; 
let contentsCache = []; // Guarda os dados para facilitar a edição

// LOGIN DO MARCOS
document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;

    if(user === 'marcos' && pass === 'SUA_SENHA_AQUI') { // Configure sua senha aqui
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-dashboard').classList.remove('hidden');
        loadContents(); 
    } else {
        alert('Acesso negado! (Configure a senha no arquivo painel.js)');
    }
});

// ENVIAR OU EDITAR ARQUIVO
document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('content-id').value;
    const isEditing = id !== ""; // Se tem ID, é edição

    const btn = document.getElementById('btn-submit');
    btn.innerHTML = isEditing ? "Atualizando..." : "Enviando...";
    btn.disabled = true;

    const formData = new FormData();
    formData.append('action', isEditing ? 'edit' : 'add');
    if(isEditing) formData.append('id', id);
    
    formData.append('title', document.getElementById('content-title').value);
    formData.append('type', document.getElementById('content-type').value);
    formData.append('msg', document.getElementById('content-msg').value);
    
    // Só envia arquivo se o usuário selecionou um novo
    const fileInput = document.getElementById('content-file');
    if(fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if(result.status === 'success') {
            alert(isEditing ? 'Material atualizado!' : 'Arquivo enviado!');
            resetForm();
            loadContents();
        } else {
            alert('Erro: ' + (result.message || 'Desconhecido'));
        }
    } catch (error) {
        alert('Erro de conexão com o servidor.');
    }
    
    btn.innerHTML = '<i class="fas fa-save"></i> SALVAR ARQUIVO';
    btn.disabled = false;
});

// PREPARAR PARA EDITAR
function startEdit(id) {
    // Acha o item na memória
    const item = contentsCache.find(c => c.id == id);
    if(!item) return;

    // Preenche o formulário
    document.getElementById('content-id').value = item.id;
    document.getElementById('content-title').value = item.title;
    document.getElementById('content-type').value = item.type;
    document.getElementById('content-msg').value = item.msg;
    
    // Muda visual do formulário
    document.getElementById('form-title').innerText = "Editando Material";
    document.getElementById('btn-submit').innerHTML = '<i class="fas fa-sync"></i> ATUALIZAR';
    document.getElementById('btn-cancel').style.display = 'block';
    
    // Rola a tela pra cima
    document.querySelector('.hero-section').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('upload-form').reset();
    document.getElementById('content-id').value = "";
    document.getElementById('form-title').innerText = "Novo Material";
    document.getElementById('btn-submit').innerHTML = '<i class="fas fa-save"></i> SALVAR ARQUIVO';
    document.getElementById('btn-cancel').style.display = 'none';
}

async function loadContents() {
    try {
        const response = await fetch(API_URL + '?action=get');
        contentsCache = await response.json(); // Salva no cache global
        renderList(contentsCache);
    } catch (error) { console.log('Erro ao carregar lista'); }
}

async function deleteContent(id) {
    if(confirm('Apagar este material permanentemente?')) {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', id);
        await fetch(API_URL, { method: 'POST', body: formData });
        loadContents();
    }
}

function renderList(contents) {
    const list = document.getElementById('admin-content-list');
    list.innerHTML = '';
    const icons = { video: 'fa-video', audio: 'fa-microphone', pdf: 'fa-file-pdf', img: 'fa-image' };

    contents.forEach(item => {
        list.innerHTML += `
            <div class="glass-panel" style="padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; text-align: left;">
                <div style="flex-grow:1; margin-right:15px">
                    <h4 style="color: var(--agro-green)"><i class="fas ${icons[item.type]}"></i> ${item.title}</h4>
                    <small style="color:#ccc">Data: ${item.date}</small>
                </div>
                <div style="display:flex; gap:10px">
                    <button onclick="startEdit(${item.id})" style="background: var(--cursor-yellow); color: #000; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-weight:bold">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteContent(${item.id})" style="background: #ff5555; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
}