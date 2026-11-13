// Sincerely concept site: menu, the rotating sign-off, and preview-only forms.

(function () {
  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  // The sign-off: "Sincerely, Katherine." / "Sincerely, Human." / "Sincerely, yours."
  var word = document.querySelector('.signoff__word');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (word && !reduce) {
    var words = (word.getAttribute('data-words') || '').split('|').filter(Boolean);
    var i = 0;
    if (words.length > 1) {
      setInterval(function () {
        if (document.hidden) return;
        word.classList.add('is-leaving');
        setTimeout(function () {
          i = (i + 1) % words.length;
          word.textContent = words[i];
          word.classList.remove('is-leaving');
          word.classList.add('is-entering');
          // Force a reflow so the entering position applies before the transition runs.
          void word.offsetWidth;
          word.classList.remove('is-entering');
        }, 450);
      }, 3200);
    }
  }

  // Forms are for show in this preview: nothing leaves the browser.
  document.querySelectorAll('form[data-preview]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var note = form.querySelector('.form-note');
      if (note) note.textContent = form.getAttribute('data-preview');
      form.reset();
    });
  });
})();
