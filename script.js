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
