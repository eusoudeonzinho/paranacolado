const discordUrl = "https://backendparanatools.onrender.com/auth/discord";

document.getElementById("login-discord").addEventListener("click", () => {
    window.location.href = discordUrl;
});

// Verifica se veio o token na URL ou se já existe localmente
const params = new URLSearchParams(window.location.search);
const token = params.get("token") || localStorage.getItem("token");

if (token) {
    localStorage.setItem("token", token);
    window.history.replaceState({}, document.title, "/");

    fetchUserData(token);
}

async function fetchUserData(token) {
    try {
        const res = await fetch(`https://backendparanatools.onrender.com/api/user?token=${token}`);
        const user = await res.json();

        if (!user.error) {
            window.location.href = "/";
        } else {
            await tryRefreshToken();
        }
    } catch {
        await tryRefreshToken();
    }
}

async function tryRefreshToken() {
    try {
        const res = await fetch("https://backendparanatools.onrender.com/api/refresh", {
            credentials: "include"
        });
        const data = await res.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            window.location.href = "/";
        }
    } catch (e) {
        console.error("Não foi possível restaurar a sessão", e);
    }
}