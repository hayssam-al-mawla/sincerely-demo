// Sincerely concept site.
// Everything here is an enhancement: with scripts off, the menus are plain links,
// videos open on YouTube, stories show in full and the lists show every item.

(function () {
  'use strict';

  // ---------- Menus ----------

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  // Dropdowns open on hover and focus in CSS; the caret button covers touch and keyboard.
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
    if (!event.target.closest('.nav__item')) closeMenus(null);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenus(null);
  });

  // ---------- The sign-off: "Sincerely, Katherine." / "Human." / "yours." ----------

  var word = document.querySelector('.signoff__word');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (word && !reduceMotion) {
    var words = (word.getAttribute('data-words') || '').split('|').filter(Boolean);
    var index = 0;
    if (words.length > 1) {
      setInterval(function () {
        if (document.hidden) return;
        word.classList.add('is-leaving');
        setTimeout(function () {
          index = (index + 1) % words.length;
          word.textContent = words[index];
          word.classList.remove('is-leaving');
          word.classList.add('is-entering');
          // Force a reflow so the entering position applies before the transition runs.
          void word.offsetWidth;
          word.classList.remove('is-entering');
        }, 450);
      }, 3200);
    }
  }

  // ---------- Finding things: the show's episodes and the library ----------

  document.querySelectorAll('[data-finder]').forEach(function (finder) {
    var input = finder.querySelector('[data-finder-input]');
    var status = finder.querySelector('[data-finder-status]');
    var things = finder.querySelectorAll('[data-findable]');
    var noun = finder.getAttribute('data-finder') || 'result';
    var plural = finder.getAttribute('data-finder-plural') || noun + 's';
    var picked = {};

    function apply() {
      var words = input.value.trim().toLowerCase();
      var shown = 0;
      things.forEach(function (thing) {
        var ok = !words || thing.getAttribute('data-search').indexOf(words) !== -1;
        Object.keys(picked).forEach(function (group) {
          if (!picked[group]) return;
          var values = '|' + (thing.getAttribute('data-' + group) || '') + '|';
          if (values.indexOf('|' + picked[group] + '|') === -1) ok = false;
        });
        thing.hidden = !ok;
        if (ok) shown += 1;
      });
      var filtering = words || Object.keys(picked).some(function (group) { return picked[group]; });
      if (!filtering) status.textContent = '';
      else if (shown === 0) status.textContent = 'Nothing matches. Try another word or a different filter.';
      else status.textContent = shown + ' ' + (shown === 1 ? noun : plural) + ' found.';
    }

    input.addEventListener('input', apply);
    finder.querySelectorAll('[data-chip-group]').forEach(function (groupEl) {
      var group = groupEl.getAttribute('data-chip-group');
      var chips = groupEl.querySelectorAll('.chip');
      chips.forEach(function (chip) {
        chip.setAttribute('aria-pressed', chip.classList.contains('is-on') ? 'true' : 'false');
        chip.addEventListener('click', function () {
          picked[group] = chip.getAttribute('data-value');
          chips.forEach(function (other) {
            other.classList.toggle('is-on', other === chip);
            other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
          });
          apply();
        });
      });
    });

    // A search can arrive in the address, e.g. library.html?q=grief
    var query = new URLSearchParams(window.location.search).get('q');
    if (query) { input.value = query; apply(); }

    // "/" jumps to the search box, as on most libraries.
    document.addEventListener('keydown', function (event) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (event.key === '/' && !typing) { event.preventDefault(); input.focus(); }
    });
  });

  // ---------- Videos load only when asked for ----------

  document.querySelectorAll('a.video[data-video]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      // Let a modified click (new tab, new window) go to YouTube as a normal link.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + link.getAttribute('data-video') + '?autoplay=1&rel=0';
      frame.title = link.getAttribute('aria-label') || 'Video';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      var holder = document.createElement('div');
      holder.className = 'video';
      holder.appendChild(frame);
      link.replaceWith(holder);
      frame.focus();
    });
  });

  // ---------- Long stories open on request ----------

  document.querySelectorAll('.story[data-clamp]').forEach(function (story) {
    var button = story.querySelector('.story__toggle');
    var rest = story.querySelector('.story__rest');
    if (!button || !rest) return;
    story.classList.add('is-clamped');
    button.hidden = false;
    button.addEventListener('click', function () {
      story.classList.remove('is-clamped');
      button.hidden = true;
      rest.setAttribute('tabindex', '-1');
      rest.focus({ preventScroll: true });
    });
  });

  // ---------- Diagrams and their legends highlight each other ----------

  document.querySelectorAll('.explorer').forEach(function (explorer) {
    function show(key) {
      explorer.classList.toggle('has-active', !!key);
      explorer.querySelectorAll('[data-part], [data-for]').forEach(function (el) {
        var mine = el.getAttribute('data-part') || el.getAttribute('data-for');
        el.classList.toggle('is-active', !!key && mine === key);
      });
    }
    explorer.querySelectorAll('[data-part], [data-for]').forEach(function (el) {
      var key = el.getAttribute('data-part') || el.getAttribute('data-for');
      el.addEventListener('pointerenter', function () { show(key); });
      el.addEventListener('focus', function () { show(key); });
      el.addEventListener('click', function () { show(key); });
    });
    explorer.addEventListener('pointerleave', function () { show(null); });
    explorer.addEventListener('focusout', function (event) {
      if (!explorer.contains(event.relatedTarget)) show(null);
    });
  });

  // ---------- The guest book: a guest's cover appears beside their name ----------

  var peek = null;
  function placePeek(event) {
    if (!peek) return;
    var x = Math.min(window.innerWidth - 152, event.clientX + 18);
    var y = Math.max(8, event.clientY - 152);
    peek.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }
  document.querySelectorAll('.guestbook__names a[data-thumb]').forEach(function (name) {
    name.addEventListener('pointerenter', function (event) {
      if (event.pointerType !== 'mouse') return;
      if (!peek) {
        peek = document.createElement('img');
        peek.className = 'peek';
        peek.alt = '';
        document.body.appendChild(peek);
      }
      peek.src = name.getAttribute('data-thumb');
      placePeek(event);
      peek.classList.add('is-on');
    });
    name.addEventListener('pointermove', placePeek);
    name.addEventListener('pointerleave', function () {
      if (peek) peek.classList.remove('is-on');
    });
  });

  // ---------- Forms are for show in this preview: nothing leaves the browser ----------

  document.querySelectorAll('form[data-preview]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var note = form.querySelector('.form-note');
      if (note) note.textContent = form.getAttribute('data-preview');
      form.reset();
    });
  });
})();
