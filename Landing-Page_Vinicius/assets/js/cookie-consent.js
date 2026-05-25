/* ============================================================
   QUE TAL CONGELADOS — cookie-consent.js
   LGPD banner: aceitar / recusar / personalizar
   Consent gate: Pixel (ads) e Analytics ativam só após opt-in
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'quetal_consent_v1';

  /* ── Lê/grava consent ────────────────────────────────────── */
  function getConsent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }
  function setConsent(obj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  /* ── Ativa Pixel (Meta) ──────────────────────────────────── */
  function loadPixel() {
    if (typeof fbq !== 'undefined') { fbq('track', 'PageView'); return; }
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    fbq('init', '338300610511977');
    fbq('track', 'PageView');
  }

  /* ── Ativa Google Analytics (GA4) ───────────────────────── */
  function loadGA() {
    if (document.getElementById('ga4-script')) return;
    var s = document.createElement('script');
    s.id = 'ga4-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX'); /* substituir pelo ID GA4 real */
  }

  /* ── Aplica consent salvo ────────────────────────────────── */
  function applyConsent(consent) {
    if (!consent) return;
    if (consent.ads)       loadPixel();
    if (consent.analytics) loadGA();
  }

  /* ── Helper DOM ──────────────────────────────────────────── */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'cls') {
          node.className = attrs[k];
        } else if (k === 'text') {
          node.textContent = attrs[k];
        } else if (k === 'for') {
          node.htmlFor = attrs[k];
        } else {
          node.setAttribute(k, attrs[k]);
        }
      });
    }
    if (children) {
      children.forEach(function (c) {
        if (c) node.appendChild(c);
      });
    }
    return node;
  }

  function toggle(id, label, description) {
    return el('div', { cls: 'consent-toggle' }, [
      el('div', { cls: 'consent-toggle__info' }, [
        el('p', { cls: 'consent-toggle__name', text: label }),
        el('p', { cls: 'consent-toggle__desc', text: description })
      ]),
      el('label', { cls: 'consent-toggle__switch', 'aria-label': label }, [
        el('input', { type: 'checkbox', id: id }),
        el('span', { cls: 'consent-toggle__track' })
      ])
    ]);
  }

  /* ── Monta banner ────────────────────────────────────────── */
  function buildBanner() {
    var policyLink = el('a', { href: '/politica-de-cookies.html' });
    policyLink.textContent = 'Política de Cookies';

    var textNode = document.createElement('p');
    textNode.className = 'cookie-banner__text';
    textNode.appendChild(document.createTextNode('Usamos cookies para melhorar sua experiência e exibir conteúdo relevante. Consulte nossa '));
    textNode.appendChild(policyLink);
    textNode.appendChild(document.createTextNode('.'));

    return el('div', { id: 'cookie-banner', cls: 'cookie-banner', role: 'region', 'aria-label': 'Preferências de cookies', 'aria-live': 'polite' }, [
      el('div', { cls: 'cookie-banner__inner' }, [
        textNode,
        el('div', { cls: 'cookie-banner__actions' }, [
          el('button', { id: 'cookie-accept-all', cls: 'btn btn--filled btn--sm', type: 'button', text: 'Aceitar todos' }),
          el('button', { id: 'cookie-reject',     cls: 'btn btn--outlined btn--sm', type: 'button', text: 'Apenas necessários' }),
          el('button', { id: 'cookie-customize',  cls: 'btn btn--text btn--sm', type: 'button', text: 'Personalizar' })
        ])
      ])
    ]);
  }

  /* ── Monta modal ─────────────────────────────────────────── */
  function buildModal() {
    var necessary = toggle('toggle-necessary', 'Estritamente necessários', 'Sessão, carrinho, segurança. Não podem ser desativados.');
    var neededInput = necessary.querySelector('input');
    neededInput.checked = true;
    neededInput.disabled = true;

    var actionsDiv = el('div', { style: 'margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;' }, [
      el('button', { id: 'cookie-save',        cls: 'btn btn--filled btn--sm', type: 'button', text: 'Salvar preferências' }),
      el('button', { id: 'cookie-modal-close', cls: 'btn btn--text btn--sm',   type: 'button', text: 'Cancelar' })
    ]);

    return el('div', { id: 'cookie-overlay', cls: 'cookie-modal-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Personalizar cookies' }, [
      el('div', { cls: 'cookie-modal' }, [
        el('h2', { cls: 'cookie-modal__title', text: 'Preferências de privacidade' }),
        necessary,
        toggle('toggle-analytics', 'Analíticos', 'Google Analytics — mede tráfego e comportamento de forma agregada.'),
        toggle('toggle-ads',       'Publicidade', 'Meta Pixel e Google Ads — anúncios personalizados e remarketing.'),
        actionsDiv
      ])
    ]);
  }

  /* ── Esconde banner ──────────────────────────────────────── */
  function hideBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.classList.add('is-hidden');
  }

  /* ── Abre/fecha modal ────────────────────────────────────── */
  function openModal() {
    var overlay = document.getElementById('cookie-overlay');
    if (!overlay) return;
    overlay.classList.add('is-open');
    var consent = getConsent();
    var togAna = document.getElementById('toggle-analytics');
    var togAds = document.getElementById('toggle-ads');
    if (consent && togAna) togAna.checked = !!consent.analytics;
    if (consent && togAds) togAds.checked = !!consent.ads;
    var firstBtn = overlay.querySelector('button:not([disabled])');
    if (firstBtn) setTimeout(function(){ firstBtn.focus(); }, 50);
  }
  function closeModal() {
    var overlay = document.getElementById('cookie-overlay');
    if (overlay) overlay.classList.remove('is-open');
  }

  /* ── Handlers ────────────────────────────────────────────── */
  function onAcceptAll() {
    var c = { necessary: true, analytics: true, ads: true };
    setConsent(c);
    applyConsent(c);
    hideBanner();
  }
  function onReject() {
    setConsent({ necessary: true, analytics: false, ads: false });
    hideBanner();
  }
  function onSave() {
    var togAna = document.getElementById('toggle-analytics');
    var togAds = document.getElementById('toggle-ads');
    var c = {
      necessary: true,
      analytics: togAna ? togAna.checked : false,
      ads:       togAds ? togAds.checked : false
    };
    setConsent(c);
    applyConsent(c);
    hideBanner();
    closeModal();
  }

  /* ── Vincula eventos ─────────────────────────────────────── */
  function bindEvents() {
    function byId(id){ return document.getElementById(id); }

    byId('cookie-accept-all') && byId('cookie-accept-all').addEventListener('click', onAcceptAll);
    byId('cookie-reject')     && byId('cookie-reject').addEventListener('click', onReject);
    byId('cookie-customize')  && byId('cookie-customize').addEventListener('click', openModal);
    byId('cookie-save')       && byId('cookie-save').addEventListener('click', onSave);
    byId('cookie-modal-close') && byId('cookie-modal-close').addEventListener('click', closeModal);

    var overlay = byId('cookie-overlay');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) closeModal();
    });

    document.querySelectorAll('[data-cookie-manage]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    var existing = getConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      document.body.appendChild(buildBanner());
      document.body.appendChild(buildModal());
      bindEvents();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
