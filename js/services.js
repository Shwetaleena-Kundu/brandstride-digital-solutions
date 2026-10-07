/* =====================================
   BRANDSTRIDE — SERVICES JAVASCRIPT
   Feedback carousel
===================================== */

(() => {
  function initializeServices() {
    const carousel = document.querySelector(
      "[data-feedback-carousel]"
    );

    if (!carousel) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const slides = [
      ...carousel.querySelectorAll("[data-feedback-slide]")
    ];

    const dots = [
      ...carousel.querySelectorAll("[data-feedback-dot]")
    ];

    const controls = carousel.querySelector("[data-feedback-controls]");
    const pagination = carousel.querySelector("[data-feedback-pagination]");
    const previous = carousel.querySelector("[data-feedback-prev]");
    const next = carousel.querySelector("[data-feedback-next]");
    const toggle = carousel.querySelector("[data-feedback-toggle]");
    const toggleIcon = carousel.querySelector("[data-feedback-toggle-icon]");
    const status = carousel.querySelector("[data-feedback-status]");

    if (
      !slides.length ||
      !controls ||
      !pagination ||
      !previous ||
      !next ||
      !toggle
    ) {
      return;
    }

    let currentIndex = 0;
    let playing = !reducedMotion.matches;
    let hovering = false;
    let timer = null;

    /* SHOW ONE SLIDE */

    function showSlide(index, announce = false) {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.hidden = slideIndex !== currentIndex;
      });

      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === currentIndex;

        dot.classList.toggle("is-active", active);

        if (active) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });

      if (status) {
        status.textContent = announce
          ? `Feedback ${currentIndex + 1} of ${slides.length}`
          : "";
      }
    }

    /* UPDATE AUTOMATIC ROTATION */

    function updateRotation() {
      window.clearInterval(timer);
      timer = null;

      toggle.setAttribute(
        "aria-label",
        playing
          ? "Pause automatic feedback rotation"
          : "Start automatic feedback rotation"
      );

      toggle.setAttribute("aria-pressed", String(playing));

      if (toggleIcon) {
        toggleIcon.textContent = playing ? "Ⅱ" : "▶";
      }

      if (
        !playing ||
        hovering ||
        document.hidden ||
        slides.length < 2
      ) {
        return;
      }

      timer = window.setInterval(() => {
        // Keep the current slide while the enquiry popup is open.
        if (document.querySelector("[data-enquiry-dialog][open]")) {
          return;
        }

        showSlide(currentIndex + 1);
      }, 6000);
    }

    /* MANUAL SELECTION STOPS AUTOMATIC ROTATION */

    function chooseSlide(index) {
      playing = false;
      showSlide(index, true);
      updateRotation();
    }

    previous.addEventListener("click", () => {
      chooseSlide(currentIndex - 1);
    });

    next.addEventListener("click", () => {
      chooseSlide(currentIndex + 1);
    });

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        chooseSlide(index);
      });
    });

    toggle.addEventListener("click", () => {
      playing = !playing;
      updateRotation();
    });

    /* PAUSE WHILE HOVERING */

    carousel.addEventListener("mouseenter", () => {
      hovering = true;
      updateRotation();
    });

    carousel.addEventListener("mouseleave", () => {
      hovering = false;
      updateRotation();
    });

    /* KEYBOARD FOCUS STOPS ROTATION */

    carousel.addEventListener("focusin", () => {
      playing = false;
      updateRotation();
    });

    /* STOP TIMER WHEN THE TAB IS HIDDEN */

    document.addEventListener("visibilitychange", updateRotation);

    /* RESPECT A REDUCED-MOTION PREFERENCE CHANGE */

    reducedMotion.addEventListener("change", (event) => {
      if (event.matches) {
        playing = false;
        updateRotation();
      }
    });

    /* INITIAL STATE */

    carousel.classList.add("is-ready");

    showSlide(0);

    controls.hidden = slides.length < 2;
    pagination.hidden = slides.length < 2;

    updateRotation();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeServices,
      { once: true }
    );
  } else {
    initializeServices();
  }
})();