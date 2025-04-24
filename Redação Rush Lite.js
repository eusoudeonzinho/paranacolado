(function () {
  // evita duplo carregamento
  if (document.getElementById('bmSplash')) return;

  // --- Constantes ---
  const SCRIPT_BRANDING = "Pryzen Labs";
  const MIN_DELAY = 1;
  const SCROLL_DELAY = 40;
  const STEP_DELAY = 150; // <<-- Aumentado ligeiramente para dar mais tempo entre iterações
  const SIMULATED_TYPE_DELAY = 1;
  const MIN_WRAPPER_WIDTH = 260;
  const MIN_WRAPPER_HEIGHT = 180;
  const ADV_CONTEXT_WORDS = 5;
  const AI_STATUS_UPDATE_INTERVAL = 2200;
  const GITHUB_LINK = 'https://pryzen-lab.github.io';
  const TARGET_TEXTAREA_SELECTOR = 'textarea.jss17, textarea.jss18, textarea.jss31, textarea.jss32';

  // --- Variáveis Globais ---
  let activeEl = null;
  let isCorrectionRunning = false;
  let isGenerationRunning = false;
  let currentCorrectionResolver = null;
  let correctionSplashEl = null;
  let aiStatusIntervalId = null;
  let isDarkModeOn = false;
  let optionsMenuElement = null;

  // --- FUNÇÕES AUXILIARES ---
  // showCustomAlert, waitForElementToDisappear, waitForElement: Mantidas (JS Lógica)
  function showCustomAlert(message, type = 'info', buttons = [{ text: 'OK' }], alertId = 'bmAlertOverlay') { /* ... código JS mantido ... */ return new Promise((resolve) => { const existingOverlay = document.getElementById(alertId); if (existingOverlay) { existingOverlay.remove(); } const overlay = document.createElement('div'); overlay.id = alertId; overlay.className = 'bmDialogOverlay'; const alertBox = document.createElement('div'); alertBox.className = 'bmDialogBox'; alertBox.classList.add(`bmAlert-${type}`); let iconHtml = ''; switch (type) { case 'error': iconHtml = '<div class="bmDialogIcon error">!</div>'; break; case 'warning': iconHtml = '<div class="bmDialogIcon warning">!</div>'; break; case 'success': iconHtml = '<div class="bmDialogIcon success">✓</div>'; break; case 'question': iconHtml = '<div class="bmDialogIcon question">?</div>'; break; case 'info': default: iconHtml = '<div class="bmDialogIcon info">i</div>'; break; } const messageP = document.createElement('p'); messageP.className = 'bmDialogMessage'; messageP.innerHTML = message; const buttonContainer = document.createElement('div'); buttonContainer.className = 'bmDialogButtonContainer'; buttons.forEach(buttonInfo => { const btn = document.createElement('button'); btn.textContent = buttonInfo.text; btn.className = `bmDialogButton ${buttonInfo.class || ''}`; btn.onclick = () => { overlay.style.opacity = '0'; setTimeout(() => { if (document.body.contains(overlay)) { document.body.removeChild(overlay); } resolve(buttonInfo.value !== undefined ? buttonInfo.value : buttonInfo.text); }, 300); }; buttonContainer.appendChild(btn); }); alertBox.innerHTML = iconHtml; alertBox.appendChild(messageP); alertBox.appendChild(buttonContainer); overlay.appendChild(alertBox); document.body.appendChild(overlay); void alertBox.offsetWidth; overlay.style.opacity = '1'; alertBox.style.opacity = '1'; }); }
  function waitForElementToDisappear(selector, timeout = 30000) { /* ... código JS mantido ... */ return new Promise((resolve, reject) => { const intervalTime = 50; let elapsedTime = 0; const intervalId = setInterval(() => { const element = document.querySelector(selector); if (!element) { clearInterval(intervalId); clearTimeout(timeoutId); resolve("Elemento desapareceu"); } elapsedTime += intervalTime; }, intervalTime); const timeoutId = setTimeout(() => { clearInterval(intervalId); console.log(`Timeout ${timeout}ms esperando ${selector} desaparecer (OK se já desapareceu).`); resolve("Timeout esperando desaparecer (ignorado)"); }, timeout); }); }
  function waitForElement(selector, timeout = 5000) { /* ... código JS mantido ... */ return new Promise((resolve, reject) => { const startTime = Date.now(); const interval = setInterval(() => { const element = document.querySelector(selector); if (element && element.offsetParent !== null) { clearInterval(interval); resolve(element); } else if (Date.now() - startTime > timeout) { clearInterval(interval); reject(new Error(`Timeout esperando aparecer: ${selector}`)); } }, 50); }); }

  // Listener de Mousedown: Mantido (JS Lógica)
  document.addEventListener('mousedown', e => { activeEl = e.target; if (optionsMenuElement && !optionsMenuElement.contains(e.target) && e.target.id !== 'bmOptionsBtn') { removeOverlay(optionsMenuElement); optionsMenuElement = null; } }, true);

  // dispatchKeyEvent: Mantida (JS Lógica)
  function dispatchKeyEvent(target, eventType, key, keyCode, charCode = 0, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false) { /* ... código JS mantido ... */ let effectiveCharCode = charCode; if (!effectiveCharCode && key && key.length === 1) { effectiveCharCode = key.charCodeAt(0); } const event = new KeyboardEvent(eventType, { key: key, code: `Key${key.toUpperCase()}`, keyCode: keyCode, which: keyCode, charCode: eventType === 'keypress' ? effectiveCharCode : 0, bubbles: true, cancelable: true, ctrlKey: ctrlKey, altKey: altKey, shiftKey: shiftKey, metaKey: metaKey }); try { target.dispatchEvent(event); } catch (e) { console.warn("Falha ao despachar evento:", eventType, key, e); } }

  // simulateBackspace: Mantida (JS Lógica)
  async function simulateBackspace(targetElement) { /* ... código JS mantido ... */ if (!targetElement || !document.body.contains(targetElement)) return false; dispatchKeyEvent(targetElement, 'keydown', 'Backspace', 8); let valueChanged = false; if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') { const start = targetElement.selectionStart; const end = targetElement.selectionEnd; const currentValue = targetElement.value; let newValue = currentValue; let newCursorPos = start; if (start !== end) { newValue = currentValue.substring(0, start) + currentValue.substring(end); newCursorPos = start; valueChanged = true; } else if (start > 0) { newValue = currentValue.substring(0, start - 1) + currentValue.substring(end); newCursorPos = start - 1; valueChanged = true; } if (valueChanged) { try { const prototype = Object.getPrototypeOf(targetElement); const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value'); if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); } else { targetElement.value = newValue; } targetElement.selectionStart = targetElement.selectionEnd = newCursorPos; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } catch(e) { console.warn("Erro ao definir valor/disparar evento no backspace simulado", e); targetElement.value = newValue; targetElement.selectionStart = targetElement.selectionEnd = newCursorPos; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } } } else if (targetElement.isContentEditable) { document.execCommand('delete', false, null); valueChanged = true; } dispatchKeyEvent(targetElement, 'keyup', 'Backspace', 8); if(MIN_DELAY > 0) await new Promise(r => setTimeout(r, MIN_DELAY)); return valueChanged; }

  // sendChar: Mantida (JS Lógica)
  function sendChar(targetElement, c) { /* ... código JS mantido ... */ if (!targetElement || !document.body.contains(targetElement)) { console.warn("sendChar: targetElement inválido ou não está no DOM."); return false; } const keyCode = c.charCodeAt(0); dispatchKeyEvent(targetElement, 'keydown', c, keyCode); dispatchKeyEvent(targetElement, 'keypress', c, keyCode, keyCode); let valueChanged = false; if (targetElement.isContentEditable) { try { document.execCommand('insertText', false, c); valueChanged = true; } catch (e) { console.warn("sendChar: Falha no execCommand('insertText'):", e); } } else if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') { const start = targetElement.selectionStart; const end = targetElement.selectionEnd; const currentValue = targetElement.value; const newValue = currentValue.substring(0, start) + c + currentValue.substring(end); try { const prototype = Object.getPrototypeOf(targetElement); const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value'); if (descriptor && descriptor.set) { descriptor.set.call(targetElement, newValue); } else { targetElement.value = newValue; } targetElement.selectionStart = targetElement.selectionEnd = start + c.length; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); valueChanged = true; } catch (e) { console.warn("Erro ao definir valor via descritor no sendChar", e); try { targetElement.value = newValue; targetElement.selectionStart = targetElement.selectionEnd = start + c.length; targetElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); targetElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); valueChanged = true; } catch (e2) { console.error("Falha total ao definir valor ou disparar eventos em sendChar:", e2); } } } dispatchKeyEvent(targetElement, 'keyup', c, keyCode); return valueChanged; }

  // clearTextareaSimulated: Mantida (JS Lógica)
  async function clearTextareaSimulated(textareaElement) { /* ... código JS mantido ... */ if (!textareaElement || !document.body.contains(textareaElement)) { console.error("clearTextareaSimulated: Elemento alvo inválido."); return; } console.log("Iniciando limpeza rápida da textarea (Select All + Backspace)..."); try { textareaElement.focus({ preventScroll: true }); await new Promise(r => setTimeout(r, 50)); textareaElement.select(); console.log("Texto selecionado."); await new Promise(r => setTimeout(r, 50)); await simulateBackspace(textareaElement); console.log("Backspace simulado."); if (textareaElement.value !== "") { console.warn("Limpeza com select/backspace falhou, forçando valor vazio."); const prototype = Object.getPrototypeOf(textareaElement); const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value'); try { if (descriptor && descriptor.set) { descriptor.set.call(textareaElement, ""); } else { textareaElement.value = ""; } textareaElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); textareaElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } catch(e) { textareaElement.value = ""; } } else { console.log("Textarea limpa com sucesso."); } } catch (error) { console.error("Erro durante clearTextareaSimulated:", error); try { textareaElement.value = ""; textareaElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); textareaElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true })); } catch(e2) {/* ignore */} } }

  // typeTextFast: Mantida (JS Lógica)
  async function typeTextFast(text, targetElement) { /* ... código JS mantido ... */ if (!targetElement || !document.body.contains(targetElement)) { console.error("typeTextFast: Elemento alvo inválido."); return false; } console.log(`Iniciando digitação simulada com delay de ${SIMULATED_TYPE_DELAY}ms...`); try { targetElement.focus({ preventScroll: true }); } catch (focusError) { console.warn("typeTextFast: Falha ao focar elemento:", focusError); } let success = true; for (let i = 0; i < text.length; i++) { const char = text[i]; const charSuccess = sendChar(targetElement, char); if (!charSuccess) { console.warn(`Falha ao digitar o caractere simulado: "${char}" na posição ${i}`); } if (SIMULATED_TYPE_DELAY > 0) { await new Promise(r => setTimeout(r, SIMULATED_TYPE_DELAY)); } if (i % 100 === 0 && i > 0) { console.log(`Digitando simulado... ${i}/${text.length}`); } } console.log("Digitação simulada concluída."); return success; }

  // callPuterAI: Mantida (JS Lógica)
  async function callPuterAI(prompt, isCorrection = true) { /* ... código JS mantido ... */ return new Promise((resolve, reject) => { console.log("Chamando Puter.JS AI..."); const executeAIChat = () => { if (!window.puter || !window.puter.ai || typeof window.puter.ai.chat !== 'function') { return reject(new Error("Puter.JS ou puter.ai.chat não está disponível.")); } puter.ai.chat(prompt) .then(response => { console.log("Puter.JS AI respondeu (raw):", response); let resultText = null; if (typeof response === 'object' && response !== null && typeof response.message === 'object' && response.message !== null && typeof response.message.content === 'string') { resultText = response.message.content; console.log("Texto extraído com sucesso de response.message.content."); } else if (typeof response === 'string') { resultText = response; console.log("A resposta da IA já era uma string."); } if (resultText !== null) { resolve(resultText.trim()); } else { console.error("Não foi possível extrair texto da resposta da IA (estrutura inesperada):", response); reject(new Error("Formato de resposta da IA inesperado ou sem conteúdo textual.")); } }) .catch(error => { console.error("Erro ao chamar Puter.JS AI:", error); reject(new Error(`Erro na chamada da IA: ${error.message || error}`)); }); }; if (window.puter) { console.log("Puter.JS já carregado."); executeAIChat(); } else { console.log("Carregando Puter.JS..."); const s = document.createElement('script'); s.src = 'https://js.puter.com/v2/'; s.onload = () => { console.log("Puter.JS carregado com sucesso."); setTimeout(executeAIChat, 100); }; s.onerror = (err) => { console.error("Falha ao carregar Puter.JS:", err); reject(new Error("Não foi possível carregar o script do Puter.JS.")); }; document.body.appendChild(s); } }); }

  // removeOverlay: Mantida (JS Lógica)
  function removeOverlay(elementOrId) { /* ... código JS mantido ... */ if ((typeof elementOrId === 'string' && elementOrId === 'bmAILoadingSplash') || (elementOrId instanceof HTMLElement && elementOrId.id === 'bmAILoadingSplash')) { if (aiStatusIntervalId) { clearInterval(aiStatusIntervalId); aiStatusIntervalId = null; console.log("Intervalo de status da IA limpo."); } } let overlayElement = null; if (typeof elementOrId === 'string') { overlayElement = document.getElementById(elementOrId); } else if (elementOrId instanceof HTMLElement) { overlayElement = elementOrId; } if (overlayElement && document.body.contains(overlayElement)) { overlayElement.style.opacity = '0'; overlayElement.style.pointerEvents = 'none'; setTimeout(() => { if (overlayElement && document.body.contains(overlayElement)) { document.body.removeChild(overlayElement); } }, 300); } }
  // showAIReviewOverlayStyled, showAILoadingOverlayStyled, updateAIProgressBar: Mantidas (JS Lógica)
  async function showAIReviewOverlayStyled() { /* ... código JS mantido ... */ return new Promise((resolve) => { const overlayId = 'bmAIReviewSplash'; removeOverlay(overlayId); const overlay = document.createElement('div'); overlay.id = overlayId; overlay.className = 'bmSimpleOverlay'; overlay.innerHTML = ` <div class="bmSimpleOverlayContent"> <h2 style="font-size: 1.5em; margin-bottom: 15px;">Revisão Final pela IA</h2> <p style="font-size: 1em; line-height: 1.5; color: #ccc; margin-bottom: 20px;"> Deseja que a IA revise o texto final? </p> <div class="bmDialogButtonContainer"> <button id="bmAINoBtn" class="bmDialogButton secondary">Não</button> <button id="bmAIYesBtn" class="bmDialogButton">Sim</button> </div> </div>`; document.body.appendChild(overlay); void overlay.offsetWidth; overlay.style.opacity = '1'; document.getElementById('bmAIYesBtn').onclick = () => { resolve(true); removeOverlay(overlay); }; document.getElementById('bmAINoBtn').onclick = () => { resolve(false); removeOverlay(overlay); }; }); }
  function showAILoadingOverlayStyled(initialMessage = "Processando IA...") { /* ... código JS mantido ... */ const overlayId = 'bmAILoadingSplash'; removeOverlay(overlayId); const overlay = document.createElement('div'); overlay.id = overlayId; overlay.className = 'bmSimpleOverlay'; overlay.innerHTML = ` <div id="bmAILoadingContent" class="bmSimpleOverlayContent"> <div class="bmAdvLoadingState" style="display: flex; flex-direction: column; align-items: center;"> <div class="applying-text" style="font-size: 1.2em; margin-bottom: 15px;">${initialMessage}</div> <div class="bmProgressBarContainer" style="width: 80%; height: 6px; background-color: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden;"> <div class="bmProgressBar" style="width: 0%; height: 100%; background-color: #a056f7; border-radius: 3px; transition: width 0.3s ease;"></div> </div> </div> </div>`; document.body.appendChild(overlay); void overlay.offsetWidth; overlay.style.opacity = '1'; return { overlayElement: overlay, statusTextElement: overlay.querySelector('.applying-text'), progressBarElement: overlay.querySelector('.bmProgressBar') }; }
  function updateAIProgressBar(progressBarElement, targetPercentage) { /* ... código JS mantido ... */ if (progressBarElement) { const clampedPercentage = Math.max(0, Math.min(100, targetPercentage)); progressBarElement.style.width = `${clampedPercentage}%`; } }

  // extractProposalText: Mantida (JS Lógica)
  function extractProposalText() { /* ... código JS mantido ... */ console.log("Tentando extrair texto da proposta..."); try { const h3Elements = document.querySelectorAll('h3'); let proposalH3 = null; for (const h3 of h3Elements) { if (h3.textContent.trim().toUpperCase() === 'PROPOSTA') { proposalH3 = h3; break; } } if (!proposalH3) { console.warn("H3 'PROPOSTA' não encontrado."); return null; } let nextElement = proposalH3.nextElementSibling; while (nextElement) { if (nextElement.matches('.ql-editor')) { const proposalText = nextElement.innerText || nextElement.textContent; console.log("Texto da proposta extraído:", proposalText.substring(0, 100) + "..."); return proposalText.trim(); } const qlEditorInChildren = nextElement.querySelector('.ql-editor'); if (qlEditorInChildren) { const proposalText = qlEditorInChildren.innerText || qlEditorInChildren.textContent; console.log("Texto da proposta extraído (dentro de container):", proposalText.substring(0, 100) + "..."); return proposalText.trim(); } nextElement = nextElement.nextElementSibling; } console.warn("Elemento '.ql-editor' após H3 'PROPOSTA' não encontrado."); return null; } catch (error) { console.error("Erro ao extrair texto da proposta:", error); return null; } }
  // showBusySplash: Mantida (JS Lógica)
  function showBusySplash(message1 = "Processando...", message2 = "Aguarde um momento.") { /* ... código JS mantido ... */ const overlayId = 'bmBusySplash'; removeOverlay(overlayId); const overlay = document.createElement('div'); overlay.id = overlayId; overlay.className = 'bmSimpleOverlay'; overlay.innerHTML = ` <div class="bmBusyContent" style="text-align: center;"> <p class="bmBusyMessage1" style="font-size: 1.3em; font-weight: 600; margin-bottom: 10px; color: #e0cffc;">${message1}</p> <p class="bmBusyMessage2" style="font-size: 1em; color: #ccc;">${message2}</p> </div> `; document.body.appendChild(overlay); void overlay.offsetWidth; overlay.style.opacity = '1'; return overlay; }

  // --- Função showPromptInputDialog (JS Mantido) ---
  async function showPromptInputDialog() {
      return new Promise((resolve) => {
          const dialogId = 'bmPromptInputDialog'; removeOverlay(dialogId);
          const overlay = document.createElement('div'); overlay.id = dialogId; overlay.className = 'bmDialogOverlay';
          const dialogBox = document.createElement('div'); dialogBox.className = 'bmDialogBox'; dialogBox.style.minWidth = '400px'; dialogBox.style.maxWidth = '600px';
          dialogBox.innerHTML = ` <div class="bmDialogIcon question">?</div> <h3 style="color: #e0cffc; margin-bottom: 15px; font-size: 1.2em;">Prompt para IA</h3> <p class="bmDialogMessage" style="margin-bottom: 15px; font-size: 1em;"> Digite o que a IA deve gerar. <br><small>(Contexto da "Proposta" será adicionado se encontrado).</small> </p> <textarea id="bmUserInputPrompt" style="width: 100%; min-height: 80px; margin-bottom: 20px; padding: 8px; font-size: 0.9em; font-family: monospace; background: #252528; border: 1px solid #555; border-radius: 4px; color: #eee; box-sizing: border-box; resize: vertical;" placeholder="Ex: Crie um poema..."></textarea> <div class="bmDialogButtonContainer"></div> `;
          const textarea = dialogBox.querySelector('#bmUserInputPrompt'); const buttonContainer = dialogBox.querySelector('.bmDialogButtonContainer');
          const btnCancel = document.createElement('button'); btnCancel.textContent = 'Cancelar'; btnCancel.className = 'bmDialogButton secondary'; btnCancel.onclick = () => { overlay.style.opacity = '0'; setTimeout(() => { if (document.body.contains(overlay)) { document.body.removeChild(overlay); } resolve(null); }, 300); };
          const btnGenerate = document.createElement('button'); btnGenerate.textContent = 'Gerar Texto'; btnGenerate.className = 'bmDialogButton'; btnGenerate.onclick = () => { const userPromptText = textarea.value.trim(); if (!userPromptText) { textarea.style.borderColor = 'red'; textarea.focus(); setTimeout(() => { textarea.style.borderColor = '#555'; }, 1500); return; } overlay.style.opacity = '0'; setTimeout(() => { if (document.body.contains(overlay)) { document.body.removeChild(overlay); } resolve(userPromptText); }, 300); };
          buttonContainer.appendChild(btnCancel); buttonContainer.appendChild(btnGenerate); overlay.appendChild(dialogBox); document.body.appendChild(overlay);
          void overlay.offsetWidth; overlay.style.opacity = '1'; dialogBox.style.opacity = '1';
          setTimeout(() => textarea.focus(), 50);
      });
  }

  // Splash Inicial (JS Lógica Mantida)
  const splash = document.createElement('div'); splash.id = 'bmSplash';
  splash.innerHTML = `<div id="bmSplashContent"> <div id="bmSplashTexts"> <div id="bmSplashTitle">${SCRIPT_BRANDING}</div> <div id="bmSplashSubtitle">Redação Rush Lite</div> </div> <div id="bmLoadingBar"><div id="bmLoadingProgress"></div></div></div>`;
  document.body.appendChild(splash);

  // --- CSS INJETADO (VERSÃO LITE - Mantida da resposta anterior) ---
  const css = `
      /* Estilos Lite - Foco na funcionalidade, menos animação/efeitos */

      /* Splash Screen Simples */
      #bmSplash { position: fixed; inset: 0; background: #0a0514; display: flex; align-items: center; justify-content: center; z-index: 99999; opacity: 1; transition: opacity 0.5s ease-out; }
      #bmSplashContent { text-align: center; color: #eee; }
      #bmSplashTexts { margin-bottom: 20px; }
      #bmSplashTitle { font-size: 2em; font-weight: bold; color: #e0cffc; margin-bottom: 5px; font-family: sans-serif; }
      #bmSplashSubtitle { font-size: 1.1em; color: #aaa; font-family: sans-serif; }
      #bmLoadingBar { width: 200px; height: 4px; background-color: rgba(255, 255, 255, 0.1); border-radius: 2px; margin: 20px auto 0; overflow: hidden; }
      #bmLoadingProgress { width: 0%; height: 100%; background-color: #a056f7; border-radius: 2px; transition: width 1s ease-out; /* Animação simples da barra */ }

      /* Overlays e Diálogos Simplificados */
      .bmDialogOverlay, .bmSimpleOverlay {
          position: fixed; inset: 0; background: rgba(10, 5, 20, 0.85);
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100001; opacity: 0; transition: opacity 0.3s ease-out; pointer-events: none;
      }
      .bmDialogBox, .bmSimpleOverlayContent {
          background: #2a2a2f; color: #eee; padding: 25px 30px; border-radius: 8px;
          border: 1px solid #444; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
          min-width: 300px; max-width: 90%; text-align: center; font-family: sans-serif; opacity: 0;
          transition: opacity 0.3s ease-out; max-height: 85vh; overflow-y: auto;
          display: flex; flex-direction: column;
      }
      .bmDialogOverlay[style*="opacity: 1;"],
      .bmSimpleOverlay[style*="opacity: 1;"] { pointer-events: auto; }
      .bmDialogOverlay[style*="opacity: 1;"] .bmDialogBox,
      .bmSimpleOverlay[style*="opacity: 1;"] .bmSimpleOverlayContent { opacity: 1; }
      .bmDialogIcon {
          width: 40px; height: 40px; border-radius: 50%; margin: 0 auto 15px auto;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5em; font-weight: bold; color: #fff; flex-shrink: 0;
      }
      .bmDialogIcon.info    { background-color: #58a6ff; }
      .bmDialogIcon.success { background-color: #56d364; }
      .bmDialogIcon.warning { background-color: #f1c40f; color: #333; }
      .bmDialogIcon.error   { background-color: #e74c3c; }
      .bmDialogIcon.question{ background-color: #9b59b6; }
      .bmDialogMessage { font-size: 1em; line-height: 1.5; margin: 0 0 20px 0; color: #ccc; flex-grow: 1; }
      .bmDialogButtonContainer { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; flex-shrink: 0; margin-top: 15px; }
      .bmDialogButton {
          padding: 8px 20px; font-size: 0.9em; font-weight: bold;
          background-color: #8A2BE2; border: none; border-radius: 5px; color: #fff;
          cursor: pointer; transition: background-color 0.2s ease;
      }
      .bmDialogButton:hover { background-color: #a056f7; }
      .bmDialogButton:active { background-color: #7022b6; }
      .bmDialogButton.secondary { background-color: #555; }
      .bmDialogButton.secondary:hover { background-color: #777; }
      .bmDialogButton.secondary:active { background-color: #444; }

      /* Janela Principal Lite */
      #bmWrapper {
          position: fixed; top: 15px; right: 15px;
          width: ${MIN_WRAPPER_WIDTH}px; min-width: ${MIN_WRAPPER_WIDTH}px;
          border: 1px solid #444; border-radius: 8px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4); font-family: sans-serif; color: #f0f0f0;
          opacity: 0; transition: opacity 0.4s ease-out; z-index: 99998; overflow: hidden;
          background-color: #1e1e24; display: flex; flex-direction: column;
      }
      #bmWrapper.show { opacity: 1; }
      #bmHeader {
          cursor: move; padding: 8px 10px; background-color: #2a2a2f;
          border-bottom: 1px solid #444; font-size: 0.9em; font-weight: 600;
          user-select: none; display: flex; align-items: center; justify-content: space-between;
      }
      #bmHeader span:first-child { flex-grow: 1; text-align: center; color: #f5f5f5; padding-left: 20px; }
      #bmMinimizeBtn { font-size: 1.2em; font-weight: bold; color: #bbb; cursor: pointer; padding: 0 5px; line-height: 1; transition: color 0.2s ease; user-select: none; }
      #bmMinimizeBtn:hover { color: #fff; }
      #bmWrapper.minimized { height: auto !important; min-height: 0 !important; background-color: #2a2a2f; }
      #bmWrapper.minimized #bmContent { display: none; }
      #bmWrapper.minimized #bmHeader { border-bottom: none; }
      #bmContent {
          padding: 10px; background-color: #1e1e24; transition: none;
          max-height: 400px; overflow-y: auto; overflow-x: hidden;
      }
      #bmContent textarea, #bmContent input[type="number"] {
          width: 100%; margin-bottom: 8px; padding: 6px 8px; font-size: 0.9em;
          font-family: monospace; background: #252528; border: 1px solid #555;
          border-radius: 4px; color: #eee; box-sizing: border-box; resize: vertical;
          transition: border-color 0.2s ease;
      }
      #bmContent textarea { min-height: 50px; }
      #bmContent textarea:focus, #bmContent input[type="number"]:focus { outline: none; border-color: #a056f7; }
      #bmContent button {
          width: 100%; padding: 8px; margin-top: 5px; font-size: 0.9em; font-weight: bold;
          background-color: #8A2BE2; border: none; border-radius: 5px; color: #fff;
          cursor: pointer; transition: background-color 0.2s ease; box-sizing: border-box;
      }
      #bmContent button:disabled { cursor: not-allowed; opacity: 0.5; background-color: #555 !important; }
      #bmContent button:not(:disabled):hover { background-color: #a056f7; }
      #bmContent button:not(:disabled):active { background-color: #7022b6; }

      /* Toggles Simplificados */
      #bmToggleWrapper, #bmDarkModeToggleWrapper {
          display: flex; align-items: center; gap: 6px; margin-bottom: 8px;
          cursor: pointer; padding: 4px; border-radius: 4px;
          transition: background-color 0.2s ease;
      }
      #bmToggleWrapper:hover, #bmDarkModeToggleWrapper:hover { background-color: rgba(138, 43, 226, 0.2); }
      #bmToggleImg, #bmDarkModeToggleImg {
          width: 14px; height: 14px; border: 1px solid #888; border-radius: 3px;
          background-color: #333; transition: background-color .2s ease, border-color 0.2s ease;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative;
      }
      #bmToggleImg.active, #bmDarkModeToggleImg.active { background-color: #8A2BE2; border-color: #a056f7; }
      #bmToggleImg.active::after, #bmDarkModeToggleImg.active::after { content: '✓'; position: absolute; font-size: 10px; color: #fff; line-height: 14px; }
      #bmToggleText, #bmDarkModeToggleText { font-size: 0.85em; color: #ccc; user-select: none; line-height: 1.2; }

      /* Countdown simples */
      .bmCountdownNumber {
          position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
          font-family: sans-serif; font-weight: bold; color: #8A2BE2; font-size: 1.8em; z-index: 10;
      }

      /* Botão Opções (...) Lite */
      #bmOptionsBtn {
          background: none; border: none; color: #a056f7; font-size: 1.2em;
          font-weight: bold; padding: 5px 0; margin-top: 8px; width: 100%;
          text-align: center; cursor: pointer; transition: color 0.2s ease;
      }
      #bmOptionsBtn:hover { color: #c89bff; }
      #bmOptionsBtn:disabled { color: #666; cursor: not-allowed; }

      /* Menu de Opções Lite */
      #bmOptionsMenu {
          position: absolute; bottom: 35px; right: 10px; background-color: #333338;
          border: 1px solid #555; border-radius: 6px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
          z-index: 100005; padding: 5px 0; min-width: 160px; opacity: 0;
          transition: opacity 0.2s ease-out; pointer-events: none;
      }
      #bmOptionsMenu.show { opacity: 1; pointer-events: auto; }
      .bmMenuOption {
          display: block; background: none; border: none; color: #e0e0e0;
          padding: 8px 15px; text-align: left; width: 100%; font-size: 0.9em;
          cursor: pointer; transition: background-color 0.15s ease;
      }
      .bmMenuOption:hover { background-color: rgba(138, 43, 226, 0.3); color: #fff; }

      /* Splash Ocupado Simplificado */
      .bmBusyContent { text-align: center; }
      .bmBusyMessage1 { font-size: 1.2em; font-weight: 600; margin-bottom: 8px; color: #e0cffc; }
      .bmBusyMessage2 { font-size: 0.9em; color: #ccc; max-width: 400px; line-height: 1.4; }

      /* Modo Disfarçado Lite */
      #bmWrapper.stealth-mode {
          background: rgba(232, 240, 254, 0.9); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
          border: 1px solid #a0b0d0; color: #333; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      }
      #bmWrapper.stealth-mode #bmHeader { background: #a0b0d0; border-color: #a0b0d0; color: #333; }
      #bmWrapper.stealth-mode #bmContent { background: rgba(240, 245, 255, 0.85); }
      #bmWrapper.stealth-mode textarea, #bmWrapper.stealth-mode input[type="number"] { background: #fff; border-color: #a0b0d0; color: #222; box-shadow: none; }
      #bmWrapper.stealth-mode textarea:focus, #bmWrapper.stealth-mode input[type="number"]:focus { border-color: #7b53c1; box-shadow: none; }
      #bmWrapper.stealth-mode button { border: 1px solid #7b53c1; color: #fff; background: #7b53c1; box-shadow: none; transition: background-color 0.2s ease; }
      #bmWrapper.stealth-mode button:disabled { border-color: #a0b0d0; color: #99aacc; background: #d0d8ea !important; opacity: 0.7; }
      #bmWrapper.stealth-mode button:not(:disabled):hover { background-color: #916dcf; border-color: #916dcf; }
      #bmWrapper.stealth-mode button:not(:disabled):active { background-color: #653f B3; border-color: #653f B3; }
      #bmWrapper.stealth-mode #bmToggleWrapper:hover, #bmWrapper.stealth-mode #bmDarkModeToggleWrapper:hover { background-color: rgba(123, 83, 193, 0.1); }
      #bmWrapper.stealth-mode #bmToggleImg, #bmWrapper.stealth-mode #bmDarkModeToggleImg { border-color: #88aadd; background-color: #fff; }
      #bmWrapper.stealth-mode #bmToggleImg.active, #bmWrapper.stealth-mode #bmDarkModeToggleImg.active { background: #7b53c1; border-color: #7b53c1; }
      #bmWrapper.stealth-mode #bmToggleImg.active::after, #bmWrapper.stealth-mode #bmDarkModeToggleImg.active::after { color: #fff; }
      #bmWrapper.stealth-mode #bmToggleText, #bmWrapper.stealth-mode #bmDarkModeToggleText { color: #335a8a; }
      #bmWrapper.stealth-mode #bmOptionsBtn { color: #7b53c1; }
      #bmWrapper.stealth-mode #bmOptionsBtn:hover { color: #5070a0; }
      #bmWrapper.stealth-mode.minimized #bmHeader { background: #a0b0d0; }

      /* Splash Correção Avançada Lite */
      .bmAdvSplashContent { max-width: 700px; text-align: center; }
      #bmAdvSplashContent h2 { font-size: 1.4em; font-weight: bold; color: #e0cffc; margin: 0 0 15px 0; }
      .bmAdvContextDisplay {
          font-family: serif; font-size: 1.1em; line-height: 1.6; color: #ccc; margin-bottom: 20px;
          padding: 10px 15px; background: rgba(0, 0, 0, 0.2); border-radius: 6px;
          border: 1px dashed rgba(255, 255, 255, 0.2); text-align: center; min-height: 3em;
          /* Adicionado para limpar explicitamente */
          transition: opacity 0.2s ease-out;
      }
      .bmAdvContextDisplay .error-word { background-color: rgba(231, 76, 60, 0.6); color: #fff; padding: 0.1em 0.2em; border-radius: 3px; font-weight: bold; }
      .bmAdvContextDisplay .context-before, .bmAdvContextDisplay .context-after { opacity: 0.8; }
      .bmAdvOptionsContainer { margin-top: 15px; }
       /* Adicionado para limpar explicitamente */
      .bmAdvSuggestionButtons, .bmAdvActionButtons { transition: opacity 0.2s ease-out; }
      .bmAdvSuggestionButtons { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 15px; }
      .bmAdvSuggestionButton {
          padding: 6px 12px; font-size: 0.9em; font-weight: 500; background-color: #4CAF50;
          border: none; border-radius: 4px; color: #fff; cursor: pointer; transition: background-color 0.2s ease;
      }
      .bmAdvSuggestionButton:hover { background-color: #66bb6a; }
      .bmAdvSuggestionButton:active { background-color: #388e3c; }
      .bmAdvActionButtons { display: flex; justify-content: center; gap: 15px; margin-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 15px; }
      .bmAdvActionButton {
          padding: 7px 18px; font-size: 0.85em; font-weight: bold; border: none; border-radius: 4px;
          color: #fff; cursor: pointer; transition: background-color 0.2s ease;
      }
      .bmAdvActionButton.manual { background-color: #f39c12; }
      .bmAdvActionButton.manual:hover { background-color: #f5b041; }
      .bmAdvActionButton.manual:active { background-color: #d35400; }
      .bmAdvActionButton.skip { background-color: #5D6D7E; }
      .bmAdvActionButton.skip:hover { background-color: #85929E; }
      .bmAdvActionButton.skip:active { background-color: #34495E; }
      .bmAdvLoadingState { /* Estado de loading simples */
          display: none; flex-direction: column; align-items: center; justify-content: center;
          position: absolute; inset: 0; background: rgba(10, 5, 20, 0.8); border-radius: inherit; z-index: 10;
          transition: opacity 0.3s ease-in;
      }
      .bmAdvLoadingState .applying-text { font-size: 1.1em; color: #ddd; }

      /* --- MODO ESCURO PÁGINA (Mantido) --- */
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
       body.bm-dark-mode textarea.jss17:focus { outline: 1px solid var(--blue-light) !important; box-shadow: none; }
       body.bm-dark-mode .MuiInputBase-root.Mui-disabled, body.bm-dark-mode .MuiInputBase-root.Mui-disabled .MuiOutlinedInput-notchedOutline { background-color: #333 !important; border-color: #444 !important; color: #777 !important; -webkit-text-fill-color: #777 !important; opacity: 0.6 !important; }
       body.bm-dark-mode .MuiInputBase-input::placeholder { color: #888 !important; opacity: 1 !important; }
       body.bm-dark-mode button { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease !important; }
       body.bm-dark-mode button.jss21 { background-color: var(--blue-light) !important; color: #fff !important; border: 1px solid var(--blue-light) !important; }
       body.bm-dark-mode button.jss21:hover { filter: brightness(1.15); }
       body.bm-dark-mode button[style*="background: var(--green)"] { background-color: var(--green) !important; color: #fff !important; border: 1px solid var(--green) !important; }
       body.bm-dark-mode button[style*="background: var(--green)"]:hover { filter: brightness(1.15); }
       body.bm-dark-mode button[style*="background: var(--blue-light)"][style*="color: var(--white)"] { background-color: var(--blue-light) !important; color: #fff !important; border: 1px solid var(--blue-light) !important; }
       body.bm-dark-mode button[style*="background: var(--blue-light)"][style*="color: var(--white)"]:hover { filter: brightness(1.15); }
       body.bm-dark-mode button[style*="background: white"][style*="border-color: var(--blue-light)"] { background-color: transparent !important; color: var(--blue-light) !important; border: 1px solid var(--blue-light) !important; }
       body.bm-dark-mode button[style*="background: white"][style*="border-color: var(--blue-light)"]:hover { background-color: rgba(123, 83, 193, 0.1) !important; }
       body.bm-dark-mode button.jss26 { color: #90caf9 !important; }
       body.bm-dark-mode .MuiIconButton-root { color: #bbb !important; }
       body.bm-dark-mode .MuiIconButton-root:hover { background-color: rgba(255, 255, 255, 0.08) !important; }
       body.bm-dark-mode button:disabled { background-color: #444 !important; color: #888 !important; border-color: #555 !important; cursor: not-allowed !important; opacity: 0.5 !important; filter: none !important; }
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
       body.bm-dark-mode div[vw] [vw-access-button] { filter: brightness(0.9); }
       body.bm-dark-mode #bmOptionsMenu { background-color: #333338 !important; border-color: #555 !important; }
       body.bm-dark-mode .bmMenuOption { color: #e0e0e0 !important; }
       body.bm-dark-mode .bmMenuOption:hover { background-color: rgba(123, 83, 193, 0.3) !important; color: #fff !important; }
  `;
  const styleTag = document.createElement('style'); styleTag.textContent = css; document.head.appendChild(styleTag);

  // --- LÓGICA PRINCIPAL E UI (JS Mantido) ---
  const splashTimeout = 1500;
  setTimeout(() => {
      const progress = document.getElementById('bmLoadingProgress');
      if (progress) progress.style.width = '100%';
  }, 100);

  setTimeout(() => {
      // Restante da lógica JS IDENTICA
      if (document.body.contains(splash)) { splash.style.opacity = '0'; setTimeout(()=> splash.remove(), 500); }
      const wrapper = document.createElement('div'); wrapper.id = 'bmWrapper';
      wrapper.innerHTML = ` <div id="bmHeader"><span>${SCRIPT_BRANDING}</span><span id="bmMinimizeBtn" title="Minimizar/Expandir">-</span></div> <div id="bmContent"> <textarea id="bmText" placeholder="Cole o texto aqui ou use Gerar Texto"></textarea> <input id="bmDelay" type="number" step="1" value="${SIMULATED_TYPE_DELAY}" min="0" placeholder="Delay Digitação (ms)" title="Delay para 'Iniciar Digitação'"> <div id="bmToggleWrapper"><div id="bmToggleImg"></div> <span id="bmToggleText">Modo Disfarçado</span></div> <div id="bmDarkModeToggleWrapper"><div id="bmDarkModeToggleImg"></div> <span id="bmDarkModeToggleText">Modo Escuro (Página)</span></div> <button id="bmBtn">Iniciar Digitação</button> <button id="bmBtnCorrect">Corrigir Automaticamente</button> <button id="bmOptionsBtn" title="Mais Opções">...</button> </div> `;
      document.body.appendChild(wrapper);
      const bmContent = document.getElementById('bmContent');
      const bmMinimizeBtn = document.getElementById('bmMinimizeBtn');
      const header = document.getElementById('bmHeader');
      const uiWrapperElement = wrapper;
      const optionsButton = document.getElementById('bmOptionsBtn');
      const bmTextArea = document.getElementById('bmText');
      const delayInputEl = document.getElementById('bmDelay');
      const startButton = document.getElementById('bmBtn');
      const correctButton = document.getElementById('bmBtnCorrect');

      setTimeout(() => uiWrapperElement.classList.add('show'), 50);

      // Lógicas de Arrastar, Minimizar, Stealth, Dark Mode: Mantidas (JS Lógica)
      let isDragging = false; let dragStartX, dragStartY, initialLeft, initialTop; header.onmousedown = e => { if (e.target === bmMinimizeBtn || bmMinimizeBtn.contains(e.target)) return; isDragging = true; dragStartX = e.clientX; dragStartY = e.clientY; initialLeft = uiWrapperElement.offsetLeft; initialTop = uiWrapperElement.offsetTop; header.style.cursor = 'grabbing'; document.addEventListener('mousemove', onDragMove); document.addEventListener('mouseup', onDragUp); e.preventDefault(); }; function onDragMove(e) { if (!isDragging) return; const dx = e.clientX - dragStartX; const dy = e.clientY - dragStartY; uiWrapperElement.style.left = initialLeft + dx + 'px'; uiWrapperElement.style.top = initialTop + dy + 'px'; } function onDragUp() { if (isDragging) { isDragging = false; header.style.cursor = 'move'; document.removeEventListener('mousemove', onDragMove); document.removeEventListener('mouseup', onDragUp); } }
      if(bmMinimizeBtn && uiWrapperElement){ bmMinimizeBtn.onclick = (e) => { e.stopPropagation(); const isMinimized = uiWrapperElement.classList.toggle('minimized'); bmMinimizeBtn.textContent = isMinimized ? '+' : '-'; bmMinimizeBtn.title = isMinimized ? 'Expandir' : 'Minimizar'; if (stealthOn) { setTimeout(() => { try { rect = uiWrapperElement.classList.contains('minimized') ? header.getBoundingClientRect() : uiWrapperElement.getBoundingClientRect(); } catch(err){ console.warn("Erro ao obter rect no modo disfarçado minimizado.")} }, 50); } }; }
      const toggleWrapper = document.getElementById('bmToggleWrapper'); const toggleBox = document.getElementById('bmToggleImg'); let stealthOn = false; let firstTimeStealth = true; let rect = null; function handleStealthMouseMove(ev) { if (!ev || typeof ev.clientX === 'undefined' || typeof ev.clientY === 'undefined') { return; } if (!stealthOn || !uiWrapperElement || !document.body.contains(uiWrapperElement)) { exitStealth(); return; } try { if (!rect) { rect = uiWrapperElement.classList.contains('minimized') ? header.getBoundingClientRect() : uiWrapperElement.getBoundingClientRect(); if (!rect || rect.width === 0 || rect.height === 0) return; } const mouseX = ev.clientX; const mouseY = ev.clientY; const isInside = (rect && mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom); if (isInside) { if (uiWrapperElement.style.opacity !== '1') { uiWrapperElement.style.opacity = 1; uiWrapperElement.style.pointerEvents = 'auto'; } } else { if (uiWrapperElement.style.opacity !== '0') { rect = uiWrapperElement.classList.contains('minimized') ? header.getBoundingClientRect() : uiWrapperElement.getBoundingClientRect(); if (rect && rect.width > 0 && rect.height > 0) { uiWrapperElement.style.opacity = 0; uiWrapperElement.style.pointerEvents = 'none'; } } } } catch(err){ console.warn("Erro no handleStealthMouseMove:", err); exitStealth(); }} function enterStealth() { if (!uiWrapperElement || !document.body.contains(uiWrapperElement)) return; stealthOn = true; uiWrapperElement.classList.add('stealth-mode'); toggleBox.classList.add('active'); uiWrapperElement.style.opacity = 1; uiWrapperElement.style.pointerEvents = 'auto'; try { rect = uiWrapperElement.classList.contains('minimized') ? header.getBoundingClientRect() : uiWrapperElement.getBoundingClientRect(); if (!rect || rect.width === 0 || rect.height === 0) { throw new Error("Rect inválido ao entrar no modo disfarçado."); } document.addEventListener('mousemove', handleStealthMouseMove); uiWrapperElement.style.opacity = 0; uiWrapperElement.style.pointerEvents = 'none'; } catch (err) { console.error("Erro ao entrar no modo disfarçado:", err); stealthOn = false; uiWrapperElement.classList.remove('stealth-mode'); toggleBox.classList.remove('active'); uiWrapperElement.style.opacity = 1; uiWrapperElement.style.pointerEvents = 'auto'; showCustomAlert("Erro ao ativar Modo Disfarçado.", "error"); } } function exitStealth() { stealthOn = false; document.removeEventListener('mousemove', handleStealthMouseMove); if (uiWrapperElement && document.body.contains(uiWrapperElement)) { uiWrapperElement.classList.remove('stealth-mode'); toggleBox.classList.remove('active'); uiWrapperElement.style.opacity = 1; uiWrapperElement.style.pointerEvents = 'auto'; } rect = null; } function showStealthOverlay() { const ov = document.createElement('div'); ov.id = 'bmOv'; ov.className = 'bmSimpleOverlay'; ov.innerHTML = `<div class="bmSimpleOverlayContent"> <p style="font-size:1em; margin-bottom:15px;">O Modo Disfarçado oculta a janela quando o mouse não está sobre ela. Mova o mouse para a área da janela para revelá-la.</p> <button id="bmOvBtn" class="bmDialogButton">Entendido</button></div>`; document.body.appendChild(ov); void ov.offsetWidth; ov.style.opacity = '1'; document.getElementById('bmOvBtn').onclick = () => { removeOverlay(ov); enterStealth(); }; } toggleWrapper.onclick = () => { if (!stealthOn) { if (firstTimeStealth) { firstTimeStealth = false; showStealthOverlay(); } else { enterStealth(); } } else { exitStealth(); } };
      const darkModeToggleWrapper = document.getElementById('bmDarkModeToggleWrapper'); const darkModeToggleBox = document.getElementById('bmDarkModeToggleImg'); const applyDarkMode = (activate) => { isDarkModeOn = activate; darkModeToggleBox.classList.toggle('active', isDarkModeOn); document.body.classList.toggle('bm-dark-mode', isDarkModeOn); console.log("Dark Mode Página:", isDarkModeOn ? "ON" : "OFF"); }; applyDarkMode(false); darkModeToggleWrapper.onclick = () => { applyDarkMode(!isDarkModeOn); };

      // startButton.onclick (JS Lógica Mantida)
       startButton.onclick = async function() {
            const text = bmTextArea.value;
            const delayInputVal = parseInt(delayInputEl.value, 10);
            const currentButtonDelay = (!isNaN(delayInputVal) && delayInputVal >= 0) ? delayInputVal : SIMULATED_TYPE_DELAY;
            if (!text) { showCustomAlert('Texto vazio na caixa do script!', 'error'); return; }
            if (isCorrectionRunning || isGenerationRunning) { showCustomAlert('Aguarde a outra operação terminar.', 'warning'); return; }
            this.disabled = true; if (correctButton) correctButton.disabled = true; if (optionsButton) optionsButton.disabled = true;
            await showCustomAlert('Clique no campo onde deseja digitar o texto e clique OK.', 'info', [{ text: 'OK' }]);
            for (let n = 3; n >= 1; n--) {
                const cnt = document.createElement('div'); cnt.className = 'bmCountdownNumber'; cnt.textContent = n;
                if (uiWrapperElement && document.body.contains(uiWrapperElement) && !uiWrapperElement.classList.contains('minimized')) { uiWrapperElement.appendChild(cnt); } else { console.warn("Wrapper não visível para countdown."); }
                await new Promise(r => setTimeout(r, 600));
                if (uiWrapperElement && uiWrapperElement.contains(cnt)) { uiWrapperElement.removeChild(cnt); }
                await new Promise(r => setTimeout(r, 50));
            }
            let typingCompleted = true; console.log(`Iniciando digitação com delay ${currentButtonDelay}ms.`);
            try {
                for (let i = 0; i < text.length; i++) {
                    const char = text[i]; const currentFocus = document.activeElement;
                    if (!currentFocus || currentFocus === document.body || uiWrapperElement.contains(currentFocus)) { showCustomAlert('Nenhum campo de texto válido focado na página.', 'error'); typingCompleted = false; break; }
                    const success = sendChar(currentFocus, char);
                    if (!success) { showCustomAlert('Erro ao digitar caractere.', 'error'); typingCompleted = false; break; }
                    if (currentButtonDelay > 0) { await new Promise(r => setTimeout(r, currentButtonDelay)); }
                }
                if (typingCompleted) { showCustomAlert('Digitação concluída!', 'success'); }
            } catch (error) { console.error("Erro na simulação de digitação:", error); showCustomAlert("Erro inesperado na digitação.", 'error'); }
            finally { this.disabled = false; if (correctButton) correctButton.disabled = false; if (optionsButton) optionsButton.disabled = false; }
        };

      // --- LÓGICA CORREÇÃO AUTOMÁTICA (COM AJUSTES PARA SINCRONIA) ---
      // Funções auxiliares mantidas (JS Lógica)
      async function showModeSelectionDialog() { const buttons = [ { text: 'Básico', value: 'basic', class: 'secondary' }, { text: 'Avançado', value: 'advanced' } ]; return await showCustomAlert( 'Escolha o modo de correção:', 'question', buttons, 'bmModeSelectionDialog' ); }
      async function showBasicModeConfirmationDialog() { const buttons = [ { text: 'Cancelar', value: false, class: 'secondary' }, { text: 'Continuar (Básico)', value: true } ]; return await showCustomAlert( 'Modo Básico: Correção automática via IA (Puter.JS), sobrescrevendo o texto atual.', 'warning', buttons, 'bmBasicConfirmDialog' ); }
      function getContextAroundError(fullText, errorText, wordsBefore = 5, wordsAfter = 3) { /* ... código JS mantido ... */ const words = fullText.split(/(\s+)/); const errorWords = errorText.trim().split(/(\s+)/); let startIndex = -1; for (let i = 0; i <= words.length - errorWords.length; i++) { let match = true; for (let j = 0; j < errorWords.length; j++) { if (words[i + j] !== errorWords[j]) { match = false; break; } } if (match) { startIndex = i; break; } } if (startIndex === -1) { return { before: ``, error: errorText, after: "" }; } const endIndex = startIndex + errorWords.length; let beforeContext = []; let wordsCountedBefore = 0; for (let i = startIndex - 1; i >= 0 && wordsCountedBefore < wordsBefore; i--) { beforeContext.unshift(words[i]); if (words[i].trim().length > 0) { wordsCountedBefore++; } } let afterContext = []; let wordsCountedAfter = 0; for (let i = endIndex; i < words.length && wordsCountedAfter < wordsAfter; i++) { afterContext.push(words[i]); if (words[i].trim().length > 0) { wordsCountedAfter++; } } const joinWithSpace = (arr) => arr.join(''); return { before: joinWithSpace(beforeContext), error: errorText, after: joinWithSpace(afterContext) }; }
      function showAdvancedCorrectionSplash(initialMessage = "Preparando correção...") { /* ... código JS mantido ... */ removeOverlay('bmAdvCorrectionSplash'); correctionSplashEl = document.createElement('div'); correctionSplashEl.id = 'bmAdvCorrectionSplash'; correctionSplashEl.className = 'bmSimpleOverlay';
          correctionSplashEl.innerHTML = ` <div class="bmAdvSplashContent"> <h2 style="min-height: 1.2em;">${initialMessage}</h2> <div class="bmAdvContextDisplay" style="opacity:0;"></div> <div class="bmAdvOptionsContainer"> <div class="bmAdvSuggestionButtons" style="opacity:0;"></div> <div class="bmAdvActionButtons" style="opacity:0;"></div> </div> <div class="bmAdvLoadingState" style="display: none;"> <div class="applying-text">Processando...</div> </div> </div>`; document.body.appendChild(correctionSplashEl); void correctionSplashEl.offsetWidth; correctionSplashEl.style.opacity = '1'; }
      async function updateAdvancedCorrectionSplash(context, suggestions) { /* ... código JS mantido ... */ if (!correctionSplashEl || !document.body.contains(correctionSplashEl)) return; const splashContent = correctionSplashEl.querySelector('.bmAdvSplashContent'); const h2 = splashContent.querySelector('h2'); const contextDisplay = splashContent.querySelector('.bmAdvContextDisplay'); const suggestionContainer = splashContent.querySelector('.bmAdvSuggestionButtons'); const actionContainer = splashContent.querySelector('.bmAdvActionButtons'); const loadingState = splashContent.querySelector('.bmAdvLoadingState');
          // Limpa UI anterior e esconde containers antes de popular
          h2.textContent = 'Escolha a Correção:';
          contextDisplay.innerHTML = ''; contextDisplay.style.opacity = 0;
          suggestionContainer.innerHTML = ''; suggestionContainer.style.opacity = 0;
          actionContainer.innerHTML = ''; actionContainer.style.opacity = 0;
          loadingState.style.display = 'none';
          await new Promise(r => setTimeout(r, 50)); // Delay mínimo para limpeza visual

          contextDisplay.innerHTML = `<span class="context-before">${context.before}</span> <span class="error-word">${context.error}</span> <span class="context-after">${context.after}</span>`;
          suggestions.forEach((sug) => { const btn = document.createElement('button'); btn.className = 'bmAdvSuggestionButton'; btn.textContent = sug; btn.onclick = () => { if (currentCorrectionResolver) { currentCorrectionResolver({ type: 'suggestion', value: sug }); currentCorrectionResolver = null; /* showApplyingState é chamado fora */ } }; suggestionContainer.appendChild(btn); });
          const manualBtn = document.createElement('button'); manualBtn.className = 'bmAdvActionButton manual'; manualBtn.textContent = 'Escrever Manualmente'; manualBtn.onclick = () => { if (currentCorrectionResolver) { const manualText = prompt("Digite a correção manualmente:", context.error); if (manualText !== null) { currentCorrectionResolver({ type: 'manual', value: manualText }); currentCorrectionResolver = null; } else { currentCorrectionResolver({ type: 'skip' }); currentCorrectionResolver = null; } } }; actionContainer.appendChild(manualBtn);
          const skipBtn = document.createElement('button'); skipBtn.className = 'bmAdvActionButton skip'; skipBtn.textContent = 'Pular Erro'; skipBtn.onclick = () => { if (currentCorrectionResolver) { currentCorrectionResolver({ type: 'skip' }); currentCorrectionResolver = null; } }; actionContainer.appendChild(skipBtn);

          // Mostra containers com fade-in
          void contextDisplay.offsetWidth; // Reflow
          contextDisplay.style.opacity = 1;
          suggestionContainer.style.opacity = 1;
          actionContainer.style.opacity = 1;

          return new Promise(resolve => { currentCorrectionResolver = resolve; });
      }
      function showApplyingStateInSplash(message = "Processando...") { /* ... código JS mantido ... */ if (!correctionSplashEl || !document.body.contains(correctionSplashEl)) return; const loadingState = correctionSplashEl.querySelector('.bmAdvLoadingState'); const applyingText = loadingState.querySelector('.applying-text'); const contextDisplay = correctionSplashEl.querySelector('.bmAdvContextDisplay'); const suggestionContainer = correctionSplashEl.querySelector('.bmAdvSuggestionButtons'); const actionContainer = correctionSplashEl.querySelector('.bmAdvActionButtons');
          // Esconde a UI de correção/sugestão
          if (contextDisplay) contextDisplay.style.opacity = 0;
          if (suggestionContainer) suggestionContainer.style.opacity = 0;
          if (actionContainer) actionContainer.style.opacity = 0;
          // Mostra o estado de loading
          if (loadingState) { if(applyingText) applyingText.textContent = message; loadingState.style.display = 'flex'; loadingState.style.opacity = 0; void loadingState.offsetWidth; loadingState.style.transition = 'opacity 0.2s ease-in'; loadingState.style.opacity = 1; } }
      function hideAdvancedCorrectionSplash() { if (correctionSplashEl) { removeOverlay(correctionSplashEl); correctionSplashEl = null; } }

      // --- Evento Click do Botão Corrigir (COM AJUSTES) ---
      correctButton.onclick = async function () {
          if (isCorrectionRunning || isGenerationRunning) { showCustomAlert('Aguarde...', 'warning'); return; }
          isCorrectionRunning = true;
          const btnCorrect = this; btnCorrect.disabled = true; if (startButton) startButton.disabled = true; if (optionsButton) optionsButton.disabled = true;
          console.log('--- Iniciando Correção ---');
          let correctionMode = null; let targetTextarea = null; let correctionProcessRan = false;
          let finalMessage = "Nenhuma ação."; let finalType = "info"; let loadingUIData = null;
          removeOverlay('bmAIReviewSplash'); removeOverlay('bmAILoadingSplash'); hideAdvancedCorrectionSplash();
          try {
              correctionMode = await showModeSelectionDialog(); removeOverlay('bmModeSelectionDialog');
              try { targetTextarea = await waitForElement(TARGET_TEXTAREA_SELECTOR, 5000); console.log('Textarea encontrada:', targetTextarea); activeEl = targetTextarea; }
              catch (error) { console.error("Erro: Textarea alvo não encontrada!", error); showCustomAlert(`Textarea alvo ('${TARGET_TEXTAREA_SELECTOR}') não encontrada!`, 'error'); throw new Error("Textarea não encontrada."); }

              if (correctionMode === 'basic') {
                  // --- MODO BÁSICO (Lógica Mantida) ---
                  console.log('Modo Básico.'); const confirmBasic = await showBasicModeConfirmationDialog(); removeOverlay('bmBasicConfirmDialog');
                  if (!confirmBasic) throw new Error("Modo Básico cancelado."); console.log('Confirmado. Iniciando IA...');
                  loadingUIData = showAILoadingOverlayStyled("Comunicando IA..."); updateAIProgressBar(loadingUIData.progressBarElement, 10);
                  const currentText = targetTextarea.value; if (!currentText.trim()) { finalMessage = "Texto vazio."; finalType = "info"; throw new Error(finalMessage); }
                  const correctionPrompt = `Revise este texto e corrija os minimos detalhes. Não é para mudar NADA, somente os erros ortográficos, mais NADA. Não mude o contexto, não mude NADA. Na sua mensagem, também não mande mais nada. Só mande a correção do texto, nenhuma mensagem ou frase a mais.\n\n${currentText}`;
                  const aiCorrectedText = await callPuterAI(correctionPrompt, true); console.log("IA retornou (Básico)."); updateAIProgressBar(loadingUIData.progressBarElement, 70);
                  if (loadingUIData?.statusTextElement) loadingUIData.statusTextElement.textContent = "Aplicando...";
                  await clearTextareaSimulated(targetTextarea); updateAIProgressBar(loadingUIData.progressBarElement, 90);
                  await typeTextFast(aiCorrectedText, targetTextarea); updateAIProgressBar(loadingUIData.progressBarElement, 100);
                  if (loadingUIData?.statusTextElement) loadingUIData.statusTextElement.textContent = "Completo!";
                  await new Promise(r => setTimeout(r, 800)); removeOverlay(loadingUIData.overlayElement); loadingUIData = null;
                  correctionProcessRan = true; finalMessage = "Correção Básica via IA aplicada."; finalType = "success";

              } else if (correctionMode === 'advanced') {
                  // --- MODO AVANÇADO (COM AJUSTES DE SINCRONIA) ---
                  console.log('Modo Avançado.'); showAdvancedCorrectionSplash("Iniciando análise...");
                  await new Promise(r => setTimeout(r, 300));
                  try { /* Lógica clique "CORRIGIR ONLINE" mantida */
                    let needsCorrectorClick = false; let concludeButtonExists = false;
                    document.querySelectorAll('button').forEach(btn => { if (btn.textContent.trim() === "Concluir") concludeButtonExists = true; });
                    if (!concludeButtonExists) {
                        console.log("Procurando 'CORRIGIR ONLINE'...");
                        let foundCorrectorButton = null; let foundWaitingButton = null;
                        document.querySelectorAll('button').forEach(button => { const buttonText = button.textContent; if (buttonText && buttonText.includes("CORRIGIR ONLINE")) { if (buttonText.trim() === "CORRIGIR ONLINE") foundCorrectorButton = button; else foundWaitingButton = button; } });
                        if (foundWaitingButton) throw new Error("'Corrigir Online' em espera.");
                        if (foundCorrectorButton) { console.log("Clicando 'CORRIGIR ONLINE'..."); showApplyingStateInSplash("Iniciando correção online..."); foundCorrectorButton.click(); console.log("Esperando 'PROCESSANDO' sumir..."); const processingSelector = 'div.sc-kAyceB.kEYIQb'; await waitForElementToDisappear(processingSelector, 45000); console.log("'PROCESSANDO' sumiu."); needsCorrectorClick = true; }
                        else { console.log("'CORRIGIR ONLINE' não encontrado/necessário."); }
                    }
                    if (needsCorrectorClick) await new Promise(r => setTimeout(r, 500));
                   } catch (error) { console.error("Erro botões:", error); const errorMsg = error.message.includes('Timeout') ? `Timeout: ${error.message.split(': ')[1]}` : error.message; showCustomAlert(errorMsg, 'error'); throw error; }

                  console.log("Procurando spans de erro..."); if (correctionSplashEl) { correctionSplashEl.querySelector('h2').textContent = 'Analisando...'; }
                  const errorSpanSelector = 'span[style*="background-color: rgb"][style*="cursor: pointer"]';
                  const errorSpans = Array.from(document.querySelectorAll(errorSpanSelector));
                  let correctedCount = 0; let skippedCount = 0; let errorCount = 0;

                  if (errorSpans.length === 0) { finalMessage = "Nenhum erro destacado."; finalType = "info"; }
                  else {
                      console.log(`Encontrados ${errorSpans.length} erros.`); correctionProcessRan = true;
                      // *** INÍCIO DO LOOP MODIFICADO ***
                      for (let i = 0; i < errorSpans.length; i++) {
                          const errorSpan = errorSpans[i];
                          if (!document.body.contains(errorSpan) || errorSpan.offsetParent === null) { console.log(`Span ${i + 1} inválido/oculto.`); continue; }

                          const originalErrorText = errorSpan.textContent; const errorTextTrimmed = originalErrorText.trim();
                          let actionType = 'none'; let chosenCorrection = null;
                          if (!errorTextTrimmed && !originalErrorText) { console.log(`Span ${i + 1} vazio.`); continue; }
                          console.log(`--- Processando ${i + 1}/${errorSpans.length}: "${errorTextTrimmed || originalErrorText}" ---`);

                          try {
                              // 1. Interagir com a página para o erro ATUAL
                              errorSpan.scrollIntoView({ behavior: 'smooth', block: 'center' }); await new Promise(r => setTimeout(r, SCROLL_DELAY + 50));
                              errorSpan.click(); console.log(`Clicou: "${errorTextTrimmed || originalErrorText}"`);
                              await new Promise(r => setTimeout(r, 100)); // <<-- Pequena pausa após clique

                              // 2. Tentar obter sugestões da PÁGINA
                              let suggestions = [];
                              try {
                                  console.log("Esperando sugestões da página..."); const suggestionList = await waitForElement('ul#menu-list-grow', 850); // Timeout um pouco maior
                                  await new Promise(r => setTimeout(r, 80)); // Pausa para renderizar lista
                                  suggestions = Array.from(suggestionList.querySelectorAll('li')).slice(1).map(li => li.textContent.trim()).filter(text => text && text.length < 50);
                                  console.log(`Sugestões da página:`, suggestions);
                              } catch (e) { console.warn(`Sugestões não encontradas para "${errorTextTrimmed}".`); document.body.click(); await new Promise(r => setTimeout(r, MIN_DELAY)); }

                              // 3. Obter contexto ATUAL
                              const fullText = targetTextarea.value; // Garante pegar valor atual
                              const context = getContextAroundError(fullText, originalErrorText, ADV_CONTEXT_WORDS, ADV_CONTEXT_WORDS);

                              // 4. ATUALIZAR e ESPERAR interação do usuário na NOSSA UI
                              const userAction = await updateAdvancedCorrectionSplash(context, suggestions);
                              actionType = userAction.type; chosenCorrection = userAction.value;
                              console.log(`Ação usuário: ${actionType}, Valor: ${chosenCorrection}`);

                              // 5. MOSTRAR que estamos processando a ação ANTES de operações demoradas
                              showApplyingStateInSplash(`Processando "${errorTextTrimmed}"...`);
                              await new Promise(r => setTimeout(r, 50)); // Pausa para loading aparecer

                              // 6. APLICAR a ação (se necessário)
                              if ((actionType === 'suggestion' || actionType === 'manual') && chosenCorrection !== null) {
                                  if (!originalErrorText) { console.warn("Span original vazio."); errorCount++; actionType = 'error';}
                                  else {
                                      const currentTextValue = targetTextarea.value; const errorIndex = currentTextValue.indexOf(originalErrorText);
                                      if (errorIndex !== -1) {
                                          console.log(`Aplicando ${actionType}: "${originalErrorText}" -> "${chosenCorrection}"`);
                                          try {
                                              await targetTextarea.focus({ preventScroll: true }); await new Promise(r => setTimeout(r, 50));
                                              targetTextarea.selectionStart = errorIndex; targetTextarea.selectionEnd = errorIndex + originalErrorText.length;
                                              await new Promise(r => setTimeout(r, 50));
                                              await simulateBackspace(targetTextarea);
                                              await new Promise(r => setTimeout(r, 50));
                                              await typeTextFast(chosenCorrection, targetTextarea); // typeTextFast já tem await interno
                                              correctedCount++; console.log(`Correção (${actionType}) aplicada.`);
                                              if (errorSpan.parentNode) { errorSpan.style.cssText += 'background-color: transparent !important; cursor: default; border-bottom: 1px solid lightgreen;'; }
                                          } catch (e) { console.error("Erro na simulação:", e); errorCount++; actionType = 'error'; }
                                      } else { console.warn(`"${originalErrorText}" não encontrado na textarea para aplicar.`); actionType = 'skip'; } // Trata como pulado se não achou
                                  }
                              }

                              // 7. Marcar visualmente se pulado ou erro
                              if (actionType === 'skip') { skippedCount++; console.log(`Erro "${errorTextTrimmed}" pulado.`); if (errorSpan.parentNode) { errorSpan.style.cssText += 'background-color: transparent !important; cursor: default; border-bottom: 1px solid orange;'; } }
                              else if (actionType === 'error') { console.log(`Erro "${errorTextTrimmed}" não corrigido.`); if (errorSpan.parentNode) { errorSpan.style.cssText += 'background-color: transparent !important; cursor: default; border-bottom: 1px solid red;'; } }

                              // 8. Clicar fora para fechar menus da página
                              document.body.click();
                              await new Promise(r => setTimeout(r, MIN_DELAY * 2));

                          } catch (error) {
                              console.error(`Erro geral processando span ${i+1}:`, error); errorCount++;
                              try { document.body.click(); } catch (e) {} // Tenta fechar menu
                              await new Promise(r => setTimeout(r, MIN_DELAY));
                              if (error.message === "Correção interrompida.") { break; } // Permite interromper
                          }

                          // 9. Pausa ANTES da próxima iteração (STEP_DELAY)
                          console.log(`Fim da iteração ${i + 1}. Pausando ${STEP_DELAY}ms...`);
                          await new Promise(r => setTimeout(r, STEP_DELAY));

                      } // *** FIM DO LOOP FOR ***
                      console.log('Processamento avançado concluído.');
                      // Restante da lógica de resumo e IA opcional mantida...
                      const processedCount = correctedCount + skippedCount + errorCount;
                      if (processedCount === 0 && errorSpans.length > 0) { finalMessage = "Nenhum erro processável."; }
                      else if (correctedCount > 0 || skippedCount > 0 || errorCount > 0) { finalMessage = `Avançado: ${correctedCount} corrigido(s), ${skippedCount} pulado(s), ${errorCount} erro(s).`; if (errorCount > 0) finalType = "warning"; else if (correctedCount > 0) finalType = "success"; else finalType = "info"; }
                      else { finalMessage = "Nenhum erro processado."; }
                  } // Fim ELSE (errorSpans > 0)

                  hideAdvancedCorrectionSplash(); await new Promise(r => setTimeout(r, 150));

                  // IA Opcional PÓS correção (Lógica Mantida)
                   if (correctionProcessRan && targetTextarea && document.body.contains(targetTextarea)) {
                       removeOverlay('bmAIReviewSplash'); removeOverlay('bmAILoadingSplash');
                       const wantAIReview = await showAIReviewOverlayStyled();
                       if (wantAIReview) {
                           console.log("Revisão final IA."); loadingUIData = showAILoadingOverlayStyled("Revisão final IA..."); updateAIProgressBar(loadingUIData.progressBarElement, 5);
                           if (aiStatusIntervalId) clearInterval(aiStatusIntervalId); aiStatusIntervalId = setInterval(() => { if (loadingUIData?.statusTextElement && document.body.contains(loadingUIData.overlayElement)) { loadingUIData.statusTextElement.textContent += "."; } else { clearInterval(aiStatusIntervalId); aiStatusIntervalId = null; } }, AI_STATUS_UPDATE_INTERVAL);
                           try {
                               const currentText = targetTextarea.value; if (!currentText.trim()) throw new Error("Texto vazio."); updateAIProgressBar(loadingUIData.progressBarElement, 20);
                               const reviewPrompt = `Revise este texto e corrija os minimos detalhes. Não é para mudar NADA, somente os erros ortográficos, mais NADA. Não mude o contexto, não mude NADA. Na sua mensagem, também não mande mais nada. Só mande a correção do texto, nenhuma mensagem ou frase a mais.\n\n${currentText}`;
                               const aiReviewedText = await callPuterAI(reviewPrompt, true); console.log("IA retornou revisão."); updateAIProgressBar(loadingUIData.progressBarElement, 70); if (loadingUIData?.statusTextElement) loadingUIData.statusTextElement.textContent = "Aplicando revisão...";
                               if (aiStatusIntervalId) { clearInterval(aiStatusIntervalId); aiStatusIntervalId = null; }
                               await clearTextareaSimulated(targetTextarea); updateAIProgressBar(loadingUIData.progressBarElement, 90);
                               await typeTextFast(aiReviewedText, targetTextarea); updateAIProgressBar(loadingUIData.progressBarElement, 100); if (loadingUIData?.statusTextElement) loadingUIData.statusTextElement.textContent = "Revisão Completa!";
                               await new Promise(r => setTimeout(r, 800)); removeOverlay(loadingUIData.overlayElement); loadingUIData = null;
                               finalMessage += "\nRevisão final IA aplicada."; finalType = "success";
                           } catch (aiError) { console.error("Erro revisão IA:", aiError); if (aiStatusIntervalId) { clearInterval(aiStatusIntervalId); aiStatusIntervalId = null; } removeOverlay(loadingUIData?.overlayElement); loadingUIData = null; await showCustomAlert(`Erro revisão IA: ${aiError.message}`, 'error'); finalMessage += `\n(Falha revisão IA: ${aiError.message})`; finalType = finalType === "success" ? "warning" : finalType; }
                       } else { console.log("Revisão final IA pulada."); }
                   } else { console.log("Correção não executada ou textarea inválida, pulando revisão IA."); }

              } else if (correctionMode !== 'basic') { throw new Error("Nenhum modo selecionado."); }
              if (finalMessage !== "Nenhuma ação.") { showCustomAlert(finalMessage, finalType); }
          } catch (e) {
               console.error("Erro geral correção:", e);
               if (e.message && !e.message.includes("cancelado") && !e.message.includes("nenhum modo") && !e.message.includes("encontrada") && !e.message.includes("espera")) { showCustomAlert(`Erro correção: ${e.message}`, 'error'); }
               hideAdvancedCorrectionSplash(); if (loadingUIData) removeOverlay(loadingUIData.overlayElement);
          } finally {
               console.log("--- Correção Finalizada ---"); isCorrectionRunning = false;
               if (!isGenerationRunning) { btnCorrect.disabled = false; if (startButton) startButton.disabled = false; if (optionsButton) optionsButton.disabled = false; }
               currentCorrectionResolver = null; if (aiStatusIntervalId) { clearInterval(aiStatusIntervalId); aiStatusIntervalId = null; }
               removeOverlay(loadingUIData?.overlayElement); removeOverlay('bmAIReviewSplash'); removeOverlay('bmAILoadingSplash');
               removeOverlay('bmAdvCorrectionSplash'); removeOverlay('bmAlertOverlay'); removeOverlay('bmModeSelectionDialog'); removeOverlay('bmBasicConfirmDialog');
               activeEl = null;
          }
      };

      // --- LÓGICA DO BOTÃO DE OPÇÕES (...) (JS Lógica Mantida) ---
      optionsButton.onclick = function() { /* ... código JS mantido ... */ if (optionsMenuElement) { removeOverlay(optionsMenuElement); optionsMenuElement = null; return; } if (isCorrectionRunning || isGenerationRunning) { showCustomAlert('Aguarde...', 'warning'); return; } optionsMenuElement = document.createElement('div'); optionsMenuElement.id = 'bmOptionsMenu'; optionsMenuElement.innerHTML = ` <button class="bmMenuOption" data-action="github">GitHub</button> <button class="bmMenuOption" data-action="generate">Gerar Texto</button> `; uiWrapperElement.appendChild(optionsMenuElement); optionsMenuElement.querySelectorAll('.bmMenuOption').forEach(option => { option.onclick = async (e) => { const action = e.target.getAttribute('data-action'); removeOverlay(optionsMenuElement); optionsMenuElement = null; if (action === 'github') { window.open(GITHUB_LINK, '_blank'); } else if (action === 'generate') { await startAIGenerationFlow(); } }; }); void optionsMenuElement.offsetWidth; optionsMenuElement.classList.add('show'); };

      // --- FLUXO DE GERAÇÃO DE TEXTO PELA IA (JS Lógica Mantida) ---
      async function startAIGenerationFlow() { /* ... código JS mantido ... */ if (isCorrectionRunning || isGenerationRunning) { showCustomAlert('Aguarde...', 'warning'); return; } isGenerationRunning = true; if (startButton) startButton.disabled = true; if (correctButton) correctButton.disabled = true; if (optionsButton) optionsButton.disabled = true; let busySplash = null; let loadingOverlayData = null; let pageTextarea = null; console.log("--- Iniciando Geração ---"); try { try { pageTextarea = await waitForElement(TARGET_TEXTAREA_SELECTOR, 2000); console.log("Textarea encontrada:", pageTextarea); } catch (findError) { await showCustomAlert(`Textarea alvo ('${TARGET_TEXTAREA_SELECTOR}') não encontrada.`, 'error'); throw new Error("Textarea não encontrada."); } const proceed = await showCustomAlert( "Gerar texto com IA?", 'question', [{ text: 'Não', value: false, class: 'secondary' }, { text: 'Sim', value: true }] ); if (!proceed) throw new Error("Geração cancelada."); const proposalText = extractProposalText(); if (proposalText) { console.log("Contexto 'Proposta' OK."); } else { console.log("Contexto 'Proposta' não encontrado."); } const userPrompt = await showPromptInputDialog(); if (userPrompt === null) { throw new Error("Geração cancelada prompt."); } console.log("Prompt:", userPrompt); loadingOverlayData = showAILoadingOverlayStyled("Comunicando IA..."); await new Promise(r => setTimeout(r, 300)); let finalPrompt = `Com base no prompt e no contexto da proposta (se houver), gere o texto solicitado. Mande somente o texto final, sem títulos ou explicações adicionais. O texto deve ter 150 palavras no mínimo e 300 palavras no máximo. Randomize este número.\n\n--- PROMPT DO USUÁRIO ---\n${userPrompt}`; if (proposalText) { finalPrompt += `\n\n--- PROPOSTA DA PÁGINA (Contexto Adicional) ---\n${proposalText}`; } console.log("Prompt final IA:", finalPrompt.substring(0, 200) + "..."); if (loadingOverlayData?.statusTextElement) loadingOverlayData.statusTextElement.textContent = "Gerando Texto..."; if (loadingOverlayData?.progressBarElement) updateAIProgressBar(loadingOverlayData.progressBarElement, 30); const generatedText = await callPuterAI(finalPrompt, false); if (loadingOverlayData?.progressBarElement) updateAIProgressBar(loadingOverlayData.progressBarElement, 100); if (loadingOverlayData?.statusTextElement) loadingOverlayData.statusTextElement.textContent = "Texto Gerado!"; await new Promise(r => setTimeout(r, 700)); removeOverlay(loadingOverlayData.overlayElement); loadingOverlayData = null; const generatedTextAction = await showGeneratedTextInterface(generatedText); if (generatedTextAction === 'continue') { const finalAction = await showGeneratedTextActions(); if (finalAction === 'replace' || finalAction === 'append') { busySplash = showBusySplash( "Aplicando texto...", "Aguarde..." ); await new Promise(r => setTimeout(r, 300)); if (pageTextarea && document.body.contains(pageTextarea)) { if (finalAction === 'replace') { console.log(`Ação: Substituir ${TARGET_TEXTAREA_SELECTOR}`); await clearTextareaSimulated(pageTextarea); await new Promise(r => setTimeout(r, 100)); await typeTextFast(generatedText, pageTextarea); } else { console.log(`Ação: Anexar ${TARGET_TEXTAREA_SELECTOR}`); const currentText = pageTextarea.value; const textToAppend = (currentText ? "\n\n" : "") + generatedText; try { pageTextarea.focus({ preventScroll: true }); await new Promise(r => setTimeout(r, 50)); pageTextarea.selectionStart = pageTextarea.selectionEnd = pageTextarea.value.length; console.log("Cursor fim."); await new Promise(r => setTimeout(r, 50)); } catch (focusError) { console.warn("Falha mover cursor.", focusError); } await typeTextFast(textToAppend, pageTextarea); } } else { console.error(`Textarea ('${TARGET_TEXTAREA_SELECTOR}') inválida.`); throw new Error("Textarea não encontrada."); } await new Promise(r => setTimeout(r, 300)); removeOverlay(busySplash); busySplash = null; showCustomAlert("Operação concluída!", "success"); } else { console.log("Ação final cancelada."); showCustomAlert("Operação cancelada.", "info"); } } else { console.log("Visualização cancelada."); showCustomAlert("Geração cancelada.", "info"); } } catch (error) { console.error("Erro geração:", error); if (error.message && !error.message.includes("cancelada") && !error.message.includes("Textarea não encontrada")) { showCustomAlert(`Erro: ${error.message}`, 'error'); } if (loadingOverlayData) removeOverlay(loadingOverlayData.overlayElement); if (busySplash) removeOverlay(busySplash); removeOverlay('bmPromptInputDialog'); } finally { console.log("--- Geração Finalizada ---"); isGenerationRunning = false; if (!isCorrectionRunning) { if (startButton) startButton.disabled = false; if (correctButton) correctButton.disabled = false; if (optionsButton) optionsButton.disabled = false; } if (loadingOverlayData) removeOverlay(loadingOverlayData.overlayElement); if (busySplash) removeOverlay(busySplash); removeOverlay('bmAlertOverlay'); removeOverlay('bmGeneratedTextDialog'); removeOverlay('bmGeneratedTextActionDialog'); removeOverlay('bmPromptInputDialog'); } }

      // --- Funções showGeneratedTextInterface e showGeneratedTextActions (JS Mantidas) ---
      async function showGeneratedTextInterface(generatedText) { /* ... código JS mantido ... */ const dialogId = 'bmGeneratedTextDialog'; removeOverlay(dialogId); const overlay = document.createElement('div'); overlay.id = dialogId; overlay.className = 'bmDialogOverlay'; const dialogBox = document.createElement('div'); dialogBox.className = 'bmDialogBox'; dialogBox.style.minWidth = '400px'; dialogBox.style.maxWidth = '700px'; dialogBox.style.maxHeight = '80vh'; dialogBox.style.display = 'flex'; dialogBox.style.flexDirection = 'column'; dialogBox.innerHTML = ` <div class="bmDialogIcon info" style="flex-shrink: 0;">i</div> <h3 style="color: #e0cffc; margin-bottom: 15px; font-size: 1.2em; flex-shrink: 0;">Texto Gerado</h3> <div style="flex-grow: 1; overflow-y: auto; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 10px; margin-bottom: 20px; text-align: left; font-size: 0.95em; line-height: 1.5; border: 1px solid rgba(255,255,255,0.1);"> ${generatedText.replace(/\n/g, '<br>')} </div> <div class="bmDialogButtonContainer" style="flex-shrink: 0;"> </div> `; return new Promise(resolve => { const buttonContainer = dialogBox.querySelector('.bmDialogButtonContainer'); const btnCancel = document.createElement('button'); btnCancel.textContent = 'Cancelar'; btnCancel.className = 'bmDialogButton secondary'; btnCancel.onclick = () => { removeOverlay(overlay); resolve('cancel'); }; const btnContinue = document.createElement('button'); btnContinue.textContent = 'Continuar'; btnContinue.className = 'bmDialogButton'; btnContinue.onclick = () => { removeOverlay(overlay); resolve('continue'); }; buttonContainer.appendChild(btnCancel); buttonContainer.appendChild(btnContinue); overlay.appendChild(dialogBox); document.body.appendChild(overlay); void overlay.offsetWidth; overlay.style.opacity = '1'; dialogBox.style.opacity = '1'; }); }
      async function showGeneratedTextActions() { /* ... código JS mantido ... */ const buttons = [ { text: 'Substituir existente', value: 'replace' }, { text: 'Escrever no final', value: 'append' }, { text: 'Cancelar', value: 'cancel', class: 'secondary' } ]; return await showCustomAlert("O que fazer com o texto gerado?", 'question', buttons, 'bmGeneratedTextActionDialog'); }

  }, splashTimeout);

})();
