/**
 * Main entry point for the public site.
 */

import { initScrollReveal, initCounters, initTypewriter } from './animations.js';
import { initModals } from './modals.js';

function setAriaHidden(element, isHidden) {
  if (element) {
    element.setAttribute('aria-hidden', String(isHidden));
  }
}

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.navbar__toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const overlay = document.querySelector('.mobile-nav__overlay');

  if (!navbar) return;

  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (toggle && mobileNav && overlay) {
    const openMobileNav = () => {
      mobileNav.classList.add('is-open');
      overlay.classList.add('is-open');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      setAriaHidden(mobileNav, false);
      setAriaHidden(overlay, false);
      document.body.style.overflow = 'hidden';
    };

    const closeMobileNav = () => {
      mobileNav.classList.remove('is-open');
      overlay.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      setAriaHidden(mobileNav, true);
      setAriaHidden(overlay, true);
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('is-open');
      isOpen ? closeMobileNav() : openMobileNav();
    });

    overlay.addEventListener('click', closeMobileNav);

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        closeMobileNav();
        toggle.focus();
      }
    });

    closeMobileNav();
  }
}

function initActiveLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link[href^="#"], .mobile-nav__link[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 72;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    });
  });
}

function initPricingInteraction() {
  document.querySelectorAll('.pricing-card').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const feedback = document.getElementById('contact-form-message');
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    const formData = new FormData(form);
    const name = String(formData.get('nome') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const subject = String(formData.get('assunto') || 'Contato pelo site').trim() || 'Contato pelo site';
    const message = String(formData.get('mensagem') || '').trim();

    if (!name || !email || !message) {
      if (feedback) {
        feedback.textContent = 'Preencha nome, e-mail e mensagem antes de enviar.';
        feedback.className = 'form-message error';
      }
      return;
    }

    btn.textContent = 'Simulando...';
    btn.disabled = true;

    if (feedback) {
      feedback.textContent = 'Simulação concluída. Os dados não foram enviados nem armazenados em servidor.';
      feedback.className = 'form-message success';
    }

    form.reset();
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 1200);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initActiveLinks();
  initSmoothScroll();
  initScrollReveal();
  initCounters();
  initPricingInteraction();
  initModals();

  initTypewriter('hero-typewriter', [
    'que Convertem de Verdade',
    'Prontas para Lancar',
    'Otimizadas para SEO',
    'Mobile First',
  ]);

  initContactForm();
});
