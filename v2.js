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
    // 2) CSS injetado (estilo KW-like)
    //
    const css = `
      /* === SPLASH === */
      #bmSplash {
        position: fixed; top:0; left:0;
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
        font-family:'Segoe UI Black',sans-serif;
        color:#fff; font-size:2em; opacity:0;
      }
      #bmSplashTxt1 { animation:txt1Pop .5s forwards 1.3s }
      #bmSplashTxt2 { animation:txt2Pop .5s forwards 1.8s }
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
        box-shadow:0 4px 10px rgba(0,0,0,.5);
        font-family:'Segoe UI Black',sans-serif;
        color:#fff;
        opacity:0;
        transform:translateY(-20px) scale(.95);
        transition:opacity .3s,transform .3s;
        z-index:99998;
      }
      #bmWrapper.show {
        opacity:1; transform:translateY(0) scale(1);
      }
  
      /* header */
      #bmHeader {
        cursor:move;
        padding:8px 12px;
        background:#111;
        border-bottom:1px solid #333;
        font-size:0.9em;
        text-align:center;
        border-radius:6px 6px 0 0;
      }
  
      /* conteúdo */
      #bmContent {
        padding:12px;
        background:#1b1b1b;
      }
      #bmContent textarea,
      #bmContent input {
        width:100%;
        margin-bottom:10px;
        padding:8px;
        font-size:0.95em;
        background:#2a2a2a;
        border:1px solid #333;
        border-radius:4px;
        color:#fff;
        box-sizing:border-box;
      }
      #bmContent textarea:focus,
      #bmContent input:focus {
        outline:none;
        border-color:#8A2BE2;
        box-shadow:0 0 6px rgba(138,43,226,.5);
      }
      #bmContent button {
        width:100%;
        padding:8px;
        font-size:0.95em;
        background:transparent;
        border:1px solid #8A2BE2;
        border-radius:4px;
        color:#8A2BE2;
        cursor:pointer;
        transition:background .2s, color .2s, transform .2s;
      }
      #bmContent button:hover {
        background:#8A2BE2;
        color:#111;
        transform:scale(1.03);
      }
      #bmContent button:active {
        transform:scale(.97);
      }
  
      /* toggle “Modo Disfarçado” */
      #bmToggleWrapper {
        display:flex;
        align-items:center;
        gap:8px;
        margin-bottom:10px;
      }
      #bmToggleImg {
        width:14px; height:14px;
        border:1px solid #8A2BE2;
        border-radius:2px;
        background:transparent;
        cursor:pointer;
        transition:background .2s;
      }
      #bmToggleText {
        font-size:0.9em;
        color:#fff;
        user-select:none;
      }
      /* contador 3-2-1 */
      @keyframes countPop {
        0%   { opacity:0; transform:scale(0.5) }
        50%  { opacity:1; transform:scale(1.2) }
        100% { opacity:0; transform:scale(1) }
      }
      /* overlay stealth */
      #bmOv {
        position:fixed;top:0;left:0;
        width:100%;height:100%;
        background:rgba(0,0,0,.9);
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        z-index:100000;
        animation:ovFadeIn .4s forwards;
      }
      #bmOv img {
        max-width:70%;max-height:50%;
        animation:popIn .5s forwards;
      }
      #bmOv button {
        margin-top:20px;
        padding:8px 16px;
        background:#3B6991;
        color:#fff;
        border:none;border-radius:4px;
        font-size:0.95em;
        cursor:pointer;
        transition:transform .2s,background .2s;
      }
      #bmOv button:hover {
        background:#2e516e;
        transform:scale(1.05);
      }
      @keyframes ovFadeIn { from{opacity:0} to{opacity:1} }
    `;
    const styleTag = document.createElement('style');
    styleTag.innerHTML = css;
    document.head.appendChild(styleTag);
  
    //
    // 3) após splash, monta UI principal
    //
    setTimeout(() => {
      document.body.removeChild(splash);
  
      const wrapper = document.createElement('div');
      wrapper.id = 'bmWrapper';
      wrapper.innerHTML = `
        <div id="bmHeader">Paraná Colado V1</div>
        <div id="bmContent">
          <textarea id="bmText" placeholder="Digite seu texto"></textarea>
          <input    id="bmDelay" type="number" step="0.01" value="0.02" placeholder="Delay em s">
          <div id="bmToggleWrapper">
            <div id="bmToggleImg"></div>
            <span id="bmToggleText">Modo Disfarçado</span>
          </div>
          <button id="bmBtn">Iniciar</button>
        </div>
      `;
      document.body.appendChild(wrapper);
      setTimeout(() => wrapper.classList.add('show'), 100);
  
      // arrastar
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
          document.onmouseup   = null;
        };
      };
  
      //
      // 4) lógica “Modo Disfarçado”
      //
      const toggleBox  = document.getElementById('bmToggleImg');
      const toggleText = document.getElementById('bmToggleText');
      let stealthOn  = false;
      let firstTime  = false;
      const imgOnBg   = '#8A2BE2';
      const imgOffBg  = 'transparent';
  
      function enterStealth() {
        wrapper.style.background = '#fff';
        header.style.background  = '#0f4665';
        header.style.color       = '#fff';
        wrapper.style.color      = '#000';
        wrapper.querySelectorAll('textarea,input').forEach(i => {
          i.style.background = '#eee';
          i.style.color      = '#000';
          i.style.border     = '1px solid #ccc';
        });
        wrapper.querySelectorAll('button').forEach(b => {
          b.style.background = '#0f4665';
          b.style.color      = '#fff';
        });
        toggleText.style.color = '#000';
        wrapper.addEventListener('mouseleave', hideUI);
        document.addEventListener('mousemove', showUI);
      }
  
      function exitStealth() {
        wrapper.style.background = '#1e1e1e';
        header.style.background  = '#111';
        header.style.color       = '#fff';
        wrapper.style.color      = '#fff';
        wrapper.querySelectorAll('textarea,input').forEach(i => {
          i.style.background = '#2a2a2a';
          i.style.color      = '#fff';
          i.style.border     = '1px solid #333';
        });
        wrapper.querySelectorAll('button').forEach(b => {
          b.style.background = 'transparent';
          b.style.color      = '#8A2BE2';
        });
        toggleText.style.color = '#fff';
        wrapper.removeEventListener('mouseleave', hideUI);
        document.removeEventListener('mousemove', showUI);
        wrapper.style.opacity       = 1;
        wrapper.style.pointerEvents = 'auto';
      }
  
      function hideUI() {
        rect = wrapper.getBoundingClientRect();
        wrapper.style.opacity       = 0;
        wrapper.style.pointerEvents = 'none';
      }
      function showUI(ev) {
        if (
          ev.clientX >= rect.left && ev.clientX <= rect.right &&
          ev.clientY >= rect.top  && ev.clientY <= rect.bottom
        ) {
          wrapper.style.opacity       = 1;
          wrapper.style.pointerEvents = 'auto';
        }
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
          enterStealth();
        };
      }
  
      toggleBox.onclick = () => {
        stealthOn = !stealthOn;
        toggleBox.style.background = stealthOn ? imgOnBg : imgOffBg;
        if (stealthOn) {
          if (!firstTime) {
            firstTime = true;
            showOverlay();
          } else {
            enterStealth();
          }
        } else {
          exitStealth();
        }
      };
  
      exitStealth();
  
      //
      // 5) digitar caracteres
      //
      function sendChar(c) {
        if (!activeEl) return;
        ['keydown','keypress'].forEach(t =>
          activeEl.dispatchEvent(new KeyboardEvent(t,{
            key:c, char:c,
            keyCode:c.charCodeAt(0),
            which:c.charCodeAt(0),
            bubbles:true
          }))
        );
        if (activeEl.isContentEditable) {
          document.execCommand('insertText',false,c);
        } else if (/INPUT|TEXTAREA/.test(activeEl.tagName)) {
          const setter = Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(activeEl),'value'
          ).set;
          setter.call(activeEl,activeEl.value + c);
          activeEl.dispatchEvent(new Event('input',{bubbles:true}));
          activeEl.dispatchEvent(new Event('change',{bubbles:true}));
        }
        activeEl.dispatchEvent(new KeyboardEvent('keyup',{
          key:c, char:c,
          keyCode:c.charCodeAt(0),
          which:c.charCodeAt(0),
          bubbles:true
        }));
      }
  
      //
      // 6) botão Iniciar + contador 3‑2‑1
      //
      document.getElementById('bmBtn').onclick = async function() {
        const text = document.getElementById('bmText').value;
        const delay = parseFloat(document.getElementById('bmDelay').value) * 1000;
        if (!text) return alert('Texto vazio!');
        this.disabled = true;
  
        // contador estilizado
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
          wrapper.appendChild(cnt);
          await new Promise(r => setTimeout(r,700));
          wrapper.removeChild(cnt);
          await new Promise(r => setTimeout(r,200));
        }
  
        // digita
        for (let c of text) {
          sendChar(c);
          await new Promise(r => setTimeout(r, delay));
        }
  
        this.disabled = false;
      };
    }, 3500);
  
  })();
  
