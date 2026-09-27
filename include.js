// RenterAI shared header/footer loader
// Injects /partials/header.html and /partials/footer.html into any page
// that has <div id="site-header"></div> and <div id="site-footer"></div>

(function () {
  function markActive() {
    const path = window.location.pathname.replace(/\/index\.html$/, '/');
    const hash = window.location.hash; // e.g. #tools or #how
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      const linkPath = link.getAttribute('href').split('#')[0];
      const linkHash = link.getAttribute('href').includes('#') ? '#' + link.getAttribute('href').split('#')[1] : '';
      const samePage = linkPath === path || linkPath === window.location.pathname;
      const sameHash = linkHash ? linkHash === hash : true;
      if (samePage && (linkHash ? sameHash : true)) {
        link.classList.add('active');
      }
    });
  }

  function inject(id, url) {
    const el = document.getElementById(id);
    if (!el) return Promise.resolve();
    return fetch(url)
      .then(function (res) { return res.text(); })
      .then(function (html) { el.innerHTML = html; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Promise.all([
      inject('site-header', '/partials/header.html'),
      inject('site-footer', '/partials/footer.html')
    ]).then(markActive);
  });
})();
