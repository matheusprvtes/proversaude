/* =========================================================
   Prover Saúde — LP de Captura · Interações
   Degradação elegante: o conteúdo funciona sem este JS.
   ========================================================= */

/* ---------------------------------------------------------
   CONTATO — EDITE AQUI (WhatsApp da equipe Prover Saúde)
   DDI + DDD + número, só dígitos. Ex.: 5567999998888
   ⚠️ SUBSTITUIR o número placeholder abaixo pelo real.
--------------------------------------------------------- */
var CONTACT = {
  whats: "5567996380427", // WhatsApp da equipe Prover Saúde — (67) 9 9638-0427
  msg: "Olá! Sou servidor público municipal e quero saber mais sobre a adesão ao Sistema Prover Saúde."
};

(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Links de WhatsApp ---- */
  function waLink(msg) {
    return "https://wa.me/" + CONTACT.whats + "?text=" + encodeURIComponent(msg || CONTACT.msg);
  }
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.setAttribute("href", waLink());
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  /* ---- Ano do rodapé ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- Navbar: estado ao rolar ---- */
  var nav = document.getElementById("nav");
  function onScroll() { if (nav) nav.setAttribute("data-state", window.scrollY > 12 ? "scrolled" : "top"); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Menu mobile ---- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");
  function closeMenu() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (toggle) { toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Abrir menu"); }
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Scrollspy (link ativo) ---- */
  var ids = ["beneficios", "vantagens", "estrutura", "duvidas"];
  var secs = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var links = {};
  if (menu) menu.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window && secs.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("is-active"); });
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Contadores numéricos ---- */
  function formatNum(n, dot) {
    if (dot) return n.toLocaleString("pt-BR");
    return String(n);
  }
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var dot = el.getAttribute("data-format") === "dot";
    if (reduce) { el.textContent = prefix + formatNum(target, dot); return; }
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + formatNum(Math.round(target * eased), dot);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---- Selects: label flutuante ---- */
  document.querySelectorAll(".field select").forEach(function (sel) {
    function upd() { sel.classList.toggle("has-value", !!sel.value); }
    sel.addEventListener("change", upd);
    upd();
  });

  /* ---- Formulário de captura ---- */
  var form = document.getElementById("lead-form");
  if (form) {
    function setError(field, on) { field.classList.toggle("field--error", on); }
    function validPhone(v) { return (v.replace(/\D/g, "").length >= 10); }

    // Máscara simples de telefone
    var whats = form.querySelector("#whats");
    if (whats) {
      whats.addEventListener("input", function () {
        var d = whats.value.replace(/\D/g, "").slice(0, 11);
        var out = d;
        if (d.length > 2) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
        if (d.length > 7) out = "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
        whats.value = out;
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Honeypot: se preenchido, é bot -> ignora silenciosamente
      var hp = form.querySelector('input[name="empresa"]');
      if (hp && hp.value.trim() !== "") return;

      var ok = true;
      var nome = form.querySelector("#nome");
      var muni = form.querySelector("#municipio");
      var consent = form.querySelector("#consent");

      var eNome = !nome.value.trim(); setError(nome.closest(".field"), eNome); ok = ok && !eNome;
      var eWa = !validPhone(whats.value); setError(whats.closest(".field"), eWa); ok = ok && !eWa;
      var eMu = !muni.value.trim(); setError(muni.closest(".field"), eMu); ok = ok && !eMu;
      if (!consent.checked) { ok = false; consent.closest(".consent").style.color = "#d33"; }
      else { consent.closest(".consent").style.color = ""; }

      if (!ok) {
        var firstErr = form.querySelector(".field--error input");
        if (firstErr) firstErr.focus();
        return;
      }

      // Tracking (Meta/GA/GTM)
      if (window.dataLayer) window.dataLayer.push({ event: "lead_form_submit" });
      if (typeof window.fbq === "function") window.fbq("track", "Lead");

      // Sucesso (UI). Sem backend: encaminha o lead para o WhatsApp da equipe.
      form.classList.add("is-sent");
      var orgao = form.querySelector("#orgao");
      var leadMsg = "Olá! Sou servidor público municipal e quero fazer minha adesão ao Sistema Prover Saúde.\n\n" +
        "Nome: " + nome.value.trim() + "\n" +
        "WhatsApp: " + whats.value.trim() + "\n" +
        "Município: " + muni.value.trim() +
        (orgao && orgao.value ? "\nÓrgão: " + orgao.value : "");
      setTimeout(function () { window.open(waLink(leadMsg), "_blank", "noopener"); }, 600);
    });
  }

  /* ---- Banner de cookies (LGPD) ---- */
  var cookie = document.getElementById("cookie");
  var KEY = "prover_cookie_consent";
  try { if (cookie && !localStorage.getItem(KEY)) setTimeout(function () { cookie.hidden = false; }, 1200); } catch (e) {}
  function setConsent(v) { try { localStorage.setItem(KEY, v); } catch (e) {} if (cookie) cookie.hidden = true; }
  var acc = document.getElementById("cookieAccept");
  var dec = document.getElementById("cookieDecline");
  if (acc) acc.addEventListener("click", function () { setConsent("accepted"); });
  if (dec) dec.addEventListener("click", function () { setConsent("declined"); });

  /* ---- Hook de tracking para CTAs ---- */
  document.querySelectorAll("[data-cta], [data-wa]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-cta") || "whatsapp";
      if (window.dataLayer) window.dataLayer.push({ event: "cta_click", cta: id });
    });
  });

  /* ---- Carrossel (uma imagem por vez, loop infinito) ---- */
  document.querySelectorAll(".carousel").forEach(function (car) {
    var slides = Array.prototype.slice.call(car.querySelectorAll(".carousel__slide"));
    if (slides.length < 2) return;
    var dots = Array.prototype.slice.call(car.querySelectorAll(".carousel__dot"));
    var idx = 0, timer = null, DELAY = 3800;
    function show(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === idx); });
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === idx); d.setAttribute("aria-selected", k === idx ? "true" : "false"); });
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { if (!reduce) { stop(); timer = setInterval(function () { show(idx + 1); }, DELAY); } }
    dots.forEach(function (d, k) { d.addEventListener("click", function () { show(k); start(); }); });
    car.addEventListener("mouseenter", stop);
    car.addEventListener("mouseleave", start);
    show(0);
    start();
  });
})();
