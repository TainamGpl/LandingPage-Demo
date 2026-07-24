/**
 * ============================================================
 * PARTICLES.JS — Fundo Animado com Canvas (Partículas Interativas)
 * LandingPage Store © 2026
 * ============================================================
 *
 * Cria partículas flutuantes no canvas da hero section.
 * As partículas reagem ao movimento do mouse do usuário.
 */

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.animationId = null;
    this.isRunning = false;

    // Configurações visuais
    this.config = {
      count: this._getParticleCount(),
      minSize: 1,
      maxSize: 3,
      speed: 0.4,
      connectionRadius: 120,
      colors: ['#00d4aa', '#7c3aed', '#33ddb8', '#9d68f0'],
      opacity: { min: 0.2, max: 0.7 },
    };

    this._init();
  }

  /** Determina quantidade de partículas baseado no tamanho da tela */
  _getParticleCount() {
    const area = window.innerWidth * window.innerHeight;
    if (window.innerWidth < 480) return 30;
    if (window.innerWidth < 768) return 50;
    return Math.min(Math.floor(area / 12000), 100);
  }

  /** Inicializa canvas, partículas e eventos */
  _init() {
    this._resize();
    this._createParticles();
    this._bindEvents();
    this.start();
  }

  /** Redimensiona canvas para cobrir todo o hero */
  _resize() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.offsetWidth;
    this.canvas.height = parent.offsetHeight;
  }

  /** Cria todas as partículas com posições e velocidades aleatórias */
  _createParticles() {
    this.particles = [];
    const count = this.config.count;

    for (let i = 0; i < count; i++) {
      this.particles.push(this._createParticle());
    }
  }

  /** Cria uma única partícula com propriedades aleatórias */
  _createParticle(x, y) {
    const size =
      Math.random() * (this.config.maxSize - this.config.minSize) +
      this.config.minSize;

    return {
      x: x ?? Math.random() * this.canvas.width,
      y: y ?? Math.random() * this.canvas.height,
      size,
      baseSize: size,
      // Velocidade com direção aleatória
      vx: (Math.random() - 0.5) * this.config.speed * 2,
      vy: (Math.random() - 0.5) * this.config.speed * 2,
      color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
      opacity: Math.random() * (this.config.opacity.max - this.config.opacity.min) + this.config.opacity.min,
      // Fase aleatória para animação de pulso
      phase: Math.random() * Math.PI * 2,
    };
  }

  /** Registra eventos de mouse, resize e visibilidade */
  _bindEvents() {
    const hero = this.canvas.parentElement;

    // Rastreia posição do mouse dentro do hero
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    // Remove influência do mouse quando sai
    hero.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // Re-cria partículas ao redimensionar janela
    window.addEventListener('resize', () => {
      this._resize();
      this.config.count = this._getParticleCount();
      this._createParticles();
    });

    // Pausa animação quando aba fica invisível (performance)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  /** Atualiza posição e física de cada partícula */
  _update(time) {
    this.particles.forEach((p) => {
      // Movimento baseado em tempo (mais suave que baseado em frame)
      p.x += p.vx;
      p.y += p.vy;

      // Pulso de tamanho suave
      p.size = p.baseSize + Math.sin(time * 0.001 + p.phase) * 0.5;

      // Interação com mouse — repele partículas próximas
      if (this.mouse.x !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouse.radius) {
          const force = (1 - dist / this.mouse.radius) * 2;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // Volta pelo lado oposto quando sai do canvas (wrap around)
      if (p.x < -10) p.x = this.canvas.width + 10;
      if (p.x > this.canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.canvas.height + 10;
      if (p.y > this.canvas.height + 10) p.y = -10;
    });
  }

  /** Renderiza partículas e conexões entre elas */
  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Desenha conexões entre partículas próximas
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.config.connectionRadius) {
          // Opacidade diminui com a distância
          const alpha = (1 - dist / this.config.connectionRadius) * 0.15;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0, 212, 170, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Desenha cada partícula como círculo com glow
    this.particles.forEach((p) => {
      // Glow suave ao redor da partícula
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      gradient.addColorStop(0, `${p.color}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${p.color}00`);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Núcleo sólido
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    });
  }

  /** Loop de animação principal via requestAnimationFrame */
  _loop(time = 0) {
    if (!this.isRunning) return;
    this._update(time);
    this._draw();
    this.animationId = requestAnimationFrame((t) => this._loop(t));
  }

  /** Inicia a animação */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._loop();
  }

  /** Para a animação e libera recursos */
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// Inicializa o sistema de partículas após o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
  // Verifica preferência de movimento reduzido do usuário
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    window.particleSystem = new ParticleSystem('particles-canvas');
  }
});
