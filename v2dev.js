(function() {
    // evita duplo carregamento
    if (document.getElementById('bmSplash')) return;

    // --- Constantes de Delay ---
    const MIN_DELAY = 1; // ms (Para digitação/backspace)
    const SCROLL_DELAY = 500; // ms (Scroll suave)
    const STEP_DELAY = 30;  // ms (Pausa MÍNIMA entre passos lógicos, bem rápido)
    const POST_EDIT_SCROLL_DELAY = 50; // ms (Pausa curta após re-scroll pós edição)

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
    let activeEl = null; document.addEventListener('mousedown', e => { activeEl = e.target; }, true);

    // --- FUNÇÕES DE SIMULAÇÃO DE TECLADO (Aceleradas) ---
    function dispatchKeyEvent(target, eventType, key, keyCode, charCode = 0) { /* ... código mantido ... */
        let effectiveCharCode = charCode; if (!effectiveCharCode && key && key.length === 1) { effectiveCharCode = key.charCodeAt(0); } const event = new KeyboardEvent(eventType, { key: key, code: `Key${key.toUpperCase()}`, keyCode: keyCode, which: keyCode, charCode: eventType === 'keypress' ? effectiveCharCode : 0, bubbles: true, cancelable: true }); target.dispatchEvent(event);
    }
    async function simulateBackspace(targetElement) { /* ... código mantido com MIN_DELAY e preventScroll ... */
        if (!targetElement) return; activeEl = targetElement; targetElement.focus({ preventScroll: true }); const start = targetElement.selectionStart; const end = targetElement.selectionEnd; dispatchKeyEvent(targetElement, 'keydown', 'Backspace', 8); if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) { const currentValue = targetElement.value; let newValue = currentValue; let newCursorPos = start; if (start === end && start > 0) { newValue = currentValue.substring(0, start - 1) + currentValue.substring(end); newCursorPos = start - 1; } else if (start !== end) { newValue = currentValue.substring(0, start) + currentValue.substring(end); newCursorPos = start; } if (newValue !== currentValue) { const prototype = Object.getPrototypeOf(targetElement); const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value'); if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); } else { targetElement.value = newValue; } targetElement.selectionStart = targetElement.selectionEnd = newCursorPos; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } } else if (targetElement.isContentEditable) { document.execCommand('delete', false, null); } dispatchKeyEvent(targetElement, 'keyup', 'Backspace', 8); await new Promise(r => setTimeout(r, MIN_DELAY));
    }
    function sendChar(c) { /* ... código mantido e rápido com preventScroll ... */
        if (!activeEl || !document.body.contains(activeEl)) { return false; } const targetElement = activeEl; targetElement.focus({ preventScroll: true }); const keyCode = c.charCodeAt(0); dispatchKeyEvent(targetElement, 'keydown', c, keyCode); dispatchKeyEvent(targetElement, 'keypress', c, keyCode, keyCode); if (targetElement.isContentEditable) { document.execCommand('insertText', false, c); } else if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') { const start = targetElement.selectionStart; const end = targetElement.selectionEnd; const currentValue = targetElement.value; const newValue = currentValue.substring(0, start) + c + currentValue.substring(end); const prototype = Object.getPrototypeOf(targetElement); const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value'); if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); } else { targetElement.value = newValue; } targetElement.selectionStart = targetElement.selectionEnd = start + c.length; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } dispatchKeyEvent(targetElement, 'keyup', c, keyCode); return true;
    }

    // --- SPLASH INICIAL (Super Animado V2) ---
    const splash = document.createElement('div'); splash.id = 'bmSplash';
    splash.innerHTML = `
        <div id="bmSplashContent">
             <img id="bmSplashImg" src="https://i.imgur.com/RUWcJ6e.png"/>
             <div id="bmSplashTextContainer">
                 <div id="bmSplashTitle">Paraná Tools</div>
                 <div id="bmSplashSubtitle">Iniciando Interface...</div>
             </div>
             <div id="bmLoadingBar"><div id="bmLoadingProgress"></div></div>
        </div>
        <div id="bmSplashBgEffect"></div>
    `;
    document.body.appendChild(splash);

    // --- CSS INJETADO (Animações Refinadas V2 + Correções) ---
    const css = `
        /* --- Splash Screen Super Animado V2 --- */
        #bmSplashBgEffect { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 1; background: radial-gradient(circle, #181028 0%, #05020a 75%); opacity: 0; animation: bgFadeInPulse 5s ease-out forwards; }
        @keyframes bgFadeInPulse { 0% { opacity: 0; } 60% { opacity: 1; } 100% { opacity: 0.95; } }

        #bmSplash { /* ... mantido ... */ position: fixed; top:0; left:0; width:100%; height:100%; background:#000; display:flex; align-items:center; justify-content:center; z-index:99999; overflow:hidden; animation: splashFadeOut 0.7s cubic-bezier(0.6, 0.04, 0.98, 0.335) forwards 4.8s; } /* Duração total 5.5s */
        #bmSplashContent { z-index: 2; display:flex; flex-direction:column; align-items:center; justify-content:center; }

        #bmSplashImg {
            width:180px; margin-bottom: 25px;
            filter: drop-shadow(0 6px 25px rgba(160, 86, 247, 0.6));
            opacity: 0;
            /* Fase 1: Entrada com giro e pulso */
            animation: logoEntryV2 1.6s cubic-bezier(0.68, -0.6, 0.32, 1.6) forwards 0.4s,
                       /* Fase 2: Movimento para cima */
                       logoMoveUpV2 0.8s ease-out forwards 2.8s;
        }
        @keyframes logoEntryV2 {
            0% { opacity: 0; transform: scale(0.3) rotate(-180deg) translateY(50px); }
            60% { opacity: 1; transform: scale(1.1) rotate(15deg) translateY(0); }
            80% { transform: scale(0.95) rotate(-5deg); }
            100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
         @keyframes logoMoveUpV2 {
            to { transform: scale(0.85) translateY(-50px); filter: drop-shadow(0 3px 15px rgba(160, 86, 247, 0.5)); }
        }

        #bmSplashTextContainer { opacity: 0; transform: translateY(30px); animation: textContainerAppear 1s ease-out forwards 3.0s; }
        #bmSplashTitle, #bmSplashSubtitle { font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#fff; text-shadow: 0 0 10px rgba(255, 255, 255, 0.6); }
        #bmSplashTitle { font-size: 2.8em; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px; color: #f0f0f0; }
        #bmSplashSubtitle { font-size: 1.4em; font-weight: 300; color: #d0c0ff; }
        @keyframes textContainerAppear { to { opacity: 1; transform: translateY(0); } }

        #bmLoadingBar { width: 250px; height: 8px; background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; margin-top: 40px; overflow: hidden; opacity: 0; transform: scaleX(0); animation: barScaleIn 0.6s ease-out forwards 3.8s; }
        #bmLoadingProgress { width: 0%; height: 100%; background: linear-gradient(90deg, #a056f7, #d8baff); border-radius: 4px; animation: loadingAnimV2 1s cubic-bezier(0.65, 0.05, 0.36, 1) forwards 4.0s; }
        @keyframes barScaleIn { to { opacity: 1; transform: scaleX(1); } }
        @keyframes loadingAnimV2 { from { width: 0%; } to { width: 100%; } }
        @keyframes splashFadeOut { from { opacity: 1; } to { opacity: 0; visibility: hidden; } }

        /* Alertas */ #bmAlertOverlay { /* ... mantido ... */ position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100001; opacity: 0; transition: opacity 0.3s ease-out; pointer-events: none;} #bmAlertOverlay:has(#bmAlertBox.bmAlertPopIn) { pointer-events: auto; } #bmAlertBox { background: #1e1e1e; color: #fff; padding: 25px 30px; border-radius: 8px; border: 1px solid #333; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5); min-width: 300px; max-width: 450px; text-align: center; font-family: 'Segoe UI', sans-serif; transform: scale(0.9); opacity: 0; } #bmAlertBox.bmAlertPopIn { animation: alertPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; } #bmAlertBox.bmAlertFadeOut { animation: alertFadeOut 0.3s ease-out forwards; } #bmAlertMessage { font-size: 1.1em; line-height: 1.5; margin: 0 0 20px 0; } #bmAlertCloseBtn { padding: 10px 25px; font-size: 1em; background: #8A2BE2; border: none; border-radius: 5px; color: #fff; cursor: pointer; transition: background 0.2s ease, transform 0.15s ease; font-weight: bold; } #bmAlertCloseBtn:hover { background: #7022b6; transform: scale(1.05); } #bmAlertCloseBtn:active { transform: scale(0.98); } @keyframes alertPopIn { from { opacity: 0; transform: scale(0.8) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } } @keyframes alertFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }

        /* Wrapper e UI Principal (Mais Lindo V2) */
        #bmWrapper { /* ... adicionado blur ao fundo, easing diferente ... */
            position:fixed; top:20px; right:20px; width:340px; /* Pouco mais largo */
            border:1px solid #303030; border-radius:12px; /* Mais redondo */
            box-shadow:0 10px 30px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,0.05) inset; /* Sombra + borda interna sutil */
            font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#e0e0e0;
            opacity:0; transform: perspective(1000px) translateX(50px) rotateY(-5deg) scale(0.9);
            transition:opacity 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), height 0.35s ease-out;
            z-index:99998; overflow: hidden;
            background: rgba(30, 30, 35, 0.85); /* Fundo mais escuro e translúcido */
            backdrop-filter: blur(12px) saturate(120%); -webkit-backdrop-filter: blur(12px) saturate(120%);
        }
        #bmWrapper.show { opacity:1; transform: perspective(1000px) translateX(0) rotateY(0deg) scale(1); }
        #bmHeader { cursor:move; padding:12px 18px; background: rgba(15, 15, 18, 0.7); /* Header mais escuro */ border-bottom:1px solid #3a3a3a; font-size:1.05em; font-weight: 600; text-align:center; border-radius:12px 12px 0 0; user-select: none; position: relative; display: flex; align-items: center; justify-content: center; }
        #bmHeader span:not(#bmMinimizeBtn) { flex-grow: 1; text-align: center; color: #f5f5f5; }
        #bmMinimizeBtn { font-size: 1.6em; font-weight: bold; color: #bbb; cursor: pointer; padding: 0 8px; line-height: 1; transition: color 0.2s ease, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); user-select: none; margin-left: auto; transform: translateY(-1px); }
        #bmMinimizeBtn:hover { color: #fff; transform: translateY(-1px) scale(1.15) rotate(10deg); }
        #bmContent { padding: 20px; background:transparent; /* Usa o fundo do wrapper */ border-radius: 0 0 12px 12px; transition: opacity 0.3s ease-out, padding 0.3s ease-out, max-height 0.35s ease-out; max-height: 700px; overflow: hidden; }
        #bmWrapper.minimized { /* ... mantido ... */ height: auto !important; } #bmWrapper.minimized #bmContent { opacity: 0; padding-top: 0; padding-bottom: 0; max-height: 0; border-width: 0; } #bmWrapper.minimized #bmHeader { border-bottom: none; border-radius: 12px; }
        #bmContent textarea, #bmContent input[type="number"] { width:100%; margin-bottom:15px; padding:12px; font-size:1em; font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; background:rgba(10, 10, 12, 0.7); border:1px solid #484848; border-radius:8px; color:#f0f0f0; box-sizing:border-box; resize: vertical; transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease; } #bmContent textarea { min-height: 90px; } #bmContent textarea:focus, #bmContent input[type="number"]:focus { outline:none; border-color: #b37ffc; background-color: rgba(0,0,0,0.5); box-shadow: 0 0 0 4px rgba(179, 127, 252, 0.25), inset 0 1px 2px rgba(0,0,0,0.4); }
        /* Botões V2 */
        #bmContent button { width:100%; padding:12px; margin-top: 12px; font-size:1.05em; font-weight: 600; background: linear-gradient(145deg, #8a2be2, #6a1eae); border: none; border-radius:8px; color: #fff; text-shadow: 0 1px 1px rgba(0,0,0,0.4); cursor:pointer; transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-sizing: border-box; box-shadow: 0 4px 8px rgba(0,0,0,0.4), inset 0 -2px 1px rgba(0,0,0,0.2), inset 0 1px 0px rgba(255,255,255,0.1); } #bmContent button:disabled { cursor: not-allowed; opacity: 0.4; background: #555 !important; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3) !important; transform: none !important; color: #999; } #bmContent button:not(:disabled):hover { filter: brightness(1.2); transform: translateY(-3px) scale(1.02); box-shadow: 0 7px 14px rgba(138, 43, 226, 0.4), inset 0 -1px 1px rgba(0,0,0,0.1), inset 0 1px 0px rgba(255,255,255,0.15); } #bmContent button:not(:disabled):active { transform: translateY(-1px) scale(0.99); filter: brightness(0.9); box-shadow: 0 2px 5px rgba(138, 43, 226, 0.3), inset 0 1px 2px rgba(0,0,0,0.3); }
        /* Toggles V2 */
        #bmToggleWrapper, #bmDarkModeToggleWrapper { display:flex; align-items:center; gap:12px; margin-bottom:15px; cursor: pointer; padding: 8px 10px; border-radius: 8px; transition: background-color 0.25s ease; } #bmToggleWrapper:hover, #bmDarkModeToggleWrapper:hover { background-color: rgba(255, 255, 255, 0.08); } #bmToggleImg, #bmDarkModeToggleImg { width:18px; height:18px; border:2px solid #8A2BE2; border-radius:5px; background:transparent; transition:background .25s ease, border-color 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; } #bmToggleImg.active, #bmDarkModeToggleImg.active { background: #8A2BE2; border-color: #a056f7; transform: scale(0.85) rotate(15deg); box-shadow: 0 0 5px rgba(160, 86, 247, 0.5); } #bmToggleText, #bmDarkModeToggleText { font-size:1em; color:#e0e0e0; user-select:none; line-height: 1.2; }
        /* Countdowns */ .bmCountdownNumber { /* ... mantido ... */ } @keyframes countPopZoom { /* ... mantido ... */ } .bmCorrectionCountdownNumber { /* ... mantido ... */ } @keyframes correctionCountPop { /* ... mantido ... */ }
        /* Overlay Stealth */ #bmOv { /* ... mantido ... */ } #bmOvContent { /* ... mantido ... */ } #bmOv img { /* ... mantido ... */ } #bmOv p { /* ... mantido ... */ } #bmOv button { /* ... mantido ... */ } @keyframes ovFadeInSmooth { /* ... mantido ... */ } @keyframes ovContentSlideUp { /* ... mantido ... */ }
        /* Stealth Mode Claro */ #bmWrapper.stealth-mode { /* ... mantido ... */ } #bmWrapper.stealth-mode #bmHeader { /* ... mantido ... */ } /* etc... (todos os estilos .stealth-mode mantidos) */

        /* === ESTILOS DARK MODE PÁGINA === */
        body.bm-dark-mode { /* ... Definições mantidas ... */ --blue-light: #58a6ff; --green: #347d39; --white: #1c1c1c; --blue-dark: #c9d1d9; background-color: var(--white) !important; color: var(--blue-dark) !important; } body.bm-dark-mode ::selection { background-color: var(--blue-light); color: #111; } body.bm-dark-mode section#main, body.bm-dark-mode main { background-color: var(--white) !important; } body.bm-dark-mode nav.sc-gEvEer { background-color: #151a21 !important; border-bottom: 1px solid #333; } body.bm-dark-mode nav.sc-eqUAAy span.bar { background-color: var(--blue-dark) !important; } body.bm-dark-mode .jss1, body.bm-dark-mode .jss3, body.bm-dark-mode .jss5, body.bm-dark-mode .jss6, body.bm-dark-mode .jss10, body.bm-dark-mode .jss15, body.bm-dark-mode .jss16, body.bm-dark-mode .jss17, body.bm-dark-mode .jss19, body.bm-dark-mode .jss20, body.bm-dark-mode .jss21, body.bm-dark-mode .jss23, body.bm-dark-mode .jss24, body.bm-dark-mode .jss26, body.bm-dark-mode .jss27, body.bm-dark-mode .jss30, body.bm-dark-mode .jss31, body.bm-dark-mode .jss33, body.bm-dark-mode .jss34, body.bm-dark-mode .jss35, body.bm-dark-mode .jss37, body.bm-dark-mode .jss38, body.bm-dark-mode .jss40, body.bm-dark-mode .jss41, body.bm-dark-mode .jss42, body.bm-dark-mode .jss43, body.bm-dark-mode .jss45, body.bm-dark-mode .jss46, body.bm-dark-mode .jss47, body.bm-dark-mode .jss48, body.bm-dark-mode .jss51, body.bm-dark-mode .jss52, body.bm-dark-mode .jss53, body.bm-dark-mode .jss54, body.bm-dark-mode .jss55, body.bm-dark-mode .jss56, body.bm-dark-mode .jss57, body.bm-dark-mode .jss59, body.bm-dark-mode .jss60, body.bm-dark-mode div[style*="background-color: white"], body.bm-dark-mode div[style*="background-color: var(--white)"] { background-color: #22272e !important; color: var(--blue-dark) !important; border-color: #444 !important; }
        body.bm-dark-mode p, body.bm-dark-mode h3, body.bm-dark-mode h4, body.bm-dark-mode h5, body.bm-dark-mode h6, body.bm-dark-mode label, body.bm-dark-mode div[variant="subtitle1"], body.bm-dark-mode span:not([style*="background-color"]):not(#bmMinimizeBtn), body.bm-dark-mode .MuiTypography-root:not(.jss46 p):not(.jss56):not(.jss60 p), body.bm-dark-mode .ql-editor { color: var(--blue-dark) !important; } body.bm-dark-mode h3[style*="color: var(--blue-light)"], body.bm-dark-mode h6[style*="color: var(--blue-light)"] { color: var(--blue-light) !important; } body.bm-dark-mode textarea.jss17, body.bm-dark-mode textarea.jss31, body.bm-dark-mode textarea#outlined-multiline-static { background-color: #181c21 !important; color: #c9d1d9 !important; border: 1px solid #444 !important; caret-color: #eee; } body.bm-dark-mode textarea.jss17:focus, body.bm-dark-mode textarea.jss31:focus, body.bm-dark-mode textarea#outlined-multiline-static:focus { border-color: var(--blue-light) !important; box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.3) !important; } body.bm-dark-mode .jss19 input.MuiInputBase-input, body.bm-dark-mode .jss33 input.MuiInputBase-input { background-color: transparent !important; color: #c9d1d9 !important; border: none !important; } body.bm-dark-mode .jss19 .MuiOutlinedInput-notchedOutline, body.bm-dark-mode .jss33 .MuiOutlinedInput-notchedOutline { border-color: #444 !important; } body.bm-dark-mode .jss19 .Mui-focused .MuiOutlinedInput-notchedOutline, body.bm-dark-mode .jss33 .Mui-focused .MuiOutlinedInput-notchedOutline { border-color: var(--blue-light) !important; box-shadow: 0 0 0 1px rgba(88, 166, 255, 0.3) !important; } body.bm-dark-mode button { transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, filter 0.2s ease !important; } body.bm-dark-mode button[style*="background: white"] { background: #333a45 !important; color: var(--blue-light) !important; border-color: #555 !important; } body.bm-dark-mode button[style*="background: white"]:hover { background: #444c56 !important; border-color: var(--blue-light) !important; } body.bm-dark-mode button[style*="background: var(--green)"] { background: var(--green) !important; color: #fff !important; border-width: 0px !important; } body.bm-dark-mode button[style*="background: var(--green)"]:hover { filter: brightness(1.15); } body.bm-dark-mode button[style*="background: var(--blue-light)"] { background: var(--blue-light) !important; color: #111 !important; } body.bm-dark-mode button.jss21, body.bm-dark-mode button.jss35 { background-color: transparent !important; color: var(--blue-light) !important; border: 1px solid var(--blue-light) !important; } body.bm-dark-mode button.jss21:hover, body.bm-dark-mode button.jss35:hover { background-color: rgba(88, 166, 255, 0.1) !important; } body.bm-dark-mode button.jss26, body.bm-dark-mode button.jss40 { background-color: #333a45 !important; color: #c9d1d9 !important; border: 1px solid #555 !important; } body.bm-dark-mode button.jss26:hover, body.bm-dark-mode button.jss40:hover { background-color: #444c56 !important; } body.bm-dark-mode button:disabled { background-color: #333 !important; color: #777 !important; opacity: 0.7 !important; border-color: #555 !important; filter: grayscale(50%); }
        body.bm-dark-mode .MuiPaper-root.MuiAccordion-root { background-color: #282e35 !important; color: var(--blue-dark) !important; } body.bm-dark-mode .MuiAccordionSummary-root { border-bottom: 1px solid #444 !important; } body.bm-dark-mode .MuiAccordionSummary-expandIcon { color: var(--blue-dark) !important; } body.bm-dark-mode .jss42, body.bm-dark-mode .jss56 { color: #56d364 !important; } body.bm-dark-mode span[style*="background-color"][style*="cursor: pointer"] { color: #111 !important; padding: 0.05em 0.1em; border-radius: 2px; text-shadow: none !important; } body.bm-dark-mode span[style*="background-color: rgb(206, 242, 213)"] { background-color: rgba(206, 242, 213, 0.9) !important; } body.bm-dark-mode span[style*="background-color: rgb(225, 182, 252)"] { background-color: rgba(225, 182, 252, 0.9) !important; } body.bm-dark-mode span[style*="background-color: rgb(237, 147, 50)"] { background-color: rgba(237, 147, 50, 0.8) !important; } body.bm-dark-mode span[style*="background-color: rgb(180, 187, 250)"] { background-color: rgba(180, 187, 250, 0.9) !important; } body.bm-dark-mode .jss46 p.MuiTypography-root, body.bm-dark-mode .jss60 p.MuiTypography-root { color: #111 !important; font-weight: 500 !important; } body.bm-dark-mode .jss45, body.bm-dark-mode .jss59 { background-color: #282e35 !important; padding: 5px; border-radius: 4px; } body.bm-dark-mode .jss46, body.bm-dark-mode .jss60 { border: 1px solid rgba(0,0,0,0.2) !important; opacity: 0.9; }
        body.bm-dark-mode .MuiDialog-paper { background-color: #22272e !important; } body.bm-dark-mode .MuiDialogTitle-root h2 { color: #eee !important; } body.bm-dark-mode .MuiDialogContent-root { color: var(--blue-dark) !important; } body.bm-dark-mode div[style*="background-color: var(--blue-light)"][style*="color: var(--white)"] { background-color: #151a21 !important; color: #eee !important; } body.bm-dark-mode ::-webkit-scrollbar { width: 10px; height: 10px; } body.bm-dark-mode ::-webkit-scrollbar-track { background: #282e35; } body.bm-dark-mode ::-webkit-scrollbar-thumb { background: #555; border-radius: 5px; border: 2px solid #282e35; } body.bm-dark-mode ::-webkit-scrollbar-thumb:hover { background: #777; } body.bm-dark-mode div[vw].enabled div[vw-access-button].active { filter: invert(1) hue-rotate(180deg); } body.bm-dark-mode footer #footer1, body.bm-dark-mode footer #footer { background-color: #151a21 !important; color: #aaa !important; } body.bm-dark-mode footer a { color: #77aaff !important; } body.bm-dark-mode footer .blue-line, body.bm-dark-mode footer .green-line { opacity: 0.5; }
    `;
    const styleTag = document.createElement('style'); styleTag.textContent = css; document.head.appendChild(styleTag);

    // --- LÓGICA PRINCIPAL E UI ---
    const splashTimeout = 5500; // Aumenta splash para acomodar animações
    setTimeout(() => {
        if (document.body.contains(splash)) { splash.remove(); }

        const wrapper = document.createElement('div'); wrapper.id = 'bmWrapper';
        wrapper.innerHTML = `
            <div id="bmHeader"> <span>Paraná Colado V1</span> <span id="bmMinimizeBtn" title="Minimizar/Expandir">-</span> </div>
            <div id="bmContent">
                <textarea id="bmText" placeholder="Cole o texto aqui..."></textarea>
                <input id="bmDelay" type="number" step="0.001" value="0.001" min="0.001" placeholder="Delay (s)">
                <div id="bmToggleWrapper"> <div id="bmToggleImg"></div> <span id="bmToggleText">Modo Disfarçado</span> </div>
                <div id="bmDarkModeToggleWrapper"> <div id="bmDarkModeToggleImg"></div> <span id="bmDarkModeToggleText">Modo Escuro Página</span> </div>
                <button id="bmBtn">Iniciar Digitação</button> <button id="bmBtnCorrect">Corrigir Automaticamente</button>
            </div>
        `;
        document.body.appendChild(wrapper);
        const bmContent = document.getElementById('bmContent');
        const bmMinimizeBtn = document.getElementById('bmMinimizeBtn');
        const header = document.getElementById('bmHeader');

        setTimeout(() => wrapper.classList.add('show'), 50); // Trigger entrada animada

        // Lógicas UI (Arrastar, Minimizar, Disfarçado, Dark Mode)
        let isDragging = false; let dragStartX, dragStartY, initialLeft, initialTop; header.onmousedown = e => { if (e.target === bmMinimizeBtn || bmMinimizeBtn.contains(e.target)) return; isDragging = true; dragStartX = e.clientX; dragStartY = e.clientY; initialLeft = wrapper.offsetLeft; initialTop = wrapper.offsetTop; header.style.cursor = 'grabbing'; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); e.preventDefault(); }; function onMouseMove(e) { if (!isDragging) return; const dx = e.clientX - dragStartX; const dy = e.clientY - dragStartY; wrapper.style.left = initialLeft + dx + 'px'; wrapper.style.top = initialTop + dy + 'px'; } function onMouseUp() { if (isDragging) { isDragging = false; header.style.cursor = 'move'; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); } }
        if(bmMinimizeBtn && wrapper){ bmMinimizeBtn.onclick = (e) => { e.stopPropagation(); const isMinimized = wrapper.classList.toggle('minimized'); bmMinimizeBtn.textContent = isMinimized ? '+' : '-'; bmMinimizeBtn.title = isMinimized ? 'Expandir' : 'Minimizar'; if (stealthOn) { setTimeout(() => { rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect(); }, 360); } }; }
        const toggleWrapper = document.getElementById('bmToggleWrapper'); const toggleBox = document.getElementById('bmToggleImg'); let stealthOn = false; let firstTimeStealth = true; let rect = null; function handleStealthMouseMove(ev) { if (!ev || typeof ev.clientX === 'undefined' || typeof ev.clientY === 'undefined') { return; } if (!stealthOn || !wrapper || !document.body.contains(wrapper)) { exitStealth(); return; } if (!rect) { rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect(); if (!rect || rect.width === 0 || rect.height === 0) return; } const mouseX = ev.clientX; const mouseY = ev.clientY; const isInside = (rect && mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom); if (isInside) { if (wrapper.style.opacity === '0') { wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; } } else { if (wrapper.style.opacity !== '0') { rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect(); if (rect && rect.width > 0 && rect.height > 0) { wrapper.style.opacity = 0; wrapper.style.pointerEvents = 'none'; } } } } function enterStealth() { if (!wrapper || !document.body.contains(wrapper)) return; stealthOn = true; wrapper.classList.add('stealth-mode'); toggleBox.classList.add('active'); wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect(); if (!rect || rect.width === 0 || rect.height === 0) { stealthOn = false; wrapper.classList.remove('stealth-mode'); toggleBox.classList.remove('active'); showCustomAlert("Erro Modo Disfarçado.", "error"); return; } document.addEventListener('mousemove', handleStealthMouseMove); wrapper.style.opacity = 0; wrapper.style.pointerEvents = 'none'; } function exitStealth() { stealthOn = false; document.removeEventListener('mousemove', handleStealthMouseMove); if (wrapper && document.body.contains(wrapper)) { wrapper.classList.remove('stealth-mode'); toggleBox.classList.remove('active'); wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; } rect = null; } function showStealthOverlay() { const ov = document.createElement('div'); ov.id = 'bmOv'; ov.innerHTML = `<div id="bmOvContent"><img src="https://i.imgur.com/RquEok4.gif" alt="Demo"/> <p>O Modo Disfarçado oculta...</p> <button id="bmOvBtn">Entendido</button></div>`; document.body.appendChild(ov); document.getElementById('bmOvBtn').onclick = () => { ov.style.opacity = 0; setTimeout(() => { if (document.body.contains(ov)){ ov.remove(); } }, 500); enterStealth(); }; } toggleWrapper.onclick = () => { if (!stealthOn) { if (firstTimeStealth) { firstTimeStealth = false; showStealthOverlay(); } else { enterStealth(); } } else { exitStealth(); } };
        const darkModeToggleWrapper = document.getElementById('bmDarkModeToggleWrapper'); const darkModeToggleBox = document.getElementById('bmDarkModeToggleImg'); let isDarkModeOn = false; darkModeToggleWrapper.onclick = () => { isDarkModeOn = !isDarkModeOn; darkModeToggleBox.classList.toggle('active', isDarkModeOn); document.body.classList.toggle('bm-dark-mode', isDarkModeOn); console.log("Dark Mode:", isDarkModeOn ? "ON" : "OFF"); };

        // Lógica Botão "Iniciar Digitação"
        const startButton = document.getElementById('bmBtn'); const correctButton = document.getElementById('bmBtnCorrect');
        startButton.onclick = async function() { /* ... código mantido ... */
             const text = document.getElementById('bmText').value; const delayInput = parseFloat(document.getElementById('bmDelay').value); const delay = (!isNaN(delayInput) && delayInput * 1000 >= MIN_DELAY) ? delayInput * 1000 : MIN_DELAY; if (!text) { showCustomAlert('Texto vazio!', 'error'); return; } if (!activeEl || !document.body.contains(activeEl)) { showCustomAlert('Clique no campo alvo antes!', 'error'); return; } this.disabled = true; if (correctButton) correctButton.disabled = true;
             for (let n = 3; n >= 1; n--) { const cnt = document.createElement('div'); cnt.className = 'bmCountdownNumber'; cnt.textContent = n; wrapper.appendChild(cnt); await new Promise(r => setTimeout(r, 700)); if (wrapper.contains(cnt)) wrapper.removeChild(cnt); await new Promise(r => setTimeout(r, 100)); } let typingCompleted = true;
             try { activeEl.focus({ preventScroll: true }); for (let i = 0; i < text.length; i++) { const char = text[i]; const success = sendChar(char); if (!success) { typingCompleted = false; break; } if (delay > 0) await new Promise(r => setTimeout(r, delay)); } if (typingCompleted) { showCustomAlert('Digitação concluída!', 'success'); } else { showCustomAlert('Digitação interrompida por erro.', 'error'); } } catch (error) { console.error("Erro na digitação:", error); showCustomAlert("Erro durante digitação.", 'error'); } finally { this.disabled = false; if (correctButton) correctButton.disabled = false; }
        };

        // --- LÓGICA CORREÇÃO AUTOMÁTICA (Ajuste final scroll com re-scroll pós seleção) ---
        correctButton.onclick = async function() {
            const btnCorrect = this; btnCorrect.disabled = true; if (startButton) startButton.disabled = true; console.log('Iniciando correção automática...'); const waitDelay = STEP_DELAY; let concludeButtonExists = false; try { const allButtons = document.querySelectorAll('button'); for (const btn of allButtons) { if (btn.textContent.trim() === "Concluir") { concludeButtonExists = true; console.log("Botão 'Concluir' encontrado."); break; } } } catch (e) { console.error("Erro ao procurar 'Concluir':", e); } let correctionFlowStarted = false;
            if (!concludeButtonExists) { /* ... Lógica 'CORRIGIR ONLINE' mantida ... */
                 console.log("'Concluir' não encontrado. Verificando 'CORRIGIR ONLINE'."); try { const correctorButtons = document.querySelectorAll('button'); let foundCorrectorButton = null; let foundWaitingButton = null; for (const button of correctorButtons) { const buttonText = button.textContent; if (buttonText && buttonText.includes("CORRIGIR ONLINE")) { if (buttonText.trim() === "CORRIGIR ONLINE") { foundCorrectorButton = button; } else { foundWaitingButton = button; break; } } } if (foundWaitingButton) { console.log("'CORRIGIR ONLINE' em espera."); showCustomAlert("'Corrigir Online' Em processo de espera...", 'info'); btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return; } else if (foundCorrectorButton) { console.log("'CORRIGIR ONLINE' pronto."); foundCorrectorButton.click(); console.log("Clicou. Esperando 'PROCESSANDO' sumir..."); correctionFlowStarted = true; const processingSelector = 'div.sc-kAyceB.kEYIQb'; await waitForElementToDisappear(processingSelector, 30000); console.log("'PROCESSANDO' desapareceu."); console.log("Contagem regressiva 3s..."); for (let n = 3; n >= 1; n--) { const cnt = document.createElement('div'); cnt.className = 'bmCorrectionCountdownNumber'; cnt.textContent = n; document.body.appendChild(cnt); await new Promise(r => setTimeout(r, 950)); if (document.body.contains(cnt)) document.body.removeChild(cnt); } console.log("Contagem finalizada."); } else { console.log("'CORRIGIR ONLINE' não encontrado."); } } catch (error) { if (error.message.includes('Timeout')) { showCustomAlert("Timeout esperando 'PROCESSANDO'.", 'error'); } else { console.error("Erro 'CORRIGIR ONLINE':", error); showCustomAlert("Erro ao processar 'CORRIGIR ONLINE'.", 'error'); } btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return; }
            }
            let targetTextarea; try { targetTextarea = await waitForElement('textarea[id*="multiline"][class*="jss"]', 2000); } catch (error) { showCustomAlert('ERRO: Textarea não encontrada!', 'error'); btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return; } console.log('Textarea encontrada.'); activeEl = targetTextarea; console.log("Procurando spans..."); const errorSpans = document.querySelectorAll('span[style*="background-color: rgb"][style*="cursor: pointer"]'); let correctedCount = 0; let errorCount = 0;
            if (errorSpans.length === 0) { /* ... mensagem inicial mantida ... */ console.log('Nenhum span encontrado.'); if (!correctionFlowStarted && !concludeButtonExists) { showCustomAlert('Nenhum erro (span) encontrado.', 'info'); } else { showCustomAlert('Nenhum erro (span) adicional encontrado.', 'info'); } btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return; } console.log(`Encontrados ${errorSpans.length} spans.`);

            // --- Loop Principal de Correção ---
            for (const errorSpan of errorSpans) {
                 if (btnCorrect.disabled === false) { console.log("Interrompido."); break; }
                 if (!document.body.contains(errorSpan) || errorSpan.offsetParent === null) { continue; }
                try {
                    console.log(`--- Processando: "${errorSpan.textContent.trim()}" ---`);

                    // *** 1. SCROLL SUAVE PARA O ERRO ***
                    console.log(`   Scroll para erro (window: ${window.scrollY.toFixed(0)})`);
                    errorSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    await new Promise(r => setTimeout(r, SCROLL_DELAY));
                    console.log(`   ...Scroll para erro concluído (window: ${window.scrollY.toFixed(0)})`);

                    const errorText = errorSpan.textContent.trim(); if (!errorText) continue;
                    const currentTextValue = targetTextarea.value; const errorIndex = currentTextValue.indexOf(errorText); if (errorIndex === -1) { continue; }

                    errorSpan.click(); await new Promise(r => setTimeout(r, waitDelay));

                    let suggestionList;
                    try { suggestionList = await waitForElement('ul#menu-list-grow', 1000); }
                    catch (e) { errorCount++; document.body.click(); await new Promise(r => setTimeout(r, waitDelay)); continue; }

                    const suggestionItems = suggestionList.querySelectorAll('li');
                    const validSuggestions = Array.from(suggestionItems).slice(1).map(li => li.textContent.trim()).filter(text => text.length > 0);

                    if (validSuggestions.length > 0) {
                        const chosenSuggestion = validSuggestions[0];
                        console.log(`   Sugestão: "${chosenSuggestion}"`);

                        // *** 2. FOCO + SELEÇÃO + RE-SCROLL (NOVA TENTATIVA) ***
                        console.log(`   Focando e selecionando (index: ${errorIndex})`);
                        targetTextarea.focus({ preventScroll: true }); // Tenta evitar scroll inicial
                        await new Promise(r => setTimeout(r, waitDelay)); // Pequena pausa após foco

                        targetTextarea.selectionStart = errorIndex;
                        targetTextarea.selectionEnd = errorIndex + errorText.length;
                        console.log(`   Seleção definida. Scroll atual (win: ${window.scrollY.toFixed(0)}, tarea: ${targetTextarea.scrollTop.toFixed(0)})`);
                        await new Promise(r => setTimeout(r, waitDelay)); // Pequena pausa após seleção

                        // *** RE-SCROLL APÓS SELEÇÃO ***
                        console.log("   Forçando scroll para textarea (center)...");
                        targetTextarea.scrollIntoView({ behavior: 'auto', block: 'center' }); // 'auto' para ser rápido
                        await new Promise(r => setTimeout(r, POST_EDIT_SCROLL_DELAY)); // Pausa curta
                        console.log(`   Scroll forçado (win: ${window.scrollY.toFixed(0)}, tarea: ${targetTextarea.scrollTop.toFixed(0)})`);
                        //************ FIM NOVA TENTATIVA ************

                        // *** 3. EDIÇÃO ***
                        console.log("   Simulando Backspace...");
                        activeEl = targetTextarea; await simulateBackspace(targetTextarea);
                         // *** Re-Scroll Após Backspace ***
                         targetTextarea.scrollIntoView({ behavior: 'auto', block: 'center' });
                         await new Promise(r => setTimeout(r, POST_EDIT_SCROLL_DELAY));

                        await new Promise(r => setTimeout(r, STEP_DELAY)); // Pausa antes de digitar

                        console.log("   Simulando Digitação...");
                        activeEl = targetTextarea;
                        for (const char of chosenSuggestion) { if (btnCorrect.disabled === false) break; sendChar(char); if(MIN_DELAY > 0) await new Promise(r => setTimeout(r, MIN_DELAY)); }
                        if (btnCorrect.disabled === false) break;
                        console.log("   Edição concluída.");

                         // *** Re-Scroll Após Digitação ***
                         targetTextarea.scrollIntoView({ behavior: 'auto', block: 'center' });
                         await new Promise(r => setTimeout(r, POST_EDIT_SCROLL_DELAY));

                        correctedCount++;
                    } else { errorCount++; console.log("   Sem sugestões válidas."); }

                    document.body.click(); await new Promise(r => setTimeout(r, waitDelay * 2));
                } catch (error) { console.error(`Erro span "${errorSpan?.textContent?.trim()}":`, error); errorCount++; try { document.body.click(); } catch(e){} await new Promise(r => setTimeout(r, waitDelay)); }
                 await new Promise(r => setTimeout(r, waitDelay));
            } // Fim loop for

            // --- Mensagem Final Aprimorada ---
            console.log('Correção finalizada.'); if (errorCount > 0) { showCustomAlert("Um ou mais erros não puderam ser corrigidos. Por favor, os corrija manualmente.", 'warning'); } else { if (correctedCount > 0) { showCustomAlert(`Correção finalizada! ${correctedCount} erros processados com sucesso.`, 'success'); } else { showCustomAlert('Nenhum erro necessitou de correção ou todos já estavam corretos.', 'info'); } }

            btnCorrect.disabled = false; if (startButton) startButton.disabled = false;

        }; // Fim onclick correctButton

    }, splashTimeout); // Fim do setTimeout principal

})(); // Fim da IIFE
