// ===== DISCORD OAUTH2 (Implicit Grant) =====
// ВАЖНО: Замени CLIENT_ID на свой из Discord Developer Portal
const DISCORD_CLIENT_ID = 'ТВОЙ_CLIENT_ID';
const DISCORD_REDIRECT = window.location.origin + window.location.pathname;

function loginDiscord() {
    const url = 'https://discord.com/oauth2/authorize' +
        '?client_id=' + DISCORD_CLIENT_ID +
        '&redirect_uri=' + encodeURIComponent(DISCORD_REDIRECT) +
        '&response_type=token' +
        '&scope=identify';
    window.location.href = url;
}

function checkDiscordAuth() {
    const hash = window.location.hash.slice(1);
    if (!hash) return false;

    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    if (!token) return false;

    fetch('https://discord.com/api/users/@me', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(r => r.json())
    .then(user => {
        const avatarUrl = user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
            : null;

        Storage.setUser({
            id: user.id,
            username: user.username,
            avatar: avatarUrl
        });

        // Очищаем hash
        window.history.replaceState({}, '', window.location.pathname);
        window.location.reload();
    })
    .catch(e => console.error('Discord auth:', e));

    return true;
}

window.addEventListener('load', checkDiscordAuth);
