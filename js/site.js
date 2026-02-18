// /js/site.js
(() => {
  'use strict';

  /* ===============================
     Theme Toggle Logic
     =============================== */

  const htmlEl = document.documentElement; // <html>
  const prefersDarkMql = window.matchMedia('(prefers-color-scheme: dark)');

  const getStoredTheme = () => localStorage.getItem('theme'); // "light" | "dark" | null
  const getSystemTheme = () => (prefersDarkMql.matches ? 'dark' : 'light');

  const applyTheme = (theme) => {
    // Source of truth for theming: data-theme on <html>
    htmlEl.setAttribute('data-theme', theme);

    // Keep Tailwind's `dark:` variant working (Tailwind CDN config uses darkMode: "class").
    htmlEl.classList.toggle('dark', theme === 'dark');

    // Update theme icon if it exists: show the *other* theme as the action.
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.classList.toggle('fa-sun', theme === 'dark');  // in dark mode, show sun (switch to light)
      icon.classList.toggle('fa-moon', theme === 'light'); // in light mode, show moon (switch to dark)
    }
  };

  // Initialize theme from localStorage or system preference (no DOMContentLoaded to avoid flash).
  const storedTheme = getStoredTheme();
  const initialTheme = storedTheme || getSystemTheme();
  applyTheme(initialTheme);

  const toggleTheme = (ev) => {
    const current = htmlEl.getAttribute('data-theme') || getSystemTheme();
    const next = current === 'light' ? 'dark' : 'light';
    const TRANSITION_MS = 700;
    const HALF_MS = Math.max(1, Math.round(TRANSITION_MS / 2));

    // Animated transition when supported. Falls back to a simple class + timeout.
    const run = () => {
      applyTheme(next);
      localStorage.setItem('theme', next);
    };

    htmlEl.classList.add('theme-transition', next === 'dark' ? 'to-dark' : 'to-light');

    if (typeof document.startViewTransition === 'function') {
      // Use click position as the clip-path origin when available.
      const x = (ev && typeof ev.clientX === 'number') ? ev.clientX : Math.round(window.innerWidth / 2);
      const y = (ev && typeof ev.clientY === 'number') ? ev.clientY : Math.round(window.innerHeight / 2);
      htmlEl.style.setProperty('--theme-x', `${x}px`);
      htmlEl.style.setProperty('--theme-y', `${y}px`);

      const vt = document.startViewTransition(run);
      vt.finished.finally(() => {
        htmlEl.classList.remove('theme-transition', 'to-dark', 'to-light');
        htmlEl.style.removeProperty('--theme-x');
        htmlEl.style.removeProperty('--theme-y');
      });
    } else {
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      if (reducedMotion) {
        run();
        htmlEl.classList.remove('theme-transition');
        return;
      }

      const x = (ev && typeof ev.clientX === 'number') ? ev.clientX : Math.round(window.innerWidth / 2);
      const y = (ev && typeof ev.clientY === 'number') ? ev.clientY : Math.round(window.innerHeight / 2);
      htmlEl.style.setProperty('--theme-x', `${x}px`);
      htmlEl.style.setProperty('--theme-y', `${y}px`);

      let overlay = document.getElementById('theme-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'theme-overlay';
        overlay.className = 'theme-overlay';
        document.body.appendChild(overlay);
      }

      overlay.style.setProperty('--theme-x', `${x}px`);
      overlay.style.setProperty('--theme-y', `${y}px`);
      overlay.style.setProperty('--theme-overlay-ms', `${HALF_MS}ms`);

      const cleanup = () => {
        overlay.classList.remove('is-covering', 'is-revealing');
        htmlEl.classList.remove('theme-transition', 'to-dark', 'to-light');
        htmlEl.style.removeProperty('--theme-x');
        htmlEl.style.removeProperty('--theme-y');
      };

      if (next === 'light') {
        // Outside-in: overlay starts fully open (showing current dark theme), then shrinks to reveal light underneath.
        overlay.style.setProperty('--theme-overlay-bg', getComputedStyle(document.body).backgroundColor);
        overlay.style.clipPath = `circle(150% at ${x}px ${y}px)`;
        overlay.classList.remove('is-covering');
        overlay.classList.remove('is-revealing');

        run();

        requestAnimationFrame(() => {
          overlay.style.clipPath = '';
          overlay.classList.add('is-revealing');

          setTimeout(cleanup, HALF_MS);
        });
      } else {
        // Inside-out (to dark): overlay expands from toggle, covers page, then reveals.
        overlay.style.setProperty('--theme-overlay-bg', getComputedStyle(document.body).backgroundColor);
        overlay.classList.remove('is-revealing');
        overlay.classList.add('is-covering');

        setTimeout(() => {
          run();
          requestAnimationFrame(() => {
            overlay.style.setProperty('--theme-overlay-bg', getComputedStyle(document.body).backgroundColor);
            overlay.classList.remove('is-covering');
            overlay.classList.add('is-revealing');

            setTimeout(cleanup, HALF_MS);
          });
        }, HALF_MS);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Now that the DOM exists, ensure the icon matches the already-applied theme.
    applyTheme(htmlEl.getAttribute('data-theme') || initialTheme);

    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

    // If the user hasn't explicitly chosen a theme, follow system changes.
    const onSystemThemeChange = () => {
      if (!getStoredTheme()) applyTheme(getSystemTheme());
    };
    if (typeof prefersDarkMql.addEventListener === 'function') {
      prefersDarkMql.addEventListener('change', onSystemThemeChange);
    } else if (typeof prefersDarkMql.addListener === 'function') {
      // Older Safari
      prefersDarkMql.addListener(onSystemThemeChange);
    }

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
        // Template: change this to your real address.
        const TEMPLATE_CONTACT_EMAIL = 'your.email@example.com';
        const mailtoLink = `mailto:${TEMPLATE_CONTACT_EMAIL}?subject=${subject}&body=Name:%20${name}%0AEmail:%20${email}%0A%0A${message}`;
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

      const panel = modal.querySelector('div.fixed'); // the centered modal panel
      if (!panel) return;

      const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

      // Global animation timing constants (change here to adjust speed)
      const MODAL_ANIM_MS = 900;  // Main animation: grow/shrink + slide

      // Keep easing/timing centralized so open/close feel identical.
      const EASE_SOFT = 'cubic-bezier(0.45, 0, 0.55, 1)';      // smooth, avoids "snap"
      const EASE_SMOOTH = 'cubic-bezier(0.22, 1, 0.36, 1)';    // slightly punchier but still smooth

      let activeCardEl = null;
      let animating = false;
      let scrollLockPrev = null;

      const nextFrame = () => new Promise(requestAnimationFrame);

      const withTimeout = (p, ms) =>
        Promise.race([p, new Promise(resolve => setTimeout(resolve, ms))]);

      const waitForImages = async (container, ms = 250) => {
        if (!container) return;
        const imgs = Array.from(container.querySelectorAll('img'));
        if (!imgs.length) return;

        const waits = imgs.map(img => {
          if (img.complete) return Promise.resolve();
          if (typeof img.decode === 'function') return img.decode().catch(() => {});
          return new Promise(resolve => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          });
        });

        await withTimeout(Promise.allSettled(waits), ms);
      };

      const waitForFonts = async (ms = 250) => {
        const fonts = document.fonts;
        if (!fonts || typeof fonts.ready?.then !== 'function') return;
        await withTimeout(fonts.ready.catch(() => {}), ms);
      };

      const lockScroll = () => {
        if (scrollLockPrev) return;

        const docEl = document.documentElement;
        const scrollbarW = Math.max(0, window.innerWidth - docEl.clientWidth);

        scrollLockPrev = {
          htmlOverflow: docEl.style.overflow,
          bodyPaddingRight: document.body.style.paddingRight
        };

        // Prevent layout shift when the scrollbar disappears.
        if (scrollbarW) document.body.style.paddingRight = `${scrollbarW}px`;
        docEl.style.overflow = 'hidden';
      };

      const unlockScroll = () => {
        if (!scrollLockPrev) return;

        const docEl = document.documentElement;
        docEl.style.overflow = scrollLockPrev.htmlOverflow || '';
        document.body.style.paddingRight = scrollLockPrev.bodyPaddingRight || '';
        scrollLockPrev = null;
      };

      const setModalOpen = (open) => {
        modal.classList.toggle('hidden', !open);
        if (!open) body.innerHTML = '';
      };

      const makeShell = (fromRect, cardEl) => {
        const shell = document.createElement('div');
        shell.className = 'card-transition-shell';
        shell.style.left = `${fromRect.left}px`;
        shell.style.top = `${fromRect.top}px`;
        shell.style.width = `${fromRect.width}px`;
        shell.style.height = `${fromRect.height}px`;

        const inner = document.createElement('div');
        inner.className = 'card-transition-inner';

        const face = document.createElement('div');
        face.className = 'card-transition-face front';
        const cardClone = (cardEl || document.createElement('div')).cloneNode(true);

        // Always use the card's actual size, not the shell's size
        const cardRect = cardEl ? cardEl.getBoundingClientRect() : fromRect;
        cardClone.style.width = `${cardRect.width}px`;
        cardClone.style.height = `${cardRect.height}px`;
        cardClone.style.overflow = 'hidden';
        cardClone.style.transformOrigin = 'top left';

        face.appendChild(cardClone);

        const face2 = document.createElement('div');
        face2.className = 'card-transition-face back';

        inner.appendChild(face);
        inner.appendChild(face2);
        shell.appendChild(inner);
        document.body.appendChild(shell);

        return { shell, inner, face, face2, cardClone };
      };

      const cloneForShell = (el, size) => {
        const clone = el.cloneNode(true);

        // Avoid duplicated IDs affecting querySelector/getElementById.
        const stripIds = (node) => {
          if (node.nodeType !== 1) return;
          node.removeAttribute('id');
          for (const c of node.children) stripIds(c);
        };
        stripIds(clone);

        // Force it to fill the shell face (ignore its original fixed/translate centering).
        clone.style.position = 'absolute';
        clone.style.left = '0';
        clone.style.top = '0';
        clone.style.opacity = '1';
        // Keep the clone's layout stable during the shell resize animation.
        // If we size it to the shell, text reflows and scrollbars can appear (like resizing a window).
        if (size && Number.isFinite(size.width) && Number.isFinite(size.height)) {
          clone.style.width = `${size.width}px`;
          clone.style.height = `${size.height}px`;
        } else {
          clone.style.width = '100%';
          clone.style.height = '100%';
        }
        clone.style.maxWidth = 'none';
        clone.style.margin = '0';
        clone.style.transform = 'none';
        clone.style.overflow = 'hidden';

        return clone;
      };

      const animateShellNoRot = async ({ shell, fromRect, toRect, fromRadius, toRadius, duration = 350 }) => {
        // IMPORTANT: avoid non-uniform transform scaling (sx != sy) which visibly stretches images/text.
        // Animate geometry directly (one element) to keep content rendering natural.
        const a1 = shell.animate(
          [
            {
              left: `${fromRect.left}px`,
              top: `${fromRect.top}px`,
              width: `${fromRect.width}px`,
              height: `${fromRect.height}px`,
              borderRadius: fromRadius
            },
            {
              left: `${toRect.left}px`,
              top: `${toRect.top}px`,
              width: `${toRect.width}px`,
              height: `${toRect.height}px`,
              borderRadius: toRadius
            }
          ],
          { duration, easing: EASE_SMOOTH, fill: 'forwards' }
        );

        await Promise.allSettled([a1.finished]);
      };

      const openWithTransition = async (ev, triggerEl, srcEl) => {
        if (animating) return;
        animating = true;

        const cardEl = triggerEl.closest('.group') || triggerEl;
        activeCardEl = cardEl;

        // Capture the card position before scroll-lock changes anything.
        const fromRect = cardEl.getBoundingClientRect();

        const { shell, face, face2 } = makeShell(fromRect, cardEl);
        // Keep the original card visible (user requested no background behind modal).

        try {
          body.innerHTML = srcEl.innerHTML;

          // Make modal measurable but not visible while the shell animates.
          lockScroll();
          setModalOpen(true);
          // Cancel any lingering fill-forwards animations from a previous open,
          // otherwise they override the inline opacity we set below.
          panel.getAnimations().forEach(a => a.cancel());

          // Keep modal in final layout position but hidden while the shell animates.
          const panelOpacityPrev = panel.style.opacity;
          const panelTransitionPrev = panel.style.transition;
          panel.style.opacity = '0';
          panel.style.transition = 'none';

          // Let injected content (images/fonts/layout) settle before measuring the target rect.
          await nextFrame();
          await nextFrame();
          await Promise.allSettled([waitForImages(panel), waitForFonts()]);

          const toRect = panel.getBoundingClientRect();
          const fromRadius = getComputedStyle(cardEl).borderRadius || '12px';
          const toRadius = getComputedStyle(panel).borderRadius || '16px';

          if (reducedMotion()) {
            panel.style.opacity = panelOpacityPrev || '';
            panel.style.transition = panelTransitionPrev || '';
            return;
          }

          // Modal content sits behind the card, positioned to the left and ready to slide in.
          face2.replaceChildren(cloneForShell(panel, { width: toRect.width, height: toRect.height }));
          face2.style.opacity = '1';
          face2.style.transform = 'translateX(-100%)';
          face.style.position = 'absolute';
          face.style.inset = '0';
          face.style.zIndex = '1';

          // Give the shell a solid background so the page doesn't bleed through.
          // Use theme variables directly — Tailwind's dark:bg-gray-900 has a blue tint
          // that doesn't match the actual theme, and getComputedStyle can return it
          // before the !important override in site.css takes effect.
          shell.style.backgroundColor = htmlEl.classList.contains('dark')
            ? 'var(--secondary, #222222)'
            : '#ffffff';

          // Grow shell while sliding modal in from left and card out to left (all simultaneous - mirror of close).
          const slideModalIn = face2.animate(
            [
              { transform: 'translateX(-100%)' },
              { transform: 'translateX(0)' }
            ],
            { duration: MODAL_ANIM_MS, easing: EASE_SMOOTH, fill: 'forwards' }
          );

          // Slide the card cover out (no opacity fade; fade reads as jank here).
          const slideCardOut = face.animate(
            [
              { transform: 'translateX(0)' },
              { transform: 'translateX(-100%)' }
            ],
            { duration: MODAL_ANIM_MS, easing: EASE_SOFT, fill: 'forwards' }
          );

          await Promise.all([
            animateShellNoRot({ shell, fromRect, toRect, fromRadius, toRadius, duration: MODAL_ANIM_MS }),
            slideModalIn.finished,
            slideCardOut.finished
          ]);

          // Show real panel and remove shell.
          panel.style.opacity = panelOpacityPrev || '';
          panel.style.transition = panelTransitionPrev || '';
        } finally {
          shell.remove();
          animating = false;
        }
      };

      const closeWithTransition = async () => {
        if (animating) return;
        if (modal.classList.contains('hidden')) return;

        const cardEl = activeCardEl;
        if (!cardEl || !document.body.contains(cardEl) || reducedMotion()) {
          setModalOpen(false);
          unlockScroll();
          return;
        }

        animating = true;
        // Keep the destination card visible during shrink.

        const fromRect = panel.getBoundingClientRect();
        const toRect = cardEl.getBoundingClientRect();
        const fromRadius = getComputedStyle(panel).borderRadius || '16px';
        const toRadius = getComputedStyle(cardEl).borderRadius || '12px';

        const { shell, face, cardClone } = makeShell(fromRect, cardEl);

        // Grab the backdrop so we can fade it separately.
        const backdrop = modal.querySelector('[data-modal-close]');

        try {
          const panelOpacityPrev = panel.style.opacity;
          const panelTransitionPrev = panel.style.transition;

          // Shell starts showing the modal content clone.
          face.replaceChildren(cloneForShell(panel, { width: fromRect.width, height: fromRect.height }));
          face.style.opacity = '1';

          // Solid background so the page doesn't bleed through during shrink.
          shell.style.backgroundColor = htmlEl.classList.contains('dark')
            ? 'var(--secondary, #222222)'
            : '#ffffff';

          // Hide only the panel — keep backdrop visible so the page doesn't flash.
          panel.style.opacity = '0';
          panel.style.transition = 'none';
          await new Promise(requestAnimationFrame);

          // Shrink shell while sliding modal out and card in (all simultaneous - exact reverse of open).
          const face2 = shell.querySelector('.card-transition-face.back');

          if (face2) {
            // Prepare card content to slide in from left
            face2.replaceChildren(cardClone);
            face2.style.opacity = '1';
            face2.style.transform = 'translateX(-100%)';

            // Slide modal out to the left
            const slideModalOut = face.animate(
              [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-100%)' }
              ],
              { duration: MODAL_ANIM_MS, easing: EASE_SOFT, fill: 'forwards' }
            );

            // Slide the card cover back in (no opacity fade).
            const slideCardIn = face2.animate(
              [
                { transform: 'translateX(-100%)' },
                { transform: 'translateX(0)' }
              ],
              { duration: MODAL_ANIM_MS, easing: EASE_SOFT, fill: 'forwards' }
            );

            // Shrink shell
            const shrink = animateShellNoRot({ shell, fromRect, toRect, fromRadius, toRadius, duration: MODAL_ANIM_MS });

            // Fade backdrop
            if (backdrop) {
              backdrop.animate(
                [{ opacity: 1 }, { opacity: 0 }],
                { duration: MODAL_ANIM_MS, easing: EASE_SOFT, fill: 'forwards' }
              );
            }

            await Promise.allSettled([slideModalOut.finished, slideCardIn.finished, shrink]);
          } else {
            if (backdrop) {
              backdrop.animate(
                [{ opacity: 1 }, { opacity: 0 }],
                { duration: MODAL_ANIM_MS, easing: EASE_SOFT, fill: 'forwards' }
              );
            }
            await animateShellNoRot({ shell, fromRect, toRect, fromRadius, toRadius, duration: MODAL_ANIM_MS });
          }

          // Clean up and hide modal.
          setModalOpen(false);
          panel.style.opacity = panelOpacityPrev || '';
          panel.style.transition = panelTransitionPrev || '';
          unlockScroll();
        } finally {
          shell.remove();
          animating = false;
        }
      };

      // Open on click of any element with data-modal-target
      document.addEventListener('click', e => {
        const t = e.target.closest('[data-modal-target]');
        if (!t) return;
        e.preventDefault();
        const src = document.querySelector(t.getAttribute('data-modal-target'));
        if (!src) return;
        openWithTransition(e, t, src);
      });

      // Close on click of close button or overlay
      modal.addEventListener('click', e => {
        if (!e.target.closest('[data-modal-close]') && e.target !== modal.firstElementChild) return;
        e.preventDefault();
        closeWithTransition();
      });

      // Close on ESC
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeWithTransition();
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
