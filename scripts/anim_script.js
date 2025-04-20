// Função para separar o texto em palavras e envolvê-las em <span>
function splitTextIntoSpans(element) {
    // É uma 'div' ou outro tipo de elemento
    if (element.children.length > 0) {
        const paragraphs = Array.from(element.children);
        const fragment = document.createDocumentFragment();

        let index = 0;
        paragraphs.forEach((paragraph) => {
            if (paragraph.children.length > 0) { return; }

            const text = paragraph.textContent.trim().split(' ');
            text.forEach((word) => {
                const span = document.createElement("span");
                span.textContent = word + "\u00A0"; // espaço não quebrável
                span.style.setProperty("--i", index);
                fragment.appendChild(span);

                index++;
            })

            paragraph.textContent = '';
            paragraph.appendChild(fragment);
        })
    } else { // É um paragrafo ou 'header' com só texto
        const text = element.textContent.trim().split(' ');
        const fragment = document.createDocumentFragment();

        // Para cada palavra
        text.forEach((word, i) => {
            const span = document.createElement("span");
            span.textContent = word + "\u00A0"; // espaço não quebrável
            span.style.setProperty("--i", i);
            fragment.appendChild(span);
        })

        element.textContent = '';
        element.appendChild(fragment);
    }
}

// Função para animar os elementos quando entram na tela
function animateOnScroll(entries, observe) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const container = entry.target;
            splitTextIntoSpans(container);
            container.style.opacity = 1;
            
            observe.unobserve(container); 
        }
    });
}

// Usando IntersectionObserver
const observer = new IntersectionObserver(animateOnScroll, {
    root: null,
    rootMargin: "0px",
    threshold: 0.5
});

// Aplicando a animação a cada parágrafo
document.querySelectorAll('.jump-text').forEach(element => {
    element.style.opacity = 0;
    observer.observe(element);
});  