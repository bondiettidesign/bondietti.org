// sidebar.js — Featured list (always visible) + Memoir / Fiction as
// "read more" links. No collapsible dropdowns. Fade-scroll on sidebar-scroll.

const featuredEssays = [
  { href: "essays/jehovahs-witnesses-john-denver.html", short: "Jehovah\u2019s & John Denver" },
  { href: "essays/why-im-not-a-cowboy.html",            short: "Why I\u2019m Not a Cowboy" },
  { href: "essays/tustumina.html",                      short: "Tustumina" },
  { href: "essays/the-snek.html",                       short: "The Snek" },
];

(function () {
  const sidebarRoot = document.querySelector(".sidebar");
  if (!sidebarRoot) return;

  const path     = window.location.pathname;
  const file     = path.substring(path.lastIndexOf("/") + 1) || "index.html";
  const inEssays = path.includes("/essays/");

  function resolveHref(href) {
    return inEssays ? href.replace("essays/", "") : href;
  }
  function resolvePage(page) {
    return inEssays ? `../${page}` : page;
  }
  function isActive(href) {
    return href.substring(href.lastIndexOf("/") + 1) === file;
  }

  // ── Featured section ───────────────────────────────────────────────
  const featuredSection = document.createElement("div");
  featuredSection.className = "sidebar-section featured";

  const featuredLabel = document.createElement("div");
  featuredLabel.className = "section-label";
  featuredLabel.textContent = "Featured";
  featuredSection.appendChild(featuredLabel);

  featuredEssays.forEach(essay => {
    const a = document.createElement("a");
    a.href = resolveHref(essay.href);
    a.textContent = essay.short;
    if (isActive(essay.href)) a.classList.add("active");
    featuredSection.appendChild(a);
  });

  sidebarRoot.appendChild(featuredSection);

  // ── Memoir / Fiction "read more" blocks ────────────────────────────
  [
    { label: "Memoir",  page: "memoir.html"  },
    { label: "Fiction", page: "fiction.html" },
  ].forEach(({ label, page }) => {
    const section = document.createElement("div");
    section.className = "sidebar-section section-readmore";

    const readMore = document.createElement("span");
    readMore.className = "readmore-label";
    readMore.textContent = "read more";

    const link = document.createElement("a");
    link.href = resolvePage(page);
    link.textContent = label;
    link.className = "readmore-link";
    if (file === page) link.classList.add("active");

    section.appendChild(readMore);
    section.appendChild(link);
    sidebarRoot.appendChild(section);
  });

  // ── Scroll fade on .sidebar-scroll ────────────────────────────────
  const scrollEl = document.querySelector(".sidebar-scroll");

  function updateFade() {
    if (!scrollEl) return;
    const hasOverflow = scrollEl.scrollHeight > scrollEl.clientHeight + 2;
    scrollEl.classList.toggle("has-overflow", hasOverflow);
    if (hasOverflow) {
      const atBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 4;
      scrollEl.classList.toggle("scrolled-bottom", atBottom);
    } else {
      scrollEl.classList.remove("scrolled-bottom");
    }
  }

  if (scrollEl) {
    scrollEl.addEventListener("scroll", updateFade, { passive: true });
    window.addEventListener("resize", updateFade);
  }
  updateFade();
})();
