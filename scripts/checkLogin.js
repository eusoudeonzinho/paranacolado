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
    document.getElementById("login-btn").style.display = "none";
    document.getElementById("user-info").style.display = "flex";
    document.getElementById("user-info").innerHTML = `
        <div class="inside-button">
            <img src="${user.avatar}">
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
    document.getElementById("login-btn").style.display = "flex";
    document.getElementById("user-info").style.display = "none";
}