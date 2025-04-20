(function() {
    // evita duplo carregamento
    if (document.getElementById('bmSplash')) return;

    // --- Constantes de Delay (Mínimo) ---
    const MIN_DELAY = 1; // ms

    // --- FUNÇÕES AUXILIARES ---
    function showCustomAlert(message, type = 'info') { /* ... código mantido ... */
        const existingOverlay = document.getElementById('bmAlertOverlay'); if (existingOverlay) { existingOverlay.remove(); } const overlay = document.createElement('div'); overlay.id = 'bmAlertOverlay'; const alertBox = document.createElement('div'); alertBox.id = 'bmAlertBox'; alertBox.classList.add(`bmAlert-${type}`); const messageP = document.createElement('p'); messageP.id = 'bmAlertMessage'; messageP.textContent = message; const closeBtn = document.createElement('button'); closeBtn.id = 'bmAlertCloseBtn'; closeBtn.textContent = 'OK'; closeBtn.onclick = () => { alertBox.classList.add('bmAlertFadeOut'); overlay.style.opacity = 0; setTimeout(() => { if (document.body.contains(overlay)) { document.body.removeChild(overlay); } }, 300); }; alertBox.appendChild(messageP); alertBox.appendChild(closeBtn); overlay.appendChild(alertBox); document.body.appendChild(overlay); void alertBox.offsetWidth; alertBox.classList.add('bmAlertPopIn'); overlay.style.opacity = 1;
    }
    function waitForElementToDisappear(selector, timeout = 30000) { /* ... código mantido ... */
        return new Promise((resolve, reject) => { const intervalTime = 100; let elapsedTime = 0; const intervalId = setInterval(() => { const element = document.querySelector(selector); if (!element) { clearInterval(intervalId); clearTimeout(timeoutId); resolve("Elemento desapareceu"); } elapsedTime += intervalTime; }, intervalTime); const timeoutId = setTimeout(() => { clearInterval(intervalId); console.error(`Timeout ${timeout}ms esperando ${selector} desaparecer.`); reject(new Error(`Timeout esperando ${selector} desaparecer`)); }, timeout); });
    }
    function waitForElement(selector, timeout = 5000) { /* ... código mantido ... */
        return new Promise((resolve, reject) => { const startTime = Date.now(); const interval = setInterval(() => { const element = document.querySelector(selector); if (element && element.offsetParent !== null) { clearInterval(interval); resolve(element); } else if (Date.now() - startTime > timeout) { clearInterval(interval); reject(new Error(`Timeout: ${selector}`)); } }, 100); });
    }


    // --- RASTREAMENTO DO ELEMENTO ATIVO ---
    let activeEl = null;
    document.addEventListener('mousedown', e => { activeEl = e.target; }, true);

    // --- FUNÇÕES DE SIMULAÇÃO DE TECLADO (Aceleradas) ---
    function dispatchKeyEvent(target, eventType, key, keyCode, charCode = 0) { /* ... código mantido ... */
        let effectiveCharCode = charCode; if (!effectiveCharCode && key && key.length === 1) { effectiveCharCode = key.charCodeAt(0); } const event = new KeyboardEvent(eventType, { key: key, code: `Key${key.toUpperCase()}`, keyCode: keyCode, which: keyCode, charCode: eventType === 'keypress' ? effectiveCharCode : 0, bubbles: true, cancelable: true }); target.dispatchEvent(event);
    }
    async function simulateBackspace(targetElement) { /* ... código mantido com MIN_DELAY ... */
        if (!targetElement) return; activeEl = targetElement; targetElement.focus(); const start = targetElement.selectionStart; const end = targetElement.selectionEnd; dispatchKeyEvent(targetElement, 'keydown', 'Backspace', 8); if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) { const currentValue = targetElement.value; let newValue = currentValue; let newCursorPos = start; if (start === end && start > 0) { newValue = currentValue.substring(0, start - 1) + currentValue.substring(end); newCursorPos = start - 1; } else if (start !== end) { newValue = currentValue.substring(0, start) + currentValue.substring(end); newCursorPos = start; } if (newValue !== currentValue) { const prototype = Object.getPrototypeOf(targetElement); const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value'); if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); } else { targetElement.value = newValue; } targetElement.selectionStart = targetElement.selectionEnd = newCursorPos; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } } else if (targetElement.isContentEditable) { document.execCommand('delete', false, null); } dispatchKeyEvent(targetElement, 'keyup', 'Backspace', 8); await new Promise(r => setTimeout(r, MIN_DELAY));
    }
    function sendChar(c) { /* ... código mantido e rápido ... */
        if (!activeEl || !document.body.contains(activeEl)) { return false; } const targetElement = activeEl; targetElement.focus(); const keyCode = c.charCodeAt(0); dispatchKeyEvent(targetElement, 'keydown', c, keyCode); dispatchKeyEvent(targetElement, 'keypress', c, keyCode, keyCode); if (targetElement.isContentEditable) { document.execCommand('insertText', false, c); } else if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') { const start = targetElement.selectionStart; const end = targetElement.selectionEnd; const currentValue = targetElement.value; const newValue = currentValue.substring(0, start) + c + currentValue.substring(end); const prototype = Object.getPrototypeOf(targetElement); const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value'); if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); } else { targetElement.value = newValue; } targetElement.selectionStart = targetElement.selectionEnd = start + c.length; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } dispatchKeyEvent(targetElement, 'keyup', c, keyCode); return true;
    }

    // --- SPLASH INICIAL (Mantido Lindo) ---
    const splash = document.createElement('div'); splash.id = 'bmSplash'; /* ... innerHTML mantido ... */
    splash.innerHTML = `<div id="bmSplashContent"><img id="bmSplashImg" src="https://i.imgur.com/RUWcJ6e.png"/> <div id="bmSplashTitle">Paraná Tools</div> <div id="bmSplashSubtitle">Carregando...</div> <div id="bmLoadingBar"><div id="bmLoadingProgress"></div></div> </div> <div id="bmSplashBgEffect"></div>`;
    document.body.appendChild(splash);

    // --- CSS INJETADO (Adicionado Fundo Animado e Countdown Correção) ---
    const css = `
        /* ... (CSS anterior mantido) ... */
        #bmSplashBgEffect { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 1; background: #000; opacity: 0; animation: bgFadeIn 1s forwards 0.2s; } #bmSplash { position: fixed; top:0; left:0; width:100%; height:100%; background:#000; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:99999; overflow:hidden; animation: splashFadeOut 0.8s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards 3.5s; } #bmSplashContent { z-index: 2; display:flex; flex-direction:column; align-items:center; justify-content:center; transform: scale(0.8); opacity: 0; animation: contentPopIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s; } #bmSplashImg { width:180px; margin-bottom: 20px; filter: drop-shadow(0 0 15px rgba(138, 43, 226, 0.5)); transform: translateY(20px); animation: logoFloat 1.5s ease-in-out infinite alternate 1.3s; } #bmSplashTitle, #bmSplashSubtitle { font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#fff; text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); opacity: 0; } #bmSplashTitle { font-size: 2.5em; font-weight: bold; letter-spacing: 1px; margin-bottom: 5px; animation: textFadeSlide 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.2s; } #bmSplashSubtitle { font-size: 1.2em; font-weight: 300; color: #ccc; animation: textFadeSlide 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.5s; } #bmLoadingBar { width: 220px; height: 6px; background-color: rgba(255, 255, 255, 0.2); border-radius: 3px; margin-top: 30px; overflow: hidden; opacity: 0; animation: textFadeSlide 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.8s; } #bmLoadingProgress { width: 0%; height: 100%; background: linear-gradient(90deg, #8A2BE2, #A040FF); border-radius: 3px; animation: loadingAnim 1.5s cubic-bezier(0.65, 0.05, 0.36, 1) forwards 2s; } @keyframes bgFadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes contentPopIn { from { opacity: 0; transform: scale(0.8) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } } @keyframes logoFloat { from { transform: translateY(20px); } to { transform: translateY(10px); } } @keyframes textFadeSlide { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } } @keyframes loadingAnim { from { width: 0%; } to { width: 100%; } } @keyframes splashFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
        #bmAlertOverlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100001; opacity: 0; transition: opacity 0.3s ease-out; pointer-events: none;} #bmAlertOverlay:has(#bmAlertBox.bmAlertPopIn) { pointer-events: auto; } #bmAlertBox { background: #1e1e1e; color: #fff; padding: 25px 30px; border-radius: 8px; border: 1px solid #333; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5); min-width: 300px; max-width: 450px; text-align: center; font-family: 'Segoe UI', sans-serif; transform: scale(0.9); opacity: 0; } #bmAlertBox.bmAlertPopIn { animation: alertPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; } #bmAlertBox.bmAlertFadeOut { animation: alertFadeOut 0.3s ease-out forwards; } #bmAlertMessage { font-size: 1.1em; line-height: 1.5; margin: 0 0 20px 0; } #bmAlertCloseBtn { padding: 10px 25px; font-size: 1em; background: #8A2BE2; border: none; border-radius: 5px; color: #fff; cursor: pointer; transition: background 0.2s ease, transform 0.15s ease; font-weight: bold; } #bmAlertCloseBtn:hover { background: #7022b6; transform: scale(1.05); } #bmAlertCloseBtn:active { transform: scale(0.98); } @keyframes alertPopIn { from { opacity: 0; transform: scale(0.8) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } } @keyframes alertFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }

        /* Wrapper com fundo sutilmente animado */
        #bmWrapper {
            position:fixed; top:20px; right:20px; width:320px;
            border:1px solid #333; border-radius:8px;
            box-shadow:0 6px 15px rgba(0,0,0,.6);
            font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#fff;
            opacity:0; transform:translateX(30px) scale(0.95);
            transition:opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            z-index:99998; overflow: hidden; /* Para gradiente animado */
            background: linear-gradient(135deg, #1e1e1e, #151515, #1e1e1e);
            background-size: 200% 200%;
            animation: subtleGradient 15s ease infinite;
        }
        @keyframes subtleGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        #bmWrapper.show { opacity:1; transform:translateX(0) scale(1); }
        #bmHeader { cursor:move; padding:10px 15px; background: rgba(17, 17, 17, 0.8); /* Leve transparência */ backdrop-filter: blur(2px); border-bottom:1px solid #333; font-size:0.95em; font-weight: bold; text-align:center; border-radius:8px 8px 0 0; user-select: none; -webkit-user-select: none; -moz-user-select: none; }
        #bmContent { padding:15px; background:rgba(27, 27, 27, 0.8); backdrop-filter: blur(2px); border-radius: 0 0 8px 8px; }
        #bmContent textarea, #bmContent input[type="number"] { width:100%; margin-bottom:12px; padding:10px; font-size:1em; font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; background:rgba(42, 42, 42, 0.9); border:1px solid #444; border-radius:5px; color:#eee; box-sizing:border-box; resize: vertical; transition: border-color 0.25s ease, box-shadow 0.25s ease; }
        #bmContent textarea { min-height: 80px; }
        #bmContent textarea:focus, #bmContent input[type="number"]:focus { outline:none; border-color:#8A2BE2; box-shadow:0 0 0 3px rgba(138, 43, 226, 0.4); }

        /* Botões com transições mais suaves */
        #bmContent button { width:100%; padding:10px; margin-top: 8px; font-size:1em; font-weight: bold; background:transparent; border:2px solid #8A2BE2; border-radius:5px; color:#8A2BE2; cursor:pointer; transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Transição suave */ box-sizing: border-box; }
        #bmContent button:disabled { cursor: not-allowed; opacity: 0.5; border-color: #555; color: #555; background: #2a2a2a; transform: none !important; box-shadow: none !important; }
        #bmContent button:not(:disabled):hover { background:#8A2BE2; color:#111; transform:translateY(-2px); box-shadow: 0 5px 10px rgba(138, 43, 226, 0.35); }
        #bmContent button:not(:disabled):active { transform:translateY(-1px) scale(0.99); /* Efeito mais sutil */ box-shadow: 0 2px 5px rgba(138, 43, 226, 0.25); background: #7022b6; border-color: #7022b6; }

        /* Toggle Disfarçado (Mantido) */
        #bmToggleWrapper { display:flex; align-items:center; gap:10px; margin-bottom:15px; cursor: pointer; padding: 5px; border-radius: 4px; transition: background-color 0.2s ease; } #bmToggleWrapper:hover { background-color: rgba(255, 255, 255, 0.05); } #bmToggleImg { width:16px; height:16px; border:2px solid #8A2BE2; border-radius:3px; background:transparent; transition:background .2s ease, border-color 0.2s ease; display: flex; align-items: center; justify-content: center; } #bmToggleImg.active { background: #8A2BE2; } #bmToggleText { font-size:0.95em; color:#ccc; user-select:none; }

        /* Countdown (Digitação) */
        .bmCountdownNumber { position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); font-family: 'Segoe UI Black', sans-serif; color: #8A2BE2; font-size: 3em; opacity: 0; animation: countPopZoom 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; z-index: 10; text-shadow: 0 0 10px rgba(138, 43, 226, 0.7); }
        @keyframes countPopZoom { 0% { opacity: 0; transform: translateX(-50%) scale(0.5) rotate(-15deg); } 60% { opacity: 1; transform: translateX(-50%) scale(1.1) rotate(5deg); } 100% { opacity: 0; transform: translateX(-50%) scale(1) rotate(0deg); } }

        /* NOVO: Countdown (Correção Automática) - Centralizado */
        .bmCorrectionCountdownNumber {
            position: fixed; /* Centralizado na tela */
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Segoe UI Black', sans-serif;
            color: #4ecdc4; /* Cor diferente (ciano) */
            font-size: 5em; /* Maior */
            opacity: 0;
            animation: correctionCountPop 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; /* Duração ~1s */
            z-index: 100002; /* Acima de outros overlays */
            text-shadow: 0 0 15px rgba(78, 205, 196, 0.7);
            pointer-events: none; /* Não interfere com cliques */
        }
        @keyframes correctionCountPop {
            0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.6) rotate(10deg); }
            60%  { opacity: 1; transform: translate(-50%, -50%) scale(1.1) rotate(-3deg); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
        }


        /* Overlay Stealth (Mantido) */
        #bmOv { position:fixed;top:0;left:0; width:100%;height:100%; background:rgba(0,0,0,.9); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); display:flex;flex-direction:column; align-items:center;justify-content:center; z-index:100000; opacity: 0; animation: ovFadeInSmooth 0.5s ease-out forwards; } #bmOvContent { opacity: 0; transform: translateY(20px); animation: ovContentSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.3s; text-align: center; } #bmOv img { max-width:60%; max-height:45%; border-radius: 5px; box-shadow: 0 5px 15px rgba(0,0,0,0.4); } #bmOv p { color: #ddd; font-family: 'Segoe UI', sans-serif; text-align: center; margin-top: 20px; max-width: 400px; line-height: 1.5; } #bmOv button { margin-top:25px; padding: 10px 25px; font-size: 1em; background: #8A2BE2; border: none; border-radius: 5px; color: #fff; cursor: pointer; transition: background 0.2s ease, transform 0.15s ease; font-weight: bold; width: auto; } #bmOv button:hover { background:#7022b6; transform:scale(1.05); } #bmOv button:active { transform: scale(0.98); } @keyframes ovFadeInSmooth { from{opacity:0} to{opacity:1} } @keyframes ovContentSlideUp { from{opacity:0; transform: translateY(20px);} to{opacity:1; transform: translateY(0);} }
        #bmWrapper.stealth-mode { background: #f0f0f0; border-color: #ccc; color: #333; animation: none; /* Desativa gradiente no modo stealth */ } #bmWrapper.stealth-mode #bmHeader { background: #dcdcdc; border-color: #ccc; color: #333; } #bmWrapper.stealth-mode #bmContent { background: #e9e9e9; } #bmWrapper.stealth-mode textarea, #bmWrapper.stealth-mode input[type="number"] { background: #fff; border-color: #bbb; color: #222; } #bmWrapper.stealth-mode textarea:focus, #bmWrapper.stealth-mode input[type="number"]:focus { border-color: #666; box-shadow: 0 0 0 3px rgba(100, 100, 100, 0.2); } #bmWrapper.stealth-mode button { border-color: #888; color: #444; background: #e0e0e0; } #bmWrapper.stealth-mode button:disabled { border-color: #ccc; color: #999; background: #f0f0f0; } #bmWrapper.stealth-mode button:not(:disabled):hover { background: #ccc; color: #111; border-color: #777; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15); } #bmWrapper.stealth-mode button:not(:disabled):active { background: #bbb; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); } #bmWrapper.stealth-mode #bmToggleWrapper:hover { background-color: rgba(0, 0, 0, 0.05); } #bmWrapper.stealth-mode #bmToggleImg { border-color: #999; } #bmWrapper.stealth-mode #bmToggleImg.active { background: #777; border-color: #777; } #bmWrapper.stealth-mode #bmToggleText { color: #555; }
    `;
    const styleTag = document.createElement('style'); styleTag.textContent = css; document.head.appendChild(styleTag);

    // --- LÓGICA PRINCIPAL E UI ---
    const splashTimeout = 3800;
    setTimeout(() => {
        if (document.body.contains(splash)) { splash.remove(); }

        const wrapper = document.createElement('div'); wrapper.id = 'bmWrapper';
        wrapper.innerHTML = `
            <div id="bmHeader">Paraná Colado V1 - AutoEditor Simulado</div>
            <div id="bmContent">
                <textarea id="bmText" placeholder="Cole o texto aqui..."></textarea>
                <input id="bmDelay" type="number" step="0.001" value="0.001" min="0.001" placeholder="Delay (s)">
                <div id="bmToggleWrapper"> <div id="bmToggleImg"></div> <span id="bmToggleText">Modo Disfarçado</span> </div>
                <button id="bmBtn">Iniciar Digitação</button> <button id="bmBtnCorrect">Corrigir Automaticamente</button>
            </div>
        `;
        document.body.appendChild(wrapper);
        setTimeout(() => wrapper.classList.add('show'), 50);

        // Lógica de arrastar (Mantida)
        const header = document.getElementById('bmHeader'); /* ... código mantido ... */
        let isDragging = false; let dragStartX, dragStartY, initialLeft, initialTop; header.onmousedown = e => { if (e.target !== header) return; isDragging = true; dragStartX = e.clientX; dragStartY = e.clientY; initialLeft = wrapper.offsetLeft; initialTop = wrapper.offsetTop; header.style.cursor = 'grabbing'; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); e.preventDefault(); }; function onMouseMove(e) { if (!isDragging) return; const dx = e.clientX - dragStartX; const dy = e.clientY - dragStartY; wrapper.style.left = initialLeft + dx + 'px'; wrapper.style.top = initialTop + dy + 'px'; } function onMouseUp() { if (isDragging) { isDragging = false; header.style.cursor = 'move'; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); } }

        // Lógica “Modo Disfarçado” (Mantida)
        const toggleWrapper = document.getElementById('bmToggleWrapper'); const toggleBox = document.getElementById('bmToggleImg'); /* ... código mantido ... */
        let stealthOn = false; let firstTimeStealth = true; let rect = null; function handleStealthMouseMove(ev) { if (!ev || typeof ev.clientX === 'undefined' || typeof ev.clientY === 'undefined') { return; } if (!stealthOn || !wrapper || !document.body.contains(wrapper)) { exitStealth(); return; } if (!rect) { rect = wrapper.getBoundingClientRect(); if (!rect || rect.width === 0 || rect.height === 0) return; } const mouseX = ev.clientX; const mouseY = ev.clientY; const isInside = (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom); if (isInside) { if (wrapper.style.opacity === '0') { wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; } } else { if (wrapper.style.opacity !== '0') { rect = wrapper.getBoundingClientRect(); if (rect && rect.width > 0 && rect.height > 0) { wrapper.style.opacity = 0; wrapper.style.pointerEvents = 'none'; } } } } function enterStealth() { if (!wrapper || !document.body.contains(wrapper)) return; stealthOn = true; wrapper.classList.add('stealth-mode'); toggleBox.classList.add('active'); wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; rect = wrapper.getBoundingClientRect(); if (!rect || rect.width === 0 || rect.height === 0) { stealthOn = false; wrapper.classList.remove('stealth-mode'); toggleBox.classList.remove('active'); showCustomAlert("Erro Modo Disfarçado.", "error"); return; } document.addEventListener('mousemove', handleStealthMouseMove); wrapper.style.opacity = 0; wrapper.style.pointerEvents = 'none'; } function exitStealth() { stealthOn = false; document.removeEventListener('mousemove', handleStealthMouseMove); if (wrapper && document.body.contains(wrapper)) { wrapper.classList.remove('stealth-mode'); toggleBox.classList.remove('active'); wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; } rect = null; } function showStealthOverlay() { const ov = document.createElement('div'); ov.id = 'bmOv'; ov.innerHTML = `<div id="bmOvContent"><img src="https://i.imgur.com/RquEok4.gif" alt="Demo"/> <p>O Modo Disfarçado oculta...</p> <button id="bmOvBtn">Entendido</button></div>`; document.body.appendChild(ov); document.getElementById('bmOvBtn').onclick = () => { ov.style.opacity = 0; setTimeout(() => { if (document.body.contains(ov)){ ov.remove(); } }, 500); enterStealth(); }; } toggleWrapper.onclick = () => { if (!stealthOn) { if (firstTimeStealth) { firstTimeStealth = false; showStealthOverlay(); } else { enterStealth(); } } else { exitStealth(); } };

        // Lógica Botão "Iniciar Digitação" (Rápido, sem indicador)
        const startButton = document.getElementById('bmBtn');
        const correctButton = document.getElementById('bmBtnCorrect');
        startButton.onclick = async function() { /* ... código mantido (rápido e sem indicador) ... */
            const text = document.getElementById('bmText').value; const delayInput = parseFloat(document.getElementById('bmDelay').value); const delay = (!isNaN(delayInput) && delayInput * 1000 >= MIN_DELAY) ? delayInput * 1000 : MIN_DELAY; if (!text) { showCustomAlert('Texto vazio!', 'error'); return; } if (!activeEl || !document.body.contains(activeEl)) { showCustomAlert('Clique no campo alvo antes!', 'error'); return; } this.disabled = true; if (correctButton) correctButton.disabled = true;
            for (let n = 3; n >= 1; n--) { const cnt = document.createElement('div'); cnt.className = 'bmCountdownNumber'; cnt.textContent = n; wrapper.appendChild(cnt); await new Promise(r => setTimeout(r, 700)); if (wrapper.contains(cnt)) wrapper.removeChild(cnt); await new Promise(r => setTimeout(r, 100)); } let typingCompleted = true;
            try { activeEl.focus(); for (let i = 0; i < text.length; i++) { const char = text[i]; const success = sendChar(char); if (!success) { typingCompleted = false; break; } if (delay > 0) await new Promise(r => setTimeout(r, delay)); } if (typingCompleted) { showCustomAlert('Digitação concluída!', 'success'); } else { showCustomAlert('Digitação interrompida por erro.', 'error'); } } catch (error) { console.error("Erro na digitação:", error); showCustomAlert("Erro durante digitação.", 'error'); } finally { this.disabled = false; if (correctButton) correctButton.disabled = false; }
        };


        // --- LÓGICA CORREÇÃO AUTOMÁTICA (MODIFICADA final) ---
        correctButton.onclick = async function() {
            const btnCorrect = this;
            btnCorrect.disabled = true; if (startButton) startButton.disabled = true;
            console.log('Iniciando correção automática...');

            const waitDelay = MIN_DELAY * 5; // Pausa mínima entre passos

            // --- Verifica se botão "Concluir" existe PRIMEIRO ---
            let concludeButtonExists = false;
            try {
                const concludeButtons = document.querySelectorAll('button');
                for (const btn of concludeButtons) {
                    if (btn.textContent.trim() === "Concluir") {
                        concludeButtonExists = true;
                        console.log("Botão 'Concluir' encontrado. Pulando etapa 'CORRIGIR ONLINE'.");
                        break;
                    }
                }
            } catch (e) { console.error("Erro ao procurar botão 'Concluir':", e); }
            // --- Fim da verificação "Concluir" ---


            // --- Lógica Condicional: "CORRIGIR ONLINE" e Espera ---
            if (!concludeButtonExists) {
                console.log("Botão 'Concluir' não encontrado. Tentando fluxo 'CORRIGIR ONLINE'.");
                try {
                    const buttons = document.querySelectorAll('button');
                    let foundCorrectorButton = null;
                    for (const button of buttons) {
                        if (button.textContent.trim() === "CORRIGIR ONLINE") {
                            foundCorrectorButton = button;
                            break;
                        }
                    }

                    if (foundCorrectorButton) {
                        console.log("Botão 'CORRIGIR ONLINE' encontrado.");
                        foundCorrectorButton.click();
                        console.log("Clicou em 'CORRIGIR ONLINE'. Esperando 'PROCESSANDO' desaparecer...");

                        const processingSelector = 'div.sc-kAyceB.kEYIQb'; // Seletor específico
                        await waitForElementToDisappear(processingSelector, 30000); // Timeout 30s
                        console.log("'PROCESSANDO' desapareceu.");

                        // --- Countdown de 3 segundos ANTES de corrigir spans ---
                        console.log("Iniciando contagem regressiva de 3 segundos...");
                        for (let n = 3; n >= 1; n--) {
                            const cnt = document.createElement('div');
                            cnt.className = 'bmCorrectionCountdownNumber'; // Classe para estilo centralizado
                            cnt.textContent = n;
                            document.body.appendChild(cnt); // Adiciona ao body para ser fixo
                            await new Promise(r => setTimeout(r, 950)); // Duração de cada número (total ~3s)
                            if (document.body.contains(cnt)) document.body.removeChild(cnt);
                        }
                        console.log("Contagem finalizada. Iniciando correção dos spans...");
                        // --- Fim do Countdown ---

                    } else {
                        console.log("Botão 'CORRIGIR ONLINE' não encontrado. Prosseguindo diretamente para correção dos spans.");
                        // Não precisa de countdown aqui se o botão não foi achado/clicado
                    }
                } catch (error) {
                    if (error.message.includes('Timeout')) { showCustomAlert("Timeout esperando 'PROCESSANDO' desaparecer.", 'error'); }
                    else { console.error("Erro inesperado ao processar 'CORRIGIR ONLINE':", error); showCustomAlert("Erro ao tentar clicar/esperar 'CORRIGIR ONLINE'.", 'error'); }
                    btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return; // Para aqui
                }
            }
            // --- Fim da Lógica Condicional ---


            // --- Lógica de Correção dos Spans (Acelerada) ---
             let targetTextarea; // Precisa ser definida *antes* do loop de correção
            try {
                targetTextarea = await waitForElement('textarea[id*="multiline"][class*="jss"]', 2000); // Tenta pegar rápido
            } catch (error) { showCustomAlert('ERRO: Textarea principal não encontrada para correção!', 'error'); btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return; }
            console.log('Textarea principal encontrada para correção dos spans.');
            activeEl = targetTextarea; // Define como alvo

            console.log("Procurando spans de erro para correção...");
            const errorSpans = document.querySelectorAll('div.jss24 p.MuiTypography-root.jss23 div[style*="white-space: break-spaces"] > span'); // Seletor mantido
            if (errorSpans.length === 0) {
                showCustomAlert(concludeButtonExists ? 'Nenhum erro (span) encontrado.' : 'Correção online processada. Nenhum erro (span) encontrado.', 'info');
                btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return;
            }
            console.log(`Encontrados ${errorSpans.length} spans de erro.`); let correctedCount = 0; let errorCount = 0;

            for (const errorSpan of errorSpans) {
                 if (btnCorrect.disabled === false) { console.log("Correção interrompida."); break; }
                 if (!document.body.contains(errorSpan) || errorSpan.offsetParent === null) { continue; }
                try {
                    const errorText = errorSpan.textContent.trim(); if (!errorText) continue;
                    const currentTextValue = targetTextarea.value; const errorIndex = currentTextValue.indexOf(errorText); if (errorIndex === -1) { continue; }

                    errorSpan.click();
                    await new Promise(r => setTimeout(r, waitDelay));

                    let suggestionList;
                    try { suggestionList = await waitForElement('ul#menu-list-grow', 1000); }
                    catch (e) { errorCount++; document.body.click(); await new Promise(r => setTimeout(r, waitDelay)); continue; }

                    const suggestionItems = suggestionList.querySelectorAll('li');
                    const validSuggestions = Array.from(suggestionItems).slice(1).map(li => li.textContent.trim()).filter(text => text.length > 0);

                    if (validSuggestions.length > 0) {
                        const chosenSuggestion = validSuggestions[0];
                        targetTextarea.focus(); targetTextarea.selectionStart = errorIndex; targetTextarea.selectionEnd = errorIndex + errorText.length;
                        await new Promise(r => setTimeout(r, waitDelay));

                        activeEl = targetTextarea; await simulateBackspace(targetTextarea);
                        await new Promise(r => setTimeout(r, waitDelay));

                        activeEl = targetTextarea;
                        for (const char of chosenSuggestion) { if (btnCorrect.disabled === false) break; sendChar(char); if(MIN_DELAY > 0) await new Promise(r => setTimeout(r, MIN_DELAY)); } // Usa MIN_DELAY aqui
                        if (btnCorrect.disabled === false) break;
                        correctedCount++;
                    } else { errorCount++; }

                    document.body.click();
                    await new Promise(r => setTimeout(r, waitDelay * 2));

                } catch (error) { console.error(`Erro processando span "${errorSpan?.textContent?.trim()}":`, error); errorCount++; try { document.body.click(); } catch(e){} await new Promise(r => setTimeout(r, waitDelay)); }
                 await new Promise(r => setTimeout(r, waitDelay));
            } // Fim loop for

            btnCorrect.disabled = false; if (startButton) startButton.disabled = false;
            console.log('Correção concluída.');
            let finalMessage = `Correção finalizada: ${correctedCount} erros processados.`; if (errorCount > 0) { finalMessage += ` ${errorCount} erros não corrigidos.`; }
            showCustomAlert(finalMessage, errorCount > 0 ? 'info' : 'success');
        }; // Fim onclick correctButton

    }, splashTimeout); // Fim do setTimeout principal

})(); // Fim da IIFE
