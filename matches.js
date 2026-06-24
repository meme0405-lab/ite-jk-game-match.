/* ============================================
   Matches.js - Lógica da página de Matches
   ============================================ */

// Mostrar notificação de toast
function mostrarNotificacao(mensagem, tipo = 'info') {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensagem;

    container.appendChild(notification);

    const timeoutId = setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);

    notification.addEventListener('click', () => {
        clearTimeout(timeoutId);
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// Atalho para mostrarMensagem (compatibilidade)
function mostrarMensagem(mensagem, tipo = 'info') {
    mostrarNotificacao(mensagem, tipo);
}

// Funções de Modal
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Carregar matches por status
function carregarMatches(status) {
    const matchesFiltrados = matchesSimulados.filter(m => m.status === status);
    const container = document.getElementById(`matches${status.charAt(0).toUpperCase() + status.slice(1)}`);
    const emptyState = document.getElementById(`empty${status.charAt(0).toUpperCase() + status.slice(1)}`);

    if (!container) return;

    if (matchesFiltrados.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    container.style.display = 'flex';
    emptyState.style.display = 'none';

    container.innerHTML = matchesFiltrados.map(match => {
        // Procurar jogador e jogo pelos IDs
        const jogador = jogadoresSimulados.find(j => j.id === match.jogador_id);
        const jogo = jogosSimulados.find(g => g.id === match.jogo_id);
        
        const nomeJogador = jogador ? jogador.nome : 'Desconhecido';
        const nomeJogo = jogo ? jogo.nome : 'Desconhecido';

        let statusClass = match.status;
        let statusIcon = '⏳';
        let statusText = 'Pendente';

        if (match.status === 'aceito') {
            statusIcon = '✅';
            statusText = 'Aceito';
        } else if (match.status === 'recusado') {
            statusIcon = '❌';
            statusText = 'Recusado';
        } else if (match.status === 'finalizado') {
            statusIcon = '🏁';
            statusText = 'Finalizado';
        }

        return `
            <div class="match-item" onclick="abrirDetalhesMatch(${match.id})">
                <div class="match-item-left">
                    <div class="match-avatar">${statusIcon}</div>
                    <div>
                        <h4>${nomeJogador}</h4>
                        <p><i class="fas fa-gamepad"></i> ${nomeJogo}</p>
                        <p style="font-size: 11px; color: var(--text-muted);">
                            <i class="fas fa-calendar"></i> ${formatarData(match.data_criacao)}
                        </p>
                    </div>
                </div>
                <div class="match-item-right">
                    ${match.status === 'pendente' ? `
                        <button class="btn-accept" onclick="event.stopPropagation(); aceitarMatch(${match.id})" title="Aceitar Match">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-reject" onclick="event.stopPropagation(); recusarMatch(${match.id})" title="Recusar Match">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : match.status === 'aceito' ? `
                        <button class="btn-icon" onclick="event.stopPropagation(); abrirChat(${match.id})" title="Chat">
                            <i class="fas fa-comments"></i>
                        </button>
                    ` : `
                        <button class="btn-icon" onclick="event.stopPropagation(); enviarMensagem(${match.id})" title="Mensagem">
                            <i class="fas fa-message"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Abrir detalhes do match
function abrirDetalhesMatch(matchId) {
    const match = matchesSimulados.find(m => m.id === matchId);
    if (!match) return;

    const jogador = jogadoresSimulados.find(j => j.id === match.jogador_id);
    const jogo = jogosSimulados.find(g => g.id === match.jogo_id);
    
    const nomeJogador = jogador ? jogador.nome : 'Desconhecido';
    const nomeJogo = jogo ? jogo.nome : 'Desconhecido';

    const matchDetail = document.getElementById('matchDetail');
    if (matchDetail) {
        matchDetail.innerHTML = `
            <div class="match-detail">
                <h2 style="margin-bottom: 20px;">Detalhes do Match</h2>
                
                <div style="background: rgba(0, 217, 255, 0.1); border: 1px solid var(--accent-blue); border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                    <p style="margin-bottom: 10px;"><strong>Jogador:</strong> ${nomeJogador}</p>
                    <p style="margin-bottom: 10px;"><strong>Jogo:</strong> ${nomeJogo}</p>
                    <p style="margin-bottom: 10px;"><strong>Status:</strong> 
                        <span class="match-status ${match.status}">${match.status.charAt(0).toUpperCase() + match.status.slice(1)}</span>
                    </p>
                    <p><strong>Data:</strong> ${formatarData(match.data_criacao)}</p>
                </div>

                <div style="display: flex; gap: 10px;">
                    ${match.status === 'aceito' ? `
                        <button class="btn-neon" style="flex: 1; background: rgba(0, 217, 255, 0.2); color: var(--accent-blue); border: 1px solid var(--accent-blue);" onclick="abrirChat(${match.id})">
                            <i class="fas fa-comments"></i> Abrir Chat
                        </button>
                    ` : match.status === 'pendente' ? `
                        <button class="btn-neon" style="flex: 1; background: rgba(0, 255, 136, 0.2); color: var(--success); border: 1px solid var(--success);" onclick="aceitarMatch(${match.id})">
                            <i class="fas fa-check"></i> Aceitar
                        </button>
                        <button class="btn-neon" style="flex: 1; background: rgba(255, 0, 85, 0.2); color: var(--danger); border: 1px solid var(--danger);" onclick="recusarMatch(${match.id})">
                            <i class="fas fa-times"></i> Recusar
                        </button>
                    ` : `
                        <button class="btn-neon" style="flex: 1;" onclick="enviarMensagem(${match.id})">
                            <i class="fas fa-message"></i> Enviar Mensagem
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    abrirModal('matchModal');
}

// Aceitar match
function aceitarMatch(matchId) {
    const match = matchesSimulados.find(m => m.id === matchId);
    if (match) {
        const jogador = jogadoresSimulados.find(j => j.id === match.jogador_id);
        const jogo = jogosSimulados.find(g => g.id === match.jogo_id);
        
        const nomeJogador = jogador ? jogador.nome : 'Jogador';
        const nomeJogo = jogo ? jogo.nome : 'Jogo';
        
        match.status = 'aceito';
        
        // Mostrar notificações
        mostrarNotificacao(`✅ Match com ${nomeJogador} foi aceito!`, 'success');
        
        // Fechar modal se aberto
        fecharModal('matchModal');
        
        // Recarregar
        setTimeout(() => {
            recarregarMatches();
        }, 500);
        
        console.log(`✅ Match aceito: ${nomeJogador} - ${nomeJogo}`);
    }
}

// Recusar match
function recusarMatch(matchId) {
    const match = matchesSimulados.find(m => m.id === matchId);
    if (match) {
        const jogador = jogadoresSimulados.find(j => j.id === match.jogador_id);
        const nomeJogador = jogador ? jogador.nome : 'Jogador';
        
        match.status = 'recusado';
        
        // Mostrar notificações
        mostrarNotificacao(`❌ Match com ${nomeJogador} foi recusado`, 'error');
        
        // Fechar modal se aberto
        fecharModal('matchModal');
        
        // Recarregar
        setTimeout(() => {
            recarregarMatches();
        }, 500);
        
        console.log(`❌ Match recusado: ${nomeJogador}`);
    }
}

// Enviar mensagem ou abrir chat
function enviarMensagem(matchId) {
    const match = matchesSimulados.find(m => m.id === matchId);
    if (match && match.status === 'aceito') {
        abrirChat(matchId);
    } else {
        mostrarNotificacao('🎮 Para enviar mensagens, aceite o match primeiro!', 'warning');
    }
}

// Abrir chat com o jogador
function abrirChat(matchId) {
    const match = matchesSimulados.find(m => m.id === matchId);
    if (match) {
        window.location.href = `chat.html?match=${matchId}`;
    }
}

// Recarregar todos os matches
function recarregarMatches() {
    carregarMatches('pendente');
    carregarMatches('aceito');
    carregarMatches('finalizado');
    carregarMatches('recusado');
}

// Sistema de tabs para matches
function setupMatchesTabs() {
    document.querySelectorAll('.matches-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');

            // Remove active de todos os botões
            document.querySelectorAll('.matches-tabs .tab-btn').forEach(b => {
                b.classList.remove('active');
            });

            // Remove active de todos os conteúdos
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Adiciona active
            btn.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.add('active');

            // Carregar matches do novo status
            carregarMatches(tabName);
        });
    });
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('matchesPendente')) {
        setupMatchesTabs();
        recarregarMatches();

        // Marcar o primeiro tab como ativo
        document.querySelector('.matches-tabs .tab-btn').classList.add('active');

        // Configurar eventos do modal
        const modal = document.getElementById('matchModal');
        const closeBtn = modal?.querySelector('.close-modal');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                fecharModal('matchModal');
            });
        }

        // Fechar modal ao clicar fora
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    fecharModal('matchModal');
                }
            });
        }
    }
});
