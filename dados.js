/* ============================================
   dados.js - Dados Simulados Globais
   ============================================ */

// Usuário Atual: será injetado por `session_user.js.php` quando houver sessão.
if (typeof window.usuarioAtual === 'undefined') {
    window.usuarioAtual = {};
}

// Jogos Simulados
const jogosSimulados = [
    {
        id: 1,
        nome: 'Counter-Strike 2',
        genero: 'FPS',
        plataforma: 'PC',
        icon: '🔫',
        imagem: 'https://via.placeholder.com/200x120?text=CS2',
        descricao: 'Jogo de tiro em primeira pessoa competitivo'
    },
    {
        id: 2,
        nome: 'League of Legends',
        genero: 'MOBA',
        plataforma: 'PC',
        icon: '⚔️',
        imagem: 'https://via.placeholder.com/200x120?text=LOL',
        descricao: 'Jogo de arena de batalha multiplayer online'
    },
    {
        id: 3,
        nome: 'Valorant',
        genero: 'FPS',
        plataforma: 'PC',
        icon: '💣',
        imagem: 'https://via.placeholder.com/200x120?text=Valorant',
        descricao: 'Jogo tático de tiro em primeira pessoa'
    },
    {
        id: 4,
        nome: 'Dota 2',
        genero: 'MOBA',
        plataforma: 'PC',
        icon: '🛡️',
        imagem: 'https://via.placeholder.com/200x120?text=Dota2',
        descricao: 'Jogo de arena de batalha estratégico'
    },
    {
        id: 5,
        nome: 'Minecraft',
        genero: 'Sandbox',
        plataforma: 'Multi-Plataforma',
        icon: '🧱',
        imagem: 'https://via.placeholder.com/200x120?text=Minecraft',
        descricao: 'Jogo de construção e exploração'
    },
    {
        id: 6,
        nome: 'Fortnite',
        genero: 'Battle Royale',
        plataforma: 'Multi-Plataforma',
        icon: '🎯',
        imagem: 'https://via.placeholder.com/200x120?text=Fortnite',
        descricao: 'Jogo de sobrevivência e construção'
    },
    {
        id: 7,
        nome: 'Call of Duty: Warzone',
        genero: 'Battle Royale',
        plataforma: 'Multi-Plataforma',
        icon: '💥',
        imagem: 'https://via.placeholder.com/200x120?text=Warzone',
        descricao: 'Jogo de tiro battle royale'
    },
    {
        id: 8,
        nome: 'Apex Legends',
        genero: 'Battle Royale',
        plataforma: 'Multi-Plataforma',
        icon: '👾',
        imagem: 'https://via.placeholder.com/200x120?text=Apex',
        descricao: 'Jogo de heróis em batalha royale'
    },
    {
        id: 9,
        nome: 'Elden Ring',
        genero: 'RPG',
        plataforma: 'Multi-Plataforma',
        icon: '⚡',
        imagem: 'https://via.placeholder.com/200x120?text=EldenRing',
        descricao: 'Jogo de RPG de ação dark fantasy'
    },
    {
        id: 10,
        nome: 'Palworld',
        genero: 'RPG',
        plataforma: 'Multi-Plataforma',
        icon: '🐾',
        imagem: 'https://via.placeholder.com/200x120?text=Palworld',
        descricao: 'Jogo de captura e criação de criaturas'
    },
    {
        id: 11,
        nome: 'The Crew Motorfest',
        genero: 'Racing',
        plataforma: 'Multi-Plataforma',
        icon: '🏎️',
        imagem: 'https://via.placeholder.com/200x120?text=Motorfest',
        descricao: 'Jogo de corrida online cooperativo'
    },
    {
        id: 12,
        nome: 'Rainbow Six Siege',
        genero: 'FPS',
        plataforma: 'Multi-Plataforma',
        icon: '🎖️',
        imagem: 'https://via.placeholder.com/200x120?text=Siege',
        descricao: 'Jogo de tiro tático com destruição dinâmica'
    },
    {
        id: 13,
        nome: 'Overwatch 2',
        genero: 'FPS',
        plataforma: 'Multi-Plataforma',
        icon: '⚙️',
        imagem: 'https://via.placeholder.com/200x120?text=Overwatch',
        descricao: 'Jogo de tiro por equipes com heróis'
    },
    {
        id: 14,
        nome: 'Hearthstone',
        genero: 'Card Game',
        plataforma: 'Multi-Plataforma',
        icon: '🃏',
        imagem: 'https://via.placeholder.com/200x120?text=Hearthstone',
        descricao: 'Jogo de cartas colecionáveis'
    },
    {
        id: 15,
        nome: 'World of Warcraft',
        genero: 'MMORPG',
        plataforma: 'PC',
        icon: '🐉',
        imagem: 'https://via.placeholder.com/200x120?text=WoW',
        descricao: 'Jogo de RPG multijogador massivo'
    }
];


// Matches Simulados
const matchesSimulados = [
    {
        id: 1,
        usuario1_id: 1,
        jogador_id: 2,
        jogo_id: 1,
        status: 'pendente',
        data_criacao: new Date(Date.now() - 3600000)
    },
    {
        id: 2,
        usuario1_id: 1,
        jogador_id: 3,
        jogo_id: 2,
        status: 'aceito',
        data_criacao: new Date(Date.now() - 7200000)
    },
    {
        id: 3,
        usuario1_id: 1,
        jogador_id: 4,
        jogo_id: 3,
        status: 'finalizado',
        data_criacao: new Date(Date.now() - 86400000)
    }
];

// Função auxiliar para formatar data
function formatarData(data, formato = 'd/m/Y') {
    if (!(data instanceof Date)) {
        data = new Date(data);
    }
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    
    if (formato === 'd/m/Y H:i') {
        return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
    }
    return `${dia}/${mes}/${ano}`;
}
