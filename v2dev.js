(function() {
    // evita duplo carregamento
    if (document.getElementById('bmSplash')) return;

    // guarda último elemento clicado (mantido para a função original "Iniciar")
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
      <div id="bmSplashTxt2">V1 Modificado</div>
    `;
    document.body.appendChild(splash);

    //
    // 2) CSS injetado (estilo KW-like + Estilo para novo botão)
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
        document.body.removeChild(splash);

        const wrapper = document.createElement('div');
        wrapper.id = 'bmWrapper';
        // Adiciona o novo botão "Corrigir Automaticamente" no innerHTML
        wrapper.innerHTML = `
          <div id="bmHeader">Paraná Colado V1 - AutoCorretor</div>
          <div id="bmContent">
            <textarea id="bmText" placeholder="Cole o texto aqui para 'Iniciar'"></textarea>
            <input    id="bmDelay" type="number" step="0.01" value="0.02" placeholder="Delay em s (para 'Iniciar')">
            <div id="bmToggleWrapper">
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
            // Previne seleção de texto ao arrastar
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
        // 4) lógica “Modo Disfarçado” (mantida)
        //
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

        // Inicializa no modo normal
        exitStealth();

        //
        // 5) digitar caracteres (Função Original - Mantida)
        //
        function sendChar(c) {
            if (!activeEl) return;
            // Simula keydown/keypress
            ['keydown','keypress'].forEach(t =>
                activeEl.dispatchEvent(new KeyboardEvent(t,{
                    key:c, char:c,
                    keyCode:c.charCodeAt(0),
                    which:c.charCodeAt(0),
                    bubbles:true, cancelable: true // Adicionado cancelable
                }))
            );

            // Insere o caractere dependendo do tipo de elemento
            if (activeEl.isContentEditable) {
                document.execCommand('insertText',false,c);
            } else if (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') {
                const start = activeEl.selectionStart;
                const end = activeEl.selectionEnd;
                const newValue = activeEl.value.substring(0, start) + c + activeEl.value.substring(end);

                // Tenta usar o setter do protótipo para compatibilidade com frameworks
                const prototype = Object.getPrototypeOf(activeEl);
                const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
                if (descriptor && descriptor.set) {
                     descriptor.set.call(activeEl, newValue);
                 } else {
                     activeEl.value = newValue; // Fallback
                 }

                // Restaura a posição do cursor
                activeEl.selectionStart = activeEl.selectionEnd = start + c.length;

                // Dispara eventos para notificar frameworks/listeners
                activeEl.dispatchEvent(new Event('input',{bubbles:true, cancelable: true}));
                activeEl.dispatchEvent(new Event('change',{bubbles:true, cancelable: true}));
            }

            // Simula keyup
            activeEl.dispatchEvent(new KeyboardEvent('keyup',{
                key:c, char:c,
                keyCode:c.charCodeAt(0),
                which:c.charCodeAt(0),
                bubbles:true, cancelable: true
            }));
        }

        //
        // 6) botão Iniciar + contador 3‑2‑1 (Função Original - Mantida)
        //
        document.getElementById('bmBtn').onclick = async function() {
            const text = document.getElementById('bmText').value;
            const delayInput = parseFloat(document.getElementById('bmDelay').value);
            // Garante que o delay não seja NaN ou negativo
            const delay = (!isNaN(delayInput) && delayInput >= 0) ? delayInput * 1000 : 20; // Default 20ms if invalid

            if (!text) return alert('Texto para "Iniciar Digitação" está vazio!');
             if (!activeEl) return alert('Clique primeiro no campo onde deseja digitar o texto!');

            this.disabled = true;
            const correctButton = document.getElementById('bmBtnCorrect'); // Desabilita outro botão também
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
                    zIndex:     '10' // Garante que fique sobre outros elementos do wrapper
                });
                wrapper.appendChild(cnt);
                await new Promise(r => setTimeout(r,700));
                if (wrapper.contains(cnt)) wrapper.removeChild(cnt); // Verifica se ainda existe antes de remover
                await new Promise(r => setTimeout(r,200));
            }

            // digita
            try {
                for (let c of text) {
                    sendChar(c);
                    await new Promise(r => setTimeout(r, delay));
                }
            } catch (error) {
                 console.error("Erro durante a digitação simulada:", error);
                 alert("Ocorreu um erro durante a digitação. Verifique o console para detalhes.");
            } finally {
                this.disabled = false;
                 if (correctButton) correctButton.disabled = false; // Reabilita outro botão
            }
        };

        // --- INÍCIO DA NOVA LÓGICA: CORRIGIR AUTOMATICAMENTE ---

        // Função auxiliar para esperar por um elemento
        function waitForElement(selector, timeout = 5000) {
            console.log(`Esperando por elemento: ${selector}`);
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                const interval = setInterval(() => {
                    const element = document.querySelector(selector);
                    if (element) {
                        clearInterval(interval);
                        console.log(`Elemento encontrado: ${selector}`);
                        resolve(element);
                    } else if (Date.now() - startTime > timeout) {
                        clearInterval(interval);
                        console.error(`Timeout esperando por elemento: ${selector}`);
                        reject(new Error(`Timeout esperando por elemento: ${selector}`));
                    }
                }, 100); // Verifica a cada 100ms
            });
        }

        // Função principal da correção automática
        document.getElementById('bmBtnCorrect').onclick = async function() {
            const correctButton = this;
            correctButton.disabled = true;
            const startButton = document.getElementById('bmBtn'); // Desabilita outro botão também
            if (startButton) startButton.disabled = true;

            console.log('Iniciando correção automática...');

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
            // Ajuste o seletor conforme a estrutura *exata* dos erros na página real.
            // Este seletor assume a estrutura fornecida: div.jss24 > p.jss23 > div[style*="white-space"] > span
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
                    if (!errorText) {
                        console.log('Span de erro vazio, pulando.');
                        continue; // Pula spans vazios
                    }

                    console.log(`Processando erro: "${errorText}"`);

                    // Verifica se o erro ainda existe na textarea antes de clicar
                    if (targetTextarea.value.indexOf(errorText) === -1) {
                         console.log(`Erro "${errorText}" não encontrado mais na textarea, pulando clique.`);
                         continue;
                    }


                    // 4. Simular clique no erro
                    errorSpan.click();
                    console.log('Clicou no span de erro.');

                    // 5. Esperar a lista de sugestões aparecer
                    let suggestionList;
                    try {
                        // Espera pelo ID específico da lista
                        suggestionList = await waitForElement('ul#menu-list-grow', 3000); // Timeout de 3s
                    } catch (e) {
                        console.warn(`Lista de sugestões (ul#menu-list-grow) não apareceu para "${errorText}". Pulando erro.`);
                        // Tenta fechar um possível menu fantasma clicando no body
                         await new Promise(r => setTimeout(r, 100)); // Pequena pausa
                         document.body.click();
                        await new Promise(r => setTimeout(r, 200)); // Pausa após clique no body
                        continue; // Pula para o próximo erro
                    }

                    // 6. Coletar sugestões válidas
                    const suggestionItems = suggestionList.querySelectorAll('li');
                    const validSuggestions = Array.from(suggestionItems)
                        .slice(1) // Ignora o primeiro <li> (descritivo)
                        .map(li => li.textContent.trim())
                        .filter(text => text.length > 0); // Filtra sugestões vazias

                    console.log('Sugestões encontradas:', validSuggestions);

                    // 7. Escolher e aplicar sugestão
                    if (validSuggestions.length > 0) {
                        const chosenSuggestion = validSuggestions[Math.floor(Math.random() * validSuggestions.length)];
                        console.log(`Sugestão escolhida: "${chosenSuggestion}"`);

                        // 8. Substituir na textarea
                        const currentText = targetTextarea.value;
                        const errorIndex = currentText.indexOf(errorText); // Encontra a *primeira* ocorrência

                        if (errorIndex !== -1) {
                            const newText = currentText.substring(0, errorIndex) +
                                            chosenSuggestion +
                                            currentText.substring(errorIndex + errorText.length);

                            targetTextarea.value = newText; // Atualiza o valor diretamente

                            // Dispara evento 'input' para notificar o site da mudança
                            targetTextarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                            console.log(`Texto "${errorText}" substituído por "${chosenSuggestion}" na textarea.`);
                            correctedCount++;

                            // Pequena pausa após aplicar a correção
                             await new Promise(r => setTimeout(r, 150));


                        } else {
                            console.warn(`Texto do erro "${errorText}" não encontrado na textarea no momento da substituição.`);
                        }
                    } else {
                        console.warn(`Nenhuma sugestão válida encontrada para "${errorText}".`);
                    }

                    // 9. Fechar/Remover a lista de sugestões (clicando fora)
                    console.log('Tentando fechar a lista de sugestões clicando no body.');
                    document.body.click(); // Simula um clique fora para fechar o menu

                    // 10. Pausa antes de processar o próximo erro
                    await new Promise(r => setTimeout(r, 300)); // Pausa de 300ms entre erros

                } catch (error) {
                    console.error(`Erro processando o span "${errorSpan.textContent.trim()}":`, error);
                     // Tenta clicar no body para fechar menus abertos em caso de erro
                     document.body.click();
                     await new Promise(r => setTimeout(r, 200));
                    // Continua para o próximo erro
                }
            } // Fim do loop for...of

            // Reabilita os botões
            correctButton.disabled = false;
            if (startButton) startButton.disabled = false;

            console.log('Correção automática concluída.');
            alert(`Correção automática finalizada! ${correctedCount} erros foram corrigidos.`);

        }; // Fim do onclick bmBtnCorrect

        // --- FIM DA NOVA LÓGICA ---

    }, 3500); // Fim do setTimeout principal

})(); // Fim da IIFE
