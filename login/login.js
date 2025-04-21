const discordUrl = "https://backendparanatools.onrender.com/auth/discord";

document.getElementById("login-discord").addEventListener("click", () => {
    window.location.href = discordUrl;
});

// Verifica se tem token na URL ou no localStorage
const params = new URLSearchParams(window.location.search);
const token = params.get("token") || localStorage.getItem("token");

if (params.get("token")) {
    // Salva no localStorage
    localStorage.setItem("token", params.get("token"));

    // Limpa a URL (remove o `?token=...`)
    window.history.replaceState({}, document.title, "/");
}

if (token) {
    fetch(`https://backendparanatools.onrender.com/api/user?token=${token}`)
        .then(res => res.json())
        .then(user => {
            if (!user.error) {
                window.location.href = "../index.html";
            }
        });
}