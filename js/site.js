// /js/site.js
(() => {
  'use strict';

  // ===== Theme =====
  const htmlEl = document.documentElement;
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const startDark = stored ? stored === 'dark' : prefersDark;
  htmlEl.classList.toggle('dark', startDark);
  htmlEl.classList.toggle('light', !startDark);

  const toggleTheme = () => {
    const toDark = !htmlEl.classList.contains('dark');
    htmlEl.classList.toggle('dark', toDark);
    htmlEl.classList.toggle('light', !toDark);
    localStorage.setItem('theme', toDark ? 'dark' : 'light');
    const icon = document.getElementById('theme-icon');
    if (icon) { icon.classList.toggle('fa-sun', toDark); icon.classList.toggle('fa-moon', !toDark); }
  };

  document.addEventListener('DOMContentLoaded', () => {
    // set icon once DOM exists
    const icon = document.getElementById('theme-icon');
    if (icon) { icon.classList.toggle('fa-sun', startDark); icon.classList.toggle('fa-moon', !startDark); }
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

    // ===== Skill bars =====
    const bars = document.querySelectorAll('.skill-bar-fill');
    if (bars.length) {
      const obs = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const bar = entry.target;
          const target = bar.getAttribute('data-width') || '0%';
          const overshoot = Math.min(parseFloat(target) * 1.1, 100) + '%';
          bar.animate([{width:'0%'},{width:overshoot},{width:target}], {duration:900, easing:'ease-out', fill:'forwards'});
          observer.unobserve(bar);
        });
      }, { threshold: 0.2 });
      bars.forEach(b => { b.style.width = '0'; obs.observe(b); });
    }

    // ===== Projects sliding reveal (single-wall) =====
    const trigger = document.getElementById('projects-trigger');
    const frame = document.getElementById('projects-reveal');
    if (trigger && frame) {
      const content = frame.querySelector('.reveal-content');
      const open = () => {
        if (frame.classList.contains('open')) return;
        frame.classList.remove('closing');
        frame.classList.add('opening','open');
        trigger.setAttribute('aria-expanded','true');
        content?.addEventListener('transitionend', () => frame.classList.remove('opening'), { once:true });
      };
      const close = () => {
        if (!frame.classList.contains('open')) return;
        frame.classList.remove('opening');
        frame.classList.add('closing');
        trigger.setAttribute('aria-expanded','false');
        content?.addEventListener('transitionend', () => frame.classList.remove('closing'), { once:true });
        frame.classList.remove('open');
      };
      trigger.addEventListener('click', e => {
        e.preventDefault();
        frame.classList.contains('open') ? close() : open();
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
      trigger.setAttribute('role','button');
      trigger.setAttribute('aria-controls','projects-reveal');
      trigger.setAttribute('aria-expanded','false');
    }

    // ===== Tabs: smooth scroll + active + trigger Projects reveal =====
    const tabs = document.querySelectorAll('.tab-link');
    const sections = document.querySelectorAll('.section');
    const setActiveTab = () => {
      let current = '';
      sections.forEach(s => {
        const top = s.offsetTop, h = s.clientHeight;
        if (window.scrollY >= top - 100 && window.scrollY < top + h - 100) current = s.id;
      });
      tabs.forEach(t => t.classList.toggle('active-tab', t.getAttribute('href') === `#${current}`));
    };
    tabs.forEach(t => {
      t.addEventListener('click', e => {
        e.preventDefault();
        const targetId = t.getAttribute('href');
        const targetEl = document.querySelector(targetId);
        if (targetEl) window.scrollTo({ top: targetEl.offsetTop - 80, behavior: 'smooth' });

        if (targetId === '#projects') {
          document.getElementById('mobile-dropdown')?.classList.add('hidden');
          document.getElementById('nav-toggle')?.setAttribute('aria-expanded','false');
          setTimeout(() => document.getElementById('projects-trigger')?.click(), 150);
        }
      });
    });
    window.addEventListener('scroll', setActiveTab);
    setActiveTab();

    // ===== Project detail modal wiring =====
    (() => {
      const modal = document.getElementById('modal-root');
      const body  = document.getElementById('modal-body');
      if (!modal || !body) return;

      document.addEventListener('click', e => {
        const t = e.target.closest('[data-modal-target]');
        if (!t) return;
        e.preventDefault();
        const src = document.querySelector(t.getAttribute('data-modal-target'));
        if (!src) return;
        body.innerHTML = src.innerHTML;
        modal.classList.remove('hidden');
        document.documentElement.classList.add('overflow-hidden');
      });

      modal.addEventListener('click', e => {
        if (e.target.closest('[data-modal-close]') || e.target.matches('[data-modal-close], [data-modal-close] *') || e.target === modal.firstElementChild) {
          modal.classList.add('hidden'); body.innerHTML = ''; document.documentElement.classList.remove('overflow-hidden');
        }
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
          modal.classList.add('hidden'); body.innerHTML = ''; document.documentElement.classList.remove('overflow-hidden');
        }
      });
    })();

    // ===== Mobile dropdown (hamburger) =====
    (() => {
      const btn = document.getElementById('nav-toggle');
      const panel = document.getElementById('mobile-dropdown');
      if (!btn || !panel) return;
      const close = () => { panel.classList.add('hidden'); btn.setAttribute('aria-expanded','false'); };

      btn.addEventListener('click', e => {
        e.stopPropagation();
        panel.classList.toggle('hidden');
        btn.setAttribute('aria-expanded', (!panel.classList.contains('hidden')).toString());
      });

      document.addEventListener('click', e => {
        if (!panel.classList.contains('hidden') && !panel.contains(e.target) && !btn.contains(e.target)) close();
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
      panel.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    })();

    // ===== Contact form =====
    window.sendMail = function () {
      const enc = encodeURIComponent;
      const name = enc(document.getElementById('name').value);
      const email = enc(document.getElementById('email').value);
      const subject = enc(document.getElementById('subject').value);
      const message = enc(document.getElementById('message').value);
      const mailtoLink = `mailto:paul@hanlonhouse.us?subject=${subject}&body=Name:%20${name}%0AEmail:%20${email}%0A%0A${message}`;
      window.location.href = mailtoLink;
      return false;
    };
  });
})();
