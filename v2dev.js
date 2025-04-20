(function() {
    // evita duplo carregamento
    if (document.getElementById('bmSplash')) return;

    // --- Constantes de Delay (Mínimo) ---
    const MIN_DELAY = 1; // ms
    const SCROLL_DELAY = 450; // ms - Aumentar um pouco para scroll mais suave ter tempo

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
    async function simulateBackspace(targetElement) { /* ... código mantido com MIN_DELAY ... */
        if (!targetElement) return; activeEl = targetElement; /* targetElement.focus(); -> Foco movido para antes */ const start = targetElement.selectionStart; const end = targetElement.selectionEnd; dispatchKeyEvent(targetElement, 'keydown', 'Backspace', 8); if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) { const currentValue = targetElement.value; let newValue = currentValue; let newCursorPos = start; if (start === end && start > 0) { newValue = currentValue.substring(0, start - 1) + currentValue.substring(end); newCursorPos = start - 1; } else if (start !== end) { newValue = currentValue.substring(0, start) + currentValue.substring(end); newCursorPos = start; } if (newValue !== currentValue) { const prototype = Object.getPrototypeOf(targetElement); const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value'); if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); } else { targetElement.value = newValue; } targetElement.selectionStart = targetElement.selectionEnd = newCursorPos; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } } else if (targetElement.isContentEditable) { document.execCommand('delete', false, null); } dispatchKeyEvent(targetElement, 'keyup', 'Backspace', 8); await new Promise(r => setTimeout(r, MIN_DELAY));
    }
    function sendChar(c) { /* ... código mantido e rápido ... */
        if (!activeEl || !document.body.contains(activeEl)) { return false; } const targetElement = activeEl; /* targetElement.focus(); -> Foco movido para antes */ const keyCode = c.charCodeAt(0); dispatchKeyEvent(targetElement, 'keydown', c, keyCode); dispatchKeyEvent(targetElement, 'keypress', c, keyCode, keyCode); if (targetElement.isContentEditable) { document.execCommand('insertText', false, c); } else if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') { const start = targetElement.selectionStart; const end = targetElement.selectionEnd; const currentValue = targetElement.value; const newValue = currentValue.substring(0, start) + c + currentValue.substring(end); const prototype = Object.getPrototypeOf(targetElement); const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value'); if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); } else { targetElement.value = newValue; } targetElement.selectionStart = targetElement.selectionEnd = start + c.length; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } dispatchKeyEvent(targetElement, 'keyup', c, keyCode); return true;
    }

    // --- SPLASH INICIAL (Animações Super Lindas!) ---
    const splash = document.createElement('div'); splash.id = 'bmSplash';
    splash.innerHTML = `
        <div id="bmSplashScene"> <img id="bmSplashImg" src="https://i.imgur.com/RUWcJ6e.png"/>
        </div>
        <div id="bmSplashTextContainer">
             <div id="bmSplashTitle">Paraná Tools</div>
             <div id="bmSplashSubtitle">Carregando Ferramentas...</div>
        </div>
        <div id="bmLoadingBar"><div id="bmLoadingProgress"></div></div>
        <div id="bmSplashBgEffect"></div>
    `;
    document.body.appendChild(splash);

    // --- CSS INJETADO (Animações Splash, UI e Correções) ---
    const css = `
        /* === SPLASH LINDÃO === */
        #bmSplash { position: fixed; top:0; left:0; width:100%; height:100%; background:#000; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:99999; overflow:hidden; animation: splashFadeOut 0.7s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards 4.5s; /* Duração total aumentada */ perspective: 800px; /* Para efeito 3D */ }
        #bmSplashBgEffect { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; background: radial-gradient(ellipse at center, rgba(25,0,50,0.5) 0%, rgba(0,0,0,0.9) 70%); opacity: 0; animation: bgPulse 4s ease-in-out infinite alternate, bgFadeIn 1s forwards 0.2s; }
        @keyframes bgPulse { from { transform: scale(1); opacity: 0.5; } to { transform: scale(1.1); opacity: 0.8; } }
        #bmSplashScene { z-index: 3; width: 200px; height: 200px; /* Area para animação 3D */ display: flex; align-items: center; justify-content: center; }
        #bmSplashImg { width:180px; opacity: 0; animation: logoSequence 3.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards 0.5s; filter: drop-shadow(0 5px 20px rgba(138, 43, 226, 0.6)); }
        @keyframes logoSequence {
            0% { opacity: 0; transform: scale(0.5) rotateY(90deg); }
            25% { opacity: 1; transform: scale(1.1) rotateY(0deg) rotateZ(-5deg); } /* Pop com overshoot e rotação */
            40% { transform: scale(1) rotateY(0deg) rotateZ(0deg); } /* Estabiliza */
            60% { transform: scale(0.9) translateZ(-50px); } /* Recua */
            80%, 100% { opacity: 1; transform: scale(1) translateZ(0px) translateY(-40px); } /* Move para cima final */
        }
        #bmSplashTextContainer { z-index: 2; margin-top: -20px; /* Aproxima texto do logo */ opacity: 0; animation: textAppear 1s ease-out forwards 3.2s; /* Aparece depois do logo */ }
        #bmSplashTitle, #bmSplashSubtitle { font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#fff; text-shadow: 0 0 8px rgba(255, 255, 255, 0.6); text-align: center; }
        #bmSplashTitle { font-size: 2.5em; font-weight: bold; letter-spacing: 1px; margin-bottom: 5px; }
        #bmSplashSubtitle { font-size: 1.2em; font-weight: 300; color: #ddd; }
        @keyframes textAppear { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        #bmLoadingBar { z-index: 2; width: 220px; height: 6px; background-color: rgba(255, 255, 255, 0.15); border-radius: 3px; margin-top: 25px; overflow: hidden; opacity: 0; animation: textAppear 1s ease-out forwards 3.5s; position: relative; }
        #bmLoadingProgress { width: 0%; height: 100%; background: linear-gradient(90deg, #8A2BE2, #c27aff); border-radius: 3px; animation: loadingAnim 1s cubic-bezier(0.65, 0.05, 0.36, 1) forwards 3.8s; position: relative; overflow: hidden; }
        /* Efeito de brilho na barra */
        #bmLoadingProgress::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%); animation: loadingShine 1.5s ease-in-out infinite; animation-delay: 3.8s; }
        @keyframes loadingShine { 0% { left: -100%; } 50%, 100% { left: 150%; } }
        @keyframes loadingAnim { from { width: 0%; } to { width: 100%; } }
        @keyframes splashFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }

        /* === Alert e Wrapper Lindões === */
        #bmAlertOverlay { /* ... mantido ... */ } #bmAlertBox { /* ... mantido ... */ } /* ... (keyframes alert mantidos) ... */
        #bmWrapper { /* ... Animação de entrada mais suave ... */
            position:fixed; top:20px; right:20px; width:320px; border:1px solid #333; border-radius:10px; /* Mais redondo */ box-shadow:0 8px 25px rgba(0,0,0,.7); font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#fff; opacity:0; transform:translateX(50px) translateY(-20px) rotateZ(5deg) scale(0.9); transition:opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.3s ease-out; z-index:99998; overflow: hidden; background: linear-gradient(135deg, #232323, #1a1a1a, #232323); /* Fundo mais escuro */ background-size: 200% 200%; animation: subtleGradient 12s ease infinite;
        }
        #bmWrapper.show { opacity:1; transform:translateX(0) translateY(0) rotateZ(0deg) scale(1); }
        #bmHeader { /* ... Efeito vidro fosco ... */
            cursor:move; padding:12px 15px; background: rgba(30, 30, 30, 0.7); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); border-bottom:1px solid #444; font-size:1em; font-weight: bold; text-align:center; border-radius:10px 10px 0 0; user-select: none; position: relative; display: flex; align-items: center; justify-content: center; }
        #bmHeader span:not(#bmMinimizeBtn) { flex-grow: 1; text-align: center; }
        #bmMinimizeBtn { /* ... Botão mais suave ... */ font-size: 1.6em; font-weight: bold; color: #bbb; cursor: pointer; padding: 0 8px; line-height: 1; transition: color 0.2s ease, transform 0.2s ease; user-select: none; margin-left: auto; transform: translateY(-1px); }
        #bmMinimizeBtn:hover { color: #fff; transform: translateY(-1px) scale(1.1); }
        #bmContent { /* ... Efeito vidro fosco ... */ padding:18px; background:rgba(40, 40, 40, 0.7); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); border-radius: 0 0 10px 10px; transition: opacity 0.3s ease-out, padding 0.3s ease-out, max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1); max-height: 600px; overflow: hidden; }
        #bmWrapper.minimized { height: auto !important; } #bmWrapper.minimized #bmContent { opacity: 0; padding-top: 0; padding-bottom: 0; max-height: 0; border-width: 0; } #bmWrapper.minimized #bmHeader { border-bottom: none; border-radius: 10px; }
        /* Inputs e Textarea mais bonitos */
        #bmContent textarea, #bmContent input[type="number"] { background:rgba(20, 20, 20, 0.8); border:1px solid #555; border-radius:6px; color:#f0f0f0; transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease; }
        #bmContent textarea:focus, #bmContent input[type="number"]:focus { background:rgba(10, 10, 10, 0.8); outline:none; border-color:#a040ff; box-shadow:0 0 0 3px rgba(138, 43, 226, 0.5); }
        /* Botões mais bonitos */
        #bmContent button { border-radius:6px; transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Easing mais elastico */ }
        #bmContent button:not(:disabled):hover { background:#8A2BE2; color:#fff; transform:translateY(-3px) scale(1.02); box-shadow: 0 7px 14px rgba(138, 43, 226, 0.4); }
        #bmContent button:not(:disabled):active { transform:translateY(-1px) scale(0.98); box-shadow: 0 3px 6px rgba(138, 43, 226, 0.3); background: #7022b6; border-color: #7022b6; }
        /* Toggles */
        #bmToggleWrapper, #bmDarkModeToggleWrapper { /* ... mantido ... */ } #bmToggleWrapper:hover, #bmDarkModeToggleWrapper:hover { background-color: rgba(255, 255, 255, 0.08); } #bmToggleImg, #bmDarkModeToggleImg { transition:background .2s ease, border-color 0.2s ease, transform 0.2s ease; } #bmToggleImg:hover, #bmDarkModeToggleImg:hover { transform: scale(1.1); } #bmToggleImg.active, #bmDarkModeToggleImg.active { background: #8A2BE2; border-color: #a040ff; } #bmToggleText, #bmDarkModeToggleText { /* ... mantido ... */ }
        /* Countdowns (Mantidos) */
        .bmCountdownNumber { /* ... mantido ... */ } @keyframes countPopZoom { /* ... mantido ... */ }
        .bmCorrectionCountdownNumber { /* ... mantido ... */ } @keyframes correctionCountPop { /* ... mantido ... */ }
        /* Overlay Stealth (Mantido) */
        #bmOv { /* ... mantido ... */ } #bmOvContent { /* ... mantido ... */ } #bmOv img { /* ... mantido ... */ } #bmOv p { /* ... mantido ... */ } #bmOv button { /* ... mantido ... */ } #bmOv button:hover { /* ... mantido ... */ } #bmOv button:active { /* ... mantido ... */ } @keyframes ovFadeInSmooth { /* ... mantido ... */ } @keyframes ovContentSlideUp { /* ... mantido ... */ }
        /* Stealth Mode Claro (Mantido) */
        #bmWrapper.stealth-mode { /* ... mantido ... */ } #bmWrapper.stealth-mode #bmHeader { /* ... mantido ... */ } /* ... (outros estilos stealth mantidos) ... */ #bmWrapper.stealth-mode.minimized #bmHeader { background: #dcdcdc; }

        /* === ESTILOS DARK MODE PÁGINA (Mantido com correção jss60) === */
        body.bm-dark-mode { /* ... Definições mantidas ... */ --blue-light: #58a6ff; --green: #347d39; --white: #1c1c1c; --blue-dark: #c9d1d9; background-color: var(--white) !important; color: var(--blue-dark) !important; }
        body.bm-dark-mode section#main, body.bm-dark-mode main { background-color: var(--white) !important; } body.bm-dark-mode nav.sc-gEvEer { background-color: #151a21 !important; border-bottom: 1px solid #333; } body.bm-dark-mode nav.sc-eqUAAy span.bar { background-color: var(--blue-dark) !important; }
        body.bm-dark-mode .jss1, body.bm-dark-mode .jss3, body.bm-dark-mode .jss5, body.bm-dark-mode .jss6, body.bm-dark-mode .jss15, body.bm-dark-mode .jss17, body.bm-dark-mode .jss19, body.bm-dark-mode .jss20, body.bm-dark-mode .jss24, body.bm-dark-mode .jss30, body.bm-dark-mode .jss33, body.bm-dark-mode .jss38, body.bm-dark-mode .jss41, body.bm-dark-mode .jss51, body.bm-dark-mode .jss52, body.bm-dark-mode .jss53, body.bm-dark-mode .jss54, body.bm-dark-mode .jss55, body.bm-dark-mode .jss59, body.bm-dark-mode .jss45, body.bm-dark-mode div[style*="background-color: white"], body.bm-dark-mode div[style*="background-color: var(--white)"] { background-color: #22272e !important; color: var(--blue-dark) !important; border-color: #444 !important; }
        body.bm-dark-mode p, body.bm-dark-mode h3, body.bm-dark-mode h4, body.bm-dark-mode h5, body.bm-dark-mode h6, body.bm-dark-mode label, body.bm-dark-mode div[variant="subtitle1"], body.bm-dark-mode span:not([style*="background-color"]):not(#bmMinimizeBtn), body.bm-dark-mode .MuiTypography-root:not(.jss46 p):not(.jss56):not(.jss60 p), body.bm-dark-mode .ql-editor { color: var(--blue-dark) !important; }
        body.bm-dark-mode h3[style*="color: var(--blue-light)"], body.bm-dark-mode h6[style*="color: var(--blue-light)"] { color: var(--blue-light) !important; }
        body.bm-dark-mode textarea.jss17, body.bm-dark-mode textarea.jss31, body.bm-dark-mode textarea#outlined-multiline-static { background-color: #181c21 !important; color: #c9d1d9 !important; border: 1px solid #444 !important; caret-color: #eee; } body.bm-dark-mode textarea.jss17:focus, body.bm-dark-mode textarea.jss31:focus, body.bm-dark-mode textarea#outlined-multiline-static:focus { border-color: var(--blue-light) !important; box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.3) !important; }
        body.bm-dark-mode .jss19 input.MuiInputBase-input, body.bm-dark-mode .jss33 input.MuiInputBase-input { background-color: transparent !important; color: #c9d1d9 !important; border: none !important; } body.bm-dark-mode .jss19 .MuiOutlinedInput-notchedOutline, body.bm-dark-mode .jss33 .MuiOutlinedInput-notchedOutline { border-color: #444 !important; } body.bm-dark-mode .jss19 .Mui-focused .MuiOutlinedInput-notchedOutline, body.bm-dark-mode .jss33 .Mui-focused .MuiOutlinedInput-notchedOutline { border-color: var(--blue-light) !important; box-shadow: 0 0 0 1px rgba(88, 166, 255, 0.3) !important; }
        body.bm-dark-mode button { transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease !important; } body.bm-dark-mode button[style*="background: white"] { background: #333a45 !important; color: var(--blue-light) !important; border-color: #555 !important; } body.bm-dark-mode button[style*="background: white"]:hover { background: #444c56 !important; border-color: var(--blue-light) !important; } body.bm-dark-mode button[style*="background: var(--green)"] { background: var(--green) !important; color: #fff !important; border-width: 0px !important; } body.bm-dark-mode button[style*="background: var(--green)"]:hover { filter: brightness(1.1); } body.bm-dark-mode button[style*="background: var(--blue-light)"] { background: var(--blue-light) !important; color: #111 !important; } body.bm-dark-mode button.jss21, body.bm-dark-mode button.jss35 { background-color: transparent !important; color: var(--blue-light) !important; border: 1px solid var(--blue-light) !important; } body.bm-dark-mode button.jss21:hover, body.bm-dark-mode button.jss35:hover { background-color: rgba(88, 166, 255, 0.1) !important; } body.bm-dark-mode button.jss26, body.bm-dark-mode button.jss40 { background-color: #333a45 !important; color: #c9d1d9 !important; border: 1px solid #555 !important; } body.bm-dark-mode button.jss26:hover, body.bm-dark-mode button.jss40:hover { background-color: #444c56 !important; } body.bm-dark-mode button:disabled { background-color: #333 !important; color: #777 !important; opacity: 0.7 !important; border-color: #555 !important; }
        body.bm-dark-mode .MuiPaper-root.MuiAccordion-root { background-color: #282e35 !important; color: var(--blue-dark) !important; } body.bm-dark-mode .MuiAccordionSummary-root { border-bottom: 1px solid #444 !important; } body.bm-dark-mode .MuiAccordionSummary-expandIcon { color: var(--blue-dark) !important; } body.bm-dark-mode .jss42, body.bm-dark-mode .jss56 { color: #56d364 !important; }
        body.bm-dark-mode span[style*="background-color"][style*="cursor: pointer"] { color: #111 !important; padding: 0.05em 0.1em; border-radius: 2px; text-shadow: none !important; } body.bm-dark-mode span[style*="background-color: rgb(206, 242, 213)"] { background-color: rgba(206, 242, 213, 0.9) !important; } body.bm-dark-mode span[style*="background-color: rgb(225, 182, 252)"] { background-color: rgba(225, 182, 252, 0.9) !important; } body.bm-dark-mode span[style*="background-color: rgb(237, 147, 50)"] { background-color: rgba(237, 147, 50, 0.8) !important; } body.bm-dark-mode span[style*="background-color: rgb(180, 187, 250)"] { background-color: rgba(180, 187, 250, 0.9) !important; }
        /* CORREÇÃO FINAL: Texto PRETO nas caixas de contagem de erro (jss46 e jss60) */
        body.bm-dark-mode .jss46 p.MuiTypography-root, body.bm-dark-mode .jss60 p.MuiTypography-root { color: #111 !important; font-weight: 500 !important; }
        body.bm-dark-mode .jss45, body.bm-dark-mode .jss59 { background-color: #282e35 !important; padding: 5px; border-radius: 4px; }
        body.bm-dark-mode .jss46, body.bm-dark-mode .jss60 { border: 1px solid rgba(0,0,0,0.2) !important; opacity: 0.9; }
        /* Dialog de Correção */
        body.bm-dark-mode .MuiDialog-paper { background-color: #22272e !important; } body.bm-dark-mode .MuiDialogTitle-root h2 { color: #eee !important; } body.bm-dark-mode .MuiDialogContent-root { color: var(--blue-dark) !important; } body.bm-dark-mode div[style*="background-color: var(--blue-light)"][style*="color: var(--white)"] { background-color: #151a21 !important; color: #eee !important; }
        /* Scrollbars */
        body.bm-dark-mode ::-webkit-scrollbar { width: 12px; /* Mais largo */ } body.bm-dark-mode ::-webkit-scrollbar-track { background: #1f1f1f; } body.bm-dark-mode ::-webkit-scrollbar-thumb { background: #4f4f4f; border-radius: 6px; border: 2px solid #1f1f1f; } body.bm-dark-mode ::-webkit-scrollbar-thumb:hover { background: #6a6a6a; }
        /* VLibras */
        body.bm-dark-mode div[vw].enabled div[vw-access-button].active { filter: invert(1) hue-rotate(180deg); }
        /* Footer */
        body.bm-dark-mode footer #footer1, body.bm-dark-mode footer #footer { background-color: #151a21 !important; color: #aaa !important; } body.bm-dark-mode footer a { color: #77aaff !important; } body.bm-dark-mode footer .blue-line, body.bm-dark-mode footer .green-line { opacity: 0.5; }
    `;
    const styleTag = document.createElement('style'); styleTag.textContent = css; document.head.appendChild(styleTag);

    // --- LÓGICA PRINCIPAL E UI ---
    const splashTimeout = 4800; // Aumentado para acomodar nova animação splash
    setTimeout(() => {
        if (document.body.contains(splash)) { splash.remove(); }

        const wrapper = document.createElement('div'); wrapper.id = 'bmWrapper';
        wrapper.innerHTML = `
            <div id="bmHeader">
                 <span>Paraná Colado V2</span>
                 <span id="bmMinimizeBtn" title="Minimizar/Expandir">-</span>
            </div>
            <div id="bmContent">
                <textarea id="bmText" placeholder="Cole o texto aqui..."></textarea>
                <input id="bmDelay" type="number" step="0.001" value="0.001" min="0.001" placeholder="Delay (s)">
                <div id="bmToggleWrapper"> <div id="bmToggleImg"></div> <span id="bmToggleText">Modo Disfarçado</span> </div>
                <div id="bmDarkModeToggleWrapper"> <div id="bmDarkModeToggleImg"></div> <span id="bmDarkModeToggleText">Modo Escuro Página</span> </div>
                <button id="bmBtn">Iniciar Digitação</button> <button id="bmBtnCorrect">Corrigir Automaticamente</button>
            </div>
        `;
        document.body.appendChild(wrapper);
        const bmContent = document.getElementById('bmContent'); const bmMinimizeBtn = document.getElementById('bmMinimizeBtn'); const header = document.getElementById('bmHeader');

        setTimeout(() => wrapper.classList.add('show'), 50);

        // Lógica de arrastar
        let isDragging = false; let dragStartX, dragStartY, initialLeft, initialTop; header.onmousedown = e => { if (e.target === bmMinimizeBtn || bmMinimizeBtn.contains(e.target)) return; isDragging = true; dragStartX = e.clientX; dragStartY = e.clientY; initialLeft = wrapper.offsetLeft; initialTop = wrapper.offsetTop; header.style.cursor = 'grabbing'; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); e.preventDefault(); }; function onMouseMove(e) { if (!isDragging) return; const dx = e.clientX - dragStartX; const dy = e.clientY - dragStartY; wrapper.style.left = initialLeft + dx + 'px'; wrapper.style.top = initialTop + dy + 'px'; } function onMouseUp() { if (isDragging) { isDragging = false; header.style.cursor = 'move'; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); } }

        // Lógica Minimizar/Expandir
        if(bmMinimizeBtn && wrapper){ bmMinimizeBtn.onclick = (e) => { e.stopPropagation(); const isMinimized = wrapper.classList.toggle('minimized'); bmMinimizeBtn.textContent = isMinimized ? '+' : '-'; bmMinimizeBtn.title = isMinimized ? 'Expandir' : 'Minimizar'; if (stealthOn) { setTimeout(() => { rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect(); }, 360); } }; }

        // Lógica “Modo Disfarçado”
        const toggleWrapper = document.getElementById('bmToggleWrapper'); const toggleBox = document.getElementById('bmToggleImg'); let stealthOn = false; let firstTimeStealth = true; let rect = null; function handleStealthMouseMove(ev) { if (!ev || typeof ev.clientX === 'undefined' || typeof ev.clientY === 'undefined') { return; } if (!stealthOn || !wrapper || !document.body.contains(wrapper)) { exitStealth(); return; } if (!rect) { rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect(); if (!rect || rect.width === 0 || rect.height === 0) return; } const mouseX = ev.clientX; const mouseY = ev.clientY; const isInside = (rect && mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom); if (isInside) { if (wrapper.style.opacity === '0') { wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; } } else { if (wrapper.style.opacity !== '0') { rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect(); if (rect && rect.width > 0 && rect.height > 0) { wrapper.style.opacity = 0; wrapper.style.pointerEvents = 'none'; } } } } function enterStealth() { if (!wrapper || !document.body.contains(wrapper)) return; stealthOn = true; wrapper.classList.add('stealth-mode'); toggleBox.classList.add('active'); wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect(); if (!rect || rect.width === 0 || rect.height === 0) { stealthOn = false; wrapper.classList.remove('stealth-mode'); toggleBox.classList.remove('active'); showCustomAlert("Erro Modo Disfarçado.", "error"); return; } document.addEventListener('mousemove', handleStealthMouseMove); wrapper.style.opacity = 0; wrapper.style.pointerEvents = 'none'; } function exitStealth() { stealthOn = false; document.removeEventListener('mousemove', handleStealthMouseMove); if (wrapper && document.body.contains(wrapper)) { wrapper.classList.remove('stealth-mode'); toggleBox.classList.remove('active'); wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; } rect = null; } function showStealthOverlay() { const ov = document.createElement('div'); ov.id = 'bmOv'; ov.innerHTML = `<div id="bmOvContent"><img src="https://i.imgur.com/RquEok4.gif" alt="Demo"/> <p>O Modo Disfarçado oculta...</p> <button id="bmOvBtn">Entendido</button></div>`; document.body.appendChild(ov); document.getElementById('bmOvBtn').onclick = () => { ov.style.opacity = 0; setTimeout(() => { if (document.body.contains(ov)){ ov.remove(); } }, 500); enterStealth(); }; } toggleWrapper.onclick = () => { if (!stealthOn) { if (firstTimeStealth) { firstTimeStealth = false; showStealthOverlay(); } else { enterStealth(); } } else { exitStealth(); } };

        // Lógica Toggle Dark Mode
        const darkModeToggleWrapper = document.getElementById('bmDarkModeToggleWrapper'); const darkModeToggleBox = document.getElementById('bmDarkModeToggleImg'); let isDarkModeOn = false;
        darkModeToggleWrapper.onclick = () => { isDarkModeOn = !isDarkModeOn; darkModeToggleBox.classList.toggle('active', isDarkModeOn); document.body.classList.toggle('bm-dark-mode', isDarkModeOn); console.log("Dark Mode:", isDarkModeOn ? "ON" : "OFF"); };

        // Lógica Botão "Iniciar Digitação"
        const startButton = document.getElementById('bmBtn'); const correctButton = document.getElementById('bmBtnCorrect');
        startButton.onclick = async function() { /* ... código mantido ... */
             const text = document.getElementById('bmText').value; const delayInput = parseFloat(document.getElementById('bmDelay').value); const delay = (!isNaN(delayInput) && delayInput * 1000 >= MIN_DELAY) ? delayInput * 1000 : MIN_DELAY; if (!text) { showCustomAlert('Texto vazio!', 'error'); return; } if (!activeEl || !document.body.contains(activeEl)) { showCustomAlert('Clique no campo alvo antes!', 'error'); return; } this.disabled = true; if (correctButton) correctButton.disabled = true;
             for (let n = 3; n >= 1; n--) { const cnt = document.createElement('div'); cnt.className = 'bmCountdownNumber'; cnt.textContent = n; wrapper.appendChild(cnt); await new Promise(r => setTimeout(r, 700)); if (wrapper.contains(cnt)) wrapper.removeChild(cnt); await new Promise(r => setTimeout(r, 100)); } let typingCompleted = true;
             try { activeEl.focus({ preventScroll: true }); /* Evita scroll no foco inicial */ for (let i = 0; i < text.length; i++) { const char = text[i]; const success = sendChar(char); if (!success) { typingCompleted = false; break; } if (delay > 0) await new Promise(r => setTimeout(r, delay)); } if (typingCompleted) { showCustomAlert('Digitação concluída!', 'success'); } else { showCustomAlert('Digitação interrompida por erro.', 'error'); } } catch (error) { console.error("Erro na digitação:", error); showCustomAlert("Erro durante digitação.", 'error'); } finally { this.disabled = false; if (correctButton) correctButton.disabled = false; }
        };

        // --- LÓGICA CORREÇÃO AUTOMÁTICA (Final com Scroll Suave Textarea e Prevenção) ---
        correctButton.onclick = async function() {
            const btnCorrect = this; btnCorrect.disabled = true; if (startButton) startButton.disabled = true; console.log('Iniciando correção...'); const waitDelay = MIN_DELAY * 5; let concludeButtonExists = false; try { /* ... verificação Concluir mantida ... */ const allButtons = document.querySelectorAll('button'); for (const btn of allButtons) { if (btn.textContent.trim() === "Concluir") { concludeButtonExists = true; console.log("Botão 'Concluir' encontrado."); break; } } } catch (e) { console.error("Erro ao procurar 'Concluir':", e); } let correctionFlowStarted = false;
            if (!concludeButtonExists) { /* ... Lógica 'CORRIGIR ONLINE'/Esperando/Countdown mantida ... */
                 console.log("'Concluir' não encontrado. Verificando 'CORRIGIR ONLINE'."); try { const correctorButtons = document.querySelectorAll('button'); let foundCorrectorButton = null; let foundWaitingButton = null; for (const button of correctorButtons) { const buttonText = button.textContent; if (buttonText && buttonText.includes("CORRIGIR ONLINE")) { if (buttonText.trim() === "CORRIGIR ONLINE") { foundCorrectorButton = button; } else { foundWaitingButton = button; break; } } } if (foundWaitingButton) { console.log("'CORRIGIR ONLINE' em espera."); showCustomAlert("'Corrigir Online' Em processo de espera...", 'info'); btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return; } else if (foundCorrectorButton) { console.log("'CORRIGIR ONLINE' pronto."); foundCorrectorButton.click(); console.log("Clicou. Esperando 'PROCESSANDO' sumir..."); correctionFlowStarted = true; const processingSelector = 'div.sc-kAyceB.kEYIQb'; await waitForElementToDisappear(processingSelector, 30000); console.log("'PROCESSANDO' desapareceu."); console.log("Contagem regressiva 3s..."); for (let n = 3; n >= 1; n--) { const cnt = document.createElement('div'); cnt.className = 'bmCorrectionCountdownNumber'; cnt.textContent = n; document.body.appendChild(cnt); await new Promise(r => setTimeout(r, 950)); if (document.body.contains(cnt)) document.body.removeChild(cnt); } console.log("Contagem finalizada."); } else { console.log("'CORRIGIR ONLINE' não encontrado."); } } catch (error) { if (error.message.includes('Timeout')) { showCustomAlert("Timeout esperando 'PROCESSANDO'.", 'error'); } else { console.error("Erro 'CORRIGIR ONLINE':", error); showCustomAlert("Erro ao processar 'CORRIGIR ONLINE'.", 'error'); } btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return; }
            }
            let targetTextarea; try { targetTextarea = await waitForElement('textarea[id*="multiline"][class*="jss"]', 2000); } catch (error) { showCustomAlert('ERRO: Textarea não encontrada!', 'error'); btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return; } console.log('Textarea encontrada.'); activeEl = targetTextarea; console.log("Procurando spans..."); const errorSpans = document.querySelectorAll('span[style*="background-color: rgb"][style*="cursor: pointer"]'); let correctedCount = 0; let errorCount = 0;
            if (errorSpans.length === 0) { /* ... mensagem inicial mantida ... */ console.log('Nenhum span encontrado.'); if (!correctionFlowStarted && !concludeButtonExists) { showCustomAlert('Nenhum erro (span) encontrado.', 'info'); } else { showCustomAlert('Nenhum erro (span) adicional encontrado.', 'info'); } btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return; } console.log(`Encontrados ${errorSpans.length} spans.`);

            // --- Loop Principal de Correção ---
            for (const errorSpan of errorSpans) {
                 if (btnCorrect.disabled === false) { console.log("Interrompido."); break; }
                 if (!document.body.contains(errorSpan) || errorSpan.offsetParent === null) { continue; }
                try {
                    // 1. SCROLL SUAVE PARA O ERRO
                    console.log(`Scroll para erro: "${errorSpan.textContent.trim()}"`);
                    errorSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    await new Promise(r => setTimeout(r, SCROLL_DELAY));

                    const errorText = errorSpan.textContent.trim(); if (!errorText) continue;
                    const currentTextValue = targetTextarea.value; const errorIndex = currentTextValue.indexOf(errorText); if (errorIndex === -1) { continue; }

                    // 2. CLIQUE NO ERRO E ESPERA SUGESTÕES
                    errorSpan.click(); await new Promise(r => setTimeout(r, waitDelay));
                    let suggestionList;
                    try { suggestionList = await waitForElement('ul#menu-list-grow', 1000); }
                    catch (e) { errorCount++; document.body.click(); await new Promise(r => setTimeout(r, waitDelay)); continue; }
                    const suggestionItems = suggestionList.querySelectorAll('li');
                    const validSuggestions = Array.from(suggestionItems).slice(1).map(li => li.textContent.trim()).filter(text => text.length > 0);

                    if (validSuggestions.length > 0) {
                        const chosenSuggestion = validSuggestions[0];

                        // 3. SCROLL SUAVE PARA TEXTAREA ANTES DE EDITAR
                        console.log("Scroll para textarea antes de editar...");
                        targetTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        await new Promise(r => setTimeout(r, SCROLL_DELAY));

                        // 4. FOCO (SEM SCROLL), SELEÇÃO E EDIÇÃO
                        targetTextarea.focus({ preventScroll: true }); // Tenta evitar scroll automático do foco
                        await new Promise(r => setTimeout(r, waitDelay)); // Pequena pausa após foco

                        targetTextarea.selectionStart = errorIndex;
                        targetTextarea.selectionEnd = errorIndex + errorText.length;
                        await new Promise(r => setTimeout(r, waitDelay)); // Pequena pausa após seleção

                        activeEl = targetTextarea; await simulateBackspace(targetTextarea);
                        await new Promise(r => setTimeout(r, waitDelay));

                        activeEl = targetTextarea;
                        for (const char of chosenSuggestion) { if (btnCorrect.disabled === false) break; sendChar(char); if(MIN_DELAY > 0) await new Promise(r => setTimeout(r, MIN_DELAY)); }
                        if (btnCorrect.disabled === false) break; correctedCount++;
                    } else { errorCount++; }

                    // 5. FECHA MENU
                    document.body.click(); await new Promise(r => setTimeout(r, waitDelay * 2));
                } catch (error) { console.error(`Erro span "${errorSpan?.textContent?.trim()}":`, error); errorCount++; try { document.body.click(); } catch(e){} await new Promise(r => setTimeout(r, waitDelay)); }
                 await new Promise(r => setTimeout(r, waitDelay));
            } // Fim loop for

            // --- Mensagem Final Aprimorada ---
            /* ... mensagem final mantida ... */ console.log('Correção concluída.'); if (errorCount > 0) { showCustomAlert("Um ou mais erros não puderam ser corrigidos. Por favor, os corrija manualmente.", 'warning'); } else { if (correctedCount > 0) { showCustomAlert(`Correção finalizada! ${correctedCount} erros processados com sucesso.`, 'success'); } else { showCustomAlert('Nenhum erro necessitou de correção ou todos já estavam corretos.', 'info'); } }

            btnCorrect.disabled = false; if (startButton) startButton.disabled = false;

        }; // Fim onclick correctButton

    }, splashTimeout); // Fim do setTimeout principal

})(); // Fim da IIFE
