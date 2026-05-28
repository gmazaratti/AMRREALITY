(function () {
  'use strict';

  // ── Config ─────────────────────────────────
  const TARGET_DATE = new Date('2026-06-15T00:00:00Z');

  // ── Random background ─────────────────────
  const backgrounds = ['bg.png', 'bg2.png'];
  const hero = document.getElementById('hero');
  if (hero) {
    const pick = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    hero.style.backgroundImage = `url('${pick}')`;
  }

  // ── Build digit slots ──────────────────────
  function buildDigitSlots(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];

    const slots = [];
    for (let pos = 0; pos < 2; pos++) {
      const slot = document.createElement('div');
      slot.className = 'digit-slot';

      const strip = document.createElement('div');
      strip.className = 'digit-strip';

      for (let d = 0; d <= 9; d++) {
        const span = document.createElement('span');
        span.textContent = d;
        strip.appendChild(span);
      }

      slot.appendChild(strip);
      container.appendChild(slot);
      slots.push({ strip: strip, slot: slot, lastDigit: -1 });
    }
    return slots;
  }

  // Build all digit strips
  const strips = {
    days:    buildDigitSlots('cd-days'),
    hours:   buildDigitSlots('cd-hours'),
    minutes: buildDigitSlots('cd-minutes'),
    seconds: buildDigitSlots('cd-seconds'),
  };

  // ── Get digit height from actual slot element ──
  function getDigitHeight(slotEl) {
    if (!slotEl) return 60;
    var h = slotEl.offsetHeight;
    if (h <= 0) {
      // Fallback: parse computed CSS variable
      var style = getComputedStyle(document.documentElement);
      var raw = style.getPropertyValue('--digit-h').trim();
      h = parseFloat(raw) || 60;
    }
    return h;
  }

  // ── Set a digit strip to a value ───────────
  function setDigit(entry, digit, immediate) {
    var h = getDigitHeight(entry.slot);
    if (immediate) {
      entry.strip.style.transition = 'none';
    } else {
      entry.strip.style.transition = 'transform 0.9s cubic-bezier(0.22, 0.68, 0, 1)';
    }
    entry.strip.style.transform = 'translateY(-' + (digit * h) + 'px)';
    entry.lastDigit = digit;
  }

  // ── Set a two-digit value ──────────────────
  function setValue(key, value, immediate) {
    var tens = Math.floor(value / 10) % 10;
    var ones = value % 10;
    if (strips[key] && strips[key].length === 2) {
      setDigit(strips[key][0], tens, immediate);
      setDigit(strips[key][1], ones, immediate);
    }
  }

  // ── Previous values for change detection ───
  const prev = { days: -1, hours: -1, minutes: -1, seconds: -1 };

  // ── Update countdown ──────────────────────
  function updateCountdown(immediate) {
    const diff = Math.max(0, TARGET_DATE.getTime() - Date.now());

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    const vals = { days: d, hours: h, minutes: m, seconds: s };

    for (const key of Object.keys(vals)) {
      if (vals[key] !== prev[key] || immediate) {
        setValue(key, vals[key], immediate);
        prev[key] = vals[key];
      }
    }
  }

  // ── Recalculate positions (after resize / tab switch) ──
  function recalcPositions() {
    for (const key of Object.keys(strips)) {
      if (strips[key] && strips[key].length === 2) {
        strips[key].forEach(function (entry) {
          if (entry.lastDigit >= 0) {
            var h = getDigitHeight(entry.slot);
            entry.strip.style.transition = 'none';
            entry.strip.style.transform = 'translateY(-' + (entry.lastDigit * h) + 'px)';
          }
        });
      }
    }
  }

  // ── Waitlist form ──────────────────────────
  const form = document.getElementById('waitlist-form');
  const successMsg = document.getElementById('waitlist-success');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('waitlist-email');
      if (email && email.value) {
        form.style.display = 'none';
        if (successMsg) successMsg.classList.add('visible');
      }
    });
  }

  // ── Init ───────────────────────────────────
  requestAnimationFrame(function () {
    updateCountdown(true);
    setTimeout(function () {
      updateCountdown(false);
    }, 50);
  });

  setInterval(function () {
    updateCountdown(false);
  }, 1000);

  // ── Handle tab visibility change ──────────
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      requestAnimationFrame(function () {
        recalcPositions();
        setTimeout(function () {
          updateCountdown(false);
        }, 50);
      });
    }
  });

  // ── Handle resize ─────────────────────────
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      recalcPositions();
    }, 150);
  });

  // ── Hamburger menu ─────────────────────────
  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  // ── Contact dropdown ──────────────────────
  var dropdown = document.getElementById('contact-dropdown');
  if (dropdown) {
    var toggle = dropdown.querySelector('.navbar__dropdown-toggle');
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
      toggle.setAttribute('aria-expanded', dropdown.classList.contains('open'));
    });
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

})();
