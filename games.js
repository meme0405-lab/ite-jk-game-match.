/* ============================================
   Games.js - Lógica da página de Jogos Favoritos (com API)
   ============================================ */

let jogosFavoritos = [];
let todosOsJogos = [];
let jogosFiltrados = [];
let paginaAtualGames = 1;
const itensPorPaginaGames = 12;

// Buscar todos os jogos do BD
async function carregarTodosJogos() {
    try {
        const res = await fetch('api/jogos.php');
        const json = await res.json();
        if (json.status === 'ok' && Array.isArray(json.dados)) {
            todosOsJogos = json.dados.map(j => ({
                id: Number(j.id),
                nome: j.nome,
                genero: j.genero,
                plataforma: j.plataforma,
                descricao: j.descricao,
                icon: j.icon || '🎮'
            }));
            jogosFiltrados = [...todosOsJogos];
        }
    } catch (err) {
        console.error('Erro ao buscar jogos:', err);
    }
}

// Buscar favoritos do usuário do BD
async function carregarFavoritos() {
    try {
        const res = await fetch('api/favoritos.php');
        if (!res.ok) {
            if (res.status === 401) {
                mostrarMensagem('Faça login para ver seus favoritos.', 'warning');
                mostrarLoginAlert();
            }
            jogosFavoritos = [];
            return;
        }
        const json = await res.json();
        if (json.status === 'ok' && Array.isArray(json.dados)) {
            jogosFavoritos = json.dados.map(j => ({
                id: Number(j.id),
                nome: j.nome,
                genero: j.genero,
                plataforma: j.plataforma,
                descricao: j.descricao,
                icon: '🎮'
            }));
        }
    } catch (err) {
        console.error('Erro ao buscar favoritos:', err);
        mostrarMensagem('Erro ao buscar favoritos.', 'error');
    }
}

function usuarioEstaLogado() {
    return typeof window.usuarioAtual === 'object' && !!window.usuarioAtual?.id;
}

function mostrarMensagem(mensagem, tipo = 'info') {
    let container = document.getElementById('notificationsContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationsContainer';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.textContent = mensagem;
    notification.style.padding = '10px 14px';
    notification.style.borderRadius = '10px';
    notification.style.color = '#fff';
    notification.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    notification.style.transition = 'opacity 200ms ease, transform 200ms ease';
    notification.style.cursor = 'pointer';

    if (tipo === 'success') {
        notification.style.background = '#16a34a';
    } else if (tipo === 'error') {
        notification.style.background = '#dc2626';
    } else if (tipo === 'warning') {
        notification.style.background = '#f59e0b';
    } else {
        notification.style.background = '#2563eb';
    }

    container.appendChild(notification);
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    });

    const timeoutId = setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => notification.remove(), 200);
    }, 3000);

    notification.addEventListener('click', () => {
        clearTimeout(timeoutId);
        notification.remove();
    });
}

function mostrarLoginAlert() {
    const alertEl = document.getElementById('favoritesAlert');
    if (!alertEl) return;
    alertEl.style.display = 'block';
}

function esconderLoginAlert() {
    const alertEl = document.getElementById('favoritesAlert');
    if (!alertEl) return;
    alertEl.style.display = 'none';
}

// Carregar jogos
function carregarJogos(tab = 'meus', pagina = 1) {
    let jogosParaExibir = tab === 'meus' ? jogosFavoritos : jogosFiltrados;

    const inicio = (pagina - 1) * itensPorPaginaGames;
    const fim = inicio + itensPorPaginaGames;
    const jogosPagina = jogosParaExibir.slice(inicio, fim);

    const container = tab === 'meus' 
        ? document.getElementById('myGames') 
        : document.getElementById('availableGames');

    if (!container) return;

    if (tab === 'meus') {
        document.getElementById('countMeus').textContent = jogosFavoritos.length;
    }

    if (jogosPagina.length === 0) {
        container.innerHTML = '';
        if (tab === 'meus') {
            document.getElementById('emptyMyGames').style.display = 'flex';
        }
        return;
    }

    if (tab === 'meus') {
        document.getElementById('emptyMyGames').style.display = 'none';
    }

    container.innerHTML = jogosPagina.map(jogo => `
        <div class="game-item" onclick="abrirDetalhesJogo(${jogo.id})">
            <div style="flex: 1; display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 36px; min-width: 50px; text-align: center;">${jogo.icon}</div>
                <div>
                    <h4>${jogo.nome}</h4>
                    <p>${jogo.genero} • ${jogo.plataforma}</p>
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                ${tab === 'meus' ? `
                    <button class="btn-icon" onclick="event.stopPropagation(); removerJogoFavorito(${jogo.id})" title="Remover">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : `
                    <button class="btn-icon" onclick="event.stopPropagation(); adicionarJogoFavorito(${jogo.id})" title="Adicionar">
                        <i class="fas fa-star"></i>
                    </button>
                `}
                <button class="btn-icon" onclick="event.stopPropagation(); buscarJogadoresJogo(${jogo.id})" title="Encontrar Jogadores">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        </div>
    `).join('');

    atualizarPaginacaoGames(tab, pagina);
    paginaAtualGames = pagina;
}

// Atualizar paginação de jogos
function atualizarPaginacaoGames(tab, paginaAtual) {
    const container = document.getElementById('pagination');
    if (!container) return;

    let totalPaginas = 0;
    if (tab === 'meus') {
        totalPaginas = Math.ceil(jogosFavoritos.length / itensPorPaginaGames);
    } else {
        totalPaginas = Math.ceil(jogosFiltrados.length / itensPorPaginaGames);
    }

    let html = '';

    // Botão anterior
    if (paginaAtual > 1) {
        html += `<button onclick="carregarJogos('${tab}', ${paginaAtual - 1})"><i class="fas fa-chevron-left"></i></button>`;
    }

    // Números das páginas
    for (let i = 1; i <= totalPaginas; i++) {
        html += `<button ${i === paginaAtual ? 'class="active"' : ''} onclick="carregarJogos('${tab}', ${i})">${i}</button>`;
    }

    // Botão próximo
    if (paginaAtual < totalPaginas) {
        html += `<button onclick="carregarJogos('${tab}', ${paginaAtual + 1})"><i class="fas fa-chevron-right"></i></button>`;
    }

    container.innerHTML = html;
}

// Aplicar filtros de jogos
function aplicarFiltrosJogos() {
    const filterGenero = document.getElementById('filterGenero').value;
    const filterPlataforma = document.getElementById('filterPlataforma').value;
    const searchTerm = document.getElementById('searchGames').value.toLowerCase();

    jogosFiltrados = todosOsJogos.filter(jogo => {
        const matchGenero = !filterGenero || jogo.genero === filterGenero;
        const matchPlataforma = !filterPlataforma || jogo.plataforma.includes(filterPlataforma);
        const matchSearch = !searchTerm || jogo.nome.toLowerCase().includes(searchTerm);

        return matchGenero && matchPlataforma && matchSearch;
    });

    carregarJogos('disponíveis', 1);
}

// Limpar filtros de jogos
function limparFiltrosJogos() {
    document.getElementById('filterGenero').value = '';
    document.getElementById('filterPlataforma').value = '';
    document.getElementById('searchGames').value = '';
    jogosFiltrados = [...todosOsJogos];
    carregarJogos('disponíveis', 1);
}

// Abrir detalhes do jogo
function abrirDetalhesJogo(jogoId) {
    const jogo = [...jogosFavoritos, ...todosOsJogos].find(j => j.id === jogoId);
    if (!jogo) return;

    const gameDetail = document.getElementById('gameDetail');
    if (gameDetail) {
        const estaNoseFavoritos = jogosFavoritos.some(j => j.id === jogo.id);

        gameDetail.innerHTML = `
            <div class="game-detail">
                <div style="font-size: 80px; text-align: center; margin-bottom: 20px;">${jogo.icon}</div>
                <h2 style="text-align: center; margin-bottom: 10px; font-size: 28px;">${jogo.nome}</h2>
                <div style="text-align: center; margin-bottom: 20px;">
                    <span class="meta-tag">${jogo.genero}</span>
                    <span class="meta-tag" style="margin-left: 10px;">${jogo.plataforma}</span>
                </div>
                <p style="color: var(--text-muted); text-align: center; margin-bottom: 30px; font-size: 14px;">
                    Encontre jogadores que também jogam ${jogo.nome}
                </p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button class="btn-neon" onclick="event.stopPropagation(); ${estaNoseFavoritos ? `removerJogoFavorito(${jogo.id})` : `adicionarJogoFavorito(${jogo.id})`}">
                        <i class="fas fa-star"></i> ${estaNoseFavoritos ? 'Remover' : 'Adicionar'}
                    </button>
                    <button class="btn-neon" style="background: rgba(0, 217, 255, 0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue);" onclick="buscarJogadoresJogo(${jogo.id})">
                        <i class="fas fa-search"></i> Jogadores
                    </button>
                </div>
            </div>
        `;
    }

    abrirModal('gameModal');
}

// Adicionar jogo favorito (via API)
async function adicionarJogoFavorito(jogoId) {
    const jogo = [...jogosFavoritos, ...todosOsJogos].find(j => j.id === jogoId);
    if (!jogo) return;

    if (!usuarioEstaLogado()) {
        mostrarMensagem('Faça login para adicionar favoritos.', 'warning');
        mostrarLoginAlert();
        return;
    }

    if (jogosFavoritos.some(j => j.id === jogoId)) {
        mostrarMensagem(`${jogo.nome} já está nos favoritos!`, 'warning');
        return;
    }

    try {
        const res = await fetch('api/add-favorito.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jogo_id: jogoId })
        });

        if (!res.ok) {
            if (res.status === 401) {
                mostrarMensagem('Faça login para adicionar favoritos.', 'warning');
                mostrarLoginAlert();
                return;
            }
            mostrarMensagem('Erro ao adicionar favorito.', 'error');
            return;
        }
        const json = await res.json();
        if (json.status === 'ok') {
            jogosFavoritos.push(jogo);
            mostrarMensagem(`${jogo.nome} foi adicionado aos favoritos!`, 'success');
            fecharModal('gameModal');
            carregarJogos('meus', 1);
            esconderLoginAlert();
        } else {
            mostrarMensagem(json.mensagem || 'Erro ao adicionar favorito', 'error');
        }
    } catch (err) {
        console.error('Erro:', err);
        mostrarMensagem('Erro ao adicionar favorito', 'error');
    }
}

// Remover jogo favorito (via API)
async function removerJogoFavorito(jogoId) {
    const jogo = jogosFavoritos.find(j => j.id === jogoId);
    if (!jogo) return;

    if (!usuarioEstaLogado()) {
        mostrarMensagem('Faça login para remover favoritos.', 'warning');
        mostrarLoginAlert();
        return;
    }

    try {
        const res = await fetch('api/remove-favorito.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jogo_id: jogoId })
        });

        if (!res.ok) {
            if (res.status === 401) {
                mostrarMensagem('Faça login para remover favoritos.', 'warning');
                mostrarLoginAlert();
                return;
            }
            mostrarMensagem('Erro ao remover favorito.', 'error');
            return;
        }
        const json = await res.json();
        if (json.status === 'ok') {
            jogosFavoritos = jogosFavoritos.filter(j => j.id !== jogoId);
            mostrarMensagem(`${jogo.nome} foi removido dos favoritos`, 'success');
            fecharModal('gameModal');
            carregarJogos('meus', 1);
        } else {
            mostrarMensagem(json.mensagem || 'Erro ao remover favorito', 'error');
        }
    } catch (err) {
        console.error('Erro:', err);
        mostrarMensagem('Erro ao remover favorito', 'error');
    }
}

// Buscar jogadores que jogam este jogo
function buscarJogadoresJogo(jogoId) {
    const jogo = [...jogosFavoritos, ...todosOsJogos].find(j => j.id === jogoId);
    if (jogo) {
        mostrarMensagem(`Buscando jogadores de ${jogo.nome}...`, 'success');
        fecharModal('gameModal');
        window.location.href = `jogadores.html?jogo=${encodeURIComponent(jogo.nome)}`;
    }
}

// Setup de tabs para jogos
function setupGamesTabs() {
    document.querySelectorAll('.games-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');

            // Remove active de todos os botões
            document.querySelectorAll('.games-tabs .tab-btn').forEach(b => {
                b.classList.remove('active');
            });

            // Remove active de todos os conteúdos
            document.querySelectorAll('.games-content .tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Adiciona active
            btn.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.add('active');

            // Carregar jogos do novo tab
            carregarJogos(tabName, 1);
        });
    });

    // Trigger trigger
    const triggerBtns = document.querySelectorAll('.tab-trigger');
    triggerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = btn.getAttribute('data-tab');
            document.querySelector(`[data-tab="${tab}"]`).click();
        });
    });
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('myGames')) {
        // Carregar dados do BD primeiro
        await Promise.all([carregarTodosJogos(), carregarFavoritos()]);

        setupGamesTabs();
        carregarJogos('meus', 1);

        // Event listeners dos filtros
        if (document.getElementById('filterGenero')) {
            document.getElementById('filterGenero').addEventListener('change', aplicarFiltrosJogos);
        }
        if (document.getElementById('filterPlataforma')) {
            document.getElementById('filterPlataforma').addEventListener('change', aplicarFiltrosJogos);
        }
        if (document.getElementById('searchGames')) {
            document.getElementById('searchGames').addEventListener('input', aplicarFiltrosJogos);
        }
        if (document.getElementById('clearFilters')) {
            document.getElementById('clearFilters').addEventListener('click', limparFiltrosJogos);
        }

        // Marcar o primeiro tab como ativo
        const firstTab = document.querySelector('.games-tabs .tab-btn');
        if (firstTab) firstTab.classList.add('active');

        if (!usuarioEstaLogado()) {
            mostrarLoginAlert();
        }

        // Configurar modal de jogo
        const modal = document.getElementById('gameModal');
        const closeBtn = modal?.querySelector('.close-modal');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => fecharModal('gameModal'));
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    fecharModal('gameModal');
                }
            });
        }
    }
});
