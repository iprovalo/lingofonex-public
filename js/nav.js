/* Lingofonex Navigation — single source of truth */
(function () {
  'use strict';

  /* Detect base path: pages in subdirectories need ../ */
  var depth = (window.location.pathname.match(/\//g) || []).length;
  /* GitHub Pages serves from root, so /home/en.html has depth 2, /download.html has depth 1 */
  var base = depth > 1 ? '../' : '';

  var nav = {
    brand: { href: base + 'home/en.html', logo: base + 'images/Lingofonex_Logo-Medium.png' },
    items: [
      { label: 'Home', links: [
        { href: base + 'home/en.html', text: 'English' },
        { href: base + 'home/uk.html', text: '\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430' },
        { href: base + 'home/es.html', text: 'Espa\u00f1ol' },
        { href: base + 'home/ru.html', text: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439' }
      ]},
      { label: 'Download', href: base + 'download.html' },
      { label: 'App Demo', links: [
        { href: base + 'demo/en.html', text: 'English' },
        { href: base + 'demo/uk.html', text: '\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430' },
        { href: base + 'demo/ru.html', text: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439' },
        { href: base + 'demo/es.html', text: 'Espa\u00f1ol' }
      ]},
      { label: 'FAQ', links: [
        { href: base + 'faq/en.html', text: 'English' },
        { href: base + 'faq/uk.html', text: '\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430' },
        { href: base + 'faq/es.html', text: 'Espa\u00f1ol' }
      ]},
      { label: 'Privacy Policy', links: [
        { href: base + 'privacy-policy/en.html', text: 'English' },
        { href: base + 'privacy-policy/uk.html', text: '\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430' },
        { href: base + 'privacy-policy/es.html', text: 'Espa\u00f1ol' },
        { href: base + 'privacy-policy/ru.html', text: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439' },
        { href: base + 'privacy-policy/fr.html', text: 'Fran\u00e7ais' },
        { href: base + 'privacy-policy/de.html', text: 'Deutsch' },
        { href: base + 'privacy-policy/it.html', text: 'Italiano' },
        { href: base + 'privacy-policy/pt.html', text: 'Portugu\u00eas' },
        { href: base + 'privacy-policy/cs.html', text: '\u010ce\u0161tina' },
        { href: base + 'privacy-policy/pl.html', text: 'Polski' },
        { href: base + 'privacy-policy/ro.html', text: 'Rom\u00e2ne\u0219te' },
        { href: base + 'privacy-policy/zh.html', text: '\u4e2d\u6587' }
      ]},
      { label: 'EULA', links: [
        { href: base + 'eula/en.html', text: 'English' },
        { href: base + 'eula/uk.html', text: '\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430' },
        { href: base + 'eula/es.html', text: 'Espa\u00f1ol' },
        { href: base + 'eula/ru.html', text: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439' },
        { href: base + 'eula/fr.html', text: 'Fran\u00e7ais' },
        { href: base + 'eula/de.html', text: 'Deutsch' },
        { href: base + 'eula/it.html', text: 'Italiano' },
        { href: base + 'eula/pt.html', text: 'Portugu\u00eas' },
        { href: base + 'eula/cs.html', text: '\u010ce\u0161tina' },
        { href: base + 'eula/pl.html', text: 'Polski' },
        { href: base + 'eula/ro.html', text: 'Rom\u00e2ne\u0219te' },
        { href: base + 'eula/zh.html', text: '\u4e2d\u6587' }
      ]},
      { label: 'Contact', href: base + 'contact.html' }
    ]
  };

  function buildNav() {
    var html = '<nav class="site-nav"><div class="nav-inner">';
    html += '<a href="' + nav.brand.href + '" class="nav-brand">';
    html += '<img src="' + nav.brand.logo + '" alt="Lingofonex" class="nav-logo"></a>';
    html += '<button class="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>';
    html += '<ul class="nav-links">';

    nav.items.forEach(function (item) {
      if (item.links) {
        html += '<li class="has-dropdown"><button>' + item.label + ' <span class="dropdown-arrow">&#9660;</span></button>';
        html += '<div class="dropdown">';
        item.links.forEach(function (link) {
          html += '<a href="' + link.href + '">' + link.text + '</a>';
        });
        html += '</div></li>';
      } else {
        html += '<li><a href="' + item.href + '">' + item.label + '</a></li>';
      }
    });

    html += '</ul></div></nav>';
    return html;
  }

  document.addEventListener('DOMContentLoaded', function () {
    /* Inject nav */
    var placeholder = document.getElementById('site-nav');
    if (placeholder) {
      placeholder.innerHTML = buildNav();
    }

    /* ---- Mobile toggle ---- */
    var toggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (toggle && navLinks) {
      toggle.addEventListener('click', function () {
        navLinks.classList.toggle('open');
      });
    }

    /* ---- Dropdowns ---- */
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

    /* Close dropdowns on outside click */
    document.addEventListener('click', function () {
      document.querySelectorAll('.nav-links .has-dropdown.open').forEach(function (el) {
        el.classList.remove('open');
      });
    });

    /* ---- FAQ accordion ---- */
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
  });
})();
