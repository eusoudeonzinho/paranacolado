(function() {
  // evita duplo carregamento
  if (document.getElementById('bmSplash')) return;

  // guarda último elemento clicado (CRUCIAL para ambas as funções)
  let activeEl = null;
  document.addEventListener('mousedown', e => {
    // Ignora cliques dentro da nossa própria UI para não perder o foco do campo alvo
    if (e.target.closest('#bmWrapper') || e.target.closest('#bmAlertOverlay')) {
        return;
    }
    console.log('mousedown detected, activeEl set to:', e.target);
    activeEl = e.target;
  }, true); // Use capturing phase

  // --- FUNÇÃO DE ALERTA CUSTOMIZADO ---
  function showCustomAlert(message, title = "Aviso") {
    // Remover alerta existente, se houver
    const existingAlert = document.getElementById('bmAlertOverlay');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Criar Overlay
    const overlay = document.createElement('div');
    overlay.id = 'bmAlertOverlay';

    // Criar Caixa do Alerta
    const alertBox = document.createElement('div');
    alertBox.id = 'bmAlertBox';

    alertBox.innerHTML = `
      <div id="bmAlertHeader">${title}</div>
      <div id="bmAlertMessage">${message}</div>
      <button id="bmAlertButton">Entendido</button>
    `;

    // Adicionar ao DOM
    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);

    // Animação de entrada
    // Usar setTimeout para garantir que a transição ocorra após o elemento ser adicionado
    setTimeout(() => {
        overlay.classList.add('show');
        alertBox.classList.add('show');
    }, 10); // Pequeno delay

    // Botão para fechar
    document.getElementById('bmAlertButton').onclick = () => {
      alertBox.classList.remove('show'); // Inicia animação de saída
      overlay.classList.remove('show');
      // Remove do DOM após a animação
      setTimeout(() => {
        if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
      }, 300); // Deve corresponder à duração da animação de fadeOut/scaleDown
    };
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
        code: `Key${key.toUpperCase()}`, // Aproximação
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
    await new Promise(r => setTimeout(r, 5)); // Reduzido o delay do backspace individual
  }

  // Função para SIMULAR digitação de um caractere (REUTILIZADA E VERIFICADA)
  function sendChar(c) {
    if (!activeEl) {
        console.warn("sendChar chamada, mas activeEl é nulo.");
        // Opcional: Mostrar alerta customizado se tentar digitar sem foco
        // showCustomAlert("Clique primeiro no campo onde deseja digitar.", "Erro");
        return;
    }
    if (!document.body.contains(activeEl)) {
        console.warn("sendChar chamada, mas activeEl não está mais no DOM.");
        activeEl = null; // Limpa o activeEl inválido
        // Opcional: Mostrar alerta
        // showCustomAlert("O campo selecionado não existe mais na página.", "Erro");
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

  // 2) CSS injetado (Com melhorias de animação e estilos do alerta)
  const css = `
    /* === GERAL === */
    :root {
        --roxo-principal: #8A2BE2;
        --roxo-hover: #9932CC;
        --cinza-bg: #1e1e1e;
        --cinza-bg-claro: #2a2a2a;
        --cinza-header: #111;
        --cinza-borda: #333;
        --branco: #fff;
        --preto: #000;
        --anim-duration-fast: 0.2s;
        --anim-duration-medium: 0.3s;
        --anim-duration-slow: 0.5s;
        --ease-out-cubic: cubic-bezier(0.215, 0.610, 0.355, 1.000);
        --ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1.000);
        --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
    }

    /* === SPLASH === */
    #bmSplash {
      position: fixed; top:0; left:0; right:0; bottom:0; /* Cobrir tudo */
      background: var(--preto);
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      z-index:99999; overflow:hidden;
      animation: bmFadeOut var(--anim-duration-slow) var(--ease-out-cubic) 3s forwards;
    }
    #bmSplashImg {
      width:200px;
      animation: bmPopIn var(--anim-duration-slow) var(--ease-out-expo) forwards, bmMoveUp var(--anim-duration-slow) var(--ease-out-cubic) .8s forwards;
    }
    #bmSplashTxt1, #bmSplashTxt2 {
      font-family:'Segoe UI Black', sans-serif;
      color: var(--branco); font-size:2em; opacity:0;
      transform: translateY(20px); /* Começa ligeiramente abaixo */
    }
    #bmSplashTxt1 { animation: bmTxtPop var(--anim-duration-medium) var(--ease-out-cubic) 1.3s forwards }
    #bmSplashTxt2 { animation: bmTxtPop var(--anim-duration-medium) var(--ease-out-cubic) 1.8s forwards }

    @keyframes bmPopIn {
        from { opacity: 0; transform:scale(0.5); }
        to { opacity: 1; transform:scale(1); }
    }
    @keyframes bmMoveUp {
        from { transform:translateY(0) scale(1); } /* Mantem escala */
        to { transform:translateY(-30px) scale(1); }
    }
    @keyframes bmTxtPop {
        from { opacity:0; transform:translateY(20px); }
        to { opacity:1; transform:translateY(0); }
    }
    @keyframes bmFadeOut {
        to { opacity:0; pointer-events: none; } /* Desabilitar cliques após sumir */
    }

    /* === WRAPPER PRINCIPAL === */
    #bmWrapper {
      position:fixed; top:20px; right:20px;
      width:320px;
      background: var(--cinza-bg);
      border:1px solid var(--cinza-borda);
      border-radius:8px; /* Mais suave */
      box-shadow:0 6px 15px rgba(0,0,0,.6); /* Sombra mais pronunciada */
      font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Fonte mais comum */
      color: var(--branco);
      opacity:0;
      transform:translateY(-20px) scale(.98); /* Começa um pouco menor */
      transition: opacity var(--anim-duration-medium) var(--ease-out-cubic), transform var(--anim-duration-medium) var(--ease-out-cubic);
      z-index:99998;
      overflow: hidden; /* Para conter bordas arredondadas */
    }
    #bmWrapper.show {
      opacity:1; transform:translateY(0) scale(1);
    }

    /* header */
    #bmHeader {
      cursor:move;
      padding:10px 15px; /* Mais espaçamento */
      background: var(--cinza-header);
      border-bottom:1px solid var(--cinza-borda);
      font-size:0.95em;
      font-weight: 600; /* Levemente mais forte */
      text-align:center;
      /* Radius já tratado pelo wrapper */
    }

    /* conteúdo */
    #bmContent {
      padding:15px;
      background: var(--cinza-bg); /* Mesmo fundo */
    }
    #bmContent textarea,
    #bmContent input[type="number"] { /* Especificidade */
      width:100%;
      margin-bottom:12px;
      padding:10px;
      font-size:0.95em;
      background: var(--cinza-bg-claro);
      border:1px solid var(--cinza-borda);
      border-radius: 5px;
      color: var(--branco);
      box-sizing:border-box;
      transition: border-color var(--anim-duration-fast) ease-out, box-shadow var(--anim-duration-fast) ease-out;
    }
    #bmContent textarea {
      resize: vertical; /* Permitir redimensionar só verticalmente */
      min-height: 80px;
    }
    #bmContent textarea:focus,
    #bmContent input[type="number"]:focus {
      outline:none;
      border-color: var(--roxo-principal);
      box-shadow:0 0 0 3px rgba(138, 43, 226, 0.3); /* Glow suave */
    }

    /* Estilo comum para botões */
    #bmContent button {
      width:100%;
      padding: 10px 15px; /* Mais padding */
      margin-top: 8px;
      font-size:0.95em;
      font-weight: 600;
      background: transparent;
      border: 1px solid var(--roxo-principal);
      border-radius: 5px;
      color: var(--roxo-principal);
      cursor:pointer;
      transition: background var(--anim-duration-fast) ease-out, color var(--anim-duration-fast) ease-out, transform var(--anim-duration-fast) var(--ease-out-cubic), box-shadow var(--anim-duration-fast) ease-out;
      box-sizing: border-box;
    }
    #bmContent button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      border-color: #555;
      color: #555;
      background: transparent !important; /* Garantir fundo transparente */
      transform: none !important; /* Sem transform */
       box-shadow: none !important; /* Sem sombra */
    }
     #bmContent button:not(:disabled):hover {
      background: var(--roxo-principal);
      color: var(--cinza-header); /* Contraste melhor */
      transform: translateY(-2px); /* Leve elevação */
      box-shadow: 0 4px 8px rgba(138, 43, 226, 0.3); /* Sombra roxa */
    }
    #bmContent button:not(:disabled):active {
      transform: translateY(0px) scale(0.98); /* Clicar afunda um pouco */
      box-shadow: 0 2px 4px rgba(138, 43, 226, 0.2); /* Sombra menor */
    }

    /* toggle “Modo Disfarçado” */
    #bmToggleWrapper {
      display:flex;
      align-items:center;
      gap:10px; /* Mais espaço */
      margin-bottom:15px; /* Mais espaço abaixo */
      cursor: pointer; /* Fica clicável */
      padding: 5px 0; /* Área de clique maior */
      user-select: none; /* Não selecionar texto */
    }
    #bmToggleImg {
      width:16px; height:16px;
      border:1.5px solid var(--roxo-principal); /* Borda levemente mais grossa */
      border-radius:3px;
      background: transparent;
      transition: background var(--anim-duration-fast) ease-out, border-color var(--anim-duration-fast) ease-out;
      flex-shrink: 0; /* Não encolher */
      display: flex;
      align-items: center;
      justify-content: center;
    }
     /* Pseudo-elemento para o "check" */
    #bmToggleImg::before {
        content: '';
        display: block;
        width: 8px;
        height: 8px;
        background-color: var(--branco);
        border-radius: 1px;
        opacity: 0;
        transform: scale(0);
        transition: opacity var(--anim-duration-fast) ease-out, transform var(--anim-duration-fast) var(--ease-out-cubic);
    }
    #bmToggleImg.checked {
        background: var(--roxo-principal);
        border-color: var(--roxo-principal);
    }
     #bmToggleImg.checked::before {
        opacity: 1;
        transform: scale(1);
    }
    #bmToggleText {
      font-size:0.9em;
      color: var(--branco);
      transition: color var(--anim-duration-fast) ease-out;
    }

    /* contador 3-2-1 */
    .bmCountdownNumber { /* Usar classe */
        position: absolute;
        top: 50px; /* Ajustar se necessário */
        right: 20px;
        font-family: 'Segoe UI Black', sans-serif;
        color: var(--roxo-principal);
        font-size: 2em; /* Maior */
        font-weight: bold;
        opacity: 0;
        animation: bmCountPop 0.8s var(--ease-out-expo) forwards; /* Animação mais impactante */
        z-index: 10;
    }
    @keyframes bmCountPop {
      0%   { opacity:0; transform:scale(0.5) translateY(20px); }
      50%  { opacity:1; transform:scale(1.1) translateY(0); }
      100% { opacity:0; transform:scale(1) translateY(-10px); }
    }

    /* overlay stealth */
    #bmOv {
      position:fixed;top:0;left:0; right:0; bottom:0;
      background:rgba(0,0,0,.9);
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      z-index:100000;
      opacity: 0; /* Começa invisível */
      animation: bmOvFadeIn var(--anim-duration-medium) var(--ease-out-cubic) forwards;
    }
    #bmOv img {
      max-width:70%;max-height:50%;
      transform: scale(0.8); /* Começa um pouco menor */
      opacity: 0;
      animation: bmPopIn var(--anim-duration-medium) var(--ease-out-cubic) 0.2s forwards; /* Delay para entrar depois do overlay */
    }
    #bmOv p {
        color: var(--branco);
        font-family: 'Segoe UI', sans-serif;
        text-align: center;
        margin-top: 20px;
        max-width: 80%;
        line-height: 1.5;
        opacity: 0;
         animation: bmTxtPop var(--anim-duration-medium) var(--ease-out-cubic) 0.4s forwards;
    }
    #bmOv button { /* Estilo botão overlay (baseado nos botões principais) */
      margin-top:25px;
      padding: 10px 20px;
      background: var(--roxo-principal);
      color: var(--branco);
      border:none;
      border-radius:5px;
      font-size:1em;
      font-weight: 600;
      cursor:pointer;
      transition: transform var(--anim-duration-fast) var(--ease-out-cubic), background var(--anim-duration-fast) ease-out, box-shadow var(--anim-duration-fast) ease-out;
      width: auto;
      opacity: 0;
      animation: bmTxtPop var(--anim-duration-medium) var(--ease-out-cubic) 0.6s forwards;
    }
    #bmOv button:hover {
      background: var(--roxo-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
     #bmOv button:active {
        transform: translateY(0px) scale(0.98);
     }
    @keyframes bmOvFadeIn { from{opacity:0} to{opacity:1} }

    /* === ALERTA CUSTOMIZADO === */
    #bmAlertOverlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100001; /* Acima de tudo */
        opacity: 0;
        transition: opacity var(--anim-duration-medium) var(--ease-out-cubic);
    }
    #bmAlertOverlay.show {
        opacity: 1;
    }
    #bmAlertBox {
        background: var(--cinza-bg);
        border: 1px solid var(--cinza-borda);
        border-radius: 8px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7);
        width: 90%;
        max-width: 400px;
        padding: 0; /* Padding será interno */
        overflow: hidden; /* Para header */
        opacity: 0;
        transform: scale(0.8) translateY(20px);
        transition: opacity var(--anim-duration-medium) var(--ease-out-expo), transform var(--anim-duration-medium) var(--ease-out-expo);
    }
    #bmAlertOverlay.show #bmAlertBox { /* Animação de entrada */
        opacity: 1;
        transform: scale(1) translateY(0);
    }
     /* Animação de saída implícita pela transição reversa */
    #bmAlertHeader {
        background: var(--cinza-header);
        padding: 12px 20px;
        font-size: 1.1em;
        font-weight: 600;
        color: var(--branco);
        border-bottom: 1px solid var(--cinza-borda);
    }
    #bmAlertMessage {
        padding: 20px;
        font-size: 1em;
        color: var(--branco);
        line-height: 1.6;
         white-space: pre-wrap; /* Preserva quebras de linha */
    }
    #bmAlertButton {
        display: block; /* Ocupa linha toda */
        width: calc(100% - 40px); /* Desconta padding laterais */
        margin: 0 20px 20px 20px; /* Espaçamento */
        padding: 10px 15px;
        font-size: 1em;
        font-weight: 600;
        background: var(--roxo-principal);
        border: none;
        border-radius: 5px;
        color: var(--branco);
        cursor: pointer;
        transition: background var(--anim-duration-fast) ease-out, transform var(--anim-duration-fast) var(--ease-out-cubic), box-shadow var(--anim-duration-fast) ease-out;
    }
    #bmAlertButton:hover {
      background: var(--roxo-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    #bmAlertButton:active {
       transform: translateY(0px) scale(0.98);
       box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    /* === MODO DISFARÇADO ESTILOS === */
    /* Adicionar transições suaves para a mudança de tema */
    #bmWrapper.stealth-mode,
    #bmWrapper.stealth-mode #bmHeader,
    #bmWrapper.stealth-mode #bmContent,
    #bmWrapper.stealth-mode textarea,
    #bmWrapper.stealth-mode input,
    #bmWrapper.stealth-mode button,
    #bmWrapper.stealth-mode #bmToggleImg,
    #bmWrapper.stealth-mode #bmToggleText {
        transition: background var(--anim-duration-medium) ease-out,
                    color var(--anim-duration-medium) ease-out,
                    border-color var(--anim-duration-medium) ease-out,
                    opacity var(--anim-duration-medium) ease-out; /* Para esconder/mostrar */
    }

    #bmWrapper.stealth-mode {
        background: #f0f0f0;
        color: #333;
        border-color: #ccc;
    }
    #bmWrapper.stealth-mode #bmHeader {
        background: #dcdcdc;
        color: #333;
        border-bottom-color: #ccc;
    }
    #bmWrapper.stealth-mode #bmContent { background: #f0f0f0; }
    #bmWrapper.stealth-mode textarea,
    #bmWrapper.stealth-mode input {
        background: #fff;
        color: #000;
        border-color: #ccc;
    }
     #bmWrapper.stealth-mode textarea:focus,
    #bmWrapper.stealth-mode input:focus {
         border-color: #aaa; /* Cor de foco mais sutil */
         box-shadow: 0 0 0 3px rgba(150, 150, 150, 0.2);
    }
    #bmWrapper.stealth-mode button {
        background: #e0e0e0;
        color: #555;
        border-color: #aaa;
    }
     #bmWrapper.stealth-mode button:not(:disabled):hover {
        background: #cecece;
        color: #222;
        border-color: #999;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
     #bmWrapper.stealth-mode button:not(:disabled):active {
        transform: translateY(0px) scale(0.98);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
     #bmWrapper.stealth-mode #bmToggleWrapper {}
    #bmWrapper.stealth-mode #bmToggleImg {
        border-color: #aaa;
        background: transparent; /* Garante fundo padrão */
    }
     #bmWrapper.stealth-mode #bmToggleImg.checked {
        background: #aaa; /* Cor de check no modo claro */
        border-color: #aaa;
     }
    #bmWrapper.stealth-mode #bmToggleImg.checked::before {
         background-color: #333; /* Check mais escuro */
     }
    #bmWrapper.stealth-mode #bmToggleText { color: #555; }

    /* Para esconder no modo disfarçado */
    #bmWrapper.stealth-hidden {
        opacity: 0 !important; /* Forçar opacidade 0 */
        pointer-events: none !important; /* Desabilitar interação */
        transition: opacity var(--anim-duration-fast) ease-out !important; /* Saída rápida */
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
      <div id="bmHeader">Paraná Colado V2 - AutoEditor Simulado</div>
      <div id="bmContent">
        <textarea id="bmText" placeholder="Cole o texto aqui..." rows="5"></textarea>
        <input    id="bmDelay" type="number" step="0.01" value="0.03" placeholder="Delay (s)">
        <div id="bmToggleWrapper" title="Oculta a janela quando o mouse não está sobre ela">
          <div id="bmToggleImg"></div>
          <span id="bmToggleText">Modo Disfarçado</span>
        </div>
        <button id="bmBtn">Iniciar Digitação</button>
        <button id="bmBtnCorrect">Corrigir Erros</button>
      </div>
    `;
    document.body.appendChild(wrapper);
    // Adiciona classe show após pequeno delay para animação funcionar
    setTimeout(() => wrapper.classList.add('show'), 50);

    // Lógica de arrastar (mantida)
    const header = document.getElementById('bmHeader');
    let isDragging = false;
    let dragOffsetX, dragOffsetY;

    header.onmousedown = e => {
        // Ignora se o clique foi em um botão dentro do header (caso exista no futuro)
        if (e.target !== header) return;
        isDragging = true;
        dragOffsetX = e.clientX - wrapper.offsetLeft;
        dragOffsetY = e.clientY - wrapper.offsetTop;
        wrapper.style.transition = 'none'; // Desativa transição durante arrasto
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    function onMouseMove(ev) {
        if (!isDragging) return;
        // Adiciona limites para não arrastar para fora da tela (opcional)
        const x = Math.max(0, Math.min(window.innerWidth - wrapper.offsetWidth, ev.clientX - dragOffsetX));
        const y = Math.max(0, Math.min(window.innerHeight - wrapper.offsetHeight, ev.clientY - dragOffsetY));
        wrapper.style.left = x + 'px';
        wrapper.style.top  = y + 'px';
    }

    function onMouseUp() {
        if (!isDragging) return;
        isDragging = false;
        wrapper.style.transition = ''; // Reativa transições
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // 4) lógica “Modo Disfarçado”
    const toggleWrapper = document.getElementById('bmToggleWrapper');
    const toggleBox = document.getElementById('bmToggleImg');
    const toggleText = document.getElementById('bmToggleText'); // Referência já existe
    let stealthOn = false;
    let firstTimeStealth = true; // Renomeado para clareza
    let wrapperRect; // Guarda a posição

    function enterStealthMode() {
        wrapper.classList.add('stealth-mode');
        wrapper.addEventListener('mouseleave', hideUI);
        document.addEventListener('mousemove', showUIonHover);
        console.log('Entered Stealth Mode');
    }

    function exitStealthMode() {
        wrapper.classList.remove('stealth-mode', 'stealth-hidden'); // Remove ambas as classes
        wrapper.removeEventListener('mouseleave', hideUI);
        document.removeEventListener('mousemove', showUIonHover);
        // Garante visibilidade ao sair
        wrapper.style.opacity = '1';
        wrapper.style.pointerEvents = 'auto';
        console.log('Exited Stealth Mode');
    }

    function hideUI() {
        if (!stealthOn) return; // Só esconde se o modo estiver ativo
        wrapperRect = wrapper.getBoundingClientRect(); // Guarda posição antes de esconder
        wrapper.classList.add('stealth-hidden');
        console.log('UI Hidden');
    }

    function showUIonHover(ev) {
        if (!stealthOn || !wrapperRect) return; // Precisa do modo ativo e da posição guardada

        // Verifica se o mouse está sobre a área onde a janela estava
        if (ev.clientX >= wrapperRect.left && ev.clientX <= wrapperRect.right &&
            ev.clientY >= wrapperRect.top && ev.clientY <= wrapperRect.bottom)
        {
            wrapper.classList.remove('stealth-hidden');
            console.log('UI Shown on Hover');
        } else {
             // Se o mouse sair da área original enquanto estiver visível, esconde de novo
             if (!wrapper.classList.contains('stealth-hidden')) {
                 hideUI();
             }
        }
    }

    function showStealthOverlay() {
      const ov = document.createElement('div');
      ov.id = 'bmOv';
      ov.innerHTML = `
        <img src="https://i.imgur.com/RquEok4.gif" alt="Animação ninja"/>
        <p>O Modo Disfarçado oculta esta janela quando o cursor do mouse não está sobre ela. Mova o mouse para a área onde a janela estava para reexibi-la.</p>
        <button id="bmOvBtn">Entendido</button>
      `;
      document.body.appendChild(ov);
      document.getElementById('bmOvBtn').onclick = () => {
            // Animação de saída para o overlay
            ov.style.transition = 'opacity 0.3s ease-out';
            ov.style.opacity = '0';
            setTimeout(() => {
                 if (document.body.contains(ov)) {
                    document.body.removeChild(ov);
                }
            }, 300);
          enterStealthMode(); // Entra no modo após fechar
      };
    }

    toggleWrapper.onclick = () => { // Clicar na área toda
        stealthOn = !stealthOn;
        toggleBox.classList.toggle('checked', stealthOn); // Adiciona/remove classe 'checked'

        if (stealthOn) {
            if (firstTimeStealth) {
                firstTimeStealth = false;
                showStealthOverlay();
            } else {
                enterStealthMode();
                 // Esconder imediatamente se o mouse não estiver sobre ela ao ativar
                setTimeout(hideUI, 50);
            }
        } else {
            exitStealthMode();
        }
    };
    // Inicializa no modo normal (sem a classe stealth-mode)
    // exitStealthMode(); // Não precisa mais chamar explicitamente aqui

    // 6) botão Iniciar + contador 3-2-1
    document.getElementById('bmBtn').onclick = async function() {
        const text = document.getElementById('bmText').value;
        const delayInput = parseFloat(document.getElementById('bmDelay').value);
        // Delay padrão menor, validação mais robusta
        const delay = (!isNaN(delayInput) && delayInput >= 0.01) ? delayInput * 1000 : 30; // 30ms default

        if (!text) {
            showCustomAlert('O campo de texto para digitar está vazio!', 'Atenção');
            return;
        }
        if (!activeEl || !document.body.contains(activeEl)) {
            showCustomAlert('Clique primeiro no campo da página onde o texto deve ser digitado antes de iniciar.', 'Ação Necessária');
            return;
        }
        // Verifica se o elemento ativo é editável
        if (!activeEl.isContentEditable && typeof activeEl.value === 'undefined') {
             showCustomAlert('O elemento clicado não parece ser um campo de texto editável.', 'Erro');
             activeEl = null; // Limpa seleção inválida
             return;
        }


        this.disabled = true;
        const correctButton = document.getElementById('bmBtnCorrect');
        if (correctButton) correctButton.disabled = true;

        // contador estilizado
        for (let n = 3; n >= 1; n--) {
            const cnt = document.createElement('div');
            cnt.className = 'bmCountdownNumber'; // Usa classe
            cnt.textContent = n;
            wrapper.appendChild(cnt); // Adiciona ao wrapper principal
            // Espera a animação do número + um pouco mais
            await new Promise(r => setTimeout(r, 850));
            if (wrapper.contains(cnt)) wrapper.removeChild(cnt);
            await new Promise(r => setTimeout(r, 50)); // Pequena pausa entre números
        }

        // digita
        try {
            activeEl.focus();
            for (let i = 0; i < text.length; i++) {
                 const char = text[i];
                // Adiciona uma pequena variação aleatória ao delay (mais humano)
                 const currentDelay = delay + (Math.random() * delay * 0.3) - (delay * 0.15); // +/- 15%
                 sendChar(char);
                 await new Promise(r => setTimeout(r, Math.max(5, currentDelay))); // Garante delay mínimo
                 // Scroll no elemento ativo se necessário (experimental)
                 if (activeEl.scrollHeight > activeEl.clientHeight && typeof activeEl.scrollTop !== 'undefined') {
                    activeEl.scrollTop = activeEl.scrollHeight;
                 }
            }
        } catch (error) {
            console.error("Erro durante a digitação simulada:", error);
            showCustomAlert(`Ocorreu um erro durante a digitação:\n${error.message}\n\nVerifique o console para detalhes.`, "Erro na Digitação");
        } finally {
            this.disabled = false;
            if (correctButton) correctButton.disabled = false;
        }
    };


    // --- INÍCIO DA NOVA LÓGICA: CORRIGIR (SIMULADO) ---

    // Função auxiliar para esperar por um elemento (mantida)
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const interval = setInterval(() => {
                const element = document.querySelector(selector);
                // Verifica se existe e está visível (offsetParent não é null)
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

    // Função principal da correção automática SIMULADA
    document.getElementById('bmBtnCorrect').onclick = async function() {
        const correctButton = this;
        correctButton.disabled = true;
        const startButton = document.getElementById('bmBtn');
        if (startButton) startButton.disabled = true;

        console.log('Iniciando correção simulada...');
        const typingDelayCorrect = 20; // Delay digitação correção (ms)
        const backspaceDelayCorrect = 8; // Delay backspace correção (ms) - mais rápido

        // 1. Encontrar a textarea principal (seletor mantido, pode precisar de ajuste)
        let targetTextarea;
        try {
             // Espera um pouco para o caso de o elemento demorar a aparecer
             targetTextarea = await waitForElement('textarea#outlined-multiline-static.jss17', 2000);
        } catch (e) {
             showCustomAlert('Textarea principal de redação (#outlined-multiline-static.jss17) não encontrada ou não visível!', 'Erro de Seletor');
             console.error('Textarea principal não encontrada ou visível.');
             correctButton.disabled = false;
             if (startButton) startButton.disabled = false;
             return;
        }
         activeEl = targetTextarea; // Define como elemento ativo para as funções de simulação
         console.log('Textarea principal encontrada.');

        // 2. Encontrar spans de erro clicáveis (seletor mantido)
        // É importante que estes spans estejam visíveis quando o script rodar
        const errorSpans = document.querySelectorAll('div.jss24 p.MuiTypography-root.jss23 div[style*="white-space: break-spaces"] > span');
        if (errorSpans.length === 0) {
            showCustomAlert('Nenhum erro (span clicável na estrutura esperada) foi encontrado na página para corrigir.', 'Nenhum Erro Encontrado');
            console.log('Nenhum span de erro encontrado com o seletor especificado.');
            correctButton.disabled = false;
            if (startButton) startButton.disabled = false;
            return;
        }
        console.log(`Encontrados ${errorSpans.length} spans de erro potenciais.`);

        let correctedCount = 0;
        let errorCount = 0;

        // 3. Iterar sobre cada erro
        // Usar for...of pode ter problemas se a NodeList mudar durante a iteração
        // É mais seguro converter para Array ou usar um loop for padrão indexado
        const errorSpansArray = Array.from(errorSpans);

        for (let i = 0; i < errorSpansArray.length; i++) {
            const errorSpan = errorSpansArray[i];
            // Verifica se o span ainda existe no DOM e está visível
            if (!document.body.contains(errorSpan) || errorSpan.offsetParent === null) {
                 console.log(`Span de erro ${i} não está mais visível ou foi removido. Pulando.`);
                 continue;
            }

            try {
                const errorText = errorSpan.textContent.trim();
                if (!errorText) continue;

                console.log(`Processando erro ${i + 1}/${errorSpansArray.length}: "${errorText}"`);

                // 3.1 Encontrar posição exata na textarea ATUAL
                // É crucial pegar o valor atualizado a cada iteração
                 const currentTextValue = targetTextarea.value;
                 const errorIndex = currentTextValue.indexOf(errorText);

                if (errorIndex === -1) {
                    console.log(`Erro "${errorText}" não encontrado na textarea editável no momento. Pulando.`);
                    continue; // Pode ter sido corrigido manualmente ou em iteração anterior
                }

                // 4. Simular clique no erro
                // Garante que o span esteja visível antes de clicar (scrollIntoView se necessário)
                errorSpan.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 300)); // Espera o scroll suave terminar
                errorSpan.click();
                console.log('Clicou no span de erro.');
                await new Promise(r => setTimeout(r, 150)); // Pequena pausa após clique

                // 5. Esperar a lista de sugestões
                let suggestionList;
                try {
                    // Espera pelo menu de sugestões (seletor mantido)
                    suggestionList = await waitForElement('ul#menu-list-grow', 2500); // Timeout um pouco menor
                } catch (e) {
                    console.warn(`Lista de sugestões não apareceu para "${errorText}". Pulando erro.`);
                    errorCount++;
                    // Tenta fechar um possível menu fantasma clicando fora
                    try { document.body.click(); } catch(clickErr){}
                    await new Promise(r => setTimeout(r, 100));
                    continue;
                }

                // 6. Coletar e escolher sugestão
                const suggestionItems = suggestionList.querySelectorAll('li'); // Pega todos os LIs
                // A primeira sugestão geralmente é a melhor, mas vamos pegar a primeira não vazia após o título (se houver)
                let chosenSuggestion = null;
                for (const item of suggestionItems) {
                    const text = item.textContent.trim();
                    // Ignora itens que parecem ser títulos ou divisores (heurística)
                    if (text.length > 0 && !item.querySelector('hr') && item.getAttribute('role') === 'menuitem') {
                        chosenSuggestion = text;
                        console.log(`Sugestão encontrada: "${chosenSuggestion}"`);
                        break; // Pega a primeira válida
                    }
                }

                if (chosenSuggestion) {
                    // --- INÍCIO DA SIMULAÇÃO DE EDIÇÃO ---
                    console.log(`Aplicando sugestão: "${chosenSuggestion}"`);

                    // 7. Focar e posicionar cursor na TEXTAREA
                    targetTextarea.focus();
                    // Recalcula o índice caso o texto tenha mudado entre o clique e agora
                    const currentTextValueAgain = targetTextarea.value;
                    const errorIndexAgain = currentTextValueAgain.indexOf(errorText);
                    if (errorIndexAgain === -1) {
                        console.warn(`Erro "${errorText}" desapareceu antes da edição. Pulando.`);
                         errorCount++;
                         // Fecha o menu
                         try { document.body.click(); } catch(clickErr){}
                         await new Promise(r => setTimeout(r, 100));
                         continue;
                    }

                    targetTextarea.selectionStart = targetTextarea.selectionEnd = errorIndexAgain + errorText.length;
                    console.log(`Cursor posicionado em ${targetTextarea.selectionEnd}.`);
                    await new Promise(r => setTimeout(r, 50));

                    // 8. SIMULAR BACKSPACE
                    console.log(`Simulando ${errorText.length} backspaces...`);
                    activeEl = targetTextarea; // Garante elemento ativo
                    for (let k = 0; k < errorText.length; k++) {
                        await simulateBackspace(targetTextarea);
                        await new Promise(r => setTimeout(r, backspaceDelayCorrect));
                    }
                    console.log('Backspaces simulados.');
                    await new Promise(r => setTimeout(r, 50));

                    // 9. SIMULAR DIGITAÇÃO da correção
                    console.log(`Simulando digitação de "${chosenSuggestion}"...`);
                    activeEl = targetTextarea; // Garante elemento ativo
                    for (const char of chosenSuggestion) {
                        sendChar(char);
                        await new Promise(r => setTimeout(r, typingDelayCorrect + (Math.random()*10 - 5) )); // Pequena variação
                    }
                    console.log('Digitação da correção simulada.');
                    correctedCount++;
                    // --- FIM DA SIMULAÇÃO DE EDIÇÃO ---

                } else {
                    console.warn(`Nenhuma sugestão válida encontrada para "${errorText}".`);
                     errorCount++;
                }

                // 10. Fechar a lista de sugestões (se ainda existir)
                 const menuStillExists = document.querySelector('ul#menu-list-grow');
                 if (menuStillExists && menuStillExists.offsetParent !== null) {
                    console.log('Fechando lista de sugestões...');
                    try { document.body.click(); } catch(clickErr){}
                    await new Promise(r => setTimeout(r, 200)); // Pausa após fechar
                 }


            } catch (error) {
                console.error(`Erro processando o span ${i + 1} ("${errorSpan.textContent.trim()}"):`, error);
                 errorCount++;
                // Tenta fechar o menu em caso de erro
                 try { document.body.click(); } catch(e){}
                 await new Promise(r => setTimeout(r, 100));
            }
             // Pausa entre processamento de erros para a UI respirar
             await new Promise(r => setTimeout(r, 150));

        } // Fim do loop for

        // Reabilita os botões
        correctButton.disabled = false;
        if (startButton) startButton.disabled = false;

        console.log('Correção simulada concluída.');
        let finalMessage = `Correção simulada finalizada!\n\n${correctedCount} erros foram corrigidos com sucesso.`;
        if (errorCount > 0) {
            finalMessage += `\n${errorCount} erros não puderam ser corrigidos (verifique o console para detalhes).`;
        }
        if (correctedCount === 0 && errorCount === 0) {
             finalMessage = `Nenhum erro processável foi encontrado ou corrigido.`;
        }
        showCustomAlert(finalMessage, "Resultado da Correção");

    }; // Fim do onclick bmBtnCorrect

  }, 3600); // Aumentado levemente o delay inicial para dar tempo às animações do splash

})(); // Fim da IIFE
