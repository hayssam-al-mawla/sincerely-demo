// Sincerely concept site: menus, the rotating sign-off, episode search, and preview-only forms.

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

  // Dropdown menus: hover and focus open them in CSS; the caret button covers touch and keyboard.
  var items = document.querySelectorAll('.nav__item');
  function closeMenus(except) {
    items.forEach(function (item) {
      if (item === except) return;
      item.classList.remove('is-open');
      var caret = item.querySelector('.nav__caret');
      if (caret) caret.setAttribute('aria-expanded', 'false');
    });
  }
  items.forEach(function (item) {
    var caret = item.querySelector('.nav__caret');
    if (!caret) return;
    caret.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      caret.setAttribute('aria-expanded', open ? 'true' : 'false');
      closeMenus(item);
    });
  });
  document.addEventListener('click', function (event) {
    if (!event.target.closest || !event.target.closest('.nav__item')) closeMenus(null);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenus(null);
  });

  // Finding a conversation on the show page, by words and by theme.
  var list = document.getElementById('ep-list');
  var search = document.getElementById('ep-search');
  if (list && search) {
    var status = document.getElementById('ep-status');
    var chips = document.querySelectorAll('.chip');
    var tag = '';
    var applyFilter = function () {
      var words = search.value.trim().toLowerCase();
      var shown = 0;
      list.querySelectorAll('.ep').forEach(function (ep) {
        var matchesWords = !words || ep.getAttribute('data-search').indexOf(words) !== -1;
        var matchesTag = !tag || ('|' + ep.getAttribute('data-tags') + '|').indexOf('|' + tag + '|') !== -1;
        ep.hidden = !(matchesWords && matchesTag);
        if (!ep.hidden) shown += 1;
      });
      if (!words && !tag) status.textContent = '';
      else if (shown === 0) status.textContent = 'No conversations match. Try a guest name, or clear the search.';
      else status.textContent = shown + (shown === 1 ? ' conversation found.' : ' conversations found.');
    };
    search.addEventListener('input', applyFilter);
    chips.forEach(function (chip) {
      chip.setAttribute('aria-pressed', chip.classList.contains('is-on') ? 'true' : 'false');
      chip.addEventListener('click', function () {
        tag = chip.getAttribute('data-tag');
        chips.forEach(function (other) {
          other.classList.toggle('is-on', other === chip);
          other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
        });
        applyFilter();
      });
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
