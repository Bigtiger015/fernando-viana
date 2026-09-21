/* Conteúdo e propostas no HTML. JS aprimora somente os controles. */
(function () {
  var button = document.querySelector('.topo__menu');
  var menu = document.getElementById('menu');
  var mobile = window.matchMedia('(max-width: 767px)');
  var veil;
  var savedOverflow;
  var main = document.querySelector('main');
  var footer = document.querySelector('footer');
  var review = document.querySelector('.revisao');
  var otherRegions = [main, footer, review].filter(Boolean);
  function isOpen() { return menu && menu.classList.contains('aberto'); }
  function close(returnFocus) {
    if (!isOpen()) return;
    menu.classList.remove('aberto');
    veil.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Abrir menu');
    document.body.style.overflow = savedOverflow || '';
    otherRegions.forEach(function (el) { el.inert = false; });
    if (returnFocus) button.focus();
  }
  if (button && menu) {
    veil = document.createElement('div');
    veil.className = 'veu';
    veil.hidden = true;
    veil.setAttribute('aria-hidden', 'true');
    menu.parentNode.appendChild(veil);
    button.hidden = false;
    button.setAttribute('aria-label', 'Abrir menu');
    button.addEventListener('click', function () {
      if (isOpen()) { close(true); return; }
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      menu.classList.add('aberto');
      veil.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Fechar menu');
      otherRegions.forEach(function (el) { el.inert = true; });
      menu.querySelector('a').focus();
    });
    veil.addEventListener('click', function () { close(true); });
    menu.addEventListener('click', function (event) {
      var link = event.target.closest('a');
      if (!link) return;
      close(false);
      if (link.hash && link.pathname === window.location.pathname) {
        var target = document.querySelector(link.hash);
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          target.addEventListener('blur', function () { target.removeAttribute('tabindex'); }, { once: true });
        }
      }
    });
    document.addEventListener('keydown', function (event) {
      if (!isOpen()) return;
      if (event.key === 'Escape') { close(true); return; }
      if (event.key !== 'Tab') return;
      var links = Array.from(menu.querySelectorAll('a'));
      var controls = links.concat(button);
      var i = controls.indexOf(document.activeElement);
      event.preventDefault();
      var next = event.shiftKey ? (i <= 0 ? controls.length - 1 : i - 1) : (i + 1) % controls.length;
      controls[next].focus();
    });
    mobile.addEventListener('change', function () { close(false); });
  }
  var expand = document.querySelector('.expandir');
  var groups = Array.from(document.querySelectorAll('.eixo'));
  if (expand && groups.length) {
    expand.hidden = false;
    var refresh = function () {
      var allOpen = groups.every(function (group) { return group.open; });
      expand.innerHTML = allOpen ? 'Fechar todas <span aria-hidden="true">−</span>' : 'Abrir todas <span aria-hidden="true">+</span>';
      expand.setAttribute('aria-label', allOpen ? 'Fechar todos os eixos de propostas' : 'Abrir todos os eixos de propostas');
    };
    expand.addEventListener('click', function () {
      var allOpen = groups.every(function (group) { return group.open; });
      groups.forEach(function (group) { group.open = !allOpen; });
      refresh();
    });
    groups.forEach(function (group) { group.addEventListener('toggle', refresh); });
    refresh();
  }
  /* Movimento: marca o que entrou na tela e só então carrega o vídeo decorativo. */
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var alvos = Array.from(document.querySelectorAll('[data-anima]'));
  if ('IntersectionObserver' in window && alvos.length) {
    var olho = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        var el = en.target;
        var video = el.querySelector('video[data-src]');
        if (en.isIntersecting) {
          el.classList.add('visto');
          if (video && !calmo) {
            if (!video.src) video.src = video.dataset.src;
            var p = video.play(); if (p && p.catch) p.catch(function () {});
          }
        } else if (video && video.src) { video.pause(); }
      });
    }, { threshold: 0.3 });
    alvos.forEach(function (el) { olho.observe(el); });
  } else { alvos.forEach(function (el) { el.classList.add('visto'); }); }
  document.documentElement.classList.replace('sem-js', 'com-js');
})();
