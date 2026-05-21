/* ── Nav toggle ─────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const nav       = document.getElementById('nav');

navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

Array.from(nav.querySelectorAll('a')).forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ── Active nav section tracking ────────────────────── */
function initActiveNav() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = Array.from(nav.querySelectorAll('a:not(.btn--header-cta)'));

  const setActive = id => {
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
}

/* ── Contact form ────────────────────────────────────── */
const form = document.querySelector('.contact__form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Отправлено!';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Отправить заявку';
      btn.disabled = false;
      form.reset();
    }, 1800);
  });
}

/* ── Scroll-reveal ───────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

/* ── Lightbox ────────────────────────────────────────── */
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxCap  = document.getElementById('lightboxCaption');
const lightboxDots = document.getElementById('lightboxDots');
const lbClose      = document.getElementById('lightboxClose');
const lbPrev       = document.getElementById('lightboxPrev');
const lbNext       = document.getElementById('lightboxNext');

let lbImages  = [];
let lbIndex   = 0;
let lbCaption = '';

function openLightbox(images, startIndex, caption) {
  lbImages  = images;
  lbIndex   = startIndex;
  lbCaption = caption || '';
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  renderSlide();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

function renderSlide() {
  lightboxImg.src = lbImages[lbIndex];
  lightboxImg.alt = lbCaption;
  lightboxCap.textContent = lbCaption;

  const multi = lbImages.length > 1;
  lbPrev.style.display = multi ? '' : 'none';
  lbNext.style.display = multi ? '' : 'none';

  lightboxDots.innerHTML = lbImages.map((_, i) =>
    `<button class="lightbox__dot${i === lbIndex ? ' active' : ''}" aria-label="Фото ${i + 1}"></button>`
  ).join('');

  lightboxDots.querySelectorAll('.lightbox__dot').forEach((dot, i) => {
    dot.addEventListener('click', () => { lbIndex = i; renderSlide(); });
  });
}

const lbStep = delta => {
  lbIndex = (lbIndex + delta + lbImages.length) % lbImages.length;
  renderSlide();
};

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
lbPrev.addEventListener('click', () => lbStep(-1));
lbNext.addEventListener('click', () => lbStep(+1));

document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  lbStep(-1);
  if (e.key === 'ArrowRight') lbStep(+1);
});

/* ── Drag-scroll ─────────────────────────────────────── */
function initDragScroll(el) {
  let startX, startScroll, dragging = false, moved = false;

  el.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    e.preventDefault();           // не даём браузеру тащить изображения / выделять текст
    dragging    = true;
    moved       = false;
    startX      = e.clientX;
    startScroll = el.scrollLeft;
    el.classList.add('is-dragging');
  });

  const onMove = e => {
    if (!dragging) return;
    const delta = startX - e.clientX;
    if (Math.abs(delta) > 3) moved = true;
    el.scrollLeft = startScroll + delta;
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('is-dragging');
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);

  /* Блокируем клик после перетаскивания */
  el.addEventListener('click', e => {
    if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
  }, true);
}

/* ── Helpers ─────────────────────────────────────────── */
function renderList(containerId, items, renderItem) {
  const el = document.getElementById(containerId);
  if (!el || !Array.isArray(items)) return;
  el.innerHTML = items.map(renderItem).join('');
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && typeof value !== 'undefined') el.textContent = value;
}

function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el && value) el[attr] = value;
}

function setLink(id, href, text) {
  const el = document.getElementById(id);
  if (!el) return;
  if (href) el.href = href;
  if (typeof text !== 'undefined') el.textContent = text;
}

/* ── Content loader ──────────────────────────────────── */
async function loadPageContent() {
  try {
    const resp = await fetch('content/page.yml');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = jsyaml.load(await resp.text());
    if (!data) return;

    /* Hero */
    setText('heroEyebrow', data.hero_eyebrow);
    if (data.hero_title) {
      const el = document.getElementById('heroTitle');
      if (el) el.innerHTML = data.hero_title.replace(
        /(аудио-\s*и\s*видеорешений)/i,
        '<span class="accent">$1</span>'
      );
    }
    setText('heroDescription', data.hero_description);
    setText('heroPrimaryCta',   data.hero_primary_cta);
    setText('heroSecondaryCta', data.hero_secondary_cta);
    setText('statsLabel', data.hero_stats_label);
    setText('statsValue', data.hero_stats_value);
    setAttr('heroImage', 'src', data.hero_image);

    /* Services */
    renderList('servicesGrid', data.services, s => `
      <article class="card">
        <img src="${s.image || 'images/hero-cover.jpg'}" alt="${s.title || ''}"
             class="card__image" width="400" height="200" loading="lazy" />
        <h3>${s.title || ''}</h3>
        <p>${s.description || ''}</p>
      </article>`);

    /* Process */
    renderList('processTimeline', data.process, s => `
      <div class="timeline__item">
        <span aria-hidden="true">${s.step || ''}</span>
        <div>
          <h3>${s.title || ''}</h3>
          <p>${s.description || ''}</p>
        </div>
      </div>`);

    /* Advantages */
    renderList('advantagesGrid', data.advantages, item => `
      <article class="feature">
        <h3>${item.title || ''}</h3>
        <p>${item.description || ''}</p>
      </article>`);

    /* Expertise / Diplomas — все дипломы открываются вместе в лайтбоксе */
    setText('expertiseIntro', data.expertise_intro);

    const diplomas     = data.expertise_diplomas || [];
    const diplomaImgs  = diplomas.map(d => d.image);
    const diplomaStrip = document.getElementById('diplomasStrip');

    if (diplomaStrip && diplomas.length) {
      diplomaStrip.innerHTML = diplomas.map((d, i) => `
        <div class="diploma__item" role="button" tabindex="0" data-diploma-index="${i}">
          <img src="${d.image || ''}" alt="${d.title || ''}" loading="lazy" />
          <span>${d.title || ''}</span>
        </div>`).join('');

      diplomaStrip.querySelectorAll('[data-diploma-index]').forEach(el => {
        el.addEventListener('click', () => {
          openLightbox(diplomaImgs, parseInt(el.dataset.diplomaIndex, 10), '');
        });
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(diplomaImgs, parseInt(el.dataset.diplomaIndex, 10), '');
          }
        });
      });

      initDragScroll(diplomaStrip);
    }

    /* Clients */
    setText('clientsTitle', data.clients_title);
    renderList('clientsLogos', data.clients_logos, c => `
      <div class="client__logo" title="${c.name || ''}">
        <img src="${c.image || ''}" alt="${c.name || ''}" loading="lazy" />
      </div>`);

    /* Gallery with lightbox */
    renderList('galleryGrid', data.gallery, item => {
      const images  = item.images || [item.image];
      const encoded = encodeURIComponent(JSON.stringify(images));
      return `
        <article class="gallery__item" role="button" tabindex="0"
                 data-lb-images="${encoded}" data-lb-caption="${item.title || ''}">
          <img src="${item.image || 'images/hero-cover.jpg'}" alt="${item.title || ''}"
               width="400" height="220" loading="lazy" />
          <h3>${item.title || ''}</h3>
        </article>`;
    });

    /* Bind gallery lightbox */
    document.querySelectorAll('[data-lb-images]').forEach(el => {
      const activate = () => {
        const images  = JSON.parse(decodeURIComponent(el.dataset.lbImages));
        const caption = el.dataset.lbCaption || '';
        openLightbox(images, 0, caption);
      };
      el.addEventListener('click', activate);
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });

    /* Team */
    setAttr('teamPhoto', 'src', data.team_photo);

    renderList('teamCards', data.team_members || [], m => `
      <article class="card">
        <h3>${m.name || ''}</h3>
        <p>${m.role || ''}</p>
      </article>`);

    /* Contact */
    setText('contactIntro', data.contact_intro);
    setLink('contactPhone', `tel:${(data.contact_phone || '').replace(/\D+/g, '')}`, data.contact_phone);
    setLink('contactEmail', `mailto:${data.contact_email || ''}`, data.contact_email);
    setText('contactHours', data.contact_hours);

    /* CTA */
    setText('ctaTitle',  data.cta_title);
    setText('ctaButton', data.cta_button);

  } catch (err) {
    console.error('Ошибка загрузки контента:', err);
  } finally {
    initScrollReveal();
    initActiveNav();
  }
}

loadPageContent();
