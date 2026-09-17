(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     Footer year
     ---------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------
     Mobile menu toggle
     ---------------------------------------------------------- */
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  function closeMobileMenu() {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  }
  function openMobileMenu() {
    mobileMenu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
  }
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      var isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMobileMenu() : openMobileMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobileMenu.hidden) closeMobileMenu();
    });
  }

  /* ----------------------------------------------------------
     Scroll-spy: highlight active nav link + progress bar
     ---------------------------------------------------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main .section'));
  var sideLinks = document.querySelectorAll('.side-nav__link');
  var mobileLinks = document.querySelectorAll('.mobile-menu__list a');
  var progressFill = document.getElementById('navProgressFill');

  function setActive(id) {
    sideLinks.forEach(function (l) {
      l.classList.toggle('is-active', l.dataset.section === id);
    });
    mobileLinks.forEach(function (l) {
      l.classList.toggle('is-active', l.dataset.section === id);
    });
  }

  /* ----------------------------------------------------------
     Programs tabs (Buena Onda / IThinkBig)
     ---------------------------------------------------------- */
  var currentProgramTab = 'buena-onda';
  var programTabs = document.querySelectorAll('.programs__tab');
  var programPanels = document.querySelectorAll('.programs__panel');

  function selectProgramTab(id) {
    currentProgramTab = id;
    programTabs.forEach(function (tab) {
      var isActive = tab.dataset.program === id;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });
    programPanels.forEach(function (panel) {
      var isActive = panel.id === 'panel-' + id;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });
    setActive(id);
  }

  programTabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectProgramTab(tab.dataset.program); });
    tab.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      var next = programTabs[e.key === 'ArrowRight' ? (i + 1) % programTabs.length : (i - 1 + programTabs.length) % programTabs.length];
      next.focus();
      selectProgramTab(next.dataset.program);
    });
  });

  // Side-nav / mobile-menu links for Buena Onda & IThinkBig both point at
  // #programs — clicking one should also pre-select the matching tab.
  document.querySelectorAll('.side-nav__link[data-section], .mobile-menu__list a[data-section]').forEach(function (link) {
    if (link.dataset.section === 'buena-onda' || link.dataset.section === 'ithinkbig') {
      link.addEventListener('click', function () { selectProgramTab(link.dataset.section); });
    }
  });

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // The Programs section holds two nav links (Buena Onda / IThinkBig)
        // sharing one #programs target — highlight whichever tab is showing.
        setActive(entry.target.id === 'programs' ? currentProgramTab : entry.target.id);
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  function updateProgress() {
    if (!progressFill) return;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    progressFill.style.height = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ----------------------------------------------------------
     Reveal-on-scroll
     ---------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ----------------------------------------------------------
     Team carousels
     ---------------------------------------------------------- */
  document.querySelectorAll('[data-carousel-controls]').forEach(function (controls) {
    var key = controls.dataset.carouselControls;
    var carousel = document.getElementById(key === 'onda' ? 'ondaCarousel' : 'bigCarousel');
    if (!carousel) return;
    controls.querySelectorAll('.carousel-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = parseInt(btn.dataset.dir, 10);
        carousel.scrollBy({ left: dir * 240, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });
  });

  /* ----------------------------------------------------------
     Contact form — client-side validation + mailto fallback.
     No backend is wired up: replace the ORG_EMAIL below (or
     swap this handler for a service like Formspree/Netlify
     Forms) to receive submissions directly.
     ---------------------------------------------------------- */
  var ORG_EMAIL = 'hello@inspiretheyoung.org';
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');

  function showError(fieldName, message) {
    var field = form.querySelector('[name="' + fieldName + '"]');
    var errorEl = form.querySelector('[data-error-for="' + fieldName + '"]');
    if (field) field.closest('.field').classList.toggle('has-error', !!message);
    if (errorEl) errorEl.textContent = message || '';
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var topic = form.topic.value;
      var valid = true;

      showError('name', ''); showError('email', ''); showError('message', '');

      if (!name) { showError('name', 'Please enter your name.'); valid = false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('email', 'Please enter a valid email address.'); valid = false;
      }
      if (!message) { showError('message', 'Please add a short message.'); valid = false; }

      if (!valid) {
        statusEl.textContent = 'Please fix the highlighted fields.';
        statusEl.dataset.state = 'error';
        return;
      }

      var subject = encodeURIComponent('[Inspire the Young] ' + topic + ' — message from ' + name);
      var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      var mailtoLink = 'mailto:' + ORG_EMAIL + '?subject=' + subject + '&body=' + body;

      window.location.href = mailtoLink;
      statusEl.dataset.state = 'ok';
      statusEl.textContent = 'Opening your email app to send this to our team…';
      form.reset();
    });
  }

})();
