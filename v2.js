(function() {
  // evita duplo carregamento
  if (document.getElementById('bmSplash')) return;

  // guarda último elemento clicado (pra colar texto)
  let activeEl = null;
  document.addEventListener('mousedown', e => activeEl = e.target, true);

  // estado do Modo Disfarçado
  let stealthState = false;
  let stealthSeen  = false;
  let rect;

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
      position:fixed; top:0; left:0; width:100%; height:100%;
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
    #bmSplashTxt1 { animation:txt1Pop .5s forwards 1.3s }
    #bmSplashTxt2 { animation:txt2Pop .5s forwards 1.8s }

    @keyframes popIn    { from{transform:scale(0)} to{transform:scale(1)} }
    @keyframes moveUp   { from{transform:translateY(0)} to{transform:translateY(-30px)} }
    @keyframes txt1Pop  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes txt2Pop  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeOut  { to{opacity:0} }

    /* --- Wrapper geral --- */
    #bmWrapper {
      position:fixed; top:20px; right:20px; width:320px;
      background:#111; color:#fff; border-radius:12px;
      box-shadow:0 6px 15px rgba(0,0,0,.6);
      font-family:'Segoe UI Black',sans-serif;
      opacity:0; transform:translateY(-20px) scale(.95);
      transition:opacity .4s, transform .4s; z-index:99998;
    }
    #bmWrapper.show {
      opacity:1; transform:translateY(0) scale(1);
    }
    #bmHeader {
      cursor:move; padding:10px; background:#8A2BE2;
      text-align:center; border-radius:12px 12px 0 0;
      font-weight:700; color:#fff;
    }

    /* --- Conteúdo dinâmico --- */
    #contentHolder {
      padding:12px; position:relative;
    }
    /* botões de menu */
    .menu-button {
      width:100%; padding:10px; margin-bottom:10px;
      border:none; border-radius:6px;
      background:#8A2BE2; color:#fff;
      font-family:'Segoe UI Black',sans-serif;
      cursor:pointer; transition:transform .2s;
    }
    .menu-button:hover { transform:scale(1.05) }
    .menu-button:active{ transform:scale(.95) }

    /* fade para troca de conteúdo */
    #contentHolder { transition:opacity .4s ease }
  `;
  const styleTag = document.createElement('style');
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);

  //
  // 3) Após splash, monta wrapper e menu inicial
  //
  setTimeout(() => {
    document.body.removeChild(splash);

    // cria wrapper
    const wrapper = document.createElement('div');
    wrapper.id = 'bmWrapper';
    wrapper.innerHTML = `
      <div id="bmHeader">Paraná Colado V1</div>
      <div id="contentHolder"></div>
    `;
    document.body.appendChild(wrapper);
    setTimeout(() => wrapper.classList.add('show'), 100);

    // header arrastável
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

    // funções para stealth (idem versão anterior)
    function applyNormal() {
      wrapper.style.background = '#111';
      header.style.background  = '#8A2BE2';
      wrapper.style.color      = '#fff';
    }
    function applyStealth() {
      wrapper.style.background = '#fff';
      header.style.background  = '#0f4665';
      wrapper.style.color      = '#000';
    }

    // trocar view com fade
    const content = document.getElementById('contentHolder');
    function fadeTo(newHTML, callback) {
      content.style.opacity = 0;
      setTimeout(() => {
        content.innerHTML = newHTML;
        callback && callback();
        content.style.opacity = 1;
      }, 400);
    }

    //
    // 4) VIEWS
    //

    // menu inicial
    function renderMenu() {
      const html = `
        <button id="menuOnlineBtn" class="menu-button">Correção Online</button>
        <button id="menuPasteBtn"  class="menu-button">Colar Textos</button>
      `;
      fadeTo(html, () => {
        document.getElementById('menuOnlineBtn').onclick = () => renderOnline();
        document.getElementById('menuPasteBtn').onclick  = () => renderPaste();
      });
    }

    // view Correção Online (vazia + voltar)
    function renderOnline() {
      const html = `
        <div style="min-height:100px;display:flex;align-items:center;justify-content:center;color:${stealthState?'#000':'#fff'}">
          Em desenvolvimento...
        </div>
        <button id="onlineBackBtn" class="menu-button">Voltar</button>
      `;
      fadeTo(html, () => {
        document.getElementById('onlineBackBtn').onclick = () => renderMenu();
      });
    }

    // view Colar Textos (interface antiga + voltar)
    function renderPaste() {
      const html = `
        <textarea id="bmText" placeholder="Digite seu texto" style="width:100%;height:60px;margin-bottom:10px;border-radius:6px;border:none;padding:8px;font-family:sans-serif;"></textarea>
        <input id="bmDelay" type="number" step="0.01" value="0.02" style="width:60px;margin-bottom:10px;">
        <div style="margin-bottom:10px;display:flex;align-items:center;gap:8px;">
          <img id="bmToggleImg" src="${stealthState?'https://i.imgur.com/k41QpMa.png':'https://i.imgur.com/a000adcb.png'}" 
               style="width:24px;height:24px;cursor:pointer;">
          <span id="bmToggleText" style="font-family:'Segoe UI Black',sans-serif;color:${stealthState?'#000':'#fff'}">
            Modo Disfarçado
          </span>
        </div>
        <button id="bmStartBtn" class="menu-button">Iniciar</button>
        <button id="pasteBackBtn" class="menu-button">Voltar</button>
      `;
      fadeTo(html, () => {
        const textEl  = document.getElementById('bmText');
        const delayEl = document.getElementById('bmDelay');
        const togImg  = document.getElementById('bmToggleImg');
        const togTxt  = document.getElementById('bmToggleText');
        const startBtn= document.getElementById('bmStartBtn');
        const backBtn = document.getElementById('pasteBackBtn');

        // stealth toggle
        togImg.onclick = () => {
          stealthState = !stealthState;
          if (!stealthSeen && stealthState) {
            stealthSeen = true;
            // aqui você pode chamar o overlay POP se quiser
          }
          applyNormal();
          if (stealthState) applyStealth();
          togImg.src = stealthState 
            ? 'https://i.imgur.com/k41QpMa.png'
            : 'https://i.imgur.com/a000adcb.png';
          togTxt.style.color = stealthState ? '#000' : '#fff';
        };

        // volta ao menu
        backBtn.onclick = () => renderMenu();

        // função de simular digitação
        async function doPaste() {
          const text = textEl.value;
          const d    = parseFloat(delayEl.value)*1000;
          if (!text) return alert('Texto vazio!');
          startBtn.disabled = true;
          for (let ch of text) {
            // dispara key events
            ['keydown','keypress'].forEach(type => {
              activeEl.dispatchEvent(new KeyboardEvent(type,{
                key: ch, char: ch,
                keyCode: ch.charCodeAt(0), which: ch.charCodeAt(0),
                bubbles:true
              }));
            });
            // seta valor real
            if (activeEl.isContentEditable) {
              document.execCommand('insertText',false,ch);
            } else {
              const setter = Object.getOwnPropertyDescriptor(
                Object.getPrototypeOf(activeEl),'value'
              ).set;
              setter.call(activeEl, activeEl.value + ch);
              activeEl.dispatchEvent(new Event('input',{bubbles:true}));
            }
            activeEl.dispatchEvent(new KeyboardEvent('keyup',{
              key: ch, char: ch,
              keyCode: ch.charCodeAt(0), which: ch.charCodeAt(0),
              bubbles:true
            }));
            await new Promise(r=>setTimeout(r,d));
          }
          startBtn.disabled = false;
        }

        startBtn.onclick = () => doPaste();
      });
    }

    // inicia no menu
    renderMenu();

  }, 3500);
})();
