const css = `
    /* === ANIMAÇÕES GERAIS === */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeOut { to { opacity: 0; visibility: hidden; } } /* Adicionado visibility */
    @keyframes popIn {
      0% { transform: scale(0.7); opacity: 0; }
      80% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
     @keyframes popOut { /* Animação para fechar modal */
        from { transform: scale(1) translate(-50%, -50%); opacity: 1; }
        to { transform: scale(0.8) translate(-50%, -50%); opacity: 0; visibility: hidden; }
    }
    @keyframes subtlePop { /* Animação mais sutil para botões */
        from { transform: scale(1); }
        to { transform: scale(0.95); }
    }
    @keyframes subtleGrow { /* Animação mais sutil para hover */
        from { transform: scale(1); }
        to { transform: scale(1.03); }
    }
    @keyframes bounceInUp { /* Animação para entrada da UI principal */
        0% { opacity: 0; transform: translateY(30px) scale(0.95); }
        60% { opacity: 1; transform: translateY(-10px) scale(1.02); }
        80% { transform: translateY(5px) scale(0.98); }
        100% { transform: translateY(0) scale(1); }
    }

    /* === SPLASH (Animações Refinadas) === */
    #bmSplash {
      /* ... (mantém estilos anteriores) ... */
      animation: fadeOut 0.7s forwards 3s ease-in-out; /* Fade mais suave */
    }
    #bmSplashImg {
      width: 200px;
      animation: popIn .6s forwards cubic-bezier(0.68, -0.55, 0.27, 1.55), /* Efeito bounce */
                 moveUp .5s forwards .9s ease-out;
    }
    #bmSplashTxt1 {
      font-family: 'Segoe UI Black', sans-serif; color: #fff; font-size: 2em; opacity: 0;
      animation: fadeIn .5s forwards 1.4s ease-out; /* Simples fade */
    }
    #bmSplashTxt2 {
       font-family: 'Segoe UI Black', sans-serif; color: #fff; font-size: 2em; opacity: 0;
      animation: fadeIn .5s forwards 1.9s ease-out;
    }
    @keyframes moveUp { from{transform:translateY(0)} to{transform:translateY(-30px)} }
    /* @keyframes txt1Pop, @keyframes txt2Pop removidos (usando fadeIn agora) */

    /* === WRAPPER PRINCIPAL (Animação Melhorada) === */
    #bmWrapper {
      position: fixed; top: 20px; right: 20px;
      width: 320px;
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 8px; /* Um pouco mais redondo */
      box-shadow: 0 6px 15px rgba(0,0,0,.6); /* Sombra mais pronunciada */
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Fonte mais padrão */
      color: #e0e0e0; /* Cinza claro para texto */
      opacity: 0;
      /* Removido transform inicial daqui, será controlado pela animação */
      z-index: 99998;
       /* transition removida, usaremos animação */
    }
    #bmWrapper.show {
       opacity: 1; /* Garante visibilidade */
       animation: bounceInUp 0.6s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Animação de entrada */
    }

    /* header (Leves ajustes) */
    #bmHeader {
      cursor: move;
      padding: 10px 15px; /* Mais espaçamento */
      background: #111;
      border-bottom: 1px solid #333;
      font-size: 0.95em;
      font-weight: bold; /* Negrito */
      text-align: center;
      border-radius: 8px 8px 0 0;
      color: #ccc;
    }

    /* conteúdo */
    #bmContent {
      padding: 15px;
      background: #1b1b1b;
      border-radius: 0 0 8px 8px;
    }
    #bmContent textarea,
    #bmContent input[type="number"] { /* Especificidade para o input number */
      width: 100%;
      margin-bottom: 12px;
      padding: 10px;
      font-size: 0.95em;
      background: #2a2a2a;
      border: 1px solid #444; /* Borda um pouco mais clara */
      border-radius: 4px;
      color: #e0e0e0;
      box-sizing: border-box;
      transition: border-color .2s ease-in-out, box-shadow .2s ease-in-out; /* Transição suave */
    }
    #bmContent textarea {
        resize: vertical; /* Permite redimensionar verticalmente */
        min-height: 80px; /* Altura mínima */
    }
    #bmContent textarea:focus,
    #bmContent input[type="number"]:focus {
      outline: none;
      border-color: #8A2BE2;
      box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.3); /* Glow roxo */
    }

    /* Estilo comum para botões (Animações Refinadas) */
    #bmContent button {
      width: 100%;
      padding: 10px;
      margin-top: 8px;
      font-size: 0.95em;
      font-weight: bold;
      background: transparent;
      border: 2px solid #8A2BE2; /* Borda mais grossa */
      border-radius: 5px;
      color: #8A2BE2;
      cursor: pointer;
      transition: background .2s ease-out, color .2s ease-out, transform .15s ease-out; /* Transições mais rápidas */
      box-sizing: border-box;
    }
     #bmContent button:disabled {
       cursor: not-allowed;
       opacity: 0.5;
       border-color: #555;
       color: #555;
       background: transparent !important; /* Garante fundo transparente */
       transform: none !important; /* Remove transform em disabled */
     }
     #bmContent button:not(:disabled):hover {
       background: #8A2BE2;
       color: #111;
       transform: scale(1.03); /* Usa scale em vez de keyframes para hover simples */
     }
     #bmContent button:not(:disabled):active {
       transform: scale(0.97); /* Efeito de clique */
       transition-duration: 0.05s; /* Clique mais rápido */
     }

    /* toggle “Modo Disfarçado” */
    #bmToggleWrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      cursor: pointer; /* Cursor no wrapper todo */
       user-select: none; /* Evita seleção de texto */
    }
    #bmToggleImg {
      width: 16px; height: 16px; /* Maior */
      border: 2px solid #8A2BE2;
      border-radius: 3px;
      background: transparent;
      transition: background .2s ease-out, border-color .2s ease-out; /* Transição suave */
      flex-shrink: 0; /* Evita encolher */
    }
    #bmToggleText {
      font-size: 0.9em;
      color: #ccc;
      transition: color .2s ease-out;
    }
    #bmToggleWrapper:hover #bmToggleImg {
        border-color: #a455ff; /* Roxo mais claro no hover */
    }
    #bmToggleWrapper:hover #bmToggleText {
        color: #fff;
    }

    /* contador 3-2-1 (Animação Melhorada) */
    .bm-countdown-number { /* Classe para o número */
        position: absolute;
        top: 50%; /* Centraliza melhor verticalmente */
        left: 50%;
        transform: translate(-50%, -50%) scale(0.5); /* Começa menor e centralizado */
        font-family: 'Segoe UI Black', sans-serif;
        color: #8A2BE2;
        font-size: 3em; /* Maior */
        opacity: 0;
        animation: countPop 0.7s ease-out forwards;
        z-index: 10;
        pointer-events: none; /* Não interfere com cliques */
    }
    @keyframes countPop {
      0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
      60%  { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1); visibility: hidden; }
    }

    /* overlay stealth (Leves Ajustes) */
    #bmOv {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,.9);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 100000;
      animation: fadeIn .4s forwards ease-out; /* Usando fadeIn padrão */
    }
    #bmOv img {
      max-width: 70%; max-height: 50%;
      animation: popIn .5s forwards .2s cubic-bezier(0.68, -0.55, 0.27, 1.55); /* Animação com delay */
    }
     #bmOv p { /* Estilo para o texto do overlay */
        color: #ccc;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        text-align: center;
        margin-top: 20px;
        max-width: 80%;
        line-height: 1.5;
        opacity: 0;
        animation: fadeIn 0.5s forwards 0.5s; /* Aparece depois da imagem */
    }
    #bmOv button {
      margin-top: 25px;
      padding: 10px 20px;
      background: #8A2BE2; /* Roxo */
      color: #fff;
      border: none;
      border-radius: 5px;
      font-size: 1em;
      font-weight: bold;
      cursor: pointer;
      transition: transform .2s ease-out, background .2s ease-out;
      width: auto;
      opacity: 0;
      animation: fadeIn 0.5s forwards 0.7s; /* Aparece por último */
    }
    #bmOv button:hover {
      background: #7022b6; /* Roxo mais escuro */
      transform: scale(1.05);
    }

    /* === ESTILOS PARA O NOVO MODAL DE ALERTA === */
    #bmAlertOverlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.7); /* Fundo escuro semi-transparente */
        z-index: 100001; /* Acima de tudo, exceto o alerta */
        opacity: 0;
        animation: fadeIn 0.3s forwards ease-out;
    }
    #bmCustomAlert {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%) scale(0.8); /* Começa um pouco menor */
        width: 90%;
        max-width: 400px; /* Largura máxima */
        background: #1e1e1e;
        border: 1px solid #333;
        border-radius: 8px;
        box-shadow: 0 8px 25px rgba(0,0,0,.7);
        z-index: 100002; /* Acima do overlay */
        padding: 20px;
        box-sizing: border-box;
        opacity: 0;
        color: #e0e0e0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center; /* Centraliza conteúdo */
        animation: bmAlertBoxPopIn 0.4s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Animação de entrada */
        animation-delay: 0.1s; /* Pequeno delay para aparecer depois do overlay */
    }
     #bmCustomAlert p {
        margin: 0 0 20px 0; /* Espaço abaixo do texto */
        font-size: 1em;
        line-height: 1.6;
        text-align: center; /* Centraliza texto */
        color: #ccc;
    }
    #bmCustomAlert button { /* Botão do alerta */
        padding: 10px 25px;
        font-size: 0.95em;
        font-weight: bold;
        background: #8A2BE2; /* Roxo */
        border: none; /* Sem borda */
        border-radius: 5px;
        color: #fff; /* Texto branco */
        cursor: pointer;
        transition: background .2s ease-out, transform .15s ease-out;
        width: auto; /* Largura automática */
        min-width: 100px; /* Largura mínima */
    }
    #bmCustomAlert button:hover {
        background: #7022b6; /* Roxo mais escuro */
        transform: scale(1.05);
    }
     #bmCustomAlert button:active {
        transform: scale(0.95);
        transition-duration: 0.05s;
    }

    /* Animações de entrada/saída específicas do Modal */
    @keyframes bmAlertBoxPopIn {
       0% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
       80% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
       100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    /* Precisaremos de JS para adicionar uma classe para a animação de saída */
    #bmCustomAlert.bm-alert-closing {
        animation: popOut 0.3s forwards ease-in-out;
    }
    #bmAlertOverlay.bm-alert-closing {
         animation: fadeOut 0.3s forwards ease-in-out;
    }


    /* Estilos Modo Disfarçado (Adaptação para nova fonte/cores) */
    #bmWrapper.stealth-mode { /* Classe para modo disfarçado */
        background: #f0f0f0;
        color: #333;
        border-color: #ccc;
    }
    #bmWrapper.stealth-mode #bmHeader {
        background: #e0e0e0;
        color: #333;
        border-bottom-color: #ccc;
    }
     #bmWrapper.stealth-mode #bmContent {
         background: #f5f5f5; /* Fundo do conteúdo ligeiramente diferente */
     }
    #bmWrapper.stealth-mode #bmContent textarea,
    #bmWrapper.stealth-mode #bmContent input[type="number"] {
        background: #fff;
        color: #000;
        border-color: #ccc;
    }
     #bmWrapper.stealth-mode #bmContent textarea:focus,
    #bmWrapper.stealth-mode #bmContent input[type="number"]:focus {
        border-color: #888; /* Cor de foco mais sutil */
        box-shadow: 0 0 0 3px rgba(100, 100, 100, 0.2);
    }
    #bmWrapper.stealth-mode #bmContent button {
        background: #e0e0e0;
        color: #555;
        border: 2px solid #aaa; /* Borda cinza */
    }
     #bmWrapper.stealth-mode #bmContent button:hover {
         background: #d0d0d0;
         color: #222;
         transform: scale(1.03);
     }
     #bmWrapper.stealth-mode #bmContent button:active {
         transform: scale(0.97);
     }
     #bmWrapper.stealth-mode #bmToggleWrapper #bmToggleText {
         color: #555;
     }
     #bmWrapper.stealth-mode #bmToggleWrapper #bmToggleImg {
         border-color: #aaa;
         background: #e0e0e0; /* Caixa fica preenchida no modo claro */
     }
     #bmWrapper.stealth-mode #bmToggleWrapper #bmToggleImg.toggled-on {
         background: #888; /* Cor quando ligado no modo claro */
         border-color: #666;
     }

  `;
  const styleTag = document.createElement('style');
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);
