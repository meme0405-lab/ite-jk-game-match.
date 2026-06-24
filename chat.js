/**
 * ============================================
 * JK Game Match - Sistema de Chat
 * ============================================
 * Gerencia mensagens, áudio e chamadas de vídeo
 */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let matchId = null;
let oponente = null;
let mensagens = [];
let isRecordingAudio = false;
let mediaRecorder = null;
let audioChunks = [];
let localStream = null;
let remoteStream = null;
let peerConnection = null;
let inCall = false;
let callTimer = 0;
let callTimerInterval = null;
let isMicrophoneOn = true;
let isCameraOn = true;
let incomingCallTimeout = null;
let solicitacoesRecebidas = [];
let solicitacoesPendentes = [];

// Configuração WebRTC
const rtcConfig = {
    iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
        { urls: ['stun:stun1.l.google.com:19302'] }
    ]
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Carregar match ID da URL
    const urlParams = new URLSearchParams(window.location.search);
    matchId = urlParams.get('match');

    if (!matchId) {
        alert('❌ Erro: ID do match não encontrado!');
        window.location.href = 'matches.html';
        return;
    }

    // Inicializar componentes
    inicializarChat();
    configurarEventos();
    carregarHistoricoMensagens();
});

// ============================================
// INICIALIZAÇÃO DO CHAT
// ============================================

function inicializarChat() {
    // Buscar dados do match
    const match = matchesSimulados.find(m => m.id == matchId);
    
    if (!match) {
        alert('❌ Match não encontrado!');
        window.location.href = 'matches.html';
        return;
    }

    // Buscar dados do oponente
    oponente = jogadoresSimulados.find(j => j.id == match.jogador_id);

    if (!oponente) {
        alert('❌ Jogador não encontrado!');
        return;
    }

    // Preencher informações do oponente
    document.getElementById('playerName').textContent = oponente.nome;
    document.getElementById('playerRank').textContent = `${oponente.rank} • Nível ${oponente.nivel}`;
    document.getElementById('playerAvatar').src = oponente.foto;
    document.getElementById('matchTitle').textContent = `Chat com ${oponente.nome}`;
    document.getElementById('playerNameCall').textContent = oponente.nome;

    console.log('✅ Chat inicializado com:', oponente.nome);

    // Simular solicitação de adição após 3 segundos
    setTimeout(() => {
        mostrarSolicitacaoAdicao(oponente);
    }, 3000);
}

// ============================================
// CONFIGURAR EVENTOS
// ============================================

function configurarEventos() {
    // Enviar mensagem com Enter
    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensagem();
        }
    });

    // Botão enviar
    document.getElementById('sendBtn').addEventListener('click', enviarMensagem);

    // Botão de áudio
    document.getElementById('audioBtn').addEventListener('click', toggleGravarAudio);

    // Botão de chamada
    document.getElementById('callBtn').addEventListener('click', iniciarChamada);

    // Controles de chamada
    document.getElementById('endCallBtn').addEventListener('click', encerrarChamada);
    document.getElementById('micBtn').addEventListener('click', toggleMicrofone);
    document.getElementById('cameraBtn').addEventListener('click', toggleCamera);

    // Botões de chamada recebida
    const answerCallBtn = document.getElementById('answerCallBtn');
    const rejectCallBtn = document.getElementById('rejectCallBtn');

    if (answerCallBtn) {
        answerCallBtn.addEventListener('click', aceitarChamadaRecebida);
    }

    if (rejectCallBtn) {
        rejectCallBtn.addEventListener('click', rejeitarChamadaRecebida);
    }

    // Botões de solicitação de adição
    const acceptFriendBtn = document.getElementById('acceptFriendBtn');
    const rejectFriendBtn = document.getElementById('rejectFriendBtn');

    if (acceptFriendBtn) {
        acceptFriendBtn.addEventListener('click', aceitarSolicitacaoAdicao);
    }

    if (rejectFriendBtn) {
        rejectFriendBtn.addEventListener('click', rejeitarSolicitacaoAdicao);
    }
}

// ============================================
// ENVIAR MENSAGENS DE TEXTO
// ============================================

function enviarMensagem() {
    const input = document.getElementById('messageInput');
    const texto = input.value.trim();

    if (!texto) return;

    // Criar objeto da mensagem
    const mensagem = {
        id: Date.now(),
        tipo: 'texto',
        remetente: usuarioAtual.id,
        conteudo: texto,
        timestamp: new Date(),
        lido: false
    };

    // Adicionar à lista
    mensagens.push(mensagem);

    // Exibir mensagem
    exibirMensagem(mensagem);

    // Limpar input
    input.value = '';
    input.focus();

    // Salvar no localStorage (simulado)
    salvarHistorico();

    console.log('💬 Mensagem enviada:', texto);
}

// ============================================
// GRAVAÇÃO DE ÁUDIO
// ============================================

function toggleGravarAudio() {
    const audioBtn = document.getElementById('audioBtn');
    
    if (!isRecordingAudio) {
        iniciarGravacaoAudio();
    } else {
        pararGravacaoAudio();
    }
}

async function iniciarGravacaoAudio() {
    try {
        // Solicitar permissão de acesso ao microfone com timeout
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao acessar microfone')), 5000)
        );
        
        const stream = await Promise.race([
            navigator.mediaDevices.getUserMedia({ audio: true }),
            timeoutPromise
        ]);
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        isRecordingAudio = true;

        // Visual de gravação
        const audioBtn = document.getElementById('audioBtn');
        audioBtn.classList.add('recording');
        audioBtn.innerHTML = '<i class="fas fa-stop"></i>';

        // Coletar chunks de áudio
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        // Quando terminar
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            enviarAudio(audioBlob);
        };

        mediaRecorder.start();
        console.log('🎙️ Gravação de áudio iniciada...');

    } catch (erro) {
        console.error('❌ Erro ao acessar microfone:', erro);
        
        // Fallback: simular gravação de áudio
        console.log('⚠️ Usando modo simulado para gravação de áudio');
        
        isRecordingAudio = true;
        const audioBtn = document.getElementById('audioBtn');
        audioBtn.classList.add('recording');
        audioBtn.innerHTML = '<i class="fas fa-stop"></i>';
        
        // Simular 3 segundos de gravação
        setTimeout(() => {
            pararGravacaoAudio();
        }, 3000);
    }
}

function pararGravacaoAudio() {
    try {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            if (mediaRecorder.stream && mediaRecorder.stream.getTracks) {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
        }
    } catch (err) {
        console.error('❌ Erro ao parar MediaRecorder:', err);
    } finally {
        // Garantir que o estado e UI sejam resetados mesmo se mediaRecorder não existir
        isRecordingAudio = false;
        mediaRecorder = null;
        audioChunks = [];

        const audioBtn = document.getElementById('audioBtn');
        if (audioBtn) {
            audioBtn.classList.remove('recording');
            audioBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        }

        console.log('✅ Gravação de áudio finalizada');
    }
}

async function enviarAudio(audioBlob) {
    // Criar URL do áudio
    const audioUrl = URL.createObjectURL(audioBlob);

    // Criar mensagem de áudio
    const mensagem = {
        id: Date.now(),
        tipo: 'audio',
        remetente: usuarioAtual.id,
        conteudo: audioUrl,
        duracaoSegundos: Math.round(audioBlob.size / 16000), // Estimado
        timestamp: new Date(),
        lido: false
    };

    // Adicionar à lista
    mensagens.push(mensagem);

    // Exibir mensagem
    exibirMensagem(mensagem);

    // Salvar histórico
    salvarHistorico();

    console.log('🎵 Áudio enviado com sucesso!');
}

// ============================================
// EXIBIR MENSAGENS
// ============================================

function exibirMensagem(mensagem) {
    const container = document.getElementById('messagesContainer');

    // Limpar mensagem vazia inicial
    if (container.querySelector('p')) {
        container.innerHTML = '';
    }

    // Criar elemento da mensagem
    const msgElement = document.createElement('div');
    msgElement.className = 'message ' + (mensagem.remetente === usuarioAtual.id ? 'own' : '');

    let conteudo = '';

    // Avatar
    if (mensagem.remetente !== usuarioAtual.id) {
        conteudo += `<div class="message-avatar">${oponente.nome.charAt(0).toUpperCase()}</div>`;
    }

    // Conteúdo
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (mensagem.tipo === 'texto') {
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = mensagem.conteudo;
        contentDiv.appendChild(textDiv);
    } else if (mensagem.tipo === 'audio') {
        const audioDiv = document.createElement('div');
        audioDiv.className = 'message-audio';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-music';
        icon.style.color = '#ff006e';
        
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = mensagem.conteudo;
        
        audioDiv.appendChild(icon);
        audioDiv.appendChild(audio);
        contentDiv.appendChild(audioDiv);
    }

    // Timestamp
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = formatarData(mensagem.timestamp);
    contentDiv.appendChild(timeDiv);

    msgElement.innerHTML = conteudo;
    msgElement.appendChild(contentDiv);

    // Adicionar ao container
    container.appendChild(msgElement);

    // Scroll automático para baixo
    container.scrollTop = container.scrollHeight;
}

// ============================================
// CARREGAMENTO DE HISTÓRICO
// ============================================

function carregarHistoricoMensagens() {
    // Recuperar do localStorage (simulado)
    const chaveHistorico = `chat_${matchId}`;
    const historicoJSON = localStorage.getItem(chaveHistorico);

    if (historicoJSON) {
        try {
            mensagens = JSON.parse(historicoJSON);
            
            // Exibir todas as mensagens
            mensagens.forEach(msg => {
                // Reconstruir URLs de áudio se necessário
                exibirMensagem(msg);
            });

            console.log(`✅ Histórico carregado: ${mensagens.length} mensagens`);
        } catch (erro) {
            console.error('❌ Erro ao carregar histórico:', erro);
        }
    }
}

// ============================================
// SALVAR HISTÓRICO
// ============================================

function salvarHistorico() {
    const chaveHistorico = `chat_${matchId}`;
    const historicoJSON = JSON.stringify(mensagens.map(m => ({
        id: m.id,
        tipo: m.tipo,
        remetente: m.remetente,
        conteudo: m.tipo === 'audio' ? `[Áudio - ${m.duracaoSegundos}s]` : m.conteudo,
        timestamp: m.timestamp,
        lido: m.lido
    })));

    localStorage.setItem(chaveHistorico, historicoJSON);
}

// ============================================
// CHAMADAS DE VÍDEO/ÁUDIO
// ============================================

async function iniciarChamada() {
    try {
        console.log('📞 Iniciando chamada...');
        mostrarNotificacao(`📞 Chamada iniciada com ${oponente.nome}`, 'info');

        // Solicitar acesso à câmera e microfone com timeout
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao acessar câmera/microfone')), 5000)
        );
        
        localStream = await Promise.race([
            navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: true
            }),
            timeoutPromise
        ]);

        // Mostrar notificação de câmera/áudio ligados
        mostrarNotificacao('✅ Câmera e áudio ligados', 'success');
        adicionarMensagemSistema(`📞 ${usuarioAtual.nome} iniciou uma chamada`);

        // Exibir vídeo local
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = localStream;

        // Criar peer connection
        peerConnection = new RTCPeerConnection({ iceServers: rtcConfig.iceServers });

        // Adicionar stream local
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Lidar com stream remoto
        peerConnection.ontrack = (event) => {
            console.log('🎥 Stream remoto recebido');
            const remoteVideo = document.getElementById('remoteVideo');
            remoteVideo.srcObject = event.streams[0];
            remoteStream = event.streams[0];
        };

        // Lidar com candidatos ICE
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('🧊 ICE Candidate:', event.candidate);
            }
        };

        // Criar oferta
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        console.log('📤 Oferta criada e enviada (simulado)');

        // Simular que o oponente está recebendo a chamada
        setTimeout(() => {
            mostrarChamadaRecebida();
        }, 1000);

        // Simular resposta do oponente
        setTimeout(async () => {
            try {
                const answer = new RTCSessionDescription({
                    type: 'answer',
                    sdp: 'v=0\r\no=- 0 0 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\nm=audio 0 UDP/TLS/RTP/SAVPF 111\r\nm=video 0 UDP/TLS/RTP/SAVPF 96'
                });

                await peerConnection.setRemoteDescription(answer);
                console.log('📥 Resposta recebida (simulada)');
                
            } catch (erro) {
                console.error('❌ Erro ao processar resposta:', erro);
            }
        }, 1000);

        // Abrir modal de chamada
        inCall = true;
        document.getElementById('callModal').classList.add('active');
        
        // Iniciar timer
        iniciarCallTimer();

        // Atualizar botão
        const callBtn = document.getElementById('callBtn');
        callBtn.classList.add('end-call');
        callBtn.innerHTML = '<i class="fas fa-phone"></i>';
        callBtn.onclick = encerrarChamada;

    } catch (erro) {
        console.error('❌ Erro ao iniciar chamada:', erro);
        
        // Fallback: simular chamada de vídeo/áudio
        console.log('⚠️ Modo simulado para chamada de vídeo/áudio');
        
        // Criar elementos simulados
        const localVideo = document.getElementById('localVideo');
        const remoteVideo = document.getElementById('remoteVideo');
        
        // Mostrar canvas simulado
        const localCanvas = document.createElement('canvas');
        localCanvas.width = 150;
        localCanvas.height = 120;
        const ctx = localCanvas.getContext('2d');
        ctx.fillStyle = '#1a1f3a';
        ctx.fillRect(0, 0, 150, 120);
        ctx.fillStyle = '#00d9ff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Você (Simulado)', 75, 60);
        localVideo.style.backgroundImage = `url(${localCanvas.toDataURL()})`;
        
        const remoteCanvas = document.createElement('canvas');
        remoteCanvas.width = 400;
        remoteCanvas.height = 300;
        const ctxRemote = remoteCanvas.getContext('2d');
        ctxRemote.fillStyle = '#1a1f3a';
        ctxRemote.fillRect(0, 0, 400, 300);
        ctxRemote.fillStyle = '#9d4edd';
        ctxRemote.font = '24px Arial';
        ctxRemote.textAlign = 'center';
        ctxRemote.fillText(`${oponente.nome} (Simulado)`, 200, 150);
        remoteVideo.style.backgroundImage = `url(${remoteCanvas.toDataURL()})`;

        // Abrir modal de chamada
        inCall = true;
        document.getElementById('callModal').classList.add('active');
        
        // Iniciar timer
        iniciarCallTimer();

        // Atualizar botão
        const callBtn = document.getElementById('callBtn');
        callBtn.classList.add('end-call');
        callBtn.innerHTML = '<i class="fas fa-phone"></i>';
        callBtn.onclick = encerrarChamada;
        
        console.log('✅ Chamada simulada iniciada!');
    }
}

async function encerrarChamada() {
    console.log('📞 Encerrando chamada...');

    inCall = false;
    
    // Parar streams
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    // Fechar peer connection
    if (peerConnection) {
        peerConnection.close();
    }

    // Fechar modal
    document.getElementById('callModal').classList.remove('active');

    // Limpar vídeos
    document.getElementById('localVideo').srcObject = null;
    document.getElementById('remoteVideo').srcObject = null;

    // Parar timer
    if (callTimerInterval) {
        clearInterval(callTimerInterval);
        callTimer = 0;
    }

    // Resetar botão
    const callBtn = document.getElementById('callBtn');
    callBtn.classList.remove('end-call');
    callBtn.innerHTML = '<i class="fas fa-phone"></i>';
    callBtn.onclick = iniciarChamada;

    // Adicionar mensagem ao chat
    const mensagem = {
        id: Date.now(),
        tipo: 'sistema',
        conteudo: `📞 Chamada encerrada. Duração: ${callTimer}s`,
        timestamp: new Date()
    };

    mensagens.push(mensagem);
    console.log('✅ Chamada encerrada');
}

function iniciarCallTimer() {
    callTimer = 0;
    callTimerInterval = setInterval(() => {
        callTimer++;
        const minutos = Math.floor(callTimer / 60);
        const segundos = callTimer % 60;
        const formatted = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        document.getElementById('callTimer').textContent = formatted;
    }, 1000);
}

// ============================================
// CONTROLES DE CHAMADA
// ============================================

async function toggleMicrofone() {
    if (!localStream) return;

    const audioTracks = localStream.getAudioTracks();
    const micBtn = document.getElementById('micBtn');

    audioTracks.forEach(track => {
        track.enabled = !track.enabled;
    });

    const isMuted = !audioTracks[0].enabled;
    isMicrophoneOn = !isMuted;
    micBtn.classList.toggle('muted', isMuted);
    
    // Notificação
    if (isMuted) {
        mostrarNotificacao('🔇 Seu microfone foi desligado', 'warning');
        console.log('🔇 Microfone mutado');
        // Adicionar mensagem de sistema no chat
        adicionarMensagemSistema(`${usuarioAtual.nome} desligou o microfone`);
    } else {
        mostrarNotificacao('🔊 Seu microfone está ligado', 'success');
        console.log('🔊 Microfone ativado');
        adicionarMensagemSistema(`${usuarioAtual.nome} ligou o microfone`);
    }
}

async function toggleCamera() {
    if (!localStream) return;

    const videoTracks = localStream.getVideoTracks();
    const cameraBtn = document.getElementById('cameraBtn');

    videoTracks.forEach(track => {
        track.enabled = !track.enabled;
    });

    const isDisabled = !videoTracks[0].enabled;
    isCameraOn = !isDisabled;
    cameraBtn.classList.toggle('disabled', isDisabled);
    
    // Notificação
    if (isDisabled) {
        mostrarNotificacao('📹 Sua câmera foi desligada', 'warning');
        console.log('📹 Câmera desligada');
        adicionarMensagemSistema(`${usuarioAtual.nome} desligou a câmera`);
    } else {
        mostrarNotificacao('📷 Sua câmera está ligada', 'success');
        console.log('📷 Câmera ligada');
        adicionarMensagemSistema(`${usuarioAtual.nome} ligou a câmera`);
    }
}

// ============================================
// UTILIDADES
// ============================================

function voltar() {
    // Confirmar se estiver em chamada
    if (inCall) {
        if (!confirm('⚠️ Você está em uma chamada. Tem certeza que deseja sair?')) {
            return;
        }
        encerrarChamada();
    }

    window.location.href = 'matches.html';
}

// ============================================
// SISTEMA DE NOTIFICAÇÕES
// ============================================

function mostrarNotificacao(mensagem, tipo = 'info') {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;

    let icon = '';
    switch(tipo) {
        case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
        case 'error': icon = '<i class="fas fa-exclamation-circle"></i>'; break;
        case 'warning': icon = '<i class="fas fa-bell"></i>'; break;
        case 'info': icon = '<i class="fas fa-info-circle"></i>'; break;
    }

    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">${mensagem}</div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(notification);

    // Remover automaticamente após 4 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('removing');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 4000);
}

function adicionarMensagemSistema(texto) {
    const container = document.getElementById('messagesContainer');
    if (!container) return;

    // Limpar mensagem vazia inicial
    if (container.querySelector('p')) {
        container.innerHTML = '';
    }

    const msgElement = document.createElement('div');
    msgElement.className = 'message';
    msgElement.innerHTML = `
        <div style="width: 100%; text-align: center; margin: 15px 0;">
            <div style="background: rgba(0, 217, 255, 0.1); color: #00d9ff; padding: 10px 15px; border-radius: 8px; font-size: 0.9em; display: inline-block;">
                ${texto}
            </div>
        </div>
    `;

    container.appendChild(msgElement);
    container.scrollTop = container.scrollHeight;
}

function mostrarChamadaRecebida() {
    const modal = document.getElementById('incomingCallModal');
    const avatar = document.getElementById('incomingCallAvatar');
    const nome = document.getElementById('incomingCallName');

    if (modal && oponente) {
        avatar.style.backgroundImage = `url('${oponente.foto}')`;
        nome.textContent = oponente.nome;
        modal.classList.add('active');

        // Timeout: rejeitar automaticamente após 30 segundos
        if (incomingCallTimeout) clearTimeout(incomingCallTimeout);
        incomingCallTimeout = setTimeout(() => {
            rejeitarChamadaRecebida();
        }, 30000);

        // Reproducir som de chamada (opcional)
        mostrarNotificacao(`📞 ${oponente.nome} está ligando...`, 'info');
    }
}

function rejeitarChamadaRecebida() {
    const modal = document.getElementById('incomingCallModal');
    if (modal) {
        modal.classList.remove('active');
    }
    if (incomingCallTimeout) clearTimeout(incomingCallTimeout);
    mostrarNotificacao('❌ Chamada rejeitada', 'error');
}

function aceitarChamadaRecebida() {
    const modal = document.getElementById('incomingCallModal');
    if (modal) {
        modal.classList.remove('active');
    }
    if (incomingCallTimeout) clearTimeout(incomingCallTimeout);
    mostrarNotificacao('✅ Chamada atendida', 'success');
    // Iniciar chamada no lado do receptor
    iniciarChamada();
}

// ============================================
// SOLICITAÇÕES DE ADIÇÃO
// ============================================

function mostrarSolicitacaoAdicao(jogador) {
    const modal = document.getElementById('addFriendModal');
    const avatar = document.getElementById('addFriendAvatar');
    const nome = document.getElementById('addFriendName');
    const rank = document.getElementById('addFriendRank');

    if (modal && jogador) {
        avatar.style.backgroundImage = `url('${jogador.foto}')`;
        nome.textContent = jogador.nome;
        rank.textContent = `${jogador.rank} • Nível ${jogador.nivel}`;
        
        // Armazenar dados do jogador para usar nos botões
        modal.dataset.jogadorId = jogador.id;
        modal.dataset.jogadorNome = jogador.nome;
        
        modal.classList.add('active');

        // Notificação
        mostrarNotificacao(`👾 ${jogador.nome} quer ser seu amigo!`, 'info');
        console.log(`👾 Solicitação de adição recebida de ${jogador.nome}`);
    }
}

function aceitarSolicitacaoAdicao() {
    const modal = document.getElementById('addFriendModal');
    const jogadorId = modal?.dataset.jogadorId;
    const jogadorNome = modal?.dataset.jogadorNome;

    if (modal && jogadorId && jogadorNome) {
        modal.classList.remove('active');
        
        // Adicionar à lista de amigos (simulado)
        solicitacoesPendentes = solicitacoesPendentes.filter(s => s.id != jogadorId);
        
        mostrarNotificacao(`✅ Você adicionou ${jogadorNome} como amigo!`, 'success');
        adicionarMensagemSistema(`✨ Agora você e ${jogadorNome} são amigos!`);
        console.log(`✅ Adição aceita: ${jogadorNome}`);
    }
}

function rejeitarSolicitacaoAdicao() {
    const modal = document.getElementById('addFriendModal');
    const jogadorNome = modal?.dataset.jogadorNome;

    if (modal && jogadorNome) {
        modal.classList.remove('active');
        
        mostrarNotificacao(`❌ Solicitação de adição de ${jogadorNome} rejeitada`, 'error');
        adicionarMensagemSistema(`Você rejeitou a solicitação de amizade de ${jogadorNome}`);
        console.log(`❌ Adição rejeitada: ${jogadorNome}`);
    }
}

// Função para formatar data (reutiliza a global)
function formatarData(data) {
    if (!data) return '--:--';
    
    const agora = new Date();
    const diff = Math.floor((agora - new Date(data)) / 1000);

    if (diff < 60) return 'Agora';
    if (diff < 3600) return `Há ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `Há ${Math.floor(diff / 3600)}h`;

    // Formato HH:MM
    const horas = new Date(data).getHours().toString().padStart(2, '0');
    const minutos = new Date(data).getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
}
