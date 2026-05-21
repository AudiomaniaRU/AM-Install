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

let lbImages = [];
let lbIndex  = 0;

function openLightbox(images, startIndex, caption) {
  lbImages = images;
  lbIndex  = startIndex;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  renderLightboxSlide(caption);
  lightboxImg.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

function renderLightboxSlide(fallbackCaption) {
  lightboxImg.src = lbImages[lbIndex];
  lightboxImg.alt = fallbackCaption || '';
  lightboxCap.textContent = fallbackCaption || '';

  lightboxDots.innerHTML = lbImages.map((_, i) =>
    `<button class="lightbox__dot${i === lbIndex ? ' active' : ''}" aria-label="Фото ${i + 1}"></button>`
  ).join('');

  lightboxDots.querySelectorAll('.lightbox__dot').forEach((dot, i) => {
    dot.addEventListener('click', () => { lbIndex = i; renderLightboxSlide(fallbackCaption); });
  });

  lbPrev.style.display = lbImages.length > 1 ? '' : 'none';
  lbNext.style.display = lbImages.length > 1 ? '' : 'none';
}

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

lbPrev.addEventListener('click', () => {
  lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
  renderLightboxSlide(lightboxCap.textContent);
});
lbNext.addEventListener('click', () => {
  lbIndex = (lbIndex + 1) % lbImages.length;
  renderLightboxSlide(lightboxCap.textContent);
});

document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; renderLightboxSlide(lightboxCap.textContent); }
  if (e.key === 'ArrowRight')  { lbIndex = (lbIndex + 1) % lbImages.length; renderLightboxSlide(lightboxCap.textContent); }
});

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
    const hero = data.hero || {};
    setText('heroEyebrow', hero.eyebrow);
    if (hero.title) {
      const el = document.getElementById('heroTitle');
      if (el) el.innerHTML = hero.title.replace(
        /(аудио-\s*и\s*видеорешений)/i,
        '<span class="accent">$1</span>'
      );
    }
    setText('heroDescription', hero.description);
    setText('heroPrimaryCta',  hero.primary_cta);
    setText('heroSecondaryCta',hero.secondary_cta);
    setText('statsLabel', hero.stats_label);
    setText('statsValue', hero.stats_value);
    setAttr('heroImage', 'src', hero.image);

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

    /* Expertise / Diplomas */
    const expertise = data.expertise || {};
    setText('expertiseIntro', expertise.intro);
    renderList('diplomasStrip', expertise.diplomas, d => {
      const imgs  = [d.image];
      const title = d.title || '';
      return `
        <div class="diploma__item" role="button" tabindex="0"
             data-lb-images="${encodeURIComponent(JSON.stringify(imgs))}"
             data-lb-caption="${title}">
          <img src="${d.image || ''}" alt="${title}" loading="lazy" />
          <span>${title}</span>
        </div>`;
    });

    /* Clients */
    const clients = data.clients || {};
    setText('clientsTitle', clients.title);
    renderList('clientsLogos', clients.logos, c => `
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

    /* Team */
    const team = data.team || {};
    const teamPhoto = document.getElementById('teamPhoto');
    if (teamPhoto && team.photo) teamPhoto.src = team.photo;

    renderList('teamCards', team.members || [], m => `
      <article class="card">
        <h3>${m.name || ''}</h3>
        <p>${m.role || ''}</p>
      </article>`);

    /* Contact */
    const contact = data.contact || {};
    setText('contactIntro', contact.intro);
    setLink('contactPhone', `tel:${(contact.phone || '').replace(/\D+/g, '')}`, contact.phone);
    setLink('contactEmail', `mailto:${contact.email || ''}`, contact.email);
    setText('contactHours', contact.hours);

    /* CTA */
    const cta = data.cta || {};
    setText('ctaTitle',  cta.title);
    setText('ctaButton', cta.button);

  } catch (err) {
    console.error('Ошибка загрузки контента:', err);
  } finally {
    initScrollReveal();
    bindLightboxTriggers();
  }
}

/* ── Bind lightbox to rendered elements ─────────────── */
function bindLightboxTriggers() {
  document.querySelectorAll('[data-lb-images]').forEach(el => {
    const activate = () => {
      const images  = JSON.parse(decodeURIComponent(el.dataset.lbImages));
      const caption = el.dataset.lbCaption || '';
      openLightbox(images, 0, caption);
    };
    el.addEventListener('click', activate);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });
}

loadPageContent();
