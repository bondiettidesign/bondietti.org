// theme.js — cycling theme/font buttons, font-size slider, drawer,
// lightbox, back-to-top, auto-hide mobile header.
(function () {
  const THEME_KEY = "bb-theme";
  const SIZE_KEY  = "bb-font-scale";
  const FONT_KEY  = "bb-reader-font";

  // Theme cycle: lavender -> navy -> parchment -> ink -> fog -> forest -> lavender
  const THEMES = [
    { id: "lavender",  label: "Lavender"  },
    { id: "navy",      label: "Navy"      },
    { id: "parchment", label: "Parchment" },
    { id: "ink",       label: "Ink"       },
    { id: "fog",       label: "Fog"       },
    { id: "forest",    label: "Forest"    },
  ];

  // Font cycle: garamond (Pretty) -> sourcesans (Easy) -> merriweather (Legible)
  const FONTS = [
    { id: "garamond",     label: "Pretty"   },
    { id: "sourcesans",   label: "Easy"     },
    { id: "merriweather", label: "Legible"  },
  ];

  // ===== Theme =====
  function applyTheme(id) {
    THEMES.forEach(t => {
      document.documentElement.classList.remove(t.id);
      document.body.classList.remove(t.id);
    });
    THEMES.forEach(t => document.documentElement.classList.remove("preload-" + t.id));
    if (id && id !== "lavender") {
      document.documentElement.classList.add(id);
      document.body.classList.add(id);
    }
  }

  function currentThemeIndex() {
    const saved = localStorage.getItem(THEME_KEY) || "lavender";
    const i = THEMES.findIndex(t => t.id === saved);
    return i === -1 ? 0 : i;
  }

  function initTheme() {
    const idx = currentThemeIndex();
    const cur = THEMES[idx];
    applyTheme(cur.id);

    document.querySelectorAll(".theme-btn").forEach(btn => {
      btn.textContent = cur.label;
      btn.addEventListener("click", function () {
        const now = currentThemeIndex();
        const next = THEMES[(now + 1) % THEMES.length];
        applyTheme(next.id);
        localStorage.setItem(THEME_KEY, next.id);
        document.querySelectorAll(".theme-btn").forEach(b => { b.textContent = next.label; });
      });
    });
  }

  // ===== Font family =====
  function applyFont(id) {
    document.documentElement.setAttribute("data-reader-font", id);
  }

  function currentFontIndex() {
    const saved = localStorage.getItem(FONT_KEY) || "garamond";
    const i = FONTS.findIndex(f => f.id === saved);
    return i === -1 ? 0 : i;
  }

  function initFont() {
    const idx = currentFontIndex();
    const cur = FONTS[idx];
    applyFont(cur.id);

    document.querySelectorAll(".font-btn").forEach(btn => {
      btn.textContent = cur.label;
      btn.addEventListener("click", function () {
        const now = currentFontIndex();
        const next = FONTS[(now + 1) % FONTS.length];
        applyFont(next.id);
        localStorage.setItem(FONT_KEY, next.id);
        document.querySelectorAll(".font-btn").forEach(b => { b.textContent = next.label; });
      });
    });
  }

  // ===== Font size S/M/L =====
  const SIZE_STEPS = [
    { id: "sm", label: "S", scale: 0.85 },
    { id: "md", label: "M", scale: 1.0  },
    { id: "lg", label: "L", scale: 1.2  },
  ];

  function applyFontScale(scale) {
    document.documentElement.style.setProperty("--body-font-scale", scale);
  }

  function getSavedSizeId() {
    const saved = parseFloat(localStorage.getItem(SIZE_KEY));
    if (isNaN(saved)) return "md";
    // find closest step
    let best = "md";
    let bestDiff = Infinity;
    SIZE_STEPS.forEach(s => {
      const d = Math.abs(s.scale - saved);
      if (d < bestDiff) { bestDiff = d; best = s.id; }
    });
    return best;
  }

  function initFontSize() {
    const activeId = getSavedSizeId();
    const active = SIZE_STEPS.find(s => s.id === activeId) || SIZE_STEPS[1];
    applyFontScale(active.scale);

    document.querySelectorAll(".font-size-btn").forEach(btn => {
      const id = btn.dataset.size;
      if (id === activeId) btn.classList.add("active");

      btn.addEventListener("click", function () {
        const step = SIZE_STEPS.find(s => s.id === id);
        if (!step) return;
        applyFontScale(step.scale);
        localStorage.setItem(SIZE_KEY, step.scale);
        document.querySelectorAll(".font-size-btn").forEach(b => {
          b.classList.toggle("active", b.dataset.size === id);
        });
      });
    });
  }

  // ===== Drawer =====
  function initDrawer() {
    const handle   = document.querySelector(".meg-handle");
    const backdrop = document.querySelector(".drawer-backdrop");
    const drawer   = document.querySelector(".left-column");
    if (!handle) return;

    function open() {
      document.body.classList.add("drawer-open");
      if (drawer) drawer.scrollTop = 0;
    }
    function close() { document.body.classList.remove("drawer-open"); }
    function toggle() {
      if (document.body.classList.contains("drawer-open")) close();
      else open();
    }

    handle.addEventListener("click", toggle);
    if (backdrop) backdrop.addEventListener("click", close);
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    document.querySelectorAll(".left-column a").forEach(a => a.addEventListener("click", close));
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) close();
    });
  }

  // ===== Lightbox =====
  function initLightbox() {
    const lb    = document.querySelector(".lightbox");
    const lbImg = document.querySelector(".lightbox img");
    const lbCap = document.querySelector(".lightbox-caption");
    if (!lb || !lbImg) return;

    const triggers = document.querySelectorAll(
      ".gallery-item img, .essay-body figure img, .right-column figure img"
    );

    triggers.forEach(img => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () {
        if (img.closest(".lightbox")) return;
        lbImg.src = img.src;
        lbImg.alt = img.alt || "";
        let cap = "";
        const fig = img.closest("figure");
        if (fig) {
          const fc = fig.querySelector("figcaption");
          if (fc) cap = fc.textContent.trim();
        } else {
          const gi = img.closest(".gallery-item");
          if (gi) {
            const t = gi.querySelector(".gallery-caption .title");
            if (t) cap = t.textContent.trim();
          }
        }
        if (lbCap) lbCap.textContent = cap;
        document.body.classList.add("lightbox-open");
      });
    });

    function close() { document.body.classList.remove("lightbox-open"); }
    lb.addEventListener("click", close);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && document.body.classList.contains("lightbox-open")) close();
    });
  }

  // ===== Back-to-top button =====
  function initBackToTop() {
    const btn = document.querySelector(".back-to-top");
    if (!btn) return;

    function update() {
      if (window.scrollY > 400) {
        btn.classList.add("visible");
      } else {
        btn.classList.remove("visible");
      }
    }

    window.addEventListener("scroll", update, { passive: true });
    update();

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ===== Auto-hide mobile header =====
  function initAutoHideHeader() {
    const header = document.querySelector(".page-header-narrow");
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const curY = window.scrollY;
      // Only apply on narrow viewports (the header is only visible there)
      if (window.innerWidth > 960) {
        header.classList.remove("hidden");
        ticking = false;
        return;
      }
      // Always show at the top
      if (curY < 40) {
        header.classList.remove("hidden");
      } else if (curY > lastY + 6) {
        // scrolling down — hide
        header.classList.add("hidden");
      } else if (curY < lastY - 6) {
        // scrolling up — show
        header.classList.remove("hidden");
      }
      lastY = curY;
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  function init() {
    initTheme();
    initFont();
    initFontSize();
    initDrawer();
    initLightbox();
    initBackToTop();
    initAutoHideHeader();
  }

  if (document.body) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
