/* ============================================
   CUSTOM CURSOR
   ============================================ */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

const hasHover = window.matchMedia('(hover: hover)').matches;

if (hasHover) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  const hoverTargets = 'a, button, .project-card, .filter-btn, .contact-link, .lightbox__dot';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor--hover');
      cursorRing.classList.add('cursor-ring--hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor--hover');
      cursorRing.classList.remove('cursor-ring--hover');
    });
  });
}

/* ============================================
   NAVIGATION — scroll state
   ============================================ */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ============================================
   MOBILE MENU
   ============================================ */
const menuBtn  = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuBtn.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.classList.remove('active');
    document.body.style.overflow = '';
  });
});

/* ============================================
   SCROLL REVEAL
   ============================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

/* ============================================
   PROJECT FILTER
   ============================================ */
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
let currentFilter  = 'all';

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;

    projectCards.forEach(card => {
      const match = currentFilter === 'all' || card.dataset.category === currentFilter;

      if (match) {
        card.style.display    = 'block';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        requestAnimationFrame(() => {
          card.style.opacity   = '1';
          card.style.transform = 'translateY(0)';
        });
      } else {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(14px)';
        card.style.transition = 'opacity 0.32s ease, transform 0.32s ease';
        const snap = currentFilter;
        setTimeout(() => {
          if (currentFilter === snap) card.style.display = 'none';
        }, 340);
      }
    });
  });
});

/* ============================================
   LIGHTBOX
   ============================================ */
const lightbox        = document.getElementById('lightbox');
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxDots    = document.getElementById('lightboxDots');
const lightboxProject = document.getElementById('lightboxProject');
const lightboxCounter = document.getElementById('lightboxCounter');

let gallery    = [];
let currentIdx = 0;

function openLightbox(images, projectName, startIdx = 0) {
  gallery    = images;
  currentIdx = startIdx;
  lightboxProject.textContent = projectName;
  buildDots();
  showImage(currentIdx, false);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function buildDots() {
  lightboxDots.innerHTML = '';
  gallery.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'lightbox__dot' + (i === currentIdx ? ' active' : '');
    dot.setAttribute('role', 'button');
    dot.setAttribute('aria-label', 'Go to image ' + (i + 1));
    dot.addEventListener('click', () => showImage(i));
    lightboxDots.appendChild(dot);
  });
}

function updateDots() {
  lightboxDots.querySelectorAll('.lightbox__dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIdx);
  });
}

function showImage(idx, animate = true) {
  currentIdx = Math.max(0, Math.min(idx, gallery.length - 1));
  lightboxCounter.textContent = (currentIdx + 1) + ' / ' + gallery.length;
  lightboxPrev.disabled = currentIdx === 0;
  lightboxNext.disabled = currentIdx === gallery.length - 1;
  updateDots();

  if (animate) {
    lightboxImg.classList.add('switching');
    setTimeout(() => {
      lightboxImg.src = gallery[currentIdx];
      lightboxImg.alt = lightboxProject.textContent + ' — image ' + (currentIdx + 1);
      lightboxImg.classList.remove('switching');
    }, 200);
  } else {
    lightboxImg.src = gallery[currentIdx];
    lightboxImg.alt = lightboxProject.textContent + ' — image ' + (currentIdx + 1);
  }
}

/* Nav controls */
lightboxClose.addEventListener('click', closeLightbox);
lightboxOverlay.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => showImage(currentIdx - 1));
lightboxNext.addEventListener('click', () => showImage(currentIdx + 1));

/* Keyboard */
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     { closeLightbox(); return; }
  if (e.key === 'ArrowLeft')  showImage(currentIdx - 1);
  if (e.key === 'ArrowRight') showImage(currentIdx + 1);
});

/* Touch swipe */
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 48) {
    dx < 0 ? showImage(currentIdx + 1) : showImage(currentIdx - 1);
  }
}, { passive: true });

/* Open from project card click */
document.querySelectorAll('.project-card').forEach(card => {
  const open = () => {
    const images = JSON.parse(card.dataset.gallery || '[]');
    const name   = card.dataset.project || '';
    if (images.length) openLightbox(images, name);
  };
  card.addEventListener('click', open);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
});

/* ============================================
   SMOOTH SCROLL
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================
   FOOTER YEAR
   ============================================ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================
   MARQUEE — pause on hover
   ============================================ */
const marqueeTrack = document.querySelector('.marquee__track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marqueeTrack.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}
