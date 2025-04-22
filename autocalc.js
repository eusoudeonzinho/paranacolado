(function () {

    // --- Configuration and State ---
    const APP = {
        ver: "1.0", // Version updated to indicate full core replacement
        cfg: {
            mod: true, // Fetch override active by default
            auto: false, // Auto Complete off by default
            questionSpoof: true, // Question Spoof on by default (using KhanDestroyer logic)
            autoSpeed: 1500, // Default speed
            speedOptions: [750, 1000, 1250, 1500, 1750, 2000, 2250]
        },
        ui: {
            wrapperElement: null,
            stealthOn: false,
            isMinimized: false,
            drag: {
                isDragging: false,
                startX: 0,
                startY: 0,
                initialLeft: 0,
                initialTop: 0
            },
            stealth: {
                firstTime: true,
                rect: null,
                mouseMoveHandler: null
            }
        },
        core: {
            originalFetch: null // Store original fetch here
        }
    };

    // --- Constants ---
    const MIN_WRAPPER_WIDTH = 260;
    const SPLASH_TIMEOUT = 3800;

    // ==========================================================================
    // --- Core Functionality ---
    // ==========================================================================

    const Core = {
        /**
         * Modifies the window.fetch function to intercept requests
         * and potentially alter question data (Question Spoof).
         * !!! USES KHAN DESTROYER'S SPOOF LOGIC !!! (From previous modification)
         * Adapted to use Paraná Resolve's notification system (showPRToast).
         */
        setupMod: function() {
            if (!APP.cfg.mod) {
                console.log("PR (KDFullCore): Fetch modification disabled in config.");
                return;
            }

            // --- Store original fetch (Paraná Resolve's robust way) ---
            if (!APP.core.originalFetch) {
                APP.core.originalFetch = window.fetch;
                console.log("PR (KDFullCore): Stored original window.fetch.");
            } else {
                console.warn("PR (KDFullCore): Attempting to re-apply fetch modification.");
                // Restore original fetch before applying again to avoid multiple layers
                window.fetch = APP.core.originalFetch;
            }

            // --- Define the new fetch using KhanDestroyer's logic ---
            window.fetch = async function (...args) {
                const originalResponse = await APP.core.originalFetch.apply(this, args);
                const clonedResponse = originalResponse.clone();

                try {
                    const responseText = await clonedResponse.text();
                    let jsonData = JSON.parse(responseText);

                    if (jsonData?.data?.assessmentItem?.item?.itemData) {
                        let itemData;
                        try {
                             itemData = JSON.parse(jsonData.data.assessmentItem.item.itemData);
                        } catch (parseError) {
                            console.error("PR (KDFullCore) Spoof Error: Failed to parse inner itemData JSON:", parseError, jsonData.data.assessmentItem.item.itemData);
                            return originalResponse;
                        }

                        if (APP.cfg.questionSpoof && itemData?.question?.content && typeof itemData.question.content === 'string' && itemData.question.content.length > 0 &&
                            itemData.question.content[0] === itemData.question.content[0].toUpperCase())
                        {
                            const messages = [
                                "🛠️ Selecione a resposta, e [faça certo!](https://paranatools.github.io)",
                                "🛠️ Selecione a resposta, e [faça certo!](https://paranatools.github.io)"
                            ];

                            itemData.answerArea = { calculator: false };
                            itemData.question.content = messages[Math.floor(Math.random() * messages.length)] + "[[☃ radio 1]]";
                            itemData.question.widgets = {
                                "radio 1": {
                                    type: "radio",
                                    alignment: "default",
                                    static: false,
                                    graded: true,
                                    options: {
                                        choices: [{ content: "✅ paranatools.github.io", correct: true }],
                                        randomize: false,
                                        multipleSelect: false,
                                        displayCount: null,
                                        hasNoneOfTheAbove: false,
                                        onePerLine: true,
                                        deselectEnabled: false
                                    }
                                }
                            };

                            jsonData.data.assessmentItem.item.itemData = JSON.stringify(itemData);
                            showPRToast("❗ Questão Burlada", 'success', 1000); // Use showPRToast

                            const modifiedResponse = new Response(JSON.stringify(jsonData), {
                                status: originalResponse.status,
                                statusText: originalResponse.statusText,
                                headers: originalResponse.headers
                            });
                            return modifiedResponse;
                        }
                    }
                } catch (error) {
                    if (!(error instanceof TypeError && error.message.includes("cancelled"))) {
                       console.error(`PR (KDFullCore) Fetch Intercept: Error processing response for ${args[0]}:`, error);
                    }
                    return originalResponse;
                }
                return originalResponse;
            };
            console.log("PR (KDFullCore): Fetch modification (KhanDestroyer Spoof Logic) override applied.");
        },


        /**
         * Continuously checks for answer buttons and clicks them if Auto Complete is enabled.
         * !!! USES KHAN DESTROYER'S AUTO COMPLETE LOGIC !!!
         * Adapted to use Paraná Resolve's notification (showPRToast) and audio (UI.playAudio).
         */
        setupAuto: async function() {
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

            // Selectors from KhanDestroyer
            const classNames = ["_1tuo6xk", "_ssxvf9l", "_1f0fvyce", "_rz7ls7u", "_1yok8f4", "_1e5cuk2a", "_s6zfc1u", "_4i5p5ae", "_1r8cd7xe"];
            const checkAnswerSelector = "[data-testid=\"exercise-check-answer\"]";

            // Helper function from KhanDestroyer (adapted for PR's notifications/audio)
            function findAndClickByClass(className) {
              const element = document.getElementsByClassName(className)[0];
              if (element) {
                // Basic check if element is somewhat visible/interactive might be useful
                // but KD's original didn't have it, so keeping it simple as requested.
                // A more robust check like in original PR: if (element && element.offsetParent !== null && !element.disabled)
                 if (element.offsetParent !== null && !element.disabled) { // Added basic visibility/disabled check
                    element.click();
                    console.log(`PR Auto (KD Logic): Clicked .${className}`);
                    // Check for summary completion text (like KhanDestroyer)
                    if (element.textContent.includes("Mostrar resumo") || element.textContent.includes("Show summary")) { // Added English check just in case
                      showPRToast("🎉 Exercise completed!", 'success', 3000); // Use showPRToast
                      UI.playAudio("https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/4x5g14gj.wav"); // Use UI.playAudio
                    }
                    return true; // Indicate click happened
                }
              }
              return false; // Indicate no click or not found/visible/enabled
            }

            // Processing function from KhanDestroyer
            async function processElements() {
              if (!APP.cfg.auto) return; // Check if auto mode is enabled

              let clickedThisCycle = false;

              // Processar todos os botões de classe conhecida (KhanDestroyer's primary method)
              for (const className of classNames) {
                if (findAndClickByClass(className)) {
                    clickedThisCycle = true;
                    await delay(APP.cfg.autoSpeed / 5); // KD's delay after class click
                    // Maybe break after one successful click per cycle? Or let it try all?
                    // KD's original implies trying all, let's stick to that for now.
                }
              }

              // Verificar e clicar no botão de verificar resposta (KhanDestroyer's secondary check)
              const checkAnswerButton = document.querySelector(checkAnswerSelector);
               // Check visibility and disabled status
              if (checkAnswerButton && checkAnswerButton.offsetParent !== null && !checkAnswerButton.disabled) {
                checkAnswerButton.click();
                console.log(`PR Auto (KD Logic): Clicked ${checkAnswerSelector}`);
                clickedThisCycle = true;
                await delay(APP.cfg.autoSpeed / 5); // KD's delay after check answer
              }

              // If nothing was clicked, wait a bit longer
              if (!clickedThisCycle) {
                  await delay(APP.cfg.autoSpeed / 2); // Wait if nothing was actionable
              }
            }

            console.log("PR (KDFullCore): Auto Complete loop (KhanDestroyer Logic) starting.");
            // Main loop from KhanDestroyer
            while (true) {
              await processElements();
              await delay(APP.cfg.autoSpeed / 3); // KD's delay at the end of a cycle
            }
        },

        // --- Initialization ---
        init: function() {
            this.setupMod(); // Apply fetch override (KD Logic)
            this.setupAuto(); // Start the auto-complete loop (KD Logic)
            console.log(`PR (KDFullCore): Core logic initialized.`);
        }
    };

    // ==========================================================================
    // --- UI Handling --- (Original Paraná Resolve Logic - Kept Unchanged)
    // ==========================================================================
    const UI = {

        showSplash: function() {
            if (document.getElementById('prSplash')) return;

            const splash = document.createElement('div');
            splash.id = 'prSplash';
            splash.innerHTML = `
                <div id="prSplashContent">
                    <img id="prSplashImg" src="https://i.imgur.com/RUWcJ6e.png"/>
                    <div id="prSplashTexts">
                        <div id="prSplashTitle">Paraná Tools</div>
                        <div id="prSplashSubtitle">Khan Academy</div>
                    </div>
                    <div id="prLoadingBar"><div id="prLoadingProgress"></div></div>
                </div>
                <div id="prSplashBgEffect"></div>
                <div class="prSplashGrid"></div>`;
            document.body.appendChild(splash);

            setTimeout(() => {
                const splashEl = document.getElementById('prSplash');
                if (splashEl) {
                    splashEl.style.transition = 'opacity 0.6s ease-out';
                    splashEl.style.opacity = '0';
                    setTimeout(() => splashEl.remove(), 600);
                }
                this.createMainUI(); // Create main UI after splash fades
            }, SPLASH_TIMEOUT);
        },

        createMainUI: function() {
            if (document.getElementById('prWrapper')) return;

            APP.ui.wrapperElement = document.createElement('div');
            APP.ui.wrapperElement.id = 'prWrapper';
            APP.ui.wrapperElement.style.minWidth = `${MIN_WRAPPER_WIDTH}px`;
            APP.ui.wrapperElement.style.width = `${MIN_WRAPPER_WIDTH}px`;

            APP.ui.wrapperElement.innerHTML = `
                <div id="prHeader">
                    <span>Auto Cálculo <span class="pr-version">v${APP.ver}</span></span>
                    <span id="prMinimizeBtn" title="Minimizar/Expandir">-</span>
                </div>
                <div id="prContent">
                    <div id="prAutoCompleteToggleWrapper" class="pr-toggle-wrapper prFadeInSlideUp" style="animation-delay: 0.1s;" title="Ativar/Desativar conclusão automática (Lógica KhanDestroyer).">
                        <div id="prAutoCompleteToggleImg" class="pr-toggle-img ${APP.cfg.auto ? 'active' : ''}"></div>
                        <span id="prAutoCompleteToggleText" class="pr-toggle-text">Auto Complete</span>
                    </div>

                    <div id="prSpoofToggleWrapper" class="pr-toggle-wrapper prFadeInSlideUp" style="animation-delay: 0.15s;" title="Modificar questões para facilitar a conclusão (Lógica KhanDestroyer).">
                        <div id="prSpoofToggleImg" class="pr-toggle-img ${APP.cfg.questionSpoof ? 'active' : ''}"></div>
                        <span id="prSpoofToggleText" class="pr-toggle-text">Question Spoof</span>
                    </div>

                    <div id="prSpeedControlContainer" class="prFadeInSlideUp" style="animation-delay: 0.2s; display: ${APP.cfg.auto ? 'block' : 'none'}; margin-top: 10px; padding: 0 5px;">
                        <label for="prSpeedSlider" class="pr-label" style="display:block; margin-bottom: 5px; font-size: 0.9em; opacity: 0.8;">Velocidade (ms)</label>
                        <div class="pr-speed-slider-container">
                            <input type="range" min="0" max="${APP.cfg.speedOptions.length - 1}" value="${APP.cfg.speedOptions.indexOf(APP.cfg.autoSpeed)}" class="pr-speed-slider" id="prSpeedSlider">
                            <div class="pr-speed-value" id="prSpeedValue">${APP.cfg.autoSpeed}ms</div>
                        </div>
                    </div>

                    <div id="prStealthToggleWrapper" class="pr-toggle-wrapper prFadeInSlideUp" style="animation-delay: 0.25s; margin-top: 15px;" title="Oculta a janela quando o mouse não está sobre ela.">
                        <div id="prStealthToggleImg" class="pr-toggle-img"></div>
                        <span id="prStealthToggleText" class="pr-toggle-text">Modo Disfarçado</span>
                    </div>

                    <div class="pr-credit prFadeInSlideUp" style="animation-delay: 0.3s;">paranatools.github.io</div>
                </div>`;

            document.body.appendChild(APP.ui.wrapperElement);
            this.setupUIEventListeners();
            this.createNotificationArea();

            setTimeout(() => {
                if (APP.ui.wrapperElement) APP.ui.wrapperElement.classList.add('show');
                showPRToast(`🚀 Auto Calcúlo v${APP.ver} iniciado!`, 'success', 4000);
            }, 50);

            // Initialize core logic AFTER UI is definitely added to DOM
            setTimeout(Core.init.bind(Core), 100); // Use bind to maintain 'this' context for Core
        },

        setupUIEventListeners: function() {
            const wrapper = APP.ui.wrapperElement;
            if (!wrapper) return;

            const header = wrapper.querySelector('#prHeader');
            const minimizeBtn = wrapper.querySelector('#prMinimizeBtn');
            const content = wrapper.querySelector('#prContent');

            // Feature Toggles & Slider
            const autoToggleWrapper = wrapper.querySelector('#prAutoCompleteToggleWrapper');
            const autoToggleImg = wrapper.querySelector('#prAutoCompleteToggleImg');
            const spoofToggleWrapper = wrapper.querySelector('#prSpoofToggleWrapper');
            const spoofToggleImg = wrapper.querySelector('#prSpoofToggleImg');
            const speedContainer = wrapper.querySelector('#prSpeedControlContainer');
            const speedSlider = wrapper.querySelector('#prSpeedSlider');
            const speedValue = wrapper.querySelector('#prSpeedValue');

            if (autoToggleWrapper && autoToggleImg && speedContainer && speedSlider && speedValue) {
                autoToggleWrapper.onclick = () => {
                    APP.cfg.auto = !APP.cfg.auto;
                    autoToggleImg.classList.toggle('active', APP.cfg.auto);
                    speedContainer.style.display = APP.cfg.auto ? 'block' : 'none';
                    showPRToast(APP.cfg.auto ? "✅ Auto Complete Ativado" : "❌ Auto Complete Desativado");
                    console.log("PR Config: Auto Complete set to", APP.cfg.auto);
                };

                speedSlider.oninput = () => {
                    const index = parseInt(speedSlider.value);
                    const speed = APP.cfg.speedOptions[index];
                    APP.cfg.autoSpeed = speed;
                    speedValue.textContent = speed + "ms";
                };
                speedSlider.onchange = () => {
                    const speed = APP.cfg.autoSpeed;
                    showPRToast(`⏱️ Velocidade alterada para ${speed}ms`);
                    console.log("PR Config: Auto Speed set to", APP.cfg.autoSpeed);
                };
                // Set initial slider value based on config
                const initialSpeedIndex = APP.cfg.speedOptions.indexOf(APP.cfg.autoSpeed);
                speedSlider.value = initialSpeedIndex >= 0 ? initialSpeedIndex : 0;
                speedValue.textContent = APP.cfg.autoSpeed + "ms";

            } else { console.error("PR UI Error: Auto Complete or Speed elements not found."); }

            if (spoofToggleWrapper && spoofToggleImg) {
                spoofToggleWrapper.onclick = () => {
                    APP.cfg.questionSpoof = !APP.cfg.questionSpoof;
                    spoofToggleImg.classList.toggle('active', APP.cfg.questionSpoof);
                    showPRToast(APP.cfg.questionSpoof ? "✅ Question Spoof Ativado" : "❌ Question Spoof Desativado");
                    console.log("PR Config: Question Spoof set to", APP.cfg.questionSpoof);
                };
            } else { console.error("PR UI Error: Question Spoof elements not found."); }

            // Dragging
            if (header && minimizeBtn) {
                header.onmousedown = (e) => {
                    if (minimizeBtn.contains(e.target)) return;
                    APP.ui.drag.isDragging = true;
                    APP.ui.drag.startX = e.clientX;
                    APP.ui.drag.startY = e.clientY;
                    const rect = wrapper.getBoundingClientRect();
                    APP.ui.drag.initialLeft = rect.left;
                    APP.ui.drag.initialTop = rect.top;
                    header.style.cursor = 'grabbing';
                    document.addEventListener('mousemove', this.handleDragMove);
                    document.addEventListener('mouseup', this.handleDragUp, { once: true });
                    e.preventDefault();
                };
            } else { console.error("PR UI Error: Header or Minimize button not found."); }

            // Minimizing
            if (minimizeBtn && content) {
                minimizeBtn.onclick = (e) => {
                    e.stopPropagation();
                    APP.ui.isMinimized = wrapper.classList.toggle('minimized');
                    minimizeBtn.textContent = APP.ui.isMinimized ? '+' : '-';
                    minimizeBtn.title = APP.ui.isMinimized ? 'Expandir' : 'Minimizar';
                    if (APP.ui.stealthOn) {
                        setTimeout(() => {
                            try { APP.ui.stealth.rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect(); }
                            catch(err){ console.warn("PR: Error getting stealth rect after minimize.")}
                        }, 360);
                    }
                };
            } else { console.error("PR UI Error: Minimize button or Content area not found."); }

            // Stealth Mode
            const stealthToggleWrapper = wrapper.querySelector('#prStealthToggleWrapper');
            const stealthToggleImg = wrapper.querySelector('#prStealthToggleImg');

            if (stealthToggleWrapper && stealthToggleImg) {
                APP.ui.stealth.mouseMoveHandler = (ev) => {
                    if (!APP.ui.stealthOn || !APP.ui.wrapperElement || !document.body.contains(APP.ui.wrapperElement)) {
                        this.exitStealthMode(); return;
                    }
                    try {
                        if (!APP.ui.stealth.rect || wrapper.style.opacity === '0') {
                            APP.ui.stealth.rect = wrapper.classList.contains('minimized') ? header.getBoundingClientRect() : wrapper.getBoundingClientRect();
                            if (!APP.ui.stealth.rect || APP.ui.stealth.rect.width === 0 || APP.ui.stealth.rect.height === 0) return;
                        }
                        const mouseX = ev.clientX; const mouseY = ev.clientY;
                        const isInside = (mouseX>=APP.ui.stealth.rect.left && mouseX<=APP.ui.stealth.rect.right && mouseY>=APP.ui.stealth.rect.top && mouseY<=APP.ui.stealth.rect.bottom);

                        if (isInside) {
                            if (wrapper.style.opacity !== '1') {
                                wrapper.style.transition = 'opacity 0.2s ease-out';
                                wrapper.style.opacity = 1;
                                wrapper.style.pointerEvents = 'auto';
                            }
                        } else {
                            if (wrapper.style.opacity !== '0') {
                                wrapper.style.transition = 'opacity 0.5s ease-in 0.3s';
                                wrapper.style.opacity = 0;
                                wrapper.style.pointerEvents = 'none';
                                APP.ui.stealth.rect = null;
                            }
                        }
                    } catch (err) { console.warn("PR Stealth Mode Error:", err); this.exitStealthMode(); }
                };

                stealthToggleWrapper.onclick = () => {
                    if (!APP.ui.stealthOn) {
                        if (APP.ui.stealth.firstTime) {
                            APP.ui.stealth.firstTime = false;
                            this.showCustomAlert(
                                'O Modo Disfarçado oculta a janela.<br>Mova o mouse sobre a área dela para revelar.',
                                'info', [{ text: 'Entendido', value: 'ok' }], 'prStealthInfoDialog'
                            ).then(result => { if (result === 'ok') { this.enterStealthMode(); } });
                        } else { this.enterStealthMode(); }
                    } else { this.exitStealthMode(); }
                };
            } else { console.error("PR UI Error: Stealth Mode elements not found."); }
        },

        handleDragMove: (e) => {
            if (!APP.ui.drag.isDragging || !APP.ui.wrapperElement) return;
            const dx = e.clientX - APP.ui.drag.startX;
            const dy = e.clientY - APP.ui.drag.startY;
            const wrapper = APP.ui.wrapperElement;
            const newLeft = Math.max(0, Math.min(window.innerWidth - wrapper.offsetWidth, APP.ui.drag.initialLeft + dx));
            const newTop = Math.max(0, Math.min(window.innerHeight - wrapper.offsetHeight, APP.ui.drag.initialTop + dy));
            wrapper.style.left = newLeft + 'px';
            wrapper.style.top = newTop + 'px';
            if (APP.ui.stealthOn) {
                try { APP.ui.stealth.rect = wrapper.classList.contains('minimized') ? wrapper.querySelector('#prHeader').getBoundingClientRect() : wrapper.getBoundingClientRect(); }
                catch(err) { console.warn("PR: Error updating stealth rect during drag.")}
            }
        },
        handleDragUp: () => {
            if (APP.ui.drag.isDragging) {
                APP.ui.drag.isDragging = false;
                const header = APP.ui.wrapperElement?.querySelector('#prHeader');
                if(header) header.style.cursor = 'move';
                document.removeEventListener('mousemove', UI.handleDragMove);
                if (APP.ui.stealthOn && APP.ui.wrapperElement) {
                    setTimeout(() => {
                        try { APP.ui.stealth.rect = APP.ui.wrapperElement.classList.contains('minimized') ? APP.ui.wrapperElement.querySelector('#prHeader').getBoundingClientRect() : APP.ui.wrapperElement.getBoundingClientRect(); }
                        catch(err){console.warn("PR: Error updating stealth rect after drag end.")}
                    }, 50);
                }
            }
        },

        enterStealthMode: function() {
            if (!APP.ui.wrapperElement) return;
            const wrapper = APP.ui.wrapperElement;
            const toggleImg = wrapper.querySelector('#prStealthToggleImg');
            APP.ui.stealthOn = true;
            wrapper.classList.add('stealth-mode');
            if(toggleImg) toggleImg.classList.add('active');
            wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto';
            try {
                APP.ui.stealth.rect = wrapper.classList.contains('minimized') ? wrapper.querySelector('#prHeader').getBoundingClientRect() : wrapper.getBoundingClientRect();
                if (!APP.ui.stealth.rect || APP.ui.stealth.rect.width === 0) throw new Error("Invalid rect on stealth entry.");
                document.addEventListener('mousemove', APP.ui.stealth.mouseMoveHandler);
                console.log("PR: Stealth Mode Activated.");
                setTimeout(() => {
                    if (APP.ui.stealthOn) {
                        wrapper.style.transition = 'opacity 0.5s ease-in';
                        wrapper.style.opacity = 0;
                        wrapper.style.pointerEvents = 'none';
                        APP.ui.stealth.rect = null;
                    }
                }, 1500);
            } catch (err) { console.error("PR: Error entering stealth mode:", err); this.exitStealthMode(); this.showCustomAlert("Erro ao ativar Modo Disfarçado.", 'error'); }
        },
        exitStealthMode: function() {
            APP.ui.stealthOn = false;
            if (APP.ui.stealth.mouseMoveHandler) {
                document.removeEventListener('mousemove', APP.ui.stealth.mouseMoveHandler);
            }
            if (APP.ui.wrapperElement) {
                const wrapper = APP.ui.wrapperElement;
                const toggleImg = wrapper.querySelector('#prStealthToggleImg');
                wrapper.classList.remove('stealth-mode');
                if(toggleImg) toggleImg.classList.remove('active');
                wrapper.style.transition = 'opacity 0.3s ease-out';
                wrapper.style.opacity = 1; wrapper.style.pointerEvents = 'auto';
            }
            APP.ui.stealth.rect = null;
            console.log("PR: Stealth Mode Deactivated.");
        },

        createNotificationArea: function() {
            if (document.getElementById('prNotificationArea')) return;
            const area = document.createElement('div');
            area.id = 'prNotificationArea';
            document.body.appendChild(area);
        },

        playAudio: function(src) { // This function is now needed by the adapted setupAuto
            try { new Audio(src).play(); }
            catch (e) { console.warn("PR: Could not play audio", e); }
        },

        showCustomAlert: function(message, type = 'info', buttons = [{ text: 'OK', value: 'ok' }], alertId = 'prAlertDialog') {
             return new Promise((resolve) => {
                 this.removeOverlay(alertId); // Ensure previous alerts with same ID are removed
                 const overlay = document.createElement('div');
                 overlay.id = alertId;
                 overlay.className = 'prDialogOverlay';
                 overlay.style.zIndex = '100005'; // Ensure it's above other UI
                 const alertBox = document.createElement('div');
                 alertBox.className = 'prDialogBox';
                 alertBox.classList.add(`prAlert-${type}`);

                 // Add icon based on type
                 let iconHtml = '';
                 switch (type) {
                     case 'error': iconHtml = '<div class="prDialogIcon error">!</div>'; break;
                     case 'warning': iconHtml = '<div class="prDialogIcon warning">!</div>'; break;
                     case 'success': iconHtml = '<div class="prDialogIcon success">✓</div>'; break;
                     case 'question': iconHtml = '<div class="prDialogIcon question">?</div>'; break;
                     case 'info': default: iconHtml = '<div class="prDialogIcon info">i</div>'; break;
                 }

                 // Add message
                 const messageP = document.createElement('p');
                 messageP.className = 'prDialogMessage';
                 messageP.innerHTML = message; // Use innerHTML to allow basic formatting like <br>

                 // Add buttons
                 const buttonContainer = document.createElement('div');
                 buttonContainer.className = 'prDialogButtonContainer';
                 buttons.forEach(buttonInfo => {
                     const btn = document.createElement('button');
                     btn.textContent = buttonInfo.text;
                     btn.className = `prDialogButton ${buttonInfo.class || ''}`;
                     btn.onclick = () => {
                         // Animate out before removing and resolving
                         alertBox.classList.remove('prDialogEnter');
                         alertBox.classList.add('prDialogExit');
                         overlay.classList.add('prDialogFadeOut');
                         setTimeout(() => {
                             this.removeOverlay(overlay); // Use the remove function for cleanup
                             resolve(buttonInfo.value !== undefined ? buttonInfo.value : buttonInfo.text); // Resolve with value or text
                         }, 400); // Match animation duration
                     };
                     buttonContainer.appendChild(btn);
                 });

                 // Assemble the alert box
                 alertBox.innerHTML = iconHtml;
                 alertBox.appendChild(messageP);
                 alertBox.appendChild(buttonContainer);

                 // Add to overlay and display
                 overlay.appendChild(alertBox);
                 document.body.appendChild(overlay);

                 // Trigger animations
                 void alertBox.offsetWidth; // Force reflow
                 overlay.classList.add('prDialogFadeIn');
                 alertBox.classList.add('prDialogEnter');
             });
        },


        removeOverlay: function(elementOrId) {
             let overlayElement = (typeof elementOrId === 'string') ? document.getElementById(elementOrId) : (elementOrId instanceof HTMLElement ? elementOrId : null);
             if (overlayElement && document.body.contains(overlayElement)) {
                 // Check if it's one of our known overlays/toasts that need fade-out
                 if (overlayElement.classList.contains('prDialogOverlay') || overlayElement.classList.contains('pr-toast')) {
                     // Apply fade-out styles if not already fading
                     if (!overlayElement.classList.contains('prDialogFadeOut')) {
                         overlayElement.style.transition = 'opacity 0.3s ease-out'; // Ensure transition is set
                         overlayElement.style.opacity = '0';

                         const contentBox = overlayElement.querySelector('.prDialogBox, .pr-toast-content');
                         if (contentBox && !contentBox.classList.contains('prDialogExit')) {
                              // Apply content fade/scale out if applicable
                              contentBox.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-in';
                              contentBox.style.opacity = '0';
                              contentBox.style.transform = 'scale(0.9)';
                         }
                     }
                     // Set timeout to remove after fade-out
                     setTimeout(() => {
                         if (overlayElement && document.body.contains(overlayElement)) {
                             document.body.removeChild(overlayElement);
                         }
                     }, 300); // Match transition duration
                 } else {
                     // If it's not a known overlay needing fade, just remove it directly
                     overlayElement.remove();
                 }
             }
        },


        init: function() {
            this.addStyles();
            this.showSplash();
            console.log("PR: UI Initialized.");
        },

        addStyles: function() {
            // Check if styles already exist
            if (document.getElementById('prStyles')) return;

            const css = `
            /* ======================================== */
            /* ========== Paraná Resolve CSS ========== */
            /* Version: ${APP.ver}                      */
            /* ======================================== */

            /* --- Global Resets & Variables --- */
            :root { --pr-purple-light: #a056f7; --pr-purple-dark: #7022b6; --pr-bg-dark-1: #1a1a1d; --pr-bg-dark-2: #2a2a2f; --pr-bg-dark-3: #28282d; --pr-border-color: #555; --pr-text-light: #f0f0f0; --pr-text-medium: #bbb; --pr-text-dark: #333; --site-blue-light: #7b53c1; --site-bg-light: #e8f0fe; --site-bg-medium: #f0f5ff; --site-text-dark: #333; --site-text-blue: #335a8a; --site-border-light: #a0b0d0; --site-border-blue: var(--site-blue-light); }

            /* --- Splash Screen Styles --- */
             #prSplash { position: fixed; inset: 0; background:transparent; display:flex; align-items:center; justify-content:center; z-index:99999; overflow:hidden; animation: prSplashHideFast 0.6s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards ${SPLASH_TIMEOUT / 1000}s; }
             #prSplashBgEffect { position: absolute; inset: 0; overflow: hidden; z-index: 1; background: radial-gradient(circle, #3a205f 0%, #0a0514 80%); opacity: 0; animation: prBgSplashEnterFast ${SPLASH_TIMEOUT / 1000 * 0.9}s ease-out forwards; }
             .prSplashGrid { position: absolute; inset: -200px; z-index: 2; background-image: linear-gradient(rgba(138, 43, 226, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(138, 43, 226, 0.07) 1px, transparent 1px); background-size: 55px 55px; opacity: 0; animation: prGridFadeMoveFast ${SPLASH_TIMEOUT / 1000 * 1.1}s ease-out forwards 0.1s; }
             #prSplashContent { z-index: 3; display:flex; flex-direction:column; align-items:center; justify-content:center; perspective: 1000px; }
             #prSplashImg { width:170px; margin-bottom: 20px; filter: drop-shadow(0 7px 28px rgba(160, 86, 247, 0.75)); opacity: 0; transform: scale(0.6) rotateZ(-45deg) translateY(60px); animation: prLogoSuperEntryFast 1.6s cubic-bezier(0.175, 0.885, 0.32, 1.3) forwards 0.3s, prLogoFloatBob 2s ease-in-out infinite alternate 2s; }
             #prSplashTexts { opacity: 0; transform: translateY(25px) scale(0.9); animation: prTextsSuperAppearFast 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards 1.8s; text-align: center; }
             #prSplashTitle { font-size: 2.7em; font-weight: 900; letter-spacing: 1px; margin-bottom: 4px; font-family:'Segoe UI Black', Arial, sans-serif; color:#fff; text-shadow: 0 0 12px rgba(220, 180, 255, 0.8); background: linear-gradient(45deg, #e0cffc, #b37ffc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
             #prSplashSubtitle { font-size: 1.4em; font-weight: 300; color: #e5d9ff; font-family:'Segoe UI Light', Arial, sans-serif; letter-spacing: 0.8px; animation: prSubtitleGlow 2s ease-in-out infinite alternate 2.5s; }
             #prLoadingBar { width: 250px; height: 7px; background-color: rgba(255, 255, 255, 0.1); border-radius: 3.5px; margin-top: 35px; overflow: hidden; opacity: 0; transform: scaleX(0); animation: prBarSuperAppear 0.6s ease-out forwards ${SPLASH_TIMEOUT / 1000 * 0.75}s; box-shadow: inset 0 1px 2px rgba(0,0,0,0.3); }
             #prLoadingProgress { width: 0%; height: 100%; background: linear-gradient(90deg, #b37ffc, #f0dfff); border-radius: 3.5px; animation: prLoadingAnimFinalFast 0.8s cubic-bezier(0.65, 0.05, 0.36, 1) forwards ${SPLASH_TIMEOUT / 1000 * 0.8}s; position: relative; overflow: hidden;}
             #prLoadingProgress::after { content: ''; position: absolute; top: 0; left: -50%; width: 50%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%); transform: skewX(-25deg); animation: prShimmer 1.2s infinite; animation-delay: ${SPLASH_TIMEOUT / 1000 * 0.85}s;}
             @keyframes prSplashHideFast { to { opacity: 0; visibility: hidden; } } @keyframes prBgSplashEnterFast { 100% { opacity: 1; transform: scale(1); } } @keyframes prGridFadeMoveFast { 50% { opacity: 0.5; } 100% { opacity: 0.3; background-position: -110px -110px; } } @keyframes prLogoSuperEntryFast { 60% { opacity: 1; transform: scale(1.18) rotateZ(15deg) translateY(0px); } 80% { transform: scale(0.96) rotateZ(-8deg); } 100% { opacity: 1; transform: scale(1) rotateZ(0deg); } } @keyframes prLogoFloatBob { to { transform: translateY(-7px) scale(1.02); filter: drop-shadow(0 11px 33px rgba(160, 86, 247, 0.85)); } } @keyframes prTextsSuperAppearFast { to { opacity: 1; transform: translateY(0) scale(1); } } @keyframes prSubtitleGlow { to { opacity: 1; text-shadow: 0 0 7px rgba(220, 180, 255, 0.7); } } @keyframes prBarSuperAppear { to { opacity: 1; transform: scaleX(1); } } @keyframes prLoadingAnimFinalFast { to { width: 100%; } } @keyframes prShimmer { 100% { left: 120%; } }

            /* --- Main UI Wrapper --- */
            #prWrapper { position:fixed; top:15px; right:15px; border:1px solid var(--pr-border-color); border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.8); font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: var(--pr-text-light); opacity:0; transform: perspective(900px) translateX(80px) rotateY(-30deg) scale(0.9); transition:opacity 0.7s cubic-bezier(0.165, 0.84, 0.44, 1), transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1), background 0.3s ease, border-color 0.3s ease, color 0.3s ease; z-index:99998; overflow: hidden; background: linear-gradient(155deg, var(--pr-bg-dark-2), var(--pr-bg-dark-1)); }
            #prWrapper.show { opacity:1; transform: perspective(900px) translateX(0) rotateY(0deg) scale(1); }
            #prWrapper > div:not(#prResizeHandle) { border-radius: inherit; overflow: hidden; }

            /* --- Header --- */
            #prHeader { cursor:move; padding: 8px 12px; background: rgba(12, 12, 14, 0.9); backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px); border-bottom:1px solid var(--pr-border-color); font-size: 0.95em; font-weight: 600; text-align:center; border-radius:12px 12px 0 0; user-select: none; position: relative; display: flex; align-items: center; justify-content: space-between; transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease; }
            #prHeader span:first-child { flex-grow: 1; text-align: center; color: #f5f5f5; text-shadow: 0 1px 1px rgba(0,0,0,0.6); margin-left: 24px; }
             .pr-version { font-size: 0.8em; color: var(--pr-text-medium); margin-left: 5px; font-weight: normal; opacity: 0.7; }
            #prMinimizeBtn { font-size: 1.5em; font-weight: bold; color: var(--pr-text-medium); cursor: pointer; padding: 0 6px; line-height: 1; transition: color 0.2s ease, transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275); user-select: none; transform: translateY(-1px) rotate(0deg); flex-shrink: 0; }
            #prMinimizeBtn:hover { color: #fff; transform: translateY(-1px) scale(1.2) rotate(180deg); }

            /* --- Minimized State --- */
            #prWrapper.minimized { height: auto !important; min-height: 0 !important; background: rgba(12, 12, 14, 0.95); border-color: var(--pr-border-color); }
            #prWrapper.minimized #prMinimizeBtn { transform: translateY(-1px) rotate(180deg); }
            #prWrapper.minimized #prMinimizeBtn:hover { transform: translateY(-1px) scale(1.2) rotate(0deg); }
            #prWrapper.minimized #prContent { opacity: 0; padding-top: 0; padding-bottom: 0; max-height: 0; border-width: 0; margin: 0; overflow: hidden; transition: opacity 0.3s ease-out, padding 0.3s ease-out, max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-width 0.3s step-end, margin 0.3s step-end; }
            #prWrapper.minimized #prHeader { border-bottom: none; border-radius: 12px; }

            /* --- Content Area --- */
            #prContent { padding: 15px; background:rgba(40, 40, 45, 0.98); border-radius: 0 0 12px 12px; transition: opacity 0.3s ease-out, padding 0.3s ease-out, max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease; max-height: 500px; overflow-y: auto; overflow-x: hidden; }
             #prContent::-webkit-scrollbar { width: 8px; } #prContent::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; } #prContent::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; border: 1px solid #333; } #prContent::-webkit-scrollbar-thumb:hover { background: #777; }

            /* --- UI Elements: Toggles --- */
            .pr-toggle-wrapper { display:flex; align-items:center; gap:10px; margin-bottom:12px; cursor: pointer; padding: 8px 10px; border-radius: 8px; transition: background-color 0.25s ease; }
            .pr-toggle-wrapper:hover { background-color: rgba(138, 43, 226, 0.15); }
            .pr-toggle-img { width:18px; height:18px; border:2px solid var(--pr-purple-light); border-radius:5px; background:transparent; transition: all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
            .pr-toggle-img.active::after { content: '✔'; position: absolute; font-size: 12px; color: #fff; text-shadow: 0 0 4px rgba(0,0,0,0.5); opacity: 0; transform: scale(0.5) rotate(-180deg); animation: prCheckSuperAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.1s; }
            .pr-toggle-img.active { background: var(--pr-purple-light); border-color: #c89bff; transform: rotate(10deg) scale(1.05); box-shadow: 0 0 8px rgba(160, 86, 247, 0.5); }
            @keyframes prCheckSuperAppear { to { opacity: 1; transform: scale(1) rotate(0deg); } }
            .pr-toggle-text { font-size:0.95em; color: var(--pr-text-light); user-select:none; line-height: 1.2; font-weight: 500; transition: color 0.3s ease; }

            /* --- UI Elements: Speed Slider --- */
             .pr-label { color: var(--pr-text-medium); user-select: none; }
             .pr-speed-slider-container { width: 100%; position: relative; display: flex; align-items: center; gap: 10px; }
             .pr-speed-slider { -webkit-appearance: none; appearance: none; flex-grow: 1; height: 8px; border-radius: 5px; background: #333; outline: none; margin: 8px 0; cursor: pointer; }
             .pr-speed-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: linear-gradient(145deg, var(--pr-purple-light), #c89bff); cursor: pointer; border: 1px solid rgba(0,0,0,0.2); transition: transform 0.1s ease-out; }
             .pr-speed-slider::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: linear-gradient(145deg, var(--pr-purple-light), #c89bff); cursor: pointer; border: 1px solid rgba(0,0,0,0.2); transition: transform 0.1s ease-out; }
              .pr-speed-slider:active::-webkit-slider-thumb, .pr-speed-slider:active::-moz-range-thumb { transform: scale(1.1); }
             .pr-speed-value { font-size: 0.85em; color: var(--pr-text-medium); background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; min-width: 45px; text-align: center; }

             /* --- UI Elements: Credits --- */
             .pr-credit { color: var(--pr-text-medium); font-size: 0.75em; text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.1); opacity: 0.6; }

            /* --- General Animations --- */
            .prFadeInSlideUp { opacity: 0; transform: translateY(15px); animation: prFadeInSlideUpItem 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
            @keyframes prFadeInSlideUpItem { to { opacity: 1; transform: translateY(0); } }

             /* --- Custom Alert/Dialog Styles --- */
            .prDialogOverlay { position: fixed; inset: 0; background: rgba(10, 5, 20, 0.8); backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px); display: flex; align-items: center; justify-content: center; z-index: 100001; opacity: 0; pointer-events: none; transition: opacity 0.4s ease-out; }
            .prDialogOverlay.prDialogFadeIn { opacity: 1; pointer-events: auto; } .prDialogOverlay.prDialogFadeOut { opacity: 0; pointer-events: none; }
            .prDialogBox { background: linear-gradient(150deg, #333338, #212124); color: #fff; padding: 35px 45px 40px 45px; border-radius: 14px; border: 1px solid #555a60; box-shadow: 0 15px 50px rgba(0, 0, 0, 0.85); min-width: 340px; max-width: 520px; text-align: center; font-family: 'Segoe UI', sans-serif; opacity: 0; transform: scale(0.75) translateY(-35px) rotateX(-25deg); transition: opacity 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .prDialogBox.prDialogEnter { opacity: 1; transform: scale(1) translateY(0) rotateX(0deg); } .prDialogBox.prDialogExit { opacity: 0; transform: scale(0.9) translateY(20px) rotateX(15deg); }
            .prDialogIcon { width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 22px auto; display: flex; align-items: center; justify-content: center; font-size: 1.8em; font-weight: bold; color: #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.5); animation: prIconPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s backwards; transform: scale(0); opacity: 0;} /* Added initial state for animation */
            @keyframes prIconPopIn { to { transform: scale(1); opacity: 1; } }
            .prDialogIcon.info { background: linear-gradient(135deg, #58a6ff, #3c8ce7); } .prDialogIcon.success { background: linear-gradient(135deg, #56d364, #2ea043); } .prDialogIcon.warning { background: linear-gradient(135deg, #f1c40f, #d4ac0d); color: var(--pr-text-dark); } .prDialogIcon.error { background: linear-gradient(135deg, #e74c3c, #c0392b); } .prDialogIcon.question { background: linear-gradient(135deg, var(--pr-purple-light), var(--pr-purple-dark)); }
            .prDialogMessage { font-size: 1.1em; line-height: 1.65; margin: 0 0 30px 0; color: #eee; }
            .prDialogButtonContainer { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; }
            .prDialogButton { padding: 12px 30px; font-size: 1em; font-weight: bold; background: linear-gradient(145deg, var(--pr-purple-light), var(--pr-purple-dark)); border: none; border-radius:9px; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.4); cursor:pointer; transition: all 0.15s ease-out; box-shadow: 0 4px 9px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15); letter-spacing: 0.5px; }
            .prDialogButton:hover { filter: brightness(1.25) saturate(1.2); transform: translateY(-2px) scale(1.03); box-shadow: 0 7px 14px rgba(138, 43, 226, 0.5), inset 0 1px 1px rgba(255,255,255,0.25); }
            .prDialogButton:active { transform: translateY(0px) scale(0.98); filter: brightness(0.9); box-shadow: 0 2px 5px rgba(138, 43, 226, 0.4), inset 0 1px 2px rgba(0,0,0,0.2); }
            .prDialogButton.secondary { background: linear-gradient(145deg, #777, #555); } .prDialogButton.secondary:hover { filter: brightness(1.15); box-shadow: 0 7px 14px rgba(100, 100, 100, 0.4), inset 0 1px 1px rgba(255,255,255,0.15); } .prDialogButton.secondary:active { filter: brightness(0.9); box-shadow: 0 2px 5px rgba(100, 100, 100, 0.3), inset 0 1px 2px rgba(0,0,0,0.2); }

            /* --- Stealth Mode Styles --- */
            #prWrapper.stealth-mode { background: rgba(232, 240, 254, 0.95); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); border: 1px solid var(--site-border-blue); color: var(--site-text-dark); animation: none; box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3); transition: opacity 0.3s ease, background 0.3s ease, border-color 0.3s ease, color 0.3s ease; }
            #prWrapper.stealth-mode #prHeader { background: var(--site-blue-light); border-color: var(--site-border-blue); color: #fff; text-shadow: 0 1px 1px rgba(0,0,0,0.3); backdrop-filter: none; }
            #prWrapper.stealth-mode #prHeader span:first-child { color: #fff; } #prWrapper.stealth-mode .pr-version { color: rgba(255,255,255,0.8); } #prWrapper.stealth-mode #prMinimizeBtn { color: rgba(255,255,255,0.8); } #prWrapper.stealth-mode #prMinimizeBtn:hover { color: #fff; }
            #prWrapper.stealth-mode #prContent { background: rgba(240, 245, 255, 0.9); }
            #prWrapper.stealth-mode .pr-toggle-wrapper:hover { background-color: rgba(123, 83, 193, 0.1); } #prWrapper.stealth-mode .pr-toggle-img { border-color: var(--site-border-light); } #prWrapper.stealth-mode .pr-toggle-img.active { background: var(--site-blue-light); border-color: var(--site-border-blue); box-shadow: 0 0 6px rgba(123, 83, 193, 0.4); } #prWrapper.stealth-mode .pr-toggle-img.active::after { color: #fff; } #prWrapper.stealth-mode .pr-toggle-text { color: var(--site-text-blue); }
             #prWrapper.stealth-mode .pr-label { color: var(--site-text-blue); } #prWrapper.stealth-mode .pr-speed-slider { background: #ccc; } #prWrapper.stealth-mode .pr-speed-slider::-webkit-slider-thumb { background: linear-gradient(145deg, var(--site-blue-light), #9b7bd8); border-color: rgba(0,0,0,0.1); } #prWrapper.stealth-mode .pr-speed-slider::-moz-range-thumb { background: linear-gradient(145deg, var(--site-blue-light), #9b7bd8); border-color: rgba(0,0,0,0.1); } #prWrapper.stealth-mode .pr-speed-value { color: var(--site-text-blue); background: rgba(0,0,0,0.05); }
             #prWrapper.stealth-mode .pr-credit { color: #667; border-top-color: rgba(0,0,0,0.1); }
            #prWrapper.stealth-mode.minimized #prHeader { background: var(--site-blue-light); border-radius: 12px; }

             /* --- Custom Toast Notification Styles --- */
             #prNotificationArea { position: fixed; bottom: 20px; right: 20px; z-index: 100010; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; pointer-events: none; }
             .pr-toast { background: linear-gradient(140deg, #333338, #212124); color: var(--pr-text-light); padding: 12px 18px; border-radius: 8px; border: 1px solid #555a60; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5); font-family: 'Segoe UI', sans-serif; font-size: 0.95em; max-width: 300px; pointer-events: auto; opacity: 0; transform: translateX(100%); animation: prToastSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, prToastFadeOut 0.5s ease-out 3.5s forwards; display: flex; align-items: center; gap: 10px; }
             .pr-toast.success { background: linear-gradient(140deg, #2E7D32, #1B5E20); border-color: #56d364; }
             .pr-toast.error { background: linear-gradient(140deg, #c0392b, #a12f23); border-color: #e74c3c; }
             .pr-toast.warning { background: linear-gradient(140deg, #d4ac0d, #b08e0b); border-color: #f1c40f; color: #222; }
             .pr-toast.info { background: linear-gradient(140deg, #3c8ce7, #2b6db0); border-color: #58a6ff; }
             .pr-toast-icon { font-size: 1.2em; font-weight: bold; flex-shrink: 0; }
             .pr-toast-content { flex-grow: 1; }
             @keyframes prToastSlideIn { to { opacity: 1; transform: translateX(0); } }
             @keyframes prToastFadeOut { 0% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(5%); } } /* Adjusted fade out */
            `;

            const styleTag = document.createElement('style');
            styleTag.id = 'prStyles';
            styleTag.textContent = css;
            document.head.appendChild(styleTag);
        }
    };

    // ==========================================================================
    // --- Global Helper Functions --- (Original Paraná Resolve Logic - Kept Unchanged)
    // ==========================================================================

    function showPRToast(message, type = 'info', duration = 4000) {
        const area = document.getElementById('prNotificationArea');
        if (!area) { console.warn("PR Toast Error: Notification area not found."); console.log(`PR Toast [${type}]: ${message}`); return; }
        const toast = document.createElement('div');
        toast.className = `pr-toast ${type}`;
        const fadeOutDuration = 500;
        toast.style.animation = `prToastSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, prToastFadeOut ${fadeOutDuration / 1000}s ease-out ${(duration - fadeOutDuration) / 1000}s forwards`;

        let icon = '';
        switch(type) { case 'success': icon = '✅'; break; case 'error': icon = '❌'; break; case 'warning': icon = '⚠️'; break; case 'info': default: icon = 'ℹ️'; break; }
        toast.innerHTML = `<span class="pr-toast-icon">${icon}</span><span class="pr-toast-content">${message}</span>`;
        area.appendChild(toast);
        setTimeout(() => {
             if (toast && area.contains(toast)) {
                 toast.remove();
             }
         }, duration + 100);
    }


    // ==========================================================================
    // --- Script Initialization --- (Original Paraná Resolve Logic - Kept Unchanged)
    // ==========================================================================
    function initializeParanaResolve() {
        if (document.getElementById('prWrapper') || document.getElementById('prSplash')) { console.warn("PR (KDFullCore): Attempted to initialize script multiple times."); return; }
        console.log("Initializing Paraná Resolve (KDFullCore)...");
        UI.init(); // This now handles styles and splash, then triggers UI/Core creation
    }

    // Robust initialization check
    if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
        setTimeout(initializeParanaResolve, 100); // Initialize slightly delayed
    } else {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initializeParanaResolve, 100));
    }

})(); // End of IIFE
