particlesJS("particles-js", {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 1000
      }
    },
    color: {
      value: "#ffffff"
    },
    shape: {
      type: "circle"
    },
    opacity: {
      value: 0.8,
      random: true
    },
    size: {
      value: 2,
      random: true
    },
    line_linked: {
      enable: false
    },
    move: {
      enable: true,
      speed: 0.6,
      direction: "none",
      random: true,
      straight: false,
      bounce: false
    }
  },
  interactivity: {
    events: {
      onhover: { enable: false },
      onclick: { enable: false }
    }
  },
  retina_detect: true
});


// Show or hide scroll-to-top button
// ===== Scroll to Top =====
const scrollTopBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  scrollTopBtn.style.display =
    document.body.scrollTop > 100 || document.documentElement.scrollTop > 100
      ? "block"
      : "none";
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});


document.addEventListener('DOMContentLoaded', () => {
  const userDropdown = document.querySelector('.user-dropdown');
  if (!userDropdown) return;

  const dropdownContent = userDropdown.querySelector('.dropdown-content');
  const arrow = userDropdown.querySelector('.dropdown-arrow');
  const menuToggle = document.getElementById('menu-toggle');

  const toggleDropdown = (e) => {
    e.stopPropagation();
    dropdownContent.classList.toggle('active');
    arrow.classList.toggle('rotated');
  };

  userDropdown.addEventListener('click', toggleDropdown);

  // Close when clicking outside
  document.addEventListener('click', () => {
    dropdownContent.classList.remove('active');
    arrow.classList.remove('rotated');
  });

  // Optional: close dropdown when mobile menu closes
  if (menuToggle) {
    menuToggle.addEventListener('change', () => {
      if (!menuToggle.checked) {
        dropdownContent.classList.remove('active');
        arrow.classList.remove('rotated');
      }
    });
  }
});
const carousel = document.querySelector('.testimonial-carousel');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let isDragging = false;
let startX, scrollLeft;

// Arrow buttons
nextBtn.addEventListener('click', () => {
  carousel.scrollBy({ left: 320, behavior: 'smooth' });
});

prevBtn.addEventListener('click', () => {
  carousel.scrollBy({ left: -320, behavior: 'smooth' });
});

// Mouse drag
carousel.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.pageX - carousel.offsetLeft;
  scrollLeft = carousel.scrollLeft;
});

carousel.addEventListener('mouseleave', () => {
  isDragging = false;
});

carousel.addEventListener('mouseup', () => {
  isDragging = false;
});

carousel.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - carousel.offsetLeft;
  const walk = (x - startX) * 2; // scroll-fast
  carousel.scrollLeft = scrollLeft - walk;
});

// Touch events for mobile
carousel.addEventListener('touchstart', (e) => {
  startX = e.touches[0].pageX - carousel.offsetLeft;
  scrollLeft = carousel.scrollLeft;
});

carousel.addEventListener('touchmove', (e) => {
  const x = e.touches[0].pageX - carousel.offsetLeft;
  const walk = (x - startX) * 2;
  carousel.scrollLeft = scrollLeft - walk;
});

// password_strength.js
document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.querySelector("#id_password1");
  const strengthBar = document.querySelector("#passwordStrength");
  const rules = {
    length: document.getElementById("rule-length"),
    upper: document.getElementById("rule-upper"),
    lower: document.getElementById("rule-lower"),
    number: document.getElementById("rule-number"),
    symbol: document.getElementById("rule-symbol"),
  };

  if (!passwordInput || !strengthBar) return;

  passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;
    const conditions = {
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /\d/.test(value),
      symbol: /[^A-Za-z0-9]/.test(value),
    };

    // Update visual states
    Object.keys(conditions).forEach((key) =>
      rules[key].classList.toggle("valid", conditions[key])
    );

    // Compute strength
    const strength = Object.values(conditions).filter(Boolean).length * 20;
    strengthBar.value = strength;

    // Color transitions
    const colorMap = [
      { max: 20, color: "#ff4d4d", glow: "rgba(255,77,77,0.8)" },
      { max: 40, color: "#ffa64d", glow: "rgba(255,166,77,0.8)" },
      { max: 60, color: "#2f82ff", glow: "rgba(47,130,255,0.8)" },
      { max: 100, color: "#00d97e", glow: "rgba(0,217,126,0.8)" },
    ];
    const { color, glow } = colorMap.find((c) => strength <= c.max);

    strengthBar.style.setProperty("--bar-color", color);
    strengthBar.style.setProperty("--bar-glow", glow);
  });
});


document.addEventListener("DOMContentLoaded", function() {
  const addBtn = document.getElementById("addTestimonialBtn");
  const formDiv = document.getElementById("testimonialForm");

  if (addBtn && formDiv) {
    addBtn.addEventListener("click", () => {
      formDiv.classList.toggle("hidden");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // --- Blog Search ---
  const blogInput = document.getElementById("blogSearch");
  const blogBtn = document.getElementById("blogSearchBtn");
  const blogResults = document.getElementById("blogSearchResults");

  if (blogBtn) {
    blogBtn.addEventListener("click", () => {
      const query = blogInput.value.trim();
      if (!query) return;
      fetch(`${urls.blogSearch}?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          blogResults.innerHTML = "";
          if (data.length === 0) {
            blogResults.innerHTML = "<li>No matching posts found.</li>";
          } else {
            data.forEach(item => {
              const li = document.createElement("li");
              li.innerHTML = `<a href="${item.url}">${item.title}</a>`;
              blogResults.appendChild(li);
            });
          }
        });
    });
  }

  // --- Project Search ---
  const projectInput = document.getElementById("projectSearch");
  const projectBtn = document.getElementById("projectSearchBtn");
  const projectResults = document.getElementById("projectSearchResults");

  if (projectBtn) {
    projectBtn.addEventListener("click", () => {
      const query = projectInput.value.trim();
      if (!query) return;
      fetch(`${urls.projectSearch}?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          projectResults.innerHTML = "";
          if (data.length === 0) {
            projectResults.innerHTML = "<li>No matching projects found.</li>";
          } else {
            data.forEach(item => {
              const li = document.createElement("li");
              li.innerHTML = `<a href="${item.url}">${item.title}</a>`;
              projectResults.appendChild(li);
            });
          }
        });
    });
  }

  // Optional: press Enter to trigger search
  blogInput?.addEventListener("input", () => { blogBtn.click(); });
  projectInput?.addEventListener("input", () => { projectBtn.click(); });

});
