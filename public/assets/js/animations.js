/**
 * ============================================================
 * ANIMATIONS.JS — Scroll Reveal & Contadores Animados
 * LandingPage Store © 2026
 * ============================================================
 *
 * Módulo responsável por:
 * 1. ScrollReveal — revela elementos conforme o usuário rola a página
 * 2. CountUp — anima números incrementalmente quando entram na tela
 */

/* ════════════════════════════════════════════════════════════
   1. SCROLL REVEAL COM IntersectionObserver
   ════════════════════════════════════════════════════════════ */

/**
 * Inicializa o scroll reveal.
 * Todos os elementos com classe .reveal entram suavemente
 * quando ficam visíveis na viewport.
 */
function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Se o usuário preferir menos movimento, torna tudo visível diretamente
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  const options = {
    root: null,           // viewport
    rootMargin: '0px 0px -60px 0px',  // ativa um pouco antes de sair da tela
    threshold: 0.1,       // 10% do elemento visível já dispara
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Para de observar após revelar (já não precisa mais)
        observer.unobserve(entry.target);
      }
    });
  }, options);

  // Observa todos os elementos marcados com .reveal
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

/* ════════════════════════════════════════════════════════════
   2. CONTADOR ANIMADO (COUNT UP)
   ════════════════════════════════════════════════════════════ */

/**
 * Anima um número de 0 até o valor target.
 * @param {HTMLElement} el - Elemento que contém o número
 * @param {number} target  - Valor final
 * @param {number} duration - Duração em ms
 * @param {string} suffix  - Sufixo após o número (ex: "+", "k", "%")
 */
function animateCounter(el, target, duration = 1800, suffix = '') {
  const startTime = performance.now();
  const startValue = 0;

  // Easing: easeOutExpo para desacelerar suavemente
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutExpo(progress);
    const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);

    el.textContent = currentValue.toLocaleString('pt-BR') + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString('pt-BR') + suffix;
    }
  }

  requestAnimationFrame(update);
}

/**
 * Inicializa todos os contadores animados.
 * Elementos precisam ter data-count e opcionalmente data-suffix.
 */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          const target = parseInt(entry.target.dataset.count, 10);
          const suffix = entry.target.dataset.suffix || '';
          const duration = parseInt(entry.target.dataset.duration, 10) || 1800;

          entry.target.dataset.animated = 'true';
          animateCounter(entry.target, target, duration, suffix);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ════════════════════════════════════════════════════════════
   3. EFEITO TYPEWRITER NO HERO
   ════════════════════════════════════════════════════════════ */

/**
 * Anima texto com efeito máquina de escrever.
 * @param {string} elementId - ID do elemento destino
 * @param {string[]} texts   - Array de textos para alternar
 * @param {number} speed     - Velocidade de digitação em ms
 */
function initTypewriter(elementId, texts, speed = 80) {
  const el = document.getElementById(elementId);
  if (!el || !texts.length) return;

  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;

  const PAUSE_DURATION = 2000; // Tempo de pausa ao completar um texto
  const DELETE_SPEED = speed / 2;

  function type() {
    const currentText = texts[textIndex];

    if (isPaused) return;

    if (!isDeleting) {
      // Digitando
      el.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentText.length) {
        // Terminou de digitar — pausa antes de apagar
        isPaused = true;
        setTimeout(() => {
          isPaused = false;
          isDeleting = true;
          setTimeout(type, DELETE_SPEED);
        }, PAUSE_DURATION);
        return;
      }
    } else {
      // Apagando
      el.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
      }
    }

    setTimeout(type, isDeleting ? DELETE_SPEED : speed);
  }

  // Começa após um pequeno delay inicial
  setTimeout(type, 800);
}

// Exporta para uso no main.js
export { initScrollReveal, initCounters, initTypewriter };
