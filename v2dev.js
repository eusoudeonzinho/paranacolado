(function() {
  // evita duplo carregamento
  if (document.getElementById('bmSplash')) return;

  // guarda último elemento clicado (CRUCIAL para ambas as funções)
  let activeEl = null;
  document.addEventListener('mousedown', e => {
    // Ignora cliques dentro da própria UI do script para não perder o foco do target real
    if (e.target.closest('#bmWrapper') || e.target.closest('#bmCustomAlertOverlay')) {
        return;
    }
    console.log('mousedown detected, activeEl set to:', e.target);
    activeEl = e.target;
  }, true); // Use capturing phase

  // --- FUNÇÃO DE ALERTA PERSONALIZADO ---
  function showCustomAlert(message) {
    // Remove alerta anterior se existir
    const existingAlert = document.getElementById('bmCustomAlertOverlay');
    if (existingAlert) {
      existingAlert.remove();
    }

    // Cria Overlay
    const overlay = document.createElement('div');
    overlay.id = 'bmCustomAlertOverlay';

    // Cria Caixa de Alerta
    const box = document.createElement('div');
    box.id = 'bmCustomAlertBox';

    // Cria Mensagem
    const msg = document.createElement('p');
    msg.id = 'bmCustomAlertMessage';
    msg.textContent = message;

    // Cria Botão OK
    const btn = document.createElement('button');
    btn.id = 'bmCustomAlertButton';
    btn.textContent = 'OK';
    btn.onclick = () => {
      box.classList.remove('show');
      overlay.classList.remove('show');
      // Espera a animação de saída terminar para remover
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 300); // Mesmo tempo da transição CSS
    };

    // Monta a estrutura
    box.appendChild(msg);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Força o reflow para garantir que a animação de entrada funcione
    requestAnimationFrame(() => {
        overlay.classList.add('show');
        box.classList.add('show');
    });
  }


  // --- FUNÇÕES DE SIMULAÇÃO DE TECLADO (MODIFICADAS/NOVAS) ---

  // Função para simular eventos de teclado genéricos
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


  // Função para SIMULAR a tecla Backspace
  async function simulateBackspace(targetElement) {
      if (!targetElement) return;
      activeEl = targetElement; // Garante que activeEl é o target
      targetElement.focus(); // Garante foco

      const start = targetElement.selectionStart;
      const end = targetElement.selectionEnd;

      dispatchKeyEvent(targetElement, 'keydown', 'Backspace', 8);

      // Lógica manual de exclusão se for INPUT ou TEXTAREA
      if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
          if (start === end && start > 0) { // Se for cursor (não seleção) e não estiver no início
              const currentValue = targetElement.value;
              const newValue = currentValue.substring(0, start - 1) + currentValue.substring(end);
              const prototype = Object.getPrototypeOf(targetElement);
              const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
              if (descriptor && descriptor.set) {
                  descriptor.set.call(targetElement, newValue);
              } else {
                  targetElement.value = newValue; // Fallback
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
                  targetElement.value = newValue; // Fallback
              }
              targetElement.selectionStart = targetElement.selectionEnd = start;
              targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
              targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          }
      } else if (targetElement.isContentEditable) {
          document.execCommand('delete', false, null);
      }

      dispatchKeyEvent(targetElement, 'keyup', 'Backspace', 8);
      await new Promise(r => setTimeout(r, 5)); // Reduzi um pouco o delay do backspace para parecer mais fluido
  }

  // Função para SIMULAR digitação de um caractere (REUTILIZADA E VERIFICADA)
  function sendChar(c) {
      if (!activeEl) {
          console.warn("sendChar chamada, mas activeEl é nulo. Clique em um campo primeiro.");
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
              targetElement.value = newValue; // Fallback
          }
          targetElement.selectionStart = targetElement.selectionEnd = start + c.length;
          targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      }

      dispatchKeyEvent(targetElement, 'keyup', c, keyCode);
  }

  // --- RESTANTE DO CÓDIGO (Splash, CSS, UI, Modo Disfarçado) ---

  // 1) SPLASH INICIAL
  const splash = document.createElement('div');
  splash.id = 'bmSplash';
  splash.innerHTML = `
    <img id="bmSplashImg" src="https://i.imgur.com/RUWcJ6e.png"/>
    <div id="bmSplashTxt1">Paraná Tools - Redação</div>
    <div id="bmSplashTxt2">paranatools.github.io</div>
  `;
  document.body.appendChild(splash);

  // 2) CSS injetado (Com estilos do Alerta e Animações Refinadas)
  const css = `
    /* === SPLASH === */
    #bmSplash {
      position: fixed; top:0; left:0;
      width:100%; height:100%;
      background:#000;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      z-index:99999; overflow:hidden;
      animation:fadeOut 1s ease-out forwards 3s; /* Easing */
    }
    #bmSplashImg {
      width:200px;
      animation:popIn .5s ease-out forwards, moveUp .5s ease-out forwards .8s; /* Easing */
    }
    #bmSplashTxt1, #bmSplashTxt2 {
      font-family:'Segoe UI Black',sans-serif;
      color:#fff; font-size:2em; opacity:0;
    }
    #bmSplashTxt1 { animation:txt1Pop .5s ease-out forwards 1.3s } /* Easing */
    #bmSplashTxt2 { animation:txt2Pop .5s ease-out forwards 1.8s } /* Easing */
    @keyframes popIn { from{transform:scale(0)} to{transform:scale(1)} }
    @keyframes moveUp { from{transform:translateY(0)} to{transform:translateY(-30px)} }
    @keyframes txt1Pop { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes txt2Pop { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeOut { to{opacity:0} }

    /* === WRAPPER PRINCIPAL === */
    #bmWrapper {
      position:fixed; top:20px; right:20px;
      width:320px;
      background:#1e1e1e;
      border:1px solid #333;
      border-radius:6px;
      box-shadow:0 6px 15px rgba(0,0,0,.6); /* Sombra mais pronunciada */
      font-family:'Segoe UI',sans-serif; /* Fonte mais padrão */
      color:#fff;
      opacity:0;
      transform:translateY(-20px) scale(.95);
      transition:opacity .3s ease-out, transform .3s ease-out; /* Easing */
      z-index:99998;
    }
    #bmWrapper.show {
      opacity:1; transform:translateY(0) scale(1);
    }

    /* header */
    #bmHeader {
      cursor:move;
      padding:10px 15px; /* Mais padding */
      background:#111;
      border-bottom:1px solid #333;
      font-size:0.95em; /* Levemente maior */
      font-weight: bold; /* Negrito */
      text-align:center;
      border-radius:6px 6px 0 0;
      user-select: none; /* Evita selecionar texto ao arrastar */
    }

    /* conteúdo */
    #bmContent {
      padding:15px; /* Mais padding */
      background:#1b1b1b;
      border-radius: 0 0 6px 6px;
    }
    #bmContent textarea,
    #bmContent input {
      width:100%;
      margin-bottom:12px; /* Mais espaço */
      padding:10px; /* Mais padding */
      font-size:1em; /* Tamanho padrão */
      background:#2a2a2a;
      border:1px solid #444; /* Borda levemente mais clara */
      border-radius:4px;
      color:#eee; /* Cor do texto mais clara */
      box-sizing:border-box;
      transition: border-color .2s ease-out, box-shadow .2s ease-out; /* Transição suave */
    }
    #bmContent textarea {
        min-height: 80px; /* Altura mínima */
        resize: vertical; /* Permitir redimensionar verticalmente */
    }
    #bmContent textarea:focus,
    #bmContent input:focus {
      outline:none;
      border-color:#8A2BE2;
      box-shadow:0 0 8px rgba(138,43,226,.6); /* Sombra mais suave */
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
      border-radius:4px;
      color:#8A2BE2;
      cursor:pointer;
      transition:background .2s ease-out, color .2s ease-out, transform .15s ease-out; /* Easing */
      box-sizing: border-box;
    }
    #bmContent button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      border-color: #555;
      color: #555;
      transform: scale(1); /* Evita scale no estado disabled */
    }
    #bmContent button:not(:disabled):hover {
      background:#8A2BE2;
      color:#111;
      transform:scale(1.02); /* Efeito hover sutil */
    }
    #bmContent button:not(:disabled):active {
      transform:scale(.98); /* Efeito clique sutil */
      transition-duration: .1s; /* Resposta mais rápida no clique */
    }

    /* toggle “Modo Disfarçado” */
    #bmToggleWrapper {
      display:flex;
      align-items:center;
      gap:10px; /* Mais espaço */
      margin-bottom:15px; /* Mais espaço inferior */
      cursor: pointer; /* Cursor de link no wrapper */
      user-select: none;
    }
    #bmToggleImg {
      width:16px; height:16px; /* Maior */
      border:2px solid #8A2BE2; /* Mais grossa */
      border-radius:3px;
      background:transparent;
      transition:background .2s ease-out, border-color .2s ease-out; /* Easing */
      flex-shrink: 0; /* Evita que encolha */
    }
     #bmToggleWrapper:hover #bmToggleImg {
         border-color: #A65FFC; /* Cor levemente mais clara no hover */
     }
    #bmToggleText {
      font-size:0.95em;
      color:#ccc; /* Cor mais suave */
      transition: color .2s ease-out;
    }
     #bmToggleWrapper:hover #bmToggleText {
         color: #fff; /* Texto branco no hover */
     }
    /* contador 3-2-1 */
    @keyframes countPop { /* Animação mais suave */
      0%   { opacity:0; transform:scale(0.6) translateY(10px); }
      50%  { opacity:1; transform:scale(1.1) translateY(0); }
      100% { opacity:0; transform:scale(1) translateY(-5px); }
    }
    /* overlay stealth */
    #bmOv {
      position:fixed;top:0;left:0;
      width:100%;height:100%;
      background:rgba(0,0,0,.9);
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      z-index:100000;
      animation:ovFadeIn .4s ease-out forwards; /* Easing */
    }
    #bmOv img {
      max-width:70%;max-height:50%;
      animation:popIn .5s ease-out forwards; /* Easing */
    }
    #bmOv button {
      margin-top:25px; /* Mais espaço */
      padding:10px 20px; /* Mais padding */
      background:#555; /* Fundo mais escuro */
      color:#fff;
      border:none;border-radius:4px;
      font-size:1em;
      font-weight: bold;
      cursor:pointer;
      transition:transform .2s ease-out, background .2s ease-out; /* Easing */
      width: auto;
    }
    #bmOv button:hover {
      background:#8A2BE2; /* Roxo no hover */
      transform:scale(1.05); /* Efeito hover */
    }
    @keyframes ovFadeIn { from{opacity:0} to{opacity:1} }

    /* === ALERTA PERSONALIZADO === */
    #bmCustomAlertOverlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100001; /* Acima de outros elementos */
        opacity: 0;
        transition: opacity 0.3s ease-out;
    }
    #bmCustomAlertOverlay.show {
        opacity: 1;
    }
    #bmCustomAlertBox {
        background-color: #1e1e1e;
        padding: 25px 30px; /* Mais padding interno */
        border-radius: 8px; /* Bordas mais arredondadas */
        border: 1px solid #444;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.7); /* Sombra mais forte */
        text-align: center;
        color: #eee;
        font-family: 'Segoe UI', sans-serif;
        width: 90%;
        max-width: 400px; /* Largura máxima */
        transform: scale(0.8);
        opacity: 0;
        transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28), opacity 0.2s ease-out; /* Easing com overshoot */
    }
    #bmCustomAlertOverlay.show #bmCustomAlertBox {
        transform: scale(1);
        opacity: 1;
    }
    #bmCustomAlertMessage {
        margin: 0 0 20px 0; /* Espaço abaixo da mensagem */
        font-size: 1.05em;
        line-height: 1.6; /* Melhor espaçamento entre linhas */
    }
    #bmCustomAlertButton {
        /* Reutiliza e adapta estilo do botão principal */
        padding: 10px 25px; /* Padding horizontal maior */
        font-size: 1em;
        font-weight: bold;
        background: transparent;
        border: 2px solid #8A2BE2;
        border-radius: 4px;
        color: #8A2BE2;
        cursor: pointer;
        transition: background .2s ease-out, color .2s ease-out, transform .15s ease-out;
        width: auto; /* Largura automática */
        display: inline-block; /* Para centralizar se necessário */
    }
    #bmCustomAlertButton:hover {
        background: #8A2BE2;
        color: #111;
        transform: scale(1.05);
    }
     #bmCustomAlertButton:active {
      transform: scale(0.95);
       transition-duration: .1s;
    }

    /* --- Estilos Modo Disfarçado --- */
    #bmWrapper.stealth {
        background: #f0f0f0;
        border-color: #ccc;
        color: #333; /* Cor do texto geral no modo stealth */
        box-shadow: 0 4px 10px rgba(0,0,0,.2);
    }
    #bmWrapper.stealth #bmHeader {
        background: #dcdcdc;
        border-color: #ccc;
        color: #333;
    }
     #bmWrapper.stealth #bmContent {
         background: #e9e9e9;
     }
    #bmWrapper.stealth #bmContent textarea,
    #bmWrapper.stealth #bmContent input {
        background: #fff;
        color: #222;
        border-color: #bbb;
    }
     #bmWrapper.stealth #bmContent textarea:focus,
    #bmWrapper.stealth #bmContent input:focus {
        border-color: #6c8eef; /* Azul claro no foco */
        box-shadow: 0 0 6px rgba(108, 142, 239, 0.5);
    }
    #bmWrapper.stealth #bmContent button {
        background: #e0e0e0;
        color: #555;
        border-color: #aaa;
    }
    #bmWrapper.stealth #bmContent button:disabled {
         border-color: #ccc;
         color: #aaa;
         background: #f0f0f0;
         opacity: 0.7;
    }
     #bmWrapper.stealth #bmContent button:not(:disabled):hover {
        background: #6c8eef; /* Azul claro no hover */
        color: #fff;
        border-color: #6c8eef;
         transform: scale(1.02);
    }
      #bmWrapper.stealth #bmContent button:not(:disabled):active {
         transform: scale(.98);
     }
    #bmWrapper.stealth #bmToggleWrapper #bmToggleText {
        color: #555;
    }
    #bmWrapper.stealth #bmToggleWrapper:hover #bmToggleText {
        color: #000;
    }
    #bmWrapper.stealth #bmToggleWrapper #bmToggleImg {
        border-color: #aaa;
    }
    #bmWrapper.stealth #bmToggleWrapper:hover #bmToggleImg {
        border-color: #555;
    }
    #bmWrapper.stealth #bmToggleWrapper #bmToggleImg.on {
        background: #6c8eef; /* Azul claro quando ligado */
        border-color: #6c8eef;
    }

  `;
  const styleTag = document.createElement('style');
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);

  // 3) após splash, monta UI principal
  setTimeout(() => {
      if (document.body.contains(splash)) {
         document.body.removeChild(splash);
      }

      const wrapper = document.createElement('div');
      wrapper.id = 'bmWrapper';
      wrapper.innerHTML = `
        <div id="bmHeader">Paraná Colado V1 - AutoEditor Simulado</div>
        <div id="bmContent">
          <textarea id="bmText" placeholder="Cole o texto aqui..."></textarea>
          <input id="bmDelay" type="number" step="0.01" value="0.03" placeholder="Delay (s)">
          <div id="bmToggleWrapper">
            <div id="bmToggleImg"></div>
            <span id="bmToggleText">Modo Disfarçado</span>
          </div>
          <button id="bmBtn">Iniciar Digitação</button>
          <button id="bmBtnCorrect">Corrigir Automaticamente</button>
        </div>
      `;
      document.body.appendChild(wrapper);
      // Força reflow antes de adicionar a classe show para animação
      requestAnimationFrame(() => {
          wrapper.classList.add('show');
      });


      // Lógica de arrastar
      const header = document.getElementById('bmHeader');
      let isDragging = false;
      let offsetX, offsetY;

      header.onmousedown = e => {
          // Ignora se não for o botão esquerdo do mouse
          if (e.button !== 0) return;
          isDragging = true;
          offsetX = e.clientX - wrapper.offsetLeft;
          offsetY = e.clientY - wrapper.offsetTop;
          wrapper.style.transition = 'none'; // Desabilita transição durante o drag
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
          e.preventDefault(); // Previne seleção de texto no header
      };

      function onMouseMove(ev) {
          if (!isDragging) return;
          wrapper.style.left = ev.clientX - offsetX + 'px';
          wrapper.style.top = ev.clientY - offsetY + 'px';
      }

      function onMouseUp() {
          if (!isDragging) return;
          isDragging = false;
          wrapper.style.transition = ''; // Reabilita transição
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      }

      // 4) lógica “Modo Disfarçado”
      const toggleWrapper = document.getElementById('bmToggleWrapper');
      const toggleBox = document.getElementById('bmToggleImg');
      let stealthOn = false;
      let firstTimeStealth = true; // Renomeado para clareza
      const imgOnBg = '#8A2BE2'; // Cor quando ligado (no modo normal)
      const stealthImgOnBg = '#6c8eef'; // Cor quando ligado (no modo stealth)
      let rect; // Posição do wrapper

      function enterStealth() {
          wrapper.classList.add('stealth');
          toggleBox.classList.add('on'); // Marca visualmente que está ligado
          toggleBox.style.background = stealthImgOnBg; // Cor específica do modo stealth ligado
          toggleBox.style.borderColor = stealthImgOnBg;
          wrapper.addEventListener('mouseleave', hideUI);
          document.addEventListener('mousemove', showUI);
          // Esconde imediatamente se o mouse não estiver sobre ele ao ativar
          setTimeout(() => {
             if (!wrapper.matches(':hover')) {
                 hideUI();
             }
          }, 50);
          console.log('Entered Stealth Mode');
      }

      function exitStealth() {
          wrapper.classList.remove('stealth');
          toggleBox.classList.remove('on');
          toggleBox.style.background = 'transparent'; // Cor desligado modo normal
          toggleBox.style.borderColor = imgOnBg; // Borda roxa modo normal
          wrapper.removeEventListener('mouseleave', hideUI);
          document.removeEventListener('mousemove', showUI);
          wrapper.style.opacity = 1;
          wrapper.style.pointerEvents = 'auto';
          console.log('Exited Stealth Mode');
      }

       function hideUI() {
          if (!wrapper.classList.contains('stealth')) return; // Só esconde se estiver no modo stealth
          rect = wrapper.getBoundingClientRect();
          wrapper.style.opacity = 0;
          wrapper.style.pointerEvents = 'none';
          // console.log('UI Hidden');
      }

      function showUI(ev) {
          if (!wrapper.classList.contains('stealth')) return;
          if (rect &&
              ev.clientX >= rect.left && ev.clientX <= rect.right &&
              ev.clientY >= rect.top && ev.clientY <= rect.bottom
          ) {
              wrapper.style.opacity = 1;
              wrapper.style.pointerEvents = 'auto';
              // console.log('UI Shown');
          }
      }

      function showStealthOverlay() {
          const ov = document.createElement('div');
          ov.id = 'bmOv';
          ov.innerHTML = `
            <img src="https://i.imgur.com/RquEok4.gif"/>
            <p style="color: #ddd; font-family: 'Segoe UI', sans-serif; text-align: center; margin-top: 15px; max-width: 80%;">O Modo Disfarçado oculta a janela quando o mouse não está sobre ela e muda a aparência para ser mais discreta.</p>
            <button id="bmOvBtn">Entendido</button>
          `;
          document.body.appendChild(ov);
          document.getElementById('bmOvBtn').onclick = () => {
              if (document.body.contains(ov)){
                 document.body.removeChild(ov);
              }
              enterStealth(); // Entra no modo stealth após fechar overlay
          };
      }

      toggleWrapper.onclick = () => { // Listener no wrapper todo
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
      // Inicializa no modo normal (chama exitStealth para setar estilos iniciais)
      exitStealth();


      // 6) botão Iniciar + contador 3-2-1
      document.getElementById('bmBtn').onclick = async function() {
          const text = document.getElementById('bmText').value;
          const delayInput = parseFloat(document.getElementById('bmDelay').value);
          // Delay padrão menor (30ms), mais realista
          const delay = (!isNaN(delayInput) && delayInput >= 0) ? delayInput * 1000 : 30;

          if (!text) return showCustomAlert('O campo de texto para digitar está vazio!');
          if (!activeEl || !document.body.contains(activeEl)) {
            return showCustomAlert('Clique primeiro no campo onde deseja digitar o texto ANTES de clicar em "Iniciar Digitação"!');
          }

          const startButton = this;
          const correctButton = document.getElementById('bmBtnCorrect');
          startButton.disabled = true;
          if (correctButton) correctButton.disabled = true;

          // contador estilizado
          for (let n = 3; n >= 1; n--) {
              const cnt = document.createElement('div');
              cnt.textContent = n;
              Object.assign(cnt.style, {
                  position:   'absolute',
                  top:        '50%', // Centralizado verticalmente
                  left:       '50%', // Centralizado horizontalmente
                  transform:  'translate(-50%, -50%) scale(0.6)', // Começa menor e centralizado
                  fontFamily: "'Segoe UI Black', sans-serif",
                  fontWeight: 'bold',
                  color:      '#8A2BE2',
                  fontSize:   '4em', // Maior
                  opacity:    0,
                  animation:  'countPop .7s ease-out forwards',
                  zIndex:     '10',
                  pointerEvents: 'none' // Não interfere com cliques
              });
              wrapper.appendChild(cnt); // Adiciona ao wrapper, não ao header
              await new Promise(r => setTimeout(r,700));
              if (wrapper.contains(cnt)) wrapper.removeChild(cnt);
              await new Promise(r => setTimeout(r,150)); // Menor pausa entre números
          }

          // digita
          try {
              activeEl.focus();
              for (let c of text) {
                  sendChar(c);
                  await new Promise(r => setTimeout(r, delay));
              }
          } catch (error) {
              console.error("Erro durante a digitação simulada ('Iniciar'):", error);
              showCustomAlert("Ocorreu um erro durante a digitação. Verifique o console (F12) para detalhes técnicos.");
          } finally {
              startButton.disabled = false;
              if (correctButton) correctButton.disabled = false;
          }
      };


      // --- INÍCIO DA NOVA LÓGICA: CORRIGIR (SIMULADO) ---

      // Função auxiliar para esperar por um elemento
      function waitForElement(selector, timeout = 5000) {
          return new Promise((resolve, reject) => {
              const startTime = Date.now();
              const interval = setInterval(() => {
                  const element = document.querySelector(selector);
                  // Verifica se está visível e anexado ao DOM principal
                  if (element && element.offsetParent !== null && document.body.contains(element)) {
                      clearInterval(interval);
                      resolve(element);
                  } else if (Date.now() - startTime > timeout) {
                      clearInterval(interval);
                      console.error(`Timeout esperando por elemento: ${selector}`);
                      reject(new Error(`Timeout esperando por elemento: ${selector}`));
                  }
              }, 100); // Verifica a cada 100ms
          });
      }

      // Função principal da correção automática SIMULADA
      document.getElementById('bmBtnCorrect').onclick = async function() {
          const correctButton = this;
          const startButton = document.getElementById('bmBtn');
          correctButton.disabled = true;
          if (startButton) startButton.disabled = true;

          console.log('Iniciando correção simulada...');
          const typingDelayCorrect = 15; // Delay entre caracteres da correção (mais rápido)
          const backspaceDelay = 8;    // Delay entre backspaces (mais rápido)
          const actionDelay = 150;     // Delay entre ações maiores (clique, espera, etc.)

          // 1. Encontrar a textarea principal de redação
          let targetTextarea;
          try {
              // Tenta um seletor mais genérico primeiro, depois o específico
              targetTextarea = document.querySelector('textarea[aria-label*="editor"], textarea[placeholder*="redação"], textarea[id*="text"], textarea.editor, textarea#outlined-multiline-static.jss17');
              if (!targetTextarea) {
                   throw new Error('Textarea principal não encontrada com seletores comuns ou específicos.');
              }
              console.log('Textarea principal encontrada:', targetTextarea);
          } catch (error) {
              console.error(error);
              showCustomAlert('ERRO: Não foi possível encontrar a área de texto principal da redação na página.');
              correctButton.disabled = false;
              if (startButton) startButton.disabled = false;
              return;
          }

          // 2. Encontrar todos os spans de erro clicáveis (adaptar seletor se necessário)
          // Tenta um seletor mais robusto que busca por spans com estilo específico ou dentro de divs com classes comuns de erro
          const errorSelector = `
              span[style*="border-bottom"],
              span[class*="error"], span[class*="mistake"],
              span[data-markjs], /* Comum em bibliotecas de highlight */
              div[class*="suggestion"] span,
              div.jss24 p.MuiTypography-root.jss23 div[style*="white-space: break-spaces"] > span /* Seletor original como fallback */
          `;
          const errorSpans = Array.from(document.querySelectorAll(errorSelector))
                                .filter(span => span.offsetParent !== null && span.textContent.trim().length > 1); // Filtra visíveis e com texto

          if (errorSpans.length === 0) {
              showCustomAlert('Nenhum erro destacado (visível e clicável) foi encontrado na página para corrigir.');
              console.log('Nenhum span de erro encontrado com os seletores:', errorSelector);
              correctButton.disabled = false;
              if (startButton) startButton.disabled = false;
              return;
          }
          console.log(`Encontrados ${errorSpans.length} spans de erro potenciais.`);

          let correctedCount = 0;
          // 3. Iterar sobre cada erro
          for (const errorSpan of errorSpans) {
              // Verifica se o span ainda está no DOM antes de processar
              if (!document.body.contains(errorSpan)) {
                  console.log('Span de erro removido do DOM, pulando.');
                  continue;
              }

              try {
                  const errorText = errorSpan.textContent.trim();
                  if (!errorText || errorText.length < 2) continue; // Ignora textos muito curtos

                  console.log(`Processando erro: "${errorText}"`);

                  // 3.1 Encontrar posição do erro na TEXTAREA ATUALIZADA
                  // É crucial pegar o valor atual DENTRO do loop, pois ele muda
                  const currentTextValue = targetTextarea.value;
                  const errorIndex = currentTextValue.indexOf(errorText);

                  if (errorIndex === -1) {
                      console.warn(`Erro "${errorText}" não encontrado na textarea (pode já ter sido corrigido). Pulando.`);
                      continue;
                  }

                  // 4. Simular clique no erro para ABRIR sugestões
                  errorSpan.click();
                  console.log('Clicou no span de erro.');
                  await new Promise(r => setTimeout(r, actionDelay)); // Espera após clique

                  // 5. Esperar a lista de sugestões aparecer
                  // Seletor mais genérico para popups/menus
                  const suggestionListSelector = `
                      ul[role="menu"], div[role="tooltip"] ul,
                      div[class*="suggestions"], div[id*="suggestions"],
                      div[class*="popup"] ul, div[id*="popup"] ul,
                      ul#menu-list-grow /* Fallback específico */
                  `;
                  let suggestionContainer;
                  try {
                      suggestionContainer = await waitForElement(suggestionListSelector, 2500); // Timeout menor
                  } catch (e) {
                      console.warn(`Lista/Popup de sugestões não apareceu para "${errorText}" após clique. Tentando fechar e pular.`);
                      try { document.body.click(); } catch(closeErr){} // Tenta fechar menu fantasma
                      await new Promise(r => setTimeout(r, actionDelay));
                      continue;
                  }

                  // 6. Coletar e escolher sugestão (dentro do container encontrado)
                  // Busca por itens clicáveis (li, button, div com role option)
                  const suggestionItems = suggestionContainer.querySelectorAll('li[role="menuitem"], button, div[role="option"], li:not([role])'); // Adiciona li sem role como fallback
                  const validSuggestions = Array.from(suggestionItems)
                      // Pega o texto, prioriza aria-label ou data-suggestion se existir
                      .map(item => (item.getAttribute('aria-label') || item.dataset.suggestion || item.textContent || '').trim())
                      // Filtra sugestões vazias ou que sejam iguais ao erro original (ou "ignorar")
                      .filter(text => text.length > 0 && text.toLowerCase() !== errorText.toLowerCase() && !text.toLowerCase().includes('ignorar'));

                  console.log('Sugestões encontradas:', validSuggestions);

                  if (validSuggestions.length > 0) {
                      // Dá preferência para a primeira sugestão, que geralmente é a melhor
                      const chosenSuggestion = validSuggestions[0];
                      // const chosenSuggestion = validSuggestions[Math.floor(Math.random() * validSuggestions.length)]; // Ou aleatória
                      console.log(`Sugestão escolhida: "${chosenSuggestion}"`);

                      // --- INÍCIO DA SIMULAÇÃO DE EDIÇÃO ---
                      targetTextarea.focus();
                      // Re-calcula o índice caso o texto tenha mudado ligeiramente
                      const currentIndex = targetTextarea.value.indexOf(errorText);
                      if (currentIndex === -1) {
                           console.warn(`Erro "${errorText}" desapareceu antes da edição. Pulando.`);
                           try { document.body.click(); } catch(closeErr){}
                           await new Promise(r => setTimeout(r, actionDelay));
                           continue;
                      }

                      targetTextarea.selectionStart = targetTextarea.selectionEnd = currentIndex + errorText.length;
                      console.log(`Cursor posicionado em ${targetTextarea.selectionEnd} na textarea.`);
                      await new Promise(r => setTimeout(r, 50));

                      console.log(`Simulando ${errorText.length} backspaces...`);
                      activeEl = targetTextarea;
                      for (let i = 0; i < errorText.length; i++) {
                          await simulateBackspace(targetTextarea);
                          // O delay já está em simulateBackspace
                      }
                      console.log('Backspaces simulados.');
                      await new Promise(r => setTimeout(r, 50)); // Pausa após apagar

                      console.log(`Simulando digitação de "${chosenSuggestion}"...`);
                      activeEl = targetTextarea; // Garante activeEl
                      for (const char of chosenSuggestion) {
                          sendChar(char);
                          await new Promise(r => setTimeout(r, typingDelayCorrect));
                      }
                      console.log('Digitação da correção simulada.');
                      correctedCount++;
                      // --- FIM DA SIMULAÇÃO DE EDIÇÃO ---

                  } else {
                      console.warn(`Nenhuma sugestão válida encontrada para "${errorText}".`);
                  }

                  // 10. Fechar/Remover a lista de sugestões (clicando fora ou no próprio erro novamente)
                  console.log('Tentando fechar a lista de sugestões...');
                   try { document.body.click(); } catch(closeErr){} // Clique no body é mais genérico
                  await new Promise(r => setTimeout(r, actionDelay)); // Pausa após tentar fechar

              } catch (error) {
                  console.error(`Erro processando o span "${errorSpan?.textContent?.trim()}":`, error);
                  try { document.body.click(); } catch(e){} // Tenta fechar menu em caso de erro
                  await new Promise(r => setTimeout(r, actionDelay));
              }
          } // Fim do loop for...of

          // Reabilita os botões
          correctButton.disabled = false;
          if (startButton) startButton.disabled = false;

          console.log('Correção simulada concluída.');
          if (correctedCount > 0) {
             showCustomAlert(`Correção simulada finalizada! ${correctedCount} erros foram processados e corrigidos.`);
          } else {
             showCustomAlert(`Correção simulada finalizada. Nenhum erro foi efetivamente corrigido (verifique o console para detalhes).`);
          }

      }; // Fim do onclick bmBtnCorrect

      // --- FIM DA NOVA LÓGICA ---

  }, 3500); // Fim do setTimeout principal (tempo da splash)

})(); // Fim da IIFE
