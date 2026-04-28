document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.getElementById("fpWrapper");
  const sections = document.querySelectorAll(".fp-section");
  const dots = document.querySelectorAll(".fp-dot");
  const navLinks = document.querySelectorAll(".nav-links a");
  const counterCurrent = document.querySelector(".fp-current");
  const totalPages = sections.length;

  let currentIndex = 0;
  let isAnimating = false;
  const animDuration = 850;

  // ===== Navigate to page =====
  function goToPage(index) {
    if (index < 0 || index >= totalPages || index === currentIndex || isAnimating) return;
    isAnimating = true;

    // Remove active from old section
    sections[currentIndex].classList.remove("active");

    currentIndex = index;
    wrapper.style.transform = `translateY(-${currentIndex * 100}vh)`;

    // Update dots
    dots.forEach((d) => d.classList.remove("active"));
    dots[currentIndex].classList.add("active");

    // Update counter
    counterCurrent.textContent = String(currentIndex + 1).padStart(2, "0");

    // Update nav active state
    const sectionIds = ["#hero", "#about", "#experience", "#activities", "#skills", "#contact"];
    navLinks.forEach((link) => {
      link.style.color = "";
      if (link.getAttribute("href") === sectionIds[currentIndex]) {
        link.style.color = "#ffffff";
      }
    });

    // Activate new section after a brief delay for transition start
    setTimeout(() => {
      sections[currentIndex].classList.add("active");
      triggerSectionEffects(currentIndex);
    }, 100);

    // Unlock after animation completes
    setTimeout(() => {
      isAnimating = false;
    }, animDuration);
  }

  // ===== Section-specific effects =====
  let skillsAnimated = false;
  function triggerSectionEffects(index) {
    // Skills section: animate bars
    if (sections[index].id === "skills" && !skillsAnimated) {
      skillsAnimated = true;
      document.querySelectorAll(".skill-fill").forEach((bar) => {
        bar.style.width = bar.getAttribute("data-width") + "%";
      });
    }
  }

  // ===== Initialize first page =====
  sections[0].classList.add("active");
  triggerSectionEffects(0);

  // ===== Mouse wheel =====
  let wheelAccum = 0;
  const wheelThreshold = 50;
  let wheelTimer = null;

  window.addEventListener("wheel", (e) => {
    // Allow scrolling inside fp-scrollable elements
    const scrollable = e.target.closest(".fp-scrollable");
    if (scrollable) {
      const atTop = scrollable.scrollTop <= 0;
      const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 2;
      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
        return; // Let the inner scroll happen
      }
    }

    e.preventDefault();
    if (isAnimating) return;

    wheelAccum += e.deltaY;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelAccum = 0; }, 200);

    if (Math.abs(wheelAccum) >= wheelThreshold) {
      if (wheelAccum > 0) {
        goToPage(currentIndex + 1);
      } else {
        goToPage(currentIndex - 1);
      }
      wheelAccum = 0;
    }
  }, { passive: false });

  // ===== Keyboard =====
  window.addEventListener("keydown", (e) => {
    if (isAnimating) return;
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      goToPage(currentIndex + 1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      goToPage(currentIndex - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goToPage(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goToPage(totalPages - 1);
    }
  });

  // ===== Touch =====
  let touchStartY = 0;
  let touchStartTime = 0;

  window.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    if (isAnimating) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    const dt = Date.now() - touchStartTime;
    if (Math.abs(dy) > 50 && dt < 600) {
      if (dy > 0) goToPage(currentIndex + 1);
      else goToPage(currentIndex - 1);
    }
  }, { passive: true });

  // ===== Dot clicks =====
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goToPage(parseInt(dot.getAttribute("data-index")));
    });
  });

  // ===== Nav link clicks =====
  const sectionMap = {};
  sections.forEach((s, i) => { sectionMap["#" + s.id] = i; });

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href");
      if (sectionMap[href] !== undefined) {
        goToPage(sectionMap[href]);
      }
    });
  });

  // ===== Scroll hint click (go to next page) =====
  const scrollHint = document.querySelector(".scroll-hint");
  if (scrollHint) {
    scrollHint.style.cursor = "pointer";
    scrollHint.addEventListener("click", () => {
      goToPage(currentIndex + 1);
    });
  }
});