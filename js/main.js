// Microcenter Informática — comportamento global (nav, hero fade, scroll reveal, toast)
(function () {
  "use strict";

  window.MC = window.MC || {};
  MC.WHATSAPP_NUMBER = "5519995901712";
  MC.STORE_NAME = "Microcenter Informática";

  MC.waLink = function (message) {
    return "https://wa.me/" + MC.WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  };

  MC.money = function (v) {
    if (v === null || v === undefined || v === "" || isNaN(v)) return null;
    return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  MC.toast = function (msg) {
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.classList.remove("show");
    }, 2400);
  };

  document.addEventListener("DOMContentLoaded", function () {
    // Nav mobile toggle
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("open");
      });
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          links.classList.remove("open");
        });
      });
    }

    // Hero fade-out no scroll (só o conteúdo, não a section inteira)
    var heroContent = document.querySelector(".hero-inner");
    if (heroContent) {
      var fadeDistance = 420;
      var onScroll = function () {
        var y = window.scrollY || window.pageYOffset;
        var ratio = Math.min(y / fadeDistance, 1);
        heroContent.style.opacity = String(1 - ratio);
        heroContent.style.transform = "translateY(" + (-ratio * 40) + "px) scale(" + (1 - ratio * 0.03) + ")";
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // Scroll-reveal por bloco
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  });
})();
