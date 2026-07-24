/**
 * ============================================================
 * CHATBOT.JS — Assistente local de demonstração
 * LandingPage Store © 2026
 * ============================================================
 *
 * Chatbot rule-based que responde dúvidas sobre os planos,
 * templates e navegação do site. Funciona 100% offline,
 * sem precisar de API externa.
 */

/* ════════════════════════════════════════════════════════════
   BASE DE CONHECIMENTO DO AGENTE
   ════════════════════════════════════════════════════════════ */

const KNOWLEDGE_BASE = [
  // ── Saudações ──────────────────────────────────────────
  {
    patterns: ['oi', 'olá', 'ola', 'hey', 'boa tarde', 'boa noite', 'bom dia', 'e ai', 'eai', 'hello'],
    response: '👋 Olá! Sou a Luna, assistente fictícia desta demonstração local.\n\nNão há atendimento, backend ou pagamentos reais. Posso explicar:\n• Planos ilustrativos\n• Templates exibidos\n• Como explorar a interface\n• Privacidade da demo',
  },

  // ── Preços e Planos ─────────────────────────────────────
  {
    patterns: ['preço', 'preco', 'valor', 'custo', 'quanto custa', 'plano', 'planos', 'básico', 'profissional', 'empresarial'],
    response: '💳 A interface mostra três planos fictícios para demonstrar cards, seleção e checkout. Os valores são ilustrativos e não representam uma oferta comercial.',
  },

  // ── Templates ───────────────────────────────────────────
  {
    patterns: ['template', 'templates', 'modelo', 'modelos', 'design', 'página', 'pagina', 'landing'],
    response: '🛠️ Temos 45+ templates profissionais em várias categorias:\n\n📦 Vendas e Produtos\n💊 Saúde e Bem-estar\n🎓 Educação e Cursos\n🔧 Serviços e Freelancers\n🎉 Eventos e Webinars\n\nTodos são responsivos, otimizados para SEO e editáveis sem precisar saber programar!\n\n👉 Veja todos em: /pages/servicos.html',
  },

  // ── Transações fictícias ────────────────────────────────
  {
    patterns: ['garantia', 'reembolso', 'devolução', 'devoluçao', '7 dias', 'não gostei', 'nao gostei', 'cancelar'],
    response: '🧪 Não existe compra, cobrança ou reembolso nesta demonstração. Nenhuma transação real é realizada.',
  },

  // ── Como usar / Instalar ────────────────────────────────
  {
    patterns: ['como usar', 'como instalar', 'como funciona', 'preciso saber programar', 'programaçao', 'programação', 'difícil', 'dificil', 'fácil', 'facil'],
    response: '🎉 Explore os cards, selecione um plano fictício e percorra o checkout demonstrativo. Use somente dados inventados; tudo funciona localmente no navegador.',
  },

  // ── Hospedagem ──────────────────────────────────────────
  {
    patterns: ['hospedagem', 'hospedar', 'publicar', 'colocar no ar', 'deploy', 'servidor', 'domínio', 'dominio'],
    response: '🌐 Esta demonstração apresenta uma interface web estática. Ela não inclui serviço de hospedagem, contrato ou produto disponível para compra.',
  },

  // ── Contato ─────────────────────────────────────────────
  {
    patterns: ['contato', 'falar', 'email', 'e-mail', 'whatsapp', 'zap', 'suporte', 'atendimento', 'ajuda'],
    response: '🧪 A página de contato é apenas uma simulação local. O formulário não envia mensagens e não há canal de atendimento associado a esta demo.',
  },

  // ── Sobre o projeto ─────────────────────────────────────
  {
    patterns: ['sobre', 'empresa', 'quem são', 'quem sao', 'história', 'historia', 'fundação', 'quando'],
    response: '🏢 LandingPage Store é um projeto fictício de portfólio criado para demonstrar design, responsividade e interações web. Números, equipe e depoimentos são exemplos ilustrativos.',
  },

  // ── Pagamento fictício ──────────────────────────────────
  {
    patterns: ['pagamento', 'pagar', 'cartão', 'cartao', 'pix', 'boleto', 'parcelar', 'parcela'],
    response: '💳 Os métodos exibidos são apenas elementos visuais. Não há integração bancária, cobrança, aprovação ou download de produto.',
  },

  // ── Obrigado / Tchau ────────────────────────────────────
  {
    patterns: ['obrigado', 'obrigada', 'valeu', 'vlw', 'tchauzinho', 'tchau', 'até', 'ate', 'bye', 'ok'],
    response: '😊 Fico feliz em ajudar! Se tiver mais dúvidas, é só chamar.\n\nBoa sorte com seu projeto! 🚀✨',
  },
];

// Resposta padrão quando não entende a pergunta
const DEFAULT_RESPONSES = [
  '🤔 Não entendi muito bem. Posso explicar os planos ilustrativos, templates, navegação ou privacidade desta demonstração.',
  '😅 Sou um chatbot local baseado em regras, sem equipe de atendimento ou envio de mensagens.',
  '🔍 Tente perguntar sobre a demonstração, os templates exibidos ou o funcionamento local no navegador.',
];

/* ════════════════════════════════════════════════════════════
   MOTOR DE PROCESSAMENTO DE LINGUAGEM NATURAL (SIMPLES)
   ════════════════════════════════════════════════════════════ */

/**
 * Normaliza texto removendo acentos, pontuação e lowercase
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, ' ')   // Remove pontuação
    .trim();
}

/**
 * Encontra a melhor resposta baseada nos padrões
 */
function findBestResponse(userInput) {
  const normalized = normalizeText(userInput);
  const words = normalized.split(/\s+/);

  let bestMatch = null;
  let bestScore = 0;

  KNOWLEDGE_BASE.forEach((entry) => {
    let score = 0;

    entry.patterns.forEach((pattern) => {
      const normalizedPattern = normalizeText(pattern);

      // Correspondência exata da frase
      if (normalized.includes(normalizedPattern)) {
        score += normalizedPattern.split(' ').length * 2;
      }

      // Correspondência de palavras individuais
      normalizedPattern.split(' ').forEach((word) => {
        if (words.includes(word) && word.length > 2) {
          score += 1;
        }
      });
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  });

  // Threshold mínimo de confiança
  if (bestScore >= 1 && bestMatch) {
    return bestMatch.response;
  }

  // Resposta aleatória de fallback
  return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
}

/** Adiciona texto do bot com suporte seguro a **bold** e quebras de linha. */
function appendFormattedBotText(container, text) {
  String(text).split('\n').forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      container.appendChild(document.createElement('br'));
    }

    const boldPattern = /\*\*(.*?)\*\*/g;
    let cursor = 0;
    let match;

    while ((match = boldPattern.exec(line)) !== null) {
      if (match.index > cursor) {
        container.appendChild(
          document.createTextNode(line.slice(cursor, match.index)),
        );
      }

      const strong = document.createElement('strong');
      strong.textContent = match[1];
      container.appendChild(strong);
      cursor = boldPattern.lastIndex;
    }

    if (cursor < line.length) {
      container.appendChild(document.createTextNode(line.slice(cursor)));
    }
  });
}

/* ════════════════════════════════════════════════════════════
   INTERFACE DO CHATBOT (UI)
   ════════════════════════════════════════════════════════════ */

class ChatbotWidget {
  constructor() {
    this.isOpen = false;
    this.messageHistory = [];
    this.isTyping = false;
    this.container = null;

    this._createHTML();
    this._bindEvents();
    this._sendWelcomeMessage();
  }

  /** Cria toda a estrutura HTML do widget */
  _createHTML() {
    const widget = document.createElement('div');
    widget.id = 'chatbot-widget';
    widget.setAttribute('role', 'complementary');
    widget.setAttribute('aria-label', 'Chatbot local de demonstração');
    widget.innerHTML = `
      <!-- Botão flutuante -->
      <button class="chatbot-toggle" id="chatbot-toggle"
        aria-label="Abrir chatbot de demonstração" aria-expanded="false"
        aria-controls="chatbot-window">
        <span class="chatbot-toggle__icon chatbot-toggle__icon--chat">💬</span>
        <span class="chatbot-toggle__icon chatbot-toggle__icon--close" aria-hidden="true">✕</span>
        <span class="chatbot-badge" id="chatbot-badge" aria-label="1 mensagem não lida">1</span>
      </button>

      <!-- Janela do chat -->
      <div class="chatbot-window" id="chatbot-window" aria-hidden="true" role="dialog"
        aria-label="Luna — Assistente LandingPage Store" aria-modal="false">

        <!-- Header -->
        <div class="chatbot-header">
          <div class="chatbot-header__info">
            <div class="chatbot-avatar" aria-hidden="true">
              <span>🤖</span>
              <span class="chatbot-avatar__status" title="Online"></span>
            </div>
            <div>
              <p class="chatbot-header__name">Luna</p>
              <p class="chatbot-header__status">Assistente Virtual • Online</p>
            </div>
          </div>
          <button class="chatbot-header__close" id="chatbot-close"
            aria-label="Fechar chat">✕</button>
        </div>

        <!-- Mensagens -->
        <div class="chatbot-messages" id="chatbot-messages" role="log" aria-live="polite">
        </div>

        <!-- Input -->
        <div class="chatbot-input-area">
          <div class="chatbot-suggestions" id="chatbot-suggestions">
            <button class="chatbot-chip">💳 Ver planos</button>
            <button class="chatbot-chip">🛠️ Templates</button>
            <button class="chatbot-chip">📩 Contato</button>
            <button class="chatbot-chip">❓ Como funciona</button>
          </div>
          <form class="chatbot-form" id="chatbot-form" novalidate>
            <input
              type="text"
              class="chatbot-input"
              id="chatbot-input"
              placeholder="Digite sua mensagem..."
              autocomplete="off"
              maxlength="300"
              aria-label="Mensagem para Luna"
            />
            <button type="submit" class="chatbot-send"
              aria-label="Enviar mensagem">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
    this.container = widget;
  }

  /** Registra todos os eventos */
  _bindEvents() {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const form = document.getElementById('chatbot-form');
    const suggestions = document.getElementById('chatbot-suggestions');

    // Abre/fecha chat
    toggleBtn.addEventListener('click', () => this.toggle());
    closeBtn.addEventListener('click', () => this.close());

    // Envia mensagem pelo formulário
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chatbot-input');
      const msg = input.value.trim();
      if (msg) {
        this.sendUserMessage(msg);
        input.value = '';
      }
    });

    // Chips de sugestão
    suggestions.addEventListener('click', (e) => {
      const chip = e.target.closest('.chatbot-chip');
      if (chip) {
        this.sendUserMessage(chip.textContent.replace(/[🛠️💳📩❓]/g, '').trim());
      }
    });

    // Fecha ao pressionar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  /** Envia mensagem de boas-vindas após 1.5s */
  _sendWelcomeMessage() {
    setTimeout(() => {
      this._addBotMessage('👋 Olá! Sou a **Luna**, assistente da LandingPage Store!\n\nComo posso te ajudar hoje?');
    }, 1500);
  }

  /** Abre o chat */
  open() {
    this.isOpen = true;
    const window_ = document.getElementById('chatbot-window');
    const toggle = document.getElementById('chatbot-toggle');
    const badge = document.getElementById('chatbot-badge');

    window_.classList.add('is-open');
    window_.setAttribute('aria-hidden', 'false');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    badge.style.display = 'none';

    // Foca no input
    setTimeout(() => {
      document.getElementById('chatbot-input').focus();
      this._scrollToBottom();
    }, 300);
  }

  /** Fecha o chat */
  close() {
    this.isOpen = false;
    const window_ = document.getElementById('chatbot-window');
    const toggle = document.getElementById('chatbot-toggle');

    window_.classList.remove('is-open');
    window_.setAttribute('aria-hidden', 'true');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  /** Alterna abrir/fechar */
  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  /** Adiciona mensagem do usuário ao chat */
  sendUserMessage(text) {
    this._addMessage(text, 'user');
    this._showTypingIndicator();

    // Delay realista antes de responder
    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      this._hideTypingIndicator();
      const response = findBestResponse(text);
      this._addBotMessage(response);
    }, delay);
  }

  /** Cria elemento de mensagem e adiciona ao chat */
  _addMessage(text, sender) {
    const messages = document.getElementById('chatbot-messages');

    const bubble = document.createElement('div');
    bubble.className = `chatbot-message chatbot-message--${sender}`;
    bubble.setAttribute('role', sender === 'bot' ? 'status' : 'none');

    const messageContent = document.createElement('div');
    messageContent.className = 'chatbot-message__bubble';

    if (sender === 'bot') {
      const avatar = document.createElement('span');
      avatar.className = 'chatbot-message__avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = '🤖';
      bubble.appendChild(avatar);

      appendFormattedBotText(messageContent, text);
    } else {
      messageContent.textContent = text;
    }

    bubble.appendChild(messageContent);

    messages.appendChild(bubble);
    this._scrollToBottom();

    // Animação de entrada
    requestAnimationFrame(() => bubble.classList.add('is-visible'));
  }

  /** Adiciona mensagem do bot */
  _addBotMessage(text) {
    this._addMessage(text, 'bot');
  }

  /** Mostra indicador "digitando..." */
  _showTypingIndicator() {
    const messages = document.getElementById('chatbot-messages');
    const typing = document.createElement('div');
    typing.className = 'chatbot-typing';
    typing.id = 'chatbot-typing';
    typing.setAttribute('aria-label', 'Luna está digitando');
    typing.innerHTML = `
      <span class="chatbot-message__avatar" aria-hidden="true">🤖</span>
      <div class="chatbot-typing__dots">
        <span></span><span></span><span></span>
      </div>
    `;
    messages.appendChild(typing);
    this._scrollToBottom();
  }

  /** Remove indicador de digitação */
  _hideTypingIndicator() {
    document.getElementById('chatbot-typing')?.remove();
  }

  /** Rola o chat para o final */
  _scrollToBottom() {
    const messages = document.getElementById('chatbot-messages');
    messages.scrollTop = messages.scrollHeight;
  }
}

/* ════════════════════════════════════════════════════════════
   INICIALIZAÇÃO
   ════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Pequeno delay para não competir com outros scripts
  setTimeout(() => {
    window.chatbot = new ChatbotWidget();
  }, 500);
});
