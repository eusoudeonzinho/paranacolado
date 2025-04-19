(function() {
  if (document.getElementById('bmSplash')) return;
  var activeEl = null;
  document.addEventListener('mousedown', function(e) { activeEl = e.target }, true);

  var s = document.createElement('div');
  s.id = 'bmSplash';
  s.innerHTML = '<div id="bmSplashText1">Feito por:</div><div id="bmSplashText2">Deon!</div>';
  document.body.appendChild(s);

  var css = "#bmSplash{position:fixed;top:0;left:0;width:100%;height:100%;background:#141414;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;animation:bmFadeIn .5s ease-out,bmFadeOut 2s ease-out 2.5s forwards}#bmSplashText1,#bmSplashText2{font-family:'Segoe UI Black',sans-serif;font-size:3em;opacity:0;transform:scale(0.7)}#bmSplashText1{animation:text1In 1s ease-out forwards}#bmSplashText2{animation:text2In 1s ease-out forwards 0.8s}@keyframes bmFadeIn{from{opacity:0}to{opacity:1}}@keyframes bmFadeOut{from{opacity:1}to{opacity:0}}@keyframes text1In{from{transform:translateY(-30px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes text2In{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}";

  var st = document.createElement('style');
  st.innerHTML = css;
  document.head.appendChild(st);

  setTimeout(function() {
    document.body.removeChild(s);
    var w = document.createElement('div');
    w.id = 'bmWrapper';
    w.innerHTML = '<div id="bmHeader">Paraná Colado V1</div><div id="bmCount"></div><div id="bmContent"><textarea id="bmText" placeholder="Digite seu texto"></textarea><input id="bmDelay" type="number" step="0.01" value="0.02"><button id="bmBtn">Iniciar</button></div>';
    document.body.appendChild(w);
    setTimeout(function() { w.classList.add('show') }, 100);
    var h = document.getElementById('bmHeader'), dx, dy;
    h.onmousedown = function(e) {
      dx = e.clientX - w.offsetLeft;
      dy = e.clientY - w.offsetTop;
      document.onmousemove = function(ev) {
        w.style.left = ev.clientX - dx + 'px';
        w.style.top = ev.clientY - dy + 'px';
      };
      document.onmouseup = function() {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };

    function sendChar(c) {
      if (!activeEl) return;
      ['keydown', 'keypress'].forEach(function(type) {
        activeEl.dispatchEvent(new KeyboardEvent(type, { key: c, char: c, keyCode: c.charCodeAt(0), which: c.charCodeAt(0), bubbles: true }));
      });
      if (activeEl.isContentEditable) {
        document.execCommand('insertText', false, c);
      } else if (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT') {
        var setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(activeEl), 'value').set;
        setter.call(activeEl, activeEl.value + c);
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        activeEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
      activeEl.dispatchEvent(new KeyboardEvent('keyup', { key: c, char: c, keyCode: c.charCodeAt(0), which: c.charCodeAt(0), bubbles: true }));
    }

    document.getElementById('bmBtn').onclick = function() {
      var text = document.getElementById('bmText').value, d = parseFloat(document.getElementById('bmDelay').value) * 1e3;
      if (!text) return;
      var btn = this, countEl = document.getElementById('bmCount');
      btn.disabled = true;
      (async function() {
        for (var t = 3; t >= 1; t--) {
          countEl.textContent = t;
          countEl.classList.add('count-show');
          await new Promise(function(r) { setTimeout(r, 700); });
          countEl.classList.remove('count-show');
          await new Promise(function(r) { setTimeout(r, 200); });
        }
        countEl.textContent = '';
        for (var i = 0; i < text.length; i++) {
          sendChar(text[i]);
          await new Promise(function(r) { setTimeout(r, d); });
        }
        btn.disabled = false;
      })();
    }
  }, 3000);
})();
