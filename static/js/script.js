/* =========================================================
   Clean, single-file script.js
   - Debounced live search for blog + projects
   - Safe DOM checks (won't crash on pages missing elements)
   - Single DOMContentLoaded wrapper
   - Keyboard navigation for results
========================================================= */

(function () {
  // ======= Helper utils =======
  const debounce = (fn, wait = 300) => {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  const safeText = (s) => (s === undefined || s === null ? "" : String(s));

  function buildFallbackUrl(item, type) {
    if (item.url) return item.url;
    if (item.slug) {
      if (type === "blog") return `/blog/${item.slug}/`;
      if (type === "project") return `/projects/${item.slug}/`;
    }
    return "#";
  }

  function normalizeResponse(data) {
    // Accept either an array or an object with { results: [] }
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.results && Array.isArray(data.results)) return data.results;
    return [];
  }

  // Create accessible/keyboard-friendly results population
  function populateResults(resultsEl, items, type) {
    resultsEl.innerHTML = "";
    if (!items.length) {
      resultsEl.style.display = "none";
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "search-result-item";
      li.setAttribute("role", "option");
      li.setAttribute("data-index", idx);
      li.tabIndex = -1;

      const a = document.createElement("a");
      a.href = buildFallbackUrl(item, type);
      a.innerText = safeText(item.title || item.name || item.label || "Untitled");
      a.addEventListener("click", (ev) => {
        // default behaviour will navigate; nothing to do
      });

      li.appendChild(a);
      fragment.appendChild(li);
    });

    resultsEl.appendChild(fragment);
    resultsEl.style.display = "block";
    resultsEl.dataset.focusIndex = "-1";
  }

  function setupLiveSearch({ inputId, resultsId, apiUrl, type }) {
    const input = document.getElementById(inputId);
    const results = document.getElementById(resultsId);
    if (!input || !results || !apiUrl) return;

    // accessibility attributes
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", resultsId);
    results.setAttribute("role", "listbox");
    results.style.display = "none";

    // Clear results helper
    const clearResults = () => {
      results.innerHTML = "";
      results.style.display = "none";
      results.dataset.focusIndex = "-1";
    };

    // keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
    input.addEventListener("keydown", (e) => {
      const items = results.querySelectorAll(".search-result-item");
      if (!items.length) return;

      let current = parseInt(results.dataset.focusIndex || "-1", 10);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        current = Math.min(items.length - 1, current + 1);
        results.dataset.focusIndex = String(current);
        items.forEach((it, i) => it.classList.toggle("focused", i === current));
        items[current].querySelector("a").focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        current = Math.max(0, current - 1);
        results.dataset.focusIndex = String(current);
        items.forEach((it, i) => it.classList.toggle("focused", i === current));
        items[current].querySelector("a").focus();
      } else if (e.key === "Enter") {
        // If an item is focused, follow it
        if (current >= 0 && items[current]) {
          const href = items[current].querySelector("a").href;
          if (href && href !== "#") {
            window.location.href = href;
          }
        }
      } else if (e.key === "Escape") {
        clearResults();
        input.blur();
      }
    });

    const performFetchAndShow = (query) => {
      if (!query || query.trim().length < 1) {
        results.innerHTML = "";
        results.style.display = "none";
        return;
      }

      fetch(`${apiUrl}?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          const items = normalizeResponse(data);
          populateResults(results, items, type);
        })
        .catch((err) => {
          // silently fail (don't crash UX)
          console.error("Search fetch error:", err);
          results.innerHTML = "<li>No results</li>";
          results.style.display = "block";
        });
    };

    const debouncedSearch = debounce((ev) => {
      const q = ev.target.value.trim();
      performFetchAndShow(q);
    }, 300);

    // Live search on typing
    input.addEventListener("input", debouncedSearch);

    // optional: allow clicking the button to force search (if a button exists)
    const btnId = input.getAttribute("data-search-btn-id");
    if (btnId) {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => performFetchAndShow(input.value.trim()));
      }
    }

    // clicking outside hides results
    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        clearResults();
      }
    });

    // clicking a result link will naturally navigate; nothing more required
  }

  // ======= Page-wide DOMContentLoaded =======
  document.addEventListener("DOMContentLoaded", () => {
    /* ==========================
       Particles (only if element exists and particlesJS loaded)
       ========================== */
    try {
      if (typeof particlesJS !== "undefined" && document.getElementById("particles-js")) {
        // particles config (small & efficient)
        particlesJS("particles-js", {
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.8, random: true },
            size: { value: 2, random: true },
            line_linked: { enable: false },
            move: { enable: true, speed: 0.6, random: true }
          },
          interactivity: { events: { onhover: { enable: false }, onclick: { enable: false } } },
          retina_detect: true
        });
      }
    } catch (err) {
      console.warn("particlesJS init failed:", err);
    }

    /* ==========================
       Scroll to top button
       ========================== */
    (function () {
      const scrollTopBtn = document.getElementById("scrollTopBtn");
      if (!scrollTopBtn) return;
      const onScroll = () => {
        const show = window.scrollY > 100;
        scrollTopBtn.style.display = show ? "block" : "none";
      };
      window.addEventListener("scroll", onScroll);
      scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
      onScroll();
    })();

    /* ==========================
       User dropdown
       ========================== */
    (function () {
      const userDropdown = document.querySelector(".user-dropdown");
      if (!userDropdown) return;
      const dropdownContent = userDropdown.querySelector(".dropdown-content");
      const arrow = userDropdown.querySelector(".dropdown-arrow");
      const menuToggle = document.getElementById("menu-toggle");

      const toggle = (e) => {
        e.stopPropagation();
        dropdownContent.classList.toggle("active");
        arrow && arrow.classList.toggle("rotated");
      };

      userDropdown.addEventListener("click", toggle);
      document.addEventListener("click", () => {
        dropdownContent.classList.remove("active");
        arrow && arrow.classList.remove("rotated");
      });

      if (menuToggle) {
        menuToggle.addEventListener("change", () => {
          if (!menuToggle.checked) {
            dropdownContent.classList.remove("active");
            arrow && arrow.classList.remove("rotated");
          }
        });
      }
    })();

    /* ==========================
       Testimonial carousel (mouse + touch)
       ========================== */
    (function () {
      const carousel = document.querySelector(".testimonial-carousel");
      const prevBtn = document.getElementById("prev");
      const nextBtn = document.getElementById("next");
      if (!carousel || !prevBtn || !nextBtn) return;

      nextBtn.addEventListener("click", () => carousel.scrollBy({ left: 320, behavior: "smooth" }));
      prevBtn.addEventListener("click", () => carousel.scrollBy({ left: -320, behavior: "smooth" }));

      let isDragging = false, startX = 0, startScroll = 0;

      carousel.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.pageX - carousel.offsetLeft;
        startScroll = carousel.scrollLeft;
      });

      ["mouseleave", "mouseup"].forEach((evt) => carousel.addEventListener(evt, () => (isDragging = false)));

      carousel.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        carousel.scrollLeft = startScroll - (x - startX) * 2;
      });

      carousel.addEventListener("touchstart", (e) => {
        startX = e.touches[0].pageX - carousel.offsetLeft;
        startScroll = carousel.scrollLeft;
      });

      carousel.addEventListener("touchmove", (e) => {
        const x = e.touches[0].pageX - carousel.offsetLeft;
        carousel.scrollLeft = startScroll - (x - startX) * 2;
      });
    })();

    /* ==========================
       Password strength meter (safe)
       ========================== */
    (function () {
      const passwordInput = document.querySelector("#id_password1");
      const strengthBar = document.querySelector("#passwordStrength");
      if (!passwordInput || !strengthBar) return;

      const rules = {
        length: document.getElementById("rule-length"),
        upper: document.getElementById("rule-upper"),
        lower: document.getElementById("rule-lower"),
        number: document.getElementById("rule-number"),
        symbol: document.getElementById("rule-symbol")
      };

      passwordInput.addEventListener("input", () => {
        const value = passwordInput.value;
        const conditions = {
          length: value.length >= 8,
          upper: /[A-Z]/.test(value),
          lower: /[a-z]/.test(value),
          number: /\d/.test(value),
          symbol: /[^A-Za-z0-9]/.test(value)
        };

        Object.keys(conditions).forEach((k) => {
          if (rules[k]) rules[k].classList.toggle("valid", conditions[k]);
        });

        const strength = Object.values(conditions).filter(Boolean).length * 20;
        strengthBar.value = strength;

        // optional styling via CSS variables
        const colorMap = [
          { max: 20, color: "#ff4d4d", glow: "rgba(255,77,77,0.8)" },
          { max: 40, color: "#ffa64d", glow: "rgba(255,166,77,0.8)" },
          { max: 60, color: "#2f82ff", glow: "rgba(47,130,255,0.8)" },
          { max: 100, color: "#00d97e", glow: "rgba(0,217,126,0.8)" }
        ];
        const { color, glow } = colorMap.find(c => strength <= c.max) || colorMap[colorMap.length - 1];
        strengthBar.style.setProperty("--bar-color", color);
        strengthBar.style.setProperty("--bar-glow", glow);
      });
    })();

    /* ==========================
       Testimonial add form toggle
       ========================== */
    (function () {
      const addBtn = document.getElementById("addTestimonialBtn");
      const formDiv = document.getElementById("testimonialForm");
      if (addBtn && formDiv) {
        addBtn.addEventListener("click", () => formDiv.classList.toggle("hidden"));
      }
    })();

    /* ==========================
       LIVE SEARCH SETUP
       ========================== */
    // Ensure `urls` object exists (it should be defined in base template before this script)
    if (typeof urls === "undefined") {
      console.warn("Search URLs not defined (urls variable missing). Live search disabled.");
    } else {
      // Blog search (home and blog pages)
      setupLiveSearch({
        inputId: "blogSearch",
        resultsId: "blogSearchResults",
        apiUrl: urls.blogSearch,
        type: "blog"
      });

      // Optional blog page-specific id (if you use a different id on blog page)
      setupLiveSearch({
        inputId: "blogPageSearch",
        resultsId: "blogPageSearchResults",
        apiUrl: urls.blogSearch,
        type: "blog"
      });

      // Project search (home and projects pages)
      setupLiveSearch({
        inputId: "projectSearch",
        resultsId: "projectSearchResults",
        apiUrl: urls.projectSearch,
        type: "project"
      });

      // Optional projects page-specific id
      setupLiveSearch({
        inputId: "projectPageSearch",
        resultsId: "projectPageSearchResults",
        apiUrl: urls.projectSearch,
        type: "project"
      });
    }
  }); // DOMContentLoaded
})(); // IIFE
