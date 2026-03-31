(function () {
  var header = document.querySelector('.site-header');
  var menuToggle = document.querySelector('.menu-toggle');
  var menuLinks = document.querySelectorAll('.primary-nav a');
  var yearEl = document.getElementById('year');

  function setHeaderState() {
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  function closeMenu() {
    if (!header || !menuToggle) return;
    header.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  if (menuToggle && header) {
    menuToggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    menuLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) {
        closeMenu();
      }
    });
  }

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  var revealItems = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealItems.forEach(function (item) {
    observer.observe(item);
  });
})();
