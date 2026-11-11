/* Central Park Mall - site behaviour. No dependencies. */
(function () {
  'use strict';
  var doc = document;

  /* ---------- Sydney time ---------- */
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function sydneyNow() {
    var day = 1, hr = 12;
    try {
      var parts = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      var get = function (t) { for (var i = 0; i < parts.length; i++) { if (parts[i].type === t) return parts[i].value; } return ''; };
      day = DAYS.indexOf(get('weekday'));
      hr = parseInt(get('hour'), 10) + parseInt(get('minute'), 10) / 60;
    } catch (e) { var d = new Date(); day = d.getDay(); hr = d.getHours() + d.getMinutes() / 60; }
    return { day: day, hr: hr };
  }
  var NOW = sydneyNow();

  function fmt(x) {
    if (x >= 24) return x === 24 ? '12am' : (x - 24) + 'am';
    var h = Math.floor(x), m = Math.round((x - h) * 60);
    return (h % 12 || 12) + (m ? ':' + (m < 10 ? '0' : '') + m : '') + (h >= 12 ? 'pm' : 'am');
  }

  /* hours: "24", null, or array of 7 days (Sun first), each null or [[open, close], ...] */
  function hoursStatus(hours) {
    if (hours === '24') return { known: true, open: true, today: 'Open 24 hours, 7 days' };
    if (!hours) return { known: false, open: false, today: 'Hours to be confirmed' };
    var t = hours[NOW.day];
    if (!t || !t.length) return { known: true, open: false, today: 'Closed today' };
    var open = false, txt = [];
    for (var i = 0; i < t.length; i++) {
      if (NOW.hr >= t[i][0] && NOW.hr < t[i][1]) open = true;
      txt.push(fmt(t[i][0]) + '–' + fmt(t[i][1]));
    }
    return { known: true, open: open, today: 'Today ' + txt.join(', ') };
  }

  /* centre status (10am to 8pm daily) */
  var centreOpen = NOW.hr >= 10 && NOW.hr < 20;
  Array.prototype.forEach.call(doc.querySelectorAll('[data-centre-status]'), function (el) {
    el.textContent = centreOpen ? 'Open now' : 'Closed now';
  });
  Array.prototype.forEach.call(doc.querySelectorAll('[data-centre-dot]'), function (el) {
    el.style.background = centreOpen ? '#45d8c9' : '#ee3c66';
  });
  Array.prototype.forEach.call(doc.querySelectorAll('[data-centre-line]'), function (el) {
    el.textContent = centreOpen ? 'The centre is open now, until 8pm.' : (NOW.hr < 10 ? 'The centre opens at 10am today.' : 'The centre has closed for today. Some venues are still open.');
  });

  /* today's row in hours tables */
  Array.prototype.forEach.call(doc.querySelectorAll('[data-day]'), function (row) {
    if (parseInt(row.getAttribute('data-day'), 10) === NOW.day) row.classList.add('today');
  });

  /* ---------- open status on cards ---------- */
  Array.prototype.forEach.call(doc.querySelectorAll('[data-hours]'), function (el) {
    var h;
    try { h = JSON.parse(el.getAttribute('data-hours')); } catch (e) { h = null; }
    var s = hoursStatus(h);
    el.setAttribute('data-open', s.open ? '1' : '0');
    var st = el.querySelector('[data-status]');
    var dot = el.querySelector('[data-dot]');
    var td = el.querySelector('[data-today]');
    if (st) st.textContent = !s.known ? 'Hours TBC' : (s.open ? 'Open now' : 'Closed');
    if (dot) dot.style.background = !s.known ? '#9a9a9a' : (s.open ? '#1aa392' : '#ee3c66');
    if (td) td.textContent = s.today;
  });
  Array.prototype.forEach.call(doc.querySelectorAll('[data-open-count]'), function (el) {
    var scope = doc.querySelector(el.getAttribute('data-open-count'));
    if (scope) el.textContent = scope.querySelectorAll('[data-open="1"]').length;
  });

  /* ---------- header: mega menus, mobile menu, condense ---------- */
  var header = doc.querySelector('.cph');
  if (header) {
    var hdr = header.querySelector('.hdr');
    var items = header.querySelectorAll('.nav-item');
    var closeAll = function () {
      Array.prototype.forEach.call(items, function (it) {
        it.classList.remove('open');
        var b = it.querySelector('.navtog'); if (b) b.setAttribute('aria-expanded', 'false');
      });
    };
    Array.prototype.forEach.call(items, function (it) {
      var btn = it.querySelector('.navtog');
      it.addEventListener('mouseenter', function () { closeAll(); it.classList.add('open'); if (btn) btn.setAttribute('aria-expanded', 'true'); });
      it.addEventListener('mouseleave', function () { it.classList.remove('open'); if (btn) btn.setAttribute('aria-expanded', 'false'); });
      if (btn) btn.addEventListener('click', function (e) {
        e.preventDefault();
        var was = it.classList.contains('open'); closeAll();
        if (!was) { it.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(); closeMobile(); } });
    doc.addEventListener('click', function (e) { if (!header.contains(e.target)) closeAll(); });

    var mm = doc.getElementById('mobile-menu');
    var openBtn = header.querySelector('.burger');
    function closeMobile() { if (mm && !mm.hidden) { mm.hidden = true; doc.body.style.overflow = ''; if (openBtn) { openBtn.setAttribute('aria-expanded', 'false'); openBtn.focus(); } } }
    if (openBtn && mm) {
      openBtn.addEventListener('click', function () { mm.hidden = false; doc.body.style.overflow = 'hidden'; openBtn.setAttribute('aria-expanded', 'true'); var c = mm.querySelector('.mm-close'); if (c) c.focus(); });
      Array.prototype.forEach.call(mm.querySelectorAll('.mm-close'), function (b) { b.addEventListener('click', closeMobile); });
    }
    var onScroll = function () { if (hdr) hdr.classList.toggle('cond', (window.scrollY || 0) > 160); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* ---------- directory filtering ---------- */
  Array.prototype.forEach.call(doc.querySelectorAll('[data-directory]'), function (dir) {
    var cards = dir.querySelectorAll('[data-card]');
    var search = doc.querySelector(dir.getAttribute('data-search') || 'null');
    var chips = doc.querySelectorAll('[data-filter-for="' + dir.id + '"] [data-filter]');
    var openToggle = doc.querySelector('[data-open-only-for="' + dir.id + '"]');
    var note = doc.querySelector('[data-note-for="' + dir.id + '"]');
    var empty = doc.querySelector('[data-empty-for="' + dir.id + '"]');
    var state = { cat: 'All', q: '', openOnly: false };
    var params = new URLSearchParams(window.location.search);
    if (params.get('category')) state.cat = params.get('category');

    function apply() {
      var n = 0;
      Array.prototype.forEach.call(cards, function (c) {
        var cats = (c.getAttribute('data-cats') || '').split('|');
        var late = c.getAttribute('data-late') === '1';
        var hay = (c.getAttribute('data-kw') || '').toLowerCase();
        var ok = (state.cat === 'All' || (state.cat === 'Open late' ? late : cats.indexOf(state.cat) > -1)) &&
                 (!state.q || hay.indexOf(state.q) > -1) &&
                 (!state.openOnly || c.getAttribute('data-open') === '1');
        c.hidden = !ok; if (ok) n++;
      });
      Array.prototype.forEach.call(chips, function (ch) {
        var on = ch.getAttribute('data-filter') === state.cat;
        ch.classList.toggle('on', on); ch.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (note) note.textContent = 'Showing ' + n + (n === 1 ? ' place' : ' places') + (state.cat !== 'All' ? ' · ' + state.cat : '') + (state.openOnly ? ', open now' : '') + '.';
      if (empty) empty.hidden = n > 0;
    }
    Array.prototype.forEach.call(chips, function (ch) {
      ch.addEventListener('click', function () {
        state.cat = ch.getAttribute('data-filter');
        var u = new URL(window.location.href);
        if (state.cat === 'All') u.searchParams.delete('category'); else u.searchParams.set('category', state.cat);
        history.replaceState(null, '', u.toString());
        apply();
      });
    });
    if (search) search.addEventListener('input', function () { state.q = search.value.trim().toLowerCase(); apply(); });
    if (openToggle) openToggle.addEventListener('click', function () {
      state.openOnly = !state.openOnly;
      openToggle.setAttribute('aria-pressed', state.openOnly ? 'true' : 'false');
      var sw = openToggle.querySelector('.sw'); if (sw) sw.classList.toggle('on', state.openOnly);
      apply();
    });
    Array.prototype.forEach.call(doc.querySelectorAll('[data-reset-for="' + dir.id + '"]'), function (b) {
      b.addEventListener('click', function () { state = { cat: 'All', q: '', openOnly: false }; if (search) search.value = ''; if (openToggle) { openToggle.setAttribute('aria-pressed', 'false'); var sw = openToggle.querySelector('.sw'); if (sw) sw.classList.remove('on'); } apply(); });
    });
    apply();
  });

  /* ---------- tab groups (events/offers, cravings) ---------- */
  Array.prototype.forEach.call(doc.querySelectorAll('[data-tabs]'), function (grp) {
    var target = doc.querySelector(grp.getAttribute('data-tabs'));
    var mode = grp.getAttribute('data-mode') || 'kind';
    var btns = grp.querySelectorAll('button[data-tab]');
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-tab');
        Array.prototype.forEach.call(btns, function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        if (!target) return;
        Array.prototype.forEach.call(target.querySelectorAll('[data-' + mode + ']'), function (el) {
          el.hidden = !(v === 'All' || el.getAttribute('data-' + mode) === v);
        });
      });
    });
  });

  /* ---------- homepage quick finder ---------- */
  var finder = doc.getElementById('finder-input');
  var dataEl = doc.getElementById('tenant-data');
  if (finder && dataEl) {
    var T = JSON.parse(dataEl.textContent);
    var out = doc.getElementById('finder-results');
    var note = doc.getElementById('finder-note');
    var cat = 'All';
    var COLORS = { Shop: '#fdb813', Eat: '#ee3c66', Play: '#bed62f' };
    var render = function () {
      var q = finder.value.trim().toLowerCase();
      var list = T.filter(function (t) {
        return (cat === 'All' || (cat === 'Open late' ? t.late : t.section === cat)) && (!q || (t.name + ' ' + t.kw).toLowerCase().indexOf(q) > -1);
      });
      out.innerHTML = '';
      list.slice(0, 8).forEach(function (t) {
        var a = doc.createElement('a'); a.className = 'res'; a.href = t.url;
        var l = doc.createElement('span'); var b = doc.createElement('b'); b.textContent = t.name; var s = doc.createElement('small'); s.textContent = t.where + (t.late ? ' · Open late' : '');
        l.appendChild(b); l.appendChild(s);
        var tag = doc.createElement('span'); tag.className = 'tag'; tag.style.background = COLORS[t.section]; tag.textContent = t.section;
        a.appendChild(l); a.appendChild(tag); out.appendChild(a);
      });
      note.textContent = list.length ? 'Showing ' + Math.min(8, list.length) + ' of ' + list.length + (cat === 'All' && !q ? ' places in the centre.' : ' matches.') : 'No matches yet. Try a cuisine, a store name or "late".';
    };
    finder.addEventListener('input', render);
    Array.prototype.forEach.call(doc.querySelectorAll('[data-finder-chip]'), function (ch, i, all) {
      ch.addEventListener('click', function () {
        cat = ch.getAttribute('data-finder-chip');
        Array.prototype.forEach.call(all, function (x) { var on = x === ch; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        render();
      });
    });
  }

  /* ---------- forms (front end only; see README to connect a handler) ---------- */
  Array.prototype.forEach.call(doc.querySelectorAll('form[data-form]'), function (f) {
    f.addEventListener('submit', function (e) {
      if (f.getAttribute('action') && f.getAttribute('action') !== '#') return; // real endpoint configured
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var thanks = doc.getElementById(f.getAttribute('data-form'));
      if (thanks) { f.hidden = true; thanks.hidden = false; thanks.focus(); }
    });
  });
})();
