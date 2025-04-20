(function() {
    // evita duplo carregamento
    if (document.getElementById('bmSplash')) return;

    // --- Constantes de Delay ---
    const MIN_DELAY = 1; // ms
    const SCROLL_DELAY = 400; // ms
    const SPLASH_DURATION = 4500; // ms - Duração total aproximada do novo splash

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
        if (!targetElement) return; /* Não foca aqui, foco será gerenciado antes */ activeEl = targetElement; const start = targetElement.selectionStart; const end = targetElement.selectionEnd; dispatchKeyEvent(targetElement, 'keydown', 'Backspace', 8); if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) { const currentValue = targetElement.value; let newValue = currentValue; let newCursorPos = start; if (start === end && start > 0) { newValue = currentValue.substring(0, start - 1) + currentValue.substring(end); newCursorPos = start - 1; } else if (start !== end) { newValue = currentValue.substring(0, start) + currentValue.substring(end); newCursorPos = start; } if (newValue !== currentValue) { const prototype = Object.getPrototypeOf(targetElement); const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value'); if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); } else { targetElement.value = newValue; } targetElement.selectionStart = targetElement.selectionEnd = newCursorPos; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } } else if (targetElement.isContentEditable) { document.execCommand('delete', false, null); } dispatchKeyEvent(targetElement, 'keyup', 'Backspace', 8); await new Promise(r => setTimeout(r, MIN_DELAY));
    }
    function sendChar(c) { /* ... código mantido e rápido ... */
        if (!activeEl || !document.body.contains(activeEl)) { return false; } const targetElement = activeEl; /* Não foca aqui */ const keyCode = c.charCodeAt(0); dispatchKeyEvent(targetElement, 'keydown', c, keyCode); dispatchKeyEvent(targetElement, 'keypress', c, keyCode, keyCode); if (targetElement.isContentEditable) { document.execCommand('insertText', false, c); } else if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') { const start = targetElement.selectionStart; const end = targetElement.selectionEnd; const currentValue = targetElement.value; const newValue = currentValue.substring(0, start) + c + currentValue.substring(end); const prototype = Object.getPrototypeOf(targetElement); const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value'); if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); } else { targetElement.value = newValue; } targetElement.selectionStart = targetElement.selectionEnd = start + c.length; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } dispatchKeyEvent(targetElement, 'keyup', c, keyCode); return true;
    }

    // --- SPLASH INICIAL (Nova Animação) ---
    const splash = document.createElement('div'); splash.id = 'bmSplash';
    splash.innerHTML = `
        <div id="bmSplashContent">
             <img id="bmSplashImg" src="https://i.imgur.com/RUWcJ6e.png"/>
             <div id="bmSplashTitle">Paraná Tools</div>
             <div id="bmSplashSubtitle">AutoEditor Simulado</div>
             <div id="bmLoadingBar"><div id="bmLoadingProgress"></div></div>
        </div>
        <div id="bmSplashBgEffect"></div>
    `;
    document.body.appendChild(splash);

    // --- CSS INJETADO (Novas Animações Splash e Correções) ---
    const css = `
        /* === EFEITO DE FUNDO SPLASH (Pulsante Suave) === */
        #bmSplashBgEffect { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 1; background: radial-gradient(ellipse at center, #100a1f 0%, #000000 70%); opacity: 0; animation: bgPulseFadeIn 2s ease-out forwards 0.2s; }
        @keyframes bgPulseFadeIn {
             0% { opacity: 0; }
             50% { opacity: 0.8; }
             100% { opacity: 1; }
        }
        /* Efeito adicional opcional (partículas, etc) pode ser adicionado aqui */


        /* === SPLASH CONTENT (Animações Caprichadas) === */
         #bmSplash { position: fixed; top:0; left:0; width:100%; height:100%; background:#000; /* Fallback */ display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:99999; overflow:hidden; animation: splashFadeOut 0.6s ease-in forwards ${SPLASH_DURATION - 600}ms; /* Saída mais rápida */ }
        #bmSplashContent { z-index: 2; display:flex; flex-direction:column; align-items:center; justify-content:center; }

        /* Animação da Logo */
        #bmSplashImg {
             width:160px; /* Pouco menor */
             margin-bottom: 15px;
             filter: drop-shadow(0 5px 20px rgba(138, 43, 226, 0.4));
             opacity: 0;
             transform: scale(0.5) rotate(-20deg);
             animation: logoEntrance 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.5s, /* Entrada com overshoot */
                        logoSettle 0.8s ease-out forwards 1.7s; /* Movimento para posição final */
        }
        @keyframes logoEntrance {
             0% { opacity: 0; transform: scale(0.5) rotate(-20deg); }
             70% { opacity: 1; transform: scale(1.15) rotate(10deg); } /* Overshoot */
             100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
         @keyframes logoSettle {
             from { transform: scale(1) rotate(0deg) translateY(0); }
             to { transform: scale(0.9) rotate(-2deg) translateY(-25px); } /* Diminui e sobe */
        }

        /* Animações dos Textos (Staggered) */
        #bmSplashTitle, #bmSplashSubtitle { font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#fff; text-shadow: 0 0 8px rgba(255, 255, 255, 0.6); opacity: 0; transform: translateY(20px); }
        #bmSplashTitle { font-size: 2.3em; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 2px; animation: textAppear 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 2.0s; /* Aparece depois do logo */ }
        #bmSplashSubtitle { font-size: 1.1em; font-weight: 400; color: #bbb; animation: textAppear 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 2.3s; /* Aparece logo depois */ }
         @keyframes textAppear {
             from { opacity: 0; filter: blur(3px); transform: translateY(20px); }
             to { opacity: 1; filter: blur(0px); transform: translateY(0); }
         }

         /* Barra de Carregamento */
         #bmLoadingBar { width: 200px; height: 5px; background-color: rgba(255, 255, 255, 0.15); border-radius: 3px; margin-top: 25px; overflow: hidden; opacity: 0; transform: scaleX(0.8); animation: barAppear 0.5s ease-out forwards 2.8s; /* Aparece por último */ }
        #bmLoadingProgress { width: 0%; height: 100%; background: linear-gradient(90deg, #8A2BE2, #c38fff); border-radius: 3px; animation: loadingFill 1.0s ease-in-out forwards 3.3s; /* Preenche rápido */ box-shadow: 0 0 8px rgba(138, 43, 226, 0.5); }
         @keyframes barAppear { from { opacity: 0; transform: scaleX(0.8); } to { opacity: 1; transform: scaleX(1); } }
         @keyframes loadingFill { from { width: 0%; } to { width: 100%; } }

        /* Saída do Splash */
        @keyframes splashFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); } }


        /* === Alert e Wrapper (Animações Mantidas) === */
        #bmAlertOverlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100001; opacity: 0; transition: opacity 0.3s ease-out; pointer-events: none;} #bmAlertOverlay:has(#bmAlertBox.bmAlertPopIn) { pointer-events: auto; } #bmAlertBox { background: #1e1e1e; color: #fff; padding: 25px 30px; border-radius: 8px; border: 1px solid #333; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5); min-width: 300px; max-width: 450px; text-align: center; font-family: 'Segoe UI', sans-serif; transform: scale(0.9); opacity: 0; } #bmAlertBox.bmAlertPopIn { animation: alertPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; } #bmAlertBox.bmAlertFadeOut { animation: alertFadeOut 0.3s ease-out forwards; } #bmAlertMessage { font-size: 1.1em; line-height: 1.5; margin: 0 0 20px 0; } #bmAlertCloseBtn { padding: 10px 25px; font-size: 1em; background: #8A2BE2; border: none; border-radius: 5px; color: #fff; cursor: pointer; transition: background 0.2s ease, transform 0.15s ease; font-weight: bold; } #bmAlertCloseBtn:hover { background: #7022b6; transform: scale(1.05); } #bmAlertCloseBtn:active { transform: scale(0.98); } @keyframes alertPopIn { from { opacity: 0; transform: scale(0.8) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } } @keyframes alertFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
        #bmWrapper { position:fixed; top:20px; right:20px; width:320px; border:1px solid #333; border-radius:8px; box-shadow:0 6px 15px rgba(0,0,0,.6); font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#fff; opacity:0; transform:translateX(30px) scale(0.95); transition:opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.3s ease-out; z-index:99998; overflow: hidden; background: linear-gradient(135deg, #1e1e1e, #151515, #1e1e1e); background-size: 200% 200%; animation: subtleGradient 15s ease infinite; } @keyframes subtleGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } #bmWrapper.show { opacity:1; transform:translateX(0) scale(1); }

        /* Header e Botão Minimizar */
        #bmHeader { cursor:move; padding:10px 15px; background: rgba(17, 17, 17, 0.8); backdrop-filter: blur(2px); border-bottom:1px solid #333; font-size:0.95em; font-weight: bold; text-align:center; border-radius:8px 8px 0 0; user-select: none; position: relative; display: flex; align-items: center; justify-content: center; } #bmHeader span:not(#bmMinimizeBtn) { flex-grow: 1; text-align: center; } #bmMinimizeBtn { font-size: 1.6em; font-weight: bold; color: #aaa; cursor: pointer; padding: 0 8px; line-height: 1; transition: color 0.2s ease; user-select: none; margin-left: auto; transform: translateY(-1px); } #bmMinimizeBtn:hover { color: #eee; }
        /* Conteúdo e Estado Minimizado */
        #bmContent { padding:15px; background:rgba(27, 27, 27, 0.8); backdrop-filter: blur(2px); border-radius: 0 0 8px 8px; transition: opacity 0.3s ease-out, padding 0.3s ease-out, max-height 0.3s ease-out; max-height: 600px; overflow: hidden; } #bmWrapper.minimized { height: auto !important; } #bmWrapper.minimized #bmContent { opacity: 0; padding-top: 0; padding-bottom: 0; max-height: 0; border-width: 0; } #bmWrapper.minimized #bmHeader { border-bottom: none; border-radius: 8px; }
        /* Inputs, Botões, Toggles (Mantidos) */
        #bmContent textarea, #bmContent input[type="number"] { width:100%; margin-bottom:12px; padding:10px; font-size:1em; font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; background:rgba(42, 42, 42, 0.9); border:1px solid #444; border-radius:5px; color:#eee; box-sizing:border-box; resize: vertical; transition: border-color 0.25s ease, box-shadow 0.25s ease; } #bmContent textarea { min-height: 80px; } #bmContent textarea:focus, #bmContent input[type="number"]:focus { outline:none; border-color:#8A2BE2; box-shadow:0 0 0 3px rgba(138, 43, 226, 0.4); }
        #bmContent button { width:100%; padding:10px; margin-top: 8px; font-size:1em; font-weight: bold; background:transparent; border:2px solid #8A2BE2; border-radius:5px; color:#8A2BE2; cursor:pointer; transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94); box-sizing: border-box; } #bmContent button:disabled { cursor: not-allowed; opacity: 0.5; border-color: #555; color: #555; background: #2a2a2a; transform: none !important; box-shadow: none !important; } #bmContent button:not(:disabled):hover { background:#8A2BE2; color:#111; transform:translateY(-2px); box-shadow: 0 5px 10px rgba(138, 43, 226, 0.35); } #bmContent button:not(:disabled):active { transform:translateY(-1px) scale(0.99); box-shadow: 0 2px 5px rgba(138, 43, 226, 0.25); background: #7022b6; border-color: #7022b6; }
        #bmToggleWrapper, #bmDarkModeToggleWrapper { display:flex; align-items:center; gap:10px; margin-bottom:10px; cursor: pointer; padding: 5px; border-radius: 4px; transition: background-color 0.2s ease; } #bmToggleWrapper:hover, #bmDarkModeToggleWrapper:hover { background-color: rgba(255, 255, 255, 0.05); } #bmToggleImg, #bmDarkModeToggleImg { width:16px; height:16px; border:2px solid #8A2BE2; border-radius:3px; background:transparent; transition:background .2s ease, border-color 0.2s ease; display: flex; align-items: center; justify-content: center; flex-shrink: 0; } #bmToggleImg.active, #bmDarkModeToggleImg.active { background: #8A2BE2; } #bmToggleText, #bmDarkModeToggleText { font-size:0.95em; color:#ccc; user-select:none; line-height: 1.2; }
        /* Countdowns (Mantidos) */
        .bmCountdownNumber { position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); font-family: 'Segoe UI Black', sans-serif; color: #8A2BE2; font-size: 3em; opacity: 0; animation: countPopZoom 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; z-index: 10; text-shadow: 0 0 10px rgba(138, 43, 226, 0.7); } @keyframes countPopZoom { 0% { opacity: 0; transform: translateX(-50%) scale(0.5) rotate(-15deg); } 60% { opacity: 1; transform: translateX(-50%) scale(1.1) rotate(5deg); } 100% { opacity: 0; transform: translateX(-50%) scale(1) rotate(0deg); } }
        .bmCorrectionCountdownNumber { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: 'Segoe UI Black', sans-serif; color: #4ecdc4; font-size: 5em; opacity: 0; animation: correctionCountPop 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; z-index: 100002; text-shadow: 0 0 15px rgba(78, 205, 196, 0.7); pointer-events: none; } @keyframes correctionCountPop { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6) rotate(10deg); } 60% { opacity: 1; transform: translate(-50%, -50%) scale(1.1) rotate(-3deg); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1) rotate(0deg); } }
        /* Overlay Stealth (Mantido) */
        #bmOv { position:fixed;top:0;left:0; width:100%;height:100%; background:rgba(0,0,0,.9); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); display:flex;flex-direction:column; align-items:center;justify-content:center; z-index:100000; opacity: 0; animation: ovFadeInSmooth 0.5s ease-out forwards; } #bmOvContent { opacity: 0; transform: translateY(20px); animation: ovContentSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.3s; text-align: center; } #bmOv img { max-width:60%; max-height:45%; border-radius: 5px; box-shadow: 0 5px 15px rgba(0,0,0,0.4); } #bmOv p { color: #ddd; font-family: 'Segoe UI', sans-serif; text-align: center; margin-top: 20px; max-width: 400px; line-height: 1.5; } #bmOv button { margin-top:25px; padding: 10px 25px; font-size: 1em; background: #8A2BE2; border: none; border-radius: 5px; color: #fff; cursor: pointer; transition: background 0.2s ease, transform 0.15s ease; font-weight: bold; width: auto; } #bmOv button:hover { background:#7022b6; transform:scale(1.05); } #bmOv button:active { transform: scale(0.98); } @keyframes ovFadeInSmooth { from{opacity:0} to{opacity:1} } @keyframes ovContentSlideUp { from{opacity:0; transform: translateY(20px);} to{opacity:1; transform: translateY(0);} }
        /* Stealth Mode Claro (Mantido) */
        #bmWrapper.stealth-mode { background: #f0f0f0; border-color: #ccc; color: #333; animation: none; } #bmWrapper.stealth-mode #bmHeader { background: #dcdcdc; border-color: #ccc; color: #333; } #bmWrapper.stealth-mode #bmContent { background: #e9e9e9; } #bmWrapper.stealth-mode textarea, #bmWrapper.stealth-mode input[type="number"] { background: #fff; border-color: #bbb; color: #222; } #bmWrapper.stealth-mode textarea:focus, #bmWrapper.stealth-mode input[type="number"]:focus { border-color: #666; box-shadow: 0 0 0 3px rgba(100, 100, 100, 0.2); } #bmWrapper.stealth-mode button { border-color: #888; color: #444; background: #e0e0e0; } #bmWrapper.stealth-mode button:disabled { border-color: #ccc; color: #999; background: #f0f0f0; } #bmWrapper.stealth-mode button:not(:disabled):hover { background: #ccc; color: #111; border-color: #777; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15); } #bmWrapper.stealth-mode button:not(:disabled):active { background: #bbb; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); } #bmWrapper.stealth-mode #bmToggleWrapper:hover, #bmWrapper.stealth-mode #bmDarkModeToggleWrapper:hover { background-color: rgba(0, 0, 0, 0.05); } #bmWrapper.stealth-mode #bmToggleImg, #bmWrapper.stealth-mode #bmDarkModeToggleImg { border-color: #999; } #bmWrapper.stealth-mode #bmToggleImg.active, #bmWrapper.stealth-mode #bmDarkModeToggleImg.active { background: #777; border-color: #777; } #bmWrapper.stealth-mode #bmToggleText, #bmWrapper.stealth-mode #bmDarkModeToggleText { color: #555; } #bmWrapper.stealth-mode.minimized #bmHeader { background: #dcdcdc; }

        /* === ESTILOS DARK MODE PÁGINA (Correção jss60/jss46 Mantida) === */
        body.bm-dark-mode { /* ... Definições mantidas ... */ --blue-light: #58a6ff; --green: #347d39; --white: #1c1c1c; --blue-dark: #c9d1d9; background-color: var(--white) !important; color: var(--blue-dark) !important; }
        /* ... (Resto dos estilos dark mode mantidos, incluindo a regra corrigida abaixo) ... */
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
        body.bm-dark-mode .jss45, body.bm-dark-mode .jss59 { background-color: #282e35 !important; padding: 5px; border-radius: 4px; } body.bm-dark-mode .jss46, body.bm-dark-mode .jss60 { border: 1px solid rgba(0,0,0,0.2) !important; opacity: 0.9; }
        /* Dialog */
        body.bm-dark-mode .MuiDialog-paper { background-color: #22272e !important; } body.bm-dark-mode .MuiDialogTitle-root h2 { color: #eee !important; } body.bm-dark-mode .MuiDialogContent-root { color: var(--blue-dark) !important; } body.bm-dark-mode div[style*="background-color: var(--blue-light)"][style*="color: var(--white)"] { background-color: #151a21 !important; color: #eee !important; }
        /* Scrollbars */
        body.bm-dark-mode ::-webkit-scrollbar { width: 10px; } body.bm-dark-mode ::-webkit-scrollbar-track { background: #222; } body.bm-dark-mode ::-webkit-scrollbar-thumb { background: #555; border-radius: 5px; } body.bm-dark-mode ::-webkit-scrollbar-thumb:hover { background: #777; }
        /* VLibras */
        body.bm-dark-mode div[vw].enabled div[vw-access-button].active { filter: invert(1) hue-rotate(180deg); }
        /* Footer */
        body.bm-dark-mode footer #footer1, body.bm-dark-mode footer #footer { background-color: #151a21 !important; color: #aaa !important; } body.bm-dark-mode footer a { color: #77aaff !important; } body.bm-dark-mode footer .blue-line, body.bm-dark-mode footer .green-line { opacity: 0.5; }

    `;
    const styleTag = document.createElement('style'); styleTag.textContent = css; document.head.appendChild(styleTag);

    // --- LÓGICA PRINCIPAL E UI ---
    setTimeout(() => {
        if (document.body.contains(splash)) { splash.remove(); }

        const wrapper = document.createElement('div'); wrapper.id = 'bmWrapper';
        wrapper.innerHTML = `
            <div id="bmHeader">
                 <span>Paraná Colado V1</span>
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
        const bmContent = document.getElementById('bmContent');
        const bmMinimizeBtn = document.getElementById('bmMinimizeBtn');
        const header = document.getElementById('bmHeader');

        setTimeout(() => wrapper.classList.add('show'), 50);

        // Lógica de arrastar
        let isDragging = false; let dragStartX, dragStartY, initialLeft, initialTop; header.onmousedown = e => { if (e.target === bmMinimizeBtn || bmMinimizeBtn.contains(e.target)) return; isDragging = true; dragStartX = e.clientX; dragStartY = e.clientY; initialLeft = wrapper.offsetLeft; initialTop = wrapper.offsetTop; header.style.cursor = 'grabbing'; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); e.preventDefault(); }; function onMouseMove(e) { if (!isDragging) return; const dx = e.clientX - dragStartX; const dy = e.clientY - dragStartY; wrapper.style.left = initialLeft + dx + 'px'; wrapper.style.top = initialTop + dy + 'px'; } function onMouseUp() { if (isDragging) { isDragging = false; header.style.cursor = 'move'; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); } }

        // Lógica Minimizar/Expandir
        if(bmMinimizeBtn && wrapper){ bmMinimizeBtn.onclick = (e) => { e.stopPropagation(); const isMinimized = wrapper.classList.toggle('minimized'); bmMinimizeBtn.textContent = isMinimized ? '+' : '-'; bmMinimizeBtn.title = isMinimized ? 'Expandir' : 'Minimizar'; if (stealthOn) { setTimeout(() => { rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect(); }, 310); } }; }

        // Lógica “Modo Disfarçado”
        const toggleWrapper = document.getElementById('bmToggleWrapper'); const toggleBox = document.getElementById('bmToggleImg');
        let stealthOn = false; let firstTimeStealth = true; let rect = null; function handleStealthMouseMove(ev) { if (!ev || typeof ev.clientX === 'undefined' || typeof ev.clientY === 'undefined') { return; } if (!stealthOn || !wrapper || !document.body.contains(wrapper)) { exitStealth(); return; } if (!rect) { rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect(); if (!rect || rect.width === 0 || rect.height === 0) return; } const mouseX = ev.clientX; const mouseY = ev.clientY; const isInside = (rect && mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom); if (isInside) { if (wrapper.style.opacity === '0') { wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; } } else { if (wrapper.style.opacity !== '0') { rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect(); if (rect && rect.width > 0 && rect.height > 0) { wrapper.style.opacity = 0; wrapper.style.pointerEvents = 'none'; } } } } function enterStealth() { if (!wrapper || !document.body.contains(wrapper)) return; stealthOn = true; wrapper.classList.add('stealth-mode'); toggleBox.classList.add('active'); wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect(); if (!rect || rect.width === 0 || rect.height === 0) { stealthOn = false; wrapper.classList.remove('stealth-mode'); toggleBox.classList.remove('active'); showCustomAlert("Erro Modo Disfarçado.", "error"); return; } document.addEventListener('mousemove', handleStealthMouseMove); wrapper.style.opacity = 0; wrapper.style.pointerEvents = 'none'; } function exitStealth() { stealthOn = false; document.removeEventListener('mousemove', handleStealthMouseMove); if (wrapper && document.body.contains(wrapper)) { wrapper.classList.remove('stealth-mode'); toggleBox.classList.remove('active'); wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; } rect = null; } function showStealthOverlay() { const ov = document.createElement('div'); ov.id = 'bmOv'; ov.innerHTML = `<div id="bmOvContent"><img src="https://i.imgur.com/RquEok4.gif" alt="Demo"/> <p>O Modo Disfarçado oculta...</p> <button id="bmOvBtn">Entendido</button></div>`; document.body.appendChild(ov); document.getElementById('bmOvBtn').onclick = () => { ov.style.opacity = 0; setTimeout(() => { if (document.body.contains(ov)){ ov.remove(); } }, 500); enterStealth(); }; } toggleWrapper.onclick = () => { if (!stealthOn) { if (firstTimeStealth) { firstTimeStealth = false; showStealthOverlay(); } else { enterStealth(); } } else { exitStealth(); } };

        // Lógica Toggle Dark Mode
        const darkModeToggleWrapper = document.getElementById('bmDarkModeToggleWrapper'); const darkModeToggleBox = document.getElementById('bmDarkModeToggleImg'); let isDarkModeOn = false;
        darkModeToggleWrapper.onclick = () => { isDarkModeOn = !isDarkModeOn; darkModeToggleBox.classList.toggle('active', isDarkModeOn); document.body.classList.toggle('bm-dark-mode', isDarkModeOn); console.log("Dark Mode:", isDarkModeOn ? "ON" : "OFF"); };

        // Lógica Botão "Iniciar Digitação"
        const startButton = document.getElementById('bmBtn'); const correctButton = document.getElementById('bmBtnCorrect');
        startButton.onclick = async function() { /* ... código mantido ... */
             const text = document.getElementById('bmText').value; const delayInput = parseFloat(document.getElementById('bmDelay').value); const delay = (!isNaN(delayInput) && delayInput * 1000 >= MIN_DELAY) ? delayInput * 1000 : MIN_DELAY; if (!text) { showCustomAlert('Texto vazio!', 'error'); return; } if (!activeEl || !document.body.contains(activeEl)) { showCustomAlert('Clique no campo alvo antes!', 'error'); return; } this.disabled = true; if (correctButton) correctButton.disabled = true;
             for (let n = 3; n >= 1; n--) { const cnt = document.createElement('div'); cnt.className = 'bmCountdownNumber'; cnt.textContent = n; wrapper.appendChild(cnt); await new Promise(r => setTimeout(r, 700)); if (wrapper.contains(cnt)) wrapper.removeChild(cnt); await new Promise(r => setTimeout(r, 100)); } let typingCompleted = true;
             try { activeEl.focus(); for (let i = 0; i < text.length; i++) { const char = text[i]; const success = sendChar(char); if (!success) { typingCompleted = false; break; } if (delay > 0) await new Promise(r => setTimeout(r, delay)); } if (typingCompleted) { showCustomAlert('Digitação concluída!', 'success'); } else { showCustomAlert('Digitação interrompida por erro.', 'error'); } } catch (error) { console.error("Erro na digitação:", error); showCustomAlert("Erro durante digitação.", 'error'); } finally { this.disabled = false; if (correctButton) correctButton.disabled = false; }
        };


        // --- LÓGICA CORREÇÃO AUTOMÁTICA (Final com Scroll Textarea Corrigido) ---
        correctButton.onclick = async function() {
            const btnCorrect = this; btnCorrect.disabled = true; if (startButton) startButton.disabled = true; console.log('Iniciando correção automática...'); const waitDelay = MIN_DELAY * 5; let concludeButtonExists = false; try { const allButtons = document.querySelectorAll('button'); for (const btn of allButtons) { if (btn.textContent.trim() === "Concluir") { concludeButtonExists = true; console.log("Botão 'Concluir' encontrado."); break; } } } catch (e) { console.error("Erro ao procurar 'Concluir':", e); } let correctionFlowStarted = false;
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
                    // 1. Scroll Suave para o ERRO
                    console.log(`Scroll para erro: "${errorSpan.textContent.trim()}"`);
                    errorSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    await new Promise(r => setTimeout(r, SCROLL_DELAY));

                    const errorText = errorSpan.textContent.trim(); if (!errorText) continue;
                    const currentTextValue = targetTextarea.value; const errorIndex = currentTextValue.indexOf(errorText); if (errorIndex === -1) { continue; }

                    // 2. Clique no erro e espera sugestões
                    errorSpan.click(); await new Promise(r => setTimeout(r, waitDelay));
                    let suggestionList;
                    try { suggestionList = await waitForElement('ul#menu-list-grow', 1000); }
                    catch (e) { errorCount++; document.body.click(); await new Promise(r => setTimeout(r, waitDelay)); continue; }

                    const suggestionItems = suggestionList.querySelectorAll('li');
                    const validSuggestions = Array.from(suggestionItems).slice(1).map(li => li.textContent.trim()).filter(text => text.length > 0);

                    if (validSuggestions.length > 0) {
                        const chosenSuggestion = validSuggestions[0];

                        // 3. Foco e Seleção (sem scroll aqui ainda)
                        targetTextarea.focus(); // Foca primeiro (pode causar um pequeno scroll inicial do browser)
                        targetTextarea.selectionStart = errorIndex;
                        targetTextarea.selectionEnd = errorIndex + errorText.length;
                        // Pequena pausa após focar e selecionar
                        await new Promise(r => setTimeout(r, waitDelay));

                        // *** 4. SCROLL SUAVE para a SELEÇÃO na Textarea ***
                        // Tenta centralizar a área selecionada antes de modificar
                        console.log("Scroll para seleção na textarea...");
                        // Para textareas, focar em 'center' pode ser mais útil
                        targetTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        await new Promise(r => setTimeout(r, SCROLL_DELAY)); // Espera scroll finalizar


                        // 5. Simulação de Backspace e Digitação
                        activeEl = targetTextarea; await simulateBackspace(targetTextarea);
                        await new Promise(r => setTimeout(r, waitDelay)); // Pausa antes de digitar

                        activeEl = targetTextarea;
                        for (const char of chosenSuggestion) { if (btnCorrect.disabled === false) break; sendChar(char); if(MIN_DELAY > 0) await new Promise(r => setTimeout(r, MIN_DELAY)); }
                        if (btnCorrect.disabled === false) break;
                        correctedCount++;
                    } else { errorCount++; }

                    // 6. Fecha menu e pausa
                    document.body.click(); await new Promise(r => setTimeout(r, waitDelay * 2));

                } catch (error) { console.error(`Erro span "${errorSpan?.textContent?.trim()}":`, error); errorCount++; try { document.body.click(); } catch(e){} await new Promise(r => setTimeout(r, waitDelay)); }
                 await new Promise(r => setTimeout(r, waitDelay));
            } // Fim loop for

            // --- Mensagem Final Aprimorada ---
            console.log('Correção concluída.'); if (errorCount > 0) { showCustomAlert("Um ou mais erros não puderam ser corrigidos. Por favor, os corrija manualmente.", 'warning'); } else { if (correctedCount > 0) { showCustomAlert(`Correção finalizada! ${correctedCount} erros processados com sucesso.`, 'success'); } else { showCustomAlert('Nenhum erro necessitou de correção ou todos já estavam corretos.', 'info'); } }

            btnCorrect.disabled = false; if (startButton) startButton.disabled = false;

        }; // Fim onclick correctButton

    }, splashTimeout); // Fim do setTimeout principal

})(); // Fim da IIFE
