/* ============================================================
   QUE TAL CONGELADOS — site.js
   Vanilla JS: WhatsApp, Pixel events, FAB, scroll, consent gate
   ============================================================ */

(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────────── */
  var WPP_NUMBER = '5571996550630';
  var WPP_MESSAGE = 'Olá! Vim pelo site e quero fazer um pedido.';
  var PIXEL_ID = '338300610511977';

  /* ── Cookie helper (substitui js-cookie) ─────────────────── */
  var Cookie = {
    get: function (name) {
      var match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    },
    set: function (name, value, days) {
      var expires = '';
      if (days) {
        var d = new Date();
        d.setTime(d.getTime() + days * 86400000);
        expires = '; expires=' + d.toUTCString();
      }
      document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
    }
  };

  /* ── Pixel guard ─────────────────────────────────────────── */
  function pixelTrack(event, params) {
    var consent = localStorage.getItem('quetal_consent_v1');
    if (!consent) return;
    try {
      var c = JSON.parse(consent);
      if (!c.ads) return;
    } catch (e) { return; }
    if (typeof fbq === 'function') {
      fbq('track', event, params || {});
    }
  }

  /* ── UTM forward ─────────────────────────────────────────── */
  function getUTMParams() {
    var params = {};
    var search = window.location.search;
    if (!search) return '';
    var pairs = search.slice(1).split('&');
    pairs.forEach(function (pair) {
      var kv = pair.split('=');
      var key = decodeURIComponent(kv[0]);
      if (key.indexOf('utm_') === 0) {
        params[key] = decodeURIComponent(kv[1] || '');
      }
    });
    var keys = Object.keys(params);
    if (!keys.length) return '';
    return '&' + keys.map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
  }

  /* ── Build WhatsApp URL ───────────────────────────────────── */
  function buildWppURL(customMsg) {
    var msg = customMsg || WPP_MESSAGE;
    var utms = getUTMParams();
    return 'https://wa.me/' + WPP_NUMBER + '?text=' + encodeURIComponent(msg) + (utms ? '&' + utms.slice(1) : '');
  }

  /* ── WhatsApp click handler ───────────────────────────────── */
  function handleWppClick(e) {
    e.preventDefault();
    var btn = e.currentTarget;
    var customMsg = btn.getAttribute('data-wpp-msg') || null;
    pixelTrack('Contact', { content_name: 'WhatsApp' });
    window.open(buildWppURL(customMsg), '_blank', 'noopener,noreferrer');
  }

  /* ── Attach WhatsApp buttons ──────────────────────────────── */
  function attachWppButtons() {
    var btns = document.querySelectorAll('[data-wpp]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', handleWppClick);
    });
  }

  /* ── Product card Pixel ───────────────────────────────────── */
  function attachProductCards() {
    var cards = document.querySelectorAll('[data-product-name]');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var name = card.getAttribute('data-product-name');
        pixelTrack('ViewContent', { content_name: name, content_type: 'product' });
      });
    });
  }

  /* ── Ver Cardápio / InitiateCheckout ─────────────────────── */
  function attachMenuLinks() {
    var links = document.querySelectorAll('[data-pixel-checkout]');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        pixelTrack('InitiateCheckout');
      });
    });
  }

  /* ── FAB WhatsApp visibility via IntersectionObserver ──────── */
  function setupFABVisibility() {
    var fab = document.getElementById('fab-wpp');
    if (!fab) return;

    var hero = document.getElementById('hero-cta');
    if (!hero || !window.IntersectionObserver) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          fab.classList.add('is-hidden');
        } else {
          fab.classList.remove('is-hidden');
        }
      });
    }, { threshold: 0.5 });

    observer.observe(hero);
  }

  /* ── Smooth anchor scroll (respects prefers-reduced-motion) ── */
  function setupSmoothScroll() {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ── PageView on load (consent-gated) ────────────────────── */
  function firePageView() {
    var consent = localStorage.getItem('quetal_consent_v1');
    if (!consent) return;
    try {
      var c = JSON.parse(consent);
      if (!c.ads) return;
    } catch (e) { return; }
    if (typeof fbq === 'function') {
      fbq('track', 'PageView');
    }
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    attachWppButtons();
    attachProductCards();
    attachMenuLinks();
    setupFABVisibility();
    setupSmoothScroll();
    firePageView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
