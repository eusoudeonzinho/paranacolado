const token = localStorage.getItem("token");

if (token) {
    fetch(`https://backendparanatools.onrender.com/api/user?token=${token}`)
        .then(res => res.json())
        .then(user => {
            if (user.error) {
                // Token inválido: mostra login
                document.getElementById("login-btn").style.display = "inline";
                document.getElementById("user-info").style.display = "none";
            } else {
                // Usuário logado: mostra info e esconde botão
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

                
                // Logout
                const logoutButton = document.getElementById("logout-button");
                if (logoutButton != null) {
                    logoutButton.addEventListener("click", () => {
                        localStorage.removeItem("token");
                        window.location.reload()
                    })
                }
            }
        });
} else {
    // Sem token: mostra login
    document.getElementById("login-btn").style.display = "inline";
    document.getElementById("user-info").style.display = "none";
}