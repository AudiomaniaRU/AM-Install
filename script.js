/* ── Nav toggle ─────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
const navLinks = Array.from(nav.querySelectorAll('a'));

navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ── Contact form ────────────────────────────────────── */
const form = document.querySelector('.contact__form');
if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Отправлено!';
    submitButton.disabled = true;
    setTimeout(() => {
      submitButton.textContent = 'Отправить заявку';
      submitButton.disabled = false;
      form.reset();
    }, 1800);
  });
}

/* ── Scroll-reveal ───────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

/* ── Helpers ─────────────────────────────────────────── */
function renderList(containerId, items, renderItem) {
  const container = document.getElementById(containerId);
  if (!container || !Array.isArray(items)) return;
  container.innerHTML = items.map(renderItem).join('');
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && typeof value !== 'undefined') el.textContent = value;
}

function setLink(id, href, text) {
  const link = document.getElementById(id);
  if (!link) return;
  if (href) link.href = href;
  if (typeof text !== 'undefined') link.textContent = text;
}

/* ── Content loader ──────────────────────────────────── */
async function loadPageContent() {
  try {
    const response = await fetch('content/page.yml');
    if (!response.ok) throw new Error(`Unable to load content/page.yml: ${response.status}`);
    const data = jsyaml.load(await response.text());
    if (!data) return;

    const hero = data.hero || {};
    setText('heroEyebrow', hero.eyebrow);
    if (hero.title) {
      const el = document.getElementById('heroTitle');
      if (el) el.innerHTML = `${hero.title.replace(/(аудио-\s*и\s*видеорешений)/i, '<span class="accent">$1</span>')}`;
    }
    setText('heroDescription', hero.description);
    setText('heroPrimaryCta', hero.primary_cta);
    setText('heroSecondaryCta', hero.secondary_cta);
    setText('statsLabel', hero.stats_label);
    setText('statsValue', hero.stats_value);
    const heroImage = document.getElementById('heroImage');
    if (heroImage && hero.image) heroImage.src = hero.image;

    renderList('servicesGrid', data.services, service => `
      <article class="card">
        <img src="${service.image || 'images/hero-cover.jpg'}" alt="${service.title || ''}" class="card__image" width="400" height="200" loading="lazy" />
        <h3>${service.title || ''}</h3>
        <p>${service.description || ''}</p>
      </article>
    `);

    renderList('processTimeline', data.process, step => `
      <div class="timeline__item">
        <span aria-hidden="true">${step.step || ''}</span>
        <div>
          <h3>${step.title || ''}</h3>
          <p>${step.description || ''}</p>
        </div>
      </div>
    `);

    renderList('advantagesGrid', data.advantages, item => `
      <article class="feature">
        <h3>${item.title || ''}</h3>
        <p>${item.description || ''}</p>
      </article>
    `);

    renderList('galleryGrid', data.gallery, item => `
      <article class="gallery__item">
        <img src="${item.image || 'images/hero-cover.jpg'}" alt="${item.title || ''}" width="400" height="220" loading="lazy" />
        <h3>${item.title || ''}</h3>
      </article>
    `);

    renderList('teamCards', data.team, member => `
      <article class="card">
        <h3>${member.name || ''}</h3>
        <p>${member.role || ''}</p>
      </article>
    `);

    const contact = data.contact || {};
    setText('contactIntro', contact.intro);
    setLink('contactPhone', `tel:${(contact.phone || '').replace(/\D+/g, '')}`, contact.phone);
    setLink('contactEmail', `mailto:${contact.email || ''}`, contact.email);
    setText('contactHours', contact.hours);

    const cta = data.cta || {};
    setText('ctaTitle', cta.title);
    setText('ctaButton', cta.button);

  } catch (error) {
    console.error('Ошибка загрузки контента:', error);
  } finally {
    initScrollReveal();
  }
}

loadPageContent();
