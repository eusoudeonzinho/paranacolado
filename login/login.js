const clientId = "1363359825811083294";
const redirectUri = "https://backendparanatools.onrender.com/auth/discord/callback"; // URL do backend

document.getElementById("login-discord").addEventListener("click", () => {
    const discordUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
    window.location.href = discordUrl;
});

// Pega dados da URL (após login)
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("name");
const avatar = urlParams.get("avatar");

if (username && avatar) {
    document.body.innerHTML += `<p>Bem-vindo, ${username}!</p><img src="https://cdn.discordapp.com/avatars/ID_DO_USUARIO/${avatar}.png" width="80">`;
}