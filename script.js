/**
 * WIEWOLT S.A.C. — Landing Page
 * script.js — Animaciones, interactividad y funcionalidad
 */

'use strict';

/* ─────────────────────────────────────────────────────────────
   1. NAVBAR — scroll behavior + hamburger
───────────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  const navLinks  = document.querySelectorAll('.nav-link');

  // Scroll: toggle "scrolled" class
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveLink();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  hamburger.addEventListener('click', function () {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu on nav-link click
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  // Close menu on outside click
  document.addEventListener('click', function (e) {
    if (navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Active link based on scroll position
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(function (link) {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href === '#' + current) {
        link.classList.add('active');
      }
    });
  }
})();


/* ─────────────────────────────────────────────────────────────
   2. INTERSECTION OBSERVER — scroll reveal
───────────────────────────────────────────────────────────── */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Stagger children within the same parent
          const siblings = entry.target.parentElement
            ? Array.from(entry.target.parentElement.querySelectorAll('.reveal'))
            : [];
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(idx * 80, 480); // max 480ms stagger

          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ─────────────────────────────────────────────────────────────
   3. ANIMATED COUNTERS
───────────────────────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  let triggered = false;

  const statsSection = document.getElementById('stats');
  if (!statsSection) return;

  function animateCount(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const step     = Math.ceil(duration / target);
    let current    = 0;

    const timer = setInterval(function () {
      current += 1;
      el.textContent = current;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, step);
  }

  const observer = new IntersectionObserver(
    function (entries) {
      if (entries[0].isIntersecting && !triggered) {
        triggered = true;
        counters.forEach(animateCount);
        observer.disconnect();
      }
    },
    { threshold: 0.3 }
  );

  observer.observe(statsSection);
})();


/* ─────────────────────────────────────────────────────────────
   4. SMOOTH SCROLL for anchor links
───────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.getElementById('navbar').offsetHeight;
      const targetTop    = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 8;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();


/* ─────────────────────────────────────────────────────────────
   5. CONTACT FORM — validation + success message
───────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fields = {
    nombre:  { el: document.getElementById('nombre'),  err: document.getElementById('err-nombre'),  msg: 'Por favor ingresa tu nombre.' },
    correo:  { el: document.getElementById('correo'),  err: document.getElementById('err-correo'),  msg: 'Por favor ingresa un correo válido.' },
    mensaje: { el: document.getElementById('mensaje'), err: document.getElementById('err-mensaje'), msg: 'Por favor escribe un mensaje.' }
  };

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
  }

  function validateField(key) {
    const { el, err, msg } = fields[key];
    let valid = true;

    if (key === 'correo') {
      valid = !!el.value.trim() && isValidEmail(el.value);
    } else {
      valid = !!el.value.trim();
    }

    if (!valid) {
      el.classList.add('invalid');
      err.textContent = msg;
    } else {
      el.classList.remove('invalid');
      err.textContent = '';
    }
    return valid;
  }

  // Live validation on blur
  Object.keys(fields).forEach(function (key) {
    fields[key].el.addEventListener('blur', function () {
      validateField(key);
    });
    fields[key].el.addEventListener('input', function () {
      if (fields[key].el.classList.contains('invalid')) {
        validateField(key);
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const isValid = Object.keys(fields).reduce(function (acc, key) {
      return validateField(key) && acc;
    }, true);

    if (!isValid) return;

    // Show success message
    const successEl = document.getElementById('formSuccess');
    successEl.classList.add('visible');

    // Reset form
    form.reset();

    // Scroll to success
    successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Hide success after 6s
    setTimeout(function () {
      successEl.classList.remove('visible');
    }, 6000);
  });
})();


/* ─────────────────────────────────────────────────────────────
   6. FOOTER YEAR
───────────────────────────────────────────────────────────── */
(function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ─────────────────────────────────────────────────────────────
   7. PARALLAX EFFECT — hero video subtle shift on scroll
───────────────────────────────────────────────────────────── */
(function initParallax() {
  const video = document.querySelector('.hero-video');
  if (!video) return;

  function onScroll() {
    const scrolled = window.scrollY;
    // Subtle vertical parallax — moves slower than scroll
    video.style.transform = 'translateY(' + scrolled * 0.3 + 'px)';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ─────────────────────────────────────────────────────────────
   8. DASHBOARD BAR ANIMATION — trigger on visibility
───────────────────────────────────────────────────────────── */
(function initDashboardBars() {
  const dashboard = document.querySelector('.dashboard-mockup');
  if (!dashboard) return;

  let animated = false;

  const observer = new IntersectionObserver(
    function (entries) {
      if (entries[0].isIntersecting && !animated) {
        animated = true;
        const bars = dashboard.querySelectorAll('.dm-bar');
        bars.forEach(function (bar) {
          const targetWidth = bar.style.width;
          bar.style.width = '0';
          requestAnimationFrame(function () {
            bar.style.transition = 'width 1.4s cubic-bezier(.4,0,.2,1)';
            bar.style.width = targetWidth;
          });
        });
        observer.disconnect();
      }
    },
    { threshold: 0.4 }
  );

  observer.observe(dashboard);
})();


/* ─────────────────────────────────────────────────────────────
   9. SERVICE CARDS — subtle tilt effect on hover (desktop)
───────────────────────────────────────────────────────────── */
(function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return; // Skip on touch

  const cards = document.querySelectorAll('.service-card, .advisory-card, .software-card');

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const tiltX  = ((y - cy) / cy) * 4;
      const tiltY  = ((cx - x) / cx) * 4;

      card.style.transform = `translateY(-6px) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });
})();
