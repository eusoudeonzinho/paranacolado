(function() {
    // evita duplo carregamento
    if (document.getElementById('bmSplash')) return;

    // --- FUNÇÕES AUXILIARES ---

    // Função para criar e exibir popups customizados (substitui alert)
    function showCustomAlert(message, type = 'info') { // type pode ser 'info', 'error', 'success'
        const existingOverlay = document.getElementById('bmAlertOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        const overlay = document.createElement('div');
        overlay.id = 'bmAlertOverlay';
        const alertBox = document.createElement('div');
        alertBox.id = 'bmAlertBox';
        alertBox.classList.add(`bmAlert-${type}`);
        const messageP = document.createElement('p');
        messageP.id = 'bmAlertMessage';
        messageP.textContent = message;
        const closeBtn = document.createElement('button');
        closeBtn.id = 'bmAlertCloseBtn';
        closeBtn.textContent = 'OK';
        closeBtn.onclick = () => {
            alertBox.classList.add('bmAlertFadeOut');
            overlay.style.opacity = 0;
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 300);
        };
        alertBox.appendChild(messageP);
        alertBox.appendChild(closeBtn);
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);
        void alertBox.offsetWidth;
        alertBox.classList.add('bmAlertPopIn');
        overlay.style.opacity = 1;
    }

    // --- RASTREAMENTO DO ELEMENTO ATIVO ---
    let activeEl = null;
    document.addEventListener('mousedown', e => {
        console.log('mousedown detected, activeEl set to:', e.target);
        activeEl = e.target;
    }, true);

    // --- FUNÇÕES DE SIMULAÇÃO DE TECLADO (Mantidas intactas na lógica principal) ---
    function dispatchKeyEvent(target, eventType, key, keyCode, charCode = 0) {
        let effectiveCharCode = charCode;
        if (!effectiveCharCode && key && key.length === 1) {
            effectiveCharCode = key.charCodeAt(0);
        }
        const event = new KeyboardEvent(eventType, {
            key: key, code: `Key${key.toUpperCase()}`, keyCode: keyCode, which: keyCode,
            charCode: eventType === 'keypress' ? effectiveCharCode : 0,
            bubbles: true, cancelable: true
        });
        target.dispatchEvent(event);
    }

    async function simulateBackspace(targetElement) {
        if (!targetElement) return;
        activeEl = targetElement; // Garante que activeEl é o target
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
                if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); }
                else { targetElement.value = newValue; }
                targetElement.selectionStart = targetElement.selectionEnd = newCursorPos;
                targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            }
        } else if (targetElement.isContentEditable) {
            document.execCommand('delete', false, null);
        }
        dispatchKeyEvent(targetElement, 'keyup', 'Backspace', 8);
        await new Promise(r => setTimeout(r, 1)); // Pequena pausa
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
            if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); }
            else { targetElement.value = newValue; }
            targetElement.selectionStart = targetElement.selectionEnd = start + c.length;
            targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        }
        dispatchKeyEvent(targetElement, 'keyup', c, keyCode);
    }

    // --- SPLASH INICIAL (Animação Melhorada) ---
    const splash = document.createElement('div');
    splash.id = 'bmSplash';
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

    // --- CSS INJETADO (Com Melhorias e Estilos para Popup - Mantido) ---
    const css = `
        /* === EFEITO DE FUNDO SPLASH === */
        #bmSplashBgEffect { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 1; background: #000; opacity: 0; animation: bgFadeIn 1s forwards 0.2s; }
        /* === SPLASH CONTENT === */
         #bmSplash { position: fixed; top:0; left:0; width:100%; height:100%; background:#000; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:99999; overflow:hidden; animation: splashFadeOut 0.8s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards 3.5s; }
        #bmSplashContent { z-index: 2; display:flex; flex-direction:column; align-items:center; justify-content:center; transform: scale(0.8); opacity: 0; animation: contentPopIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s; }
        #bmSplashImg { width:180px; margin-bottom: 20px; filter: drop-shadow(0 0 15px rgba(138, 43, 226, 0.5)); transform: translateY(20px); animation: logoFloat 1.5s ease-in-out infinite alternate 1.3s; }
        #bmSplashTitle, #bmSplashSubtitle { font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#fff; text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); opacity: 0; }
        #bmSplashTitle { font-size: 2.5em; font-weight: bold; letter-spacing: 1px; margin-bottom: 5px; animation: textFadeSlide 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.2s; }
        #bmSplashSubtitle { font-size: 1.2em; font-weight: 300; color: #ccc; animation: textFadeSlide 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.5s; }
         #bmLoadingBar { width: 220px; height: 6px; background-color: rgba(255, 255, 255, 0.2); border-radius: 3px; margin-top: 30px; overflow: hidden; opacity: 0; animation: textFadeSlide 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.8s; }
        #bmLoadingProgress { width: 0%; height: 100%; background: linear-gradient(90deg, #8A2BE2, #A040FF); border-radius: 3px; animation: loadingAnim 1.5s cubic-bezier(0.65, 0.05, 0.36, 1) forwards 2s; }
        @keyframes bgFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes contentPopIn { from { opacity: 0; transform: scale(0.8) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
         @keyframes logoFloat { from { transform: translateY(20px); } to { transform: translateY(10px); } }
        @keyframes textFadeSlide { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes loadingAnim { from { width: 0%; } to { width: 100%; } }
        @keyframes splashFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
        /* === CUSTOM ALERT POPUP === */
        #bmAlertOverlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100001; opacity: 0; transition: opacity 0.3s ease-out; }
        #bmAlertBox { background: #1e1e1e; color: #fff; padding: 25px 30px; border-radius: 8px; border: 1px solid #333; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5); min-width: 300px; max-width: 450px; text-align: center; font-family: 'Segoe UI', sans-serif; transform: scale(0.9); opacity: 0; }
        #bmAlertBox.bmAlertPopIn { animation: alertPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        #bmAlertBox.bmAlertFadeOut { animation: alertFadeOut 0.3s ease-out forwards; }
        #bmAlertMessage { font-size: 1.1em; line-height: 1.5; margin: 0 0 20px 0; }
        #bmAlertCloseBtn { padding: 10px 25px; font-size: 1em; background: #8A2BE2; border: none; border-radius: 5px; color: #fff; cursor: pointer; transition: background 0.2s ease, transform 0.15s ease; font-weight: bold; }
        #bmAlertCloseBtn:hover { background: #7022b6; transform: scale(1.05); }
         #bmAlertCloseBtn:active { transform: scale(0.98); }
        @keyframes alertPopIn { from { opacity: 0; transform: scale(0.8) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
         @keyframes alertFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
        /* === WRAPPER PRINCIPAL === */
        #bmWrapper { position:fixed; top:20px; right:20px; width:320px; background:#1e1e1e; border:1px solid #333; border-radius:8px; box-shadow:0 6px 15px rgba(0,0,0,.6); font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#fff; opacity:0; transform:translateX(30px) scale(0.95); transition:opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); z-index:99998; }
        #bmWrapper.show { opacity:1; transform:translateX(0) scale(1); }
        #bmHeader { cursor:move; padding:10px 15px; background:#111; border-bottom:1px solid #333; font-size:0.95em; font-weight: bold; text-align:center; border-radius:8px 8px 0 0; user-select: none; -webkit-user-select: none; -moz-user-select: none; }
        #bmContent { padding:15px; background:#1b1b1b; border-radius: 0 0 8px 8px; }
        #bmContent textarea, #bmContent input[type="number"] { width:100%; margin-bottom:12px; padding:10px; font-size:1em; font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; background:#2a2a2a; border:1px solid #444; border-radius:5px; color:#eee; box-sizing:border-box; resize: vertical; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
         #bmContent textarea { min-height: 80px; }
        #bmContent textarea:focus, #bmContent input[type="number"]:focus { outline:none; border-color:#8A2BE2; box-shadow:0 0 0 3px rgba(138,43,226,.3); }
        #bmContent button { width:100%; padding:10px; margin-top: 8px; font-size:1em; font-weight: bold; background:transparent; border:2px solid #8A2BE2; border-radius:5px; color:#8A2BE2; cursor:pointer; transition: all 0.2s ease-out; box-sizing: border-box; }
        #bmContent button:disabled { cursor: not-allowed; opacity: 0.5; border-color: #555; color: #555; background: #2a2a2a; transform: none !important; }
        #bmContent button:not(:disabled):hover { background:#8A2BE2; color:#111; transform:translateY(-2px); box-shadow: 0 4px 8px rgba(138, 43, 226, 0.3); }
        #bmContent button:not(:disabled):active { transform:translateY(0px); box-shadow: 0 2px 4px rgba(138, 43, 226, 0.2); background: #7022b6; border-color: #7022b6; }
        /* toggle “Modo Disfarçado” */
        #bmToggleWrapper { display:flex; align-items:center; gap:10px; margin-bottom:15px; cursor: pointer; padding: 5px; border-radius: 4px; transition: background-color 0.2s ease; }
         #bmToggleWrapper:hover { background-color: rgba(255, 255, 255, 0.05); }
        #bmToggleImg { width:16px; height:16px; border:2px solid #8A2BE2; border-radius:3px; background:transparent; transition:background .2s ease, border-color 0.2s ease; display: flex; align-items: center; justify-content: center; }
         #bmToggleImg.active { background: #8A2BE2; }
        #bmToggleText { font-size:0.95em; color:#ccc; user-select:none; }
        /* contador 3-2-1 */
        .bmCountdownNumber { position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); font-family: 'Segoe UI Black', sans-serif; color: #8A2BE2; font-size: 3em; opacity: 0; animation: countPopZoom 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; z-index: 10; text-shadow: 0 0 10px rgba(138, 43, 226, 0.7); }
        @keyframes countPopZoom { 0% { opacity: 0; transform: translateX(-50%) scale(0.5) rotate(-15deg); } 60% { opacity: 1; transform: translateX(-50%) scale(1.1) rotate(5deg); } 100% { opacity: 0; transform: translateX(-50%) scale(1) rotate(0deg); } }
        /* overlay stealth */
        #bmOv { position:fixed;top:0;left:0; width:100%;height:100%; background:rgba(0,0,0,.9); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); display:flex;flex-direction:column; align-items:center;justify-content:center; z-index:100000; opacity: 0; animation: ovFadeInSmooth 0.5s ease-out forwards; }
         #bmOvContent { opacity: 0; transform: translateY(20px); animation: ovContentSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.3s; text-align: center; }
        #bmOv img { max-width:60%; max-height:45%; border-radius: 5px; box-shadow: 0 5px 15px rgba(0,0,0,0.4); }
         #bmOv p { color: #ddd; font-family: 'Segoe UI', sans-serif; text-align: center; margin-top: 20px; max-width: 400px; line-height: 1.5; }
        #bmOv button { margin-top:25px; padding: 10px 25px; font-size: 1em; background: #8A2BE2; border: none; border-radius: 5px; color: #fff; cursor: pointer; transition: background 0.2s ease, transform 0.15s ease; font-weight: bold; width: auto; }
        #bmOv button:hover { background:#7022b6; transform:scale(1.05); }
         #bmOv button:active { transform: scale(0.98); }
        @keyframes ovFadeInSmooth { from{opacity:0} to{opacity:1} }
         @keyframes ovContentSlideUp { from{opacity:0; transform: translateY(20px);} to{opacity:1; transform: translateY(0);} }
         /* Estilos Modo Disfarçado (Claro) */
         #bmWrapper.stealth-mode { background: #f0f0f0; border-color: #ccc; color: #333; }
         #bmWrapper.stealth-mode #bmHeader { background: #dcdcdc; border-color: #ccc; color: #333; }
          #bmWrapper.stealth-mode #bmContent { background: #e9e9e9; }
         #bmWrapper.stealth-mode textarea, #bmWrapper.stealth-mode input[type="number"] { background: #fff; border-color: #bbb; color: #222; }
         #bmWrapper.stealth-mode textarea:focus, #bmWrapper.stealth-mode input[type="number"]:focus { border-color: #666; box-shadow: 0 0 0 3px rgba(100, 100, 100, 0.2); }
         #bmWrapper.stealth-mode button { border-color: #888; color: #444; background: #e0e0e0; }
          #bmWrapper.stealth-mode button:disabled { border-color: #ccc; color: #999; background: #f0f0f0; }
         #bmWrapper.stealth-mode button:not(:disabled):hover { background: #ccc; color: #111; border-color: #777; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15); }
          #bmWrapper.stealth-mode button:not(:disabled):active { background: #bbb; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
         #bmWrapper.stealth-mode #bmToggleWrapper:hover { background-color: rgba(0, 0, 0, 0.05); }
         #bmWrapper.stealth-mode #bmToggleImg { border-color: #999; }
          #bmWrapper.stealth-mode #bmToggleImg.active { background: #777; border-color: #777; }
         #bmWrapper.stealth-mode #bmToggleText { color: #555; }
    `;
    const styleTag = document.createElement('style');
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    // --- LÓGICA PRINCIPAL E UI ---
    setTimeout(() => {
        if (document.body.contains(splash)) {
            splash.remove();
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
        setTimeout(() => wrapper.classList.add('show'), 50);

        // Lógica de arrastar (mantida)
        const header = document.getElementById('bmHeader');
        let isDragging = false;
        let dragStartX, dragStartY, initialLeft, initialTop;
        header.onmousedown = e => {
            if (e.target !== header) return;
            isDragging = true;
            dragStartX = e.clientX; dragStartY = e.clientY;
            initialLeft = wrapper.offsetLeft; initialTop = wrapper.offsetTop;
            header.style.cursor = 'grabbing';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
        };
        function onMouseMove(e) {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX; const dy = e.clientY - dragStartY;
            wrapper.style.left = initialLeft + dx + 'px'; wrapper.style.top = initialTop + dy + 'px';
        }
        function onMouseUp() {
            if (isDragging) {
                isDragging = false; header.style.cursor = 'move';
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        }

        // =============================================================
        // Lógica “Modo Disfarçado” (CORRIGIDA)
        // =============================================================
        const toggleWrapper = document.getElementById('bmToggleWrapper');
        const toggleBox = document.getElementById('bmToggleImg');
        let stealthOn = false;
        let firstTimeStealth = true;
        let rect = null; // Guarda a posição/dimensões do wrapper (DOMRect)

        // Função chamada no mousemove DO DOCUMENTO durante o modo disfarçado
        function handleStealthMouseMove(ev) {
            // Só executa se modo ativo. rect pode ser null inicialmente ou se o wrapper for removido.
            if (!stealthOn || !wrapper || !document.body.contains(wrapper)) {
                 // Se o wrapper sumiu por algum motivo, desativa o listener
                 exitStealth();
                 return;
             }
            // Garante que temos um rect válido. Se não, pega o atual (pode acontecer se a página mudar layout)
             if (!rect) {
                rect = wrapper.getBoundingClientRect();
                // Se ainda assim não conseguir um rect válido (ex: wrapper com display:none), não faz nada
                if (!rect || rect.width === 0 || rect.height === 0) return;
             }

            const mouseX = ev.clientX;
            const mouseY = ev.clientY;

            // Verifica se o mouse está DENTRO da área definida por 'rect'
            const isInside = (
                mouseX >= rect.left && mouseX <= rect.right &&
                mouseY >= rect.top && mouseY <= rect.bottom
            );

            if (isInside) {
                // Mouse está dentro: MOSTRAR (se estiver escondido)
                if (wrapper.style.opacity === '0') {
                    wrapper.style.opacity = 1;
                    wrapper.style.pointerEvents = 'auto';
                    // NÃO atualize rect aqui, pois o mouse JÁ está dentro.
                    // console.log('UI Shown (Stealth)');
                }
            } else {
                // Mouse está fora: ESCONDER (se estiver visível)
                if (wrapper.style.opacity !== '0') {
                     // IMPORTANTE: Atualizar rect ANTES de esconder.
                     // getBoundingClientRect retorna as dimensões e posição atuais.
                     rect = wrapper.getBoundingClientRect();
                     // Verifica se conseguiu um rect válido antes de esconder
                     if (rect && rect.width > 0 && rect.height > 0) {
                         wrapper.style.opacity = 0;
                         wrapper.style.pointerEvents = 'none';
                         // console.log('UI Hidden (Stealth)');
                     } else {
                         console.warn("Não foi possível obter o rect antes de esconder. Abortando hide.");
                     }
                }
            }
        }

        function enterStealth() {
            if (!wrapper || !document.body.contains(wrapper)) return; // Segurança

            stealthOn = true; // Marca que o modo está ativo
            wrapper.classList.add('stealth-mode');
            toggleBox.classList.add('active');

            // Guarda a posição inicial/atual ANTES de esconder
            // Certifica-se que o wrapper está visível para pegar o rect correto
            wrapper.style.opacity = 1;
            wrapper.style.pointerEvents = 'auto';
            rect = wrapper.getBoundingClientRect();

             // Se não conseguiu um rect válido, não entra no modo disfarçado
             if (!rect || rect.width === 0 || rect.height === 0) {
                 console.error("Não foi possível iniciar o Modo Disfarçado: Wrapper sem dimensões.");
                 stealthOn = false; // Desmarca
                 wrapper.classList.remove('stealth-mode');
                 toggleBox.classList.remove('active');
                 showCustomAlert("Erro ao ativar o Modo Disfarçado. O painel parece estar invisível.", "error");
                 return;
             }

            // Adiciona listener ao DOCUMENTO
            document.addEventListener('mousemove', handleStealthMouseMove);

            // Esconde imediatamente ao entrar no modo,
            // handleStealthMouseMove mostrará se o mouse estiver dentro
            wrapper.style.opacity = 0;
            wrapper.style.pointerEvents = 'none';
            console.log('Entered Stealth Mode - UI initially hidden');
        }

        function exitStealth() {
            stealthOn = false; // Marca que o modo está inativo

            // Remove listener do DOCUMENTO
            document.removeEventListener('mousemove', handleStealthMouseMove);

            // Garante visibilidade e restaura classes/estilos
             if (wrapper && document.body.contains(wrapper)) {
                 wrapper.classList.remove('stealth-mode');
                 toggleBox.classList.remove('active');
                 wrapper.style.opacity = 1;
                 wrapper.style.pointerEvents = 'auto';
             }
            rect = null; // Limpa rect
            console.log('Exited Stealth Mode');
        }

        // Função showStealthOverlay (sem alterações na estrutura, só na chamada de enterStealth)
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
                ov.style.opacity = 0;
                setTimeout(() => {
                     if (document.body.contains(ov)){ ov.remove(); }
                }, 500);
                // Chama enterStealth DEPOIS que o overlay foi fechado
                enterStealth();
            };
        }

        // Event listener no wrapper do toggle (sem alterações na lógica)
        toggleWrapper.onclick = () => {
           // Usa !stealthOn para decidir a ação, pois o estado só muda DEPOIS
            if (!stealthOn) { // Se está DESLIGADO, vai LIGAR
                if (firstTimeStealth) {
                    firstTimeStealth = false;
                    showStealthOverlay(); // Overlay chama enterStealth ao fechar
                } else {
                    enterStealth(); // Liga diretamente
                }
            } else { // Se está LIGADO, vai DESLIGAR
                exitStealth();
            }
        };
        // =============================================================
        // Fim da Lógica “Modo Disfarçado” (CORRIGIDA)
        // =============================================================


        // Lógica Botão "Iniciar Digitação" (sem alterações)
        const startButton = document.getElementById('bmBtn');
        const correctButton = document.getElementById('bmBtnCorrect');
        startButton.onclick = async function() {
            const text = document.getElementById('bmText').value;
            const delayInput = parseFloat(document.getElementById('bmDelay').value);
            const delay = (!isNaN(delayInput) && delayInput >= 0) ? delayInput * 1000 : 50;
            if (!text) { showCustomAlert('O campo de texto está vazio!', 'error'); return; }
            if (!activeEl || !document.body.contains(activeEl)) { showCustomAlert('Clique primeiro no campo onde deseja digitar ANTES de clicar em "Iniciar Digitação"!', 'error'); return; }
            this.disabled = true; if (correctButton) correctButton.disabled = true;
            for (let n = 3; n >= 1; n--) {
                const cnt = document.createElement('div'); cnt.className = 'bmCountdownNumber'; cnt.textContent = n;
                wrapper.appendChild(cnt); await new Promise(r => setTimeout(r, 900));
                if (wrapper.contains(cnt)) wrapper.removeChild(cnt);
            }
            try {
                activeEl.focus();
                for (let i = 0; i < text.length; i++) {
                    const char = text[i]; if (!this.disabled) { console.warn("Digitação interrompida."); break; }
                    sendChar(char); await new Promise(r => setTimeout(r, delay));
                }
                 if(this.disabled) showCustomAlert('Digitação concluída!', 'success'); // Só mostra se não foi interrompido
            } catch (error) {
                console.error("Erro durante a digitação simulada ('Iniciar'):", error);
                showCustomAlert("Ocorreu um erro durante a digitação. Verifique o console.", 'error');
            } finally {
                // Reativa mesmo se foi interrompido
                this.disabled = false; if (correctButton) correctButton.disabled = false;
            }
        };

        // --- LÓGICA CORREÇÃO AUTOMÁTICA (sem alterações funcionais) ---
        function waitForElement(selector, timeout = 5000) { /* ... código mantido ... */
             return new Promise((resolve, reject) => {
                 const startTime = Date.now();
                 const interval = setInterval(() => {
                     const element = document.querySelector(selector);
                     if (element && element.offsetParent !== null) { clearInterval(interval); resolve(element); }
                     else if (Date.now() - startTime > timeout) { clearInterval(interval); console.error(`Timeout esperando por elemento: ${selector}`); reject(new Error(`Timeout esperando por elemento: ${selector}`)); }
                 }, 100);
             });
        }
        correctButton.onclick = async function() { /* ... código mantido ... */
            const btnCorrect = this;
            btnCorrect.disabled = true; if (startButton) startButton.disabled = true;
            console.log('Iniciando correção simulada...');
            const typingDelayCorrect = 20; const backspaceDelay = 5;
            let targetTextarea;
            try {
                targetTextarea = await waitForElement('textarea[id*="multiline"][class*="jss"]', 3000);
            } catch (error) {
                showCustomAlert('ERRO: Textarea principal de redação não encontrada ou não visível!', 'error'); console.error('Textarea principal não encontrada.');
                btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return;
            }
            console.log('Textarea principal encontrada:', targetTextarea); activeEl = targetTextarea;
            const errorSpans = document.querySelectorAll('div.jss24 p.MuiTypography-root.jss23 div[style*="white-space: break-spaces"] > span');
            if (errorSpans.length === 0) {
                 showCustomAlert('Nenhum erro (span clicável na estrutura esperada) foi encontrado.', 'info'); console.log('Nenhum span de erro encontrado.');
                 btnCorrect.disabled = false; if (startButton) startButton.disabled = false; return;
            }
            console.log(`Encontrados ${errorSpans.length} spans de erro.`); let correctedCount = 0; let errorCount = 0;
            for (const errorSpan of errorSpans) {
                 if (btnCorrect.disabled === false) { console.log("Correção interrompida."); break; }
                 if (!document.body.contains(errorSpan) || errorSpan.offsetParent === null) { console.log("Span de erro sumiu. Pulando."); continue; }
                try {
                    const errorText = errorSpan.textContent.trim(); if (!errorText) continue;
                    console.log(`Processando erro: "${errorText}"`);
                    const currentTextValue = targetTextarea.value; const errorIndex = currentTextValue.indexOf(errorText);
                    if (errorIndex === -1) { console.log(`Erro "${errorText}" não encontrado na textarea. Pulando.`); continue; }
                    errorSpan.click(); console.log('Clicou no span de erro.'); await new Promise(r => setTimeout(r, 150));
                    let suggestionList;
                    try { suggestionList = await waitForElement('ul#menu-list-grow', 2500); }
                    catch (e) { console.warn(`Lista de sugestões não apareceu para "${errorText}". Pulando.`); document.body.click(); await new Promise(r => setTimeout(r, 150)); errorCount++; continue; }
                    const suggestionItems = suggestionList.querySelectorAll('li');
                    const validSuggestions = Array.from(suggestionItems).slice(1).map(li => li.textContent.trim()).filter(text => text.length > 0);
                    console.log('Sugestões encontradas:', validSuggestions);
                    if (validSuggestions.length > 0) {
                        const chosenSuggestion = validSuggestions[0]; console.log(`Sugestão escolhida: "${chosenSuggestion}"`);
                        targetTextarea.focus(); targetTextarea.selectionStart = errorIndex; targetTextarea.selectionEnd = errorIndex + errorText.length;
                        console.log(`Texto "${errorText}" selecionado.`); await new Promise(r => setTimeout(r, 50));
                        console.log(`Simulando Backspace...`); activeEl = targetTextarea; await simulateBackspace(targetTextarea);
                        console.log('Seleção apagada.'); await new Promise(r => setTimeout(r, 50));
                        console.log(`Simulando digitação de "${chosenSuggestion}"...`); activeEl = targetTextarea;
                        for (const char of chosenSuggestion) { if (btnCorrect.disabled === false) break; sendChar(char); await new Promise(r => setTimeout(r, typingDelayCorrect)); }
                        if (btnCorrect.disabled === false) { console.log("Digitação da correção interrompida."); break; }
                        console.log('Digitação da correção simulada.'); correctedCount++;
                    } else { console.warn(`Nenhuma sugestão válida encontrada para "${errorText}".`); errorCount++; }
                    console.log('Tentando fechar a lista de sugestões.'); document.body.click(); await new Promise(r => setTimeout(r, 200));
                } catch (error) {
                    console.error(`Erro processando o span "${errorSpan?.textContent?.trim()}":`, error); errorCount++;
                    try { document.body.click(); } catch(e){} await new Promise(r => setTimeout(r, 200));
                }
                 await new Promise(r => setTimeout(r, 100));
            } // Fim loop
            btnCorrect.disabled = false; if (startButton) startButton.disabled = false;
            console.log('Correção simulada concluída.');
             let finalMessage = `Correção finalizada! ${correctedCount} erros foram processados.`;
             if (errorCount > 0) { finalMessage += ` ${errorCount} erros não puderam ser corrigidos.`; }
             showCustomAlert(finalMessage, errorCount > 0 ? 'info' : 'success');
        }; // Fim onclick correctButton

    }, 4000); // Fim do setTimeout principal

})(); // Fim da IIFE
