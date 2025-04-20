(function() {
    // evita duplo carregamento
    if (document.getElementById('bmSplash')) return;

    // --- Constantes de Delay (Mínimo) ---
    const MIN_DELAY = 1; // ms - Usar 1ms em vez de 0 para maior compatibilidade

    // --- FUNÇÕES AUXILIARES ---
    function showCustomAlert(message, type = 'info') { /* ... código mantido ... */
        const existingOverlay = document.getElementById('bmAlertOverlay'); if (existingOverlay) { existingOverlay.remove(); } const overlay = document.createElement('div'); overlay.id = 'bmAlertOverlay'; const alertBox = document.createElement('div'); alertBox.id = 'bmAlertBox'; alertBox.classList.add(`bmAlert-${type}`); const messageP = document.createElement('p'); messageP.id = 'bmAlertMessage'; messageP.textContent = message; const closeBtn = document.createElement('button'); closeBtn.id = 'bmAlertCloseBtn'; closeBtn.textContent = 'OK'; closeBtn.onclick = () => { alertBox.classList.add('bmAlertFadeOut'); overlay.style.opacity = 0; setTimeout(() => { if (document.body.contains(overlay)) { document.body.removeChild(overlay); } }, 300); }; alertBox.appendChild(messageP); alertBox.appendChild(closeBtn); overlay.appendChild(alertBox); document.body.appendChild(overlay); void alertBox.offsetWidth; alertBox.classList.add('bmAlertPopIn'); overlay.style.opacity = 1;
    }

    // --- RASTREAMENTO DO ELEMENTO ATIVO ---
    let activeEl = null;
    document.addEventListener('mousedown', e => { activeEl = e.target; }, true); // Removido console.log

    // --- FUNÇÕES DE SIMULAÇÃO DE TECLADO (Mantidas) ---
    function dispatchKeyEvent(target, eventType, key, keyCode, charCode = 0) { /* ... código mantido ... */
        let effectiveCharCode = charCode; if (!effectiveCharCode && key && key.length === 1) { effectiveCharCode = key.charCodeAt(0); } const event = new KeyboardEvent(eventType, { key: key, code: `Key${key.toUpperCase()}`, keyCode: keyCode, which: keyCode, charCode: eventType === 'keypress' ? effectiveCharCode : 0, bubbles: true, cancelable: true }); target.dispatchEvent(event);
    }
    async function simulateBackspace(targetElement) { /* ... código mantido ... */
        if (!targetElement) return; activeEl = targetElement; targetElement.focus(); const start = targetElement.selectionStart; const end = targetElement.selectionEnd; dispatchKeyEvent(targetElement, 'keydown', 'Backspace', 8); if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) { const currentValue = targetElement.value; let newValue = currentValue; let newCursorPos = start; if (start === end && start > 0) { newValue = currentValue.substring(0, start - 1) + currentValue.substring(end); newCursorPos = start - 1; } else if (start !== end) { newValue = currentValue.substring(0, start) + currentValue.substring(end); newCursorPos = start; } if (newValue !== currentValue) { const prototype = Object.getPrototypeOf(targetElement); const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value'); if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); } else { targetElement.value = newValue; } targetElement.selectionStart = targetElement.selectionEnd = newCursorPos; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } } else if (targetElement.isContentEditable) { document.execCommand('delete', false, null); } dispatchKeyEvent(targetElement, 'keyup', 'Backspace', 8); await new Promise(r => setTimeout(r, MIN_DELAY)); // Usa MIN_DELAY
    }
    function sendChar(c) { /* ... código mantido e otimizado ... */
        if (!activeEl) { console.warn("sendChar: activeEl nulo."); /* showCustomAlert removido para velocidade */ return false; } if (!document.body.contains(activeEl)) { console.warn("sendChar: activeEl não está no DOM."); return false; } const targetElement = activeEl; targetElement.focus(); const keyCode = c.charCodeAt(0); dispatchKeyEvent(targetElement, 'keydown', c, keyCode); dispatchKeyEvent(targetElement, 'keypress', c, keyCode, keyCode); if (targetElement.isContentEditable) { document.execCommand('insertText', false, c); } else if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') { const start = targetElement.selectionStart; const end = targetElement.selectionEnd; const currentValue = targetElement.value; const newValue = currentValue.substring(0, start) + c + currentValue.substring(end); const prototype = Object.getPrototypeOf(targetElement); const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value'); if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); } else { targetElement.value = newValue; } targetElement.selectionStart = targetElement.selectionEnd = start + c.length; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } dispatchKeyEvent(targetElement, 'keyup', c, keyCode); return true;
    }

    // --- SPLASH INICIAL (Mantido) ---
    const splash = document.createElement('div'); splash.id = 'bmSplash'; /* ... innerHTML mantido ... */
    splash.innerHTML = `<div id="bmSplashContent"><img id="bmSplashImg" src="https://i.imgur.com/RUWcJ6e.png"/> <div id="bmSplashTitle">Paraná Tools</div> <div id="bmSplashSubtitle">Carregando...</div> <div id="bmLoadingBar"><div id="bmLoadingProgress"></div></div> </div> <div id="bmSplashBgEffect"></div>`;
    document.body.appendChild(splash);

    // --- CSS INJETADO (Mantido) ---
    const css = ` /* ... CSS Completo Mantido ... */
        #bmSplashBgEffect { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 1; background: #000; opacity: 0; animation: bgFadeIn 1s forwards 0.2s; } #bmSplash { position: fixed; top:0; left:0; width:100%; height:100%; background:#000; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:99999; overflow:hidden; animation: splashFadeOut 0.8s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards 3.5s; } #bmSplashContent { z-index: 2; display:flex; flex-direction:column; align-items:center; justify-content:center; transform: scale(0.8); opacity: 0; animation: contentPopIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s; } #bmSplashImg { width:180px; margin-bottom: 20px; filter: drop-shadow(0 0 15px rgba(138, 43, 226, 0.5)); transform: translateY(20px); animation: logoFloat 1.5s ease-in-out infinite alternate 1.3s; } #bmSplashTitle, #bmSplashSubtitle { font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#fff; text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); opacity: 0; } #bmSplashTitle { font-size: 2.5em; font-weight: bold; letter-spacing: 1px; margin-bottom: 5px; animation: textFadeSlide 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.2s; } #bmSplashSubtitle { font-size: 1.2em; font-weight: 300; color: #ccc; animation: textFadeSlide 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.5s; } #bmLoadingBar { width: 220px; height: 6px; background-color: rgba(255, 255, 255, 0.2); border-radius: 3px; margin-top: 30px; overflow: hidden; opacity: 0; animation: textFadeSlide 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.8s; } #bmLoadingProgress { width: 0%; height: 100%; background: linear-gradient(90deg, #8A2BE2, #A040FF); border-radius: 3px; animation: loadingAnim 1.5s cubic-bezier(0.65, 0.05, 0.36, 1) forwards 2s; } @keyframes bgFadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes contentPopIn { from { opacity: 0; transform: scale(0.8) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } } @keyframes logoFloat { from { transform: translateY(20px); } to { transform: translateY(10px); } } @keyframes textFadeSlide { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } } @keyframes loadingAnim { from { width: 0%; } to { width: 100%; } } @keyframes splashFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
        #bmAlertOverlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100001; opacity: 0; transition: opacity 0.3s ease-out; pointer-events: none;} #bmAlertOverlay:has(#bmAlertBox.bmAlertPopIn) { pointer-events: auto; } /* Allow click only when visible */ #bmAlertBox { background: #1e1e1e; color: #fff; padding: 25px 30px; border-radius: 8px; border: 1px solid #333; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5); min-width: 300px; max-width: 450px; text-align: center; font-family: 'Segoe UI', sans-serif; transform: scale(0.9); opacity: 0; } #bmAlertBox.bmAlertPopIn { animation: alertPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; } #bmAlertBox.bmAlertFadeOut { animation: alertFadeOut 0.3s ease-out forwards; } #bmAlertMessage { font-size: 1.1em; line-height: 1.5; margin: 0 0 20px 0; } #bmAlertCloseBtn { padding: 10px 25px; font-size: 1em; background: #8A2BE2; border: none; border-radius: 5px; color: #fff; cursor: pointer; transition: background 0.2s ease, transform 0.15s ease; font-weight: bold; } #bmAlertCloseBtn:hover { background: #7022b6; transform: scale(1.05); } #bmAlertCloseBtn:active { transform: scale(0.98); } @keyframes alertPopIn { from { opacity: 0; transform: scale(0.8) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } } @keyframes alertFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
        #bmWrapper { position:fixed; top:20px; right:20px; width:320px; background:#1e1e1e; border:1px solid #333; border-radius:8px; box-shadow:0 6px 15px rgba(0,0,0,.6); font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#fff; opacity:0; transform:translateX(30px) scale(0.95); transition:opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); z-index:99998; } #bmWrapper.show { opacity:1; transform:translateX(0) scale(1); } #bmHeader { cursor:move; padding:10px 15px; background:#111; border-bottom:1px solid #333; font-size:0.95em; font-weight: bold; text-align:center; border-radius:8px 8px 0 0; user-select: none; -webkit-user-select: none; -moz-user-select: none; } #bmContent { padding:15px; background:#1b1b1b; border-radius: 0 0 8px 8px; } #bmContent textarea, #bmContent input[type="number"] { width:100%; margin-bottom:12px; padding:10px; font-size:1em; font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; background:#2a2a2a; border:1px solid #444; border-radius:5px; color:#eee; box-sizing:border-box; resize: vertical; transition: border-color 0.2s ease, box-shadow 0.2s ease; } #bmContent textarea { min-height: 80px; } #bmContent textarea:focus, #bmContent input[type="number"]:focus { outline:none; border-color:#8A2BE2; box-shadow:0 0 0 3px rgba(138,43,226,.3); } #bmContent button { width:100%; padding:10px; margin-top: 8px; font-size:1em; font-weight: bold; background:transparent; border:2px solid #8A2BE2; border-radius:5px; color:#8A2BE2; cursor:pointer; transition: all 0.2s ease-out; box-sizing: border-box; } #bmContent button:disabled { cursor: not-allowed; opacity: 0.5; border-color: #555; color: #555; background: #2a2a2a; transform: none !important; } #bmContent button:not(:disabled):hover { background:#8A2BE2; color:#111; transform:translateY(-2px); box-shadow: 0 4px 8px rgba(138, 43, 226, 0.3); } #bmContent button:not(:disabled):active { transform:translateY(0px); box-shadow: 0 2px 4px rgba(138, 43, 226, 0.2); background: #7022b6; border-color: #7022b6; }
        #bmToggleWrapper { display:flex; align-items:center; gap:10px; margin-bottom:15px; cursor: pointer; padding: 5px; border-radius: 4px; transition: background-color 0.2s ease; } #bmToggleWrapper:hover { background-color: rgba(255, 255, 255, 0.05); } #bmToggleImg { width:16px; height:16px; border:2px solid #8A2BE2; border-radius:3px; background:transparent; transition:background .2s ease, border-color 0.2s ease; display: flex; align-items: center; justify-content: center; } #bmToggleImg.active { background: #8A2BE2; } #bmToggleText { font-size:0.95em; color:#ccc; user-select:none; }
        .bmCountdownNumber { position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); font-family: 'Segoe UI Black', sans-serif; color: #8A2BE2; font-size: 3em; opacity: 0; animation: countPopZoom 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; z-index: 10; text-shadow: 0 0 10px rgba(138, 43, 226, 0.7); } @keyframes countPopZoom { 0% { opacity: 0; transform: translateX(-50%) scale(0.5) rotate(-15deg); } 60% { opacity: 1; transform: translateX(-50%) scale(1.1) rotate(5deg); } 100% { opacity: 0; transform: translateX(-50%) scale(1) rotate(0deg); } }
        #bmOv { position:fixed;top:0;left:0; width:100%;height:100%; background:rgba(0,0,0,.9); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); display:flex;flex-direction:column; align-items:center;justify-content:center; z-index:100000; opacity: 0; animation: ovFadeInSmooth 0.5s ease-out forwards; } #bmOvContent { opacity: 0; transform: translateY(20px); animation: ovContentSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.3s; text-align: center; } #bmOv img { max-width:60%; max-height:45%; border-radius: 5px; box-shadow: 0 5px 15px rgba(0,0,0,0.4); } #bmOv p { color: #ddd; font-family: 'Segoe UI', sans-serif; text-align: center; margin-top: 20px; max-width: 400px; line-height: 1.5; } #bmOv button { margin-top:25px; padding: 10px 25px; font-size: 1em; background: #8A2BE2; border: none; border-radius: 5px; color: #fff; cursor: pointer; transition: background 0.2s ease, transform 0.15s ease; font-weight: bold; width: auto; } #bmOv button:hover { background:#7022b6; transform:scale(1.05); } #bmOv button:active { transform: scale(0.98); } @keyframes ovFadeInSmooth { from{opacity:0} to{opacity:1} } @keyframes ovContentSlideUp { from{opacity:0; transform: translateY(20px);} to{opacity:1; transform: translateY(0);} }
        #bmWrapper.stealth-mode { background: #f0f0f0; border-color: #ccc; color: #333; } #bmWrapper.stealth-mode #bmHeader { background: #dcdcdc; border-color: #ccc; color: #333; } #bmWrapper.stealth-mode #bmContent { background: #e9e9e9; } #bmWrapper.stealth-mode textarea, #bmWrapper.stealth-mode input[type="number"] { background: #fff; border-color: #bbb; color: #222; } #bmWrapper.stealth-mode textarea:focus, #bmWrapper.stealth-mode input[type="number"]:focus { border-color: #666; box-shadow: 0 0 0 3px rgba(100, 100, 100, 0.2); } #bmWrapper.stealth-mode button { border-color: #888; color: #444; background: #e0e0e0; } #bmWrapper.stealth-mode button:disabled { border-color: #ccc; color: #999; background: #f0f0f0; } #bmWrapper.stealth-mode button:not(:disabled):hover { background: #ccc; color: #111; border-color: #777; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15); } #bmWrapper.stealth-mode button:not(:disabled):active { background: #bbb; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); } #bmWrapper.stealth-mode #bmToggleWrapper:hover { background-color: rgba(0, 0, 0, 0.05); } #bmWrapper.stealth-mode #bmToggleImg { border-color: #999; } #bmWrapper.stealth-mode #bmToggleImg.active { background: #777; border-color: #777; } #bmWrapper.stealth-mode #bmToggleText { color: #555; }
        #bmTypingIndicator { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 100000; opacity: 0; transition: opacity 0.3s ease-out; pointer-events: none; } #bmTypingIndicator.visible { opacity: 1; pointer-events: auto; } #bmTypingIndicator .content { background: #2a2a2a; padding: 30px 40px; border-radius: 8px; border: 1px solid #444; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4); text-align: center; color: #eee; font-family: 'Segoe UI', sans-serif; transform: scale(0.95); opacity: 0; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease-out; } #bmTypingIndicator.visible .content { transform: scale(1); opacity: 1; } #bmTypingIndicator img { width: 50px; height: auto; margin-bottom: 15px; } #bmTypingIndicator p { font-size: 1.2em; margin: 0 0 20px 0; font-weight: bold; color: #ddd; } #bmStopTypingBtn { padding: 10px 25px; font-size: 1em; font-weight: bold; border-radius: 5px; cursor: pointer; transition: all 0.2s ease; background: transparent; border: 2px solid #e74c3c; color: #e74c3c; } #bmStopTypingBtn:hover { background: #e74c3c; color: #fff; transform: scale(1.05); box-shadow: 0 3px 8px rgba(231, 76, 60, 0.3); } #bmStopTypingBtn:active { transform: scale(0.98); background: #c0392b; border-color: #c0392b; }
    `;
    const styleTag = document.createElement('style'); styleTag.textContent = css; document.head.appendChild(styleTag);

    // --- LÓGICA PRINCIPAL E UI ---
    // Atraso do Splash (mantido, pois as animações têm durações específicas)
    const splashTimeout = 4000;
    setTimeout(() => {
        if (document.body.contains(splash)) { splash.remove(); }

        const wrapper = document.createElement('div'); wrapper.id = 'bmWrapper';
        wrapper.innerHTML = `
            <div id="bmHeader">Paraná Colado V2 - AutoEditor Simulado</div>
            <div id="bmContent">
                <textarea id="bmText" placeholder="Cole o texto aqui..."></textarea>
                <input id="bmDelay" type="number" step="0.01" value="0.01" placeholder="Delay (s)"> <div id="bmToggleWrapper"> <div id="bmToggleImg"></div> <span id="bmToggleText">Modo Disfarçado</span> </div>
                <button id="bmBtn">Iniciar Digitação</button> <button id="bmBtnCorrect">Corrigir Automaticamente</button>
            </div>
        `;
        document.body.appendChild(wrapper);
        setTimeout(() => wrapper.classList.add('show'), 50); // Pequeno atraso para transição

        // Lógica de arrastar (Mantida)
        const header = document.getElementById('bmHeader'); /* ... código mantido ... */
        let isDragging = false; let dragStartX, dragStartY, initialLeft, initialTop; header.onmousedown = e => { if (e.target !== header) return; isDragging = true; dragStartX = e.clientX; dragStartY = e.clientY; initialLeft = wrapper.offsetLeft; initialTop = wrapper.offsetTop; header.style.cursor = 'grabbing'; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); e.preventDefault(); }; function onMouseMove(e) { if (!isDragging) return; const dx = e.clientX - dragStartX; const dy = e.clientY - dragStartY; wrapper.style.left = initialLeft + dx + 'px'; wrapper.style.top = initialTop + dy + 'px'; } function onMouseUp() { if (isDragging) { isDragging = false; header.style.cursor = 'move'; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); } }

        // Lógica “Modo Disfarçado” (Mantida)
        const toggleWrapper = document.getElementById('bmToggleWrapper'); const toggleBox = document.getElementById('bmToggleImg'); /* ... código mantido ... */
        let stealthOn = false; let firstTimeStealth = true; let rect = null; function handleStealthMouseMove(ev) { if (!ev || typeof ev.clientX === 'undefined' || typeof ev.clientY === 'undefined') { return; } if (!stealthOn || !wrapper || !document.body.contains(wrapper)) { exitStealth(); return; } if (!rect) { rect = wrapper.getBoundingClientRect(); if (!rect || rect.width === 0 || rect.height === 0) return; } const mouseX = ev.clientX; const mouseY = ev.clientY; const isInside = (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom); if (isInside) { if (wrapper.style.opacity === '0') { wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; } } else { if (wrapper.style.opacity !== '0') { rect = wrapper.getBoundingClientRect(); if (rect && rect.width > 0 && rect.height > 0) { wrapper.style.opacity = 0; wrapper.style.pointerEvents = 'none'; } } } } function enterStealth() { if (!wrapper || !document.body.contains(wrapper)) return; stealthOn = true; wrapper.classList.add('stealth-mode'); toggleBox.classList.add('active'); wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; rect = wrapper.getBoundingClientRect(); if (!rect || rect.width === 0 || rect.height === 0) { stealthOn = false; wrapper.classList.remove('stealth-mode'); toggleBox.classList.remove('active'); showCustomAlert("Erro Modo Disfarçado.", "error"); return; } document.addEventListener('mousemove', handleStealthMouseMove); wrapper.style.opacity = 0; wrapper.style.pointerEvents = 'none'; } function exitStealth() { stealthOn = false; document.removeEventListener('mousemove', handleStealthMouseMove); if (wrapper && document.body.contains(wrapper)) { wrapper.classList.remove('stealth-mode'); toggleBox.classList.remove('active'); wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto'; } rect = null; } function showStealthOverlay() { const ov = document.createElement('div'); ov.id = 'bmOv'; ov.innerHTML = `<div id="bmOvContent"><img src="https://i.imgur.com/RquEok4.gif" alt="Demo"/> <p>O Modo Disfarçado oculta...</p> <button id="bmOvBtn">Entendido</button></div>`; document.body.appendChild(ov); document.getElementById('bmOvBtn').onclick = () => { ov.style.opacity = 0; setTimeout(() => { if (document.body.contains(ov)){ ov.remove(); } }, 500); enterStealth(); }; } toggleWrapper.onclick = () => { if (!stealthOn) { if (firstTimeStealth) { firstTimeStealth = false; showStealthOverlay(); } else { enterStealth(); } } else { exitStealth(); } };

        // Lógica Botão "Iniciar Digitação" (Delay Padrão Reduzido)
        const startButton = document.getElementById('bmBtn'); const correctButton = document.getElementById('bmBtnCorrect');
        let typingIndicatorElement = null; let shouldStopTyping = false;
        startButton.onclick = async function() {
            const text = document.getElementById('bmText').value;
            const delayInput = parseFloat(document.getElementById('bmDelay').value);
            // Usa MIN_DELAY se o input for inválido ou menor que o mínimo aceitável (ex: 0.001s)
            const delay = (!isNaN(delayInput) && delayInput * 1000 >= MIN_DELAY) ? delayInput * 1000 : MIN_DELAY;

            if (!text) { showCustomAlert('Texto vazio!', 'error'); return; } if (!activeEl || !document.body.contains(activeEl)) { showCustomAlert('Clique no campo alvo antes!', 'error'); return; }
            this.disabled = true; if (correctButton) correctButton.disabled = true; shouldStopTyping = false;
            for (let n = 3; n >= 1; n--) { const cnt = document.createElement('div'); cnt.className = 'bmCountdownNumber'; cnt.textContent = n; wrapper.appendChild(cnt); await new Promise(r => setTimeout(r, 900)); if (wrapper.contains(cnt)) wrapper.removeChild(cnt); } // Countdown mantido com delay visual
            typingIndicatorElement = document.createElement('div'); typingIndicatorElement.id = 'bmTypingIndicator'; typingIndicatorElement.innerHTML = `<div class="content"> <img src="https://i.imgur.com/yed5tGn.gif" alt="Digitando..."/> <p>Escrevendo...</p> <button id="bmStopTypingBtn">Parar</button> </div>`; document.body.appendChild(typingIndicatorElement); const stopBtn = document.getElementById('bmStopTypingBtn'); if (stopBtn) { stopBtn.onclick = () => { shouldStopTyping = true; stopBtn.textContent = "Parando..."; stopBtn.disabled = true; }; } void typingIndicatorElement.offsetWidth; typingIndicatorElement.classList.add('visible');
            try { activeEl.focus(); for (let i = 0; i < text.length; i++) { if (shouldStopTyping) { showCustomAlert("Digitação interrompida!", 'info'); break; } const char = text[i]; const success = sendChar(char); if (!success) { shouldStopTyping = true; break; } await new Promise(r => setTimeout(r, delay)); } if (!shouldStopTyping) { showCustomAlert('Digitação concluída!', 'success'); } } catch (error) { console.error("Erro na digitação:", error); showCustomAlert("Erro durante digitação.", 'error'); shouldStopTyping = true; } finally { if (typingIndicatorElement && document.body.contains(typingIndicatorElement)) { typingIndicatorElement.classList.remove('visible'); setTimeout(() => { if (typingIndicatorElement && document.body.contains(typingIndicatorElement)) { typingIndicatorElement.remove(); } typingIndicatorElement = null; }, 300); } this.disabled = false; if (correctButton) correctButton.disabled = false; shouldStopTyping = false; }
        };

        // --- LÓGICA CORREÇÃO AUTOMÁTICA (MODIFICADA para velocidade e botão 'CORRIGIR ONLINE') ---
        function waitForElement(selector, timeout = 5000) { /* ... código mantido ... */
             return new Promise((resolve, reject) => { const startTime = Date.now(); const interval = setInterval(() => { const element = document.querySelector(selector); if (element && element.offsetParent !== null) { clearInterval(interval); resolve(element); } else if (Date.now() - startTime > timeout) { clearInterval(interval); reject(new Error(`Timeout: ${selector}`)); } }, 100); });
        }

        // Função auxiliar para esperar por mudança ou timeout
        function waitForChangeOrTimeout(textarea, containerElement, timeout = 10000) {
            const initialText = textarea.value;
            // Usar textContent pode ser mais leve que outerHTML para detecção de mudança simples
            const initialContainerContent = containerElement ? containerElement.textContent : null;

            return new Promise((resolve, reject) => {
                let observer = null;
                const timeoutId = setTimeout(() => {
                    if (observer) observer.disconnect();
                    console.warn(`Timeout ${timeout}ms esperando mudança após clicar em 'CORRIGIR ONLINE'.`);
                    reject(new Error('Timeout esperando mudança'));
                }, timeout);

                const callback = (mutationsList, obs) => {
                    let textChanged = textarea.value !== initialText;
                    let containerChanged = false;
                    if(containerElement){
                        // Verifica se *qualquer* mutação ocorreu no container ou se o texto mudou
                        for(const mutation of mutationsList) {
                             if (mutation.target === containerElement || containerElement.contains(mutation.target)) {
                                 containerChanged = true;
                                 break;
                             }
                        }
                        // Fallback verificando textContent se as mutações não forem claras
                         if (!containerChanged && containerElement.textContent !== initialContainerContent) {
                            containerChanged = true;
                        }
                    }


                    if (textChanged || containerChanged) {
                         console.log(`Mudança detectada: ${textChanged ? 'Texto da Textarea' : ''}${textChanged && containerChanged ? ' e ' : ''}${containerChanged ? 'Conteúdo do Container' : ''}`);
                        clearTimeout(timeoutId);
                        obs.disconnect();
                        resolve("Mudança detectada");
                    }
                };

                observer = new MutationObserver(callback);
                // Observa a textarea para mudanças de valor (via atributos ou dados de caractere)
                observer.observe(textarea, { attributes: true, childList: true, characterData: true, subtree: true });
                // Observa o container do botão para mudanças estruturais ou de texto
                 if (containerElement) {
                    observer.observe(containerElement, { childList: true, subtree: true, characterData: true });
                }
            });
        }


        correctButton.onclick = async function() {
            const btnCorrect = this;
            btnCorrect.disabled = true; if (startButton) startButton.disabled = true;
            console.log('Iniciando correção automática...');

            // Define delays mínimos para correção
            const typingDelayCorrect = MIN_DELAY;
            const backspaceDelay = MIN_DELAY;
            const waitDelay = MIN_DELAY * 5; // Pequena pausa entre passos, ainda rápida

            let targetTextarea;
            try {
                // Espera um pouco mais pela textarea principal se a página estiver carregando
                targetTextarea = await waitForElement('textarea[id*="multiline"][class*="jss"]', 5000);
            } catch (error) {
                showCustomAlert('ERRO: Textarea principal não encontrada ou visível!', 'error');
                console.error('Textarea principal não encontrada.');
                btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return;
            }
            console.log('Textarea principal encontrada.');
            activeEl = targetTextarea; // Define como alvo para simulações

            // --- Lógica do Botão "CORRIGIR ONLINE" ---
            let correctorButtonClicked = false;
            let correctorButtonContainer = null;
            try {
                const buttons = document.querySelectorAll('button');
                let foundButton = null;
                for (const button of buttons) {
                    // Verifica o texto EXATO, incluindo o espaço no final se houver
                    if (button.textContent.trim() === "CORRIGIR ONLINE") { // Use trim() para remover espaços extras nas pontas
                        foundButton = button;
                        // Tenta encontrar o container pai 'jss1' para observar mudanças
                        correctorButtonContainer = foundButton.closest('div.jss1'); // Procura o ancestral com a classe jss1
                        break;
                    }
                }

                if (foundButton) {
                    console.log("Botão 'CORRIGIR ONLINE' encontrado.");
                    if (!correctorButtonContainer) {
                         console.warn("Não foi possível encontrar o container 'div.jss1' do botão 'CORRIGIR ONLINE'. A detecção de mudança de HTML pode falhar.");
                         // Poderia usar foundButton.parentElement como fallback, mas é menos robusto.
                         correctorButtonContainer = foundButton.parentElement; // Fallback simples
                    }
                    foundButton.click();
                    console.log("Clicou em 'CORRIGIR ONLINE'. Esperando por mudança na página...");
                    correctorButtonClicked = true; // Marca que clicamos

                    // Espera por mudança na textarea OU no container do botão
                    await waitForChangeOrTimeout(targetTextarea, correctorButtonContainer, 15000); // Timeout de 15s
                    console.log("Mudança detectada ou timeout atingido. Prosseguindo com a correção dos spans...");
                    await new Promise(r => setTimeout(r, waitDelay * 10)); // Pausa extra após correção online

                } else {
                    console.log("Botão 'CORRIGIR ONLINE' não encontrado. Prosseguindo diretamente para correção dos spans.");
                }
            } catch (error) {
                // Trata o erro de timeout do waitForChangeOrTimeout
                if (error.message.includes('Timeout')) {
                    showCustomAlert("Tempo esgotado esperando resposta após clicar em 'CORRIGIR ONLINE'. Verifique a página.", 'error');
                } else {
                    console.error("Erro inesperado ao processar 'CORRIGIR ONLINE':", error);
                    showCustomAlert("Erro ao tentar clicar/esperar 'CORRIGIR ONLINE'.", 'error');
                }
                 // Mesmo com erro/timeout, tenta continuar a correção dos spans
                 // btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return; // Descomente para parar em caso de erro/timeout
            }
             // --- Fim da Lógica "CORRIGIR ONLINE" ---


            // --- Lógica de Correção dos Spans (Acelerada) ---
            console.log("Procurando spans de erro...");
            const errorSpans = document.querySelectorAll('div.jss24 p.MuiTypography-root.jss23 div[style*="white-space: break-spaces"] > span'); // Seletor mantido
            if (errorSpans.length === 0) {
                showCustomAlert(correctorButtonClicked ? 'Correção online processada. Nenhum erro (span) encontrado.' : 'Nenhum erro (span) encontrado.', 'info');
                console.log('Nenhum span de erro encontrado.');
                btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return;
            }
            console.log(`Encontrados ${errorSpans.length} spans de erro.`); let correctedCount = 0; let errorCount = 0;

            for (const errorSpan of errorSpans) {
                 if (btnCorrect.disabled === false) { console.log("Correção interrompida."); break; }
                 if (!document.body.contains(errorSpan) || errorSpan.offsetParent === null) { continue; } // Pula se sumiu
                try {
                    const errorText = errorSpan.textContent.trim(); if (!errorText) continue;
                    const currentTextValue = targetTextarea.value; const errorIndex = currentTextValue.indexOf(errorText);
                    if (errorIndex === -1) { continue; } // Pula se não está mais lá

                    errorSpan.click();
                    await new Promise(r => setTimeout(r, waitDelay)); // Pausa mínima

                    let suggestionList;
                    try { suggestionList = await waitForElement('ul#menu-list-grow', 1500); } // Timeout menor
                    catch (e) { errorCount++; document.body.click(); await new Promise(r => setTimeout(r, waitDelay)); continue; } // Pula erro

                    const suggestionItems = suggestionList.querySelectorAll('li');
                    const validSuggestions = Array.from(suggestionItems).slice(1).map(li => li.textContent.trim()).filter(text => text.length > 0);

                    if (validSuggestions.length > 0) {
                        const chosenSuggestion = validSuggestions[0]; // Pega a primeira
                        targetTextarea.focus();
                        targetTextarea.selectionStart = errorIndex; targetTextarea.selectionEnd = errorIndex + errorText.length;
                        await new Promise(r => setTimeout(r, waitDelay)); // Pausa mínima

                        activeEl = targetTextarea; await simulateBackspace(targetTextarea); // Já tem delay mínimo interno
                        await new Promise(r => setTimeout(r, waitDelay)); // Pausa mínima

                        activeEl = targetTextarea;
                        for (const char of chosenSuggestion) { if (btnCorrect.disabled === false) break; sendChar(char); await new Promise(r => setTimeout(r, typingDelayCorrect)); }
                        if (btnCorrect.disabled === false) break; // Sai se interrompido
                        correctedCount++;
                    } else { errorCount++; }

                    document.body.click(); // Fecha menu
                    await new Promise(r => setTimeout(r, waitDelay * 2)); // Pausa mínima maior

                } catch (error) { console.error(`Erro processando span "${errorSpan?.textContent?.trim()}":`, error); errorCount++; try { document.body.click(); } catch(e){} await new Promise(r => setTimeout(r, waitDelay)); }
                 await new Promise(r => setTimeout(r, waitDelay)); // Pausa mínima entre erros
            } // Fim loop for

            btnCorrect.disabled = false; if (startButton) startButton.disabled = false;
            console.log('Correção concluída.');
            let finalMessage = `Correção: ${correctedCount} erros processados.`; if (errorCount > 0) { finalMessage += ` ${errorCount} erros não corrigidos.`; }
            showCustomAlert(finalMessage, errorCount > 0 ? 'info' : 'success');
        }; // Fim onclick correctButton

    }, splashTimeout); // Fim do setTimeout principal

})(); // Fim da IIFE
