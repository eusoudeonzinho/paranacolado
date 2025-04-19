(function() {
  // evita duplo carregamento
  if (document.getElementById('bmSplash')) return;

  // guarda último elemento clicado
  let activeEl = null;
  document.addEventListener('mousedown', e => activeEl = e.target, true);

  //
  // 1) SPLASH INICIAL
  //
  const splash = document.createElement('div');
  splash.id = 'bmSplash';
  splash.innerHTML = `
    <img id="bmSplashImg" src="https://i.imgur.com/RUWcJ6e.png"/>
    <div id="bmSplashTxt1">Paraná Colado</div>
    <div id="bmSplashTxt2">V2</div>
  `;
  document.body.appendChild(splash);

  //
  // 2) INJEÇÃO DE CSS
  //
  const css = `
    /* splash */
    #bmSplash {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: #000; z-index: 99999;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      animation: fadeOut 1s forwards 3s;
    }
    #bmSplashImg {
      width: 200px;
      animation: popIn .5s forwards, moveUp .5s forwards .8s;
    }
    #bmSplashTxt1, #bmSplashTxt2 {
      font-family: 'Segoe UI Black', sans-serif;
      color: #fff; font-size: 2em; opacity: 0;
    }
    #bmSplashTxt1 { animation: txt1Pop .5s forwards 1.3s; }
    #bmSplashTxt2 { animation: txt2Pop .5s forwards 1.8s; }
    @keyframes popIn    { from{transform:scale(0)} to{transform:scale(1)} }
    @keyframes moveUp   { from{transform:translateY(0)} to{transform:translateY(-30px)} }
    @keyframes txt1Pop  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes txt2Pop  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeOut  { to{opacity:0} }

    /* wrapper principal */
    #bmWrapper {
      position: fixed; top: 20px; right: 20px;
      width: 320px; background: #111; color: #fff;
      border-radius: 12px; box-shadow: 0 6px 15px rgba(0,0,0,.6);
      font-family: 'Segoe UI Black', sans-serif;
      opacity: 0; transform: translateY(-20px) scale(.95);
      transition: opacity .4s, transform .4s;
      z-index: 99998;
    }
    #bmWrapper.show {
      opacity: 1; transform: translateY(0) scale(1);
    }

    /* header */
    #bmHeader {
      cursor: move; padding: 10px;
      background: #8A2BE2; color: #fff; text-align: center;
      border-radius: 12px 12px 0 0; font-weight: 700;
    }

    /* áreas de conteúdo (telas) */
    .screen {
      position: relative; opacity: 0;
      transform: translateY(20px);
      transition: opacity .3s ease, transform .3s ease;
      padding: 12px;
    }
    .screen.show {
      opacity: 1; transform: translateY(0);
    }

    /* menu principal */
    #bmMenu .menuBtn {
      display: block; width: 100%;
      margin-bottom: 10px; padding: 12px 0;
      font-size: 1em; border: none; border-radius: 6px;
      background: #8A2BE2; color: #fff; cursor: pointer;
      transition: transform .2s, box-shadow .2s;
    }
    #bmMenu .menuBtn:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 10px rgba(138,43,226,.5);
    }

    /* placeholder de Correção */
    #bmCorrecao .placeholder {
      color: #aaa; text-align: center; margin: 40px 0;
      font-style: italic;
    }

    /* botões de voltar */
    .backBtn {
      display: block; margin: 20px auto 0;
      padding: 8px 16px; border: none;
      border-radius: 6px; background: #555; color: #fff;
      cursor: pointer; transition: background .2s;
    }
    .backBtn:hover {
      background: #777;
    }

    /* colar textos: reaproveita estilos anteriores */
    #bmColar textarea, #bmColar input {
      width: 100%; margin-bottom: 10px;
      padding: 10px; border-radius: 6px;
      border: none; background: #222; color: #fff;
      font-size: 1em; transition: box-shadow .3s;
    }
    #bmColar textarea:focus, #bmColar input:focus {
      box-shadow: 0 0 8px #8A2BE2; outline: none;
    }
    #bmColar button {
      background: #8A2BE2; color: #fff;
      cursor: pointer; transition: transform .2s, box-shadow .2s;
      margin-bottom: 10px;
    }
    #bmColar button:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 10px rgba(138,43,226,.5);
    }

    /* toggle stealth (imagem + texto) */
    #bmToggleWrapper {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 10px;
    }
    #bmToggleImg {
      width: 24px; height: 24px; cursor: pointer;
      transition: transform .2s;
    }
    #bmToggleText {
      user-select: none;
    }

    /* contador 3‑2‑1 */
    @keyframes countPop {
      0%   { opacity: 0; transform: scale(0.5) }
      50%  { opacity: 1; transform: scale(1.2) }
      100% { opacity: 0; transform: scale(1) }
    }
  `;
  const styleTag = document.createElement('style');
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);

  //
  // 3) após splash, monta UI principal
  //
  setTimeout(() => {
    // remove splash
    document.body.removeChild(splash);

    // cria wrapper
    const wrapper = document.createElement('div');
    wrapper.id = 'bmWrapper';
    wrapper.innerHTML = `
      <div id="bmHeader">Paraná Colado V1</div>
      <div id="bmContent">
        <!-- Tela 1: Menu -->
        <div id="bmMenu" class="screen show">
          <button id="btnCorrecao" class="menuBtn">Correção Online</button>
          <button id="btnColar"   class="menuBtn">Colar Textos</button>
        </div>
        <!-- Tela 2: Correção (placeholder) -->
        <div id="bmCorrecao" class="screen">
          <div class="placeholder">Correção Online em construção...</div>
          <button id="btnVoltarCorrecao" class="backBtn">Voltar</button>
        </div>
        <!-- Tela 3: Colar Textos -->
        <div id="bmColar" class="screen">
          <textarea id="bmText"    placeholder="Digite seu texto"></textarea>
          <input    id="bmDelay"   type="number" step="0.01" value="0.02">
          <div id="bmToggleWrapper">
            <img    id="bmToggleImg"/>
            <span   id="bmToggleText">Modo Disfarçado</span>
          </div>
          <button id="bmBtn">Iniciar</button>
          <button id="btnVoltarColar" class="backBtn">Voltar</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);
    // anima entrada
    requestAnimationFrame(() => wrapper.classList.add('show'));

    // torna header arrastável
    const header = document.getElementById('bmHeader');
    header.onmousedown = e => {
      let dx = e.clientX - wrapper.offsetLeft;
      let dy = e.clientY - wrapper.offsetTop;
      document.onmousemove = ev => {
        wrapper.style.left = (ev.clientX - dx) + 'px';
        wrapper.style.top  = (ev.clientY - dy) + 'px';
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };

    //
    // 4) LÓGICA DE NAVEGAÇÃO ENTRE TELAS
    //
    const screens = {
      menu:     document.getElementById('bmMenu'),
      correcao: document.getElementById('bmCorrecao'),
      colar:    document.getElementById('bmColar')
    };

    function showScreen(name) {
      Object.values(screens).forEach(el => el.classList.remove('show'));
      screens[name].classList.add('show');
    }

    document.getElementById('btnCorrecao')
      .addEventListener('click', () => showScreen('correcao'));
    document.getElementById('btnVoltarCorrecao')
      .addEventListener('click', () => showScreen('menu'));
    document.getElementById('btnColar')
      .addEventListener('click', () => showScreen('colar'));
    document.getElementById('btnVoltarColar')
      .addEventListener('click', () => showScreen('menu'));

    //
    // 5) (Re)injeção das funcionalidades de "Colar Textos"
    //
    // -- aqui você pode copiar/adaptar todo o seu código de sendChar,
    //    stealth mode, contador 3‑2‑1 e etc, exatamente como antes.
    //
    // Por exemplo:
    function sendChar(c) { /* ... */ }
    // stealth toggle, applyNormal/applyStealth, contador, botão Iniciar...
    // document.getElementById('bmBtn').onclick = async function() { /* ... */ };

    //
    // 6) Inicializa na tela de menu
    //
    showScreen('menu');

  }, 3500); // espera o splash terminar
})();
