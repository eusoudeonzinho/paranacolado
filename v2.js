(function() {
  // evita recarga dupla
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
  // 2) INJEÇÃO DE CSS
  //
  const css = `
    /* USAR FONTE CYBERPUNK */
    * { font-family: 'VCR OSD MONO', monospace !important; }

    /* splash */
    #bmSplash {
      position:fixed; top:0; left:0;
      width:100%; height:100%;
      background:#000;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      z-index:99999; overflow:hidden;
      animation:fadeOut 1s forwards 3s;
    }
    #bmSplashImg {
      width:200px;
      animation:popIn .5s forwards, moveUp .5s forwards .8s;
    }
    #bmSplashTxt1, #bmSplashTxt2 {
      color:#0ff; font-size:2em; opacity:0;
    }
    #bmSplashTxt1 { animation:txt1Pop .5s forwards 1.3s; }
    #bmSplashTxt2 { animation:txt2Pop .5s forwards 1.8s; }

    @keyframes popIn    { from{transform:scale(0)} to{transform:scale(1)} }
    @keyframes moveUp   { from{transform:translateY(0)} to{transform:translateY(-30px)} }
    @keyframes txt1Pop  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes txt2Pop  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeOut  { to{opacity:0} }

    /* wrapper geral */
    #bmWrapper {
      position:fixed; top:20px; right:20px;
      width:320px; background:#111; color:#0ff;
      border:2px solid #0ff;
      border-radius:12px; box-shadow:0 0 10px #0ff;
      opacity:0; transform:translateY(-20px) scale(.95);
      transition:opacity .4s, transform .4s; z-index:99998;
    }
    #bmWrapper.show {
      opacity:1; transform:translateY(0) scale(1);
    }

    /* header */
    #bmHeader {
      cursor:move; padding:10px; text-align:center;
      background: linear-gradient(90deg,#ff00ff,#00ffff);
      color:#000; border-radius:12px 12px 0 0;
      text-shadow:0 0 5px #000;
    }

    /* conteúdo */
    #bmContent {
      position:relative; padding:12px;
    }
    #bmContent > * {
      opacity:0; transform:translateY(10px);
      transition:opacity .3s ease, transform .3s ease;
    }
    #bmContent.content-show > * {
      opacity:1; transform:translateY(0);
    }

    /* menu */
    #bmMenu {
      display:flex; flex-direction:column; gap:10px;
    }
    #bmMenu button {
      padding:12px;
      background: linear-gradient(90deg,#ff00ff,#00ffff);
      color:#000; border:none; border-radius:6px;
      cursor:pointer; transition:transform .2s, box-shadow .2s;
    }
    #bmMenu button:hover {
      transform:scale(1.05); box-shadow:0 0 8px #ff00ff;
    }
    #bmMenu button:active {
      transform:scale(.95);
    }

    /* back button */
    .bmBackBtn {
      width:100%; padding:10px;
      background:#444; color:#0ff;
      border:none; border-radius:6px;
      cursor:pointer; transition:transform .2s, box-shadow .2s;
    }
    .bmBackBtn:hover {
      transform:scale(1.05); box-shadow:0 0 8px #0ff;
    }
    .bmBackBtn:active {
      transform:scale(.95);
    }

    /* paste UI */
    #bmContent textarea,
    #bmContent input,
    #bmContent button#bmBtn {
      width:100%; margin-bottom:10px;
      background:#222; color:#0ff;
      border:none; border-radius:6px; padding:10px;
      transition:box-shadow .3s;
    }
    #bmContent textarea:focus,
    #bmContent input:focus {
      box-shadow:0 0 8px #ff00ff; outline:none;
    }
    #bmBtn {
      background: linear-gradient(90deg,#ff00ff,#00ffff);
      color:#000; cursor:pointer;
    }
    #bmBtn:hover {
      transform:scale(1.05); box-shadow:0 0 8px #00ffff;
    }
    #bmBtn:active {
      transform:scale(.95);
    }

    /* stealth toggle */
    #bmToggleWrapper {
      display:flex; align-items:center; gap:8px;
      margin-bottom:10px;
    }
    #bmToggleImg {
      width:24px; height:24px; cursor:pointer;
      transition:transform .2s;
    }
    #bmToggleText {
      color:inherit; user-select:none;
    }

    /* overlay */
    #bmOv {
      position:fixed; top:0; left:0;
      width:100%; height:100%;
      background:rgba(0,0,0,.9);
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
      background:#0f4665; color:#fff; border:none;
      border-radius:6px; cursor:pointer;
      animation:btnShake 1s ease-in-out infinite alternate;
      transition:transform .2s;
    }
    @keyframes btnShake { 0%{translateY(0)}100%{translateY(-5px)} }
    #bmOv button:hover { transform:scale(1.05) }

    /* counter */
    @keyframes countPop {
      0%{opacity:0;transform:scale(.5)}
      50%{opacity:1;transform:scale(1.2)}
      100%{opacity:0;transform:scale(1)}
    }
  `;
  const styleTag = document.createElement('style');
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);

  //
  // 3) APÓS SPLASH, MONTA UI PRINCIPAL
  //
  setTimeout(() => {
    document.body.removeChild(splash);

    const wrapper = document.createElement('div');
    wrapper.id = 'bmWrapper';
    wrapper.innerHTML = `
      <div id="bmHeader">Paraná Colado V1</div>
      <div id="bmContent"></div>
    `;
    document.body.appendChild(wrapper);
    setTimeout(() => wrapper.classList.add('show'), 100);

    // header arrastável
    const header = document.getElementById('bmHeader');
    header.onmousedown = e => {
      const dx = e.clientX - wrapper.offsetLeft;
      const dy = e.clientY - wrapper.offsetTop;
      document.onmousemove = ev => {
        wrapper.style.left = ev.clientX - dx + 'px';
        wrapper.style.top  = ev.clientY - dy + 'px';
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };

    const content = document.getElementById('bmContent');
    let stealthState = false, stealthSeen = false, rect;

    function sendChar(c) {
      if (!activeEl) return;
      ['keydown','keypress'].forEach(type => {
        activeEl.dispatchEvent(new KeyboardEvent(type, {
          key: c, char: c,
          keyCode: c.charCodeAt(0),
          which:  c.charCodeAt(0),
          bubbles:true
        }));
      });
      if (activeEl.isContentEditable) {
        document.execCommand('insertText', false, c);
      } else if (activeEl.tagName==='TEXTAREA'||activeEl.tagName==='INPUT') {
        const setter = Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(activeEl),'value'
        ).set;
        setter.call(activeEl, activeEl.value + c);
        activeEl.dispatchEvent(new Event('input',{bubbles:true}));
        activeEl.dispatchEvent(new Event('change',{bubbles:true}));
      }
      activeEl.dispatchEvent(new KeyboardEvent('keyup', {
        key: c, char: c,
        keyCode: c.charCodeAt(0),
        which:  c.charCodeAt(0),
        bubbles:true
      }));
    }

    function showOverlay() {
      const ov = document.createElement('div');
      ov.id = 'bmOv';
      ov.innerHTML = `
        <img src="https://i.imgur.com/RquEok4.gif"/>
        <button id="bmOvBtn">Continuar</button>
      `;
      document.body.appendChild(ov);
      document.getElementById('bmOvBtn').onclick = () => {
        document.body.removeChild(ov);
        applyStealth();
      };
    }

    function applyNormal() {
      stealthState = false;
      wrapper.style.background = '#111';
      header.style.background  = 'linear-gradient(90deg,#ff00ff,#00ffff)';
      wrapper.style.color      = '#0ff';
      wrapper.style.pointerEvents = 'auto';
      wrapper.style.opacity       = 1;
      wrapper.querySelectorAll('textarea,input').forEach(el=>{
        el.style.background='#222'; el.style.color='#0ff';
      });
      wrapper.querySelectorAll('button.bmBackBtn, button#bmBtn').forEach(b=>{
        b.style.background='linear-gradient(90deg,#ff00ff,#00ffff)';
        b.style.color='#000';
      });
      document.getElementById('bmToggleText')?.style.setProperty('color','#0ff');
      wrapper.removeEventListener('mouseleave', hideUI);
      document.removeEventListener('mousemove', showUI);
    }
    function applyStealth() {
      stealthState = true;
      wrapper.style.background = '#fff';
      header.style.background  = '#0f4665';
      wrapper.style.color      = '#000';
      wrapper.querySelectorAll('textarea,input').forEach(el=>{
        el.style.background='#ccc'; el.style.color='#000';
      });
      wrapper.querySelectorAll('button.bmBackBtn, button#bmBtn').forEach(b=>{
        b.style.background='#0f4665'; b.style.color='#fff';
      });
      document.getElementById('bmToggleText').style.setProperty('color','#000');
      wrapper.addEventListener('mouseleave', hideUI);
      document.addEventListener('mousemove', showUI);
    }
    function hideUI() {
      rect = wrapper.getBoundingClientRect();
      wrapper.style.opacity = 0;
      wrapper.style.pointerEvents = 'none';
    }
    function showUI(ev) {
      if (
        ev.clientX >= rect.left  && ev.clientX <= rect.right &&
        ev.clientY >= rect.top   && ev.clientY <= rect.bottom
      ) {
        wrapper.style.opacity = 1;
        wrapper.style.pointerEvents = 'auto';
      }
    }

    function showMenu() {
      content.classList.remove('content-show');
      content.innerHTML = `
        <div id="bmMenu">
          <button id="bmMenuBtnCorrection">Correção Online</button>
          <button id="bmMenuBtnPaste">Colar Textos</button>
        </div>
      `;
      setTimeout(()=>content.classList.add('content-show'),50);
      document.getElementById('bmMenuBtnCorrection').onclick = showCorrection;
      document.getElementById('bmMenuBtnPaste').onclick      = showPasteUI;
      applyNormal();
    }

    function showCorrection() {
      content.classList.remove('content-show');
      content.innerHTML = `
        <div id="bmCorrection">Em construção...</div>
        <button class="bmBackBtn" id="bmBack1">Voltar</button>
      `;
      setTimeout(()=>content.classList.add('content-show'),50);
      document.getElementById('bmBack1').onclick = () => {
        applyNormal();
        showMenu();
      };
    }

    function showPasteUI() {
      content.classList.remove('content-show');
      content.innerHTML = `
        <textarea id="bmText" placeholder="Digite seu texto"></textarea>
        <input id="bmDelay" type="number" step="0.01" value="0.02">
        <div id="bmToggleWrapper">
          <img id="bmToggleImg"/>
          <span id="bmToggleText">Modo Disfarçado</span>
        </div>
        <button id="bmBtn">Iniciar</button>
        <button class="bmBackBtn" id="bmBack2">Voltar</button>
      `;
      setTimeout(()=>content.classList.add('content-show'),50);

      document.getElementById('bmBack2').onclick = () => {
        applyNormal();
        showMenu();
      };

      const tgl     = document.getElementById('bmToggleImg');
      const tglText = document.getElementById('bmToggleText');
      const imgOff  = 'https://i.imgur.com/a000adcb.png';
      const imgOn   = 'https://i.imgur.com/k41QpMa.png';
      tgl.src = stealthState ? imgOn : imgOff;
      tgl.onclick = () => {
        if (!stealthState && !stealthSeen) {
          stealthSeen = true;
          showOverlay();
        } else {
          stealthState ? applyNormal() : applyStealth();
        }
      };

      document.getElementById('bmBtn').onclick = async function() {
        const text  = document.getElementById('bmText').value;
        const delay = parseFloat(document.getElementById('bmDelay').value) * 1e3;
        if (!text) return alert('Texto vazio!');
        this.disabled = true;

        for (let n = 3; n >= 1; n--) {
          const cnt = document.createElement('div');
          cnt.textContent = n;
          Object.assign(cnt.style, {
            position:   'absolute',
            top:        '50px',
            right:      '20px',
            color:      '#ff00ff',
            fontSize:   '1.5em',
            opacity:    0,
            animation:  'countPop .7s ease-out forwards'
          });
          wrapper.appendChild(cnt);
          await new Promise(r => setTimeout(r,700));
          wrapper.removeChild(cnt);
          await new Promise(r => setTimeout(r,200));
        }

        for (let c of text) {
          sendChar(c);
          await new Promise(r => setTimeout(r, delay));
        }
        this.disabled = false;
      };
    }

    // inicia no menu
    showMenu();

  }, 3500);

})();
