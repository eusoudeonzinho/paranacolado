(function() {
  // evita duplo carregamento
  if (document.getElementById('bmSplash')) return;

  // guarda último elemento clicado (CRUCIAL para ambas as funções)
  let activeEl = null;
  document.addEventListener('mousedown', e => {
      console.log('mousedown detected, activeEl set to:', e.target);
      activeEl = e.target;
  }, true); // Use capturing phase

  // --- FUNÇÕES DE SIMULAÇÃO DE TECLADO (MODIFICADAS/NOVAS) ---

  // Função para simular eventos de teclado genéricos
  function dispatchKeyEvent(target, eventType, key, keyCode, charCode = 0) {
      // Define charCode com base no keyCode se for um caractere imprimível e charCode não for fornecido
      let effectiveCharCode = charCode;
      if (!effectiveCharCode && key && key.length === 1) {
          effectiveCharCode = key.charCodeAt(0);
      }

      const event = new KeyboardEvent(eventType, {
          key: key,
          code: `Key${key.toUpperCase()}`, // Aproximação, pode não ser exato para todas as teclas
          keyCode: keyCode,
          which: keyCode,
          charCode: eventType === 'keypress' ? effectiveCharCode : 0, // charCode apenas para keypress
          bubbles: true,
          cancelable: true
      });
      // console.log(`Dispatching ${eventType}: key=${key}, keyCode=${keyCode}, charCode=${effectiveCharCode} on`, target);
      target.dispatchEvent(event);
  }


  // Função para SIMULAR a tecla Backspace
  async function simulateBackspace(targetElement) {
      if (!targetElement) return;
      activeEl = targetElement; // Garante que activeEl é o target
      targetElement.focus(); // Garante foco

      const start = targetElement.selectionStart;
      const end = targetElement.selectionEnd;

      dispatchKeyEvent(targetElement, 'keydown', 'Backspace', 8);

      // Lógica manual de exclusão se for INPUT ou TEXTAREA
      if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
         if (start === end && start > 0) { // Se for cursor (não seleção) e não estiver no início
             const currentValue = targetElement.value;
             const newValue = currentValue.substring(0, start - 1) + currentValue.substring(end);

             // Tenta usar setter do protótipo para compatibilidade com frameworks
             const prototype = Object.getPrototypeOf(targetElement);
             const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
             if (descriptor && descriptor.set) {
                 descriptor.set.call(targetElement, newValue);
             } else {
                 targetElement.value = newValue; // Fallback
             }

             // Ajusta o cursor
             targetElement.selectionStart = targetElement.selectionEnd = start - 1;

             // Dispara eventos para notificar frameworks/listeners da mudança
             targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
             targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
         } else if (start !== end) {
             // Se houver texto selecionado, Backspace o deletaria
              const currentValue = targetElement.value;
              const newValue = currentValue.substring(0, start) + currentValue.substring(end);
               // (Repete a lógica de atualização de valor e disparo de eventos acima)
                const prototype = Object.getPrototypeOf(targetElement);
                const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
                if (descriptor && descriptor.set) {
                    descriptor.set.call(targetElement, newValue);
                } else {
                    targetElement.value = newValue; // Fallback
                }
                targetElement.selectionStart = targetElement.selectionEnd = start; // Coloca cursor no início da antiga seleção
                targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
         }
      } else if (targetElement.isContentEditable) {
           // Para contentEditable, 'delete' pode funcionar melhor que backspace simulado programaticamente
           document.execCommand('delete', false, null);
       }

      dispatchKeyEvent(targetElement, 'keyup', 'Backspace', 8);
      // Pequena pausa após cada backspace simulado
      await new Promise(r => setTimeout(r, 1)); // Ajuste o delay conforme necessário (25ms)
  }

  // Função para SIMULAR digitação de um caractere (REUTILIZADA E VERIFICADA)
  function sendChar(c) {
      // A função agora depende que activeEl seja definido CORRETAMENTE antes de ser chamada
      if (!activeEl) {
          console.warn("sendChar chamada, mas activeEl é nulo. Clique em um campo primeiro.");
          return;
      }
      if (!document.body.contains(activeEl)) {
           console.warn("sendChar chamada, mas activeEl não está mais no DOM.");
           return; // Evita erros se o elemento foi removido
      }


      const targetElement = activeEl; // Usa a variável global
      targetElement.focus(); // Garante foco

      const keyCode = c.charCodeAt(0);

      // 1. keydown
      dispatchKeyEvent(targetElement, 'keydown', c, keyCode);

      // 2. keypress (apenas para caracteres imprimíveis)
      dispatchKeyEvent(targetElement, 'keypress', c, keyCode, keyCode); // Passa charCode aqui

      // 3. Inserir o caractere
      if (targetElement.isContentEditable) {
          document.execCommand('insertText', false, c);
      } else if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
          const start = targetElement.selectionStart;
          const end = targetElement.selectionEnd;
          const currentValue = targetElement.value;
          const newValue = currentValue.substring(0, start) + c + currentValue.substring(end);

          // Tenta usar setter do protótipo
          const prototype = Object.getPrototypeOf(targetElement);
          const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
          if (descriptor && descriptor.set) {
              descriptor.set.call(targetElement, newValue);
          } else {
              targetElement.value = newValue; // Fallback
          }

          // Ajusta o cursor para depois do caractere inserido
          targetElement.selectionStart = targetElement.selectionEnd = start + c.length;

          // Dispara eventos input/change
          targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      }

      // 4. keyup
      dispatchKeyEvent(targetElement, 'keyup', c, keyCode);
  }

  // --- RESTANTE DO CÓDIGO (Splash, CSS, UI, Modo Disfarçado - sem grandes mudanças) ---

  //
  // 1) SPLASH INICIAL
  //
  const splash = document.createElement('div');
  splash.id = 'bmSplash';
  splash.innerHTML = `
    <img id="bmSplashImg" src="https://i.imgur.com/RUWcJ6e.png"/>
    <div id="bmSplashTxt1">Paraná Tools - Redação</div>
    <div id="bmSplashTxt2">paranacolado.github.io</div>
  `;
  document.body.appendChild(splash);

  //
  // 2) CSS injetado (estilo KW-like + Estilo para novo botão)
  // (CSS Omitido por brevidade - use o CSS da resposta anterior)
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
      border-radius: 0 0 6px 6px; /* Garante borda arredondada inferior */
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
      box-sizing:border-box; /* Importante para padding não aumentar tamanho total */
    }
    #bmContent textarea:focus,
    #bmContent input:focus {
      outline:none;
      border-color:#8A2BE2; /* Roxão */
      box-shadow:0 0 6px rgba(138,43,226,.5);
    }
    /* Estilo comum para botões */
    #bmContent button {
      width:100%;
      padding:8px;
      margin-top: 5px; /* Adiciona espaço entre botões */
      font-size:0.95em;
      background:transparent;
      border:1px solid #8A2BE2; /* Roxão */
      border-radius:4px;
      color:#8A2BE2; /* Roxão */
      cursor:pointer;
      transition:background .2s, color .2s, transform .2s;
      box-sizing: border-box; /* Garante consistência de tamanho */
    }
     #bmContent button:disabled { /* Estilo para botão desabilitado */
       cursor: not-allowed;
       opacity: 0.6;
       border-color: #555;
       color: #555;
     }
     #bmContent button:not(:disabled):hover {
      background:#8A2BE2; /* Roxão */
      color:#111;
      transform:scale(1.03);
    }
    #bmContent button:not(:disabled):active {
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
      border:1px solid #8A2BE2; /* Roxão */
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
    #bmOv button { /* Estilo específico botão overlay */
      margin-top:20px;
      padding:8px 16px;
      background:#3B6991;
      color:#fff;
      border:none;border-radius:4px;
      font-size:0.95em;
      cursor:pointer;
      transition:transform .2s,background .2s;
      width: auto; /* Botão overlay não precisa ser 100% */
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
      if (document.body.contains(splash)) {
         document.body.removeChild(splash);
      }


      const wrapper = document.createElement('div');
      wrapper.id = 'bmWrapper';
      // Adiciona o novo botão "Corrigir Automaticamente" no innerHTML
      wrapper.innerHTML = `
        <div id="bmHeader">Paraná Colado V1 - AutoEditor Simulado</div>
        <div id="bmContent">
          <textarea id="bmText" placeholder="Cole o texto aqui para 'Iniciar'"></textarea>
          <input    id="bmDelay" type="number" step="0.01" value="0.05" placeholder="Delay em s (para 'Iniciar')"> <div id="bmToggleWrapper">
            <div id="bmToggleImg"></div>
            <span id="bmToggleText">Modo Disfarçado</span>
          </div>
          <button id="bmBtn">Iniciar Digitação</button>
          <button id="bmBtnCorrect">Corrigir Automaticamente</button> </div>
      `;
      document.body.appendChild(wrapper);
      setTimeout(() => wrapper.classList.add('show'), 100);

      // Lógica de arrastar (mantida)
      const header = document.getElementById('bmHeader');
      header.onmousedown = e => {
          e.preventDefault();
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
      // 4) lógica “Modo Disfarçado” (mantida - Omitida por brevidade, use a da resposta anterior)
      // ... (Colar aqui a lógica do Modo Disfarçado da resposta anterior) ...
      const toggleBox  = document.getElementById('bmToggleImg');
      const toggleText = document.getElementById('bmToggleText');
      let stealthOn  = false;
      let firstTime  = false;
      const imgOnBg  = '#8A2BE2';
      const imgOffBg = 'transparent';
      let rect; // Variável para guardar a posição do wrapper no modo disfarçado

      function enterStealth() {
          // Muda aparência para 'disfarçada' (exemplo, pode customizar)
          wrapper.style.background = '#f0f0f0';
          header.style.background  = '#d0d0d0';
          header.style.color       = '#333';
          wrapper.style.color      = '#333'; // Cor do texto geral
          wrapper.querySelectorAll('textarea,input').forEach(i => {
              i.style.background = '#fff';
              i.style.color      = '#000';
              i.style.border     = '1px solid #ccc';
          });
           wrapper.querySelectorAll('button').forEach(b => {
              // Adapta botões ao modo claro, mantendo funcionalidade visual
               b.style.background = '#e0e0e0';
               b.style.color      = '#555';
               b.style.borderColor = '#aaa';
           });
          toggleText.style.color = '#555'; // Cor do texto do toggle
          toggleBox.style.borderColor = '#aaa'; // Cor da borda do toggle box

          wrapper.addEventListener('mouseleave', hideUI);
          document.addEventListener('mousemove', showUI);
          console.log('Entered Stealth Mode');
      }

      function exitStealth() {
          // Restaura aparência original (dark theme)
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
               b.style.borderColor = '#8A2BE2';
           });
          toggleText.style.color = '#fff';
          toggleBox.style.borderColor = '#8A2BE2';

          wrapper.removeEventListener('mouseleave', hideUI);
          document.removeEventListener('mousemove', showUI);
          wrapper.style.opacity       = 1;
          wrapper.style.pointerEvents = 'auto';
           console.log('Exited Stealth Mode');
      }

      function hideUI() {
          rect = wrapper.getBoundingClientRect(); // Atualiza posição ao esconder
          wrapper.style.opacity       = 0;
          wrapper.style.pointerEvents = 'none';
           console.log('UI Hidden');
      }
      function showUI(ev) {
          // Verifica se rect foi definido antes de usar
          if (rect &&
              ev.clientX >= rect.left && ev.clientX <= rect.right &&
              ev.clientY >= rect.top  && ev.clientY <= rect.bottom
          ) {
              wrapper.style.opacity       = 1;
              wrapper.style.pointerEvents = 'auto';
               console.log('UI Shown');
          }
      }

      function showOverlay() {
          const ov = document.createElement('div');
          ov.id = 'bmOv';
          ov.innerHTML = `
            <img src="https://i.imgur.com/RquEok4.gif"/> <p style="color: white; font-family: sans-serif; text-align: center; margin-top: 15px;">O Modo Disfarçado oculta a janela quando o mouse não está sobre ela.</p>
            <button id="bmOvBtn">Entendido, Continuar</button>
          `;
          document.body.appendChild(ov);
          document.getElementById('bmOvBtn').onclick = () => {
               if (document.body.contains(ov)){
                  document.body.removeChild(ov);
               }
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
      // Inicializa no modo normal
      exitStealth();


      //
      // 6) botão Iniciar + contador 3‑2‑1 (Função Original - Mantida)
      // (Omitido por brevidade - use a da resposta anterior, ela já usa sendChar)
      document.getElementById('bmBtn').onclick = async function() {
          const text = document.getElementById('bmText').value;
          const delayInput = parseFloat(document.getElementById('bmDelay').value);
          const delay = (!isNaN(delayInput) && delayInput >= 0) ? delayInput * 1000 : 5; // Default 50ms

          if (!text) return alert('Texto para "Iniciar Digitação" está vazio!');
           // IMPORTANTE: 'Iniciar' agora também precisa que o usuário clique no campo ANTES
           if (!activeEl || !document.body.contains(activeEl)) {
              return alert('Clique primeiro no campo onde deseja digitar o texto ANTES de clicar em "Iniciar Digitação"!');
           }

          this.disabled = true;
          const correctButton = document.getElementById('bmBtnCorrect');
          if (correctButton) correctButton.disabled = true;


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
                  animation:  'countPop .7s ease-out forwards',
                  zIndex:     '10'
              });
              wrapper.appendChild(cnt);
              await new Promise(r => setTimeout(r,700));
              if (wrapper.contains(cnt)) wrapper.removeChild(cnt);
              await new Promise(r => setTimeout(r,200));
          }

          // digita
          try {
              activeEl.focus(); // Garante foco no elemento clicado pelo usuário
              for (let c of text) {
                  sendChar(c); // sendChar agora usa activeEl global
                  await new Promise(r => setTimeout(r, delay));
              }
          } catch (error) {
               console.error("Erro durante a digitação simulada ('Iniciar'):", error);
               alert("Ocorreu um erro durante a digitação. Verifique o console para detalhes.");
          } finally {
              this.disabled = false;
               if (correctButton) correctButton.disabled = false;
          }
      };


      // --- INÍCIO DA NOVA LÓGICA: CORRIGIR (SIMULADO) ---

      // Função auxiliar para esperar por um elemento
      function waitForElement(selector, timeout = 5000) {
          // console.log(`Esperando por elemento: ${selector}`); // Descomente para debug
          return new Promise((resolve, reject) => {
              const startTime = Date.now();
              const interval = setInterval(() => {
                  const element = document.querySelector(selector);
                  if (element && element.offsetParent !== null) { // Verifica se está visível/no layout
                      clearInterval(interval);
                      // console.log(`Elemento encontrado: ${selector}`); // Descomente para debug
                      resolve(element);
                  } else if (Date.now() - startTime > timeout) {
                      clearInterval(interval);
                      console.error(`Timeout esperando por elemento: ${selector}`);
                      reject(new Error(`Timeout esperando por elemento: ${selector}`));
                  }
              }, 100);
          });
      }

      // Função principal da correção automática SIMULADA
      document.getElementById('bmBtnCorrect').onclick = async function() {
          const correctButton = this;
          correctButton.disabled = true;
          const startButton = document.getElementById('bmBtn');
          if (startButton) startButton.disabled = true;

          console.log('Iniciando correção simulada...');
          const typingDelayCorrect = 25; // Delay entre caracteres da correção (ms)
          const backspaceDelay = 10; // Delay entre backspaces (ms)

          // 1. Encontrar a textarea principal de redação
          const targetTextarea = document.querySelector('textarea#outlined-multiline-static.jss17');
          if (!targetTextarea) {
              alert('ERRO: Textarea principal de redação (#outlined-multiline-static.jss17) não encontrada!');
              console.error('Textarea principal não encontrada.');
              correctButton.disabled = false;
              if (startButton) startButton.disabled = false;
              return;
          }
          console.log('Textarea principal encontrada.');

          // 2. Encontrar todos os spans de erro clicáveis
          const errorSpans = document.querySelectorAll('div.jss24 p.MuiTypography-root.jss23 div[style*="white-space: break-spaces"] > span');
          if (errorSpans.length === 0) {
              alert('Nenhum erro (span clicável na estrutura esperada) encontrado para corrigir.');
              console.log('Nenhum span de erro encontrado com o seletor especificado.');
              correctButton.disabled = false;
               if (startButton) startButton.disabled = false;
              return;
          }
          console.log(`Encontrados ${errorSpans.length} spans de erro potenciais.`);

          let correctedCount = 0;
          // 3. Iterar sobre cada erro
          for (const errorSpan of errorSpans) {
              try {
                  const errorText = errorSpan.textContent.trim();
                  if (!errorText) continue;

                  console.log(`Processando erro: "${errorText}"`);

                  // 3.1 Encontrar posição do erro na TEXTAREA EDITÁVEL
                  const currentTextValue = targetTextarea.value;
                  const errorIndex = currentTextValue.indexOf(errorText);

                  if (errorIndex === -1) {
                      console.log(`Erro "${errorText}" não encontrado na textarea editável. Pulando.`);
                      continue; // Pula se o erro não está mais lá
                  }

                  // 4. Simular clique no erro para ABRIR sugestões
                  errorSpan.click();
                  console.log('Clicou no span de erro.');

                  // 5. Esperar a lista de sugestões aparecer
                  let suggestionList;
                  try {
                      suggestionList = await waitForElement('ul#menu-list-grow', 3000);
                  } catch (e) {
                      console.warn(`Lista de sugestões não apareceu para "${errorText}". Pulando erro.`);
                       await new Promise(r => setTimeout(r, 100));
                       document.body.click(); // Tenta fechar menu fantasma
                       await new Promise(r => setTimeout(r, 200));
                      continue;
                  }

                  // 6. Coletar e escolher sugestão
                  const suggestionItems = suggestionList.querySelectorAll('li');
                  const validSuggestions = Array.from(suggestionItems)
                      .slice(1).map(li => li.textContent.trim()).filter(text => text.length > 0);

                  console.log('Sugestões encontradas:', validSuggestions);

                  if (validSuggestions.length > 0) {
                      const chosenSuggestion = validSuggestions[Math.floor(Math.random() * validSuggestions.length)];
                      console.log(`Sugestão escolhida: "${chosenSuggestion}"`);

                      // --- INÍCIO DA SIMULAÇÃO DE EDIÇÃO ---

                      // 7. Focar e posicionar cursor na TEXTAREA EDITÁVEL
                      targetTextarea.focus();
                      // Posiciona cursor DEPOIS do texto a ser apagado
                      targetTextarea.selectionStart = targetTextarea.selectionEnd = errorIndex + errorText.length;
                      console.log(`Cursor posicionado em ${targetTextarea.selectionEnd} na textarea.`);
                      await new Promise(r => setTimeout(r, 50)); // Pequena pausa após focar/posicionar

                      // 8. SIMULAR BACKSPACE para apagar o erro
                      console.log(`Simulando ${errorText.length} backspaces...`);
                      activeEl = targetTextarea; // Garante que activeEl é a textarea para simulateBackspace
                      for (let i = 0; i < errorText.length; i++) {
                          await simulateBackspace(targetTextarea); // simulateBackspace usa activeEl interno
                          await new Promise(r => setTimeout(r, backspaceDelay)); // Pausa entre backspaces
                      }
                      console.log('Backspaces simulados.');
                      await new Promise(r => setTimeout(r, 50)); // Pausa após apagar

                      // 9. SIMULAR DIGITAÇÃO da correção usando sendChar
                      console.log(`Simulando digitação de "${chosenSuggestion}"...`);
                      activeEl = targetTextarea; // Garante que activeEl é a textarea para sendChar
                      for (const char of chosenSuggestion) {
                          sendChar(char); // sendChar usa activeEl global
                          await new Promise(r => setTimeout(r, typingDelayCorrect)); // Pausa entre caracteres
                      }
                      console.log('Digitação da correção simulada.');
                      correctedCount++;
                      // --- FIM DA SIMULAÇÃO DE EDIÇÃO ---

                  } else {
                      console.warn(`Nenhuma sugestão válida encontrada para "${errorText}".`);
                  }

                  // 10. Fechar/Remover a lista de sugestões (clicando fora)
                  console.log('Tentando fechar a lista de sugestões clicando no body.');
                  document.body.click();
                  await new Promise(r => setTimeout(r, 250)); // Aumenta pausa após fechar menu

              } catch (error) {
                  console.error(`Erro processando o span "${errorSpan.textContent.trim()}":`, error);
                   try { document.body.click(); } catch(e){} // Tenta fechar menu em caso de erro
                   await new Promise(r => setTimeout(r, 200));
              }
          } // Fim do loop for...of

          // Reabilita os botões
          correctButton.disabled = false;
          if (startButton) startButton.disabled = false;

          console.log('Correção simulada concluída.');
          alert(`Correção simulada finalizada! ${correctedCount} erros foram processados.`);

      }; // Fim do onclick bmBtnCorrect

      // --- FIM DA NOVA LÓGICA ---

  }, 3500); // Fim do setTimeout principal

})(); // Fim da IIFE
