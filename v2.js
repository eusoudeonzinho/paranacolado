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
    /* ---- splash ---- */
    #bmSplash {
      position: fixed; top:0; left:0;
      width:100%; height:100%;
      background:#000; display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      z-index:99999; overflow:hidden;
      animation: fadeOut 1s forwards 3s;
    }
    #bmSplashImg {
      width:200px;
      animation: popIn .5s forwards,
                 moveUp .5s forwards .8s;
    }
    #bmSplashTxt1,#bmSplashTxt2 {
      font-family:'Segoe UI Black',sans-serif;
      color:#fff; font-size:2em; opacity:0;
    }
    #bmSplashTxt1 { animation: txt1Pop .5s forwards 1.3s; }
    #bmSplashTxt2 { animation: txt2Pop .5s forwards 1.8s; }

    @keyframes popIn    { from{transform:scale(0)} to{transform:scale(1)} }
    @keyframes moveUp   { from{transform:translateY(0)} to{transform:translateY(-30px)} }
    @keyframes txt1Pop  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes txt2Pop  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeOut  { to{opacity:0} }

    /* ---- wrapper geral ---- */
    #bmWrapper {
      position: fixed; top:20px; right:20px;
      width:320px; background:#111; color:#fff;
      border-radius:12px; box-shadow:0 6px 15px rgba(0,0,0,.6);
      font-family:'Segoe UI Black',sans-serif;
      opacity:0; transform:translateY(-20px) scale(.95);
      transition: opacity .4s, transform .4s;
      z-index:99998;
    }
    #bmWrapper.show {
      opacity:1; transform:translateY(0) scale(1);
    }

    /* ---- views (menu + subviews) ---- */
    .bmView {
      position: relative; padding:12px;
      display: none; opacity:0;
      transition: opacity .4s ease, transform .4s ease;
      transform: translateY(10px);
    }
    .bmView.active {
      display: block; opacity:1;
      transform: translateY(0);
    }

    /* ---- main menu ---- */
    #bmMainMenu button {
      width:100%; margin-bottom:10px;
      padding:12px; font-size:1em;
      border:none; border-radius:6px;
      background:#8A2BE2; color:#fff;
      cursor:pointer; transition: transform .2s, box-shadow .2s;
    }
    #bmMainMenu button:hover {
      transform:scale(1.03);
      box-shadow:0 4px 10px rgba(138,43,226,.5);
    }

    /* ---- subviews ---- */
    #bmOnlineView, #bmPasteView {
      background:transparent;
    }
    #bmOnlineView p {
      font-size:1em; color:#ddd;
      margin-bottom:20px;
    }
    #bmPasteView textarea,
    #bmPasteView input,
    #bmPasteView button {
      width:100%; margin-bottom:10px;
      padding:10px; font-size:1em;
      border:none; border-radius:6px;
      transition: box-shadow .3s, transform .2s;
    }
    #bmPasteView textarea,
    #bmPasteView input {
      background:#222; color:#fff;
    }
    #bmPasteView textarea:focus,
    #bmPasteView input:focus {
      box-shadow:0 0 8px #8A2BE2; outline:none;
    }
    #bmPasteView .action-btn {
      background:#8A2BE2; color:#fff; cursor:pointer;
    }
    #bmPasteView .action-btn:hover {
      transform:scale(1.03);
      box-shadow:0 4px 10px rgba(138,43,226,.5);
    }

    /* ---- contador 3‑2‑1 ---- */
    @keyframes countPop {
      0%   { opacity:0; transform:scale(0.5) }
      50%  { opacity:1; transform:scale(1.2) }
      100% { opacity:0; transform:scale(1) }
    }
    .countEl {
      position:absolute; top:50px; right:20px;
      font-family:'Segoe UI Black'; color:#8A2BE2;
      font-size:1.5em; opacity:0;
      animation:countPop .7s ease-out forwards;
    }
  `;
  const styleTag = document.createElement('style');
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);

  //
  // 3) PÓS-SPLASH: MONTA INTERFACES
  //
  setTimeout(() => {
    document.body.removeChild(splash);

    // wrapper principal
    const wrapper = document.createElement('div');
    wrapper.id = 'bmWrapper';
    wrapper.innerHTML = `
      <!-- MAIN MENU -->
      <div id="bmMainMenu" class="bmView active">
        <button id="btnOnline">Correção Online</button>
        <button id="btnPaste">Colar Textos</button>
      </div>

      <!-- VIEW 1: Correção Online -->
      <div id="bmOnlineView" class="bmView">
        <p>(Em breve aqui vai a interface de correção online.)</p>
        <button id="btnBack1" class="action-btn">Voltar</button>
      </div>

      <!-- VIEW 2: Colar Textos -->
      <div id="bmPasteView" class="bmView">
        <textarea id="bmText" placeholder="Digite seu texto"></textarea>
        <input id="bmDelay" type="number" step="0.01" value="0.02">
        <div id="bmToggleWrapper">
          <img id="bmToggleImg" src="https://i.imgur.com/a000adcb.png" style="width:24px;cursor:pointer">
          <span id="bmToggleText">Modo Disfarçado</span>
        </div>
        <button id="bmBtn" class="action-btn">Iniciar</button>
        <button id="btnBack2" class="action-btn">Voltar</button>
      </div>
    `;
    document.body.appendChild(wrapper);
    setTimeout(() => wrapper.classList.add('show'), 100);

    // fun: alterna views
    function showView(id) {
      wrapper.querySelectorAll('.bmView').forEach(v => {
        v.classList.toggle('active', v.id === id);
      });
    }

    // botões do menu
    document.getElementById('btnOnline').onclick = () => showView('bmOnlineView');
    document.getElementById('btnPaste').onclick  = () => showView('bmPasteView');
    document.getElementById('btnBack1').onclick  = () => showView('bmMainMenu');
    document.getElementById('btnBack2').onclick  = () => showView('bmMainMenu');

    //
    // 4) FUNÇÃO DE SIMULAR TECLA
    //
    function sendChar(c) {
      if (!activeEl) return;
      ['keydown','keypress'].forEach(type =>
        activeEl.dispatchEvent(new KeyboardEvent(type, {
          key: c, char: c,
          keyCode: c.charCodeAt(0),
          which: c.charCodeAt(0),
          bubbles: true
        }))
      );
      if (activeEl.isContentEditable) {
        document.execCommand('insertText', false, c);
      } else if (activeEl.tagName==='TEXTAREA' || activeEl.tagName==='INPUT') {
        const setter = Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(activeEl), 'value'
        ).set;
        setter.call(activeEl, activeEl.value + c);
        activeEl.dispatchEvent(new Event('input',{bubbles:true}));
        activeEl.dispatchEvent(new Event('change',{bubbles:true}));
      }
      activeEl.dispatchEvent(new KeyboardEvent('keyup', {
        key: c, char: c,
        keyCode: c.charCodeAt(0),
        which: c.charCodeAt(0),
        bubbles: true
      }));
    }

    //
    // 5) LÓGICA DO “COLAR TEXTOS”
    //
    document.getElementById('bmBtn').onclick = async function() {
      const text  = document.getElementById('bmText').value;
      const delay = parseFloat(document.getElementById('bmDelay').value) * 1000;
      if (!text) return alert('Texto vazio!');
      this.disabled = true;

      // contador 3‑2‑1
      for (let n = 3; n >= 1; n--) {
        const cnt = document.createElement('div');
        cnt.className = 'countEl';
        cnt.textContent = n;
        wrapper.appendChild(cnt);
        await new Promise(r => setTimeout(r, 700));
        wrapper.removeChild(cnt);
        await new Promise(r => setTimeout(r, 200));
      }

      // digita
      for (let ch of text) {
        sendChar(ch);
        await new Promise(r => setTimeout(r, delay));
      }

      this.disabled = false;
    };

    //
    // 6) (Opcional) Lógica “Modo Disfarçado”
    //    -- você pode reaproveitar de antes se quiser --
    //
  }, 3500);

})();
