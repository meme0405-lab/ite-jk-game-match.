document.addEventListener('DOMContentLoaded', function () {
    const googleBtn = document.getElementById('googleLogin');
    const discordBtn = document.getElementById('discordLogin');
    const twitchBtn = document.getElementById('twitchLogin');

    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            window.location.href = 'oauth.php?provider=google';
        });
    }

    if (discordBtn) {
        discordBtn.addEventListener('click', () => {
            window.location.href = 'oauth.php?provider=discord';
        });
    }

    if (twitchBtn) {
        twitchBtn.addEventListener('click', () => {
            window.location.href = 'oauth.php?provider=twitch';
        });
    }
});
