/* ===== IMAGE FALLBACKS ===== */
(function initImgFallbacks() {
  ['navLogoImg', 'footerLogoImg'].forEach(id => {
    const img = document.getElementById(id);
    if (!img) return;
    const fallback = img.nextElementSibling;
    img.addEventListener('load', () => {
      img.classList.add('loaded');
      if (fallback) fallback.style.display = 'none';
    });
    img.addEventListener('error', () => {
      img.classList.add('img-error');
      if (fallback) fallback.style.display = 'block';
    });
    if (fallback) fallback.style.display = 'block';
  });
  document.querySelectorAll('.carousel__img').forEach(img => {
    img.addEventListener('error', () => {
      img.classList.add('img-error');
    });
  });
})();

/* ===== CAROUSEL DRAG ===== */
(function initCarousel() {
  const carousel = document.getElementById('carousel');
  if (!carousel) return;

  const cards = Array.from(carousel.querySelectorAll('.carousel__card'));
  const totalCards = cards.length;

  // Build progress dots
  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'carousel-dots';
  const dots = cards.map((_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Serviço ${i + 1}`);
    d.addEventListener('click', () => {
      const target = cards[i];
      carousel.scrollTo({ left: target.offsetLeft - parseInt(getComputedStyle(carousel).paddingLeft), behavior: 'smooth' });
    });
    dotsWrap.appendChild(d);
    return d;
  });
  carousel.parentElement.appendChild(dotsWrap);

  // Update active dot based on scroll
  let dotRaf;
  carousel.addEventListener('scroll', () => {
    cancelAnimationFrame(dotRaf);
    dotRaf = requestAnimationFrame(() => {
      const padLeft = parseInt(getComputedStyle(carousel).paddingLeft);
      let closest = 0;
      let minDist = Infinity;
      cards.forEach((c, i) => {
        const dist = Math.abs(c.offsetLeft - padLeft - carousel.scrollLeft);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === closest));
    });
  }, { passive: true });

  // Drag state
  let isDragging = false;
  let startX = 0;
  let startScroll = 0;
  let velX = 0;
  let lastX = 0;
  let rafId;

  function onStart(x) {
    isDragging = true;
    startX = x;
    startScroll = carousel.scrollLeft;
    lastX = x;
    velX = 0;
    carousel.classList.add('is-dragging');
    cancelAnimationFrame(rafId);
  }
  function onMove(x) {
    if (!isDragging) return;
    velX = x - lastX;
    lastX = x;
    carousel.scrollLeft = startScroll - (x - startX);
  }
  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove('is-dragging');
    // momentum flick
    let momentum = velX * 8;
    function glide() {
      if (Math.abs(momentum) < 0.5) return;
      carousel.scrollLeft -= momentum;
      momentum *= 0.88;
      rafId = requestAnimationFrame(glide);
    }
    glide();
  }

  // Mouse
  carousel.addEventListener('mousedown', e => { e.preventDefault(); onStart(e.pageX); });
  window.addEventListener('mousemove', e => { if (isDragging) onMove(e.pageX); });
  window.addEventListener('mouseup', onEnd);

  // Touch
  carousel.addEventListener('touchstart', e => { onStart(e.touches[0].clientX); }, { passive: true });
  carousel.addEventListener('touchmove', e => { onMove(e.touches[0].clientX); }, { passive: true });
  carousel.addEventListener('touchend', onEnd);

  // Prevent click after drag
  carousel.addEventListener('click', e => {
    if (Math.abs(carousel.scrollLeft - startScroll) > 4) e.preventDefault();
  });
})();

/* ===== NAV SCROLL ===== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ===== MOBILE MENU ===== */
const toggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  toggle.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ===== SECTIONS & SIDE NAV ===== */
const sections = Array.from(document.querySelectorAll('section[id]'));
const sideNavContainer = document.querySelector('.side-nav');
const counterCurrent = document.querySelector('.section-counter__current');
const counterTotal = document.querySelector('.section-counter__total');
const counterBar = document.querySelector('.section-counter__bar');

// Build side nav dots
const sectionLabels = {
  hero: 'Início',
  diagnostico: 'Sistemas',
  proposta: 'Proposta',
  entrega: 'Entrega',
  assistencia: 'Assistência',
  cases: 'Cases',
  tecnoapp: 'TecnoApp',
  processo: 'Processo',
  manifesto: 'Manifesto',
  contato: 'Contato',
};

const dots = [];
sections.forEach((sec, i) => {
  const dot = document.createElement('button');
  dot.className = 'side-nav__dot';
  dot.setAttribute('data-label', sectionLabels[sec.id] || sec.id);
  dot.setAttribute('aria-label', `Ir para ${sectionLabels[sec.id] || sec.id}`);
  dot.addEventListener('click', () => smoothScrollTo(sec));
  sideNavContainer.appendChild(dot);
  dots.push(dot);
});

if (counterTotal) counterTotal.textContent = String(sections.length).padStart(2, '0');

/* ===== SMOOTH SCROLL ===== */
function smoothScrollTo(target) {
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
  const top = target.getBoundingClientRect().top + window.scrollY - navH;
  window.scrollTo({ top, behavior: 'smooth' });
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); smoothScrollTo(target); }
  });
});

/* ===== INTERSECTION — active section ===== */
let activeSectionIndex = 0;

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const idx = sections.indexOf(entry.target);
    if (idx === -1) return;
    activeSectionIndex = idx;

    // dots
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));

    // counter
    if (counterCurrent) counterCurrent.textContent = String(idx + 1).padStart(2, '0');
    if (counterBar) {
      const progress = (idx + 1) / sections.length;
      counterBar.style.setProperty('--progress', progress);
      counterBar.querySelector
        ? null
        : null;
      counterBar.style.cssText += `--p:${progress}`;
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ===== REVEAL ON SCROLL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    // stagger siblings of same parent
    const siblings = Array.from(el.parentElement.querySelectorAll('.reveal, .reveal-clip'));
    const idx = siblings.indexOf(el);
    setTimeout(() => el.classList.add('visible'), idx * 110);
    revealObserver.unobserve(el);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-clip').forEach(el => revealObserver.observe(el));

/* ===== SCROLL LOCK (Lando Norris style) =====
   Briefly locks scroll on key sections so the animation plays fully */
const lockSections = document.querySelectorAll('[data-lock]');
let isLocked = false;
let lockTimeout = null;

function lockScroll(duration) {
  if (isLocked) return;
  isLocked = true;
  document.body.style.overflow = 'hidden';
  clearTimeout(lockTimeout);
  lockTimeout = setTimeout(() => {
    document.body.style.overflow = '';
    isLocked = false;
  }, duration);
}

const lockObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
      lockScroll(900);
    }
  });
}, { threshold: 0.6 });

lockSections.forEach(s => lockObserver.observe(s));

/* ===== NAV ACTIVE LINK ===== */
const navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');
const linkObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navAnchors.forEach(a => {
      const match = a.getAttribute('href') === `#${id}`;
      a.style.color = match ? 'var(--white)' : '';
    });
  });
}, { threshold: 0.5 });
sections.forEach(s => linkObserver.observe(s));

/* ===== COUNTER BAR PROGRESS ===== */
// The ::after rule is in style.css; only the CSS custom property is updated here

// update bar via scroll
window.addEventListener('scroll', () => {
  if (!counterBar) return;
  const progress = (activeSectionIndex + 1) / sections.length;
  counterBar.style.setProperty('--p', progress);
}, { passive: true });

/* ===== TECNOAPP TERMINAL ANIMATION ===== */
(function initTecnoAppAnim() {
  const win = document.querySelector('.tecnoapp__window');
  if (!win) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        win.classList.add('ta-animate');
        obs.unobserve(win);
      }
    });
  }, { threshold: 0.4 });
  obs.observe(win);
})();

/* ===== CURSOR GLOW ===== */
(function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;
  let gx = -999, gy = -999, rafPending = false;
  document.addEventListener('mousemove', e => {
    gx = e.clientX;
    gy = e.clientY;
    document.body.classList.add('has-cursor');
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        glow.style.transform = `translate(${gx - 350}px, ${gy - 350}px)`;
        rafPending = false;
      });
    }
  }, { passive: true });
  document.addEventListener('mouseleave', () => document.body.classList.remove('has-cursor'));
})();

/* ===== BACK TO TOP ===== */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > window.innerHeight * 0.6);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ===== CHAT WIDGET ===== */
(function initChat() {
  const widget   = document.getElementById('chatWidget');
  const bubble   = document.getElementById('chatBubble');
  const panel    = document.getElementById('chatPanel');
  const messages = document.getElementById('chatMessages');
  const input    = document.getElementById('chatInput');
  const sendBtn  = document.getElementById('chatSend');
  const chips    = document.getElementById('chatChips');

  if (!widget) return;

  const WA_NUMBER = '5512991037897';

  function toggleChat() {
    widget.classList.toggle('chat-widget--open');
    if (widget.classList.contains('chat-widget--open')) {
      setTimeout(() => input.focus(), 350);
    }
  }

  function addMessage(text, type) {
    const chips_el = document.getElementById('chatChips');
    if (chips_el) chips_el.remove();

    const msg = document.createElement('div');
    msg.className = `chat-msg chat-msg--${type}`;
    const bubble_el = document.createElement('span');
    bubble_el.className = 'chat-msg__bubble';
    bubble_el.textContent = text;
    msg.appendChild(bubble_el);
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function sendMessage() {
    const raw = input.value.trim();
    if (!raw) return;

    const text = raw.slice(0, 300);
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';

    setTimeout(() => {
      addMessage('Certo! Vou te direcionar para o WhatsApp agora. 😊', 'bot');
      setTimeout(() => {
        const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }, 800);
    }, 500);
  }

  bubble.addEventListener('click', toggleChat);
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  document.querySelectorAll('.chat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.msg;
      input.focus();
      if (chips) chips.style.display = 'none';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && widget.classList.contains('chat-widget--open')) {
      widget.classList.remove('chat-widget--open');
    }
  });
})();
