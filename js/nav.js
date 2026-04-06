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

  /* ---- Sections with localized pages ---- */
  var sections = [
    { id: 'home',           label: 'Home',           path: 'home' },
    { id: 'download',       label: 'Download',       path: 'download' },
    { id: 'demo',           label: 'App Demo',       path: 'demo' },
    { id: 'faq',            label: 'FAQ',             path: 'faq' },
    { id: 'privacy-policy', label: 'Privacy Policy',  path: 'privacy-policy' },
    { id: 'eula',           label: 'EULA',            path: 'eula' },
    { id: 'contact',        label: 'Contact',         path: 'contact' }
  ];

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
    if (section.single) {
      return base + section.path + '.html';
    }
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

    /* Brand */
    html += '<a href="' + sectionUrl(sections[0], currentLang) + '" class="nav-brand">';
    html += '<img src="' + base + 'images/Lingofonex_Logo-Medium.png" alt="Lingofonex" class="nav-logo"></a>';

    /* Mobile toggle */
    html += '<button class="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>';

    /* Nav links */
    html += '<ul class="nav-links">';

    sections.forEach(function (section) {
      var href = sectionUrl(section, currentLang);
      var activeClass = (currentSection === section.id) ? ' class="active"' : '';
      html += '<li><a href="' + href + '"' + activeClass + '>' + section.label + '</a></li>';
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
      /* For single pages (download, contact), language switch goes to home */
      var targetSection = currentSection ? null : sections[0];
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].id === currentSection) {
          targetSection = sections[i];
          break;
        }
      }
      if (!targetSection) targetSection = sections[0];

      var href;
      if (targetSection.single) {
        /* On single pages, switch to home in the selected language */
        href = sectionUrl(sections[0], lang.code);
      } else {
        href = sectionUrl(targetSection, lang.code);
      }
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
      toggle.addEventListener('click', function () {
        navLinks.classList.toggle('open');
      });
    }

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
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function (el) {
          el.classList.remove('open');
        });
        if (!wasOpen) item.classList.add('open');
      });
    });

    /* Auto-redirect to preferred language on index/root */
    if (pathname === '' || pathname === '/' || pathname.endsWith('/index.html')) {
      var preferred = getPreferredLang();
      if (preferred !== 'en') {
        window.location.href = base + 'home/' + preferred + '.html';
      }
    }
  });
})();
