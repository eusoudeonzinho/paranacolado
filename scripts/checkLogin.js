// Pega token da URL ou do localStorage
const params = new URLSearchParams(window.location.search);
let token = params.get("token") || localStorage.getItem("token");

if (params.get("token")) {
    // Se veio token pela URL, salva no localStorage e limpa a URL
    localStorage.setItem("token", token);
    window.history.replaceState({}, document.title, "/");
}

if (token) {
    checkToken(token);
} else {
    tryRefreshAndRetry();
}

async function checkToken(token) {
    try {
        const res = await fetch(`https://backendparanatools.onrender.com/api/user?token=${token}`);
        const user = await res.json();

        if (user.error) {
            await tryRefreshAndRetry();
        } else {
            showUser(user);
        }
    } catch {
        await tryRefreshAndRetry();
    }
}

async function tryRefreshAndRetry() {
    try {
        const res = await fetch("https://backendparanatools.onrender.com/api/refresh", {
            credentials: "include"
        });
        const data = await res.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            await checkToken(data.token);
        } else {
            showLogin();
        }
    } catch {
        showLogin();
    }
}

function showUser(user) {
    const loginBtn = document.getElementById("login-btn");
    const userInfo = document.getElementById("user-info");
    if (loginBtn == null || userInfo == null) { return; }

    const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    loginBtn.style.display = "none";
    userInfo.style.display = "flex";
    userInfo.innerHTML = `
        <div class="inside-button">
            <img src="${avatarUrl}">
            <button id="logout-button">
                <img src="/imgs/icons/door.svg" alt="Sair">
            </button>
        </div>
        <h2>${user.username}</h2>
    `;

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.reload();
        });
    }
}

function showLogin() {
    const loginBtn = document.getElementById("login-btn");
    const userInfo = document.getElementById("user-info");
    if (loginBtn == null || userInfo == null) { return; }

    loginBtn.style.display = "flex";
    userInfo.style.display = "none";
}