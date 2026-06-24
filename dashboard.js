/* ============================================
   Dashboard.js - Lógica do Dashboard
   ============================================ */

// Carregar dados do dashboard
function carregarDashboard() {
    const user = (window.usuarioAtual && typeof window.usuarioAtual === 'object') ? window.usuarioAtual : {};

    // Atualizar informações do usuário
    const displayName = user.nome || user.nickname || 'Jogador';
    document.getElementById('userName').textContent = displayName;

    const userNameMini = document.getElementById('userNameMini');
    const userNicknameMini = document.getElementById('userNicknameMini');
    if (userNameMini) {
        userNameMini.textContent = displayName;
    }
    if (userNicknameMini) {
        userNicknameMini.textContent = user.nickname ? `@${user.nickname}` : '';
    }
    
    // Definir avatar do usuário
    const avatarMini = document.getElementById('userAvatarMini');
    if (avatarMini) {
        const setImgSrc = src => {
            try { avatarMini.src = src; } catch(e) { avatarMini.setAttribute('src', src); }
        };

        if (user.foto) {
            if (avatarMini.tagName === 'IMG') {
                setImgSrc(user.foto);
            } else {
                avatarMini.style.backgroundImage = `url('${user.foto}')`;
                avatarMini.style.backgroundSize = 'cover';
                avatarMini.textContent = '';
            }
        } else if (avatarMini.tagName === 'IMG') {
            setImgSrc('images/avatar-default.svg');
        }

        // Fallback on error
        if (avatarMini.tagName === 'IMG') {
            avatarMini.onerror = function() { this.onerror = null; this.src = 'images/avatar-default.svg'; };
        }

        avatarMini.alt = displayName;
    }

    const players = (typeof jogadoresSimulados !== 'undefined' && Array.isArray(jogadoresSimulados)) ? jogadoresSimulados : [];
    const matches = (typeof matchesSimulados !== 'undefined' && Array.isArray(matchesSimulados)) ? matchesSimulados : [];
    const savedGames = (typeof window.usuarioAtual === 'object' && window.usuarioAtual && typeof window.usuarioAtual.jogos !== 'undefined') ? window.usuarioAtual.jogos : 0;

    // Atualizar estatísticas
    document.getElementById('playersOnline').textContent = players.filter(j => j.online).length;
    document.getElementById('myMatches').textContent = matches.length;
    document.getElementById('savedGames').textContent = savedGames;
    document.getElementById('badgeMatches').textContent = matches.filter(m => m.status === 'pendente').length;

    // Carregar jogos em destaque
    carregarJogosDestaque();

    // Carregar jogadores recentes
    carregarJogadoresRecentes();

    // Carregar matches recentes
    carregarMatchesRecentes();

    // Atualizar notificações
    atualizarNotificacoes();
}

// Carregar jogos em destaque
function carregarJogosDestaque() {
    const container = document.getElementById('featuredGames');
    if (!container) return;

    const games = (typeof jogosSimulados !== 'undefined' && Array.isArray(jogosSimulados)) ? jogosSimulados : [];

    container.innerHTML = games.slice(0, 6).map(jogo => `
        <div class="game-card" onclick="abrirDetalhesJogo(${jogo.id})">
            <div class="card-image">${jogo.icon}</div>
            <div class="card-content">
                <h3 class="card-title">${jogo.nome}</h3>
                <p class="card-subtitle">${jogo.genero}</p>
                <div class="card-meta">
                    <span class="meta-tag">${jogo.plataforma}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-card" onclick="event.stopPropagation(); adicionarJogoFavorito(${jogo.id})">
                        <i class="fas fa-star"></i> Favoritar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Carregar jogadores recentes
function carregarJogadoresRecentes() {
    const container = document.getElementById('recentPlayers');
    if (!container) return;

    const players = (typeof jogadoresSimulados !== 'undefined' && Array.isArray(jogadoresSimulados)) ? jogadoresSimulados : [];
    container.innerHTML = players.slice(0, 4).map(jogador => `
        <div class="player-card" onclick="abrirDetalhesJogador(${jogador.id})">
            <div class="player-avatar">${jogador.foto}</div>
            <div class="player-info">
                <h3 class="player-name">${jogador.nome}</h3>
                <p class="player-status">${jogador.online ? 'Online' : 'Offline'}</p>
                <div class="player-details">
                    <p><i class="fas fa-star"></i> ${jogador.rank}</p>
                    <p><i class="fas fa-desktop"></i> ${jogador.plataforma}</p>
                </div>
                <div class="player-actions">
                    <button class="btn-icon" onclick="event.stopPropagation(); criarMatch(${jogador.id})" title="Fazer Match">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="btn-icon" onclick="event.stopPropagation(); verPerfil(${jogador.id})" title="Ver Perfil">
                        <i class="fas fa-user"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Carregar matches recentes
function carregarMatchesRecentes() {
    const container = document.getElementById('recentMatches');
    if (!container) return;

    const matches = (typeof matchesSimulados !== 'undefined' && Array.isArray(matchesSimulados)) ? matchesSimulados : [];

    container.innerHTML = matches.slice(0, 3).map(match => {
        let statusClass = match.status;
        let statusText = match.status.charAt(0).toUpperCase() + match.status.slice(1);

        return `
            <div class="match-card" onclick="abrirDetalhesMatch(${match.id})">
                <div class="match-header">
                    <div class="match-avatar">👥</div>
                    <div class="match-info">
                        <h4>${match.jogador}</h4>
                        <p>${match.jogo}</p>
                    </div>
                </div>
                <div class="match-status ${statusClass}">${statusText}</div>
                <p style="font-size: 12px; color: var(--text-muted); margin-top: 10px;">
                    <i class="fas fa-calendar"></i> ${formatarData(match.data)}
                </p>
            </div>
        `;
    }).join('');
}

// Atualizar notificações
function atualizarNotificacoes() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;

    const notificacoes = [
        { texto: 'Maria fez um match com você em Valorant!', icone: '💝' },
        { texto: 'Você subiu para o nível 6!', icone: '⭐' },
        { texto: 'Carlos aceitou seu match', icone: '✅' },
    ];

    notificationList.innerHTML = notificacoes.map(notif => `
        <div class="notification-item">
            <span>${notif.icone}</span> ${notif.texto}
        </div>
    `).join('');
}

// Abrir detalhes do jogo
function abrirDetalhesJogo(jogoId) {
    const jogo = (typeof jogosSimulados !== 'undefined' && Array.isArray(jogosSimulados)) ? jogosSimulados.find(j => j.id === jogoId) : null;
    if (!jogo) return;

    const gameDetail = document.getElementById('gameDetail');
    if (!gameDetail) return;
        gameDetail.innerHTML = `
            <div class="game-detail">
                <div style="font-size: 60px; text-align: center; margin-bottom: 20px;">${jogo.icon}</div>
                <h2 style="text-align: center; margin-bottom: 10px;">${jogo.nome}</h2>
                <div style="text-align: center; margin-bottom: 20px;">
                    <span class="meta-tag">${jogo.genero}</span>
                    <span class="meta-tag" style="margin-left: 10px;">${jogo.plataforma}</span>
                </div>
                <p style="color: var(--text-muted); text-align: center; margin-bottom: 30px;">
                    Encontre jogadores que também jogam ${jogo.nome}
                </p>
                <button class="btn-neon" style="margin-bottom: 10px;" onclick="adicionarJogoFavorito(${jogo.id})">
                    <i class="fas fa-star"></i> Adicionar aos Favoritos
                </button>
                <button class="btn-neon" style="background: rgba(0, 217, 255, 0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue);">
                    <i class="fas fa-search"></i> Procurar Jogadores
                </button>
            </div>
        `;

    abrirModal('gameModal');
}

// Abrir detalhes do jogador
function abrirDetalhesJogador(jogadorId) {
    const jogador = (typeof jogadoresSimulados !== 'undefined' && Array.isArray(jogadoresSimulados)) ? jogadoresSimulados.find(j => j.id === jogadorId) : null;
    if (!jogador) return;

    const playerDetail = document.getElementById('playerDetail');
    if (!playerDetail) return;
        playerDetail.innerHTML = `
            <div class="player-detail">
                <div class="player-detail-avatar">${jogador.foto}</div>
                <h2 class="player-detail-name">${jogador.nome}</h2>
                <p class="player-detail-nickname">@${jogador.nickname}</p>

                <div class="player-detail-stats">
                    <div class="detail-stat">
                        <div class="detail-stat-label">Rank</div>
                        <div class="detail-stat-value">${jogador.rank}</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-label">Plataforma</div>
                        <div class="detail-stat-value">${jogador.plataforma}</div>
                    </div>
                </div>

                <div class="player-detail-games">
                    <h4>Jogos Favoritos</h4>
                    <div class="games-list-detail">
                        ${Array.isArray(jogador.jogos) ? jogador.jogos.map(jogo => `<span class="game-tag">${jogo}</span>`).join('') : ''}
                    </div>
                </div>

                <div class="player-detail-actions">
                    <button class="btn-match" onclick="criarMatch(${jogador.id})">
                        <i class="fas fa-heart"></i> Fazer Match
                    </button>
                    <button class="btn-pass">
                        <i class="fas fa-times"></i> Passar
                    </button>
                </div>
            </div>
        `;

    abrirModal('playerModal');
}

// Abrir detalhes do match
function abrirDetalhesMatch(matchId) {
    const match = (typeof matchesSimulados !== 'undefined' && Array.isArray(matchesSimulados)) ? matchesSimulados.find(m => m.id === matchId) : null;
    if (!match) return;

    const matchDetail = document.getElementById('matchDetail');
    if (!matchDetail) return;
        matchDetail.innerHTML = `
            <div class="match-detail">
                <h2 style="margin-bottom: 20px;">Detalhes do Match</h2>
                
                <div style="background: rgba(0, 217, 255, 0.1); border: 1px solid var(--accent-blue); border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                    <p style="margin-bottom: 10px;"><strong>Jogador:</strong> ${match.jogador}</p>
                    <p style="margin-bottom: 10px;"><strong>Jogo:</strong> ${match.jogo}</p>
                    <p style="margin-bottom: 10px;"><strong>Status:</strong> 
                        <span class="match-status ${match.status}">${match.status.charAt(0).toUpperCase() + match.status.slice(1)}</span>
                    </p>
                    <p><strong>Data:</strong> ${formatarData(match.data)}</p>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button class="btn-neon" style="flex: 1;">
                        <i class="fas fa-message"></i> Enviar Mensagem
                    </button>
                    <button class="btn-neon" style="flex: 1; background: rgba(0, 255, 136, 0.2); color: var(--success); border: 1px solid var(--success);">
                        <i class="fas fa-check"></i> Aceitar
                    </button>
                </div>
            </div>
        `;

    abrirModal('matchModal');
}

// Criar novo match
function criarMatch(jogadorId) {
    const jogador = (typeof jogadoresSimulados !== 'undefined' && Array.isArray(jogadoresSimulados)) ? jogadoresSimulados.find(j => j.id === jogadorId) : null;
    if (jogador) {
        mostrarMensagem(`Match criado com ${jogador.nome}!`, 'success');
        fecharModal('playerModal');
    }
}

// Adicionar jogo favorito
function adicionarJogoFavorito(jogoId) {
    const jogo = (typeof jogosSimulados !== 'undefined' && Array.isArray(jogosSimulados)) ? jogosSimulados.find(j => j.id === jogoId) : null;
    if (jogo) {
        mostrarMensagem(`${jogo.nome} foi adicionado aos favoritos!`, 'success');
        fecharModal('gameModal');
    }
}

// Ver perfil do jogador
function verPerfil(jogadorId) {
    window.location.href = `perfil.html?jogador=${jogadorId}`;
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('featuredGames')) return;

    try {
        carregarDashboard();
    } catch (error) {
        console.error('Erro ao carregar o dashboard:', error);
    }
});
