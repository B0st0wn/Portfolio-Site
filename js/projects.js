<script>
  (() => {
    const frame   = document.getElementById('projects-reveal');
    const trigger = document.getElementById('projects-trigger');

    function openProjects(e){
      if(e) e.preventDefault();
      if(frame.classList.contains('open')) return;

      // keep current height for the animation, then release to auto
      const startH = frame.getBoundingClientRect().height;
      frame.style.height = startH + 'px';   // lock current height
      // open flaps
      frame.classList.add('open');

      // after flaps move, switch to auto height so content expands naturally
      setTimeout(()=>{ frame.style.height = 'auto'; }, 720);

      // bring it into view
      frame.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    trigger.addEventListener('click', openProjects);

    // Optional: open if URL has #projects
    if (location.hash === '#projects') setTimeout(()=>openProjects(), 50);
  })();
</script>
