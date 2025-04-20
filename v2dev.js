(function() {
  // evita duplo carregamento
  if (document.getElementById('bmSplash')) return;

  // guarda último elemento clicado (CRUCIAL para ambas as funções)
  let activeEl = null;
  document.addEventListener('mousedown', e => {
    // console.log('mousedown detected, activeEl set to:', e.target); // Descomente para debug
    activeEl = e.target;
  }, true); // Use capturing phase

  // --- FUNÇÃO CUSTOM ALERT ---
  function showCustomAlert(message) {
    // Remove alerta anterior se existir
    const existingAlert = document.getElementById('bmAlertOverlay');
    if (existingAlert) {
      document.body.removeChild(existingAlert);
    }

    // Cria Overlay
    const overlay = document.createElement('div');
    overlay.id = 'bmAlertOverlay';

    // Cria Caixa de Alerta
    const alertBox = document.createElement('div');
    alertBox.id = 'bmAlertBox';

    // Cria Mensagem
    const alertMessage = document.createElement('p');
    alertMessage.id = 'bmAlertMessage';
    alertMessage.textContent = message;

    // Cria Botão OK
    const alertButton = document.createElement('button');
    alertButton.id = 'bmAlertButton';
    alertButton.textContent = 'Entendido';
    alertButton.onclick = () => {
      alertBox.classList.remove('show'); // Inicia animação de saída
      overlay.classList.remove('show'); // Inicia animação de saída
      // Remove do DOM após a animação
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 300); // Deve corresponder à duração da transição de saída
    };

    // Monta a Caixa
    alertBox.appendChild(alertMessage);
    alertBox.appendChild(alertButton);

    // Adiciona ao Overlay (ou direto ao body, aqui adicionamos ao body para facilitar z-index)
    overlay.appendChild(alertBox); // Se quiser que o alertBox saia junto com overlay
    document.body.appendChild(overlay);
    // document.body.appendChild(alertBox); // Se preferir controlar separadamente

    // Força reflow para garantir que a animação inicial funcione
    void overlay.offsetWidth;
    void alertBox.offsetWidth;

    // Adiciona classe para iniciar animação de entrada
    overlay.classList.add('show');
    alertBox.classList.add('show');

     // Foca no botão para acessibilidade e conveniência
     alertButton.focus();
  }


  // --- FUNÇÕES DE SIMULAÇÃO DE TECLADO (Sem mudanças internas, apenas chamadas de alerta) ---

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
      if (start === end && start > 0) {
        const currentValue = targetElement.value;
        const newValue = currentValue.substring(0, start - 1) + currentValue.substring(end);
        const prototype = Object.getPrototypeOf(targetElement);
        const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
        if (descriptor && descriptor.set) {
          descriptor.set.call(targetElement, newValue);
        } else {
          targetElement.value = newValue;
        }
        targetElement.selectionStart = targetElement.selectionEnd = start - 1;
        targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      } else if (start !== end) {
        const currentValue = targetElement.value;
        const newValue = currentValue.substring(0, start) + currentValue.substring(end);
        const prototype = Object.getPrototypeOf(targetElement);
        const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
        if (descriptor && descriptor.set) {
          descriptor.set.call(targetElement, newValue);
        } else {
          targetElement.value = newValue;
        }
        targetElement.selectionStart = targetElement.selectionEnd = start;
        targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      }
    } else if (targetElement.isContentEditable) {
      document.execCommand('delete', false, null);
    }

    dispatchKeyEvent(targetElement, 'keyup', 'Backspace', 8);
    await new Promise(r => setTimeout(r, 5)); // Reduzi um pouco o delay padrão
  }

  function sendChar(c) {
    if (!activeEl) {
      console.warn("sendChar chamada, mas activeEl é nulo.");
      return;
    }
    if (!document.body.contains(activeEl)) {
      console.warn("sendChar chamada, mas activeEl não está mais no DOM.");
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

  // --- CSS (Adicionado estilos para Alert e refinado animações existentes) ---
  const css = `
    /* === SPLASH === */
    #bmSplash {
      /* ... (mantido como antes) ... */
      animation: fadeOutSplash 1s ease-out forwards 3s; /* Adicionado ease-out */
    }
    #bmSplashImg {
      /* ... (mantido como antes) ... */
      animation: popInSplash .5s ease-out forwards, moveUpSplash .5s ease-out forwards .8s; /* Adicionado ease-out */
    }
    #bmSplashTxt1 { animation: txt1PopSplash .5s ease-out forwards 1.3s } /* Adicionado ease-out */
    #bmSplashTxt2 { animation: txt2PopSplash .5s ease-out forwards 1.8s } /* Adicionado ease-out */

    /* Keyframes Splash com easing */
    @keyframes popInSplash { from{transform:scale(0)} to{transform:scale(1)} }
    @keyframes moveUpSplash { from{transform:translateY(0)} to{transform:translateY(-30px)} }
    @keyframes txt1PopSplash { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes txt2PopSplash { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeOutSplash { to{opacity:0; visibility: hidden;} } /* Hidden no final */

    /* === WRAPPER PRINCIPAL === */
    #bmWrapper {
      /* ... (mantido como antes) ... */
      transform: translateY(-20px) scale(.95);
      /* Usando cubic-bezier para um 'pop' mais suave */
      transition: opacity .35s cubic-bezier(0.18, 0.89, 0.32, 1.1), transform .35s cubic-bezier(0.18, 0.89, 0.32, 1.1);
      z-index: 99998;
    }
    #bmWrapper.show {
      opacity: 1; transform: translateY(0) scale(1);
    }

    /* header */
    #bmHeader {
      /* ... (mantido como antes) ... */
    }

    /* conteúdo */
    #bmContent {
      /* ... (mantido como antes) ... */
    }
    #bmContent textarea,
    #bmContent input {
      /* ... (mantido como antes) ... */
      transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out; /* Suavizado foco */
    }
    #bmContent textarea:focus,
    #bmContent input:focus {
       /* ... (mantido como antes) ... */
    }
    /* Estilo comum para botões */
    #bmContent button {
      /* ... (mantido como antes) ... */
      /* Transição mais suave */
      transition: background .2s ease-out, color .2s ease-out, transform .15s ease-out, border-color .2s ease-out;
    }
    #bmContent button:disabled {
       /* ... (mantido como antes) ... */
    }
    #bmContent button:not(:disabled):hover {
      background: #8A2BE2;
      color: #111;
      transform: translateY(-2px) scale(1.02); /* Efeito levemente elevado */
      box-shadow: 0 3px 6px rgba(138, 43, 226, 0.4);
    }
    #bmContent button:not(:disabled):active {
      transform: scale(.96); /* Redução um pouco maior no clique */
      box-shadow: none;
    }

    /* toggle “Modo Disfarçado” */
    #bmToggleWrapper {
       /* ... (mantido como antes) ... */
    }
    #bmToggleImg {
       /* ... (mantido como antes) ... */
       transition: background .2s ease-out; /* Suavizado */
    }
    #bmToggleText {
       /* ... (mantido como antes) ... */
    }

    /* contador 3-2-1 */
    @keyframes countPop { /* Adicionado easing */
      0%   { opacity:0; transform:scale(0.5) }
      50%  { opacity:1; transform:scale(1.2) }
      100% { opacity:0; transform:scale(1) }
    }

    /* overlay stealth */
    #bmOv {
       /* ... (mantido como antes) ... */
       animation: ovFadeIn .4s ease-out forwards; /* Adicionado ease-out */
    }
    #bmOv img {
       /* ... (mantido como antes) ... */
       animation: popInSplash .5s ease-out forwards; /* Reutilizado popIn */
    }
    #bmOv button {
       /* ... (mantido como antes) ... */
       transition: transform .2s ease-out, background .2s ease-out; /* Suavizado */
    }
    #bmOv button:hover {
       /* ... (mantido como antes) ... */
       transform: scale(1.05);
    }
    @keyframes ovFadeIn { from{opacity:0} to{opacity:1} }

    /* === CUSTOM ALERT === */
    #bmAlertOverlay {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000; /* Acima de tudo */
      opacity: 0;
      transition: opacity 0.3s ease-out;
    }
    #bmAlertOverlay.show {
      opacity: 1;
    }
    #bmAlertBox {
      background: #1e1e1e;
      padding: 25px;
      border-radius: 8px;
      border: 1px solid #333;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.6);
      color: #fff;
      font-family: 'Segoe UI', sans-serif; /* Usar fonte mais padrão para alerta */
      text-align: center;
      min-width: 280px;
      max-width: 450px;
      opacity: 0;
      transform: scale(0.8);
       /* Animação de entrada/saída */
      transition: opacity 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.2), transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.2);
    }
    #bmAlertOverlay.show #bmAlertBox { /* Animação só acontece quando overlay tem 'show' */
       opacity: 1;
       transform: scale(1);
    }
     /* Estilos específicos para o conteúdo do alerta */
    #bmAlertMessage {
       font-size: 0.95em;
       margin: 0 0 20px 0; /* Espaço abaixo da mensagem */
       line-height: 1.5;
    }
    #bmAlertButton { /* Reutiliza e adapta estilo dos botões principais */
       display: inline-block; /* Não ocupa 100% */
       width: auto;
       min-width: 100px;
       padding: 8px 20px;
       margin-top: 0; /* Reset margin */
       font-size: 0.9em;
       font-weight: bold; /* Botão de alerta mais destacado */
       background: #8A2BE2; /* Fundo sólido para destaque */
       border: 1px solid #8A2BE2;
       border-radius: 5px;
       color: #fff; /* Texto branco no botão roxo */
       cursor: pointer;
       transition: background .2s ease-out, transform .15s ease-out, box-shadow .2s ease-out;
       box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
     #bmAlertButton:hover {
       background: #7925c7; /* Tom mais escuro no hover */
       transform: scale(1.05);
       box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    }
     #bmAlertButton:active {
       transform: scale(0.98);
       background: #6a21b1; /* Ainda mais escuro no active */
       box-shadow: none;
    }
     #bmAlertButton:focus { /* Estilo de foco para acessibilidade */
        outline: 2px solid #a36add;
        outline-offset: 2px;
     }

  `;
  const styleTag = document.createElement('style');
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);

  //
  // 3) após splash, monta UI principal
  //
  setTimeout(() => {
    const splash = document.getElementById('bmSplash'); // Pega a referência aqui
    if (document.body.contains(splash)) {
      // Adiciona classe para fade out ANTES de remover, se a animação não completou
      if (!splash.style.animationPlayState || splash.style.animationPlayState !== 'paused') {
         splash.style.opacity = '0'; // Garante que suma visualmente rápido
         splash.style.visibility = 'hidden';
      }
      // Remove após um tempo seguro para a animação CSS (se houver) ou imediatamente
       setTimeout(() => {
           if (document.body.contains(splash)) {
              document.body.removeChild(splash);
           }
       }, 1000); // Tempo da animação fadeOutSplash
    }


    const wrapper = document.createElement('div');
    wrapper.id = 'bmWrapper';
    wrapper.innerHTML = `
      <div id="bmHeader">Paraná Colado V1 - AutoEditor Simulado</div>
      <div id="bmContent">
        <textarea id="bmText" placeholder="Cole o texto aqui para 'Iniciar'"></textarea>
        <input     id="bmDelay" type="number" step="0.01" value="0.05" placeholder="Delay em s (para 'Iniciar')">
        <div id="bmToggleWrapper">
          <div id="bmToggleImg"></div>
          <span id="bmToggleText">Modo Disfarçado</span>
        </div>
        <button id="bmBtn">Iniciar Digitação</button>
        <button id="bmBtnCorrect">Corrigir Automaticamente</button>
      </div>
    `;
    document.body.appendChild(wrapper);
    setTimeout(() => wrapper.classList.add('show'), 50); // Delay menor para aparecer

    // Lógica de arrastar (mantida)
    const header = document.getElementById('bmHeader');
    let isDragging = false;
    header.onmousedown = e => {
        // Evita iniciar arrastar se clicar em botões dentro do header (se houver)
        if (e.target !== header) return;
        isDragging = true;
        header.style.cursor = 'grabbing'; // Feedback visual
        const dx = e.clientX - wrapper.offsetLeft;
        const dy = e.clientY - wrapper.offsetTop;

        document.onmousemove = ev => {
            if (!isDragging) return;
            // Adiciona limites para não arrastar para fora da tela (opcional)
            let newX = ev.clientX - dx;
            let newY = ev.clientY - dy;
            const maxX = window.innerWidth - wrapper.offsetWidth;
            const maxY = window.innerHeight - wrapper.offsetHeight;
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            wrapper.style.left = newX + 'px';
            wrapper.style.top  = newY + 'px';
        };
        document.onmouseup = () => {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'move'; // Restaura cursor
                document.onmousemove = null;
                document.onmouseup   = null;
            }
        };
         // Previne seleção de texto durante o arraste
         e.preventDefault();
    };
    // Garante que soltar o mouse em qualquer lugar pare o arraste
    document.addEventListener('mouseup', () => {
         if (isDragging) {
            isDragging = false;
            header.style.cursor = 'move';
            document.onmousemove = null;
            document.onmouseup = null; // Limpa o onmouseup do header também
        }
    }, true); // Usa captura para garantir


    //
    // 4) lógica “Modo Disfarçado” (Refinada visualmente)
    //
    const toggleBox = document.getElementById('bmToggleImg');
    const toggleText = document.getElementById('bmToggleText');
    let stealthOn = false;
    let firstTime = true; // Corrigido: usar 'true' para mostrar overlay na primeira vez
    const imgOnBg = '#8A2BE2';
    const imgOffBg = 'transparent';
    let rect;
    let hideTimeout; // Para debouncing do hide

    function applyTheme(theme) {
        const isStealth = theme === 'stealth';
        // Cores Base
        const wrapperBg = isStealth ? '#f0f0f0' : '#1e1e1e';
        const headerBg = isStealth ? '#dcdcdc' : '#111';
        const headerColor = isStealth ? '#333' : '#fff';
        const wrapperColor = isStealth ? '#333' : '#fff';
        // Inputs/Textareas
        const inputBg = isStealth ? '#fff' : '#2a2a2a';
        const inputColor = isStealth ? '#000' : '#fff';
        const inputBorder = isStealth ? '#ccc' : '#333';
        // Botões
        const btnBg = isStealth ? '#e0e0e0' : 'transparent';
        const btnColor = isStealth ? '#555' : '#8A2BE2';
        const btnBorder = isStealth ? '#aaa' : '#8A2BE2';
        // Toggle
        const toggleTextColor = isStealth ? '#555' : '#fff';
        const toggleBoxBorder = isStealth ? '#aaa' : '#8A2BE2';

        // Aplica estilos
        wrapper.style.background = wrapperBg;
        wrapper.style.color = wrapperColor;
        header.style.background = headerBg;
        header.style.color = headerColor;
        toggleText.style.color = toggleTextColor;
        toggleBox.style.borderColor = toggleBoxBorder;

        wrapper.querySelectorAll('textarea, input').forEach(i => {
            i.style.background = inputBg;
            i.style.color = inputColor;
            i.style.border = `1px solid ${inputBorder}`;
        });
        wrapper.querySelectorAll('button').forEach(b => {
            // Não sobrescreve hover/active, apenas base
            b.style.background = btnBg;
            b.style.color = btnColor;
            b.style.borderColor = btnBorder;
            // Adapta estilo desabilitado
             if (b.disabled) {
                b.style.borderColor = isStealth ? '#ccc' : '#555';
                b.style.color = isStealth ? '#999' : '#555';
                b.style.background = isStealth ? '#f5f5f5' : '#2a2a2a'; // Fundo levemente diferente no stealth disabled
             }
        });
    }


    function enterStealth() {
        applyTheme('stealth');
        wrapper.addEventListener('mouseleave', scheduleHideUI);
        wrapper.addEventListener('mouseenter', cancelHideUI); // Cancela se voltar rápido
        document.addEventListener('mousemove', handleShowUI);
        console.log('Entered Stealth Mode');
    }

    function exitStealth() {
        applyTheme('normal'); // Restaura tema normal
        wrapper.removeEventListener('mouseleave', scheduleHideUI);
        wrapper.removeEventListener('mouseenter', cancelHideUI);
        document.removeEventListener('mousemove', handleShowUI);
        // Garante que esteja visível ao sair
        cancelHideUI(); // Cancela qualquer timeout pendente
        wrapper.style.opacity = 1;
        wrapper.style.pointerEvents = 'auto';
        console.log('Exited Stealth Mode');
    }

    function scheduleHideUI() {
         clearTimeout(hideTimeout); // Limpa timeout anterior
         hideTimeout = setTimeout(() => {
            rect = wrapper.getBoundingClientRect(); // Atualiza posição ao esconder
            wrapper.style.opacity = 0;
            wrapper.style.pointerEvents = 'none';
            console.log('UI Hidden');
         }, 300); // Espera 300ms antes de esconder
    }

    function cancelHideUI() {
        clearTimeout(hideTimeout); // Cancela o agendamento para esconder
        // Se já estiver escondido, mostra imediatamente
        if (parseFloat(wrapper.style.opacity) === 0) {
            wrapper.style.opacity = 1;
            wrapper.style.pointerEvents = 'auto';
            console.log('UI Shown (cancelled hide)');
        }
    }

     function handleShowUI(ev) {
         // Só mostra se estiver escondido e o mouse estiver sobre a área guardada
         if (rect && parseFloat(wrapper.style.opacity) === 0 &&
             ev.clientX >= rect.left && ev.clientX <= rect.right &&
             ev.clientY >= rect.top  && ev.clientY <= rect.bottom
         ) {
            cancelHideUI(); // Usa a função cancelHide para mostrar
            console.log('UI Shown (hovered area)');
         }
     }

    function showOverlay() {
      const ov = document.createElement('div');
      ov.id = 'bmOv';
      ov.innerHTML = `
        <img src="https://i.imgur.com/RquEok4.gif"/>
        <p style="color: white; font-family: 'Segoe UI', sans-serif; text-align: center; margin-top: 15px; font-size:0.9em; max-width: 80%;">O Modo Disfarçado oculta a janela quando o mouse não está sobre ela.<br>Mova o mouse sobre a área onde a janela estava para reaparecer.</p>
        <button id="bmOvBtn">Entendido, Ativar</button>
      `;
      document.body.appendChild(ov);
      document.getElementById('bmOvBtn').onclick = () => {
        // Animação de saída para o overlay
        ov.style.transition = 'opacity 0.3s ease-out';
        ov.style.opacity = '0';
        setTimeout(() => {
             if (document.body.contains(ov)){
                 document.body.removeChild(ov);
             }
        }, 300);
        enterStealth(); // Ativa o modo após fechar
      };
    }

    toggleBox.onclick = () => {
      stealthOn = !stealthOn;
      toggleBox.style.background = stealthOn ? imgOnBg : imgOffBg;
      if (stealthOn) {
        if (firstTime) {
          firstTime = false; // Marca que já mostrou o overlay
          showOverlay();
        } else {
          enterStealth();
        }
      } else {
        exitStealth();
      }
    };
    // Inicializa no modo normal aplicando o tema
    exitStealth();


    //
    // 6) botão Iniciar + contador 3‑2‑1 (Usando showCustomAlert)
    //
    document.getElementById('bmBtn').onclick = async function() {
      const text = document.getElementById('bmText').value;
      const delayInput = parseFloat(document.getElementById('bmDelay').value);
      const delay = (!isNaN(delayInput) && delayInput >= 0.01) ? delayInput * 1000 : 50; // Mínimo de 10ms

      if (!text) return showCustomAlert('O texto para "Iniciar Digitação" está vazio!');
      if (!activeEl || !document.body.contains(activeEl) || !['INPUT', 'TEXTAREA'].includes(activeEl.tagName) && !activeEl.isContentEditable) {
           return showCustomAlert('Clique primeiro em um campo de texto ou área editável ANTES de clicar em "Iniciar Digitação"!');
       }

      const startButton = this; // Renomeado para clareza
      startButton.disabled = true;
      const correctButton = document.getElementById('bmBtnCorrect');
      if (correctButton) correctButton.disabled = true;
      applyTheme(stealthOn ? 'stealth' : 'normal'); // Re-aplica tema para estilo disabled

      // contador estilizado (mantido, mas usando keyframes aprimorados)
      for (let n = 3; n >= 1; n--) {
        const cnt = document.createElement('div');
        cnt.textContent = n;
        Object.assign(cnt.style, {
          position: 'absolute',
          top: '60px', // Pouco mais abaixo
          right: '20px',
          fontFamily: 'Segoe UI Black, sans-serif',
          color: '#8A2BE2',
          fontSize: '2em', // Maior
          fontWeight: 'bold',
          opacity: 0,
          animation: 'countPop .7s ease-in-out forwards', // Usando a keyframe
          zIndex: '10'
        });
        wrapper.appendChild(cnt);
        await new Promise(r => setTimeout(r, 700)); // Duração da animação
        if (wrapper.contains(cnt)) wrapper.removeChild(cnt);
         await new Promise(r => setTimeout(r, 150)); // Pausa menor entre números
      }

      // digita
      try {
        activeEl.focus();
        for (let i = 0; i < text.length; i++) {
            // Verifica se o elemento ainda existe antes de cada caractere
             if (!document.body.contains(activeEl)) {
                throw new Error("Elemento de destino removido durante a digitação.");
             }
            sendChar(text[i]);
            await new Promise(r => setTimeout(r, delay));
        }
      } catch (error) {
        console.error("Erro durante a digitação simulada ('Iniciar'):", error);
        showCustomAlert("Ocorreu um erro durante a digitação. Verifique o console (F12) para detalhes.");
      } finally {
        startButton.disabled = false;
        if (correctButton) correctButton.disabled = false;
         applyTheme(stealthOn ? 'stealth' : 'normal'); // Re-aplica tema para estilo enabled
      }
    };


    // --- INÍCIO DA NOVA LÓGICA: CORRIGIR (Usando showCustomAlert) ---

    function waitForElement(selector, timeout = 5000, root = document) {
      // console.log(`Esperando por elemento: ${selector}`); // Descomente para debug
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
          const element = root.querySelector(selector);
          // Verifica se está visível/no layout (offsetParent) OU se é a lista de sugestões (que pode não ter offsetParent mas estar visível)
          if (element && (element.offsetParent !== null || selector === 'ul#menu-list-grow')) {
            clearInterval(interval);
            // console.log(`Elemento encontrado: ${selector}`); // Descomente para debug
            resolve(element);
          } else if (Date.now() - startTime > timeout) {
            clearInterval(interval);
            console.error(`Timeout esperando por elemento: ${selector}`);
            reject(new Error(`Timeout esperando por elemento: ${selector}`));
          }
        }, 100);
      });
    }

    document.getElementById('bmBtnCorrect').onclick = async function() {
      const correctButton = this;
      correctButton.disabled = true;
      const startButton = document.getElementById('bmBtn');
      if (startButton) startButton.disabled = true;
       applyTheme(stealthOn ? 'stealth' : 'normal'); // Re-aplica tema para estilo disabled

      console.log('Iniciando correção simulada...');
      const typingDelayCorrect = 35; // Aumentei levemente para parecer mais natural
      const backspaceDelay = 15;     // Idem

      const targetTextarea = document.querySelector('textarea#outlined-multiline-static.jss17');
      if (!targetTextarea) {
        showCustomAlert('ERRO: Textarea principal de redação (#outlined-multiline-static.jss17) não encontrada!');
        console.error('Textarea principal não encontrada.');
        correctButton.disabled = false;
        if (startButton) startButton.disabled = false;
        applyTheme(stealthOn ? 'stealth' : 'normal');
        return;
      }
      console.log('Textarea principal encontrada.');

      // Seletor mais robusto para spans de erro, buscando dentro do container jss24
       const errorContainer = targetTextarea.closest('.jss24'); // Procura o container pai mais próximo
       let errorSpans = [];
       if (errorContainer) {
           errorSpans = errorContainer.querySelectorAll('p.MuiTypography-root.jss23 div[style*="white-space: break-spaces"] > span');
       } else {
            // Fallback para o seletor original se não achar o container (menos ideal)
            errorSpans = document.querySelectorAll('div.jss24 p.MuiTypography-root.jss23 div[style*="white-space: break-spaces"] > span');
            console.warn("Container de erro '.jss24' não encontrado perto da textarea, usando seletor global menos preciso.");
       }


      if (errorSpans.length === 0) {
        showCustomAlert('Nenhum erro (span clicável na estrutura esperada) encontrado para corrigir.');
        console.log('Nenhum span de erro encontrado com o seletor especificado.');
        correctButton.disabled = false;
        if (startButton) startButton.disabled = false;
         applyTheme(stealthOn ? 'stealth' : 'normal');
        return;
      }
      console.log(`Encontrados ${errorSpans.length} spans de erro potenciais.`);

      let correctedCount = 0;
      let errorOccurred = false; // Flag para saber se houve erro no loop

       // Foca na textarea principal ANTES do loop para garantir contexto inicial
       targetTextarea.focus();
       await new Promise(r => setTimeout(r, 100)); // Pequena pausa

      for (const errorSpan of errorSpans) {
        // Verifica se o span ainda está no DOM antes de processar
         if (!document.body.contains(errorSpan)) {
            console.log("Span de erro removido do DOM. Pulando.");
            continue;
         }

        try {
          const errorText = errorSpan.textContent.trim().replace(/\s+/g, ' '); // Normaliza espaços
          if (!errorText) continue;

          console.log(`Processando erro: "${errorText}"`);

          // 3.1 Encontrar posição na TEXTAREA (busca mais robusta)
          const currentTextValue = targetTextarea.value.replace(/\s+/g, ' '); // Normaliza espaços aqui também
          let errorIndex = -1;
          let searchStartIndex = 0;
           // Tenta encontrar múltiplas ocorrências se necessário (embora a UI geralmente destaque uma)
           while ((errorIndex = currentTextValue.indexOf(errorText, searchStartIndex)) !== -1) {
               // Heurística: Verifica se a posição do span na tela está próxima visualmente
               // (Isso é complexo e frágil, vamos focar em encontrar a primeira ocorrência por enquanto)
               // Por simplicidade, vamos pegar a primeira ocorrência. Em cenários complexos,
               // seria necessário mapear a posição do span para a posição do texto.
               break; // Usa a primeira encontrada
                // searchStartIndex = errorIndex + 1; // Para procurar a próxima
           }


          if (errorIndex === -1) {
            console.log(`Erro "${errorText}" não encontrado na textarea editável (após normalização). Pulando.`);
            continue;
          }

          // 4. Simular clique no erro
           // Garante que o span esteja visível antes de clicar (scrollIntoViewIfNeeded é não-padrão)
           errorSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
           await new Promise(r => setTimeout(r, 300)); // Espera o scroll terminar
          errorSpan.click();
          console.log('Clicou no span de erro.');
          await new Promise(r => setTimeout(r, 150)); // Pausa após clique

          // 5. Esperar lista de sugestões (no Popover/Menu que deve aparecer)
          let suggestionList;
          // O menu pode estar em um Popover fora do fluxo normal, busca no body
          const popover = document.querySelector('.MuiPopover-root'); // Seletor comum para popovers Material-UI
          const searchRoot = popover || document.body; // Busca no popover se existir, senão no body

          try {
             // Espera um pouco mais pela lista
            suggestionList = await waitForElement('ul.MuiList-root', 4000, searchRoot); // Seletor comum MuiList
          } catch (e) {
            console.warn(`Lista de sugestões não apareceu para "${errorText}". Tentando fechar e pular.`);
             try { document.body.click(); } catch(clickErr){} // Tenta fechar menu fantasma
            await new Promise(r => setTimeout(r, 200));
            continue;
          }

          // 6. Coletar e escolher sugestão
           // Seletor mais específico para itens de menu Material-UI que são botões ou itens de lista
          const suggestionItems = suggestionList.querySelectorAll('li.MuiMenuItem-root, li[role="menuitem"]');
          const validSuggestions = Array.from(suggestionItems)
            // .slice(1) // Remove o slice(1), pode não haver cabeçalho
            .map(li => li.textContent.trim())
            .filter(text => text && text.length > 0 && text.toLowerCase() !== 'ignorar'); // Filtra vazios e "Ignorar"

          console.log('Sugestões encontradas:', validSuggestions);

          if (validSuggestions.length > 0) {
             // Escolhe a primeira sugestão em vez de aleatória para consistência
            const chosenSuggestion = validSuggestions[0];
            console.log(`Sugestão escolhida: "${chosenSuggestion}"`);

            // --- SIMULAÇÃO DE EDIÇÃO ---
            targetTextarea.focus();
            // Usa o errorIndex encontrado anteriormente (na string normalizada)
            // Precisa remapear para a string original se houver diferenças significativas de espaço,
            // mas para simplificar, vamos assumir que a correspondência é direta.
            const originalTextLength = errorText.length; // Usa o tamanho do texto do span
            const selectionEndPos = errorIndex + originalTextLength;

            targetTextarea.selectionStart = errorIndex; // Seleciona o texto a ser substituído
            targetTextarea.selectionEnd = selectionEndPos;
            console.log(`Selecionado texto "${targetTextarea.value.substring(errorIndex, selectionEndPos)}" na textarea.`);
            await new Promise(r => setTimeout(r, 100));

            // 8. SIMULAR BACKSPACE (apenas 1 se selecionado) ou digitar direto
             // Se algo está selecionado, a próxima digitação substitui
             /* // Não precisa de backspace se selecionou
             console.log(`Simulando ${originalTextLength} backspaces...`);
             activeEl = targetTextarea;
             for (let i = 0; i < originalTextLength; i++) {
               await simulateBackspace(targetTextarea);
               await new Promise(r => setTimeout(r, backspaceDelay));
             }
             console.log('Backspaces simulados.');
             */
            // await new Promise(r => setTimeout(r, 50));

            // 9. SIMULAR DIGITAÇÃO da correção
            console.log(`Simulando digitação de "${chosenSuggestion}"...`);
            activeEl = targetTextarea; // Garante activeEl
            for (const char of chosenSuggestion) {
              sendChar(char); // sendChar lida com a substituição da seleção
              await new Promise(r => setTimeout(r, typingDelayCorrect));
            }
            console.log('Digitação da correção simulada.');
            correctedCount++;
            // --- FIM DA SIMULAÇÃO ---

          } else {
            console.warn(`Nenhuma sugestão válida encontrada para "${errorText}".`);
             // Clica no body para tentar fechar o menu mesmo sem sugestão
             try { document.body.click(); } catch(clickErr){}
             await new Promise(r => setTimeout(r, 250));
          }

          // 10. Fechar/Remover a lista (pode já ter fechado ao digitar, mas garante)
           const currentPopover = document.querySelector('.MuiPopover-root');
           if (currentPopover && document.body.contains(currentPopover)) {
                console.log('Tentando fechar o Popover/Menu clicando no body.');
                try { document.body.click(); } catch(clickErr){}
                await new Promise(r => setTimeout(r, 300)); // Aumenta pausa após fechar menu
           } else {
               console.log('Menu/Popover não encontrado para fechar ou já fechado.');
               await new Promise(r => setTimeout(r, 50)); // Pausa menor
           }


        } catch (error) {
          console.error(`Erro processando o span "${errorSpan?.textContent?.trim()}":`, error);
          errorOccurred = true; // Marca que houve erro
          try { document.body.click(); } catch(e){} // Tenta fechar menu em caso de erro
          await new Promise(r => setTimeout(r, 200));
        }
          // Pausa extra entre processamento de erros
          await new Promise(r => setTimeout(r, 200));

      } // Fim do loop for...of

      // Reabilita os botões
      correctButton.disabled = false;
      if (startButton) startButton.disabled = false;
      applyTheme(stealthOn ? 'stealth' : 'normal'); // Re-aplica tema para estilo enabled

      console.log('Correção simulada concluída.');
      if (errorOccurred) {
          showCustomAlert(`Correção simulada finalizada com alguns erros (verifique o console F12). ${correctedCount} erros foram processados com sucesso.`);
      } else {
          showCustomAlert(`Correção simulada finalizada! ${correctedCount} erros foram processados.`);
      }


    }; // Fim do onclick bmBtnCorrect

    // --- FIM DA NOVA LÓGICA ---

  }, 3000); // Reduzi o tempo do splash para 3s total

})(); // Fim da IIFE
