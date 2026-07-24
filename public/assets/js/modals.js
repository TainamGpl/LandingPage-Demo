/**
 * Modal logic for the public portfolio demo.
 * Authentication is intentionally simulated and no credentials are transmitted.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

export function initModals() {
  const loginModal = document.getElementById('login-modal');

  if (!loginModal) return;

  const loginBtn = document.getElementById('nav-login-btn');
  const closeLoginBtn = loginModal.querySelector('.modal-close');
  const modalBox = loginModal.querySelector('.modal-box');
  const authForm = document.getElementById('auth-form');
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const nameGroup = document.getElementById('group-name');
  const nameInput = document.getElementById('auth-name');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authMessage = document.getElementById('auth-message');
  const backgroundRoots = Array.from(document.body.children).filter((child) => child !== loginModal);

  let isLogin = true;
  let lastFocusedElement = null;

  const getFocusableElements = () =>
    Array.from(loginModal.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (element) => !element.classList.contains('is-hidden') && element.offsetParent !== null
    );

  const toggleBackgroundInteractivity = (isDisabled) => {
    backgroundRoots.forEach((element) => {
      if ('inert' in element) {
        element.inert = isDisabled;
      }

      if (isDisabled) {
        element.setAttribute('aria-hidden', 'true');
      } else {
        element.removeAttribute('aria-hidden');
      }
    });
  };

  const setAuthMode = (loginMode) => {
    isLogin = loginMode;
    loginTab.classList.toggle('active', loginMode);
    registerTab.classList.toggle('active', !loginMode);
    nameGroup.classList.toggle('is-hidden', loginMode);
    nameInput.required = !loginMode;
    authSubmitBtn.textContent = loginMode ? 'Entrar' : 'Criar Conta';
    authMessage.className = 'form-message';
    authMessage.textContent = '';
    authForm.reset();
  };

  const openLoginModal = () => {
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    loginModal.classList.add('is-open');
    loginModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    toggleBackgroundInteractivity(true);

    const [firstFocusable] = getFocusableElements();
    (firstFocusable || modalBox)?.focus();
  };

  const closeLoginModal = () => {
    loginModal.classList.remove('is-open');
    loginModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    toggleBackgroundInteractivity(false);
    (lastFocusedElement || loginBtn)?.focus();
  };

  if (loginBtn) {
    loginBtn.addEventListener('click', openLoginModal);
  }

  closeLoginBtn.addEventListener('click', closeLoginModal);

  loginModal.addEventListener('click', (event) => {
    if (event.target === loginModal) {
      closeLoginModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && loginModal.classList.contains('is-open')) {
      closeLoginModal();
    }

    if (event.key === 'Tab' && loginModal.classList.contains('is-open')) {
      const focusableElements = getFocusableElements();
      if (!focusableElements.length) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  });

  loginTab.addEventListener('click', () => setAuthMode(true));
  registerTab.addEventListener('click', () => setAuthMode(false));

  authForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameInput.value;
    const email = document.getElementById('auth-email').value;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      authMessage.textContent = 'Por favor, insira um email valido.';
      authMessage.className = 'form-message error';
      return;
    }

    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = 'Simulando...';

    setTimeout(() => {
      const demoUser = {
        name: name || email.split('@')[0],
        email,
      };
      localStorage.setItem('lp_user', JSON.stringify(demoUser));
      authMessage.textContent = isLogin
        ? 'Acesso de demonstração realizado. Nenhum dado foi enviado.'
        : 'Conta de demonstração criada somente neste navegador.';
      authMessage.className = 'form-message success';

      updateUserUI();

      setTimeout(() => {
        closeLoginModal();
        setAuthMode(isLogin);
        authSubmitBtn.disabled = false;
      }, 1500);
    }, 500);
  });

  document.querySelectorAll('.pricing-card a.btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();

      const card = btn.closest('.pricing-card');
      const planName = card.querySelector('.pricing-card__plan').textContent.trim();
      const planAmount = card.querySelector('.pricing-card__amount').textContent.trim();

      localStorage.setItem('lp_selected_plan_name', planName);
      localStorage.setItem('lp_selected_plan_price', planAmount);

      window.location.href = 'pages/checkout.html';
    });
  });

  setAuthMode(true);
  updateUserUI();
  closeLoginModal();
}

function updateUserUI() {
  const userStr = localStorage.getItem('lp_user');
  const ctaContainerDesktop = document.querySelector('.navbar__cta');
  const ctaContainerMobile = document.querySelector('.mobile-nav__cta');

  if (userStr && ctaContainerDesktop) {
    try {
      const user = JSON.parse(userStr);
      const initial = user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?');

      const createLogoutButton = () => {
        const button = document.createElement('button');
        const avatar = document.createElement('div');
        const label = document.createElement('span');

        button.type = 'button';
        button.className = 'user-profile-btn';
        button.title = 'Sair da conta';

        avatar.className = 'avatar';
        avatar.textContent = initial;
        label.textContent = 'Sair';

        button.append(avatar, label);
        button.addEventListener('click', () => {
          localStorage.removeItem('lp_user');
          window.location.reload();
        });

        return button;
      };

      ctaContainerDesktop.replaceChildren(createLogoutButton());
      if (ctaContainerMobile) {
        ctaContainerMobile.replaceChildren(createLogoutButton());
      }
    } catch (error) {
      console.error('Erro ao processar dados do usuario:', error);
      localStorage.removeItem('lp_user');
    }
  }
}
