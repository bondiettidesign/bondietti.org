// sidebar.js — builds the essay sidebar with Featured (always open)
// + Memoir and Fiction sections as nav links. Fade-scroll signal when
// content overflows the sidebar-scroll region. Collapsed/expanded state persists.

const featuredEssays = [
  { href: "essays/jehovahs-witnesses-john-denver.html", short: "Jehovah's & John Denver" },
  { href: "essays/why-im-not-a-cowboy.html",            short: "Why I'm Not a Cowboy" },
  { href: "essays/tustumina.html",                      short: "Tustumina" },
  { href: "essays/the-snek.html",                       short: "The Snek" },
];

const nonfictionEssays = [
  { href: "essays/grandma-margie.html",                 short: "Grandma Margie" },
  { href: "essays/jehovahs-witnesses-john-denver.html", short: "Jehovah's Witnesses & John Denver" },
  { href: "essays/tustumina.html",                      short: "Tustumina" },
  { href: "essays/why-im-not-a-cowboy.html",            short: "Why I'm Not a Cowboy" },
  { href: "essays/the-little-britches-rodeo.html",      short: "Little Britches Rodeo" },
  { href: "essays/jelly-shoes.html",                    short: "Jelly Shoes" },
  { href: "#",                                          short: "An Afternoon at Kenton Park",      placeholder: true },
  { href: "#",                                          short: "An Interview with 14-Year-Old Me", placeholder: true },
  { href: "#",                                          short: "Fanny",                            placeholder: true },
  { href: "#",                                          short: "My Family's Eyes",                 placeholder: true },
  { href: "#",                                          short: "On Hunting",                       placeholder: true },
  { href: "#",                                          short: "Reading",                          placeholder: true },
  { href: "#",                                          short: "Where I'm From",                   placeholder: true },
  { href: "#",                                          short: "Why I'm Failing to Assimilate in Portland", placeholder: true },
  { href: "#",                                          short: "The Being That Inhabits This Body", placeholder: true },
];

const fictionEssays = [
  { href: "essays/bobbys-big-day.html",                 short: "Bobby's Big Day" },
  { href: "essays/the-snek.html",                       short: "The Snek" },
  { href: "#",                                          short: "Beneath the Surface",              placeholder: true },
  { href: "#",                                          short: "Meg the Cat Goddess",              placeholder: true },
  { href: "#",                                          short: "The Great Pacific Tsunami of 2030", placeholder: true },
];

(function () {
  const sidebarRoot = document.querySelector(".sidebar");
  if (!sidebarRoot) return;

  const path = window.location.pathname;
  const file = path.substring(path.lastIndexOf("/") + 1) || "index.html";
  const inEssaysDir = path.includes("/essays/");

  function normalizeHref(link, sectionPage) {
    if (link.placeholder) return "#";
    const base = inEssaysDir ? link.href.replace("essays/", "") : link.href;
    return base;
  }

  function sectionPageHref(page) {
    return inEssaysDir ? `../${page}` : page;
  }

  function linkMatches(link) {
    if (link.placeholder) return false;
    const linkFile = link.href.substring(link.href.lastIndexOf("/") + 1);
    return linkFile === file;
  }

  function buildSection(cls, label, labelHref, links, toggleId) {
    const section = document.createElement("div");
    section.className = "sidebar-section " + cls;

    if (label) {
      if (cls === "featured") {
        // Static non-clickable heading
        const hd = document.createElement("div");
        hd.className = "section-toggle section-label";
        hd.setAttribute("aria-hidden", "true");
        hd.textContent = label;
        section.appendChild(hd);
      } else {
        // Linked heading — clicking goes to the section page
        const hd = document.createElement("div");
        hd.className = "section-toggle section-link-toggle";
        const link = document.createElement("a");
        link.href = sectionPageHref(labelHref);
        link.textContent = label;
        link.className = "section-page-link";
        const chevron = document.createElement("span");
        chevron.className = "chevron";
        chevron.setAttribute("aria-hidden", "true");
        hd.appendChild(link);
        hd.appendChild(chevron);
        section.appendChild(hd);
      }
    }

    const list = document.createElement("div");
    list.className = "section-list";
    list.id = toggleId;
    links.forEach(link => {
      const a = document.createElement("a");
      a.href = normalizeHref(link);
      a.textContent = link.short;
      if (link.placeholder) {
        a.style.opacity = "0.55";
        a.style.cursor = "default";
        a.addEventListener("click", e => e.preventDefault());
      }
      if (linkMatches(link)) a.classList.add("active");
      list.appendChild(a);
    });
    section.appendChild(list);
    return section;
  }

  const featured   = buildSection("featured",   "Featured", null,              featuredEssays,   "sidebar-featured");
  const nonfiction = buildSection("nonfiction", "Memoir",   "memoir.html",     nonfictionEssays, "sidebar-nonfiction");
  const fiction    = buildSection("fiction",    "Fiction",  "fiction.html",    fictionEssays,    "sidebar-fiction");

  sidebarRoot.appendChild(featured);
  sidebarRoot.appendChild(nonfiction);
  sidebarRoot.appendChild(fiction);

  const STATE_KEY = "bb-sidebar-open";

  function readState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) { return {}; }
  }
  function writeState(s) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch (e) {}
  }

  const state = readState();

  function setOpen(section, open) {
    if (open) section.classList.add("open");
    else section.classList.remove("open");
    const chevron = section.querySelector(".chevron");
    if (chevron) chevron.style.transform = open ? "rotate(45deg)" : "rotate(-45deg)";
  }

  [["nonfiction", nonfiction, nonfictionEssays],
   ["fiction",    fiction,    fictionEssays]].forEach(([key, section, list]) => {
    const hasActive = list.some(linkMatches);
    const savedOpen = state[key];
    const startOpen = hasActive || savedOpen === true;
    setOpen(section, startOpen);

    // Chevron click toggles; label link navigates
    const hd = section.querySelector(".section-link-toggle");
    if (hd) {
      hd.addEventListener("click", (e) => {
        // If click was on the link itself, let it navigate
        if (e.target.closest("a")) return;
        // Otherwise toggle
        const nowOpen = !section.classList.contains("open");
        setOpen(section, nowOpen);
        state[key] = nowOpen;
        writeState(state);
        requestAnimationFrame(updateFade);
      });
    }
  });

  // Fade logic targets sidebar-scroll wrapper
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
