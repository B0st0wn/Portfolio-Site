// Two-flap inline reveal controller
(() => {
  const trigger = document.getElementById('projects-trigger');
  const frame = document.getElementById('projects-reveal');
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
    // Don’t change the hash on close so back button is chill
  };

  // Toggle on button click
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (frame.classList.contains('open')) close(); else open(true);
  });

  // Open automatically if user lands on /#projects
  if (location.hash === '#projects') {
    // delay a tick so layout is ready before measuring/animating
    requestAnimationFrame(() => open(false));
  }

  // Optional: ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Make it accessible
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('aria-controls', 'projects-reveal');
  trigger.setAttribute('aria-expanded', 'false');
})();
