(function() {
  // — Evita duplo carregamento —
  if (document.getElementById('bmSplash')) return;

  // — Guarda último elemento clicado (para o typing) —
  let activeEl = null;
  document.addEventListener('mousedown', e => activeEl = e.target, true);

  // — 1) Splash inicial (igual antes) —
  const splash = document.createElement('div');
  splash.id = 'bmSplash';
  splash.innerHTML = `
    <img id="bmSplashImg" src="https://i.imgur.com/RUWcJ6e.png"/>
    <div id="bmSplashTxt1">Paraná Colado</div>
    <div id="bmSplashTxt2">V1</div>
  `;
  document.body.appendChild(splash);

  // — 2) Injeta todo o CSS da UI no <head> —
  const css = `
    /* ==== SPLASH ==== */
    #bmSplash {
      position:fixed; top:0; left:0;
      width:100%; height:100%;
      background:#000;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      z-index:99999; overflow:hidden;
      animation:fadeOut 1s forwards 3s;
    }
    #bmSplashImg { width:200px;
      animation:popIn .5s forwards, moveUp .5s forwards .8s;
    }
    #bmSplashTxt1, #bmSplashTxt2 {
      font-family:'Segoe UI Black',sans-serif;
      color:#fff; font-size:2em; opacity:0;
    }
    #bmSplashTxt1 { animation:txt1Pop .5s forwards 1.3s; }
    #bmSplashTxt2 { animation:txt2Pop .5s forwards 1.8s; }
    @keyframes popIn { 0%{transform:scale(0)}100%{transform:scale(1)} }
    @keyframes moveUp { 0%{transform:translateY(0)}100%{transform:translateY(-30px)} }
    @keyframes txt1Pop { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
    @keyframes txt2Pop { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
    @keyframes fadeOut { to{opacity:0} }

    /* ==== PAINEL PRINCIPAL ==== */
    #bmWrapper {
      --bg: rgba(20,20,20,0.85);
      position:fixed; top:20px; right:20px;
      width:280px; font-family:'Segoe UI Black',sans-serif;
      background:var(--bg); color:#fff;
      border-radius:8px; border:1px solid #333;
      box-shadow:0 8px 20px rgba(0,0,0,0.6);
      opacity:0; transform:translateY(-10px) scale(.97);
      transition:opacity .3s ease, transform .3s ease;
      z-index:99998;
    }
    #bmWrapper.show {
      opacity:1; transform:translateY(0) scale(1);
    }

    /* HEADER */
    #bmHeader {
      padding:8px 12px; cursor:move;
      background:transparent; color:#8A2BE2;
      font-size:1em; text-transform:uppercase;
      border-bottom:1px solid #333;
      display:flex; justify-content:space-between;
      align-items:center;
    }
    #bmHeader span { font-size:.9em; color:#aaa; }

    /* CONTEÚDO */
    #bmContent {
      padding:10px 12px;
    }

    /* LISTA DE OPCOES */
    .bmOption {
      display:flex; align-items:center;
      margin-bottom:6px; user-select:none;
    }
    .bmOption input[type=checkbox] {
      width:16px; height:16px; margin:0;
      accent-color:#8A2BE2;
      cursor:pointer;
    }
    .bmOption label {
      margin-left:8px; font-size:.95em;
      color:#ccc; cursor:pointer;
      transition:color .2s;
    }
    .bmOption input:checked + label {
      color:#fff;
    }

    /* TEXTAREA & INPUT TEXT */
    #bmText, #bmDelay, #bmUser, #bmPfp {
      width:100%; padding:8px 6px;
      background:rgba(50,50,50,0.9);
      border:1px solid #444; border-radius:4px;
      color:#eee; font-size:.95em;
      margin-bottom:8px;
      transition:box-shadow .2s, background .2s;
    }
    #bmText:focus, #bmDelay:focus,
    #bmUser:focus, #bmPfp:focus {
      box-shadow:0 0 6px #8A2BE2;
      background:rgba(60,60,60,0.9);
      outline:none;
    }

    /* BOTAO INICIAR */
    #bmBtn {
      width:100%; padding:8px 0;
      background:#8A2BE2; color:#fff;
      border:none; border-radius:4px;
      font-size:1em; cursor:pointer;
      transition:transform .2s, box-shadow .2s;
    }
    #bmBtn:hover {
      transform:scale(1.03);
      box-shadow:0 4px 12px rgba(138,43,226,0.5);
    }
    #bmBtn:active {
      transform:scale(.97);
    }

    /* CONTADOR */
    #bmCount {
      position:absolute; top:8px; right:12px;
      font-size:1.2em; color:#8A2BE2;
      pointer-events:none;
      opacity:0; transform:scale(.5);
      transition:opacity .2s, transform .2s;
    }
    .count-show {
      opacity:1 !important;
      transform:scale(1.2) !important;
    }

    /* STEALTH OVERLAY */
    #bmOv {
      position:fixed; top:0; left:0;
      width:100%; height:100%;
      background:rgba(0,0,0,0.9);
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      z-index:100000;
      opacity:0; animation:ovFadeIn .4s forwards;
    }
    @keyframes ovFadeIn { from{opacity:0}to{opacity:1} }
    #bmOv img {
      width:200px; margin-bottom:20px;
      animation:popBounce .6s forwards;
    }
    @keyframes popBounce {
      0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}
    }
    #bmOv button {
      padding:10px 20px; background:#8A2BE2;
      color:#fff; border:none; border-radius:4px;
      font-size:1em; cursor:pointer;
      transition:transform .2s;
    }
    #bmOv button:hover { transform:scale(1.05); }
  `;
  const styleTag = document.createElement('style');
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);

  // — 3) Monta a UI principal após o splash —
  setTimeout(() => {
    document.body.removeChild(splash);

    const w = document.createElement('div');
    w.id = 'bmWrapper';
    w.innerHTML = `
      <div id="bmHeader">
        Paraná Colado V1
        <span>v3.1.0</span>
      </div>
      <div id="bmCount"></div>
      <div id="bmContent">
        <div class="bmOption"><input type="checkbox" id="opt1"><label for="opt1">Question Spoof</label></div>
        <div class="bmOption"><input type="checkbox" id="opt2"><label for="opt2">Video Spoof</label></div>
        <div class="bmOption"><input type="checkbox" id="opt3"><label for="opt3">Answer Revealer</label></div>
        <div class="bmOption"><input type="checkbox" id="opt4"><label for="opt4">Auto Answer</label></div>
        <div class="bmOption"><input type="checkbox" id="opt5"><label for="opt5">Minute Farmer</label></div>
        <div class="bmOption"><input type="checkbox" id="opt6"><label for="opt6">Custom Banner</label></div>
        <div class="bmOption"><input type="checkbox" id="opt7"><label for="opt7">RGB Logo</label></div>
        <div class="bmOption"><input type="checkbox" id="opt8"><label for="opt8">Dark Mode</label></div>
        <div class="bmOption"><input type="checkbox" id="opt9"><label for="opt9">onekoJs</label></div>

        <input id="bmUser" placeholder="Custom Username" />
        <input id="bmPfp" placeholder="Custom PFP URL" />

        <textarea id="bmText" placeholder="Digite seu texto..."></textarea>
        <input id="bmDelay" type="number" step="0.01" value="0.02" />

        <button id="bmBtn">Iniciar</button>

        <div style="margin-top:8px; font-size:.8em; color:#888; text-align:center;">
          eusoudeon — UID: 25239
        </div>
      </div>
    `;
    document.body.appendChild(w);
    setTimeout(() => w.classList.add('show'), 100);

    // Arrastar header
    const h = document.getElementById('bmHeader');
    h.onmousedown = e => {
      let dx = e.clientX - w.offsetLeft, dy = e.clientY - w.offsetTop;
      document.onmousemove = ev => {
        w.style.left = ev.clientX - dx + 'px';
        w.style.top  = ev.clientY - dy + 'px';
      };
      document.onmouseup = () => (document.onmousemove = document.onmouseup = null);
    };

    // Contador 3‑2‑1
    const cntEl = document.getElementById('bmCount');
    function showCount(n) {
      cntEl.textContent = n;
      cntEl.classList.add('count-show');
      setTimeout(() => cntEl.classList.remove('count-show'), 500);
    }

    // Função de envio de caractere (igual antes) …
    function sendChar(c) {
      if (!activeEl) return;
      ['keydown','keypress'].forEach(t =>
        activeEl.dispatchEvent(new KeyboardEvent(t, {
          key:c, char:c, keyCode:c.charCodeAt(0), which:c.charCodeAt(0), bubbles:true
        }))
      );
      if (activeEl.isContentEditable) {
        document.execCommand('insertText', false, c);
      } else if (['TEXTAREA','INPUT'].includes(activeEl.tagName)) {
        const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(activeEl),'value').set;
        set.call(activeEl, activeEl.value + c);
        activeEl.dispatchEvent(new Event('input',{bubbles:true}));
      }
      activeEl.dispatchEvent(new KeyboardEvent('keyup', {
        key:c, char:c, keyCode:c.charCodeAt(0), which:c.charCodeAt(0), bubbles:true
      }));
    }

    // Botão Iniciar
    document.getElementById('bmBtn').onclick = async function() {
      const txt   = document.getElementById('bmText').value;
      const delay = parseFloat(document.getElementById('bmDelay').value)*1000;
      if (!txt) return alert('Texto vazio!');
      this.disabled = true;
      for (let i=3; i>=1; i--) {
        showCount(i);
        await new Promise(r => setTimeout(r, 700));
      }
      for (let ch of txt) {
        sendChar(ch);
        await new Promise(r => setTimeout(r, delay));
      }
      this.disabled = false;
    };

  }, 3500);
})();
