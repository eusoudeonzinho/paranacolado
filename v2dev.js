javascript:(function(){
  /* Cria o container principal do overlay */
  var overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = '#1a1a1a'; /* Preto bem escuro, quase preto */
  overlay.style.zIndex = '99999';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.overflow = 'hidden'; /* Para evitar barras de rolagem se o conteúdo for maior */

  /* Cria o elemento da imagem */
  var img = document.createElement('img');
  img.src = 'https://i.imgur.com/dbROaRM.png';
  img.style.maxWidth = '80%'; /* Para responsividade, não ultrapassar 80% da largura da tela */
  img.style.maxHeight = '60vh'; /* Para responsividade, não ultrapassar 60% da altura da tela */
  img.style.objectFit = 'contain';
  img.style.marginBottom = '20px'; /* Espaço entre a imagem e o texto */
  img.style.display = 'block'; /* Garante que margin funcione corretamente */

  /* Cria o elemento do texto */
  var textoDiv = document.createElement('div');
  textoDiv.innerHTML = 'Em manutenção';
  textoDiv.style.backgroundColor = 'gray';
  textoDiv.style.color = 'purple';
  textoDiv.style.padding = '15px 30px';
  textoDiv.style.fontSize = '24px';
  textoDiv.style.fontWeight = 'bold';
  textoDiv.style.textAlign = 'center';
  textoDiv.style.borderRadius = '5px';
  textoDiv.style.fontFamily = 'Arial, sans-serif'; /* Uma fonte padrão */

  /* Adiciona a imagem e o texto ao container do overlay */
  overlay.appendChild(img);
  overlay.appendChild(textoDiv);

  /* Adiciona o overlay à página */
  document.body.appendChild(overlay);

  /* Opcional: desabilita o scroll da página principal */
  document.body.style.overflow = 'hidden';

  /* Para re-habilitar o scroll se você remover o overlay manualmente via console:
     overlay.remove(); document.body.style.overflow = 'auto';
  */
})();
