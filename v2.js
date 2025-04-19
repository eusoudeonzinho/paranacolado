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
  // 2) CSS injetado
  //
  const css = `
    /* splash */
    #bmSplash {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: #000;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 99999; overflow: hidden;
      animation: fadeOut 1s forwards 3s;
    }
    #bmSplashImg {
      width: 200px;
      animation: popIn .5s forwards,
                 moveUp .5s forwards .8s;
    }
    #bmSplashTxt1, #bmSplashTxt2 {
      font-family: 'Segoe UI Black', sans-serif;
      color: #fff; font-size: 2em; opacity: 0;
    }
    #bmSplashTxt1 { animation: txt1Pop .5s forwards 1.3s; }
    #bmSplashTxt2 { animation: txt2Pop .5s forwards 1.8s; }

    @keyframes popIn { from{transform:scale(0)} to{transform:scale(1)} }
    @keyframes moveUp{ from{translateY(0)}  to{translateY(-30px)} }
    @keyframes txt1Pop{from{opacity:0;translateY(20px)}to{opacity:1;translateY(0)}}
    @keyframes txt2Pop{from{opacity:0;translateY(20px)}to{opacity:1;translateY(0)}}
    @keyframes fadeOut{to{opacity:0}}

    /* wrapper */
    #bmWrapper {
      position: fixed; top: 20px; right: 20px;
      width: 340px; background: #111; color: #fff;
      border-radius: 12px; box-shadow: 0 6px 15px rgba(0,0,0,.6);
      font-family: 'Segoe UI Black', sans-serif;
      opacity: 0; transform: translateY(-20px) scale(.95);
      transition: opacity .4s, transform .4s;
      z-index: 99998;
    }
    #bmWrapper.show {
      opacity: 1; transform: translateY(0) scale(1);
    }
    /* header genérico */
    #bmHeader {
      cursor: move; padding: 10px;
      background: #8A2BE2; text-align: center;
      border-radius: 12px 12px 0 0;
      font-weight: 700; color: #fff;
    }
    /* container de conteúdo */
    #bmContent {
      padding: 12px; position: relative;
    }
    /* botões de menu */
    .bm-menu-btn {
      width: 100%; padding: 12px;
      margin: 8px 0; border: none;
      border-radius: 6px; font-size: 1.1em;
      background: #8A2BE2; color: #fff;
      cursor: pointer; transition: transform .2s;
    }
    .bm-menu-btn:hover {
      transform: scale(1.05);
    }
    /* botão voltar */
    #bmBackBtn {
      position: absolute; top: 12px; left: 12px;
      padding: 6px 12px; font-size: .9em;
      background: #555; color: #fff;
      border: none; border-radius: 4px;
      cursor: pointer; transition: background .2s;
    }
    #bmBackBtn:hover {
      background: #666;
    }
    /* ------- Colar Textos (interface original) ------- */
    #bmContent textarea,
    #bmContent input,
    #bmContent button {
      width: 100%; margin-bottom: 10px;
      border-radius: 6px; border: none;
      padding: 10px; font-size: 1em;
      background: #222; color: #fff;
      transition: box-shadow .3s, background .3s;
    }
    #bmContent textarea:focus,
    #bmContent input:focus {
      box-shadow: 0 0 8px #8A2BE2; outline: none;
    }
    #bmContent button {
      background: #8A2BE2; cursor: pointer;
      transition: transform .2s, box-shadow .2s;
    }
    #bmContent button:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 10px rgba(138,43,226,.5);
    }
    #bmContent button:active {
      transform: scale(.95);
      box-shadow: 0 2px 5px rgba(138,43,226,.5);
    }
    /* stealth toggle */
    #bmToggleWrapper {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 10px;
    }
    #bmToggleImg {
      width: 24px; height: 24px;
      cursor: pointer; transition: transform .2s;
    }
    #bmToggleText {
      font-family: 'Segoe UI Black', sans-serif;
      user-select: none;
    }
    /* contador */
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
  // 3) monta UI após splash
  //
  setTimeout(() => {
    document.body.removeChild(splash);

    // cria wrapper e header
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
      let dx = e.clientX - wrapper.offsetLeft;
      let dy = e.clientY - wrapper.offsetTop;
      document.onmousemove = ev => {
        wrapper.style.left = ev.clientX - dx + 'px';
        wrapper.style.top  = ev.clientY - dy + 'px';
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };

    // referência ao content
    const content = document.getElementById('bmContent');

    // monta Menu inicial
    function showMenu() {
      content.innerHTML = `
        <button id="bmBtnOnline" class="bm-menu-btn">Correção Online</button>
        <button id="bmBtnColar"  class="bm-menu-btn">Colar Textos</button>
      `;
      document.getElementById('bmBtnOnline')
        .onclick = () => showScreen('online');
      document.getElementById('bmBtnColar')
        .onclick = () => showScreen('colar');
    }

    // monta tela de Correção Online (vazia + Voltar)
    function showOnline() {
      content.innerHTML = `
        <button id="bmBackBtn">Voltar</button>
        <div style="padding-top:40px; text-align:center; color:#fff;">
          <em>Tela de Correção Online (em desenvolvimento)</em>
        </div>
      `;
      document.getElementById('bmBackBtn')
        .onclick = showMenu;
    }

    // monta tela de Colar Textos (interface original + Voltar)
    function showColar() {
      content.innerHTML = `
        <button id="bmBackBtn">Voltar</button>
        <textarea id="bmText" placeholder="Digite seu texto"></textarea>
        <input id="bmDelay" type="number" step="0.01" value="0.02">
        <div id="bmToggleWrapper">
          <img id="bmToggleImg"/>
          <span id="bmToggleText">Modo Disfarçado</span>
        </div>
        <button id="bmBtnStart">Iniciar</button>
      `;
      // inicializa lógica de stealth e de enviar texto
      initStealthAndSender();
      document.getElementById('bmBackBtn')
        .onclick = showMenu;
    }

    // roteador de telas
    function showScreen(name) {
      if (name === 'online') showOnline();
      else if (name === 'colar') showColar();
    }

    // configura toggle stealth + botão Iniciar
    function initStealthAndSender() {
      const wrapperEl = wrapper;
      const headerEl  = header;
      const tglImg     = document.getElementById('bmToggleImg');
      const tglText    = document.getElementById('bmToggleText');
      let stealthState = false, stealthSeen = false, rect;
      const imgOff     = 'https://i.imgur.com/a000adcb.png';
      const imgOn      = 'https://i.imgur.com/k41QpMa.png';
      tglImg.src = imgOff;

      // aplica normal / stealth
      function applyNormal() {
        wrapperEl.style.background = '#111';
        headerEl.style.background  = '#8A2BE2';
        wrapperEl.style.color      = '#fff';
        wrapperEl.querySelectorAll('textarea,input,button')
          .forEach(el=>{el.style.background='#222';el.style.color='#fff'});
        tglText.style.color = '#fff';
        wrapperEl.removeEventListener('mouseleave', hideUI);
        document.removeEventListener('mousemove', showUI);
        wrapperEl.style.pointerEvents = 'auto';
        wrapperEl.style.opacity       = 1;
      }
      function applyStealth() {
        wrapperEl.style.background = '#fff';
        headerEl.style.background  = '#0f4665';
        wrapperEl.style.color      = '#000';
        wrapperEl.querySelectorAll('textarea,input,button')
          .forEach(el=>{el.style.background='#ccc';el.style.color='#000'});
        tglText.style.color = '#000';
        wrapperEl.addEventListener('mouseleave', hideUI);
        document.addEventListener('mousemove', showUI);
      }
      function hideUI() {
        rect = wrapperEl.getBoundingClientRect();
        wrapperEl.style.opacity       = 0;
        wrapperEl.style.pointerEvents = 'none';
      }
      function showUI(ev) {
        if (
          ev.clientX >= rect.left && ev.clientX <= rect.right &&
          ev.clientY >= rect.top  && ev.clientY <= rect.bottom
        ) {
          wrapperEl.style.opacity       = 1;
          wrapperEl.style.pointerEvents = 'auto';
        }
      }
      tglImg.onclick = () => {
        stealthState = !stealthState;
        tglImg.src   = stealthState ? imgOn : imgOff;
        if (stealthState) {
          if (!stealthSeen) {
            stealthSeen = true;
            // mesma tela de overlay do stealth first-time
            const ov = document.createElement('div');
            ov.id = 'bmOv';
            ov.innerHTML = `
              <img src="https://i.imgur.com/RquEok4.gif"/>
              <button id="bmOvBtn">Continuar</button>
            `;
            document.body.appendChild(ov);
            document.getElementById('bmOvBtn')
              .onclick = () => {
                document.body.removeChild(ov);
                applyStealth();
              };
          } else applyStealth();
        } else applyNormal();
      };

      // envia um caractere para o elemento ativo
      function sendChar(c) {
        if (!activeEl) return;
        ['keydown','keypress'].forEach(type => {
          activeEl.dispatchEvent(new KeyboardEvent(type, {
            key: c, char: c,
            keyCode: c.charCodeAt(0),
            which:  c.charCodeAt(0),
            bubbles: true
          }));
        });
        if (activeEl.isContentEditable) {
          document.execCommand('insertText', false, c);
        } else if (
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'INPUT'
        ) {
          const setter = Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(activeEl), 'value'
          ).set;
          setter.call(activeEl, activeEl.value + c);
          activeEl.dispatchEvent(new Event('input', { bubbles:true }));
          activeEl.dispatchEvent(new Event('change',{ bubbles:true }));
        }
        activeEl.dispatchEvent(new KeyboardEvent('keyup', {
          key: c, char: c,
          keyCode: c.charCodeAt(0),
          which:  c.charCodeAt(0),
          bubbles:true
        }));
      }

      // botão Iniciar: contador + digitação
      document.getElementById('bmBtnStart')
        .onclick = async function() {
          const text  = document.getElementById('bmText').value;
          const delay = parseFloat(
            document.getElementById('bmDelay').value
          ) * 1000;
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

          // digita texto
          for (let ch of text) {
            sendChar(ch);
            await new Promise(r => setTimeout(r, delay));
          }
          this.disabled = false;
        };
    }

    // mostra menu logo após splash
    showMenu();

  }, 3500);

})();
