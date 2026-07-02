/* Lingofonex Navigation — single source of truth */
(function () {
  'use strict';

  /* ---- 23 supported languages in native script ---- */
  var languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Espa\u00f1ol' },
    { code: 'fr', name: 'Fran\u00e7ais' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Portugu\u00eas' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pl', name: 'Polski' },
    { code: 'cs', name: '\u010ce\u0161tina' },
    { code: 'ro', name: 'Rom\u00e2n\u0103' },
    { code: 'ru', name: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439' },
    { code: 'uk', name: '\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430' },
    { code: 'tr', name: 'T\u00fcrk\u00e7e' },
    { code: 'ar', name: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' },
    { code: 'fa', name: '\u0641\u0627\u0631\u0633\u06cc' },
    { code: 'hi', name: '\u0939\u093f\u0928\u094d\u0926\u0940' },
    { code: 'bn', name: '\u09ac\u09be\u0982\u09b2\u09be' },
    { code: 'th', name: '\u0e44\u0e17\u0e22' },
    { code: 'vi', name: 'Ti\u1ebfng Vi\u1ec7t' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'ja', name: '\u65e5\u672c\u8a9e' },
    { code: 'ko', name: '\ud55c\uad6d\uc5b4' },
    { code: 'zh', name: '\u4e2d\u6587' }
  ];

  /* ---- SVG icons (16x16, stroke-based) ---- */
  var icons = {
    home: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    download: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    demo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    faq: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    privacy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    eula: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    contact: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
  };

  /* ---- Localized nav labels (short) ---- */
  var navLabels = {
    en: { home: 'Home', download: 'Download', demo: 'Demo', faq: 'FAQ', privacy: 'Privacy', eula: 'EULA', contact: 'Contact' },
    es: { home: 'Inicio', download: 'Descargar', demo: 'Demo', faq: 'FAQ', privacy: 'Privacidad', eula: 'EULA', contact: 'Contacto' },
    fr: { home: 'Accueil', download: 'T\u00e9l\u00e9charger', demo: 'D\u00e9mo', faq: 'FAQ', privacy: 'Confidentialit\u00e9', eula: 'CLUF', contact: 'Contact' },
    de: { home: 'Startseite', download: 'Download', demo: 'Demo', faq: 'FAQ', privacy: 'Datenschutz', eula: 'EULA', contact: 'Kontakt' },
    it: { home: 'Home', download: 'Scarica', demo: 'Demo', faq: 'FAQ', privacy: 'Privacy', eula: 'EULA', contact: 'Contatti' },
    pt: { home: 'In\u00edcio', download: 'Baixar', demo: 'Demo', faq: 'FAQ', privacy: 'Privacidade', eula: 'EULA', contact: 'Contato' },
    nl: { home: 'Home', download: 'Download', demo: 'Demo', faq: 'FAQ', privacy: 'Privacy', eula: 'EULA', contact: 'Contact' },
    pl: { home: 'Start', download: 'Pobierz', demo: 'Demo', faq: 'FAQ', privacy: 'Prywatno\u015b\u0107', eula: 'EULA', contact: 'Kontakt' },
    cs: { home: '\u00davod', download: 'St\u00e1hnout', demo: 'Demo', faq: 'FAQ', privacy: 'Soukrom\u00ed', eula: 'EULA', contact: 'Kontakt' },
    ro: { home: 'Acas\u0103', download: 'Desc\u0103rcare', demo: 'Demo', faq: 'FAQ', privacy: 'Confiden\u021bialitate', eula: 'EULA', contact: 'Contact' },
    ru: { home: '\u0413\u043b\u0430\u0432\u043d\u0430\u044f', download: '\u0421\u043a\u0430\u0447\u0430\u0442\u044c', demo: '\u0414\u0435\u043c\u043e', faq: 'FAQ', privacy: '\u041a\u043e\u043d\u0444\u0438\u0434.', eula: 'EULA', contact: '\u041a\u043e\u043d\u0442\u0430\u043a\u0442' },
    uk: { home: '\u0413\u043e\u043b\u043e\u0432\u043d\u0430', download: '\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0438\u0442\u0438', demo: '\u0414\u0435\u043c\u043e', faq: 'FAQ', privacy: '\u041a\u043e\u043d\u0444\u0456\u0434.', eula: 'EULA', contact: '\u041a\u043e\u043d\u0442\u0430\u043a\u0442' },
    tr: { home: 'Ana Sayfa', download: '\u0130ndir', demo: 'Demo', faq: 'SSS', privacy: 'Gizlilik', eula: 'EULA', contact: '\u0130leti\u015fim' },
    ar: { home: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629', download: '\u062a\u062d\u0645\u064a\u0644', demo: '\u0639\u0631\u0636', faq: '\u0623\u0633\u0626\u0644\u0629', privacy: '\u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629', eula: 'EULA', contact: '\u0627\u062a\u0635\u0644' },
    fa: { home: '\u062e\u0627\u0646\u0647', download: '\u062f\u0627\u0646\u0644\u0648\u062f', demo: '\u0646\u0645\u0627\u06cc\u0634', faq: '\u0633\u0624\u0627\u0644\u0627\u062a', privacy: '\u062d\u0631\u06cc\u0645', eula: 'EULA', contact: '\u062a\u0645\u0627\u0633' },
    hi: { home: '\u0939\u094b\u092e', download: '\u0921\u093e\u0909\u0928\u0932\u094b\u0921', demo: '\u0921\u0947\u092e\u094b', faq: 'FAQ', privacy: '\u0917\u094b\u092a\u0928\u0940\u092f\u0924\u093e', eula: 'EULA', contact: '\u0938\u0902\u092a\u0930\u094d\u0915' },
    bn: { home: '\u09b9\u09cb\u09ae', download: '\u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1', demo: '\u09a1\u09c7\u09ae\u09cb', faq: 'FAQ', privacy: '\u0997\u09cb\u09aa\u09a8\u09c0\u09af\u09bc\u09a4\u09be', eula: 'EULA', contact: '\u09af\u09cb\u0997\u09be\u09af\u09cb\u0997' },
    th: { home: '\u0e2b\u0e19\u0e49\u0e32\u0e41\u0e23\u0e01', download: '\u0e14\u0e32\u0e27\u0e19\u0e4c\u0e42\u0e2b\u0e25\u0e14', demo: '\u0e40\u0e14\u0e42\u0e21', faq: 'FAQ', privacy: '\u0e04\u0e27\u0e32\u0e21\u0e40\u0e1b\u0e47\u0e19\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27', eula: 'EULA', contact: '\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d' },
    vi: { home: 'Trang ch\u1ee7', download: 'T\u1ea3i xu\u1ed1ng', demo: 'Demo', faq: 'FAQ', privacy: 'Quy\u1ec1n ri\u00eang t\u01b0', eula: 'EULA', contact: 'Li\u00ean h\u1ec7' },
    id: { home: 'Beranda', download: 'Unduh', demo: 'Demo', faq: 'FAQ', privacy: 'Privasi', eula: 'EULA', contact: 'Kontak' },
    ja: { home: '\u30db\u30fc\u30e0', download: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9', demo: '\u30c7\u30e2', faq: 'FAQ', privacy: '\u30d7\u30e9\u30a4\u30d0\u30b7\u30fc', eula: 'EULA', contact: '\u304a\u554f\u5408\u305b' },
    ko: { home: '\ud648', download: '\ub2e4\uc6b4\ub85c\ub4dc', demo: '\ub370\ubaa8', faq: 'FAQ', privacy: '\uac1c\uc778\uc815\ubcf4', eula: 'EULA', contact: '\ubb38\uc758' },
    zh: { home: '\u9996\u9875', download: '\u4e0b\u8f7d', demo: '\u6f14\u793a', faq: 'FAQ', privacy: '\u9690\u79c1', eula: 'EULA', contact: '\u8054\u7cfb' }
  };

  /* ---- Sections with localized pages ---- */
  var sections = [
    { id: 'home',           key: 'home',    icon: icons.home,    path: 'home' },
    { id: 'download',       key: 'download', icon: icons.download, path: 'download' },
    { id: 'demo',           key: 'demo',    icon: icons.demo,    path: 'demo' },
    { id: 'faq',            key: 'faq',     icon: icons.faq,     path: 'faq' },
    { id: 'privacy-policy', key: 'privacy', icon: icons.privacy, path: 'privacy-policy' },
    { id: 'eula',           key: 'eula',    icon: icons.eula,    path: 'eula' },
    { id: 'contact',        key: 'contact', icon: icons.contact, path: 'contact' }
  ];

  /* Resolve label for a section in the current language */
  function sectionLabel(section) {
    var labels = navLabels[currentLang] || navLabels['en'];
    return section.icon + ' ' + (labels[section.key] || navLabels['en'][section.key]);
  }

  /* ---- Detect current page ---- */
  var pathname = window.location.pathname.replace(/\/$/, '');
  /* Strip GitHub Pages repo prefix if any */
  var parts = pathname.split('/').filter(Boolean);

  var currentSection = null;
  var currentLang = 'en';

  /* Match /section/lang.html or /section.html */
  if (parts.length >= 2) {
    var lastPart = parts[parts.length - 1].replace('.html', '');
    var sectionPart = parts[parts.length - 2];
    /* Check if sectionPart is a known section */
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].path === sectionPart) {
        currentSection = sections[i].id;
        currentLang = lastPart;
        break;
      }
    }
  }
  if (!currentSection && parts.length >= 1) {
    var page = parts[parts.length - 1].replace('.html', '');
    for (var j = 0; j < sections.length; j++) {
      if (sections[j].path === page) {
        currentSection = sections[j].id;
        break;
      }
    }
  }

  /* ---- Base path for links ---- */
  var depth = (window.location.pathname.match(/\//g) || []).length;
  var base = depth > 1 ? '../' : '';

  /* ---- Language preference ---- */
  function getPreferredLang() {
    /* 1. localStorage */
    var stored = localStorage.getItem('lingofonex-lang');
    if (stored && isValidLang(stored)) return stored;

    /* 2. Browser language */
    var browserLangs = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; i < browserLangs.length; i++) {
      var code = browserLangs[i].split('-')[0].toLowerCase();
      if (isValidLang(code)) return code;
    }

    return 'en';
  }

  function isValidLang(code) {
    for (var i = 0; i < languages.length; i++) {
      if (languages[i].code === code) return true;
    }
    return false;
  }

  function setPreferredLang(code) {
    localStorage.setItem('lingofonex-lang', code);
  }

  /* ---- Build URL for a section + language ---- */
  function sectionUrl(section, lang) {
    return base + section.path + '/' + lang + '.html';
  }

  /* ---- Globe SVG icon ---- */
  var globeSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    + '<circle cx="12" cy="12" r="10"/>'
    + '<path d="M2 12h20"/>'
    + '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/>'
    + '</svg>';

  /* ---- Build navigation HTML ---- */
  function buildNav() {
    var html = '<nav class="site-nav"><div class="nav-inner">';
    var isPaktPath = /\/pakt(?:\/|$)/.test(window.location.pathname);
    var logoSrc = isPaktPath ? base + 'images/pakt-wordmark-white.svg' : base + 'images/Lingofonex_Logo-Medium.png';
    var logoAlt = isPaktPath ? 'Pakt by Lingofonex' : 'Lingofonex';

    /* Brand */
    html += '<a href="' + sectionUrl(sections[0], currentLang) + '" class="nav-brand">';
    html += '<img src="' + logoSrc + '" alt="' + logoAlt + '" class="nav-logo"></a>';

    /* Mobile toggle */
    html += '<button class="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>';

    /* Nav links */
    html += '<ul class="nav-links">';

    sections.forEach(function (section) {
      var href = sectionUrl(section, currentLang);
      var activeClass = (currentSection === section.id) ? ' class="active"' : '';
      html += '<li><a href="' + href + '"' + activeClass + '>' + sectionLabel(section) + '</a></li>';
    });

    /* Globe language switcher */
    var currentLangName = 'English';
    for (var i = 0; i < languages.length; i++) {
      if (languages[i].code === currentLang) {
        currentLangName = languages[i].name;
        break;
      }
    }

    html += '<li class="has-dropdown lang-switcher">';
    html += '<button aria-label="Language">' + globeSvg + ' <span class="lang-current">' + currentLangName + '</span>';
    html += ' <span class="dropdown-arrow">&#9660;</span></button>';
    html += '<div class="dropdown lang-dropdown">';

    languages.forEach(function (lang) {
      var activeClass = (lang.code === currentLang) ? ' class="lang-active"' : '';
      var targetSection = null;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].id === currentSection) {
          targetSection = sections[i];
          break;
        }
      }
      if (!targetSection) targetSection = sections[0];
      var href = sectionUrl(targetSection, lang.code);
      html += '<a href="' + href + '"' + activeClass + ' data-lang="' + lang.code + '">' + lang.name + '</a>';
    });

    html += '</div></li>';
    html += '</ul></div></nav>';
    return html;
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    /* Inject nav */
    var placeholder = document.getElementById('site-nav');
    if (placeholder) {
      placeholder.innerHTML = buildNav();
    }

    /* Mobile toggle */
    var toggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    if (toggle && navLinks) {
      if (!toggle.hasAttribute('aria-expanded')) {
        toggle.setAttribute('aria-expanded', 'false');
      }
      toggle.addEventListener('click', function () {
        var isOpen = navLinks.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.classList.toggle('menu-open', isOpen);
      });
      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          navLinks.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('menu-open');
        });
      });
    }

    var siteNav = document.querySelector('.site-nav');
    var hero = document.querySelector('.pakt-hero');
    var stickyNavTicking = false;

    function syncStickyNavState() {
      if (!siteNav) return;
      var navHeight = siteNav.offsetHeight || 76;
      var isPastHero = hero
        ? hero.getBoundingClientRect().bottom <= navHeight + 8
        : (window.pageYOffset || document.documentElement.scrollTop || 0) > 8;
      siteNav.classList.toggle('is-scrolled', isPastHero);
      stickyNavTicking = false;
    }

    function requestStickyNavState() {
      if (stickyNavTicking) return;
      stickyNavTicking = true;
      window.requestAnimationFrame(syncStickyNavState);
    }

    syncStickyNavState();
    window.addEventListener('scroll', requestStickyNavState, { passive: true });
    window.addEventListener('resize', requestStickyNavState);

    /* Dropdown toggle (language switcher) */
    var dropdownBtns = document.querySelectorAll('.nav-links .has-dropdown > button');
    dropdownBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var parent = btn.parentElement;
        dropdownBtns.forEach(function (other) {
          if (other !== btn) other.parentElement.classList.remove('open');
        });
        parent.classList.toggle('open');
      });
    });

    /* Save language preference on click */
    document.querySelectorAll('.lang-dropdown a').forEach(function (a) {
      a.addEventListener('click', function () {
        var lang = a.getAttribute('data-lang');
        if (lang) setPreferredLang(lang);
      });
    });

    /* Close dropdowns on outside click */
    document.addEventListener('click', function () {
      document.querySelectorAll('.nav-links .has-dropdown.open').forEach(function (el) {
        el.classList.remove('open');
      });
    });

    /* FAQ accordion */
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        var item = btn.closest('.faq-item');
        var wasOpen = item.hasAttribute('open') || item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(function (el) {
          el.classList.remove('open');
          el.removeAttribute('open');
        });
        if (!wasOpen) {
          item.classList.add('open');
          item.setAttribute('open', '');
        }
      });
    });

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function progressFor(element) {
      var rect = element.getBoundingClientRect();
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      var start = viewportHeight;
      var end = -rect.height;
      return clamp((start - rect.top) / (start - end), 0, 1);
    }

    function pinnedProgressFor(element) {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      var pin = element.querySelector('.scroll-pin');
      var top = pin ? parseFloat(window.getComputedStyle(pin).top) || 0 : 0;
      var start = Math.max(0, element.offsetTop - top);
      var pinHeight = pin ? pin.getBoundingClientRect().height : viewportHeight;
      var distance = Math.max(1, element.offsetHeight - pinHeight);
      return clamp((scrollTop - start) / distance, 0, 1);
    }

    function animationProgressFor(element) {
      var section = element.closest('.scroll-section');
      return section ? pinnedProgressFor(section) : progressFor(element);
    }

    function activeIndexFor(progress, count) {
      return clamp(Math.floor(progress * count), 0, count - 1);
    }

    var scrollDrivenBlocks = [];

    document.querySelectorAll('body:not(.page-component-parity) .situation-slider').forEach(function (slider) {
      var cards = Array.prototype.slice.call(slider.querySelectorAll('.situation-panel'));
      if (cards.length < 2) return;

      function render() {
        var progress = animationProgressFor(slider);
        var activeIndex = progress >= 0.5 ? 1 : 0;
        slider.classList.toggle('is-shifted', activeIndex === 1);
        cards.forEach(function (card, index) {
          var active = index === activeIndex;
          card.classList.toggle('is-active', active);
          card.setAttribute('aria-current', active ? 'true' : 'false');
        });
      }

      scrollDrivenBlocks.push(render);
      render();
    });

    document.querySelectorAll('.proof-band .status-chip-list').forEach(function (list) {
      var items = Array.prototype.slice.call(list.querySelectorAll('.status-chip-button'));
      var panel = document.getElementById('proof-status-copy');
      if (!items.length) return;

      function render() {
        var section = list.closest('.proof-band') || list;
        var activeIndex = activeIndexFor(animationProgressFor(section), items.length);
        items.forEach(function (item, index) {
          var active = index === activeIndex;
          item.setAttribute('aria-selected', active ? 'true' : 'false');
          var chip = item.closest('.status-chip');
          if (chip) chip.classList.toggle('is-active', active);
          if (active && panel) {
            panel.textContent = item.getAttribute('data-proof-description') || item.textContent.trim();
            if (item.id) panel.setAttribute('aria-labelledby', item.id);
          }
        });
      }

      scrollDrivenBlocks.push(render);
      render();
    });

    document.querySelectorAll('.app-flow-section .flow-grid').forEach(function (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.flow-card'));
      if (!cards.length) return;

      function render() {
        var section = grid.closest('.app-flow-section') || grid;
        var activeIndex = activeIndexFor(animationProgressFor(section), cards.length);
        cards.forEach(function (card, index) {
          var active = index === activeIndex;
          card.setAttribute('aria-selected', active ? 'true' : 'false');
          card.classList.toggle('is-active', active);
        });
      }

      scrollDrivenBlocks.push(render);
      render();
    });

    document.querySelectorAll('body:not(.page-component-parity) #features .feature-grid').forEach(function (grid) {
      var section = grid.closest('#features');
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
      if (!section || cards.length < 2) return;

      function render() {
        var activeIndex = activeIndexFor(animationProgressFor(section), cards.length);
        cards.forEach(function (card, index) {
          var active = index === activeIndex;
          card.classList.toggle('is-active', active);
          card.setAttribute('aria-current', active ? 'true' : 'false');
        });
      }

      scrollDrivenBlocks.push(render);
      render();
    });

    document.querySelectorAll('#checklist .checklist').forEach(function (list) {
      var items = Array.prototype.slice.call(list.querySelectorAll('.check-item'));
      if (!items.length) return;

      function render() {
        var section = list.closest('#checklist') || list;
        var checkedCount = clamp(Math.floor(animationProgressFor(section) * (items.length + 1)), 0, items.length);
        items.forEach(function (item, index) {
          item.classList.toggle('is-checked', index < checkedCount);
        });
      }

      scrollDrivenBlocks.push(render);
      render();
    });

    /* Expanded language list modal */
    document.querySelectorAll('#languages .language-more').forEach(function (button) {
      var section = button.closest('#languages');
      var modal = section ? section.querySelector('.language-modal') : null;
      var panel = modal ? modal.querySelector('.language-modal-panel') : null;
      var closeButton = modal ? modal.querySelector('.language-modal-close') : null;
      var lastFocused = null;

      if (!modal || !panel || !closeButton) return;

      function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        button.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('language-modal-open');
        document.removeEventListener('keydown', handleKeydown);
        if (lastFocused && lastFocused.focus) lastFocused.focus();
      }

      function handleKeydown(event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeModal();
        }
      }

      function openModal() {
        lastFocused = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        button.setAttribute('aria-expanded', 'true');
        document.body.classList.add('language-modal-open');
        document.addEventListener('keydown', handleKeydown);
        panel.focus();
      }

      button.addEventListener('click', openModal);
      closeButton.addEventListener('click', closeModal);
      modal.addEventListener('click', function (event) {
        if (event.target === modal) closeModal();
      });
    });

    /* Scenario cards scroll track */
    document.querySelectorAll('body:not(.page-component-parity) #scenarios .scenario-grid').forEach(function (slider) {
      var section = slider.closest('#scenarios');
      var cards = Array.prototype.slice.call(slider.querySelectorAll('.scenario-card'));
      var resizeTimer = null;
      var overflow = 0;

      if (!section || cards.length < 4) return;

      section.setAttribute('aria-label', section.querySelector('.section-title') ? section.querySelector('.section-title').textContent.trim() : 'Travel scenarios');

      function updateHiddenCards() {
        var sectionRect = section.getBoundingClientRect();
        cards.forEach(function (card, cardIndex) {
          var rect = card.getBoundingClientRect();
          var hidden = rect.right < sectionRect.left || rect.left > sectionRect.right;
          card.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        });
      }

      function render() {
        if (window.matchMedia && window.matchMedia('(max-width: 760px)').matches) {
          slider.style.transform = '';
          cards.forEach(function (card) {
            card.setAttribute('aria-hidden', 'false');
          });
          return;
        }
        var progress = animationProgressFor(section);
        var offset = Math.min(overflow, Math.max(0, overflow * progress));
        slider.style.transform = 'translate3d(' + (-offset) + 'px, 0, 0)';
        updateHiddenCards();
      }

      function measure() {
        overflow = Math.max(0, slider.scrollWidth - section.clientWidth);
        render();
      }

      window.addEventListener('resize', function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(measure, 120);
      });

      scrollDrivenBlocks.push(render);
      measure();
    });

    /* Explore more scroll track */
    document.querySelectorAll('body:not(.page-component-parity) #explore-more .related-grid').forEach(function (slider) {
      var section = slider.closest('#explore-more');
      var rail = section ? section.querySelector('.related-rail') : null;
      var cards = Array.prototype.slice.call(slider.querySelectorAll('.related-card'));
      var resizeTimer = null;
      var overflow = 0;
      var currentExpandedCard = null;
      var settleTimer = null;
      var centerTimer = null;

      if (!section || !rail || cards.length < 2) return;

      function isMobileExplore() {
        return window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
      }

      function scrollSectionToOffset(targetOffset) {
        updateOverflow();
        if (!overflow) {
          render();
          return;
        }

        var pin = section.querySelector('.scroll-pin');
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
        var top = pin ? parseFloat(window.getComputedStyle(pin).top) || 0 : 0;
        var start = Math.max(0, section.offsetTop - top);
        var pinHeight = pin ? pin.getBoundingClientRect().height : viewportHeight;
        var distance = Math.max(1, section.offsetHeight - pinHeight);
        var progress = clamp(targetOffset / overflow, 0, 1);

        window.scrollTo({
          top: start + distance * progress,
          behavior: 'auto'
        });
        render();
      }

      function centeredOffsetForCard(card) {
        var railStyles = window.getComputedStyle(rail);
        var railLeftPadding = parseFloat(railStyles.paddingLeft) || 0;
        var railRightPadding = parseFloat(railStyles.paddingRight) || 0;
        var visibleWidth = Math.max(1, rail.clientWidth - railLeftPadding - railRightPadding);
        var cardCenter = card.offsetLeft + card.offsetWidth / 2;
        return clamp(cardCenter - visibleWidth / 2, 0, overflow);
      }

      function centerCard(card) {
        if (!card || !isMobileExplore()) return;
        updateOverflow();
        scrollSectionToOffset(centeredOffsetForCard(card));
      }

      function scheduleCenterCard(card) {
        if (!card || !isMobileExplore()) return;
        window.clearTimeout(centerTimer);
        window.requestAnimationFrame(function () {
          centerCard(card);
        });
        centerTimer = window.setTimeout(function () {
          centerCard(card);
        }, 360);
      }

      function applyExpanded(targetCard) {
        if (currentExpandedCard === targetCard) return;
        currentExpandedCard = targetCard;
        cards.forEach(function (card) {
          var active = card === targetCard;
          card.setAttribute('aria-expanded', active ? 'true' : 'false');
          card.classList.toggle('is-open', active);
        });
        section.classList.toggle('has-open-related-card', Boolean(targetCard));
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(render, 220);
      }

      function setExpanded(targetCard) {
        var nextCard = targetCard && currentExpandedCard !== targetCard ? targetCard : null;
        if (nextCard && isMobileExplore()) centerCard(nextCard);
        applyExpanded(nextCard);
        if (nextCard && isMobileExplore()) scheduleCenterCard(nextCard);
        window.requestAnimationFrame(measure);
      }

      cards.forEach(function (card) {
        card.setAttribute('aria-expanded', card.getAttribute('aria-expanded') === 'true' ? 'true' : 'false');
        card.addEventListener('click', function () {
          setExpanded(card);
        });
      });

      function updateHiddenCards() {
        var railRect = rail.getBoundingClientRect();
        var railStyles = window.getComputedStyle(rail);
        var visibleLeft = railRect.left + (parseFloat(railStyles.paddingLeft) || 0);
        cards.forEach(function (card) {
          var rect = card.getBoundingClientRect();
          var hidden = rect.right <= visibleLeft || rect.left >= railRect.right;
          card.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        });
      }

      function render() {
        var progress = animationProgressFor(section);
        updateOverflow();
        var offset = Math.min(Math.max(overflow * progress, 0), overflow);
        slider.style.transform = 'translate3d(' + (-offset) + 'px, 0, 0)';
        updateHiddenCards();
      }

      function updateOverflow() {
        var railStyles = window.getComputedStyle(rail);
        var railLeftPadding = parseFloat(railStyles.paddingLeft) || 0;
        var railRightPadding = parseFloat(railStyles.paddingRight) || 0;
        overflow = Math.max(0, slider.scrollWidth + railLeftPadding + railRightPadding - rail.clientWidth);
        var isScrollable = overflow > 2;
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
        var minScroll = isMobileExplore() ? viewportHeight * 1.2 : 240;
        var scrollDistance = isScrollable ? Math.round(Math.max(minScroll, overflow * 1.15)) : 0;
        section.classList.toggle('is-scrollable', isScrollable);
        section.style.setProperty('--pin-scroll', scrollDistance + 'px');
      }

      function measure() {
        updateOverflow();
        render();
      }

      window.addEventListener('resize', function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(measure, 120);
      });

      scrollDrivenBlocks.push(render);
      measure();
    });

    if (scrollDrivenBlocks.length) {
      var ticking = false;
      var renderScrollDrivenBlocks = function () {
        ticking = false;
        scrollDrivenBlocks.forEach(function (render) {
          render();
        });
      };
      var requestScrollRender = function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(renderScrollDrivenBlocks);
      };
      window.addEventListener('scroll', requestScrollRender, { passive: true });
      window.addEventListener('resize', requestScrollRender);
      requestScrollRender();
    }

    /* Auto-redirect to preferred language on index/root */
    if (pathname === '' || pathname === '/' || pathname.endsWith('/index.html')) {
      var preferred = getPreferredLang();
      if (preferred !== 'en') {
        window.location.href = base + 'home/' + preferred + '.html';
      }
    }
  });
})();
