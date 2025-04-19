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
    <div id="bmSplashTxt2">V1</div>
  `;
  document.body.appendChild(splash);

  //
  // 2) CSS INJETADO
  //
  const css = `
    /* --- Splash --- */
    #bmSplash {
      position: fixed; top:0; left:0; width:100%; height:100%;
      background:#000; display:flex; flex-direction:column;
      align-items:center; justify-content:center; z-index:99999;
      overflow:hidden; animation:fadeOut 1s forwards 3s;
    }
    #bmSplashImg {
      width:200px;
      animation:popIn .5s forwards, moveUp .5s forwards .8s;
    }
    #bmSplashTxt1,#bmSplashTxt2 {
      font-family:'Segoe UI Black',sans-serif;
      color:#fff; font-size:2em; opacity:0;
    }
    #bmSplashTxt1 { animation:txt1Pop .5s forwards 1.3s; }
    #bmSplashTxt2 { animation:txt2Pop .5s forwards 1.8s; }
    @keyframes popIn { from{transform:scale(0)} to{transform:scale(1)} }
    @keyframes moveUp{ from{transform:translateY(0)} to{transform:translateY(-30px)} }
    @keyframes txt1Pop{ from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes txt2Pop{ from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeOut{ to{opacity:0} }

    /* --- Wrapper e animações gerais --- */
    #bmWrapper {
      position: fixed; top:20px; right:20px; width:320px;
      background:#111; color:#fff; border-radius:12px;
      box-shadow:0 6px 15px rgba(0,0,0,.6);
      font-family:'Segoe UI Black',sans-serif;
      opacity:0; transform:translateY(-20px) scale(.95);
      transition:opacity .4s, transform .4s; z-index:99998;
    }
    #bmWrapper.show { opacity:1; transform:translateY(0) scale(1); }

    /* --- Header arrastável --- */
    #bmHeader {
      cursor:move; padding:10px; background:#8A2BE2;
      text-align:center; border-radius:12px 12px 0 0;
      font-weight:700; color:#fff;
      transition:background .3s;
    }

    /* --- Conteúdo Interno (views) --- */
    #bmContent {
      padding:12px; position:relative; overflow:hidden;
    }
    .view {
      opacity:0; transform:translateY(10px);
      transition:opacity .3s, transform .3s;
      display:none;
    }
    .view.active {
      display:block; opacity:1; transform:translateY(0);
    }

    /* --- Botões principais do menu --- */
    .menu-btn {
      width:100%; padding:12px; margin-bottom:10px;
      border:none; border-radius:6px;
      background:#8A2BE2; color:#fff; font-size:1em;
      cursor:pointer; transition:transform .2s, box-shadow .2s;
    }
    .menu-btn:hover {
      transform:scale(1.05);
      box-shadow:0 4px 10px rgba(138,43,226,.5);
    }

    /* --- Voltar --- */
    .back-btn {
      margin-top:8px; width:100%; padding:8px;
      background:#444; color:#fff; border:none;
      border-radius:6px; cursor:pointer;
      transition:background .3s;
    }
    .back-btn:hover {
      background:#555;
    }

    /* --- Inserir Texto (view “Colar Textos”) --- */
    #bmPaste textarea,
    #bmPaste input,
    #bmPaste button {
      width:100%; margin-bottom:10px;
      border-radius:6px; border:none; padding:10px;
      font-size:1em; transition:box-shadow .3s,transform .2s;
    }
    #bmPaste textarea, #bmPaste input { background:#222; color:#fff; }
    #bmPaste textarea:focus,
    #bmPaste input:focus { box-shadow:0 0 8px #8A2BE2; outline:none; }
    #bmPaste button {
      background:#8A2BE2; color:#fff; cursor:pointer;
    }
    #bmPaste button:hover {
      transform:scale(1.05);
      box-shadow:0 4px 10px rgba(138,43,226,.5);
    }

    /* reutilize aqui o CSS de stealth, contador, overlay e pop-bounce como antes... */
    /* ... */
  `;
  const styleTag = document.createElement('style');
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);

  //
  // 3) Após splash, monta wrapper e menu
  //
  setTimeout(() => {
    document.body.removeChild(splash);

    // monta estrutura
    const wrapper = document.createElement('div');
    wrapper.id = 'bmWrapper';
    wrapper.innerHTML = `
      <div id="bmHeader">Paraná Colado V1</div>
      <div id="bmContent">
        <!-- Menu Principal -->
        <div id="bmMenu" class="view active">
          <button id="btnOnline" class="menu-btn">Correção Online</button>
          <button id="btnPaste"  class="menu-btn">Colar Textos</button>
        </div>
        <!-- View Correção (vazia por enquanto) -->
        <div id="bmOnline" class="view">
          <!-- Você pode colocar aqui o conteúdo de correção online -->
          <button id="btnBack1" class="back-btn">Voltar</button>
        </div>
        <!-- View Colar Textos (sua UI existente) -->
        <div id="bmPaste" class="view">
          <!-- campo de texto e delay -->
          <textarea id="bmText" placeholder="Digite seu texto"></textarea>
          <input id="bmDelay" type="number" step="0.01" value="0.02"/>
          <!-- stealth toggle, contador etc. -->
          <!-- (insira aqui exatamente o HTML que você já tinha para modo disfarçado) -->
          <div id="bmToggleWrapper">
            <img id="bmToggleImg"/>
            <span id="bmToggleText">Modo Disfarçado</span>
          </div>
          <button id="bmBtn">Iniciar</button>
          <button id="btnBack2" class="back-btn">Voltar</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);
    setTimeout(() => wrapper.classList.add('show'), 100);

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

    // helper pra trocar view
    function showView(id) {
      wrapper.querySelectorAll('.view').forEach(v => {
        v.classList.toggle('active', v.id === id);
      });
    }

    // eventos dos botões do menu
    document.getElementById('btnOnline').onclick = () => showView('bmOnline');
    document.getElementById('btnPaste').onclick  = () => {
      showView('bmPaste');
      initPasteUI();    // inicializa stealth, sendChar, contador etc.
    };
    document.getElementById('btnBack1').onclick = () => showView('bmMenu');
    document.getElementById('btnBack2').onclick = () => showView('bmMenu');

    //
    // 4) Função de inicializar a UI de “Colar Textos”
    //
    function initPasteUI() {
      // ... aqui replique toda a lógica que você já tinha:
      // - toggle stealth (imgOn/imgOff, applyStealth/applyNormal + overlay inicial)
      // - função sendChar(c)
      // - contador 3-2-1 animado
      // - handler do botão “Iniciar”

      // por exemplo:
      const toggleImg  = document.getElementById('bmToggleImg');
      const toggleText = document.getElementById('bmToggleText');
      let stealthState = false;
      let stealthSeen  = false;
      const imgOff     = 'https://i.imgur.com/a000adcb.png';
      const imgOn      = 'https://i.imgur.com/k41QpMa.png';
      toggleImg.src = imgOff;

      // aplicar estilos normal/stealth...
      function applyNormal() { /* ... */ }
      function applyStealth() { /* ... */ }

      // overlay pop na primeira vez...
      function showOverlay() { /* ... */ }

      toggleImg.onclick = () => {
        stealthState = !stealthState;
        toggleImg.src = stealthState ? imgOn : imgOff;
        if (stealthState) {
          if (!stealthSeen) { stealthSeen = true; showOverlay(); }
          else applyStealth();
        } else applyNormal();
      };
      applyNormal();

      // sendChar e contador
      function sendChar(c) { /* ... */ }

      document.getElementById('bmBtn').onclick = async function() {
        const text = document.getElementById('bmText').value;
        const delay = parseFloat(document.getElementById('bmDelay').value) * 1000;
        if (!text) return alert('Texto vazio!');
        this.disabled = true;
        for (let n = 3; n >= 1; n--) {
          // animação do contador...
        }
        for (let ch of text) {
          sendChar(ch);
          await new Promise(r => setTimeout(r, delay));
        }
        this.disabled = false;
      };
    }
  }, 3500);

})();
