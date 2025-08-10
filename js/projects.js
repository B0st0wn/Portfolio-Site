// Single-wall sliding reveal controller (asymmetric timing)
(() => {
  const trigger = document.getElementById('projects-trigger');
  const frame = document.getElementById('projects-reveal');
  const section = document.getElementById('projects');
  if (!trigger || !frame || !section) return;

  const content = frame.querySelector('.reveal-content');

  const open = (scrollInto = true) => {
    if (frame.classList.contains('open')) return;
    frame.classList.remove('closing');
    frame.classList.add('opening', 'open');
    trigger.setAttribute('aria-expanded', 'true');
    // if (scrollInto) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    content.addEventListener('transitionend', () => frame.classList.remove('opening'), { once: true });
  };

  const close = () => {
    if (!frame.classList.contains('open')) return;
    frame.classList.remove('opening');
    frame.classList.add('closing');
    trigger.setAttribute('aria-expanded', 'false');
    content.addEventListener('transitionend', () => frame.classList.remove('closing'), { once: true });
    frame.classList.remove('open');
  };

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    frame.classList.contains('open') ? close() : open(true);
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  trigger.setAttribute('role', 'button');
  trigger.setAttribute('aria-controls', 'projects-reveal');
  trigger.setAttribute('aria-expanded', 'false');
})();
