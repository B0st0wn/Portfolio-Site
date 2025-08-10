// Two-sheet sliding reveal controller
(() => {
  const trigger = document.getElementById('projects-trigger');
  const frame   = document.getElementById('projects-reveal');
  const section = document.getElementById('projects');
  if (!trigger || !frame || !section) return;

  const open = (scrollInto = true) => {
    if (frame.classList.contains('open')) return;
    frame.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    if (scrollInto) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (location.hash !== '#projects') history.replaceState(null, '', '#projects');
  };

  const close = () => {
    if (!frame.classList.contains('open')) return;
    frame.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  // Toggle on button click
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    frame.classList.contains('open') ? close() : open(true);
  });

  // Auto-open if URL has #projects
  if (location.hash === '#projects') {
    requestAnimationFrame(() => open(false));
  }

  // ESC key closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Accessibility attributes
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('aria-controls', 'projects-reveal');
  trigger.setAttribute('aria-expanded', 'false');
})();
