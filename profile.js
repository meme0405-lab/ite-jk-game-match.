/* ============================================
   Profile.js - Lógica da página de Perfil
   ============================================ */

// Carregar dados do perfil
function carregarPerfil() {
    const displayName = usuarioAtual.nome || usuarioAtual.nickname || 'Usuário';
    document.getElementById('profileName').textContent = displayName;
    document.getElementById('profileNickname').textContent = usuarioAtual.nickname ? `@${usuarioAtual.nickname}` : '';
    document.getElementById('profileRank').textContent = usuarioAtual.rank || '';
    document.getElementById('profilePlatform').textContent = usuarioAtual.plataforma || '';
    
    // Definir avatar com imagem
    const avatarImg = document.getElementById('profileAvatar');
    if (avatarImg && usuarioAtual.foto) {
        if (avatarImg.tagName === 'IMG') {
            avatarImg.src = usuarioAtual.foto;
            avatarImg.alt = usuarioAtual.nome;
        } else {
            avatarImg.style.backgroundImage = `url('${usuarioAtual.foto}')`;
            avatarImg.style.backgroundSize = 'cover';
            avatarImg.style.backgroundPosition = 'center';
            avatarImg.textContent = '';
        }
    }

    // Stats
    document.getElementById('statMatches').textContent = usuarioAtual.matches || 0;
    document.getElementById('statGames').textContent = usuarioAtual.jogos || 0;
    document.getElementById('statLevel').textContent = usuarioAtual.nivel || 1;

    // About
    document.getElementById('profileBio').textContent = usuarioAtual.bio || 'Nenhuma bio adicionada';
    document.getElementById('profileEmail').textContent = usuarioAtual.email || '';
    document.getElementById('profileSince').textContent = usuarioAtual.data_criacao ? formatarData(usuarioAtual.data_criacao) : '--/--/----';

    // Carregar jogos favoritos
    carregarJogosFavoritos();
}

// Carregar jogos favoritos do perfil
function carregarJogosFavoritos() {
    const container = document.getElementById('favoriteGames');
    if (!container) return;

    const jogosFavoritos = jogosSimulados.slice(0, 4);

    if (jogosFavoritos.length === 0) {
        document.getElementById('favoriteGames').style.display = 'none';
        document.getElementById('emptyGames').style.display = 'flex';
        return;
    }

    container.innerHTML = jogosFavoritos.map(jogo => `
        <div class="game-card" onclick="abrirDetalhesJogo(${jogo.id})">
            <div class="card-image" style="background-image: url('${jogo.imagem || ''}'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; min-height: 160px;">
                ${!jogo.imagem ? jogo.icon : ''}
            </div>
            <div class="card-content">
                <h3 class="card-title">${jogo.nome}</h3>
                <p class="card-subtitle">${jogo.genero}</p>
                <div class="card-actions">
                    <button class="btn-card" onclick="event.stopPropagation(); removerJogoFavorito(${jogo.id})">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Abrir modal de editar perfil
function abrirEditarPerfil() {
    document.getElementById('editName').value = usuarioAtual.nome;
    document.getElementById('editNickname').value = usuarioAtual.nickname;
    document.getElementById('editRank').value = usuarioAtual.rank;
    document.getElementById('editPlataforma').value = usuarioAtual.plataforma;
    document.getElementById('editBio').value = usuarioAtual.bio;

    abrirModal('editProfileModal');
}

// Salvar alterações do perfil
document.addEventListener('DOMContentLoaded', () => {
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            usuarioAtual.nome = document.getElementById('editName').value;
            usuarioAtual.nickname = document.getElementById('editNickname').value;
            usuarioAtual.rank = document.getElementById('editRank').value;
            usuarioAtual.plataforma = document.getElementById('editPlataforma').value;
            usuarioAtual.bio = document.getElementById('editBio').value;

            mostrarMensagem('Perfil atualizado com sucesso!', 'success');
            fecharModal('editProfileModal');
            carregarPerfil();
        });
    }
});

// Upload de avatar
document.addEventListener('DOMContentLoaded', () => {
    const uploadAvatar = document.getElementById('uploadAvatar');
    if (uploadAvatar) {
        uploadAvatar.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('profileAvatar').style.backgroundImage = `url(${event.target.result})`;
                    document.getElementById('profileAvatar').style.backgroundSize = 'cover';
                    document.getElementById('profileAvatar').style.backgroundPosition = 'center';
                    document.getElementById('profileAvatar').textContent = '';
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Setup de tabs do perfil
function setupProfileTabs() {
    document.querySelectorAll('.profile-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');

            // Remove active de todos os botões
            document.querySelectorAll('.profile-tabs .tab-btn').forEach(b => {
                b.classList.remove('active');
            });

            // Remove active de todos os conteúdos
            document.querySelectorAll('.profile-tab-content .tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Adiciona active
            btn.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.add('active');
        });
    });
}

// Deletar jogo favorito
function removerJogoFavorito(jogoId) {
    const jogo = jogosSimulados.find(j => j.id === jogoId);
    if (jogo) {
        mostrarMensagem(`${jogo.nome} foi removido dos favoritos`, 'success');
        carregarJogosFavoritos();
    }
}

// Abrir detalhes do jogo
function abrirDetalhesJogo(jogoId) {
    const jogo = jogosSimulados.find(j => j.id === jogoId);
    if (!jogo) return;

    const gameDetail = document.getElementById('gameDetail');
    if (gameDetail) {
        gameDetail.innerHTML = `
            <div class="game-detail">
                <div style="font-size: 60px; text-align: center; margin-bottom: 20px;">${jogo.icon}</div>
                <h2 style="text-align: center; margin-bottom: 10px;">${jogo.nome}</h2>
                <div style="text-align: center; margin-bottom: 20px;">
                    <span class="meta-tag">${jogo.genero}</span>
                    <span class="meta-tag" style="margin-left: 10px;">${jogo.plataforma}</span>
                </div>
            </div>
        `;
    }

    abrirModal('gameModal');
}

// Configurações
document.addEventListener('DOMContentLoaded', () => {
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (confirm('Você tem certeza que deseja deletar sua conta? Esta ação é irreversível!')) {
                mostrarMensagem('Conta deletada com sucesso', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }

    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', abrirEditarPerfil);
    }
});

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('profileName')) {
        carregarPerfil();
        setupProfileTabs();

        // Marcar o primeiro tab como ativo
        document.querySelector('.profile-tabs .tab-btn').classList.add('active');
    }
});
