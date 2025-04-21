
(function () {
    
    if (document.getElementById('bmSplash')) {
        return;
    }
    
    const MIN_DELAY = 1;       
    const SCROLL_DELAY = 40;   
    const STEP_DELAY = MIN_DELAY; 
    const FAST_TYPE_DELAY = 1; 
    const MIN_WRAPPER_WIDTH = 260;
    const MIN_WRAPPER_HEIGHT = 180;
    const ADV_CONTEXT_WORDS = 5;
    const AI_STATUS_UPDATE_INTERVAL = 2200; 
    const AI_GENERATION_MIN_WORDS = 170;
    const AI_GENERATION_MAX_WORDS = 300;
    const TARGET_TEXTAREA_SELECTOR = 'textarea#outlined-multiline-static[class*="jss"]'; 

    
    let activeEl = null; 
    let isCorrectionRunning = false;
    let currentCorrectionResolver = null;
    let correctionSplashEl = null; 
    let aiStatusIntervalId = null; 
    let isDarkModeOn = false; 
    let contextMenuEl = null; 
    let aiGenResultPopupEl = null; 
    let lastAIGenerationPrompt = null; 
    let uiWrapperElement = null; 
    let stealthOn = false; 

    

    function showCustomAlert(message, type = 'info', buttons = [{ text: 'OK' }], alertId = 'bmAlertOverlay') {
        return new Promise((resolve) => {
            removeOverlay(alertId); 
            const overlay = document.createElement('div');
            overlay.id = alertId;
            overlay.className = 'bmDialogOverlay';
            overlay.style.zIndex = '100005'; 
            const alertBox = document.createElement('div');
            alertBox.className = 'bmDialogBox';
            alertBox.classList.add(`bmAlert-${type}`);
            let iconHtml = '';
            switch (type) {
                case 'error': iconHtml = '<div class="bmDialogIcon error">!</div>'; break;
                case 'warning': iconHtml = '<div class="bmDialogIcon warning">!</div>'; break;
                case 'success': iconHtml = '<div class="bmDialogIcon success">✓</div>'; break;
                case 'question': iconHtml = '<div class="bmDialogIcon question">?</div>'; break;
                case 'info': default: iconHtml = '<div class="bmDialogIcon info">i</div>'; break;
            }
            const messageP = document.createElement('p');
            messageP.className = 'bmDialogMessage';
            messageP.innerHTML = message; 
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'bmDialogButtonContainer';
            buttons.forEach(buttonInfo => {
                const btn = document.createElement('button');
                btn.textContent = buttonInfo.text;
                btn.className = `bmDialogButton ${buttonInfo.class || ''}`;
                btn.onclick = () => {
                    alertBox.classList.remove('bmDialogEnter');
                    alertBox.classList.add('bmDialogExit');
                    overlay.classList.add('bmDialogFadeOut');
                    setTimeout(() => {
                        removeOverlay(overlay); 
                        resolve(buttonInfo.value !== undefined ? buttonInfo.value : buttonInfo.text);
                    }, 400);
                };
                buttonContainer.appendChild(btn);
            });
            alertBox.innerHTML = iconHtml;
            alertBox.appendChild(messageP);
            alertBox.appendChild(buttonContainer);
            overlay.appendChild(alertBox);
            document.body.appendChild(overlay);
            void alertBox.offsetWidth; 
            overlay.classList.add('bmDialogFadeIn');
            alertBox.classList.add('bmDialogEnter');
        });
    }

    
    /**
     * Mostra um diálogo perguntando como inserir o texto da IA
     * @returns {Promise<string>} A opção escolhida ('replace', 'append', 'cancel')
     */
    async function showWriteOptionsDialog() {
        const buttons = [
             { text: 'Escrever no final do texto', value: 'append', class: 'secondary' },
             { text: 'Substituir o texto atual', value: 'replace' },
             { text: 'Cancelar', value: 'cancel', class: 'secondary' }
        ];
        const choice = await showCustomAlert(
            'O que deseja fazer com o texto gerado pela IA?',
            'question',
            buttons,
            'bmWriteOptionsDialog'
        );
        removeOverlay('bmWriteOptionsDialog'); 
        return choice;
    }
    

    
    
    /**
     * Espera um elemento ser REMOVIDO do DOM
     * Resolve a Promise APENAS quando o elemento não é mais encontrado pelo querySelector
     * Continua esperando se o elemento for encontrado, mesmo que oculto por CSS
     * Resolve com aviso em caso de timeout se o elemento ainda estiver no DOM
     * @param {string} selector Seletor CSS do elemento
     * @param {number} timeout Tempo máximo de espera em milissegundos
     * @returns {Promise<string>} Mensagem indicando o resultado
     */
    function waitForElementToDisappear(selector, timeout = 45000) {
        console.log(`Aguardando ${selector} ser REMOVIDO do DOM...`);
        return new Promise((resolve) => {
            const intervalTime = 100; 
            let elapsedTime = 0;
            let timeoutId = null; 
    
            const intervalId = setInterval(() => {
                const element = document.querySelector(selector);
    
                if (!element) {
                    
                    clearInterval(intervalId);
                    clearTimeout(timeoutId); 
                    console.log(`Espera por ${selector} concluída (elemento REMOVIDO do DOM).`);
                    resolve("Elemento removido do DOM");
                } else {
                    
                    elapsedTime += intervalTime;
    
                    if (elapsedTime > timeout) {
                        clearInterval(intervalId);
                        
                        console.warn(`Timeout (${timeout / 1000}s) esperando ${selector} ser REMOVIDO. O elemento AINDA está no DOM. Continuando o script...`);
                        resolve("Timeout (elemento ainda no DOM)"); 
                    } else if (elapsedTime % 5000 === 0 && elapsedTime > 0) { 
                        console.log(`Ainda esperando <span class="math-inline">\{selector\} ser REMOVIDO\.\.\. \(</span>{elapsedTime / 1000}s)`);
                    }
                }
            }, intervalTime);
    
            
            timeoutId = setTimeout(() => {
                clearInterval(intervalId); 
                 const elementStillExists = document.querySelector(selector); 
                 if (elementStillExists) {
                    console.warn(`Timeout final (${timeout / 1000}s) esperando ${selector} ser REMOVIDO. Elemento ainda no DOM. Continuando...`);
                    resolve("Timeout final (elemento ainda no DOM)");
                 } else {
                    console.log(`Timeout final (${timeout / 1000}s), mas elemento ${selector} já havia sido removido (OK).`);
                    resolve("Timeout final (elemento já removido)");
                 }
            }, timeout);
        });
    }

     function waitForElement(selector, timeout = 5000) {
         return new Promise((resolve, reject) => {
             const startTime = Date.now();
             const interval = setInterval(() => {
                 const element = document.querySelector(selector);
                 
                 if (element && element.offsetParent !== null) {
                     clearInterval(interval);
                     resolve(element);
                 } else if (Date.now() - startTime > timeout) {
                     clearInterval(interval);
                     reject(new Error(`Timeout esperando aparecer: ${selector}`));
                 }
             }, 50); 
         });
     }

    
    document.addEventListener('mousedown', e => {
        
        const wrapper = document.getElementById('bmWrapper');
        if (!wrapper || !wrapper.contains(e.target) || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
             activeEl = e.target;
             
         }
    }, true);

    function dispatchKeyEvent(target, eventType, key, keyCode, charCode = 0, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false) {
        let effectiveCharCode = charCode;
        if (!effectiveCharCode && key && key.length === 1) {
            effectiveCharCode = key.charCodeAt(0);
        }
        const event = new KeyboardEvent(eventType, {
            key: key,
            code: keyCode === 8 ? 'Backspace' : `Key${key.toUpperCase()}`, 
            keyCode: keyCode,
            which: keyCode,
            charCode: eventType === 'keypress' ? effectiveCharCode : 0,
            bubbles: true,
            cancelable: true,
            composed: true, 
            ctrlKey: ctrlKey,
            altKey: altKey,
            shiftKey: shiftKey,
            metaKey: metaKey
        });
        
        try {
            target.dispatchEvent(event);
        } catch (e) {
            console.warn("Falha ao despachar evento:", eventType, key, e);
        }
    }

    async function simulateBackspace(targetElement) {
        if (!targetElement || !document.body.contains(targetElement)) return false;
        
        dispatchKeyEvent(targetElement, 'keydown', 'Backspace', 8);
        let valueChanged = false;
        if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
            const start = targetElement.selectionStart;
            const end = targetElement.selectionEnd;
            const currentValue = targetElement.value;
            let newValue = currentValue;
            let newCursorPos = start;
            if (start !== end) { 
                newValue = currentValue.substring(0, start) + currentValue.substring(end);
                newCursorPos = start;
                valueChanged = true;
            } else if (start > 0) { 
                newValue = currentValue.substring(0, start - 1) + currentValue.substring(end);
                newCursorPos = start - 1;
                valueChanged = true;
            }
            if (valueChanged) {
                try {
                    
                    const prototype = Object.getPrototypeOf(targetElement);
                    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
                    if (descriptor && descriptor.set) {
                        descriptor.set.call(targetElement, newValue);
                    } else {
                        targetElement.value = newValue; 
                    }
                    
                    targetElement.selectionStart = targetElement.selectionEnd = newCursorPos;
                    targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, composed: true }));
                    targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                } catch (e) {
                    console.warn("Erro ao definir valor/disparar evento no backspace simulado via descritor, tentando fallback", e);
                    
                    targetElement.value = newValue;
                    targetElement.selectionStart = targetElement.selectionEnd = newCursorPos;
                    targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, composed: true }));
                    targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                }
            }
        } else if (targetElement.isContentEditable) {
            
            document.execCommand('delete', false, null);
            valueChanged = true;
        }
        dispatchKeyEvent(targetElement, 'keyup', 'Backspace', 8);
        if (MIN_DELAY > 0) await new Promise(r => setTimeout(r, MIN_DELAY));
        return valueChanged;
    }


     function sendChar(c, targetElement) { 
         if (!targetElement || !document.body.contains(targetElement)) {
             console.warn("sendChar: Elemento alvo inválido ou não está no DOM.");
             return false;
         }
         try {
             
             if (document.activeElement !== targetElement) {
                 targetElement.focus({ preventScroll: true });
             }
         } catch (e) {
             console.warn("sendChar: Falha ao focar:", e);
             
         }

         const keyCode = c.charCodeAt(0);
         const charCode = keyCode; 

         
         dispatchKeyEvent(targetElement, 'keydown', c, keyCode);
         dispatchKeyEvent(targetElement, 'keypress', c, keyCode, charCode);

         let valueChanged = false;
         
         if (targetElement.isContentEditable) {
             try {
                 
                 if (!document.execCommand('insertText', false, c)) {
                     
                     const sel = window.getSelection();
                     if (sel.rangeCount > 0) {
                         const range = sel.getRangeAt(0);
                         range.deleteContents();
                         range.insertNode(document.createTextNode(c));
                         range.collapse(false); 
                         valueChanged = true;
                     }
                 } else {
                     valueChanged = true;
                 }
             } catch (e) {
                 console.warn("sendChar: Falha no execCommand('insertText') ou fallback:", e);
             }
         } else if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
             const start = targetElement.selectionStart;
             const end = targetElement.selectionEnd;
             const currentValue = targetElement.value;
             const newValue = currentValue.substring(0, start) + c + currentValue.substring(end);
             try {
                 
                 const prototype = Object.getPrototypeOf(targetElement);
                 const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
                 if (descriptor && descriptor.set) {
                     descriptor.set.call(targetElement, newValue);
                 } else {
                     targetElement.value = newValue; 
                 }
                 
                 targetElement.selectionStart = targetElement.selectionEnd = start + c.length;
                 targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, composed: true }));
                 targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                 valueChanged = true;
             } catch (e) {
                 console.warn("Erro ao definir valor via descritor no sendChar, tentando fallback", e);
                 try {
                     targetElement.value = newValue;
                     targetElement.selectionStart = targetElement.selectionEnd = start + c.length;
                     targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, composed: true }));
                     targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                     valueChanged = true;
                 } catch (e2) {
                     console.error("Falha total ao definir valor ou disparar eventos em sendChar:", e2);
                 }
             }
         }

         
         dispatchKeyEvent(targetElement, 'keyup', c, keyCode);

         return valueChanged;
     }

    async function clearTextareaSimulated(textareaElement) {
        if (!textareaElement || !document.body.contains(textareaElement)) {
            console.error("clearTextareaSimulated: Elemento alvo inválido.");
            return false;
        }
        console.log("Iniciando limpeza rápida da textarea...");
        
        try {
            textareaElement.focus({ preventScroll: true });
            await new Promise(r => setTimeout(r, 50)); 

            
            const prototype = Object.getPrototypeOf(textareaElement);
            const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
            if (descriptor && descriptor.set) {
                descriptor.set.call(textareaElement, "");
            } else {
                textareaElement.value = ""; 
            }
            textareaElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, composed: true }));
            textareaElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

            if (textareaElement.value === "") {
                console.log("Textarea limpa com sucesso (método direto).");
                return true;
            } else {
                 console.warn("Limpeza direta falhou, tentando Select All + Backspace...");
                 
                textareaElement.select();
                await new Promise(r => setTimeout(r, 50)); 
                const backspaceSuccess = await simulateBackspace(textareaElement);
                if (backspaceSuccess && textareaElement.value === "") {
                     console.log("Textarea limpa com sucesso (método simulado).");
                     return true;
                } else {
                     console.warn("Limpeza simulada também falhou. Forçando valor vazio.");
                     textareaElement.value = ""; 
                     return textareaElement.value === "";
                }
            }
        } catch (error) {
            console.error("Erro durante clearTextareaSimulated:", error);
             try { 
                 textareaElement.value = "";
                 return textareaElement.value === "";
             } catch (e2) {
                 return false;
             }
        }
    }

    async function typeTextFast(text, targetElement) {
        if (!targetElement || !document.body.contains(targetElement)) {
            console.error("typeTextFast: Elemento alvo inválido.");
            return false;
        }
        console.log(`Iniciando digitação rápida (${FAST_TYPE_DELAY}ms delay)...`);
        
        targetElement.focus({ preventScroll: true }); 
        let success = true;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            const charSuccess = sendChar(char, targetElement);
            if (!charSuccess) {
                console.warn(`Falha ao digitar o caractere rápido: "${char}" na posição ${i}`);
                
            }
            if (FAST_TYPE_DELAY > 0) {
                await new Promise(r => setTimeout(r, FAST_TYPE_DELAY));
            }
            if (i % 200 === 0 && i > 0) { 
                console.log(`Digitando rápido... ${i + 1}/${text.length}`);
            }
        }
        console.log("Digitação rápida concluída.");
        return success; 
    }


    async function callPuterAI(prompt) {
        return new Promise((resolve, reject) => {
            console.log("Chamando Puter.JS AI...");
            
             console.log("Prompt enviado (primeiros 200 chars):", prompt.substring(0, 200) + (prompt.length > 200 ? "..." : ""));

            const executeAIChat = () => {
                if (!window.puter || !window.puter.ai || typeof window.puter.ai.chat !== 'function') {
                     
                     console.log("Puter.JS não encontrado, tentando carregar...");
                     const s = document.createElement('script');
                     s.src = 'https://js.puter.com/v2/';
                     s.onload = () => {
                         console.log("Puter.JS carregado dinamicamente com sucesso.");
                         if (window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
                             setTimeout(executeAIChat, 100); 
                         } else {
                             reject(new Error("Puter.JS carregado, mas puter.ai.chat ainda não está disponível."));
                         }
                     };
                     s.onerror = (err) => {
                         console.error("Falha ao carregar Puter.JS dinamicamente:", err);
                         reject(new Error("Não foi possível carregar o script do Puter.JS."));
                     };
                     document.body.appendChild(s);
                     return; 
                }

                 
                puter.ai.chat(prompt)
                    .then(response => {
                        console.log("Puter.JS AI respondeu (raw):", response);
                        let resultText = null;
                        if (typeof response === 'object' && response !== null) {
                            if (typeof response.message === 'object' && response.message !== null && typeof response.message.content === 'string') {
                                resultText = response.message.content;
                                console.log("Texto extraído com sucesso de response.message.content.");
                            } else if (typeof response.content === 'string') {
                                resultText = response.content;
                                console.log("Texto extraído com sucesso de response.content.");
                            } else if (typeof response.message === 'string') {
                                resultText = response.message;
                                console.log("Texto extraído com sucesso de response.message (string).");
                            }
                        } else if (typeof response === 'string') {
                            resultText = response;
                            console.log("A resposta da IA já era uma string.");
                        }

                        if (resultText !== null) {
                            resolve(resultText.trim());
                        } else {
                            console.error("Não foi possível extrair texto da resposta da IA (estrutura inesperada):", response);
                            reject(new Error("Formato de resposta da IA inesperado ou sem conteúdo textual."));
                        }
                    })
                    .catch(error => {
                        console.error("Erro ao chamar Puter.JS AI:", error);
                        reject(new Error(`Erro na chamada da IA: ${error.message || error}`));
                    });
            };

            
             if (window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
                 console.log("Puter.JS já carregado.");
                 executeAIChat();
             } else {
                 
                 executeAIChat();
             }
        });
    }

    function removeOverlay(elementOrId) {
        
        if (aiStatusIntervalId) {
            clearInterval(aiStatusIntervalId);
            aiStatusIntervalId = null;
            
        }

        let overlayElement = null;
        if (typeof elementOrId === 'string') {
            overlayElement = document.getElementById(elementOrId);
        } else if (elementOrId instanceof HTMLElement) {
            overlayElement = elementOrId;
        }

        if (overlayElement && document.body.contains(overlayElement)) {
            
            const contentBox = overlayElement.querySelector('.bmAdvSplashContent, .bmDialogBox, .bmContextMenu, .bmAIGenResultPopupContent, #bmWritingSplashContent');

            
            overlayElement.style.transition = 'opacity 0.4s ease-out';
            overlayElement.style.opacity = '0';

            
            if (contentBox) {
                contentBox.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-in';
                contentBox.style.opacity = '0';
                contentBox.style.transform = 'scale(0.9)';
            }

            
            setTimeout(() => {
                if (overlayElement && document.body.contains(overlayElement)) {
                    document.body.removeChild(overlayElement);
                    
                }
            }, 400); 
        }
    }


    async function showAIReviewOverlayStyled() {
        
         return new Promise((resolve) => { const overlayId = 'bmAIReviewSplash'; removeOverlay(overlayId); const overlay = document.createElement('div'); overlay.id = overlayId; overlay.style.cssText = ` position: fixed; inset: 0; background: #0a0514; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100001; opacity: 0; transition: opacity 0.5s ease-out; font-family: 'Segoe UI', sans-serif; color: #eee; overflow: hidden; `; overlay.innerHTML = ` <div id="bmAIReviewContent" class="bmAdvSplashContent" style="opacity:0; transform: scale(0.9) rotateY(10deg); transition: opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s;"> <h2 style="font-size: 2em; margin-bottom: 20px;">Revisão Final pela IA</h2> <p style="font-size: 1.1em; line-height: 1.6; color: #ccc; margin-bottom: 30px;"> Ótimo! Você terminou as etapas.<br> Deseja que uma IA dê uma última vistoria no texto? </p> <div class="bmAdvActionButtons" style="border-top: none; padding-top: 15px;"> <button id="bmAINoBtn" class="bmAdvActionButton skip">Não</button> <button id="bmAIYesBtn" class="bmAdvActionButton manual">Sim</button> </div> </div>`; document.body.appendChild(overlay); void overlay.offsetWidth; overlay.style.opacity = '1'; const contentBox = overlay.querySelector('#bmAIReviewContent'); if(contentBox){ contentBox.style.opacity = '1'; contentBox.style.transform = 'scale(1) rotateY(0deg)'; } document.getElementById('bmAIYesBtn').onclick = () => { resolve(true); removeOverlay(overlay); }; document.getElementById('bmAINoBtn').onclick = () => { resolve(false); removeOverlay(overlay); }; });
    }

    function showAILoadingOverlayStyled(initialMessage = "Processando IA...") {
        
         const overlayId = 'bmAILoadingSplash'; removeOverlay(overlayId); const overlay = document.createElement('div'); overlay.id = overlayId; overlay.style.cssText = ` position: fixed; inset: 0; background: #0a0514; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100002; opacity: 0; transition: opacity 0.4s ease-in; font-family: 'Segoe UI', sans-serif; color: #eee; overflow: hidden; `; overlay.innerHTML = ` <div id="bmAILoadingContent" class="bmAdvSplashContent" style="padding: 40px 50px; opacity:0; transform: scale(0.9); transition: opacity 0.4s ease-out 0.1s, transform 0.4s ease-out 0.1s;"> <div class="bmAdvLoadingState" style="display: flex; flex-direction: column; position: static; background: none; backdrop-filter: none; border-radius: 0;"> <div class="spinner" style="width: 45px; height: 45px; border-width: 5px; margin-bottom: 20px;"></div> <div class="applying-text" style="font-size: 1.4em; margin-bottom: 25px;">${initialMessage}</div> <div class="bmProgressBarContainer" style="width: 80%; height: 10px; background-color: rgba(255, 255, 255, 0.1); border-radius: 5px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.4);"> <div class="bmProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #b37ffc, #f0dfff); border-radius: 5px; transition: width 0.4s ease-out;"></div> </div> </div> </div>`; document.body.appendChild(overlay); void overlay.offsetWidth; overlay.style.opacity = '1'; const contentBox = overlay.querySelector('#bmAILoadingContent'); if(contentBox){ contentBox.style.opacity = '1'; contentBox.style.transform = 'scale(1)'; } return { overlayElement: overlay, statusTextElement: overlay.querySelector('.applying-text'), progressBarElement: overlay.querySelector('.bmProgressBar') };
    }

    function updateAIProgressBar(progressBarElement, targetPercentage) {
        
         if (progressBarElement) { const clampedPercentage = Math.max(0, Math.min(100, targetPercentage)); progressBarElement.style.width = `${clampedPercentage}%`; }
    }

    

    function extractPageContext() {
        console.log("Iniciando extração de contexto da página...");
        let context = "";
        
        const contentArea = document.querySelector('.jss6');
        const baseElement = contentArea || document.body; 

        if (!contentArea) {
            console.warn("Área de conteúdo principal (jss6) não encontrada para extrair contexto. Buscando no body.");
        }

        
        const getNextRelevantSiblingText = (element) => {
            let sibling = element.nextElementSibling;
            while (sibling) {
                
                if (sibling.tagName === 'HR') return null;
                 if ((sibling.tagName === 'P' || sibling.tagName === 'DIV') && (sibling.innerText || sibling.textContent || '').trim()) {
                     
                     if (element.textContent.toUpperCase().includes('PROPOSTA')) {
                         const qlEditor = sibling.classList.contains('ql-editor') ? sibling : sibling.querySelector('.ql-editor');
                         if (qlEditor) return (qlEditor.innerText || qlEditor.textContent).trim();
                     }
                     
                     if (element.textContent.toUpperCase().includes('TOKEN')) {
                          const boldEl = sibling.querySelector('b');
                          if (boldEl) return boldEl.textContent.trim();
                     }
                     
                     return (sibling.innerText || sibling.textContent).trim();
                 }
                 sibling = sibling.nextElementSibling;
            }
            return null; 
        };

         
        const getSupportTexts = (element) => {
            let sibling = element.nextElementSibling;
            let supportText = "";
            let inSupportSection = false;
             while(sibling && sibling.tagName !== 'HR') { 
                 
                 if (sibling.tagName === 'DIV' && sibling.style.marginTop === '15px' && sibling.style.overflowWrap === 'break-word') {
                     inSupportSection = true;
                 }
                 
                 if (inSupportSection) {
                     const textDivs = sibling.querySelectorAll('div[style*="text-align: justify"]');
                     textDivs.forEach(div => {
                         supportText += `- ${div.textContent.trim()}\n`;
                     });
                      
                      if (textDivs.length === 0 && (sibling.innerText || sibling.textContent).trim()) {
                           supportText += `- ${sibling.textContent.trim()}\n`;
                      }
                 }
                  sibling = sibling.nextElementSibling;
             }
             return supportText.trim() || null;
        }

        
        const contextMap = {
            "GÊNERO TEXTUAL": null,
            "TEMA": null,
            "PROPOSTA": null,
            "TEXTOS DE APOIO": null
        };
        const headers = baseElement.querySelectorAll('h3[style*="color: var(--blue-light)"], h6[style*="color: var(--blue-light)"]');
        let foundDetailedProposal = false; 

        headers.forEach(h => {
            const headerText = h.textContent.trim().toUpperCase();
            
            if (headerText.includes("GÊNERO TEXTUAL") && !contextMap["GÊNERO TEXTUAL"]) {
                contextMap["GÊNERO TEXTUAL"] = getNextRelevantSiblingText(h);
            } else if (headerText.includes("TEMA") && !contextMap["TEMA"]) {
                contextMap["TEMA"] = getNextRelevantSiblingText(h);
            } else if (headerText.includes("PROPOSTA") && !foundDetailedProposal) {
                contextMap["PROPOSTA"] = getNextRelevantSiblingText(h); 
                if (contextMap["PROPOSTA"] && contextMap["PROPOSTA"].length > 100) { 
                    foundDetailedProposal = true;
                     console.log("Proposta detalhada encontrada.");
                }
            } else if (headerText.includes("TEXTOS DE APOIO") && !contextMap["TEXTOS DE APOIO"]) {
                 contextMap["TEXTOS DE APOIO"] = getSupportTexts(h);
            }
        });

        
        let formattedContext = "--- CONTEXTO DA PÁGINA ---\n";
        let foundAnyContext = false;
        for (const key in contextMap) {
            if (contextMap[key]) {
                const label = key === "PROPOSTA" ? "PROPOSTA DETALHADA" : key; 
                formattedContext += `${label}:\n${contextMap[key]}\n\n`;
                foundAnyContext = true;
            }
        }
        formattedContext += "--- FIM DO CONTEXTO ---";

        if (foundAnyContext) {
            console.log("Contexto extraído com sucesso.");
            
            return formattedContext;
        } else {
            console.error("Não foi possível extrair informações de contexto relevantes da página.");
            return null;
        }
    }

    async function showAIGenerationResult(generatedText, promptUsed) {
        return new Promise((resolve) => {
            const overlayId = 'bmAIGenResultPopup';
            removeOverlay(overlayId);

            aiGenResultPopupEl = document.createElement('div');
            aiGenResultPopupEl.id = overlayId;
            aiGenResultPopupEl.className = 'bmDialogOverlay';
            aiGenResultPopupEl.style.zIndex = '100003';

            const popupBox = document.createElement('div');
            popupBox.className = 'bmDialogBox bmAIGenResultPopupContent';
            popupBox.style.minWidth = '500px';
            popupBox.style.maxWidth = '80vw';
            popupBox.style.maxHeight = '85vh';
            popupBox.style.display = 'flex';
            popupBox.style.flexDirection = 'column';

            popupBox.innerHTML = `
                <h2 style="font-size: 1.6em; margin-bottom: 15px; color: #e0cffc;">Texto Gerado pela IA</h2>
                <textarea id="bmAIGenResultText" readonly style="width: 100%; min-height: 250px; height: 40vh; margin-bottom: 25px; background: #2a2a2e; color: #e8e8e8; border: 1px solid #555; border-radius: 8px; padding: 12px; font-size: 0.95em; resize: vertical; box-sizing: border-box; font-family: Consolas, Monaco, monospace;"></textarea>
                <div class="bmDialogButtonContainer" style="gap: 12px; margin-top: 10px;">
                    <button id="bmAIGenWriteBtn" class="bmDialogButton">Escrever</button>
                    <button id="bmAIGenRegenBtn" class="bmDialogButton secondary">Regenerar</button>
                    <button id="bmAIGenAbandonBtn" class="bmDialogButton secondary">Abandonar</button>
                </div>
            `;

            aiGenResultPopupEl.appendChild(popupBox);
            document.body.appendChild(aiGenResultPopupEl);

            const textArea = aiGenResultPopupEl.querySelector('#bmAIGenResultText');
            textArea.value = generatedText;

            void popupBox.offsetWidth;
            aiGenResultPopupEl.classList.add('bmDialogFadeIn');
            popupBox.classList.add('bmDialogEnter');

            document.getElementById('bmAIGenWriteBtn').onclick = () => {
                removeOverlay(aiGenResultPopupEl);
                resolve({ action: 'write', text: generatedText }); 
            };
            document.getElementById('bmAIGenRegenBtn').onclick = () => {
                removeOverlay(aiGenResultPopupEl);
                resolve({ action: 'regenerate', prompt: promptUsed });
            };
            document.getElementById('bmAIGenAbandonBtn').onclick = () => {
                removeOverlay(aiGenResultPopupEl);
                resolve({ action: 'abandon' });
            };
        });
    }

    /**
     * Mostra o splash "Escrevendo..." com efeito soundwave
     */
     function showWritingSplash() {
         const overlayId = 'bmWritingSplash';
         removeOverlay(overlayId); 

         const overlay = document.createElement('div');
         overlay.id = overlayId;
         overlay.style.cssText = `
             position: fixed;
             inset: 0;
             background: #0a0514; /* Fundo escuro base */
             display: flex;
             flex-direction: column;
             align-items: center;
             justify-content: center;
             z-index: 100004; /* Acima de outros popups normais */
             opacity: 0;
             transition: opacity 0.5s ease-out;
             font-family: 'Segoe UI', sans-serif;
             color: #eee;
             overflow: hidden;
         `;

         overlay.innerHTML = `
             <div id="bmWritingSplashContent" style="position: relative; text-align: center; opacity:0; transform: scale(0.9); transition: opacity 0.4s ease-out 0.1s, transform 0.4s ease-out 0.1s;">
                 <div class="soundwave-container">
                     ${Array.from({ length: 15 }).map((_, i) => `<div class="wave-bar" style="animation-delay: ${Math.random() * 0.5}s;"></div>`).join('')}
                 </div>
                 <h2 style="font-size: 1.8em; margin-top: 40px; color: #e0cffc; text-shadow: 0 0 10px rgba(160, 86, 247, 0.6);">
                     Deixando tudo pronto para você...
                 </h2>
             </div>
         `;

         document.body.appendChild(overlay);
         void overlay.offsetWidth; 
         overlay.style.opacity = '1'; 
         const contentBox = overlay.querySelector('#bmWritingSplashContent');
         if(contentBox){ contentBox.style.opacity = '1'; contentBox.style.transform = 'scale(1)'; }

         
         return overlay;
     }


    async function handleAIGenerationRequest(isRegeneration = false, promptToUse = null) { 
        console.log(isRegeneration ? "Requisição para REgerar texto com IA recebida." : "Requisição para gerar texto com IA recebida.");
        removeOverlay(contextMenuEl); 

        if (!isRegeneration) { 
            const confirm = await showCustomAlert(
                "A IA gerará um texto automaticamente pra você.<br>É um processo que pode demorar de 1 a 2 minutos.<br><br><b>Prosseguir?</b>",
                'question',
                [
                    { text: 'Não', value: false, class: 'secondary' },
                    { text: 'Sim', value: true }
                ],
                'bmAIGenConfirmDialog'
            );
             removeOverlay('bmAIGenConfirmDialog');

            if (!confirm) {
                console.log("Geração de texto cancelada pelo usuário.");
                return;
            }
        }

        console.log("Usuário confirmou (ou é regeneração). Iniciando...");
        let loadingUIData = null;
        if (!isRegeneration) { 
             loadingUIData = showAILoadingOverlayStyled("Extraindo contexto da página...");
             updateAIProgressBar(loadingUIData.progressBarElement, 10);
         } else {
             loadingUIData = showAILoadingOverlayStyled("Regenerando texto com a IA...");
             updateAIProgressBar(loadingUIData.progressBarElement, 30);
         }


        try {
            let currentPrompt;
            if (isRegeneration && promptToUse) {
                currentPrompt = promptToUse;
                 if (loadingUIData?.statusTextElement) loadingUIData.statusTextElement.textContent = "Enviando prompt para IA...";
                 updateAIProgressBar(loadingUIData.progressBarElement, 40);
                 await new Promise(r => setTimeout(r, 300));
            } else {
                const pageContext = extractPageContext();
                if (!pageContext) {
                    throw new Error("Não foi possível extrair o contexto necessário da página.");
                }
                updateAIProgressBar(loadingUIData.progressBarElement, 25);
                if (loadingUIData.statusTextElement) loadingUIData.statusTextElement.textContent = "Construindo prompt para IA...";
                await new Promise(r => setTimeout(r, 500));

                currentPrompt = `Crie uma redação, e envie somente ela, sem título, sem textos adicionais, sem NADA a mais. Somente o texto da redação entre ${AI_GENERATION_MIN_WORDS} palavras (no minimo) e ${AI_GENERATION_MAX_WORDS} palavras (no maximo).\n\n${pageContext}`;
                lastAIGenerationPrompt = currentPrompt; 

                if (loadingUIData.statusTextElement) loadingUIData.statusTextElement.textContent = "Comunicando com a IA...";
                updateAIProgressBar(loadingUIData.progressBarElement, 40);
            }


            const generatedText = await callPuterAI(currentPrompt);
            updateAIProgressBar(loadingUIData.progressBarElement, 100);
            removeOverlay(loadingUIData.overlayElement);

            console.log("Texto gerado/regenerado pela IA recebido.");

            const userChoice = await showAIGenerationResult(generatedText, currentPrompt);

            
            if (userChoice.action === 'write') {
                console.log("Usuário escolheu 'Escrever'. Verificando target...");

const TARGET_TEXTAREA_SELECTOR = 'textarea#outlined-multiline-static[class*="jss"]'; 
const targetTextarea = document.querySelector(TARGET_TEXTAREA_SELECTOR);

if (targetTextarea && document.body.contains(targetTextarea)) {
    
    const writeMode = await showCustomAlert(
        "Como você deseja inserir o texto gerado?",
        'question',
        [
            { text: 'Cancelar', value: 'cancel', class: 'secondary' },
            { text: 'Escrever no final do texto', value: 'append' },
            { text: 'Substituir o texto atual', value: 'replace' }
        ],
        'bmAIWriteModeDialog'
    );
     removeOverlay('bmAIWriteModeDialog');

    if (writeMode === 'replace') {
        console.log("Usuário escolheu: Substituir texto.");
        
        showWritingSplash();

        
        const cleared = await clearTextareaSimulated(targetTextarea);
        if (!cleared) {
            console.error("Falha ao limpar a textarea antes de substituir.");
            removeOverlay('bmWritingSplash'); 
            showCustomAlert("Erro: Não foi possível limpar a área de texto antes de escrever.", 'error');
            return; 
        }

        activeEl = targetTextarea; 
        const writeSuccess = await typeTextFast(userChoice.text, targetTextarea);

        
        removeOverlay('bmWritingSplash');

        if (writeSuccess) {
            showCustomAlert("Texto gerado pela IA foi escrito (substituindo o anterior)!", 'success');
        } else {
            showCustomAlert("Erro ao tentar escrever o texto substituído.", 'error');
        }

    } else if (writeMode === 'append') {
        console.log("Usuário escolheu: Escrever no final.");
        const writingSplashOverlay = showWritingSplash(); 
        let appendSuccess = false;
        try {
             const currentText = targetTextarea.value;
             const separator = currentText.trim().length > 0 ? "\n\n" : "";
             const newText = currentText + separator + userChoice.text;
    
             targetTextarea.focus({ preventScroll: true });
             await new Promise(r => setTimeout(r, 50)); 
    
             const prototype = Object.getPrototypeOf(targetTextarea);
             const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
             if (valueSetter) {
                  valueSetter.call(targetTextarea, newText);
             } else {
                  targetTextarea.value = newText; 
             }
    
             targetTextarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, composed: true }));
             targetTextarea.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    
             targetTextarea.scrollTop = targetTextarea.scrollHeight;
             targetTextarea.selectionStart = newText.length;
             targetTextarea.selectionEnd = newText.length;
    
             appendSuccess = true;
             console.log("Texto da IA anexado com sucesso.");
    
        } catch (error) {
             console.error("Erro ao anexar texto da IA:", error);
        }
        removeOverlay(writingSplashOverlay); 
    
        if (appendSuccess) {
             showCustomAlert("Texto gerado pela IA foi adicionado ao final!", 'success');
        } else {
             showCustomAlert("Erro ao tentar anexar o texto gerado.", 'error');
        }

    } else { 
        console.log("Usuário cancelou a escrita do texto da IA.");
    }

} else {
    console.error("Textarea principal da página não encontrada para escrever o texto gerado.");
    showCustomAlert("Erro: Não foi possível encontrar a área de texto principal na página para escrever.", 'error');
}

            
            } else if (userChoice.action === 'regenerate') {
                console.log("Usuário escolheu 'Regenerar'.");
                
                await handleAIGenerationRequest(true, userChoice.prompt);
            } else { 
                console.log("Usuário escolheu 'Abandonar'.");
                lastAIGenerationPrompt = null; 
            }

        } catch (error) {
            console.error("Erro durante o processo de geração de texto AI:", error);
            removeOverlay(loadingUIData?.overlayElement);
            showCustomAlert(`Erro ao gerar texto: ${error.message}`, 'error');
            lastAIGenerationPrompt = null; 
        }
    }


    
    const splash = document.createElement('div');
    splash.id = 'bmSplash';
    splash.innerHTML = `<div id="bmSplashContent"><img id="bmSplashImg" src="https://i.imgur.com/RUWcJ6e.png"/> <div id="bmSplashTexts"> <div id="bmSplashTitle">Paraná Tools</div> <div id="bmSplashSubtitle">Redação Paraná</div> </div> <div id="bmLoadingBar"><div id="bmLoadingProgress"></div></div> </div> <div id="bmSplashBgEffect"></div><div class="bmSplashGrid"></div>`;
    document.body.appendChild(splash);

    
    const css = `
        /* Estilos da Interface do Script (Splash, Dialogs, UI Principal) */
        /* ... (Todos os estilos CSS anteriores aqui, sem alterações) ... */
        #bmSplashBgEffect { position: absolute; inset: 0; overflow: hidden; z-index: 1; background: radial-gradient(circle, #3a205f 0%, #0a0514 80%); opacity: 0; animation: bgSplashEnterFast 3.5s ease-out forwards; } @keyframes bgSplashEnterFast { 0% { opacity: 0; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } } .bmSplashGrid { position: absolute; inset: -200px; z-index: 2; background-image: linear-gradient(rgba(138, 43, 226, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(138, 43, 226, 0.07) 1px, transparent 1px); background-size: 55px 55px; opacity: 0; animation: gridFadeMoveFast 4s ease-out forwards 0.1s; } @keyframes gridFadeMoveFast { 0% { opacity: 0; background-position: 0 0; } 50% { opacity: 0.5; } 100% { opacity: 0.3; background-position: -110px -110px; } } #bmSplash { position: fixed; inset: 0; background:transparent; display:flex; align-items:center; justify-content:center; z-index:99999; overflow:hidden; animation: splashHideFast 0.6s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards 3.5s; } #bmSplashContent { z-index: 3; display:flex; flex-direction:column; align-items:center; justify-content:center; perspective: 1000px; } #bmSplashImg { width:170px; margin-bottom: 20px; filter: drop-shadow(0 7px 28px rgba(160, 86, 247, 0.75)); opacity: 0; transform: scale(0.6) rotateZ(-45deg) translateY(60px); animation: logoSuperEntryFast 1.6s cubic-bezier(0.175, 0.885, 0.32, 1.3) forwards 0.3s, logoFloatBob 2s ease-in-out infinite alternate 2s; } @keyframes logoSuperEntryFast { 0% { opacity: 0.5; transform: scale(0.6) rotateZ(-45deg) translateY(60px); } 60% { opacity: 1; transform: scale(1.18) rotateZ(15deg) translateY(0px); } 80% { transform: scale(0.96) rotateZ(-8deg); } 100% { opacity: 1; transform: scale(1) rotateZ(0deg); } } @keyframes logoFloatBob { from { transform: translateY(0px) scale(1); filter: drop-shadow(0 7px 28px rgba(160, 86, 247, 0.75)); } to { transform: translateY(-7px) scale(1.02); filter: drop-shadow(0 11px 33px rgba(160, 86, 247, 0.85)); } } #bmSplashTexts { opacity: 0; transform: translateY(25px) scale(0.9); animation: textsSuperAppearFast 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards 1.8s; text-align: center; } #bmSplashTitle { font-size: 2.7em; font-weight: 900; letter-spacing: 1px; margin-bottom: 4px; font-family:'Segoe UI Black', Arial, sans-serif; color:#fff; text-shadow: 0 0 12px rgba(220, 180, 255, 0.8); background: linear-gradient(45deg, #e0cffc, #b37ffc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; } #bmSplashSubtitle { font-size: 1.4em; font-weight: 300; color: #e5d9ff; font-family:'Segoe UI Light', Arial, sans-serif; letter-spacing: 0.8px; animation: subtitleGlow 2s ease-in-out infinite alternate 2.5s; } @keyframes textsSuperAppearFast { to { opacity: 1; transform: translateY(0) scale(1); } } @keyframes subtitleGlow { from { opacity: 0.8; } to { opacity: 1; text-shadow: 0 0 7px rgba(220, 180, 255, 0.7); } } #bmLoadingBar { width: 250px; height: 7px; background-color: rgba(255, 255, 255, 0.1); border-radius: 3.5px; margin-top: 35px; overflow: hidden; opacity: 0; transform: scaleX(0); animation: barSuperAppear 0.6s ease-out forwards 2.8s; box-shadow: inset 0 1px 2px rgba(0,0,0,0.3); } #bmLoadingProgress { width: 0%; height: 100%; background: linear-gradient(90deg, #b37ffc, #f0dfff); border-radius: 3.5px; animation: loadingAnimFinalFast 0.8s cubic-bezier(0.65, 0.05, 0.36, 1) forwards 3.0s; position: relative; overflow: hidden;} #bmLoadingProgress::after { content: ''; position: absolute; top: 0; left: -50%; width: 50%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%); transform: skewX(-25deg); animation: shimmer 1.2s infinite; animation-delay: 3.2s;} @keyframes barSuperAppear { to { opacity: 1; transform: scaleX(1); } } @keyframes loadingAnimFinalFast { from { width: 0%; } to { width: 100%; } } @keyframes shimmer { 0% { left: -70%; } 100% { left: 120%; } } @keyframes splashHideFast { from { opacity: 1; } to { opacity: 0; visibility: hidden; } }
        .bmDialogOverlay { position: fixed; inset: 0; background: rgba(10, 5, 20, 0.8); backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px); display: flex; align-items: center; justify-content: center; z-index: 100001; opacity: 0; pointer-events: none; transition: opacity 0.4s ease-out; } .bmDialogOverlay.bmDialogFadeIn { opacity: 1; pointer-events: auto; } .bmDialogOverlay.bmDialogFadeOut { opacity: 0; pointer-events: none; } .bmDialogBox { background: linear-gradient(150deg, #333338, #212124); color: #fff; padding: 35px 45px 40px 45px; border-radius: 14px; border: 1px solid #555a60; box-shadow: 0 15px 50px rgba(0, 0, 0, 0.85); min-width: 340px; max-width: 520px; text-align: center; font-family: 'Segoe UI', sans-serif; opacity: 0; transform: scale(0.75) translateY(-35px) rotateX(-25deg); transition: opacity 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275); } .bmDialogBox.bmDialogEnter { opacity: 1; transform: scale(1) translateY(0) rotateX(0deg); } .bmDialogBox.bmDialogExit { opacity: 0; transform: scale(0.9) translateY(20px) rotateX(15deg); } .bmDialogIcon { width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 22px auto; display: flex; align-items: center; justify-content: center; font-size: 1.8em; font-weight: bold; color: #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.5); animation: iconPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s backwards; } @keyframes iconPopIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } } .bmDialogIcon.info { background: linear-gradient(135deg, #58a6ff, #3c8ce7); } .bmDialogIcon.success { background: linear-gradient(135deg, #56d364, #2ea043); } .bmDialogIcon.warning { background: linear-gradient(135deg, #f1c40f, #d4ac0d); color: #333; } .bmDialogIcon.error { background: linear-gradient(135deg, #e74c3c, #c0392b); } .bmDialogIcon.question { background: linear-gradient(135deg, #8e44ad, #9b59b6); } .bmDialogMessage { font-size: 1.2em; line-height: 1.65; margin: 0 0 35px 0; color: #eee; } .bmDialogButtonContainer { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; } .bmDialogButton { padding: 12px 30px; font-size: 1em; font-weight: bold; background: linear-gradient(145deg, #9a3bf6, #7022b6); border: none; border-radius:9px; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.4); cursor:pointer; transition: all 0.15s ease-out; box-shadow: 0 4px 9px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15); letter-spacing: 0.5px; } .bmDialogButton:hover { filter: brightness(1.25) saturate(1.2); transform: translateY(-2px) scale(1.03); box-shadow: 0 7px 14px rgba(138, 43, 226, 0.5), inset 0 1px 1px rgba(255,255,255,0.25); } .bmDialogButton:active { transform: translateY(0px) scale(0.98); filter: brightness(0.9); box-shadow: 0 2px 5px rgba(138, 43, 226, 0.4), inset 0 1px 2px rgba(0,0,0,0.2); } .bmDialogButton.secondary { background: linear-gradient(145deg, #777, #555); } .bmDialogButton.secondary:hover { filter: brightness(1.15); box-shadow: 0 7px 14px rgba(100, 100, 100, 0.4), inset 0 1px 1px rgba(255,255,255,0.15); } .bmDialogButton.secondary:active { filter: brightness(0.9); box-shadow: 0 2px 5px rgba(100, 100, 100, 0.3), inset 0 1px 2px rgba(0,0,0,0.2); }
        #bmWrapper { position:fixed; top:15px; right:15px; width: ${MIN_WRAPPER_WIDTH}px; min-width: ${MIN_WRAPPER_WIDTH}px; border:1px solid #555; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.8); font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#f0f0f0; opacity:0; transform: perspective(900px) translateX(80px) rotateY(-30deg) scale(0.9); transition:opacity 0.7s cubic-bezier(0.165, 0.84, 0.44, 1), transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1), background 0.3s ease, border-color 0.3s ease, color 0.3s ease; z-index:99998; overflow: hidden; background: linear-gradient(155deg, #2a2a2f, #1a1a1d); } #bmWrapper.show { opacity:1; transform: perspective(900px) translateX(0) rotateY(0deg) scale(1); } #bmWrapper > div:not(#bmResizeHandle) { border-radius: inherit; overflow: hidden; } #bmHeader { cursor:move; padding: 8px 12px; background: rgba(12, 12, 14, 0.9); backdrop-filter: blur(7px); border-bottom:1px solid #555; font-size: 0.95em; font-weight: 600; text-align:center; border-radius:12px 12px 0 0; user-select: none; position: relative; display: flex; align-items: center; justify-content: center; transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease; } #bmHeader span:not(#bmMinimizeBtn) { flex-grow: 1; text-align: center; color: #f5f5f5; text-shadow: 0 1px 1px rgba(0,0,0,0.6); } #bmMinimizeBtn { font-size: 1.5em; font-weight: bold; color: #bbb; cursor: pointer; padding: 0 6px; line-height: 1; transition: color 0.2s ease, transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275); user-select: none; margin-left: auto; transform: translateY(-1px) rotate(0deg); } #bmMinimizeBtn:hover { color: #fff; transform: translateY(-1px) scale(1.2) rotate(180deg); } #bmWrapper.minimized #bmMinimizeBtn { transform: translateY(-1px) rotate(180deg); } #bmWrapper.minimized #bmMinimizeBtn:hover { transform: translateY(-1px) scale(1.2) rotate(0deg); } #bmWrapper.minimized { height: auto !important; min-height: 0 !important; background: rgba(12, 12, 14, 0.95); border-color: #555; } #bmWrapper.minimized #bmContent { opacity: 0; padding-top: 0; padding-bottom: 0; max-height: 0; border-width: 0; margin: 0; overflow: hidden; } #bmWrapper.minimized #bmHeader { border-bottom: none; border-radius: 12px; } #bmContent { padding: 12px; background:rgba(40, 40, 45, 0.98); border-radius: 0 0 12px 12px; transition: opacity 0.3s ease-out, padding 0.3s ease-out, max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease; max-height: 450px; overflow-y: auto; overflow-x: hidden; } #bmContent textarea, #bmContent input[type="number"] { width:100%; margin-bottom:10px; padding:8px; font-size: 0.9em; font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; background:rgba(18, 18, 20, 0.9); border:1px solid #606066; border-radius:7px; color:#f8f8f8; box-sizing:border-box; resize: vertical; transition: all 0.3s ease; box-shadow: inset 0 2px 5px rgba(0,0,0,0.7); } #bmContent textarea { min-height: 60px; } #bmContent textarea:focus, #bmContent input[type="number"]:focus { outline:none; border-color: #c89bff; background-color: rgba(0,0,0,0.8); box-shadow: 0 0 0 4px rgba(199, 155, 255, 0.3), inset 0 2px 5px rgba(0,0,0,0.7); } #bmContent button { width:100%; padding:10px; margin-top: 6px; font-size:0.95em; font-weight: bold; background: linear-gradient(145deg, #a056f7, #7a2fd0); border: none; border-radius:8px; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.5); cursor:pointer; transition: all 0.1s ease-out; box-sizing: border-box; box-shadow: 0 4px 10px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.2); letter-spacing: 0.5px; } #bmContent button:disabled { cursor: not-allowed; opacity: 0.4; background: #555 !important; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4) !important; transform: none !important; color: #999; filter: grayscale(80%); } #bmContent button:not(:disabled):hover { filter: brightness(1.3) saturate(1.3); transform: translateY(-3px) scale(1.02); box-shadow: 0 9px 20px rgba(138, 43, 226, 0.6), inset 0 1px 1px rgba(255,255,255,0.3); } #bmContent button:not(:disabled):active { transform: translateY(0px) scale(0.97); filter: brightness(0.85); box-shadow: 0 2px 5px rgba(138, 43, 226, 0.5), inset 0 1px 3px rgba(0,0,0,0.3); } #bmToggleWrapper, #bmDarkModeToggleWrapper { display:flex; align-items:center; gap:8px; margin-bottom:10px; cursor: pointer; padding: 6px 8px; border-radius: 8px; transition: background-color 0.25s ease; } #bmToggleWrapper:hover, #bmDarkModeToggleWrapper:hover { background-color: rgba(138, 43, 226, 0.2); } #bmToggleImg, #bmDarkModeToggleImg { width:16px; height:16px; border:2px solid #a056f7; border-radius:5px; background:transparent; transition: all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; } #bmToggleImg.active::after, #bmDarkModeToggleImg.active::after { content: '✔'; position: absolute; font-size: 11px; color: #fff; text-shadow: 0 0 4px rgba(0,0,0,0.5); opacity: 0; transform: scale(0.5) rotate(-180deg); animation: checkSuperAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.1s; } #bmToggleImg.active, #bmDarkModeToggleImg.active { background: #a056f7; border-color: #c89bff; transform: rotate(10deg) scale(1.05); box-shadow: 0 0 8px rgba(160, 86, 247, 0.5); } @keyframes checkSuperAppear { to { opacity: 1; transform: scale(1) rotate(0deg); } } #bmToggleText, #bmDarkModeToggleText { font-size:0.9em; color:#f0f0f0; user-select:none; line-height: 1.2; font-weight: 500; transition: color 0.3s ease; } .bmCountdownNumber { position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); font-family: 'Segoe UI Black', sans-serif; color: #8A2BE2; font-size: 2.5em; opacity: 0; animation: countPopZoom 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; z-index: 10; text-shadow: 0 0 10px rgba(138, 43, 226, 0.7); } @keyframes countPopZoom { 0% { opacity: 0; transform: translateX(-50%) scale(0.5) rotate(-15deg); } 60% { opacity: 1; transform: translateX(-50%) scale(1.1) rotate(5deg); } 100% { opacity: 0; transform: translateX(-50%) scale(1) rotate(0deg); } }
        #bmOv { position:fixed;top:0;left:0; width:100%;height:100%; background:rgba(0,0,0,.9); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); display:flex;flex-direction:column; align-items:center;justify-content:center; z-index:100000; opacity: 0; animation: ovFadeInSmooth 0.5s ease-out forwards; } #bmOvContent { opacity: 0; transform: translateY(20px); animation: ovContentSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.3s; text-align: center; } #bmOv img { max-width:60%; max-height:45%; border-radius: 5px; box-shadow: 0 5px 15px rgba(0,0,0,0.4); } #bmOv p { color: #ddd; font-family: 'Segoe UI', sans-serif; text-align: center; margin-top: 20px; max-width: 400px; line-height: 1.5; } #bmOv button { margin-top:25px; padding: 10px 25px; font-size: 1em; background: #8A2BE2; border: none; border-radius: 5px; color: #fff; cursor: pointer; transition: background 0.2s ease, transform 0.15s ease; font-weight: bold; width: auto; } #bmOv button:hover { background:#7022b6; transform:scale(1.05); } #bmOv button:active { transform: scale(0.98); } @keyframes ovFadeInSmooth { from{opacity:0} to{opacity:1} } @keyframes ovContentSlideUp { from{opacity:0; transform: translateY(20px);} to{opacity:1; transform: translateY(0);} }
        /* --- MODO DISFARÇADO COM CORES DO SITE (AZUL) --- */
        #bmWrapper.stealth-mode { /* background: #e8f0fe;  Light blue-ish gray */ background: rgba(232, 240, 254, 0.95); /* Use RGBA for slight transparency */ backdrop-filter: blur(5px); /* Add blur for better integration */ -webkit-backdrop-filter: blur(5px); border: 1px solid var(--blue-light); color: #333; animation: none; /* Remove default animation */ box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3); /* Softer shadow */ }
        #bmWrapper.stealth-mode #bmHeader { background: var(--blue-light); border-color: var(--blue-light); color: #fff; /* White text on blue header */ text-shadow: 0 1px 1px rgba(0,0,0,0.3); backdrop-filter: none; /* Remove separate blur if wrapper has it */ }
        #bmWrapper.stealth-mode #bmContent { /* background: #f0f5ff; */ background: rgba(240, 245, 255, 0.9); /* Slightly darker blue-ish gray with transparency */ }
        #bmWrapper.stealth-mode textarea, #bmWrapper.stealth-mode input[type="number"] { background: #fff; /* White inputs */ border-color: #a0b0d0; /* Softer blue-gray border */ color: #222; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1); }
        #bmWrapper.stealth-mode textarea:focus, #bmWrapper.stealth-mode input[type="number"]:focus { border-color: var(--blue-light); background-color: #fff; /* Adjusted focus glow to use --blue-light */ box-shadow: 0 0 0 3px rgba(123, 83, 193, 0.2), inset 0 1px 2px rgba(0,0,0,0.1); }
        #bmWrapper.stealth-mode button { border: 1px solid var(--blue-light); color: #fff; /* White text */ background: var(--blue-light); /* Blue background */ box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Subtle shadow */ text-shadow: none; background-image: none; /* Remove gradient if any */ transition: all 0.15s ease-out; /* Ensure smooth transition */ }
        #bmWrapper.stealth-mode button:disabled { border-color: #a0b0d0; color: #99aacc; /* Lighter blue-gray disabled text */ background: #d0d8ea !important; /* Lighter blue-gray disabled background */ opacity: 0.7; box-shadow: inset 0 1px 2px rgba(0,0,0,0.2) !important; cursor: not-allowed; transform: none !important; }
        #bmWrapper.stealth-mode button:not(:disabled):hover { /* Use filter for hover effect - adjust brightness/saturate */ filter: brightness(1.15) saturate(1.1); color: #fff; border-color: var(--blue-light); /* Keep border color */ box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25); transform: translateY(-1px); }
        #bmWrapper.stealth-mode button:not(:disabled):active { /* Use filter for active effect */ filter: brightness(0.9); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); transform: translateY(0px) scale(0.99); }
        /* Adjust toggles for stealth mode */
        #bmWrapper.stealth-mode #bmToggleWrapper:hover, #bmWrapper.stealth-mode #bmDarkModeToggleWrapper:hover { /* Use rgba derived from --blue-light */ background-color: rgba(123, 83, 193, 0.1); }
        #bmWrapper.stealth-mode #bmToggleImg, #bmWrapper.stealth-mode #bmDarkModeToggleImg { border-color: #88aadd; /* Medium blue-gray border */ }
        #bmWrapper.stealth-mode #bmToggleImg.active, #bmWrapper.stealth-mode #bmDarkModeToggleImg.active { background: var(--blue-light); /* Blue active background */ border-color: var(--blue-light); transform: scale(1); /* Keep scale normal */ box-shadow: 0 0 6px rgba(123, 83, 193, 0.4); /* Add glow */ }
        #bmWrapper.stealth-mode #bmToggleImg.active::after, #bmWrapper.stealth-mode #bmDarkModeToggleImg.active::after { color: #fff; /* White checkmark */ }
        #bmWrapper.stealth-mode #bmToggleText, #bmWrapper.stealth-mode #bmDarkModeToggleText { color: #335a8a; /* Darker blue text */ }
        #bmWrapper.stealth-mode.minimized #bmHeader { background: var(--blue-light); /* Ensure minimized header is also blue */ border-radius: 12px; /* Ensure border radius is kept when minimized */ }
        /* --- FIM ESTILOS MODO DISFARÇADO --- */
        /* SPLASH CORREÇÃO AVANÇADA */
        #bmAdvCorrectionSplash { position: fixed; inset: 0; background: radial-gradient(circle at 50% 0%, #3a205f 0%, #0a0514 70%); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100000; opacity: 0; transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); font-family: 'Segoe UI', sans-serif; color: #eee; overflow: hidden; perspective: 1200px; } #bmAdvCorrectionSplash::before { content: ''; position: absolute; inset: -250px; z-index: 1; background-image: linear-gradient(rgba(138, 43, 226, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(138, 43, 226, 0.04) 1px, transparent 1px); background-size: 60px 60px; animation: gridFadeMoveAdvCorrection 15s linear infinite alternate; } @keyframes gridFadeMoveAdvCorrection { 0% { background-position: 0 0; opacity: 0; } 50% { opacity: 0.5; } 100% { background-position: -120px -120px; opacity: 0; } } #bmAdvCorrectionSplash.visible { opacity: 1; } .bmAdvSplashContent { z-index: 2; text-align: center; padding: 30px; max-width: 800px; width: 90%; background: rgba(26, 26, 29, 0.8); border: 1px solid rgba(138, 43, 226, 0.3); border-radius: 18px; box-shadow: 0 10px 40px rgba(0,0,0,0.6), inset 0 0 15px rgba(138, 43, 226, 0.1); position: relative; } #bmAdvCorrectionSplash > .bmAdvSplashContent { transform: scale(0.9) rotateY(15deg); opacity: 0; animation: advSplashContentEntry 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s forwards; } @keyframes advSplashContentEntry { from { transform: scale(0.9) rotateY(15deg) translateY(20px); opacity: 0; } to { transform: scale(1) rotateY(0deg) translateY(0); opacity: 1; } } #bmAdvSplashContent h2 { font-size: 2.2em; font-weight: 700; color: #e0cffc; margin: 0 0 25px 0; text-shadow: 0 0 15px rgba(160, 86, 247, 0.8); } #bmAdvCorrectionSplash > .bmAdvSplashContent h2 { opacity: 0; transform: translateY(-15px); animation: advHeaderFadeSlideIn 0.7s ease-out 0.5s forwards, advPulseGlow 2.8s ease-in-out infinite alternate 1.2s; } @keyframes advHeaderFadeSlideIn { to { opacity: 1; transform: translateY(0); } } @keyframes advPulseGlow { from { opacity: 0.9; text-shadow: 0 0 15px rgba(160, 86, 247, 0.8); } to { opacity: 1; text-shadow: 0 0 20px rgba(200, 150, 255, 0.9); } } .bmAdvContextDisplay { font-family: 'Georgia', 'Times New Roman', serif; font-size: 1.3em; line-height: 1.7; color: #ccc; margin-bottom: 30px; padding: 18px 25px; background: rgba(0,0,0, 0.25); border-radius: 10px; border: 1px dashed rgba(255,255,255,0.15); opacity: 0; transform: scale(0.95); animation: advContextAppear 0.6s ease-out 0.8s forwards; transition: background-color 0.3s ease, opacity 0.3s ease, transform 0.3s ease; min-height: 5em; } .bmAdvContextDisplay:hover { background-color: rgba(0,0,0, 0.3); } @keyframes advContextAppear { to { opacity: 1; transform: scale(1); } } .bmAdvContextDisplay .error-word { display: inline-block; background: linear-gradient(120deg, rgba(231, 76, 60, 0.8), rgba(192, 57, 43, 0.9)); color: #fff; padding: 0.1em 0.3em; margin: -0.1em -0.3em; border-radius: 5px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.4); box-shadow: 0 2px 5px rgba(0,0,0,0.3); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s ease; } .bmAdvContextDisplay:hover .error-word { transform: scale(1.05) rotate(-1deg); background: linear-gradient(120deg, rgba(231, 76, 60, 0.9), rgba(192, 57, 43, 1)); } .bmAdvContextDisplay .context-before, .bmAdvContextDisplay .context-after { opacity: 0.7; transition: opacity 0.3s ease; } .bmAdvContextDisplay:hover .context-before, .bmAdvContextDisplay:hover .context-after { opacity: 0.9; } .bmAdvOptionsContainer { margin-top: 25px; opacity: 0; transform: translateY(20px); animation: advOptionsFadeSlideIn 0.7s ease-out 1.1s forwards; } @keyframes advOptionsFadeSlideIn { to { opacity: 1; transform: translateY(0); } } .bmAdvSuggestionButtons { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin-bottom: 25px; } .bmAdvSuggestionButton { padding: 10px 22px; font-size: 1.05em; font-weight: 600; background: linear-gradient(140deg, #4CAF50, #2E7D32); border: none; border-radius: 8px; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.4); cursor:pointer; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 5px 12px rgba(0,0,0,0.5); transform: scale(1); } .bmAdvSuggestionButton:hover { filter: brightness(1.2) saturate(1.1); transform: translateY(-4px) scale(1.05) rotate(-2deg); box-shadow: 0 9px 20px rgba(46, 125, 50, 0.5); } .bmAdvSuggestionButton:active { transform: translateY(0px) scale(0.96) rotate(1deg); filter: brightness(0.9); box-shadow: 0 2px 5px rgba(46, 125, 50, 0.4); } .bmAdvActionButtons { display: flex; justify-content: center; gap: 20px; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 25px; } .bmAdvActionButton { padding: 9px 25px; font-size: 0.95em; font-weight: bold; border: none; border-radius: 7px; color: #fff; cursor:pointer; transition: all 0.15s ease-out; box-shadow: 0 4px 8px rgba(0,0,0,0.4); letter-spacing: 0.5px; } .bmAdvActionButton.manual { background: linear-gradient(140deg, #f39c12, #d35400); } .bmAdvActionButton.manual:hover { filter: brightness(1.2); transform: translateY(-2px) scale(1.03); box-shadow: 0 7px 14px rgba(211, 84, 0, 0.4); } .bmAdvActionButton.manual:active { transform: translateY(0px) scale(0.98); filter: brightness(0.9); box-shadow: 0 2px 5px rgba(211, 84, 0, 0.3); } .bmAdvActionButton.skip { background: linear-gradient(140deg, #5D6D7E, #34495E); } .bmAdvActionButton.skip:hover { filter: brightness(1.15); transform: translateY(-2px) scale(1.03); box-shadow: 0 7px 14px rgba(52, 73, 94, 0.35); } .bmAdvActionButton.skip:active { transform: translateY(0px) scale(0.98); filter: brightness(0.9); box-shadow: 0 2px 5px rgba(52, 73, 94, 0.3); } .bmAdvLoadingState { display: none; flex-direction: column; align-items: center; justify-content: center; position: absolute; inset: 0; background: rgba(10, 5, 20, 0.85); backdrop-filter: blur(5px); border-radius: inherit; z-index: 10; transition: opacity 0.3s ease-in; } .bmAdvLoadingState .spinner { width: 50px; height: 50px; border: 6px solid rgba(255, 255, 255, 0.2); border-left-color: #a056f7; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 25px; } .bmAdvLoadingState .applying-text { font-size: 1.6em; color: #ddd; letter-spacing: 0.8px; animation: advPulseGlow 2s ease-in-out infinite alternate; } @keyframes spin { to { transform: rotate(360deg); } } @keyframes advButtonPopIn { from { opacity: 0; transform: scale(0.8) rotate(-15deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } } @keyframes advActionButtonSlideIn { from { opacity: 0; transform: translateX(var(--slide-direction, -20px)); } to { opacity: 1; transform: translateX(0); } } .bmAdvActionButton.manual { --slide-direction: -20px; } .bmAdvActionButton.skip { --slide-direction: 20px; }
        /* Animação entrada elementos UI Principal */
        .bmFadeInSlideUp { opacity: 0; transform: translateY(15px); animation: fadeInSlideUpItem 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; } @keyframes fadeInSlideUpItem { to { opacity: 1; transform: translateY(0); } }
        /* --- MODO ESCURO PÁGINA --- */
        body.bm-dark-mode { background-color: #121212 !important; color: #e0e0e0 !important; --white: #2b2b2b !important; --blue-light: #7b53c1 !important; --blue-dark: #e0e0e0 !important; --green: #5cb85c !important; }
        body.bm-dark-mode #root, body.bm-dark-mode main, body.bm-dark-mode section#main { background-color: inherit !important; color: inherit !important; }
        body.bm-dark-mode nav.sc-gEvEer.cJswIz { background-color: #1f1f1f !important; border-bottom: 1px solid #444; }
        body.bm-dark-mode .ddName p, body.bm-dark-mode #profile p { color: #e0e0e0 !important; }
        body.bm-dark-mode .MuiAvatar-root { background-color: #555 !important; color: #e0e0e0 !important; }
        body.bm-dark-mode .jss1 { background-color: transparent !important; color: inherit !important; }
        body.bm-dark-mode .jss5, body.bm-dark-mode .jss6 { background: #1e1e1e !important; color: #e0e0e0 !important; border: 1px solid #333 !important; border-radius: 0.25rem; }
        body.bm-dark-mode .jss6 { overflow-y: auto; }
        body.bm-dark-mode .jss20, body.bm-dark-mode h3[style*="color: var(--blue-light)"], body.bm-dark-mode h6[style*="color: var(--blue-light)"], body.bm-dark-mode h6.MuiTypography-h6[style*="color: var(--blue-light)"] { color: var(--blue-light) !important; }
        body.bm-dark-mode h1, body.bm-dark-mode h2, body.bm-dark-mode h3, body.bm-dark-mode h4, body.bm-dark-mode h5, body.bm-dark-mode h6, body.bm-dark-mode p, body.bm-dark-mode label, body.bm-dark-mode span, body.bm-dark-mode div:not([class*="Mui"]), body.bm-dark-mode center { color: inherit !important; }
        body.bm-dark-mode .jss27 p b { color: #e0e0e0 !important; }
        body.bm-dark-mode .jss19 { color: #aaa !important; }
        body.bm-dark-mode .jss43 { color: #aaa !important; }
        body.bm-dark-mode .ql-editor { color: #ccc !important; background-color: #252525 !important; border: 1px solid #444 !important; border-radius: 4px; padding: 10px; }
        body.bm-dark-mode textarea.jss17, body.bm-dark-mode input.MuiInputBase-input.MuiOutlinedInput-input, body.bm-dark-mode .MuiInputBase-input { background-color: #252525 !important; color: #f1f1f1 !important; border: none !important; caret-color: #f1f1f1; }
        body.bm-dark-mode .MuiOutlinedInput-root { background-color: #252525 !important; color: #f1f1f1 !important; }
        body.bm-dark-mode .MuiOutlinedInput-notchedOutline { border-color: #555 !important; }
        body.bm-dark-mode .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline { border-color: #888 !important; }
        body.bm-dark-mode .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: var(--blue-light) !important; border-width: 1px !important; }
        body.bm-dark-mode textarea.jss17:focus { outline: 1px solid var(--blue-light) !important; box-shadow: 0 0 5px rgba(123, 83, 193, 0.5); }
        body.bm-dark-mode .MuiInputBase-root.Mui-disabled, body.bm-dark-mode .MuiInputBase-root.Mui-disabled .MuiOutlinedInput-notchedOutline { background-color: #333 !important; border-color: #444 !important; color: #777 !important; -webkit-text-fill-color: #777 !important; opacity: 0.6 !important; }
        body.bm-dark-mode .MuiInputBase-input::placeholder { color: #888 !important; opacity: 1 !important; }
        body.bm-dark-mode button { transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, filter 0.3s ease !important; }
        body.bm-dark-mode button.jss21 { background-color: var(--blue-light) !important; color: #fff !important; border: 1px solid var(--blue-light) !important; }
        body.bm-dark-mode button.jss21:hover { filter: brightness(1.2); }
        body.bm-dark-mode button[style*="background: var(--green)"] { background-color: var(--green) !important; color: #fff !important; border: 1px solid var(--green) !important; }
        body.bm-dark-mode button[style*="background: var(--green)"]:hover { filter: brightness(1.2); }
        body.bm-dark-mode button[style*="background: var(--blue-light)"][style*="color: var(--white)"] { background-color: var(--blue-light) !important; color: #fff !important; border: 1px solid var(--blue-light) !important; }
        body.bm-dark-mode button[style*="background: var(--blue-light)"][style*="color: var(--white)"]:hover { filter: brightness(1.2); }
        body.bm-dark-mode button[style*="background: white"][style*="border-color: var(--blue-light)"] { background-color: transparent !important; color: var(--blue-light) !important; border: 1px solid var(--blue-light) !important; }
        body.bm-dark-mode button[style*="background: white"][style*="border-color: var(--blue-light)"]:hover { background-color: rgba(123, 83, 193, 0.1) !important; }
        body.bm-dark-mode button.jss26 { color: #90caf9 !important; }
        body.bm-dark-mode .MuiIconButton-root { color: #bbb !important; }
        body.bm-dark-mode .MuiIconButton-root:hover { background-color: rgba(255, 255, 255, 0.08) !important; }
        body.bm-dark-mode button:disabled { background-color: #444 !important; color: #888 !important; border-color: #555 !important; cursor: not-allowed !important; opacity: 0.5 !important; filter: grayscale(50%) !important; }
        body.bm-dark-mode .MuiPaper-root.MuiAccordion-root { background-color: #2a2a2a !important; color: #e0e0e0 !important; box-shadow: none !important; border: 1px solid #444 !important; margin-bottom: 8px !important; }
        body.bm-dark-mode .MuiAccordion-root:before { background-color: #444 !important; opacity: 1 !important; }
        body.bm-dark-mode .MuiAccordion-root.Mui-expanded { margin: 8px 0 !important; border-color: #555 !important; }
        body.bm-dark-mode .MuiButtonBase-root.MuiAccordionSummary-root.jss39 { background-color: #2a2a2a !important; color: inherit !important; }
        body.bm-dark-mode .MuiButtonBase-root.MuiAccordionSummary-root.jss39:hover { background-color: #383838 !important; }
        body.bm-dark-mode .MuiAccordionSummary-content p, body.bm-dark-mode .MuiAccordionSummary-content h4, body.bm-dark-mode .jss40 p, body.bm-dark-mode .jss42 { color: inherit !important; }
        body.bm-dark-mode .MuiCollapse-root { background-color: #222 !important; border-top: 1px solid #444; color: inherit !important; }
        body.bm-dark-mode div[style*="background-color: var(--blue-light)"] h6[style*="color: var(--white)"] { color: #fff !important; }
        body.bm-dark-mode div[style*="background-color: var(--white)"][style*="color: var(--blue-dark)"] { background-color: #1e1e1e !important; color: #e0e0e0 !important; }
        body.bm-dark-mode .MuiDialog-paper { background-color: #2c2c2e !important; color: #e0e0e0 !important; }
        body.bm-dark-mode .MuiDialogTitle-root h2, body.bm-dark-mode .MuiDialogTitle-root h1 { color: #fff !important; }
        body.bm-dark-mode .MuiDialogTitle-root { background-color: var(--blue-light) !important; }
        body.bm-dark-mode .MuiDialogContent-root { background-color: #2c2c2e !important; color: inherit !important; }
        body.bm-dark-mode .MuiDialogContent-root hr { border-color: #555 !important; }
        body.bm-dark-mode .jss55 p { color: #333 !important; }
        body.bm-dark-mode p.jss23 { color: #e0e0e0 !important; }
        body.bm-dark-mode p.jss23 span[style*="background-color"][style*="cursor: pointer"] { color: #111 !important; }
        body.bm-dark-mode hr { border: none !important; border-top: 1px solid #444 !important; background-color: transparent !important; }
        body.bm-dark-mode #footer1, body.bm-dark-mode .containerFooter, body.bm-dark-mode .containerFooterMobile { background-color: #1a1a1d !important; background-image: none !important; border-top: 1px solid #444; }
        body.bm-dark-mode .footer-text2, body.bm-dark-mode h5.footer-text2 { color: #ccc !important; }
        body.bm-dark-mode ::-webkit-scrollbar { width: 10px; height: 10px; }
        body.bm-dark-mode ::-webkit-scrollbar-track { background: #2a2a2a; border-radius: 5px; }
        body.bm-dark-mode ::-webkit-scrollbar-thumb { background: #555; border-radius: 5px; }
        body.bm-dark-mode ::-webkit-scrollbar-thumb:hover { background: #777; }
        body.bm-dark-mode div[vw] [vw-access-button] { filter: brightness(0.9); }
        body.bm-dark-mode #bmWrapper, body.bm-dark-mode #bmWrapper *, body.bm-dark-mode .bmDialogOverlay *, body.bm-dark-mode #bmAdvCorrectionSplash *, body.bm-dark-mode #bmOv *, body.bm-dark-mode #bmWritingSplash * { /* Resets básicos para evitar herança indesejada */ box-sizing: border-box; }
        body.bm-dark-mode #bmWrapper:not(.stealth-mode) #bmHeader span, body.bm-dark-mode #bmWrapper:not(.stealth-mode) #bmContent label, body.bm-dark-mode #bmWrapper:not(.stealth-mode) #bmContent span, body.bm-dark-mode #bmWrapper:not(.stealth-mode) #bmToggleText, body.bm-dark-mode #bmWrapper:not(.stealth-mode) #bmDarkModeToggleText { color: #f0f0f0 !important; }
        body.bm-dark-mode #bmWrapper:not(.stealth-mode) #bmContent button { color: #fff !important; }

        /* --- NOVOS ESTILOS PARA GERAÇÃO IA E WRITING SPLASH --- */
        #bmMoreOptionsBtn {
            background: none; border: none; color: #a056f7; font-size: 1.6em;
            font-weight: bold; line-height: 1; padding: 5px 0; margin-top: 10px;
            cursor: pointer; text-align: center; width: 100%;
            transition: color 0.2s ease, transform 0.2s ease;
        }
        #bmMoreOptionsBtn:hover { color: #c89bff; transform: scale(1.1); }
        .bmContextMenu {
            position: absolute; background: linear-gradient(150deg, #38383d, #252528);
            border: 1px solid #555a60; border-radius: 8px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.7); padding: 8px 0;
            z-index: 100004; min-width: 180px; opacity: 0;
            transform: scale(0.95) translateY(-10px);
            transition: opacity 0.25s ease-out, transform 0.25s ease-out;
            pointer-events: none;
        }
        .bmContextMenu.visible { opacity: 1; transform: scale(1) translateY(0); pointer-events: auto; }
        .bmContextMenuItem {
            background: none; border: none; color: #e0e0e0; padding: 10px 18px;
            display: block; width: 100%; text-align: left; font-size: 0.95em;
            cursor: pointer; transition: background-color 0.2s ease, color 0.2s ease;
        }
        .bmContextMenuItem:hover { background-color: rgba(138, 43, 226, 0.25); color: #fff; }
        .bmAIGenResultPopupContent #bmAIGenResultText { font-family: Consolas, Monaco, monospace; background: #2a2a2e !important; border-color: #555 !important; color: #e8e8e8 !important; }
        .bmAIGenResultPopupContent .bmDialogButtonContainer { margin-top: 10px; }

        /* Estilos para Writing Splash */
        .soundwave-container {
            display: flex;
            justify-content: center;
            align-items: flex-end; /* Alinha barras na base */
            height: 80px; /* Altura da área da onda */
            margin-bottom: 20px;
            gap: 4px; /* Espaço entre as barras */
        }
        .wave-bar {
            width: 6px; /* Largura da barra */
            background: linear-gradient(to top, #8A2BE2, #c89bff); /* Gradiente roxo */
            border-radius: 3px;
            animation: soundwave-animation 1.2s ease-in-out infinite alternate;
        }
        @keyframes soundwave-animation {
            0% { height: 5px; opacity: 0.5; }
            100% { height: 75px; opacity: 1; }
        }
        #bmWritingSplashContent h2 {
             animation: advPulseGlow 2s ease-in-out infinite alternate 0.5s; /* Reusa animação de pulso */
        }
    `;
    const styleTag = document.createElement('style');
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    
    const splashTimeout = 3800; 
    setTimeout(() => {
        if (document.body.contains(splash)) { splash.remove(); }

        uiWrapperElement = document.createElement('div'); 
        uiWrapperElement.id = 'bmWrapper';
        uiWrapperElement.innerHTML = `
            <div id="bmHeader"><span>Paraná Tecla V2</span><span id="bmMinimizeBtn" title="Minimizar/Expandir">-</span></div>
            <div id="bmContent">
                <textarea id="bmText" placeholder="Cole o texto para digitar aqui..." class="bmFadeInSlideUp" style="animation-delay: 0.1s;"></textarea>
                <input id="bmDelay" type="number" step="1" value="1" min="0" placeholder="Delay Digitação (ms)" title="Delay entre caracteres na digitação (ms)" class="bmFadeInSlideUp" style="animation-delay: 0.15s;">
                <div id="bmToggleWrapper" class="bmFadeInSlideUp" style="animation-delay: 0.2s;" title="Oculta a janela quando o mouse não está sobre ela."><div id="bmToggleImg"></div> <span id="bmToggleText">Modo Disfarçado</span></div>
                <div id="bmDarkModeToggleWrapper" class="bmFadeInSlideUp" style="animation-delay: 0.25s;" title="Ativa/Desativa o modo escuro para a página inteira."><div id="bmDarkModeToggleImg"></div> <span id="bmDarkModeToggleText">Modo Escuro Página</span></div>
                <button id="bmBtn" class="bmFadeInSlideUp" style="animation-delay: 0.3s;" title="Inicia a digitação simulada do texto acima no campo focado na página.">Iniciar Digitação</button>
                <button id="bmBtnCorrect" class="bmFadeInSlideUp" style="animation-delay: 0.35s;" title="Inicia o processo de correção automática dos erros indicados na página.">Corrigir Automaticamente</button>
                <div id="bmMoreOptionsBtn" title="Mais Opções (Geração IA)" class="bmFadeInSlideUp" style="animation-delay: 0.4s;">...</div>
            </div>
        `;
        document.body.appendChild(uiWrapperElement);

        const bmContent = document.getElementById('bmContent');
        const bmMinimizeBtn = document.getElementById('bmMinimizeBtn');
        const header = document.getElementById('bmHeader');

        setTimeout(() => uiWrapperElement.classList.add('show'), 50); 

        
        let isDragging = false;
        let dragStartX, dragStartY, initialLeft, initialTop;
        header.onmousedown = e => {
            if (e.target === bmMinimizeBtn || bmMinimizeBtn.contains(e.target)) return; 
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            initialLeft = uiWrapperElement.offsetLeft;
            initialTop = uiWrapperElement.offsetTop;
            header.style.cursor = 'grabbing';
            document.addEventListener('mousemove', onDragMove);
            document.addEventListener('mouseup', onDragUp);
            e.preventDefault(); 
        };
        function onDragMove(e) {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            
            const newLeft = Math.max(0, Math.min(window.innerWidth - uiWrapperElement.offsetWidth, initialLeft + dx));
            const newTop = Math.max(0, Math.min(window.innerHeight - uiWrapperElement.offsetHeight, initialTop + dy));
            uiWrapperElement.style.left = newLeft + 'px';
            uiWrapperElement.style.top = newTop + 'px';
        }
        function onDragUp() {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'move';
                document.removeEventListener('mousemove', onDragMove);
                document.removeEventListener('mouseup', onDragUp);
            }
        }
        if (bmMinimizeBtn && uiWrapperElement) {
            bmMinimizeBtn.onclick = (e) => {
                e.stopPropagation();
                const isMinimized = uiWrapperElement.classList.toggle('minimized');
                bmMinimizeBtn.textContent = isMinimized ? '+' : '-';
                bmMinimizeBtn.title = isMinimized ? 'Expandir' : 'Minimizar';
                 
                 if (stealthOn) {
                     setTimeout(() => { try { rect = uiWrapperElement.classList.contains('minimized') ? header.getBoundingClientRect() : uiWrapperElement.getBoundingClientRect(); } catch(err){ console.warn("Erro ao obter rect no modo disfarçado minimizado.")} }, 360); 
                 }
            };
        }

        
        const toggleWrapper = document.getElementById('bmToggleWrapper');
        const toggleBox = document.getElementById('bmToggleImg');
        let firstTimeStealth = true;
        let rect = null; 

        function handleStealthMouseMove(ev) {
             if (!stealthOn || !uiWrapperElement || !document.body.contains(uiWrapperElement)) { exitStealth(); return; }
             try {
                 
                 if (!rect || uiWrapperElement.style.opacity === '1') {
                      rect = uiWrapperElement.classList.contains('minimized') ? header.getBoundingClientRect() : uiWrapperElement.getBoundingClientRect();
                      if (!rect || rect.width === 0 || rect.height === 0) return; 
                  }
                  const mouseX = ev.clientX;
                  const mouseY = ev.clientY;
                  const isInside = (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom);

                  if (isInside) {
                      if (uiWrapperElement.style.opacity !== '1') {
                          uiWrapperElement.style.opacity = 1;
                          uiWrapperElement.style.pointerEvents = 'auto';
                          
                      }
                  } else {
                      if (uiWrapperElement.style.opacity !== '0') {
                          uiWrapperElement.style.opacity = 0;
                          uiWrapperElement.style.pointerEvents = 'none';
                          
                           rect = null; 
                      }
                  }
             } catch (err) {
                 console.warn("Erro no handleStealthMouseMove:", err);
                 exitStealth(); 
             }
        }
         function enterStealth() {
             if (!uiWrapperElement || !document.body.contains(uiWrapperElement)) return;
             stealthOn = true;
             uiWrapperElement.classList.add('stealth-mode');
             toggleBox.classList.add('active');
             uiWrapperElement.style.opacity = 1; 
             uiWrapperElement.style.pointerEvents = 'auto';
             try {
                  rect = uiWrapperElement.classList.contains('minimized') ? header.getBoundingClientRect() : uiWrapperElement.getBoundingClientRect();
                  if (!rect || rect.width === 0 || rect.height === 0) { throw new Error("Rect inválido ao entrar no modo disfarçado."); }
                  document.addEventListener('mousemove', handleStealthMouseMove);
                  
                  setTimeout(() => {
                       if (stealthOn) { 
                           uiWrapperElement.style.opacity = 0;
                           uiWrapperElement.style.pointerEvents = 'none';
                       }
                  }, 300);
                  console.log("Stealth Mode Ativado");
             } catch (err) {
                 console.error("Erro ao entrar no modo disfarçado:", err);
                 exitStealth(); 
                 showCustomAlert("Erro ao ativar Modo Disfarçado.", "error");
             }
         }
         function exitStealth() {
             stealthOn = false;
             document.removeEventListener('mousemove', handleStealthMouseMove);
             if (uiWrapperElement && document.body.contains(uiWrapperElement)) {
                 uiWrapperElement.classList.remove('stealth-mode');
                 toggleBox.classList.remove('active');
                 uiWrapperElement.style.opacity = 1; 
                 uiWrapperElement.style.pointerEvents = 'auto';
             }
             rect = null;
             console.log("Stealth Mode Desativado");
         }
         function showStealthOverlay() {
             const ovId = 'bmStealthInfoOv';
             removeOverlay(ovId);
             const ov = document.createElement('div'); ov.id = ovId; ov.className = 'bmDialogOverlay';
             ov.innerHTML = `<div id="bmOvContent" class="bmDialogBox"> <img src="https://i.imgur.com/RquEok4.gif" alt="Demo" style="max-width: 80%; height: auto; border-radius: 8px;"/> <p class="bmDialogMessage" style="margin-top: 25px;">O Modo Disfarçado oculta a janela quando o mouse não está sobre ela. Mova o mouse para a área da janela para revelá-la.</p> <div class="bmDialogButtonContainer"><button id="bmOvBtnStealth" class="bmDialogButton">Entendido</button></div></div>`;
             document.body.appendChild(ov);
             const box = ov.querySelector('.bmDialogBox');
             ov.classList.add('bmDialogFadeIn');
             box.classList.add('bmDialogEnter');
             document.getElementById('bmOvBtnStealth').onclick = () => {
                 removeOverlay(ov);
                 enterStealth();
             };
         }
        toggleWrapper.onclick = () => {
            if (!stealthOn) {
                if (firstTimeStealth) {
                    firstTimeStealth = false;
                    showStealthOverlay();
                } else {
                    enterStealth();
                }
            } else {
                exitStealth();
            }
        };

        
        const darkModeToggleWrapper = document.getElementById('bmDarkModeToggleWrapper');
        const darkModeToggleBox = document.getElementById('bmDarkModeToggleImg');
        const applyDarkMode = (activate) => {
            isDarkModeOn = activate;
            darkModeToggleBox.classList.toggle('active', isDarkModeOn);
            document.body.classList.toggle('bm-dark-mode', isDarkModeOn);
            console.log("Dark Mode Página:", isDarkModeOn ? "ON" : "OFF");
        };
        
        applyDarkMode(true);
        
        darkModeToggleWrapper.onclick = () => {
            applyDarkMode(!isDarkModeOn);
        };

        
        const startButton = document.getElementById('bmBtn');
        const correctButton = document.getElementById('bmBtnCorrect');
        startButton.onclick = async function () {
            const text = document.getElementById('bmText').value;
             
            const delayInput = document.getElementById('bmDelay');
            let delayMs = parseInt(delayInput.value, 10);
            if (isNaN(delayMs) || delayMs < 0) {
                 console.warn(`Delay inválido (${delayInput.value}), usando 1ms.`);
                 delayMs = 1; 
                 delayInput.value = delayMs; 
             }

            if (!text) {
                showCustomAlert('Área de texto do script está vazia!', 'error');
                return;
            }
            if (!activeEl || !document.body.contains(activeEl)) {
                showCustomAlert('Clique no campo da página onde deseja digitar antes de iniciar!', 'warning');
                return;
            }
             
            if (!(activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
                 showCustomAlert('O elemento clicado não parece ser um campo de texto editável!', 'error');
                 return;
             }

            if (isCorrectionRunning) { 
                showCustomAlert('Aguarde a correção automática terminar antes de digitar.', 'warning');
                return;
            }

            this.disabled = true;
            if (correctButton) correctButton.disabled = true; 

            
            for (let n = 3; n >= 1; n--) {
                const cnt = document.createElement('div');
                cnt.className = 'bmCountdownNumber';
                cnt.textContent = n;
                if (uiWrapperElement && document.body.contains(uiWrapperElement)) {
                    uiWrapperElement.appendChild(cnt);
                } else { break; } 
                await new Promise(r => setTimeout(r, 700));
                if (uiWrapperElement && uiWrapperElement.contains(cnt)) {
                    uiWrapperElement.removeChild(cnt);
                }
                await new Promise(r => setTimeout(r, 100));
            }

            let typingCompleted = true;
            console.log(`Iniciando digitação simulada com delay de ${delayMs}ms...`);
            try {
                const targetElementForTyping = activeEl; 
                targetElementForTyping.focus({ preventScroll: true });

                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                     
                    const success = sendChar(char, targetElementForTyping);
                    if (!success) {
                        
                        console.warn(`Falha ao digitar caractere: "${char}"`);
                        
                    }
                    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
                }

                if (typingCompleted) { 
                    showCustomAlert('Digitação simulada concluída!', 'success');
                }
            } catch (error) {
                console.error("Erro na digitação simulada:", error);
                showCustomAlert(`Erro inesperado durante a digitação:\n${error.message}`, 'error');
            } finally {
                this.disabled = false;
                if (correctButton) correctButton.disabled = false; 
            }
        };


        
        
        
         async function showModeSelectionDialog() { const buttons = [ { text: 'Básico', value: 'basic', class: 'secondary' }, { text: 'Avançado', value: 'advanced' } ]; return await showCustomAlert( 'Escolha o modo de correção:', 'question', buttons, 'bmModeSelectionDialog' ); }
         async function showBasicModeConfirmationDialog() { const buttons = [ { text: 'Cancelar', value: false, class: 'secondary' }, { text: 'Continuar (Básico)', value: true } ]; return await showCustomAlert( 'Modo Básico:\nA correção será totalmente automática (usará a primeira sugestão do site).\nNenhuma tela de correção será exibida.', 'warning', buttons, 'bmBasicConfirmDialog' ); }
         function getContextAroundError(fullText, errorText, wordsBefore = 5, wordsAfter = 3) { const words = fullText.split(/(\s+)/); const errorWords = errorText.trim().split(/(\s+)/); let startIndex = -1; for (let i = 0; i <= words.length - errorWords.length; i++) { let match = true; for (let j = 0; j < errorWords.length; j++) { if (words[i + j] !== errorWords[j]) { match = false; break; } } if (match) { startIndex = i; break; } } if (startIndex === -1) { return { before: ``, error: errorText, after: "" }; } const endIndex = startIndex + errorWords.length; let beforeContext = []; let wordsCountedBefore = 0; for (let i = startIndex - 1; i >= 0 && wordsCountedBefore < wordsBefore; i--) { beforeContext.unshift(words[i]); if (words[i].trim().length > 0) { wordsCountedBefore++; } } let afterContext = []; let wordsCountedAfter = 0; for (let i = endIndex; i < words.length && wordsCountedAfter < wordsAfter; i++) { afterContext.push(words[i]); if (words[i].trim().length > 0) { wordsCountedAfter++; } } const joinWithSpace = (arr) => arr.join(''); return { before: joinWithSpace(beforeContext), error: errorText, after: joinWithSpace(afterContext) }; }
         function showAdvancedCorrectionSplash(initialMessage = "Preparando correção avançada...") { removeOverlay('bmAdvCorrectionSplash'); correctionSplashEl = document.createElement('div'); correctionSplashEl.id = 'bmAdvCorrectionSplash'; correctionSplashEl.innerHTML = ` <div class="bmAdvSplashContent"> <h2>${initialMessage}</h2> <div class="bmAdvContextDisplay">.</div> <div class="bmAdvOptionsContainer" style="display: none;"> <div class="bmAdvSuggestionButtons"></div> <div class="bmAdvActionButtons"></div> </div> <div class="bmAdvLoadingState" style="display: none;"> <div class="spinner"></div> <div class="applying-text">Processando...</div> </div> </div>`; document.body.appendChild(correctionSplashEl); void correctionSplashEl.offsetWidth; correctionSplashEl.classList.add('visible'); }
         async function updateAdvancedCorrectionSplash(context, suggestions) { if (!correctionSplashEl || !document.body.contains(correctionSplashEl)) return Promise.reject("Splash de correção avançada não visível."); const splashContent = correctionSplashEl.querySelector('.bmAdvSplashContent'); const h2 = splashContent.querySelector('h2'); const contextDisplay = splashContent.querySelector('.bmAdvContextDisplay'); const optionsContainer = splashContent.querySelector('.bmAdvOptionsContainer'); const suggestionContainer = splashContent.querySelector('.bmAdvSuggestionButtons'); const actionContainer = splashContent.querySelector('.bmAdvActionButtons'); const loadingState = splashContent.querySelector('.bmAdvLoadingState'); h2.textContent = 'Escolha a Correção:'; loadingState.style.display = 'none'; optionsContainer.style.display = 'block'; contextDisplay.style.opacity = 0; contextDisplay.style.transform = 'translateY(10px)'; await new Promise(r => setTimeout(r, 50)); contextDisplay.innerHTML = `<span class="context-before">${context.before}</span> <span class="error-word">${context.error}</span> <span class="context-after">${context.after}</span>`; contextDisplay.style.opacity = 1; contextDisplay.style.transform = 'translateY(0)'; suggestionContainer.innerHTML = ''; suggestions.forEach((sug, index) => { const btn = document.createElement('button'); btn.className = 'bmAdvSuggestionButton'; btn.textContent = sug; btn.style.opacity = 0; btn.style.transform = 'scale(0.8)'; btn.style.animation = `advButtonPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${0.1 + index * 0.08}s forwards`; btn.onclick = () => { if (currentCorrectionResolver) { currentCorrectionResolver({ type: 'suggestion', value: sug }); currentCorrectionResolver = null; showApplyingStateInSplash("Aplicando sugestão..."); } }; suggestionContainer.appendChild(btn); }); actionContainer.innerHTML = ''; const manualBtn = document.createElement('button'); manualBtn.className = 'bmAdvActionButton manual'; manualBtn.textContent = 'Escrever Manualmente'; manualBtn.style.opacity = 0; manualBtn.style.transform = 'translateX(-20px)'; manualBtn.style.animation = `advActionButtonSlideIn 0.5s ease-out ${0.1 + suggestions.length * 0.08}s forwards`; manualBtn.onclick = async () => { if (currentCorrectionResolver) { const manualText = await showCustomAlert( `Digite a correção para: <b>${context.error}</b>`, 'question', [{ text: 'Cancelar', value: null, class: 'secondary' }, { text: 'Aplicar', value: 'apply' }], 'bmManualCorrectionPrompt' ); if (manualText === 'Aplicar') { const inputField = document.getElementById('bmManualInput'); 
                                 
                                 const correctionValue = prompt("Digite a correção manualmente:", context.error); 
                                 if (correctionValue !== null) {
                                     currentCorrectionResolver({ type: 'manual', value: correctionValue }); currentCorrectionResolver = null; showApplyingStateInSplash("Aplicando correção manual...");
                                 } else {
                                     currentCorrectionResolver({ type: 'skip' }); currentCorrectionResolver = null; showApplyingStateInSplash("Operação manual cancelada.");
                                 }
                             } else { 
                                  currentCorrectionResolver({ type: 'skip' }); currentCorrectionResolver = null; showApplyingStateInSplash("Operação manual cancelada.");
                             }
                        }
                 }; actionContainer.appendChild(manualBtn); const skipBtn = document.createElement('button'); skipBtn.className = 'bmAdvActionButton skip'; skipBtn.textContent = 'Pular Erro'; skipBtn.style.opacity = 0; skipBtn.style.transform = 'translateX(20px)'; skipBtn.style.animation = `advActionButtonSlideIn 0.5s ease-out ${0.15 + suggestions.length * 0.08}s forwards`; skipBtn.onclick = () => { if (currentCorrectionResolver) { currentCorrectionResolver({ type: 'skip' }); currentCorrectionResolver = null; showApplyingStateInSplash("Pulando erro..."); } }; actionContainer.appendChild(skipBtn); return new Promise(resolve => { currentCorrectionResolver = resolve; }); }
         function showApplyingStateInSplash(message = "Aplicando alterações...") { if (!correctionSplashEl || !document.body.contains(correctionSplashEl)) return; const loadingState = correctionSplashEl.querySelector('.bmAdvLoadingState'); const applyingText = loadingState.querySelector('.applying-text'); const optionsContainer = correctionSplashEl.querySelector('.bmAdvOptionsContainer'); if (loadingState && applyingText && optionsContainer) { optionsContainer.style.display = 'none'; if(applyingText) applyingText.textContent = message; loadingState.style.display = 'flex'; loadingState.style.opacity = 0; void loadingState.offsetWidth; loadingState.style.transition = 'opacity 0.3s ease-in'; loadingState.style.opacity = 1; } }
         function hideAdvancedCorrectionSplash() { if (correctionSplashEl) { removeOverlay(correctionSplashEl); correctionSplashEl = null; } }

       
    correctButton.onclick = async function () {
    if (isCorrectionRunning) { showCustomAlert('Correção já em andamento.', 'warning'); return; }
    isCorrectionRunning = true;
    const btnCorrect = this; btnCorrect.disabled = true; if (startButton) startButton.disabled = true;
    console.log('Solicitando modo de correção...');
    let correctionMode = null;
    let targetTextarea = null; 
    let correctionProcessRan = false;
    let finalMessage = "Nenhuma ação realizada.";
    let finalType = "info";
    let loadingUIData = null;

    
    removeOverlay('bmAIReviewSplash'); removeOverlay('bmAILoadingSplash'); hideAdvancedCorrectionSplash();

    try {
        correctionMode = await showModeSelectionDialog();
        removeOverlay('bmModeSelectionDialog'); 
        if (correctionMode === 'basic') {
            console.log('Modo Básico selecionado. Confirmando...');
            const confirmBasic = await showBasicModeConfirmationDialog();
             removeOverlay('bmBasicConfirmDialog');
            if (!confirmBasic) { throw new Error("Modo Básico cancelado pelo usuário."); }
            console.log('Modo Básico confirmado.');
        } else if (correctionMode === 'advanced') {
            console.log('Modo Avançado selecionado.');
            showAdvancedCorrectionSplash("."); 
            await new Promise(r => setTimeout(r, 300));
        } else {
            throw new Error("Nenhum modo de correção selecionado.");
        }

        
        let initialChecksOk = false;
        try {
             console.log("Procurando textarea alvo...");
             
             const TARGET_TEXTAREA_SELECTOR = 'textarea#outlined-multiline-static[class*="jss"]'; 
             targetTextarea = await waitForElement(TARGET_TEXTAREA_SELECTOR, 5000);
             console.log('Textarea alvo encontrada.');
             activeEl = targetTextarea; 

             
             const correctorButton = document.querySelector('button:not(:disabled)'); 
             let needsCorrectorClick = false;

             
             const allButtons = document.querySelectorAll('button');
             let foundCorrectorButton = null;
             let foundWaitingButton = null;
             let concludeButtonExists = false;

             for (const button of allButtons) {
                 const buttonText = button.textContent.trim();
                 if (buttonText === "Concluir") {
                     concludeButtonExists = true;
                     console.log("Botão 'Concluir' encontrado. Correção já feita ou não necessária.");
                     break; 
                 }
                 if (buttonText.includes("CORRIGIR ONLINE")) {
                      if (buttonText === "CORRIGIR ONLINE") {
                          foundCorrectorButton = button;
                      } else { 
                          foundWaitingButton = button;
                          break; 
                      }
                 }
             }

             if (concludeButtonExists) {
                 
             } else if (foundWaitingButton) {
                 throw new Error(`'Corrigir Online' está em processo de espera ("${foundWaitingButton.textContent}"). Tente novamente mais tarde.`);
             } else if (foundCorrectorButton) {
                 console.log("Botão 'CORRIGIR ONLINE' encontrado e pronto.");
                 needsCorrectorClick = true;
                 if (correctionMode === 'advanced' && correctionSplashEl) {
                      showApplyingStateInSplash("Iniciando correção online...");
                 } else {
                      console.log("Clicando em 'CORRIGIR ONLINE'...");
                 }
                 foundCorrectorButton.click();
                 console.log("Esperando indicador de processamento desaparecer (se houver)...");
                 
                 const processingSelector = 'div.sc-kAyceB.kEYIQb'; 
                 try {
                     await waitForElementToDisappear(processingSelector, 45000); 
                     console.log("'PROCESSANDO' desapareceu ou não apareceu.");
                 } catch (timeoutError) {
                      console.warn("Timeout esperando 'PROCESSANDO' desaparecer (ignorado, pode não existir).");
                 }
                 await new Promise(r => setTimeout(r, 1000)); 
             } else {
                 console.log("Botão 'CORRIGIR ONLINE' ou 'Concluir' não encontrado como esperado. Continuando a verificação de erros...");
             }

             initialChecksOk = true;
        } catch (error) {
             console.error("Erro durante verificações iniciais:", error);
             const errorMsg = error.message.includes('Timeout') ? `Timeout esperando elemento: ${error.message.split(': ')[1]}` : error.message.includes("'Corrigir Online'") ? error.message : error.message.includes('textarea') ? 'Textarea alvo não encontrada! Verifique o seletor.' : 'Erro inesperado nas verificações iniciais.';
             
             throw error; 
        }

        
        if (!initialChecksOk || !targetTextarea) { throw new Error("Não foi possível iniciar a correção (falha nas verificações)."); }
        console.log("Procurando spans de erro...");
        if (correctionMode === 'advanced' && correctionSplashEl) {
             const h2 = correctionSplashEl.querySelector('h2'); if (h2) h2.textContent = 'Procurando erros...';
             await new Promise(r => setTimeout(r, 100)); 
        }

        
        const errorSpanSelector = 'span[style*="background-color: rgb"][style*="cursor: pointer"]';
        let errorSpans = Array.from(document.querySelectorAll(errorSpanSelector)); 
        let correctedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        let iteration = 0; 
        const MAX_ITERATIONS = errorSpans.length + 10; 

        if (errorSpans.length === 0) {
            console.log('Nenhum span de erro encontrado.');
            finalMessage = "Nenhum erro encontrado para correção (baseado nos spans).";
            finalType = "info";
            correctionProcessRan = true; 
            if (correctionMode === 'advanced') hideAdvancedCorrectionSplash();
        } else {
            console.log(`Encontrados ${errorSpans.length} spans de erro iniciais.`);
            correctionProcessRan = true;
            if (correctionMode === 'advanced' && correctionSplashEl) {
                 const h2 = correctionSplashEl.querySelector('h2'); if (h2) h2.textContent = '.';
            }

            
            while (iteration < MAX_ITERATIONS) {
                iteration++;
                errorSpans = Array.from(document.querySelectorAll(errorSpanSelector)); 

                if (errorSpans.length === 0) {
                    console.log("Todos os spans de erro foram processados ou desapareceram.");
                    break; 
                }

                const errorSpan = errorSpans[0]; 

                if (!errorSpan || !document.body.contains(errorSpan) || errorSpan.offsetParent === null) {
                     console.log(`Span ${iteration} inválido, oculto ou já removido, pulando.`);
                     await new Promise(r => setTimeout(r, MIN_DELAY)); 
                     continue;
                }

                const errorTextForContext = errorSpan.textContent;
                const errorTextTrimmed = errorTextForContext.trim();
                let actionType = 'none';
                let chosenCorrection = null;

                
                if (!errorTextTrimmed) {
                     console.log(`Span ${iteration} contém apenas espaços ou está vazio, pulando.`);
                     
                     
                     await new Promise(r => setTimeout(r, MIN_DELAY));
                     continue;
                }

                console.log(`--- Processando erro <span class="math-inline">\{iteration\} \(Texto\: "</span>{errorTextTrimmed}") ---`);

                try {
                     errorSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
                     await new Promise(r => setTimeout(r, SCROLL_DELAY + 100)); 

                     
                     errorSpan.click();
                     console.log(`Clicou no span: "${errorTextTrimmed}"`);
                     await new Promise(r => setTimeout(r, 150)); 

                     let suggestions = [];
                     try {
                          
                          const suggestionMenuSelector = 'ul#menu-list-grow'; 
                          const suggestionList = await waitForElement(suggestionMenuSelector, 1500); 
                          console.log("Menu de sugestão encontrado.");
                          await new Promise(r => setTimeout(r, 100)); 

                          const suggestionItems = suggestionList.querySelectorAll('li'); 
                          
                          suggestions = Array.from(suggestionItems)
                               .slice(1) 
                               .map(li => li.textContent.trim())
                               .filter(text => text.length > 0 && text.length < 50); 

                          if (suggestions.length === 0) { console.warn(`Menu encontrado, mas sem sugestões válidas para "${errorTextTrimmed}".`); }
                          else { console.log(`Sugestões encontradas para "${errorTextTrimmed}":`, suggestions); }

                     } catch (e) {
                          console.warn(`Não encontrou lista de sugestões para "${errorTextTrimmed}" após o clique.`);
                          document.body.click(); await new Promise(r => setTimeout(r, MIN_DELAY));
                          if (correctionMode === 'advanced') {
                               const fullText = targetTextarea.value;
                               const context = getContextAroundError(fullText, errorTextForContext, ADV_CONTEXT_WORDS, ADV_CONTEXT_WORDS);
                               const userAction = await updateAdvancedCorrectionSplash(context, []); 
                               actionType = userAction.type;
                               chosenCorrection = userAction.value;
                          } else { 
                               console.log("Modo básico e sem sugestões, pulando erro.");
                               actionType = 'skip';
                          }
                     }

                     
                     if (actionType === 'none') { 
                          if (suggestions.length === 0) {
                               
                               if (correctionMode === 'basic') {
                                    console.log("Modo básico e sem sugestões, pulando erro.");
                                    actionType = 'skip';
                               }
                               
                          } else if (correctionMode === 'basic' || suggestions.length === 1) {
                               chosenCorrection = suggestions[0]; 
                               actionType = 'auto';
                               console.log(`Aplicando automaticamente: "<span class="math-inline">\{errorTextTrimmed\}" \-\> "</span>{chosenCorrection}" (Modo: ${correctionMode})`);
                               if (correctionMode === 'advanced') { 
                                    const fullText = targetTextarea.value;
                                    const context = getContextAroundError(fullText, errorTextForContext, ADV_CONTEXT_WORDS, ADV_CONTEXT_WORDS);
                                    showApplyingStateInSplash(`Aplicando: ${context.error} → ${chosenCorrection}`);
                                    await new Promise(r => setTimeout(r, 800)); 
                               }
                          } else { 
                               const fullText = targetTextarea.value;
                               const context = getContextAroundError(fullText, errorTextForContext, ADV_CONTEXT_WORDS, ADV_CONTEXT_WORDS);
                               const userAction = await updateAdvancedCorrectionSplash(context, suggestions);
                               actionType = userAction.type;
                               chosenCorrection = userAction.value;
                               console.log(`Ação do usuário: ${actionType}, Valor: ${chosenCorrection}`);
                          }
                     }

                     
                     if ((actionType === 'suggestion' || actionType === 'manual' || actionType === 'auto') && chosenCorrection !== null) {
                         const originalErrorText = errorTextForContext; 
                         
                         const currentTextValue = targetTextarea.value;
                         const errorIndex = currentTextValue.indexOf(originalErrorText);

                         if (errorIndex !== -1) {
                             console.log(`Encontrado "${originalErrorText}" no índice <span class="math-inline">\{errorIndex\}\. Substituindo por "</span>{chosenCorrection}".`);
                             try {
                                 targetTextarea.focus({ preventScroll: true });
                                 await new Promise(r => setTimeout(r, MIN_DELAY));

                                 
                                 const newValue = currentTextValue.substring(0, errorIndex) + chosenCorrection + currentTextValue.substring(errorIndex + originalErrorText.length);

                                 
                                 const prototype = Object.getPrototypeOf(targetTextarea);
                                 const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
                                 if (valueSetter) {
                                     valueSetter.call(targetTextarea, newValue);
                                 } else {
                                     targetTextarea.value = newValue;
                                 }

                                 
                                 targetTextarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, composed: true }));
                                 targetTextarea.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

                                 
                                 const newCursorPos = errorIndex + chosenCorrection.length;
                                 targetTextarea.selectionStart = newCursorPos;
                                 targetTextarea.selectionEnd = newCursorPos;

                                 correctedCount++;
                                 console.log(`Correção aplicada (<span class="math-inline">\{actionType\}\)\: "</span>{originalErrorText}" -> "${chosenCorrection}"`);

                                 
                                 if(errorSpan.parentNode) {
                                     try {
                                         errorSpan.style.backgroundColor = 'transparent';
                                         errorSpan.style.cursor = 'default';
                                         
                                     } catch(e){}
                                 }
                                  await new Promise(r => setTimeout(r, 150)); 

                             } catch (e) {
                                 console.error("Erro durante a substituição direta do valor:", e);
                                 errorCount++; actionType = 'error';
                             }
                         } else {
                             console.warn(`Texto "${originalErrorText}" não foi encontrado na textarea para aplicar correção. Pode já ter sido alterado ou DOM mudou.`);
                             skippedCount++; 
                             actionType = 'skip';
                         }
                     } else if (actionType === 'skip') {
                         skippedCount++;
                         console.log(`Erro "${errorTextTrimmed}" pulado.`);
                     } else if (actionType === 'error') {
                        errorCount++;
                         console.log(`Erro "${errorTextTrimmed}" não pôde ser corrigido (ou sem sugestões).`);
                     }


                     
                     document.body.click();
                     await new Promise(r => setTimeout(r, MIN_DELAY * 5)); 


                } catch (error) {
                     console.error(`Erro geral ao processar span <span class="math-inline">\{iteration\} \("</span>{errorTextTrimmed}"):`, error);
                     errorCount++;
                     try { document.body.click(); } catch (e) { } 
                     await new Promise(r => setTimeout(r, MIN_DELAY));
                }

                
                await new Promise(r => setTimeout(r, STEP_DELAY));

            } 

            if (iteration >= MAX_ITERATIONS) {
                console.warn("Máximo de iterações de correção atingido. Interrompendo para evitar loop infinito.");
                finalMessage = "Processo de correção interrompido (limite de iterações). Pode haver erros restantes.";
                finalType = "warning";
                errorCount++; 
            } else {
                 console.log('Processamento de spans concluído.');
                 const processedCount = correctedCount + skippedCount + errorCount;
                 if (processedCount === 0 && errorSpans.length === 0 && correctionProcessRan) { 
                     finalMessage = "Foram encontrados spans de erro inicialmente, mas nenhum foi processado (possivelmente já corrigidos ou inválidos)."; finalType = "warning";
                 } else if (correctedCount > 0 && skippedCount === 0 && errorCount === 0) {
                     finalMessage = `Correção finalizada! ${correctedCount} erros processados com sucesso.`; finalType = "success";
                 } else if (correctedCount > 0 || skippedCount > 0 || errorCount > 0) {
                     finalMessage = `Correção concluída: ${correctedCount} corrigido(s), ${skippedCount} pulado(s), ${errorCount > 0 ? `<br><b>${errorCount} erro(s) durante o processo.</b>` : ''}`;
                     if (errorCount > 0) finalType = "warning";
                     else if (correctedCount > 0) finalType = "success";
                     else finalType = "info"; 
                 }
            }
        } 


        
        if (correctionMode === 'advanced') { hideAdvancedCorrectionSplash(); await new Promise(r => setTimeout(r, 450)); }
        else { console.log("Modo Básico: Finalizando."); await new Promise(r => setTimeout(r, 50)); }

        
        if (correctionProcessRan && targetTextarea && document.body.contains(targetTextarea)) {
             removeOverlay('bmAIReviewSplash'); removeOverlay('bmAILoadingSplash');
             const wantAIReview = await showAIReviewOverlayStyled();
             if (wantAIReview) {
                 console.log("Usuário optou pela revisão final da IA.");
                 const aiStatusMessages = [ "Revisando seu texto...", "Analisando detalhes...", "Aplicando ajustes finos...", "Quase pronto...", "Paraná Tools informa: 'Revisado!'" ];
                 let currentMessageIndex = 0;
                 loadingUIData = showAILoadingOverlayStyled(aiStatusMessages[0]);
                 updateAIProgressBar(loadingUIData.progressBarElement, 5);

                 
                 if (aiStatusIntervalId) clearInterval(aiStatusIntervalId);
                 aiStatusIntervalId = setInterval(() => {
                      currentMessageIndex = (currentMessageIndex + 1) % (aiStatusMessages.length -1); 
                      if (loadingUIData?.statusTextElement) { loadingUIData.statusTextElement.textContent = aiStatusMessages[currentMessageIndex]; }
                      else { clearInterval(aiStatusIntervalId); aiStatusIntervalId = null; } 
                 }, AI_STATUS_UPDATE_INTERVAL);

                 try {
                      const currentText = targetTextarea.value;
                      if (!currentText.trim()) { throw new Error("A caixa de texto está vazia, não há nada para revisar."); }
                      updateAIProgressBar(loadingUIData.progressBarElement, 20);

                      
                      const reviewPrompt = `Revise este texto e corrija os minimos detalhes ortográficos e gramaticais. Não é para mudar NADA do sentido original, apenas erros. Não adicione NADA, nem título, nem introdução, nem conclusão extra. Retorne APENAS o texto corrigido.\n\nTEXTO ORIGINAL:\n${currentText}`;

                      const aiCorrectedText = await callPuterAI(reviewPrompt);
                      console.log("IA retornou texto revisado.");
                      updateAIProgressBar(loadingUIData.progressBarElement, 70);
                      if (loadingUIData?.statusTextElement) loadingUIData.statusTextElement.textContent = "Aplicando revisão...";
                      if (aiStatusIntervalId) { clearInterval(aiStatusIntervalId); aiStatusIntervalId = null; } 

                      const cleared = await clearTextareaSimulated(targetTextarea);
                       if (!cleared) throw new Error("Falha ao limpar textarea para aplicar revisão da IA.");
                      updateAIProgressBar(loadingUIData.progressBarElement, 90);
                      await typeTextFast(aiCorrectedText, targetTextarea); 
                      updateAIProgressBar(loadingUIData.progressBarElement, 100);
                      if (loadingUIData?.statusTextElement) loadingUIData.statusTextElement.textContent = aiStatusMessages[aiStatusMessages.length - 1]; 
                      await new Promise(r => setTimeout(r, 1200)); 
                      removeOverlay(loadingUIData.overlayElement); loadingUIData = null;
                      finalMessage += "\nRevisão final da IA aplicada."; finalType = "success";
                 } catch (aiError) {
                      console.error("Erro durante o processo da IA de revisão:", aiError);
                      if (aiStatusIntervalId) { clearInterval(aiStatusIntervalId); aiStatusIntervalId = null; }
                      removeOverlay(loadingUIData?.overlayElement); loadingUIData = null;
                      await showCustomAlert(`Erro na revisão final da IA: ${aiError.message}`, 'error');
                      
                 }
             } else { console.log("Usuário pulou a revisão final da IA."); }
        } else { console.log("Processo de correção não executado ou textarea sumiu, pulando revisão da IA."); }

        showCustomAlert(finalMessage, finalType); 

    } catch (e) {
         console.error("Erro geral no fluxo de correção:", e);
         if (e.message !== "Modo Básico cancelado pelo usuário." && e.message !== "Nenhum modo de correção selecionado.") {
              
              if (!e.message.includes("Timeout") && !e.message.includes("Tente novamente") && !e.message.includes("encontrada") && !e.message.includes("cancelado")) {
                   showCustomAlert(`Ocorreu um erro inesperado na correção: ${e.message}`, 'error');
              }
         }
         hideAdvancedCorrectionSplash(); 
    } finally {
         console.log("--- Correção Automática Finalizada (Bloco Finally) ---");
         isCorrectionRunning = false;
         btnCorrect.disabled = false;
         if (startButton) startButton.disabled = false;
         currentCorrectionResolver = null;
         if (aiStatusIntervalId) { clearInterval(aiStatusIntervalId); aiStatusIntervalId = null; }
         
         removeOverlay(loadingUIData?.overlayElement);
         removeOverlay('bmAIReviewSplash'); removeOverlay('bmAILoadingSplash');
         removeOverlay('bmAdvCorrectionSplash'); removeOverlay('bmAlertOverlay');
         removeOverlay('bmModeSelectionDialog'); removeOverlay('bmBasicConfirmDialog');
         removeOverlay('bmManualCorrectionPrompt'); removeOverlay('bmOverwriteConfirmDialog'); 
    }
}; 


        
        const moreOptionsBtn = document.getElementById('bmMoreOptionsBtn');
        moreOptionsBtn.onclick = (e) => {
            e.stopPropagation(); 

            if (contextMenuEl && document.body.contains(contextMenuEl)) {
                removeOverlay(contextMenuEl); 
                contextMenuEl = null;
                return;
            }
            removeOverlay('bmContextMenu'); 

            contextMenuEl = document.createElement('div');
            contextMenuEl.id = 'bmContextMenu';
            contextMenuEl.className = 'bmContextMenu';
            contextMenuEl.innerHTML = `
                <button class="bmContextMenuItem" id="bmGenerateAITextBtn">Gerar Texto com IA</button>
                `;

            const btnRect = moreOptionsBtn.getBoundingClientRect();
            contextMenuEl.style.position = 'absolute'; 
            contextMenuEl.style.top = `${btnRect.bottom + window.scrollY + 5}px`;
            
            const leftPos = Math.max(5, btnRect.left + window.scrollX);
            contextMenuEl.style.left = `${leftPos}px`;
             
             

            document.body.appendChild(contextMenuEl);

            void contextMenuEl.offsetWidth;
            contextMenuEl.classList.add('visible');

            
            const closeMenuHandler = (event) => {
                if (contextMenuEl && !contextMenuEl.contains(event.target) && event.target !== moreOptionsBtn) {
                    removeOverlay(contextMenuEl);
                    contextMenuEl = null;
                    document.removeEventListener('click', closeMenuHandler, true);
                }
            };
            setTimeout(() => document.addEventListener('click', closeMenuHandler, true), 0); 

            
            document.getElementById('bmGenerateAITextBtn').onclick = () => handleAIGenerationRequest(false); 
        };

    }, splashTimeout); 

})(); 
