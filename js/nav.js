/* Lingofonex Navigation */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
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
        // close siblings
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
        // close all
        document.querySelectorAll('.faq-item.open').forEach(function (el) {
          el.classList.remove('open');
        });
        if (!wasOpen) item.classList.add('open');
      });
    });
  });
})();
