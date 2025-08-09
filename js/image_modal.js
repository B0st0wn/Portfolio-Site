<script>
(() => {
  const box = document.getElementById('img-lightbox');
  const stage = document.getElementById('pz-stage');
  const img = document.getElementById('pz-img');

  let scale = 1, x = 0, y = 0, dragging = false, startX = 0, startY = 0, startDX = 0, startDY = 0;
  const MIN = 1, MAX = 8;

  function apply() { img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`; }
  function reset() { scale = 1; x = 0; y = 0; apply(); stage.classList.remove('cursor-grabbing'); stage.classList.add('cursor-grab'); }

  // Open on any element with data-zoom-src
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-zoom-src]');
    if (!el) return;
    e.preventDefault();
    img.src = el.dataset.zoomSrc || el.currentSrc || el.src;
    // Fit start
    reset();
    box.classList.remove('hidden');
    document.documentElement.classList.add('overflow-hidden');
  });

  // Close
  box.addEventListener('click', e => {
    if (e.target.matches('[data-close-image], [data-close-image] *')) {
      box.classList.add('hidden');
      document.documentElement.classList.remove('overflow-hidden');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !box.classList.contains('hidden')) {
      box.classList.add('hidden');
      document.documentElement.classList.remove('overflow-hidden');
    }
  });

  // Wheel zoom (center on cursor)
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = stage.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const prev = scale;
    const factor = Math.exp(-e.deltaY * 0.002);
    scale = Math.min(MAX, Math.max(MIN, scale * factor));
    const k = scale / prev;
    x = cx - k * (cx - x);
    y = cy - k * (cy - y);
    apply();
  }, { passive: false });

  // Drag to pan
  stage.addEventListener('mousedown', e => {
    e.preventDefault();
    dragging = true;
    stage.classList.remove('cursor-grab'); stage.classList.add('cursor-grabbing');
    startX = e.clientX; startY = e.clientY; startDX = x; startDY = y;
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    x = startDX + (e.clientX - startX);
    y = startDY + (e.clientY - startY);
    apply();
  });
  window.addEventListener('mouseup', () => {
    dragging = false;
    stage.classList.remove('cursor-grabbing'); stage.classList.add('cursor-grab');
  });

  // Double-click toggle zoom
  stage.addEventListener('dblclick', e => {
    const rect = stage.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const targetScale = scale > 1 ? 1 : 3;
    const k = targetScale / scale;
    scale = targetScale;
    x = cx - k * (cx - x);
    y = cy - k * (cy - y);
    apply();
  });

  // Touch: pinch to zoom + drag
  let tStart = [];
  stage.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      dragging = true;
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; startDX = x; startDY = y;
    } else if (e.touches.length === 2) {
      tStart = [...e.touches].map(t => ({ x: t.clientX, y: t.clientY }));
    }
  }, { passive: false });

  stage.addEventListener('touchmove', e => {
    if (e.touches.length === 1 && dragging) {
      x = startDX + (e.touches[0].clientX - startX);
      y = startDY + (e.touches[0].clientY - startY);
      apply();
    } else if (e.touches.length === 2 && tStart.length === 2) {
      e.preventDefault();
      const [a, b] = [...e.touches].map(t => ({ x: t.clientX, y: t.clientY }));
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const dist0 = Math.hypot(tStart[1].x - tStart[0].x, tStart[1].y - tStart[0].y) || 1;
      const mid = { x: (a.x + b.x) / 2 - stage.getBoundingClientRect().left,
                    y: (a.y + b.y) / 2 - stage.getBoundingClientRect().top };
      const prev = scale;
      scale = Math.min(MAX, Math.max(MIN, prev * (dist / dist0)));
      const k = scale / prev;
      x = mid.x - k * (mid.x - x);
      y = mid.y - k * (mid.y - y);
      tStart = [a, b];
      apply();
    }
  }, { passive: false });

  stage.addEventListener('touchend', () => { dragging = false; tStart = []; });
})();
</script>