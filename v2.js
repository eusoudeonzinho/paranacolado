;(function() {
  // evita múltiplas instâncias
  if (document.getElementById('bmSplash')) return;

  // último elemento clicado
  let activeEl = null;
  document.addEventListener('mousedown', e => activeEl = e.target, true);

  // --- 1) SPLASH ---
  const splash = document.createElement('div');
  splash.id = 'bmSplash';
  splash.innerHTML = `
    <img id="bmSplashImg" src="https://i.imgur.com/RUWcJ6e.png"/>
    <div id="bmSplashTxt1">Paraná Colado</div>
    <div id="bmSplashTxt2">V2</div>
  `;
  document.body.appendChild(splash);

  // --- 2) CSS GERAL INJETADO ---
  const css = `
    /* SPLASH */
    #bmSplash {
      position: fixed; top:0; left:0;
      width:100%; height:100%;
      background:#000; display:flex;
      flex-direction:column; align-items:center;
      justify-content:center; z-index:99999;
      overflow:hidden; animation:fadeOut 1s 3s forwards;
    }
    #bmSplashImg {
      width:200px;
      animation:popIn .5s forwards, moveUp .5s .8s forwards;
    }
    #bmSplashTxt1,#bmSplashTxt2 {
      font-family:'Segoe UI Black',sans-serif;
      color:#fff; font-size:2em; opacity:0;
    }
    #bmSplashTxt1 { animation:txt1Pop .5s 1.3s forwards; }
    #bmSplashTxt2 { animation:txt2Pop .5s 1.8s forwards; }
    @keyframes popIn     { from{transform:scale(0)} to{scale:1} }
    @keyframes moveUp    { from{translateY(0)}     to{translateY(-30px)} }
    @keyframes txt1Pop   { from{opacity:0;translateY(20px)} to{opacity:1;translateY(0)} }
    @keyframes txt2Pop   { from{opacity:0;translateY(20px)} to{opacity:1;translateY(0)} }
    @keyframes fadeOut   { to{opacity:0} }

    /* WRAPPER, MENU, CORREÇÃO E COLAR */
    .bmCommon {
      position: fixed; top:20px; right:20px;
      width:320px; background:#111; color:#fff;
      border-radius:12px; box-shadow:0 6px 15px rgba(0,0,0,.6);
      font-family:'Segoe UI Black',sans-serif;
      opacity:0; transform:translateY(-20px) scale(.95);
      transition:opacity .4s, transform .4s;
      z-index:99998;
    }
    .bmCommon.show {
      opacity:1; transform:translateY(0) scale(1);
    }
    .bmHeader {
      cursor: move; padding:10px;
      background:#8A2BE2; text-align:center;
      border-radius:12px 12px 0 0; font-weight:700;
      color:#fff;
    }
    .bmContent {
      padding:12px;
    }
    .bmContent button,
    .bmContent textarea,
    .bmContent input {
      width:100%; margin-bottom:10px;
      border:none; border-radius:6px;
      padding:10px; font-size:1em;
      background:#222; color:#fff;
      transition:box-shadow .3s,transform .2s;
    }
    .bmContent textarea:focus,
    .bmContent input:focus {
      box-shadow:0 0 8px #8A2BE2; outline:none;
    }
    .bmContent button {
      background:#8A2BE2; cursor:pointer;
    }
    .bmContent button:hover {
      transform:scale(1.05);
      box-shadow:0 4px 10px rgba(138,43,226,.5);
    }
    .bmContent button:active {
      transform:scale(.95);
      box-shadow:0 2px 5px rgba(138,43,226,.5);
    }
    #bmMenu .bmContent button {
      background:#0f4665; color:#fff;
    }
    #bmMenu .bmContent button:hover {
      background:#143a50;
    }

    /* MENU principal */
    #bmMenu .bmContent {
      display:flex; flex-direction:column;
      align-items:center;
    }
    #bmMenu .bmContent button {
      width:80%; font-size:1.1em;
      margin:8px 0;
    }

    /* VOLTAR comum */
    .bmBack {
      background:#555; color:#fff;
    }

    /* contagem 3-2-1 */
    @keyframes countPop {
      0%{opacity:0;transform:scale(.5)}
      50%{opacity:1;transform:scale(1.2)}
      100%{opacity:0;transform:scale(1)}
    }

    /* OVERLAY stealth inicial */
    #bmOv {
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,.9); display:flex;
      flex-direction:column; align-items:center;
      justify-content:center; z-index:100000;
      animation:fadeIn .5s forwards;
    }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    #bmOv img {
      max-width:80%; max-height:60%;
      animation:popBounce .6s forwards;
    }
    @keyframes popBounce {
      0%{transform:scale(0)}60%{scale(1.2)}100%{scale(1)}
    }
    #bmOv button {
      margin-top:20px; padding:12px 24px;
      background:#008CBA; color:#fff;
      border:none; border-radius:6px;
      font-size:1.1em; cursor:pointer;
      animation:btnShake 1s ease-in-out infinite alternate;
      transition:transform .2s;
    }
    @keyframes btnShake { from{translateY(0)} to{translateY(-5px)} }
    #bmOv button:hover { transform:scale(1.05) }
  `;
  const styleTag = document.createElement('style');
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);

  // espera o splash sumir, depois inicia menu
  setTimeout(() => {
    document.body.removeChild(splash);
    showMenu();
  }, 3500);

  // --- FUNÇÕES DE TROCA DE TELA ---
  let currentWrapper, rect;

  function makeDraggable(header, wrapper) {
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
  }

  function clearCurrent() {
    if (currentWrapper) {
      document.body.removeChild(currentWrapper);
      currentWrapper = null;
    }
  }

  function showMenu() {
    clearCurrent();
    const w = document.createElement('div');
    w.id = 'bmMenu';
    w.classList.add('bmCommon');
    w.innerHTML = `
      <div class="bmHeader">Paraná Colado V1</div>
      <div class="bmContent">
        <button id="btnCorrecao">Correção Online</button>
        <button id="btnColar">Colar Textos</button>
      </div>
    `;
    document.body.appendChild(w);
    requestAnimationFrame(() => w.classList.add('show'));
    makeDraggable(w.querySelector('.bmHeader'), w);

    w.querySelector('#btnCorrecao').onclick = () => showCorrecao();
    w.querySelector('#btnColar').onclick   = () => showColar();
    currentWrapper = w;
  }

  function showCorrecao() {
    clearCurrent();
    const w = document.createElement('div');
    w.id = 'bmCorrecao';
    w.classList.add('bmCommon');
    w.innerHTML = `
      <div class="bmHeader">Correção Online</div>
      <div class="bmContent">
        <!-- conteúdo futuro aqui -->
        <button id="btnBack1" class="bmBack">Voltar</button>
      </div>
    `;
    document.body.appendChild(w);
    requestAnimationFrame(() => w.classList.add('show'));
    makeDraggable(w.querySelector('.bmHeader'), w);
    w.querySelector('#btnBack1').onclick = showMenu;
    currentWrapper = w;
  }

  function showColar() {
    clearCurrent();
    // reutiliza o código antigo de Colar Textos:
    const w = document.createElement('div');
    w.id = 'bmWrapper';
    w.classList.add('bmCommon');
    w.innerHTML = `
      <div class="bmHeader">Colar Textos</div>
      <div id="bmCount"></div>
      <div class="bmContent">
        <textarea id="bmText" placeholder="Digite seu texto"></textarea>
        <input id="bmDelay" type="number" step="0.01" value="0.02">
        <div id="bmToggleWrapper">
          <img id="bmToggleImg">
          <span id="bmToggleText">Modo Disfarçado</span>
        </div>
        <button id="bmBtn">Iniciar</button>
        <button id="btnBack2" class="bmBack">Voltar</button>
      </div>
    `;
    document.body.appendChild(w);
    requestAnimationFrame(() => w.classList.add('show'));
    makeDraggable(w.querySelector('.bmHeader'), w);
    initColarLogic(w);
    w.querySelector('#btnBack2').onclick = showMenu;
    currentWrapper = w;
  }

  // --- LÓGICA COMPLETA DE “Colar Textos” ---
  function initColarLogic(wrapper) {
    let rectOv, stealthSeen = false, stealthState = false;
    const header      = wrapper.querySelector('.bmHeader');
    const btn         = wrapper.querySelector('#bmBtn');
    const txtIn       = wrapper.querySelector('#bmText');
    const delayIn     = wrapper.querySelector('#bmDelay');
    const toggleImg   = wrapper.querySelector('#bmToggleImg');
    const toggleText  = wrapper.querySelector('#bmToggleText');
    const imgOff      = 'https://i.imgur.com/a000adcb.png';
    const imgOn       = 'https://i.imgur.com/k41QpMa.png';

    // funções de modo normal / stealth
    function applyNormal() {
      wrapper.style.background = '#111';
      header.style.background  = '#8A2BE2';
      toggleText.style.color   = '#fff';
      wrapper.querySelectorAll('textarea,input').forEach(el => {
        el.style.background = '#222';
        el.style.color      = '#fff';
      });
      wrapper.querySelectorAll('.bmContent button').forEach(b => {
        b.style.background = '#8A2BE2';
        b.style.color      = '#fff';
      });
      wrapper.style.opacity       = 1;
      wrapper.style.pointerEvents = 'auto';
      wrapper.removeEventListener('mouseleave', hideUI);
      document.removeEventListener('mousemove', showUI);
    }
    function applyStealth() {
      wrapper.style.background = '#fff';
      header.style.background  = '#0f4665';
      toggleText.style.color   = '#000';
      wrapper.querySelectorAll('textarea,input').forEach(el => {
        el.style.background = '#ccc';
        el.style.color      = '#000';
      });
      wrapper.querySelectorAll('.bmContent button').forEach(b => {
        b.style.background = '#0f4665';
        b.style.color      = '#fff';
      });
      wrapper.addEventListener('mouseleave', hideUI);
      document.addEventListener('mousemove', showUI);
    }
    function hideUI() {
      rectOv = wrapper.getBoundingClientRect();
      wrapper.style.opacity       = 0;
      wrapper.style.pointerEvents = 'none';
    }
    function showUI(ev) {
      if (
        ev.clientX >= rectOv.left && ev.clientX <= rectOv.right &&
        ev.clientY >= rectOv.top  && ev.clientY <= rectOv.bottom
      ) {
        wrapper.style.opacity       = 1;
        wrapper.style.pointerEvents = 'auto';
      }
    }

    // splash stealth na primeira vez
    function showOverlay() {
      const ov = document.createElement('div');
      ov.id = 'bmOv';
      ov.innerHTML = `
        <img src="https://i.imgur.com/RquEok4.gif">
        <button id="bmOvBtn">Continuar</button>
      `;
      document.body.appendChild(ov);
      ov.querySelector('button').onclick = () => {
        document.body.removeChild(ov);
        applyStealth();
      };
    }

    // alterna stealth
    toggleImg.src = imgOff;
    toggleImg.onclick = () => {
      stealthState = !stealthState;
      toggleImg.src = stealthState ? imgOn : imgOff;
      if (stealthState) {
        if (!stealthSeen) {
          stealthSeen = true;
          showOverlay();
        } else applyStealth();
      } else applyNormal();
    };
    // pega header arrastável
    makeDraggable(header, wrapper);
    // comece em normal
    applyNormal();

    // envia um caractere
    function sendChar(c) {
      if (!activeEl) return;
      ['keydown','keypress'].forEach(type =>
        activeEl.dispatchEvent(new KeyboardEvent(type, {
          key:c,char:c,keyCode:c.charCodeAt(0),
          which:c.charCodeAt(0),bubbles:true
        }))
      );
      if (activeEl.isContentEditable) {
        document.execCommand('insertText', false, c);
      } else if (/(INPUT|TEXTAREA)/.test(activeEl.tagName)) {
        const setter = Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(activeEl),'value'
        ).set;
        setter.call(activeEl, activeEl.value + c);
        activeEl.dispatchEvent(new Event('input',{bubbles:true}));
        activeEl.dispatchEvent(new Event('change',{bubbles:true}));
      }
      activeEl.dispatchEvent(new KeyboardEvent('keyup',{
        key:c,char:c,keyCode:c.charCodeAt(0),
        which:c.charCodeAt(0),bubbles:true
      }));
    }

    // botão iniciar + contador
    btn.onclick = async function() {
      const text  = txtIn.value;
      const delay = parseFloat(delayIn.value) * 1000;
      if (!text) return alert('Texto vazio!');
      this.disabled = true;

      // contador 3‑2‑1
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
  }

})();
