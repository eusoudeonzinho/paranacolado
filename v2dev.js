(function() {
    // evita duplo carregamento
    if (document.getElementById('bmSplash')) return;

    // --- FUNÇÕES AUXILIARES ---

    // Função para criar e exibir popups customizados (substitui alert)
    function showCustomAlert(message, type = 'info') { // type pode ser 'info', 'error', 'success'
        // Remove popup existente, se houver
        const existingOverlay = document.getElementById('bmAlertOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'bmAlertOverlay';

        const alertBox = document.createElement('div');
        alertBox.id = 'bmAlertBox';
        alertBox.classList.add(`bmAlert-${type}`); // Para estilização opcional por tipo

        const messageP = document.createElement('p');
        messageP.id = 'bmAlertMessage';
        messageP.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.id = 'bmAlertCloseBtn';
        closeBtn.textContent = 'OK';

        closeBtn.onclick = () => {
            alertBox.classList.add('bmAlertFadeOut'); // Adiciona classe para animação de saída
            overlay.style.opacity = 0; // Fade out overlay
            // Remove após a animação
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 300); // Tempo da animação de fadeOut
        };

        alertBox.appendChild(messageP);
        alertBox.appendChild(closeBtn);
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);

        // Força reflow para garantir que a animação de entrada funcione
        void alertBox.offsetWidth;
        alertBox.classList.add('bmAlertPopIn');
        overlay.style.opacity = 1; // Fade in overlay
    }

    // --- RASTREAMENTO DO ELEMENTO ATIVO ---
    // guarda último elemento clicado (CRUCIAL)
    let activeEl = null;
    document.addEventListener('mousedown', e => {
        console.log('mousedown detected, activeEl set to:', e.target);
        activeEl = e.target;
    }, true); // Use capturing phase

    // --- FUNÇÕES DE SIMULAÇÃO DE TECLADO (Mantidas intactas na lógica principal) ---
    function dispatchKeyEvent(target, eventType, key, keyCode, charCode = 0) {
        let effectiveCharCode = charCode;
        if (!effectiveCharCode && key && key.length === 1) {
            effectiveCharCode = key.charCodeAt(0);
        }
        const event = new KeyboardEvent(eventType, {
            key: key,
            code: `Key${key.toUpperCase()}`,
            keyCode: keyCode,
            which: keyCode,
            charCode: eventType === 'keypress' ? effectiveCharCode : 0,
            bubbles: true,
            cancelable: true
        });
        target.dispatchEvent(event);
    }

    async function simulateBackspace(targetElement) {
        if (!targetElement) return;
        activeEl = targetElement;
        targetElement.focus();
        const start = targetElement.selectionStart;
        const end = targetElement.selectionEnd;

        dispatchKeyEvent(targetElement, 'keydown', 'Backspace', 8);

        if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
            const currentValue = targetElement.value;
            let newValue = currentValue;
            let newCursorPos = start;

            if (start === end && start > 0) {
                newValue = currentValue.substring(0, start - 1) + currentValue.substring(end);
                newCursorPos = start - 1;
            } else if (start !== end) {
                newValue = currentValue.substring(0, start) + currentValue.substring(end);
                newCursorPos = start;
            }

            if (newValue !== currentValue) {
                const prototype = Object.getPrototypeOf(targetElement);
                const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
                if (descriptor && descriptor.set) {
                    descriptor.set.call(targetElement, newValue);
                } else {
                    targetElement.value = newValue;
                }
                targetElement.selectionStart = targetElement.selectionEnd = newCursorPos;
                targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            }
        } else if (targetElement.isContentEditable) {
            document.execCommand('delete', false, null);
        }

        dispatchKeyEvent(targetElement, 'keyup', 'Backspace', 8);
        await new Promise(r => setTimeout(r, 1));
    }

    function sendChar(c) {
        if (!activeEl) {
            console.warn("sendChar chamada, mas activeEl é nulo.");
            showCustomAlert("Erro: Clique no campo onde deseja digitar antes de usar esta função.", 'error');
            return;
        }
        if (!document.body.contains(activeEl)) {
            console.warn("sendChar chamada, mas activeEl não está mais no DOM.");
             showCustomAlert("Erro: O campo selecionado não existe mais na página.", 'error');
            return;
        }

        const targetElement = activeEl;
        targetElement.focus();
        const keyCode = c.charCodeAt(0);

        dispatchKeyEvent(targetElement, 'keydown', c, keyCode);
        dispatchKeyEvent(targetElement, 'keypress', c, keyCode, keyCode);

        if (targetElement.isContentEditable) {
            document.execCommand('insertText', false, c);
        } else if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
            const start = targetElement.selectionStart;
            const end = targetElement.selectionEnd;
            const currentValue = targetElement.value;
            const newValue = currentValue.substring(0, start) + c + currentValue.substring(end);

            const prototype = Object.getPrototypeOf(targetElement);
            const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
            if (descriptor && descriptor.set) {
                descriptor.set.call(targetElement, newValue);
            } else {
                targetElement.value = newValue;
            }
            targetElement.selectionStart = targetElement.selectionEnd = start + c.length;
            targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        }

        dispatchKeyEvent(targetElement, 'keyup', c, keyCode);
    }

    // --- SPLASH INICIAL (Animação Melhorada) ---
    const splash = document.createElement('div');
    splash.id = 'bmSplash';
    // Inspirado em Matrix / Código Digital
    splash.innerHTML = `
        <div id="bmSplashContent">
             <img id="bmSplashImg" src="https://i.imgur.com/RUWcJ6e.png"/>
             <div id="bmSplashTitle">Paraná Tools</div>
             <div id="bmSplashSubtitle">Carregando Ferramentas...</div>
             <div id="bmLoadingBar"><div id="bmLoadingProgress"></div></div>
        </div>
        <div id="bmSplashBgEffect"></div>
    `;
    document.body.appendChild(splash);

    // --- CSS INJETADO (Com Melhorias e Estilos para Popup) ---
    const css = `
        /* === EFEITO DE FUNDO SPLASH (Ex: Chuva Digital) === */
        #bmSplashBgEffect {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            overflow: hidden; z-index: 1;
           /* background: linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(10, 0, 20, 0.98)); */
             background: #000;
             opacity: 0;
             animation: bgFadeIn 1s forwards 0.2s;
        }
       /* Adicionar mais efeitos aqui se desejar (ex: partículas, chuva de código) */


        /* === SPLASH CONTENT (Animações Refinadas) === */
         #bmSplash {
            position: fixed; top:0; left:0;
            width:100%; height:100%;
            background:#000; /* Fallback */
            display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            z-index:99999; overflow:hidden;
             /* Animação de saída MAIS SUAVE */
            animation: splashFadeOut 0.8s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards 3.5s;
        }
        #bmSplashContent {
            z-index: 2; /* Fica sobre o efeito de fundo */
            display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            transform: scale(0.8);
            opacity: 0;
             animation: contentPopIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s;
        }
        #bmSplashImg {
            width:180px; /* Um pouco menor */
            margin-bottom: 20px;
            filter: drop-shadow(0 0 15px rgba(138, 43, 226, 0.5)); /* Glow roxo */
             transform: translateY(20px); /* Inicia um pouco abaixo */
             animation: logoFloat 1.5s ease-in-out infinite alternate 1.3s; /* Animação sutil após entrada */
        }
        #bmSplashTitle, #bmSplashSubtitle {
            font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color:#fff;
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
            opacity: 0; /* Inicia invisível */
        }
        #bmSplashTitle {
             font-size: 2.5em; font-weight: bold;
             letter-spacing: 1px;
             margin-bottom: 5px;
             animation: textFadeSlide 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.2s;
        }
        #bmSplashSubtitle {
             font-size: 1.2em; font-weight: 300; color: #ccc;
             animation: textFadeSlide 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.5s;
        }
         /* Barra de Carregamento */
         #bmLoadingBar {
            width: 220px; height: 6px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            margin-top: 30px;
            overflow: hidden;
             opacity: 0;
             animation: textFadeSlide 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.8s;
        }
        #bmLoadingProgress {
            width: 0%; height: 100%;
            background: linear-gradient(90deg, #8A2BE2, #A040FF);
            border-radius: 3px;
             animation: loadingAnim 1.5s cubic-bezier(0.65, 0.05, 0.36, 1) forwards 2s;
        }

        /* Keyframes das Animações do Splash */
        @keyframes bgFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes contentPopIn {
            from { opacity: 0; transform: scale(0.8) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
         @keyframes logoFloat {
            from { transform: translateY(20px); } /* Mantem posição inicial pós-entrada */
            to { transform: translateY(10px); } /* Sobe um pouco */
        }
        @keyframes textFadeSlide {
             from { opacity: 0; transform: translateY(15px); }
             to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loadingAnim { from { width: 0%; } to { width: 100%; } }
        @keyframes splashFadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }


        /* === CUSTOM ALERT POPUP === */
        #bmAlertOverlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px); /* Efeito de desfoque moderno */
            -webkit-backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center;
            z-index: 100001; /* Acima de tudo */
            opacity: 0; /* Inicia invisível */
            transition: opacity 0.3s ease-out;
        }
        #bmAlertBox {
            background: #1e1e1e;
            color: #fff;
            padding: 25px 30px;
            border-radius: 8px;
            border: 1px solid #333;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
            min-width: 300px; max-width: 450px;
            text-align: center;
            font-family: 'Segoe UI', sans-serif;
            transform: scale(0.9); /* Inicia menor */
            opacity: 0; /* Inicia transparente */
            /* transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease-out; */
             /* Classes de animação controlam entrada/saída */
        }
        #bmAlertBox.bmAlertPopIn {
             animation: alertPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        #bmAlertBox.bmAlertFadeOut {
            animation: alertFadeOut 0.3s ease-out forwards;
        }
        /* Estilos opcionais por tipo */
         /* #bmAlertBox.bmAlert-error { border-left: 5px solid #e74c3c; } */
         /* #bmAlertBox.bmAlert-success { border-left: 5px solid #2ecc71; } */

        #bmAlertMessage {
            font-size: 1.1em;
            line-height: 1.5;
            margin: 0 0 20px 0;
        }
        #bmAlertCloseBtn {
            padding: 10px 25px;
            font-size: 1em;
            background: #8A2BE2; /* Roxão */
            border: none;
            border-radius: 5px;
            color: #fff;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.15s ease;
            font-weight: bold;
        }
        #bmAlertCloseBtn:hover {
            background: #7022b6; /* Roxão mais escuro */
            transform: scale(1.05);
        }
         #bmAlertCloseBtn:active {
            transform: scale(0.98);
        }

        @keyframes alertPopIn {
            from { opacity: 0; transform: scale(0.8) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
         @keyframes alertFadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }


        /* === WRAPPER PRINCIPAL (Animação de Entrada Melhorada) === */
        #bmWrapper {
            position:fixed; top:20px; right:20px;
            width:320px;
            background:#1e1e1e;
            border:1px solid #333;
            border-radius:8px; /* Mais arredondado */
            box-shadow:0 6px 15px rgba(0,0,0,.6);
            font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Fonte mais padrão */
            color:#fff;
            opacity:0;
             /* Inicia fora da tela e escalado para baixo */
            transform:translateX(30px) scale(0.95);
            transition:opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            z-index:99998;
        }
        #bmWrapper.show {
            opacity:1;
            /* Entra na posição final */
             transform:translateX(0) scale(1);
        }

        /* header */
        #bmHeader {
            cursor:move;
            padding:10px 15px; /* Mais espaçamento */
            background:#111;
            border-bottom:1px solid #333;
            font-size:0.95em; font-weight: bold; /* Levemente maior e negrito */
            text-align:center;
            border-radius:8px 8px 0 0;
             user-select: none; /* Evita seleção de texto ao arrastar */
            -webkit-user-select: none;
            -moz-user-select: none;
        }

        /* conteúdo */
        #bmContent {
            padding:15px; /* Mais padding */
            background:#1b1b1b;
            border-radius: 0 0 8px 8px;
        }
        #bmContent textarea,
        #bmContent input[type="number"] { /* Mais específico */
            width:100%;
            margin-bottom:12px;
            padding:10px;
            font-size:1em; /* Tamanho padrão */
             font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; /* Fonte monoespaçada para código/texto */
            background:#2a2a2a;
            border:1px solid #444; /* Borda um pouco mais clara */
            border-radius:5px;
            color:#eee; /* Texto mais claro */
            box-sizing:border-box;
             resize: vertical; /* Permitir redimensionar só verticalmente */
             transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
         #bmContent textarea { min-height: 80px; } /* Altura mínima */

        #bmContent textarea:focus,
        #bmContent input[type="number"]:focus {
            outline:none;
            border-color:#8A2BE2;
            box-shadow:0 0 0 3px rgba(138,43,226,.3); /* Outline roxo suave */
        }
        /* Estilo comum para botões */
        #bmContent button {
            width:100%;
            padding:10px; /* Mais padding */
            margin-top: 8px;
            font-size:1em;
            font-weight: bold;
            background:transparent;
            border:2px solid #8A2BE2; /* Borda mais grossa */
            border-radius:5px;
            color:#8A2BE2;
            cursor:pointer;
            transition: all 0.2s ease-out; /* Transição mais suave */
            box-sizing: border-box;
        }
        #bmContent button:disabled {
            cursor: not-allowed;
            opacity: 0.5;
            border-color: #555;
            color: #555;
             background: #2a2a2a; /* Fundo sutil quando desabilitado */
             transform: none !important; /* Impede hover/active effect */
        }
        #bmContent button:not(:disabled):hover {
            background:#8A2BE2;
            color:#111; /* Texto escuro no hover */
            transform:translateY(-2px); /* Leve levantada */
             box-shadow: 0 4px 8px rgba(138, 43, 226, 0.3);
        }
        #bmContent button:not(:disabled):active {
            transform:translateY(0px); /* Volta ao normal */
             box-shadow: 0 2px 4px rgba(138, 43, 226, 0.2);
             background: #7022b6; /* Cor um pouco mais escura no clique */
             border-color: #7022b6;
        }

        /* toggle “Modo Disfarçado” */
        #bmToggleWrapper {
            display:flex;
            align-items:center;
            gap:10px; /* Mais espaço */
            margin-bottom:15px; /* Mais espaço abaixo */
            cursor: pointer; /* Indica que a área toda é clicável */
             padding: 5px; /* Área de clique maior */
             border-radius: 4px;
             transition: background-color 0.2s ease;
        }
         #bmToggleWrapper:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }
        #bmToggleImg {
            width:16px; height:16px;
            border:2px solid #8A2BE2;
            border-radius:3px;
            background:transparent;
            transition:background .2s ease, border-color 0.2s ease;
             display: flex; align-items: center; justify-content: center; /* Para checkmark futuro */
        }
         #bmToggleImg.active { /* Estilo quando ativo */
             background: #8A2BE2;
             /* Pode adicionar um checkmark SVG aqui se quiser */
         }
        #bmToggleText {
            font-size:0.95em;
            color:#ccc;
            user-select:none;
        }

        /* contador 3-2-1 (Animação Melhorada) */
        .bmCountdownNumber { /* Usando classe agora */
             position: absolute;
             /* Posicionado sobre o botão Iniciar */
             bottom: 60px; /* Ajuste conforme necessário */
             left: 50%;
             transform: translateX(-50%);
             font-family: 'Segoe UI Black', sans-serif;
             color: #8A2BE2;
             font-size: 3em; /* Maior */
             opacity: 0;
             animation: countPopZoom 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
             z-index: 10;
             text-shadow: 0 0 10px rgba(138, 43, 226, 0.7);
        }
        @keyframes countPopZoom {
             0%   { opacity: 0; transform: translateX(-50%) scale(0.5) rotate(-15deg); }
             60%  { opacity: 1; transform: translateX(-50%) scale(1.1) rotate(5deg); }
             100% { opacity: 0; transform: translateX(-50%) scale(1) rotate(0deg); }
        }

        /* overlay stealth (Animação Melhorada) */
        #bmOv {
            position:fixed;top:0;left:0;
            width:100%;height:100%;
            background:rgba(0,0,0,.9);
            backdrop-filter: blur(5px); /* Efeito de desfoque */
            -webkit-backdrop-filter: blur(5px);
            display:flex;flex-direction:column;
            align-items:center;justify-content:center;
            z-index:100000;
            opacity: 0; /* Começa invisível */
            animation: ovFadeInSmooth 0.5s ease-out forwards;
        }
         #bmOvContent { /* Container para animar conteúdo junto */
             opacity: 0;
             transform: translateY(20px);
             animation: ovContentSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.3s;
             text-align: center;
         }
        #bmOv img {
            max-width:60%; /* Pouco menor */
            max-height:45%;
             border-radius: 5px; /* Suave */
             box-shadow: 0 5px 15px rgba(0,0,0,0.4);
             /* animation: popIn .5s forwards; -> Movido para #bmOvContent */
        }
         #bmOv p { /* Estilo do texto do overlay */
             color: #ddd;
             font-family: 'Segoe UI', sans-serif;
             text-align: center;
             margin-top: 20px;
             max-width: 400px;
             line-height: 1.5;
         }
        #bmOv button { /* Estilo botão overlay (usando estilo do alert) */
            margin-top:25px;
            padding: 10px 25px;
            font-size: 1em;
            background: #8A2BE2; /* Roxão */
            border: none;
            border-radius: 5px;
            color: #fff;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.15s ease;
            font-weight: bold;
            width: auto; /* Tamanho automático */
        }
        #bmOv button:hover {
            background:#7022b6;
            transform:scale(1.05);
        }
         #bmOv button:active {
             transform: scale(0.98);
         }
        @keyframes ovFadeInSmooth { from{opacity:0} to{opacity:1} }
         @keyframes ovContentSlideUp { from{opacity:0; transform: translateY(20px);} to{opacity:1; transform: translateY(0);} }

         /* Estilos Modo Disfarçado (Claro) */
         #bmWrapper.stealth-mode {
             background: #f0f0f0;
             border-color: #ccc;
             color: #333;
         }
         #bmWrapper.stealth-mode #bmHeader {
             background: #dcdcdc;
             border-color: #ccc;
             color: #333;
         }
          #bmWrapper.stealth-mode #bmContent {
             background: #e9e9e9;
         }
         #bmWrapper.stealth-mode textarea,
         #bmWrapper.stealth-mode input[type="number"] {
             background: #fff;
             border-color: #bbb;
             color: #222;
         }
         #bmWrapper.stealth-mode textarea:focus,
         #bmWrapper.stealth-mode input[type="number"]:focus {
             border-color: #666;
             box-shadow: 0 0 0 3px rgba(100, 100, 100, 0.2);
         }
         #bmWrapper.stealth-mode button {
             border-color: #888;
             color: #444;
             background: #e0e0e0;
         }
          #bmWrapper.stealth-mode button:disabled {
             border-color: #ccc;
             color: #999;
             background: #f0f0f0;
          }
         #bmWrapper.stealth-mode button:not(:disabled):hover {
             background: #ccc;
             color: #111;
             border-color: #777;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
         }
          #bmWrapper.stealth-mode button:not(:disabled):active {
             background: #bbb;
             box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
         }
         #bmWrapper.stealth-mode #bmToggleWrapper:hover {
             background-color: rgba(0, 0, 0, 0.05);
         }
         #bmWrapper.stealth-mode #bmToggleImg {
             border-color: #999;
         }
          #bmWrapper.stealth-mode #bmToggleImg.active {
              background: #777;
              border-color: #777;
          }
         #bmWrapper.stealth-mode #bmToggleText {
             color: #555;
         }
    `;
    const styleTag = document.createElement('style');
    styleTag.textContent = css; // Usar textContent é mais seguro
    document.head.appendChild(styleTag);

    // --- LÓGICA PRINCIPAL E UI ---
    // Atraso para remover splash e montar UI
    setTimeout(() => {
        if (document.body.contains(splash)) {
            // Adiciona classe para fade out antes de remover (opcional, já tem animação no #bmSplash)
            // splash.style.opacity = 0;
            // splash.style.transform = 'scale(0.9)';
            // setTimeout(() => splash.remove(), 800); // Remove após animação de saída
            splash.remove(); // Remove direto, pois a animação está no próprio elemento
        }

        const wrapper = document.createElement('div');
        wrapper.id = 'bmWrapper';
        wrapper.innerHTML = `
            <div id="bmHeader">Paraná Colado V1 - AutoEditor Simulado</div>
            <div id="bmContent">
                <textarea id="bmText" placeholder="Cole o texto aqui..."></textarea>
                <input id="bmDelay" type="number" step="0.01" value="0.05" placeholder="Delay (s)">
                <div id="bmToggleWrapper">
                    <div id="bmToggleImg"></div>
                    <span id="bmToggleText">Modo Disfarçado</span>
                </div>
                <button id="bmBtn">Iniciar Digitação</button>
                <button id="bmBtnCorrect">Corrigir Automaticamente</button>
            </div>
        `;
        document.body.appendChild(wrapper);
        // Atraso mínimo para permitir a transição CSS ser aplicada
        setTimeout(() => wrapper.classList.add('show'), 50);

        // Lógica de arrastar (mantida)
        const header = document.getElementById('bmHeader');
        let isDragging = false;
        let dragStartX, dragStartY, initialLeft, initialTop;

        header.onmousedown = e => {
            // Ignora se o clique foi em um botão dentro do header (se houver no futuro)
            if (e.target !== header) return;
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            initialLeft = wrapper.offsetLeft;
            initialTop = wrapper.offsetTop;
            header.style.cursor = 'grabbing'; // Feedback visual
            // Adiciona listeners no document para capturar movimento fora do header
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault(); // Previne seleção de texto durante o arraste
        };

        function onMouseMove(e) {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            wrapper.style.left = initialLeft + dx + 'px';
            wrapper.style.top = initialTop + dy + 'px';
        }

        function onMouseUp() {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'move'; // Restaura cursor
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        }


        // Lógica “Modo Disfarçado” (com classes CSS e animações)
        const toggleWrapper = document.getElementById('bmToggleWrapper');
        const toggleBox = document.getElementById('bmToggleImg');
        let stealthOn = false;
        let firstTimeStealth = true; // Renomeado para clareza
        let rect; // Guarda a posição do wrapper

        function enterStealth() {
            wrapper.classList.add('stealth-mode'); // Adiciona classe para estilo claro
            toggleBox.classList.add('active'); // Marca visualmente o toggle como ativo

            // Esconder/Mostrar UI baseado no mouse enter/leave
            rect = wrapper.getBoundingClientRect(); // Guarda posição atual
            wrapper.addEventListener('mouseenter', showUI); // Mostra ao entrar
            document.addEventListener('mousemove', checkHideUI); // Verifica se deve esconder

            // Esconde inicialmente se o mouse não estiver sobre ele
             setTimeout(checkHideUI, 50); // Pequeno delay para garantir que rect está correto

            console.log('Entered Stealth Mode');
        }

        function exitStealth() {
            wrapper.classList.remove('stealth-mode'); // Remove classe de estilo claro
            toggleBox.classList.remove('active'); // Desmarca toggle

            // Remove listeners e garante visibilidade
            wrapper.removeEventListener('mouseenter', showUI);
            document.removeEventListener('mousemove', checkHideUI);
            wrapper.style.opacity = 1;
            wrapper.style.pointerEvents = 'auto';
            console.log('Exited Stealth Mode');
        }

        function checkHideUI(ev) {
            if (!stealthOn) return; // Só funciona no modo disfarçado
            // Verifica se o mouse está FORA da área que o wrapper ocupava
            if (rect && (
                ev.clientX < rect.left || ev.clientX > rect.right ||
                ev.clientY < rect.top || ev.clientY > rect.bottom
            )) {
                 // Verifica se JÁ está visível antes de esconder
                 if (wrapper.style.opacity !== '0') {
                     hideUI();
                 }
            }
        }

        function hideUI() {
             if (!stealthOn) return; // Segurança extra
             rect = wrapper.getBoundingClientRect(); // Atualiza posição ANTES de esconder
             wrapper.style.opacity = 0;
             wrapper.style.pointerEvents = 'none'; // Impede interação quando invisível
             console.log('UI Hidden');
        }
        function showUI() {
             if (!stealthOn) return; // Segurança extra
             wrapper.style.opacity = 1;
             wrapper.style.pointerEvents = 'auto';
             console.log('UI Shown');
        }

        function showStealthOverlay() {
            const ov = document.createElement('div');
            ov.id = 'bmOv';
            ov.innerHTML = `
                <div id="bmOvContent">
                    <img src="https://i.imgur.com/RquEok4.gif" alt="Demonstração Modo Disfarçado"/>
                    <p>O Modo Disfarçado oculta esta janela quando o mouse não está sobre ela. Passe o mouse na área onde ela estava para reaparecer.</p>
                    <button id="bmOvBtn">Entendido</button>
                </div>
            `;
            document.body.appendChild(ov);
            document.getElementById('bmOvBtn').onclick = () => {
                ov.style.opacity = 0; // Fade out
                setTimeout(() => {
                     if (document.body.contains(ov)){ ov.remove(); }
                }, 500); // Tempo da animação de saída do overlay
                enterStealth(); // Ativa o modo após fechar o overlay
            };
        }

        // Event listener no wrapper do toggle
         toggleWrapper.onclick = () => {
            stealthOn = !stealthOn;
            if (stealthOn) {
                if (firstTimeStealth) {
                    firstTimeStealth = false;
                    showStealthOverlay();
                } else {
                    enterStealth();
                }
            } else {
                exitStealth();
            }
        };
        // Inicializa no modo normal
        // exitStealth(); // Não precisa chamar explicitamente, já é o estado padrão


        // Lógica Botão "Iniciar Digitação" (com contador melhorado e showCustomAlert)
        const startButton = document.getElementById('bmBtn');
        const correctButton = document.getElementById('bmBtnCorrect');

        startButton.onclick = async function() {
            const text = document.getElementById('bmText').value;
            const delayInput = parseFloat(document.getElementById('bmDelay').value);
            const delay = (!isNaN(delayInput) && delayInput >= 0) ? delayInput * 1000 : 50; // Default 50ms

            if (!text) {
                showCustomAlert('O campo de texto está vazio!', 'error');
                return;
            }
            if (!activeEl || !document.body.contains(activeEl)) {
                showCustomAlert('Clique primeiro no campo onde deseja digitar ANTES de clicar em "Iniciar Digitação"!', 'error');
                return;
            }

            this.disabled = true;
            if (correctButton) correctButton.disabled = true;

            // Contador estilizado
            for (let n = 3; n >= 1; n--) {
                const cnt = document.createElement('div');
                cnt.className = 'bmCountdownNumber'; // Usa classe para estilo e animação
                cnt.textContent = n;
                wrapper.appendChild(cnt); // Adiciona ao wrapper para posicionamento relativo
                // Espera a duração da animação + um pouco
                await new Promise(r => setTimeout(r, 900));
                if (wrapper.contains(cnt)) wrapper.removeChild(cnt);
                // Pequena pausa entre números, se desejado
                // await new Promise(r => setTimeout(r, 100));
            }

            // Digita
            try {
                activeEl.focus();
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    // Verifica se o botão foi reativado (ex: por erro em sendChar)
                     if (!this.disabled) {
                         console.warn("Digitação interrompida.");
                         break;
                     }
                    sendChar(char);
                    await new Promise(r => setTimeout(r, delay));
                }
                 showCustomAlert('Digitação concluída!', 'success');
            } catch (error) {
                console.error("Erro durante a digitação simulada ('Iniciar'):", error);
                showCustomAlert("Ocorreu um erro durante a digitação. Verifique o console para detalhes.", 'error');
            } finally {
                this.disabled = false;
                if (correctButton) correctButton.disabled = false;
            }
        };


        // --- LÓGICA CORREÇÃO AUTOMÁTICA (Funcionalidade central mantida, usa showCustomAlert) ---

        function waitForElement(selector, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                const interval = setInterval(() => {
                    const element = document.querySelector(selector);
                     // Verifica se existe E está visível no layout
                    if (element && element.offsetParent !== null) {
                        clearInterval(interval);
                        resolve(element);
                    } else if (Date.now() - startTime > timeout) {
                        clearInterval(interval);
                        console.error(`Timeout esperando por elemento: ${selector}`);
                        reject(new Error(`Timeout esperando por elemento: ${selector}`));
                    }
                }, 100);
            });
        }

        correctButton.onclick = async function() {
            const btnCorrect = this; // Referência ao botão
            btnCorrect.disabled = true;
            if (startButton) startButton.disabled = true;

            console.log('Iniciando correção simulada...');
            const typingDelayCorrect = 20; // Mais rápido para correção
            const backspaceDelay = 5;   // Mais rápido para backspace

            // 1. Encontrar a textarea principal
            let targetTextarea;
            try {
                // Usando um seletor um pouco mais robusto, mas ainda específico
                targetTextarea = await waitForElement('textarea[id*="multiline"][class*="jss"]', 3000);
            } catch (error) {
                showCustomAlert('ERRO: Textarea principal de redação não encontrada ou não visível! A correção não pode continuar.', 'error');
                console.error('Textarea principal não encontrada ou visível.');
                btnCorrect.disabled = false;
                if (startButton) startButton.disabled = false;
                return;
            }
             console.log('Textarea principal encontrada:', targetTextarea);
             activeEl = targetTextarea; // Define como elemento ativo para as simulações

            // 2. Encontrar spans de erro clicáveis (Seletor mantido)
            const errorSpans = document.querySelectorAll('div.jss24 p.MuiTypography-root.jss23 div[style*="white-space: break-spaces"] > span');
            if (errorSpans.length === 0) {
                 showCustomAlert('Nenhum erro (span clicável na estrutura esperada) foi encontrado para corrigir.', 'info');
                console.log('Nenhum span de erro encontrado com o seletor.');
                btnCorrect.disabled = false;
                if (startButton) startButton.disabled = false;
                return;
            }
            console.log(`Encontrados ${errorSpans.length} spans de erro potenciais.`);

            let correctedCount = 0;
            let errorCount = 0;

            // 3. Iterar sobre cada erro
            for (const errorSpan of errorSpans) {
                // Verifica se o botão ainda está desabilitado (permite interrupção externa)
                 if (btnCorrect.disabled === false) {
                     console.log("Correção interrompida.");
                     break;
                 }

                 // Verifica se o span ainda está no DOM e visível
                 if (!document.body.contains(errorSpan) || errorSpan.offsetParent === null) {
                     console.log("Span de erro não está mais visível ou foi removido. Pulando.");
                     continue;
                 }

                try {
                    const errorText = errorSpan.textContent.trim();
                    if (!errorText) continue;

                    console.log(`Processando erro: "${errorText}"`);

                    // 3.1 Encontrar posição na TEXTAREA
                    const currentTextValue = targetTextarea.value;
                    const errorIndex = currentTextValue.indexOf(errorText);

                    if (errorIndex === -1) {
                        console.log(`Erro "${errorText}" não encontrado na textarea. Pulando.`);
                        continue;
                    }

                    // 4. Simular clique no erro
                    errorSpan.click();
                    console.log('Clicou no span de erro.');
                     await new Promise(r => setTimeout(r, 150)); // Pausa para menu aparecer

                    // 5. Esperar lista de sugestões (Seletor mantido)
                    let suggestionList;
                    try {
                        suggestionList = await waitForElement('ul#menu-list-grow', 2500); // Timeout menor
                    } catch (e) {
                        console.warn(`Lista de sugestões não apareceu para "${errorText}". Pulando erro.`);
                         // Tenta fechar clicando fora
                         document.body.click();
                         await new Promise(r => setTimeout(r, 150));
                         errorCount++;
                        continue;
                    }

                    // 6. Coletar e escolher sugestão
                    const suggestionItems = suggestionList.querySelectorAll('li');
                    const validSuggestions = Array.from(suggestionItems)
                         // Assume que a primeira <li> pode ser um título ou não clicável
                         .slice(1)
                         .map(li => li.textContent.trim())
                         .filter(text => text.length > 0);

                    console.log('Sugestões encontradas:', validSuggestions);

                    if (validSuggestions.length > 0) {
                        // Escolha da sugestão: Pega a primeira (geralmente a mais provável)
                        const chosenSuggestion = validSuggestions[0];
                        // const chosenSuggestion = validSuggestions[Math.floor(Math.random() * validSuggestions.length)]; // Aleatória
                        console.log(`Sugestão escolhida: "${chosenSuggestion}"`);

                        // --- SIMULAÇÃO DE EDIÇÃO ---
                        targetTextarea.focus();
                        targetTextarea.selectionStart = errorIndex; // Seleciona o erro
                        targetTextarea.selectionEnd = errorIndex + errorText.length;
                        console.log(`Texto "${errorText}" selecionado na textarea.`);
                        await new Promise(r => setTimeout(r, 50));

                        // 8. SIMULAR BACKSPACE (apaga a seleção)
                        console.log(`Simulando Backspace para apagar seleção...`);
                        activeEl = targetTextarea; // Garante target
                        await simulateBackspace(targetTextarea);
                        console.log('Seleção apagada.');
                        await new Promise(r => setTimeout(r, 50)); // Pausa após apagar

                        // 9. SIMULAR DIGITAÇÃO da correção
                        console.log(`Simulando digitação de "${chosenSuggestion}"...`);
                        activeEl = targetTextarea; // Garante target
                        for (const char of chosenSuggestion) {
                             if (btnCorrect.disabled === false) break; // Verifica interrupção
                            sendChar(char);
                            await new Promise(r => setTimeout(r, typingDelayCorrect));
                        }
                         if (btnCorrect.disabled === false) { console.log("Digitação da correção interrompida."); break; }
                        console.log('Digitação da correção simulada.');
                        correctedCount++;
                        // --- FIM SIMULAÇÃO ---

                    } else {
                        console.warn(`Nenhuma sugestão válida encontrada para "${errorText}".`);
                        errorCount++;
                    }

                    // 10. Fechar a lista de sugestões
                    console.log('Tentando fechar a lista de sugestões.');
                    document.body.click(); // Clica fora para fechar
                    await new Promise(r => setTimeout(r, 200)); // Pausa para garantir fechamento

                } catch (error) {
                    console.error(`Erro processando o span "${errorSpan?.textContent?.trim()}":`, error);
                     errorCount++;
                    try { document.body.click(); } catch(e){} // Tenta fechar menu em caso de erro
                    await new Promise(r => setTimeout(r, 200));
                }
                 // Pausa entre processamento de erros
                 await new Promise(r => setTimeout(r, 100));

            } // Fim do loop for...of

            // Reabilita os botões
            btnCorrect.disabled = false;
            if (startButton) startButton.disabled = false;

            console.log('Correção simulada concluída.');
             let finalMessage = `Correção finalizada! ${correctedCount} erros foram processados.`;
             if (errorCount > 0) {
                 finalMessage += ` ${errorCount} erros não puderam ser corrigidos (sem sugestão ou erro no processo).`;
             }
             showCustomAlert(finalMessage, errorCount > 0 ? 'info' : 'success');

        }; // Fim do onclick bmBtnCorrect

    }, 4000); // Tempo total do Splash Screen (ajuste conforme a animação)

})(); // Fim da IIFE
