'use strict';

// CONTATO: altere este endereço se o e-mail da Markora mudar.
const CONTACT_EMAIL = 'Markoramarketingsocial@gmail.com';

// Inicialização progressiva: o conteúdo continua legível sem JavaScript.
document.documentElement.classList.add('js');
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu-principal');
const backTop = document.querySelector('.back-top');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Logos: a tipografia de fallback aparece até a imagem oficial estar disponível.
document.querySelectorAll('[data-brand]').forEach((brand) => {
  const img = brand.querySelector('img');
  const update = () => {
    const loaded = img.complete && img.naturalWidth > 0;
    brand.classList.toggle('loaded', loaded);
    img.hidden = !loaded;
  };
  img.addEventListener('load', update);
  img.addEventListener('error', update);
  update();
});

// Menu móvel acessível: Escape, links, clique externo e mudança de largura.
function closeMenu(restoreFocus = false) {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menu.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
menu.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  const mobileOpen = menu.classList.contains('open');
  closeMenu();
  if (mobileOpen) {
    const target = document.querySelector(link.getAttribute('href'));
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.classList.contains('open')) closeMenu(true);
});
document.addEventListener('click', (event) => {
  if (!header.contains(event.target)) closeMenu();
});
header.addEventListener('focusout', (event) => {
  if (event.relatedTarget && !header.contains(event.relatedTarget)) closeMenu();
});
window.matchMedia('(min-width: 1120px)').addEventListener('change', () => closeMenu());

// Estado do cabeçalho e botão de retorno ao topo.
function updateScrollState() {
  header.classList.toggle('scrolled', window.scrollY > 16);
  backTop.hidden = window.scrollY < 650;
}
window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

// Navegação ativa: cada grupo inclui as seções complementares até a próxima âncora.
const navLinks = [...menu.querySelectorAll('a:not(.nav-cta)')];
const sections = [...document.querySelectorAll('main > section')];
function markActive(id) {
  navLinks.forEach((link) => {
    const active = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
markActive('inicio');
if ('IntersectionObserver' in window) {
  let group = 'inicio';
  const sectionGroups = new Map();
  sections.forEach((section) => {
    if (navLinks.some((link) => link.hash === `#${section.id}`)) group = section.id;
    sectionGroups.set(section, group);
  });
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) markActive(sectionGroups.get(entry.target));
    });
  }, { rootMargin: '-18% 0px -65% 0px', threshold: 0 });
  sections.forEach((section) => activeObserver.observe(section));

  // Animações de entrada são aplicadas apenas quando há suporte.
  if (!reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-pending');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach((element) => {
      element.classList.add('reveal-pending');
      revealObserver.observe(element);
    });
    reducedMotion.addEventListener('change', (event) => {
      if (event.matches) {
        document.querySelectorAll('.reveal-pending').forEach((el) => el.classList.remove('reveal-pending'));
        revealObserver.disconnect();
      }
    });
  }
}
navLinks.forEach((link) => link.addEventListener('click', () => markActive(link.hash.slice(1))));

// Formulário de contato: prepara um e-mail no aplicativo do visitante.
const form = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');
const fields = ['nome', 'email', 'organizacao', 'mensagem'];
function validateField(id) {
  const field = form.elements.namedItem(id);
  const value = field.value.trim();
  let error = '';
  if (!value) error = 'Preencha este campo.';
  else if (id === 'nome' && value.length < 2) error = 'Informe um nome com pelo menos 2 caracteres.';
  else if (id === 'email' && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || field.validity.typeMismatch)) error = 'Informe um e-mail válido, como nome@exemplo.com.';
  else if (id === 'organizacao' && !['Empresas', 'ONGs', 'Instituições de ensino', 'Órgãos públicos', 'Neoempreendedores'].includes(value)) error = 'Selecione um tipo de organização.';
  else if (id === 'mensagem' && value.length < 10) error = 'Descreva seu projeto com pelo menos 10 caracteres.';
  if (field.maxLength > 0 && value.length > field.maxLength) error = `Use no máximo ${field.maxLength} caracteres.`;
  document.querySelector(`#erro-${id}`).textContent = error;
  field.setAttribute('aria-invalid', String(Boolean(error)));
  return !error;
}
fields.forEach((id) => {
  const field = form.elements.namedItem(id);
  field.addEventListener('blur', () => { if (field.value || field.hasAttribute('aria-invalid')) validateField(id); });
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validateField(id);
    formStatus.textContent = '';
  });
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const valid = fields.map(validateField).every(Boolean);
  if (!valid) {
    formStatus.textContent = 'Revise os campos indicados antes de continuar.';
    form.querySelector('[aria-invalid="true"]').focus();
    return;
  }
  const data = new FormData(form);
  const message = [
    'Olá, Markora! Gostaria de conversar sobre meu projeto.',
    '',
    `Nome: ${data.get('nome').trim()}`,
    `E-mail: ${data.get('email').trim()}`,
    `Tipo de organização: ${data.get('organizacao')}`,
    '',
    `Mensagem: ${data.get('mensagem').trim()}`
  ].join('\n');
  // mailto não envia automaticamente e depende de um aplicativo de e-mail configurado.
  formStatus.textContent = 'Seu aplicativo de e-mail será aberto. Revise a mensagem e confirme o envio. Se não abrir, escreva para ' + CONTACT_EMAIL + '.';
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Contato pelo site — ' + data.get('organizacao'))}&body=${encodeURIComponent(message)}`;
});
