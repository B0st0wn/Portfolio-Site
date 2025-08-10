(() => {
  const trigger = document.getElementById('projects-trigger');
  const frame   = document.getElementById('projects-reveal');
  const section = document.getElementById('projects');
  if (!trigger || !frame || !section) return;

  const onFlapDone = (e) => {
    if (e.propertyName !== 'transform' || !e.target.classList.contains('flap')) return;
    if (frame.classList.contains('open')) frame.classList.add('flaps-gone'); // hide after opening
    frame.removeEventListener('transitionend', onFlapDone);
  };

  const open = (scrollInto = true) => {
    if (frame.classList.contains('open')) return;
    frame.classList.remove('flaps-gone');      // ensure flaps exist before animating open
    frame.classList.add('open');
    frame.addEventListener('transitionend', onFlapDone);
    trigger.setAttribute('aria-expanded', 'true');
    if (scrollInto) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (location.hash !== '#projects') history.replaceState(null, '', '#projects');
  };

  const close = () => {
    if (!frame.classList.contains('open')) return;
    frame.classList.remove('open');
    frame.classList.remove('flaps-gone');      // bring flaps back for the close animation
    trigger.setAttribute('aria-expanded', 'false');
  };

  trigger.addEventListener('click', (e) => { e.preventDefault(); frame.classList.contains('open') ? close() : open(true); });
  if (location.hash === '#projects') requestAnimationFrame(() => open(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  trigger.setAttribute('role', 'button');
  trigger.setAttribute('aria-controls', 'projects-reveal');
  trigger.setAttribute('aria-expanded', 'false');
})();
