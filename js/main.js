/* ============================================
   AGUAJATO – main.js
   Carrega partials header/footer e controla
   comportamentos comuns de todas as páginas.
   ============================================ */

/* ── Aguarda o DOM ── */
document.addEventListener('DOMContentLoaded', () => {
  loadPartials().then(() => {
    initIcons();
    highlightActiveNav();
    initMobileMenu();
    initScrollTop();
    initScrollHeader();
    initServiceCarousel();
  });
});

/* ── Carrega header e footer via fetch ── */
async function loadPartials() {
  const partials = [
    { id: 'header-placeholder', file: '../partials/header.html' },
    { id: 'footer-placeholder', file: '../partials/footer.html' },
  ];

  // Detecta se estamos na raiz ou em subpasta
  const inSubdir = window.location.pathname.includes('/admin/') ||
    window.location.pathname.includes('/laudos/');
  const prefix = inSubdir ? '../' : '';

  await Promise.all(partials.map(async ({ id, file }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const path = inSubdir ? file : file.replace('../', '');
    try {
      const res = await fetch(path);
      let html = await res.text();
      // Corrige caminhos de imagem e links para funcionar em subpastas
      if (inSubdir) {
        html = html.replace(/src="img\//g, 'src="../img/');
        html = html.replace(/href="(?!http|#|mailto|tel|\.\.)([\w\-]+\.html)/g, 'href="../$1');
      }
      el.innerHTML = html;
    } catch (e) {
      // Fallback silencioso – não quebra a página
    }
  }));
}

/* ── Inicializa ícones Lucide ── */
function initIcons() {
  if (window.lucide) lucide.createIcons();
}

/* ── Marca link ativo no nav ── */
function highlightActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav-page]').forEach(link => {
    const target = link.dataset.navPage;
    if (page === target || (page === '' && target === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── Menu Mobile ── */
function initMobileMenu() {
  const overlay = document.getElementById('mobile-menu');
  const burger = document.getElementById('burger-btn');
  const close = document.getElementById('mobile-close');

  if (!overlay || !burger) return;

  burger.addEventListener('click', () => overlay.classList.add('is-open'));
  if (close) close.addEventListener('click', () => overlay.classList.remove('is-open'));
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('is-open');
  });

  // Fecha ao navegar
  overlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => overlay.classList.remove('is-open'));
  });
}

/* ── Scroll to Top ── */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Header Scroll Effect (glassmorphism sempre visível) ── */
function initScrollHeader() {
  const header = document.querySelector('.site-header');
  const topbar = document.querySelector('.topbar');
  if (!header) return;

  const THRESHOLD = 60;

  function onScroll() {
    const y = window.scrollY;
    if (y > THRESHOLD) {
      header.classList.add('scrolled');
      if (topbar) topbar.classList.add('scrolled-away');
    } else {
      header.classList.remove('scrolled');
      if (topbar) topbar.classList.remove('scrolled-away');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Global toggleMenu (compat.) ── */
window.toggleMenu = function () {
  const overlay = document.getElementById('mobile-menu');
  if (overlay) overlay.classList.toggle('is-open');
};

/* ── Carrossel de Serviços / Hero ── */
function initServiceCarousel() {
  const containers = document.querySelectorAll('.service-carousel-container');

  containers.forEach(container => {
    const slidesTrack = container.querySelector('.service-carousel-slides');
    const prevBtn = container.querySelector('.service-carousel-prev');
    const nextBtn = container.querySelector('.service-carousel-next');
    if (!slidesTrack || !prevBtn || !nextBtn) return;

    const totalSlides = slidesTrack.children.length - 1;
    let currentIndex = 0;
    let autoSlideInterval;
    let isTransitioning = false;

    const updateCarousel = (instant = false) => {
      if (instant) {
        slidesTrack.style.transition = 'none';
      } else {
        slidesTrack.style.transition = 'transform 0.8s ease-in-out';
      }
      slidesTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
      if (instant) slidesTrack.offsetHeight; // force reflow
    };

    const nextSlide = () => {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex++;
      updateCarousel();

      if (currentIndex === totalSlides) {
        setTimeout(() => {
          currentIndex = 0;
          updateCarousel(true);
          isTransitioning = false;
        }, 800);
      } else {
        setTimeout(() => isTransitioning = false, 800);
      }
    };

    const prevSlide = () => {
      if (isTransitioning) return;
      isTransitioning = true;

      if (currentIndex === 0) {
        currentIndex = totalSlides;
        updateCarousel(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            currentIndex = totalSlides - 1;
            updateCarousel();
            setTimeout(() => isTransitioning = false, 800);
          });
        });
      } else {
        currentIndex--;
        updateCarousel();
        setTimeout(() => isTransitioning = false, 800);
      }
    };

    const startAutoSlide = () => {
      autoSlideInterval = setInterval(nextSlide, 4000);
    };

    const stopAutoSlide = () => {
      clearInterval(autoSlideInterval);
    };

    container.addEventListener('mouseenter', stopAutoSlide);
    container.addEventListener('mouseleave', startAutoSlide);
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    startAutoSlide();
  });
}

