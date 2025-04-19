(function() {
    // evita duplo carregamento
    if (document.getElementById('bmSplash')) return;

    // guarda último elemento clicado (para o botão "Iniciar" original)
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
      <div id="bmSplashTxt2">V1 + Correção</div>
    `;
    document.body.appendChild(splash);

    //
    // 2) CSS injetado (estilo KW-like + botão Corrigir)
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
        border-color:#8A2BE2; /* Roxo Azulado Violeta */
        box-shadow:0 0 6px rgba(138,43,226,.5);
      }
      #bmContent button { /* Estilo base para botões */
        width:100%;
        padding:8px;
        margin-top: 10px; /* Adicionado espaçamento entre botões */
        font-size:0.95em;
        background:transparent;
        border:1px solid #8A2BE2; /* Roxo Azulado Violeta */
        border-radius:4px;
        color:#8A2BE2; /* Roxo Azulado Violeta */
        cursor:pointer;
        transition:background .2s, color .2s, transform .2s;
        box-sizing:border-box;
      }
       #bmContent button:first-of-type { /* Remove margem do primeiro botão */
         margin-top: 0;
       }
      #bmContent button:hover {
        background:#8A2BE2; /* Roxo Azulado Violeta */
        color:#111;
        transform:scale(1.03);
      }
      #bmContent button:active {
        transform:scale(.97);
      }
      #bmContent button:disabled { /* Estilo para botão desabilitado */
        cursor: not-allowed;
        opacity: 0.6;
        border-color: #555;
        color: #555;
        background: transparent;
        transform: none;
      }
      /* Estilo específico para o botão Corrigir (pode ajustar cores) */
      #bmBtnCorrect {
         border-color: #3B6991; /* Azul */
         color: #3B6991; /* Azul */
      }
       #bmBtnCorrect:hover {
          background:#3B6991; /* Azul */
          color:#fff;
       }
       #bmBtnCorrect:disabled {
        border-color: #555;
        color: #555;
        background: transparent;
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
        border:1px solid #8A2BE2; /* Roxo Azulado Violeta */
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

      /* --- FIM CSS --- */
    `;
    const styleTag = document.createElement('style');
    styleTag.innerHTML = css;
    document.head.appendChild(styleTag);

    //
    // 3) após splash, monta UI principal
    //
    setTimeout(() => {
        if (splash.parentNode) {
             document.body.removeChild(splash);
        }

        const wrapper = document.createElement('div');
        wrapper.id = 'bmWrapper';
        // Adicionado placeholder para o botão Corrigir, que será inserido via JS
        wrapper.innerHTML = `
          <div id="bmHeader">Paraná Colado V1 + Correção</div>
          <div id="bmContent">
            <textarea id="bmText" placeholder="Digite seu texto (para 'Iniciar')"></textarea>
            <input    id="bmDelay" type="number" step="0.01" value="0.02" placeholder="Delay em s (para 'Iniciar')">
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
        let rect; // Usado também no modo disfarçado
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

        // --- Elementos da UI ---
        const bmContent = document.getElementById('bmContent');
        const bmBtn = document.getElementById('bmBtn'); // Botão Iniciar original

        // --- Adicionar Botão "Corrigir Automaticamente" ---
        const correctButton = document.createElement('button');
        correctButton.id = 'bmBtnCorrect';
        correctButton.textContent = 'Corrigir Automaticamente';
        // Insere DEPOIS do botão "Iniciar"
        bmBtn.parentNode.insertBefore(correctButton, bmBtn.nextSibling);

        //
        // 4) lógica “Modo Disfarçado”
        //
        const toggleBox  = document.getElementById('bmToggleImg');
        const toggleText = document.getElementById('bmToggleText');
        let stealthOn  = false;
        let firstTime  = true; // Corrigido: deve ser true inicialmente
        const imgOnBg  = '#8A2BE2'; // Roxo Azulado Violeta
        const imgOffBg = 'transparent';

        function enterStealth() {
          // Simplificado para não conflitar com o estilo original, apenas esconde/mostra
            wrapper.addEventListener('mouseleave', hideUI);
            document.addEventListener('mousemove', showUI);
            console.log("Modo Disfarçado Ativado");
             // Adiciona mudança de estilo se necessário aqui (ex: transparência parcial)
             // wrapper.style.opacity = '0.8'; // Exemplo
        }

        function exitStealth() {
            wrapper.removeEventListener('mouseleave', hideUI);
            document.removeEventListener('mousemove', showUI);
            wrapper.style.opacity = 1; // Garante visibilidade total
            wrapper.style.pointerEvents = 'auto';
            console.log("Modo Disfarçado Desativado");
        }

        function hideUI() {
            rect = wrapper.getBoundingClientRect(); // Atualiza rect ao esconder
            wrapper.style.opacity = 0;
            wrapper.style.pointerEvents = 'none';
        }
        function showUI(ev) {
            if (!rect) return; // Garante que rect exista
            if (
                ev.clientX >= rect.left && ev.clientX <= rect.right &&
                ev.clientY >= rect.top  && ev.clientY <= rect.bottom
            ) {
                wrapper.style.opacity = 1;
                wrapper.style.pointerEvents = 'auto';
            }
        }

         function showOverlay() {
            if (document.getElementById('bmOv')) return; // Evita overlay duplicado
            const ov = document.createElement('div');
            ov.id = 'bmOv';
            ov.innerHTML = `
              <img src="https://i.imgur.com/RquEok4.gif"/>
               <p style="color: white; text-align: center; font-family: sans-serif; margin-top: 15px;">
                 O Modo Disfarçado fará a janela sumir quando o mouse<br>
                 não estiver sobre ela. Mova o mouse para a área<br>
                 onde a janela estava para reexibi-la.
               </p>
              <button id="bmOvBtn">Entendi, Continuar</button>
            `;
            document.body.appendChild(ov);
            document.getElementById('bmOvBtn').onclick = () => {
                if (ov.parentNode) document.body.removeChild(ov);
                enterStealth();
            };
        }


        toggleBox.onclick = () => {
            stealthOn = !stealthOn;
            toggleBox.style.background = stealthOn ? imgOnBg : imgOffBg;
            if (stealthOn) {
                if (firstTime) {
                    firstTime = false;
                    showOverlay();
                } else {
                    enterStealth();
                }
            } else {
                exitStealth();
            }
        };

        // Inicializa no modo normal (não disfarçado)
         exitStealth(); // Chama para garantir o estado inicial correto

        //
        // 5) digitar caracteres (Função auxiliar para o botão "Iniciar")
        //
        function sendChar(c) {
            if (!activeEl) {
                console.warn("Nenhum elemento ativo para digitar (clique em um campo de texto primeiro).");
                return false; // Indica falha
            }
             // Tenta focar o elemento antes de enviar eventos
             if (typeof activeEl.focus === 'function') {
                 activeEl.focus();
             }

            // Simulação de eventos de teclado
            try {
                const eventOptions = {
                    key: c,
                    char: c,
                    keyCode: c.charCodeAt(0),
                    which: c.charCodeAt(0),
                    bubbles: true,
                    cancelable: true // Permite que o evento seja cancelado se necessário
                };
                activeEl.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
                activeEl.dispatchEvent(new KeyboardEvent('keypress', eventOptions)); // Keypress é obsoleto, mas pode ser necessário

                // Inserção de texto mais robusta
                if (activeEl.isContentEditable) {
                    document.execCommand('insertText', false, c);
                } else if (typeof activeEl.value !== 'undefined') {
                    const start = activeEl.selectionStart;
                    const end = activeEl.selectionEnd;
                    const text = activeEl.value;
                    activeEl.value = text.slice(0, start) + c + text.slice(end);
                    // Atualiza a posição do cursor
                    activeEl.selectionStart = activeEl.selectionEnd = start + 1;
                } else {
                     console.warn("Não foi possível inserir texto no elemento:", activeEl);
                     return false; // Indica falha
                }

                // Dispara eventos de input/change após a modificação
                activeEl.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                activeEl.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

                activeEl.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
                return true; // Indica sucesso
            } catch (error) {
                console.error("Erro ao simular digitação para o caractere:", c, error);
                return false; // Indica falha
            }
        }


        //
        // 6) botão Iniciar + contador 3‑2‑1 (Funcionalidade Original)
        //
        bmBtn.onclick = async function() {
            const text = document.getElementById('bmText').value;
            const delayInput = parseFloat(document.getElementById('bmDelay').value);
            const delay = isNaN(delayInput) ? 20 : Math.max(10, delayInput * 1000); // Delay em ms, min 10ms

            if (!text) return alert('Texto vazio para a função "Iniciar"!');
            if (!activeEl) return alert('Clique em um campo de texto na página antes de Iniciar!');

            this.disabled = true;
            correctButton.disabled = true; // Desabilita o outro botão também

            // contador estilizado
            for (let n = 3; n >= 1; n--) {
                const cnt = document.createElement('div');
                cnt.textContent = n;
                Object.assign(cnt.style, {
                    position:   'absolute',
                    top:        '50px', // Ajuste conforme necessário
                    left:       '50%', // Centraliza horizontalmente
                    transform:  'translateX(-50%)', // Ajuste fino da centralização
                    fontFamily: 'Segoe UI Black',
                    color:      '#8A2BE2', // Roxo Azulado Violeta
                    fontSize:   '2.5em', // Maior para destaque
                    opacity:    0,
                    zIndex:     10, // Garante que fique sobre outros elementos do wrapper
                    animation:  'countPop .7s ease-out forwards'
                });
                wrapper.appendChild(cnt);
                await new Promise(r => setTimeout(r, 700));
                 if (cnt.parentNode) wrapper.removeChild(cnt);
                await new Promise(r => setTimeout(r, 200)); // Pequena pausa entre números
            }

             console.log(`Iniciando digitação simulada no elemento:`, activeEl);
             let success = true;
            // digita
            for (let c of text) {
                if (!sendChar(c)) {
                    alert(`Falha ao digitar o caractere "${c}". Abortando.`);
                    success = false;
                    break; // Interrompe se sendChar falhar
                }
                await new Promise(r => setTimeout(r, delay));
            }

            if (success) {
                console.log("Digitação simulada concluída.");
            }

            this.disabled = false;
            correctButton.disabled = false; // Reabilita o outro botão
        };

      // Função auxiliar para esperar um elemento aparecer
        async function waitForElement(selector, context = document, timeout = 5000) {
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                const element = context.querySelector(selector);
                if (element) {
                    // Verifica se o elemento está visível (opcional, mas pode ajudar)
                    const rect = element.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        return element;
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 100)); // Verifica a cada 100ms
            }
            console.warn(`Elemento "${selector}" não encontrado ou não visível após ${timeout}ms`);
            return null;
        }

        correctButton.onclick = async function() {
            console.log("Iniciando correção automática...");
            this.disabled = true;
            bmBtn.disabled = true; // Desabilita o outro botão

            // 1. Encontrar a área de texto principal CORRETAMENTE
            // Usando a classe específica da textarea da redação
            const mainTextArea = document.querySelector('textarea.jss17'); // SELETOR AJUSTADO
            if (!mainTextArea) {
                // Tenta o ID como fallback, caso a classe mude, mas avisa sobre duplicidade
                console.warn("Textarea com classe 'jss17' não encontrada. Tentando por ID (pode pegar o elemento errado se houver IDs duplicados)...");
                mainTextArea = document.getElementById('outlined-multiline-static');
                 if (!mainTextArea || mainTextArea.tagName !== 'TEXTAREA') {
                    alert('Erro: Textarea principal da redação não encontrada (nem por classe jss17, nem por ID)! Verifique os seletores no script.');
                    this.disabled = false;
                    bmBtn.disabled = false;
                    return;
                 }
                 alert('Aviso: Textarea encontrada por ID, mas este ID pode estar duplicado na página. A correção pode não funcionar como esperado.');
            }
            console.log("Textarea principal encontrada:", mainTextArea);

            // 2. Encontrar todos os spans de erro clicáveis
            const errorSpans = document.querySelectorAll('div.jss24 span'); // Mantém o seletor original para os spans
            if (errorSpans.length === 0) {
                alert('Nenhum erro (span dentro de div.jss24) encontrado para corrigir.');
                this.disabled = false;
                bmBtn.disabled = false;
                return;
            }
            console.log(`Encontrados ${errorSpans.length} erros potenciais.`);

            let correctionsApplied = 0;
            let errorsSkipped = 0;

            // 3. Iterar sobre cada erro
            for (const span of errorSpans) {
                // Verifica se o span tem algum conteúdo ou atributo que o marque como erro real
                // (Pode ser necessário ajustar isso se houver spans não-clicáveis dentro de jss24)
                if (!span.offsetParent) { // Heurística simples: pula spans não visíveis/renderizados
                    console.log("Pulando span não visível:", span);
                    continue;
                }

                try {
                    // O texto do span não é mais necessário para a substituição
                    // const originalErrorText = span.textContent.trim();
                     console.log("Processando erro no span:", span);


                    // Garante que o span esteja visível (scroll se necessário)
                     span.scrollIntoView({ behavior: 'smooth', block: 'center' });
                     await new Promise(r => setTimeout(r, 300)); // Pausa para scroll

                    // 4. Simular clique no erro
                    span.click();
                    console.log("Span clicado.");

                    // 5. Aguardar a lista de sugestões (UL) aparecer
                    const suggestionList = await waitForElement('ul#menu-list-grow', document, 2000); // Espera até 2s

                    if (!suggestionList) {
                        console.warn(`Lista de sugestões não encontrada para o erro clicado. Pulando.`);
                        errorsSkipped++;
                         // Tenta fechar qualquer menu residual clicando fora
                         try { document.body.click(); await new Promise(r => setTimeout(r, 150)); } catch {}
                        continue; // Pula para o próximo erro
                    }
                    console.log("Lista de sugestões encontrada.");

                    // 6. Coletar os elementos <li> das sugestões
                    const listItems = suggestionList.querySelectorAll('li');
                    if (listItems.length <= 1) { // Assume que a primeira é descritiva
                         console.warn("Nenhuma sugestão válida (<li>) encontrada na lista (ou apenas o descritivo). Pulando.");
                         errorsSkipped++;
                         // Fecha o menu atual antes de ir para o próximo
                          try { document.body.click(); await new Promise(r => setTimeout(r, 150)); } catch {}
                         continue;
                    }

                     // Pega os elementos <li> que representam sugestões reais (ignora o primeiro)
                     const suggestionLiElements = Array.from(listItems).slice(1);

                    // 7. Escolher um elemento <li> de sugestão aleatoriamente
                    const chosenLiElement = suggestionLiElements[Math.floor(Math.random() * suggestionLiElements.length)];
                    const chosenSuggestionText = chosenLiElement.textContent.trim();
                    console.log(`Elemento <li> escolhido:`, chosenLiElement, `Texto: "${chosenSuggestionText}"`);

                    // 8. SIMULAR CLIQUE NA SUGESTÃO ESCOLHIDA (<li>)
                    if (chosenLiElement) {
                        chosenLiElement.click();
                        console.log(`Clique simulado na sugestão <li>: "${chosenSuggestionText}"`);
                        correctionsApplied++;

                        // Espera um pouco para a UI do site processar a correção
                        await new Promise(r => setTimeout(r, 400)); // Aumentar se necessário
                    } else {
                        console.warn("Não foi possível encontrar o elemento <li> para clicar. Pulando.");
                        errorsSkipped++;
                         // Tenta fechar o menu mesmo assim
                          try { document.body.click(); await new Promise(r => setTimeout(r, 150)); } catch {}
                    }

                    // 9. Não precisamos mais fechar o menu explicitamente aqui,
                    // pois o clique na sugestão <li> geralmente fecha o menu.
                    // Se ele persistir, a tentativa de clique no próximo span ou o body.click
                    // em caso de erro pode ajudar.


                } catch (error) {
                    console.error(`Erro ao processar um erro:`, error, "Span:", span);
                    errorsSkipped++;
                     // Tenta fechar menus residuais em caso de erro
                      try { document.body.click(); await new Promise(r => setTimeout(r, 150)); } catch {}
                }
                 // Pequena pausa entre processar cada erro
                 await new Promise(r => setTimeout(r, 200));

            } // Fim do loop for

            console.log("Correção automática concluída.");
            alert(`Correção finalizada!\nCliques em sugestões: ${correctionsApplied}\nErros pulados/não corrigidos: ${errorsSkipped}`);

            this.disabled = false;
            bmBtn.disabled = false; // Reabilita o outro botão
        };

    }, 3500); // Fim do setTimeout principal que espera o splash

})(); // Fim da IIFE
