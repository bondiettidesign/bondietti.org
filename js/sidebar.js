// sidebar.js — builds the essay sidebar with Featured (always open)
// + collapsible Non-fiction and Fiction sections. Fade-scroll signal when
// content overflows the left column. Collapsed/expanded state persists.

const featuredEssays = [
  { href: "essays/tustumina.html",                      short: "Tustumina" },
  { href: "essays/jelly-shoes.html",                    short: "Jelly Shoes" },
  { href: "essays/bobbys-big-day.html",                 short: "Bobby's Big Day" },
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

  function normalizeHref(link) {
    if (link.placeholder) return "#";
    return inEssaysDir ? link.href.replace("essays/", "") : link.href;
  }

  function linkMatches(link) {
    if (link.placeholder) return false;
    const linkFile = link.href.substring(link.href.lastIndexOf("/") + 1);
    return linkFile === file;
  }

  function buildSection(cls, label, links, toggleId) {
    const section = document.createElement("div");
    section.className = "sidebar-section " + cls;

    if (label) {
      const btn = document.createElement("button");
      btn.className = "section-toggle";
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", toggleId);
      btn.innerHTML = label + ' <span class="chevron" aria-hidden="true"></span>';
      section.appendChild(btn);
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

  const featured   = buildSection("featured",   null,           featuredEssays,   "sidebar-featured");
  const nonfiction = buildSection("nonfiction", "Non-fiction",  nonfictionEssays, "sidebar-nonfiction");
  const fiction    = buildSection("fiction",    "Fiction",      fictionEssays,    "sidebar-fiction");

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
    const btn = section.querySelector(".section-toggle");
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  [["nonfiction", nonfiction, nonfictionEssays],
   ["fiction",    fiction,    fictionEssays]].forEach(([key, section, list]) => {
    const hasActive = list.some(linkMatches);
    const savedOpen = state[key];
    const startOpen = hasActive || savedOpen === true;
    setOpen(section, startOpen);

    const btn = section.querySelector(".section-toggle");
    if (btn) btn.addEventListener("click", () => {
      const nowOpen = !section.classList.contains("open");
      setOpen(section, nowOpen);
      state[key] = nowOpen;
      writeState(state);
      requestAnimationFrame(updateFade);
    });
  });

  const leftColumn = document.querySelector(".left-column");

  function updateFade() {
    if (!leftColumn) return;
    const hasOverflow = leftColumn.scrollHeight > leftColumn.clientHeight + 2;
    leftColumn.classList.toggle("has-overflow", hasOverflow);
    if (hasOverflow) {
      const atBottom = leftColumn.scrollTop + leftColumn.clientHeight >= leftColumn.scrollHeight - 4;
      leftColumn.classList.toggle("scrolled-bottom", atBottom);
    } else {
      leftColumn.classList.remove("scrolled-bottom");
    }
  }

  if (leftColumn) {
    leftColumn.addEventListener("scroll", updateFade, { passive: true });
    window.addEventListener("resize", updateFade);
  }
  updateFade();
})();
