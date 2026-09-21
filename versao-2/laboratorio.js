/* Preferência de movimento e pequenos aprimoramentos da cópia. */
(function () {
  'use strict';
  var root = document.documentElement;
  var button = document.querySelector('.movimento');
  var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  var manualPause = false;
  var videos = Array.from(document.querySelectorAll('video[data-lab-video]'));
  var hero = document.querySelector('.hero');
  var finePointer = window.matchMedia('(pointer: fine)');
  var tick = 0;
  function isPaused() { return preference.matches || manualPause || document.hidden; }
  function updateVideos() {
    videos.forEach(function (video) {
      if (isPaused() || !video.dataset.visible || (navigator.connection && navigator.connection.saveData)) {
        video.pause();
        return;
      }
      if (!video.getAttribute('src')) video.src = video.dataset.labVideo;
      var promise = video.play();
      if (promise) promise.catch(function () {});
    });
  }
  function updateMotion() {
    var paused = preference.matches || manualPause;
    root.classList.toggle('motion-off', paused);
    if (button) {
      var label = paused ? 'Ativar movimento' : 'Pausar movimento';
      if (preference.matches) label = 'Movimento reduzido conforme seu sistema';
      button.setAttribute('aria-pressed', String(paused));
      button.setAttribute('aria-label', label);
      button.title = label;
      button.querySelector('.movimento__texto').textContent = label;
      button.querySelector('.movimento__icone').textContent = paused ? '▷' : 'Ⅱ';
      button.disabled = preference.matches;
    }
    if (paused && hero) { hero.style.removeProperty('--foto-x'); hero.style.removeProperty('--foto-y'); }
    updateVideos();
  }
  if (button) {
    button.hidden = false;
    button.addEventListener('click', function () { manualPause = !manualPause; updateMotion(); });
  }
  preference.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateVideos);
  updateMotion();
  if ('IntersectionObserver' in window) {
    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.dataset.visible = 'true';
        else delete entry.target.dataset.visible;
      });
      updateVideos();
    }, { threshold: 0.12 });
    videos.forEach(function (video) { videoObserver.observe(video); });
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.topo__nav a').forEach(function (link) {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (section) { sectionObserver.observe(section); });
  }
  if (hero) {
    hero.addEventListener('pointermove', function (event) {
      if (isPaused() || !finePointer.matches || tick) return;
      tick = requestAnimationFrame(function () {
        var box = hero.getBoundingClientRect();
        hero.style.setProperty('--foto-x', (((event.clientX - box.left) / box.width - 0.5) * 9).toFixed(2) + 'px');
        hero.style.setProperty('--foto-y', (((event.clientY - box.top) / box.height - 0.5) * 6).toFixed(2) + 'px');
        tick = 0;
      });
    });
    hero.addEventListener('pointerleave', function () { hero.style.removeProperty('--foto-x'); hero.style.removeProperty('--foto-y'); });
  }
})();
