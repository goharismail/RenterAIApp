// RenterAI shared header/footer loader
// Loads header.html and footer.html from the root directory

(function () {

  function markActive() {
    const path = window.location.pathname.replace(/\/index\.html$/, '/');
    const hash = window.location.hash;

    document.querySelectorAll('.nav-links a').forEach(function (link) {

      const href = link.getAttribute('href') || '';
      const parts = href.split('#');

      const linkPath = parts[0];
      const linkHash = parts[1] ? '#' + parts[1] : '';

      const samePage =
        linkPath === path ||
        linkPath === window.location.pathname;

      const sameHash =
        linkHash ? linkHash === hash : true;

      if (samePage && sameHash) {
        link.classList.add('active');
      }

    });
  }

  function inject(id, url) {

    const el = document.getElementById(id);

    if (!el) {
      console.warn('Element not found:', id);
      return Promise.resolve();
    }

    return fetch(url)
      .then(function (res) {

        if (!res.ok) {
          throw new Error(
            'Failed to load ' + url + ' - ' + res.status
          );
        }

        return res.text();
      })
      .then(function (html) {

        el.innerHTML = html;

      })
      .catch(function (error) {

        console.error('Header/Footer loading error:', error);

      });
  }

  document.addEventListener('DOMContentLoaded', function () {

    Promise.all([
      inject('site-header', '/header.html'),
      inject('site-footer', '/footer.html')
    ]).then(function () {

      markActive();

    });

  });

})();
