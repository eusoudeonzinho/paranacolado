(function() {
  // evita recarregamento duplo
  if (document.getElementById('bmSplash')) return;

  // guarda último elemento clicado pra enviar teclas
  let activeEl = null;
  document.addEventListener('mousedown', e => activeEl = e.target, true);

  //
  // 1) SPLASH ANIMADO
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
  // 2) INJEÇÃO DE CSS
  //
  const css = `
    /* splash */
    #bmSplash {
      position: fixed; top:0; left:0;
      width:100%; height:100%;
      background:#000; display:flex;
      flex-direction:column; align-items:center; justify-content:center;
      z-index:99999; overflow:hidden;
      animation:fadeOut 1s forwards 3s;
    }
    #bmSplashImg {
      width:200px;
      animation:popIn .5s forwards, moveUp .5s forwards .8s;
    }
    #bmSplashTxt1, #bmSplashTxt2 {
      font-family:'Segoe UI Black', sans-serif;
      color:#fff; font-size:2em; opacity:0;
    }
    #bmSplashTxt1 { animation:txt1Pop .5s forwards 1.3s; }
    #bmSplashTxt2 { animation:txt2Pop .5s forwards 1.8s; }
    @keyframes popIn { from{transform:scale(0)} to{transform:scale(1)} }
    @keyframes moveUp { from{transform:translateY(0)} to{transform:translateY(-30px)} }
    @keyframes txt1Pop { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes txt2Pop { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeOut { to{opacity:0} }

    /* painel comum */
    .panel {
      position: fixed; top:20px; right:20px;
      width:300px; background:#111; color:#fff;
      border-radius:12px; box-shadow:0 6px 15px rgba(0,0,0,0.6);
      font-family:'Segoe UI Black', sans-serif;
      opacity:0; transform:translateY(-20px) scale(.95);
      transition:opacity .4s ease, transform .4s ease;
      z-index:99998;
    }
    .panel.show {
      opacity:1; transform:translateY(0) scale(1);
    }
    .panel-header {
      padding:10px; text-align:center;
      font-weight:700; cursor:move;
      background:#8A2BE2; color:#fff;
      border-radius:12px 12px 0 0;
    }
    .panel-content {
      padding:12px;
    }
    .panel-content button,
    .panel-content textarea,
    .panel-content input {
      width:100%; margin-bottom:10px;
      border:none; border-radius:6px;
      padding:10px; font-size:1em;
      background:#222; color:#fff;
      transition:box-shadow .3s, transform .2s;
      cursor:pointer;
    }
    .panel-content button:hover {
      transform:scale(1.05);
      box-shadow:0 4px 10px rgba(138,43,226,0.5);
    }
    .panel-content button:active {
      transform:scale(.95);
      box-shadow:0 2px 5px rgba(138,43,226,0.5);
    }

    /* contador 3-2-1 */
    @keyframes countPop {
      0%   { opacity:0; transform:scale(0.5) }
      50%  { opacity:1; transform:scale(1.2) }
      100% { opacity:0; transform:scale(1) }
    }

    /* overlay disfarçado */
    #bmOv {
      position:fixed; top:0; left:0; width:100%; height:100%;
      background:rgba(0,0,0,0.9);
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      z-index:100000;
      animation:ovFadeIn .5s forwards;
    }
    @keyframes ovFadeIn { from{opacity:0} to{opacity:1} }
    #bmOv img {
      max-width:80%; max-height:60%;
      animation:popBounce .6s forwards;
    }
    @keyframes popBounce {
      0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)}
    }
    #bmOv button {
      margin-top:20px; padding:12px 24px;
      background:#008CBA; color:#fff;
      border:none; border-radius:6px;
      font-size:1.1em; cursor:pointer;
      animation:btnShake 1s ease-in-out infinite alternate;
      transition:transform .2s;
    }
    @keyframes btnShake {0%{transform:translateY(0)}100%{transform:translateY(-5px)}}
    #bmOv button:hover { transform:scale(1.05) }
  `;
  const styleTag = document.createElement('style');
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);

  //
  // 3) MONTAR MENU PRINCIPAL + PAINÉIS
  //
  setTimeout(() => {
    // remove splash
    document.body.removeChild(splash);

    // cria painel principal
    const main = document.createElement('div');
    main.id = 'bmMain';
    main.className = 'panel';
    main.innerHTML = `
      <div class="panel-header">Paraná Colado V1</div>
      <div class="panel-content">
        <button id="btnOnline">Correção Online</button>
        <button id="btnPaste">Colar Textos</button>
      </div>
    `;
    document.body.appendChild(main);
    requestAnimationFrame(() => main.classList.add('show'));

    // painel "Correção Online"
    const online = document.createElement('div');
    online.id = 'bmOnline';
    online.className = 'panel';
    online.innerHTML = `
      <div class="panel-header">Correção Online</div>
      <div class="panel-content">
        <p>Em breve...</p>
        <button id="onlineBack">Voltar</button>
      </div>
    `;
    document.body.appendChild(online);

    // painel "Colar Textos" (cheat UI)
    const paste = document.createElement('div');
    paste.id = 'bmPaste';
    paste.className = 'panel';
    paste.innerHTML = `
      <div class="panel-header">Paraná Colado V1</div>
      <div class="panel-content">
        <textarea id="bmText" placeholder="Digite seu texto"></textarea>
        <input id="bmDelay" type="number" step="0.01" value="0.02">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <img id="bmToggleImg" style="width:24px;cursor:pointer">
          <span id="bmToggleText">Modo Disfarçado</span>
        </div>
        <button id="bmBtn">Iniciar</button>
        <button id="pasteBack">Voltar</button>
      </div>
    `;
    document.body.appendChild(paste);

    //
    // 4) CONTROLE DE PAINÉIS
    //
    const showPanel = el => {
      [main, online, paste].forEach(p => p !== el ? p.classList.remove('show') : p.classList.add('show'));
    };
    document.getElementById('btnOnline')
      .onclick = () => showPanel(online);
    document.getElementById('btnPaste')
      .onclick = () => showPanel(paste);
    document.getElementById('onlineBack')
      .onclick = () => showPanel(main);
    document.getElementById('pasteBack')
      .onclick = () => showPanel(main);

    //
    // 5) LÓGICA DO “COLAR TEXTOS” (modo disfarçado, contador, envio)
    //
    let stealthSeen = false;
    let stealthOn   = false;
    const toggleImg  = document.getElementById('bmToggleImg');
    const toggleText = document.getElementById('bmToggleText');
    const imgOff     = 'https://i.imgur.com/a000adcb.png';
    const imgOn      = 'https://i.imgur.com/k41QpMa.png';
    toggleImg.src = imgOff;

    // aplica estilo normal/disfarçado na paste UI
    function applyNormalUI() {
      paste.style.background = '#111';
      paste.querySelector('.panel-header').style.background = '#8A2BE2';
      paste.style.color = '#fff';
      paste.querySelectorAll('textarea,input,button').forEach(el => {
        el.style.background = '#222';
        el.style.color = '#fff';
      });
      toggleText.style.color = '#fff';
      paste.removeEventListener('mouseleave', hidePasteUI);
      document.removeEventListener('mousemove', showPasteUI);
    }
    function applyStealthUI() {
      paste.style.background = '#fff';
      paste.querySelector('.panel-header').style.background = '#0f4665';
      paste.style.color = '#000';
      paste.querySelectorAll('textarea,input,button').forEach(el => {
        el.style.background = '#ccc';
        el.style.color = '#000';
      });
      toggleText.style.color = '#000';
      paste.addEventListener('mouseleave', hidePasteUI);
      document.addEventListener('mousemove', showPasteUI);
    }
    let rect;
    function hidePasteUI() {
      rect = paste.getBoundingClientRect();
      paste.style.opacity = 0;
      paste.style.pointerEvents = 'none';
    }
    function showPasteUI(e) {
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top  && e.clientY <= rect.bottom
      ) {
        paste.style.opacity = 1;
        paste.style.pointerEvents = 'auto';
      }
    }

    // overlay POP na primeira vez
    function showOverlay() {
      const ov = document.createElement('div');
      ov.id = 'bmOv';
      ov.innerHTML = `
        <img src="https://i.imgur.com/RquEok4.gif">
        <button id="bmOvBtn">Continuar</button>
      `;
      document.body.appendChild(ov);
      document.getElementById('bmOvBtn').onclick = () => {
        document.body.removeChild(ov);
        applyStealthUI();
      };
    }

    toggleImg.onclick = () => {
      stealthOn = !stealthOn;
      toggleImg.src = stealthOn ? imgOn : imgOff;
      if (stealthOn) {
        if (!stealthSeen) {
          stealthSeen = true;
          showOverlay();
        } else {
          applyStealthUI();
        }
      } else {
        applyNormalUI();
      }
    };
    applyNormalUI();

    // função que dispara eventos e insere texto
    function sendChar(c) {
      if (!activeEl) return;
      ['keydown','keypress'].forEach(type => {
        activeEl.dispatchEvent(new KeyboardEvent(type, {
          key: c, char: c,
          keyCode: c.charCodeAt(0),
          which: c.charCodeAt(0),
          bubbles: true
        }));
      });
      if (activeEl.isContentEditable) {
        document.execCommand('insertText', false, c);
      } else if (/[INPUT|TEXTAREA]/.test(activeEl.tagName)) {
        const setter = Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(activeEl), 'value'
        ).set;
        setter.call(activeEl, activeEl.value + c);
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        activeEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
      activeEl.dispatchEvent(new KeyboardEvent('keyup', {
        key: c, char: c,
        keyCode: c.charCodeAt(0),
        which: c.charCodeAt(0),
        bubbles: true
      }));
    }

    // botão “Iniciar” com contador
    document.getElementById('bmBtn').onclick = async function() {
      const text  = document.getElementById('bmText').value;
      const delay = parseFloat(document.getElementById('bmDelay').value) * 1000;
      if (!text) return alert('Texto vazio!');
      this.disabled = true;
      for (let n = 3; n >= 1; n--) {
        const cnt = document.createElement('div');
        cnt.textContent = n;
        Object.assign(cnt.style, {
          position:   'absolute',
          top:        '50px',
          right:      '20px',
          fontFamily: 'Segoe UI Black',
          color:      '#8A2BE2',
          fontSize:   '1.5em',
          opacity:    0,
          animation:  'countPop .7s ease-out forwards'
        });
        paste.appendChild(cnt);
        await new Promise(r => setTimeout(r, 700));
        paste.removeChild(cnt);
        await new Promise(r => setTimeout(r, 200));
      }
      for (let ch of text) {
        sendChar(ch);
        await new Promise(r => setTimeout(r, delay));
      }
      this.disabled = false;
    };

  }, 3500); // espera splash desaparecer

})();
