document.querySelectorAll('.get-script-box').forEach(box => {
    const btn = box.querySelector('.toggle-btn');
    const link = box.querySelector('.link-input');
    const textoOriginal = btn.textContent;
    const paddingOriginal = window.getComputedStyle(btn).padding;
  
    let aberto = false;
  
    btn.addEventListener('click', () => {
        aberto = !aberto;
  
        link.classList.toggle('hidden', !aberto);
        btn.textContent = aberto ? '>' : textoOriginal;
        btn.style.padding = aberto ? '15px 20px' : paddingOriginal;
    });
});
