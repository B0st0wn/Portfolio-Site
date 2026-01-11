// /js/site.js
(() => {
  'use strict';

  /* ===============================
     Theme Toggle Logic
     =============================== */

  const htmlEl = document.documentElement; // Reference to <html>
  const stored = localStorage.getItem('theme'); // Get saved theme from localStorage
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; // Detect system dark mode
  const startDark = stored ? stored === 'dark' : prefersDark; // Use stored theme if available, else system preference

  // Apply initial theme classes
  htmlEl.classList.toggle('dark', startDark);
  htmlEl.classList.toggle('light', !startDark);

  // Toggle between dark and light theme
  const toggleTheme = () => {
    const toDark = !htmlEl.classList.contains('dark'); // If currently light, switch to dark
    htmlEl.classList.toggle('dark', toDark);
    htmlEl.classList.toggle('light', !toDark);
    localStorage.setItem('theme', toDark ? 'dark' : 'light'); // Save new theme choice

    // Update theme icon if it exists
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.classList.toggle('fa-sun', toDark);
      icon.classList.toggle('fa-moon', !toDark);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    /* ===============================
       Set initial theme icon
       =============================== */
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.classList.toggle('fa-sun', startDark);
      icon.classList.toggle('fa-moon', !startDark);
    }
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

    /* ===============================
       Current Year (footer copyright)
       =============================== */
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    /* ===============================
       Contact Form Submit Handler
       =============================== */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const enc = encodeURIComponent;
        const name = enc(document.getElementById('name').value);
        const email = enc(document.getElementById('email').value);
        const subject = enc(document.getElementById('subject').value);
        const message = enc(document.getElementById('message').value);
        const mailtoLink = `mailto:paul@hanlonhouse.us?subject=${subject}&body=Name:%20${name}%0AEmail:%20${email}%0A%0A${message}`;
        window.location.href = mailtoLink;
      });
    }

    /* ===============================
       Skill Bar Animation on Scroll
       =============================== */
    const bars = document.querySelectorAll('.skill-bar-fill');
    if (bars.length) {
      const obs = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return; // Skip if not in view
          const bar = entry.target;
          const target = bar.getAttribute('data-width') || '0%';
          const overshoot = Math.min(parseFloat(target) * 1.1, 100) + '%'; // Small overshoot animation
          bar.animate(
            [{ width: '0%' }, { width: overshoot }, { width: target }],
            { duration: 900, easing: 'ease-out', fill: 'forwards' }
          );
          observer.unobserve(bar); // Stop observing after animation
        });
      }, { threshold: 0.2 });
      bars.forEach(b => { b.style.width = '0'; obs.observe(b); });
    }

    /* ===============================
       Back to Top Button
       =============================== */
    const toTopBtn = document.getElementById('back-to-top');
    if (toTopBtn) {
      const usesHidden = toTopBtn.classList.contains('hidden'); // Whether using "hidden" or opacity method
      const toggleToTop = () => {
        const show = window.scrollY > 80;
        if (usesHidden) {
          toTopBtn.classList.toggle('hidden', !show);
        } else {
          toTopBtn.classList.toggle('opacity-0', !show);
          toTopBtn.classList.toggle('pointer-events-none', !show);
        }
      };
      toggleToTop(); // Initial check
      window.addEventListener('scroll', toggleToTop, { passive: true });
      toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ===============================
       Tabs: Smooth Scroll + Active State
       =============================== */
    const tabs = document.querySelectorAll('.tab-link');
    const sections = document.querySelectorAll('.section');

    // Update which tab is active based on scroll position
    const setActiveTab = () => {
      let current = '';
      sections.forEach(s => {
        const top = s.offsetTop, h = s.clientHeight;
        if (window.scrollY >= top - 100 && window.scrollY < top + h - 100) current = s.id;
      });
      tabs.forEach(t => t.classList.toggle('active-tab', t.getAttribute('href') === `#${current}`));
    };

    // Smooth scroll to section when clicking a tab
    tabs.forEach(t => {
      t.addEventListener('click', e => {
        e.preventDefault();
        const targetId = t.getAttribute('href');
        const targetEl = document.querySelector(targetId);
        if (targetEl) window.scrollTo({ top: targetEl.offsetTop - 80, behavior: 'smooth' });

        // Close mobile dropdown menu if open
        document.getElementById('mobile-dropdown')?.classList.add('hidden');
        document.getElementById('nav-toggle')?.setAttribute('aria-expanded', 'false');
      });
    });

    window.addEventListener('scroll', setActiveTab);
    setActiveTab(); // Initial active tab check

    /* ===============================
       Project Detail Modal
       =============================== */
    (() => {
      const modal = document.getElementById('modal-root');
      const body  = document.getElementById('modal-body');
      if (!modal || !body) return;

      // Open modal when clicking element with data-modal-target
      document.addEventListener('click', e => {
        const t = e.target.closest('[data-modal-target]');
        if (!t) return;
        e.preventDefault();
        const src = document.querySelector(t.getAttribute('data-modal-target'));
        if (!src) return;
        body.innerHTML = src.innerHTML;
        modal.classList.remove('hidden');
        document.documentElement.classList.add('overflow-hidden'); // Prevent body scroll
      });

      // Close modal on click of close button, overlay, or ESC key
      modal.addEventListener('click', e => {
        if (e.target.closest('[data-modal-close]') || e.target.matches('[data-modal-close], [data-modal-close] *') || e.target === modal.firstElementChild) {
          modal.classList.add('hidden');
          body.innerHTML = '';
          document.documentElement.classList.remove('overflow-hidden');
        }
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
          body.innerHTML = '';
          document.documentElement.classList.remove('overflow-hidden');
        }
      });
    })();

    /* ===============================
       Mobile Dropdown Menu (Hamburger)
       =============================== */
    (() => {
      const btn = document.getElementById('nav-toggle');
      const panel = document.getElementById('mobile-dropdown');
      if (!btn || !panel) return;

      const close = () => {
        panel.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
      };

      btn.addEventListener('click', e => {
        e.stopPropagation();
        panel.classList.toggle('hidden');
        btn.setAttribute('aria-expanded', (!panel.classList.contains('hidden')).toString());
      });

      // Close menu on outside click or ESC key
      document.addEventListener('click', e => {
        if (!panel.classList.contains('hidden') && !panel.contains(e.target) && !btn.contains(e.target)) close();
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

      // Close on menu link click
      panel.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    })();


    /* =======================
       Global Image Lightbox 
       ======================= */
    document.addEventListener('click', e => {
      // Open when clicking any <img data-fullsrc>
      const img = e.target.closest('img[data-fullsrc]');
      if (img) {
        const modal = document.getElementById('global-image-modal');
        const modalImg = document.getElementById('global-image-modal-img');
        if (modal && modalImg) {
          modalImg.src = img.dataset.fullsrc || img.src;
          modal.classList.remove('hidden');
        }
        return;
      }

      // Close if clicking the backdrop or the image itself
      const modal = document.getElementById('global-image-modal');
      if (modal && !modal.classList.contains('hidden') &&
          (e.target === modal || e.target === document.getElementById('global-image-modal-img'))) {
        modal.classList.add('hidden');
      }
    });

    // Close on ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.getElementById('global-image-modal')?.classList.add('hidden');
      }
    });
  });
})();
