/* ==========================================================================
   gutoexplorer — comportamento do site
   Sem dependências. Tudo degrada bem sem JS.
   ========================================================================== */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".progress");
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav__link")
  );
  var pageMain = document.getElementById("conteudo");
  var pageFooter = document.querySelector(".site-footer");

  /* Header, barra de progresso e relógio de rolagem --------------------- */
  var ticking = false;

  function updateScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (header) header.classList.toggle("is-scrolled", y > 8);

    if (progress) {
      var ratio = max > 0 ? Math.min(y / max, 1) : 0;
      progress.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScroll);
      }
    },
    { passive: true }
  );

  updateScroll();

  /* Menu mobile --------------------------------------------------------- */
  function menuIsOpen() {
    return mobileNav ? mobileNav.classList.contains("is-open") : false;
  }

  function setMenu(open, restoreFocus) {
    if (!mobileNav || !toggle) return;

    mobileNav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    if (header) header.classList.toggle("is-menu-open", open);
    document.body.classList.toggle("no-scroll", open);

    [pageMain, pageFooter].forEach(function (element) {
      if (element) element.inert = open;
    });

    if (open) {
      var first = mobileNav.querySelector("a, button");
      if (first) first.focus({ preventScroll: true });
    } else if (restoreFocus) {
      toggle.focus({ preventScroll: true });
    }
  }

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      setMenu(!menuIsOpen(), false);
    });

    mobileNav.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (link) setMenu(false, false);
    });

    document.addEventListener("click", function (event) {
      if (!menuIsOpen()) return;
      if (mobileNav.contains(event.target) || toggle.contains(event.target)) {
        return;
      }
      setMenu(false, false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuIsOpen()) {
        setMenu(false, true);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720 && menuIsOpen()) setMenu(false, false);
    });
  }

  /* Scroll spy ---------------------------------------------------------- */
  var sections = ["sobre", "projetos", "contato"]
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var current = "#" + entry.target.id;
          navLinks.forEach(function (link) {
            if (link.getAttribute("href") === current) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* Revelação no scroll ------------------------------------------------ */
  var revealItems = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );

  if (revealItems.length) {
    if (!reduce.matches && "IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );

      revealItems.forEach(function (item) {
        revealObserver.observe(item);
      });
    } else {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
    }
  }

  /* Filtro de projetos -------------------------------------------------- */
  var filterButtons = Array.prototype.slice.call(
    document.querySelectorAll("[data-filter]")
  );
  var projectCards = Array.prototype.slice.call(
    document.querySelectorAll("[data-category]")
  );
  var projectCount = document.getElementById("projects-count");

  function applyFilter(filter) {
    var visible = 0;

    projectCards.forEach(function (card) {
      var categories = (card.getAttribute("data-category") || "").split(" ");
      var show = filter === "todos" || categories.indexOf(filter) !== -1;

      card.hidden = !show;
      card.style.animation = "";

      if (show) {
        if (!reduce.matches) {
          // Reinicia a animação de entrada, com pequeno escalonamento.
          card.style.animation = "none";
          void card.offsetWidth;
          card.style.animation =
            "card-in 460ms var(--ease-out) both";
          card.style.animationDelay = Math.min(visible * 45, 225) + "ms";
        }
        visible += 1;
      }
    });

    if (projectCount) {
      projectCount.textContent =
        visible + (visible === 1 ? " projeto exibido" : " projetos exibidos");
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter") || "todos";

      filterButtons.forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === button));
      });

      applyFilter(filter);
    });
  });

  /* Microinterações da direção A ---------------------------------------- */
  // Ímã: o botão se desloca alguns pixels na direção do cursor.
  var magneticItems = Array.prototype.slice.call(
    document.querySelectorAll("[data-magnetic]")
  );

  magneticItems.forEach(function (item) {
    item.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch" || reduce.matches) return;

      var rect = item.getBoundingClientRect();
      var dx = (event.clientX - rect.left - rect.width / 2) * 0.14;
      var dy = (event.clientY - rect.top - rect.height / 2) * 0.18;
      dx = Math.max(-7, Math.min(7, dx));
      dy = Math.max(-6, Math.min(6, dy));
      item.style.transform = "translate3d(" + dx + "px," + dy + "px,0)";
    });

    item.addEventListener("pointerleave", function () {
      item.style.transform = "";
    });
  });

  // Tilt + brilho no retrato.
  var tilt = document.querySelector("[data-tilt]");
  if (tilt) {
    var portrait = tilt.querySelector(".portrait");

    tilt.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch" || reduce.matches || !portrait) return;

      var rect = portrait.getBoundingClientRect();
      var px = (event.clientX - rect.left) / rect.width;
      var py = (event.clientY - rect.top) / rect.height;

      portrait.style.transform =
        "rotateX(" + ((0.5 - py) * 7).toFixed(2) + "deg) rotateY(" +
        ((px - 0.5) * 9).toFixed(2) + "deg)";
      portrait.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
      portrait.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
    });

    tilt.addEventListener("pointerleave", function () {
      if (portrait) portrait.style.transform = "";
    });
  }

  // Spotlight nos cartões de projeto.
  Array.prototype.forEach.call(
    document.querySelectorAll(".project"),
    function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (event.clientX - rect.left) + "px");
        card.style.setProperty("--my", (event.clientY - rect.top) + "px");
      });
    }
  );

  /* Ano do rodapé -------------------------------------------------------- */
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-year]"),
    function (node) {
      node.textContent = String(new Date().getFullYear());
    }
  );

  /* Preferência de movimento alterada em tempo real ---------------------- */
  function onMotionChange() {
    if (reduce.matches) {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
    }
  }

  if (typeof reduce.addEventListener === "function") {
    reduce.addEventListener("change", onMotionChange);
  } else if (typeof reduce.addListener === "function") {
    reduce.addListener(onMotionChange);
  }
})();
