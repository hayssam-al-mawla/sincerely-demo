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

  // ---------- The memoir: the book turns a little toward the pointer ----------

  var tome = document.querySelector('[data-tome]');
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (tome && !reduceMotion && finePointer) {
    var tomeStage = tome.closest('section');
    var between = function (value, low, high) { return Math.max(low, Math.min(high, value)); };
    tomeStage.addEventListener('pointermove', function (event) {
      var box = tome.getBoundingClientRect();
      var x = (event.clientX - (box.left + box.width / 2)) / window.innerWidth;
      var y = (event.clientY - (box.top + box.height / 2)) / window.innerHeight;
      // It never turns far enough to hide its pages or show its back.
      tome.style.setProperty('--ry', between(-27 + x * 38, -44, -8).toFixed(1) + 'deg');
      tome.style.setProperty('--rx', between(-5 - y * 16, -12, 1).toFixed(1) + 'deg');
      tome.style.setProperty('--shine', between(62 - x * 130, 0, 100).toFixed(0) + '%');
    });
    tomeStage.addEventListener('pointerleave', function () {
      tome.style.removeProperty('--ry');
      tome.style.removeProperty('--rx');
      tome.style.removeProperty('--shine');
    });
  }

  // ---------- The memoir: a sample of the audiobook ----------

  document.querySelectorAll('[data-sample]').forEach(function (sample) {
    var audio = sample.querySelector('audio');
    var ui = sample.querySelector('.sample__ui');
    var button = sample.querySelector('.sample__play');
    var seek = sample.querySelector('.sample__seek');
    var now = sample.querySelector('[data-sample-now]');
    var total = sample.querySelector('[data-sample-total]');
    var fail = sample.querySelector('.sample__fail');
    if (!audio || !ui || !button || !seek) return;

    function clock(seconds) {
      seconds = Math.max(0, Math.floor(seconds));
      return Math.floor(seconds / 60) + ':' + ('0' + (seconds % 60)).slice(-2);
    }
    function paint() {
      var length = isFinite(audio.duration) && audio.duration ? audio.duration : Number(seek.max);
      seek.max = Math.round(length);
      seek.value = audio.currentTime;
      seek.style.setProperty('--played', (audio.currentTime / length * 100).toFixed(2) + '%');
      seek.setAttribute('aria-valuetext', clock(audio.currentTime) + ' of ' + clock(length));
      if (now) now.textContent = clock(audio.currentTime);
      if (total) total.textContent = clock(length);
    }
    function state() {
      var playing = !audio.paused && !audio.ended;
      sample.classList.toggle('is-playing', playing);
      button.setAttribute('aria-label', playing ? 'Pause the sample' : 'Play the sample');
    }

    // The browser's own player is the fallback; with scripts on, ours takes its place.
    audio.removeAttribute('controls');
    ui.hidden = false;
    button.addEventListener('click', function () {
      if (audio.paused) {
        var started = audio.play();
        if (started && started.catch) started.catch(function () {});
      } else {
        audio.pause();
      }
    });
    seek.addEventListener('input', function () {
      audio.currentTime = Number(seek.value);
      paint();
    });
    ['play', 'pause', 'ended'].forEach(function (name) { audio.addEventListener(name, state); });
    ['timeupdate', 'loadedmetadata', 'ended'].forEach(function (name) { audio.addEventListener(name, paint); });
    audio.addEventListener('error', function () {
      ui.hidden = true;
      if (fail) fail.hidden = false;
    });
    // On a phone's lock screen the sample shows the audiobook's cover and Katherine's name.
    if ('mediaSession' in navigator && window.MediaMetadata) {
      audio.addEventListener('play', function () {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: 'Sincerely, Katherine. A sample of the audiobook',
          artist: 'Katherine Dudtschak',
          artwork: [{ src: new URL('assets/img/book-audio.webp', document.baseURI).href, sizes: '668x668', type: 'image/webp' }]
        });
      });
    }
    // Starting a video quiets the sample, so the two never talk over each other.
    document.querySelectorAll('a.video[data-video]').forEach(function (link) {
      link.addEventListener('click', function () { audio.pause(); });
    });
    paint();
  });

  // ---------- The memoir: on a small screen the publisher's description folds, and the praise scrolls sideways ----------

  document.querySelectorAll('[data-more]').forEach(function (block) {
    var button = block.querySelector('[data-more-button]');
    var rest = block.querySelector('[data-more-rest]');
    if (!button || !rest) return;
    // The stylesheet only folds it below tablet width; wider screens show everything.
    block.classList.add('is-folded');
    button.hidden = false;
    button.addEventListener('click', function () {
      block.classList.remove('is-folded');
      button.hidden = true;
      rest.setAttribute('tabindex', '-1');
      rest.focus({ preventScroll: true });
    });
  });

  var praiseRows = document.querySelectorAll('.praise-columns');
  function reachRows() {
    // A row that scrolls sideways has to be reachable from the keyboard; when it is a plain column it is not a stop.
    praiseRows.forEach(function (row) {
      if (row.scrollWidth > row.clientWidth + 4) {
        row.tabIndex = 0;
        row.setAttribute('role', 'group');
        row.setAttribute('aria-label', 'More words from readers, in a row that scrolls sideways');
      } else {
        row.removeAttribute('tabindex');
        row.removeAttribute('role');
        row.removeAttribute('aria-label');
      }
    });
  }
  if (praiseRows.length) {
    reachRows();
    window.addEventListener('resize', reachRows);
  }

  // ---------- The memoir: choosing an edition ----------

  document.querySelectorAll('[data-editions]').forEach(function (picker) {
    var tablist = picker.querySelector('[role="tablist"]');
    var tabs = Array.prototype.slice.call(picker.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(picker.querySelectorAll('[data-edition]'));
    var pictures = picker.querySelectorAll('[data-edition-image]');
    if (!tablist || !tabs.length) return;

    function choose(tab, focus) {
      var id = tab.getAttribute('aria-controls');
      tabs.forEach(function (other) {
        var on = other === tab;
        other.setAttribute('aria-selected', on ? 'true' : 'false');
        other.tabIndex = on ? 0 : -1;
        other.classList.toggle('is-on', on);
      });
      panels.forEach(function (panel) { panel.hidden = panel.id !== id; });
      pictures.forEach(function (picture) {
        picture.classList.toggle('is-on', 'edition-' + picture.getAttribute('data-edition-image') === id);
      });
      if (focus) tab.focus();
    }
    function fromAddress() {
      var wanted = window.location.hash.slice(1);
      var tab = tabs.filter(function (t) { return t.getAttribute('aria-controls') === wanted; })[0];
      if (tab) choose(tab, false);
      return !!tab;
    }

    panels.forEach(function (panel) {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', 'tab-' + panel.getAttribute('data-edition'));
    });
    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { choose(tab, false); });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = tabs[(index + 1) % tabs.length];
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === 'Home') next = tabs[0];
        if (event.key === 'End') next = tabs[tabs.length - 1];
        if (next) { event.preventDefault(); choose(next, true); }
      });
    });
    picker.classList.add('is-picker');
    tablist.hidden = false;
    // An edition can be linked to directly, e.g. book.html#edition-signed
    if (!fromAddress()) choose(tabs[0], false);
    window.addEventListener('hashchange', fromAddress);
  });

  // ---------- The memoir: a name on the title page of a signed copy ----------

  document.querySelectorAll('[data-inscribe]').forEach(function (form) {
    var input = form.querySelector('[data-inscribe-name]');
    var out = form.querySelector('[data-inscribe-out]');
    if (!input || !out) return;
    var unwritten = out.textContent;
    function write() {
      var name = input.value.replace(/\s+/g, ' ').trim();
      out.textContent = name ? 'For ' + name + ',' : unwritten;
    }
    input.addEventListener('input', write);
    // The preview form clears itself after a pretend send; the page goes back to "For you,".
    form.addEventListener('reset', function () { setTimeout(write, 0); });
  });

  // ---------- The memoir: the shelf names whichever spine is under the pointer ----------

  document.querySelectorAll('[data-shelf]').forEach(function (shelf) {
    var caption = shelf.querySelector('[data-shelf-caption]');
    if (!caption) return;
    var resting = caption.textContent;
    function name(spine) {
      caption.textContent = spine ? spine.getAttribute('data-caption') : resting;
      caption.classList.toggle('is-title', !!spine);
    }
    shelf.querySelectorAll('[data-caption]').forEach(function (spine) {
      spine.addEventListener('pointerenter', function (event) {
        if (event.pointerType === 'mouse') name(spine);
      });
      spine.addEventListener('pointerleave', function () { name(null); });
      spine.addEventListener('focus', function () { name(spine); });
      spine.addEventListener('blur', function () { name(null); });
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
