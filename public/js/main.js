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
if (counterBar) {
  const style = document.createElement('style');
  style.textContent = `.section-counter__bar::after { transform: scaleX(var(--p, 0)); }`;
  document.head.appendChild(style);
}

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

  const WA_ABRAAO = '5512996065673';
  const history = []; // [{role, content}]
  let isStreaming = false;

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
    const bubbleEl = document.createElement('span');
    bubbleEl.className = 'chat-msg__bubble';
    bubbleEl.innerHTML = text;
    msg.appendChild(bubbleEl);
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return bubbleEl;
  }

  function addTypingIndicator() {
    const msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg--bot chat-msg--typing';
    msg.innerHTML = '<span class="chat-msg__bubble"><span class="chat-typing"><span></span><span></span><span></span></span></span>';
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return msg;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isStreaming) return;

    addMessage(text, 'user');
    history.push({ role: 'user', content: text });
    input.value = '';
    isStreaming = true;
    sendBtn.disabled = true;
    input.disabled = true;

    const typingEl = addTypingIndicator();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
      });

      typingEl.remove();

      if (!res.ok) {
        addMessage('Erro ao conectar. Tente falar pelo WhatsApp: <a href="https://wa.me/' + WA_ABRAAO + '" target="_blank" rel="noopener">clique aqui</a>.', 'bot');
        return;
      }

      const botBubble = addMessage('', 'bot');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        botBubble.innerHTML = fullText.replace(/\n/g, '<br>');
        messages.scrollTop = messages.scrollHeight;
      }

      history.push({ role: 'assistant', content: fullText });

      // keep history bounded to last 10 exchanges
      if (history.length > 20) history.splice(0, 2);

    } catch {
      typingEl.remove();
      addMessage('Sem conexão com o servidor. Fale pelo <a href="https://wa.me/' + WA_ABRAAO + '" target="_blank" rel="noopener">WhatsApp</a>.', 'bot');
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  bubble.addEventListener('click', toggleChat);
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) sendMessage(); });

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
