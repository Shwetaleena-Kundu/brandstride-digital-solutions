/* =====================================
   BRANDSTRIDE — SHARED JAVASCRIPT
   Used on all four pages
===================================== */

(() => {
  function initializeWebsite() {
    const desktopQuery = window.matchMedia("(min-width: 851px)");
    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    /* =====================================
       1. MOBILE NAVIGATION
    ===================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const navigation = document.querySelector("#main-navigation");

    function setMenuState(isOpen) {
      if (!menuToggle || !navigation) return;

      navigation.classList.toggle("is-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
    }

    if (menuToggle && navigation) {
      menuToggle.addEventListener("click", () => {
        const isOpen =
          menuToggle.getAttribute("aria-expanded") === "true";

        setMenuState(!isOpen);
      });

      navigation.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
          setMenuState(false);
        }
      });

      document.addEventListener("click", (event) => {
        const isOpen =
          menuToggle.getAttribute("aria-expanded") === "true";

        if (!isOpen || event.target.closest(".site-header")) return;

        const focusWasInMenu =
          navigation.contains(document.activeElement);

        setMenuState(false);

        if (focusWasInMenu) {
          menuToggle.focus();
        }
      });

      document.addEventListener("keydown", (event) => {
        const isOpen =
          menuToggle.getAttribute("aria-expanded") === "true";

        if (event.key === "Escape" && isOpen) {
          setMenuState(false);
          menuToggle.focus();
        }
      });

      desktopQuery.addEventListener("change", () => {
        const focusedElement = document.activeElement;

        const focusWillBeHidden =
          !desktopQuery.matches &&
          navigation.contains(focusedElement);

        setMenuState(false);

        if (focusWillBeHidden) {
          menuToggle.focus();
        } else if (
          desktopQuery.matches &&
          focusedElement === menuToggle
        ) {
          navigation.querySelector("a")?.focus();
        }
      });

      setMenuState(false);
    }

    /* =====================================
       2. SCROLL REVEALS
    ===================================== */

    const revealElements = document.querySelectorAll(".reveal");
    let revealObserver = null;

    function showAllContent() {
      revealObserver?.disconnect();
      document.documentElement.classList.remove("motion-enabled");

      revealElements.forEach((element) => {
        element.classList.add("is-visible");
      });
    }

    const staggerGroups = document.querySelectorAll(
      [
        ".challenge-grid",
        ".services-grid",
        ".process-grid",
        ".industries-grid",
        ".about-values-grid",
        ".about-team-grid",
        ".about-process-grid",
        ".campaign-projects-grid"
      ].join(", ")
    );

    staggerGroups.forEach((group) => {
      group.querySelectorAll(".reveal").forEach((card, index) => {
        card.style.setProperty(
          "--reveal-delay",
          `${(index % 3) * 80}ms`
        );
      });
    });

    if (
      revealElements.length &&
      !motionQuery.matches &&
      "IntersectionObserver" in window
    ) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.08 }
      );

      document.documentElement.classList.add("motion-enabled");

      revealElements.forEach((element) => {
        revealObserver.observe(element);
      });
    } else {
      showAllContent();
    }

    motionQuery.addEventListener("change", (event) => {
      if (event.matches) {
        showAllContent();
      }
    });

    /* =====================================
       3. FAQ — ONE OPEN PER FAQ GROUP
    ===================================== */

    document.querySelectorAll(".faq-list").forEach((list) => {
      const items = [...list.querySelectorAll(".faq-item")];

      items.forEach((item) => {
        const summary = item.querySelector("summary");

        summary?.addEventListener("click", () => {
          // The browser opens this item after the click handler.
          if (item.open) return;

          items.forEach((otherItem) => {
            if (otherItem !== item) {
              otherItem.open = false;
            }
          });
        });
      });
    });

    /* =====================================
       4. CURRENT COPYRIGHT YEAR
    ===================================== */

    const copyrightYear = document.querySelector("#copyright-year");

    if (copyrightYear) {
      copyrightYear.textContent = new Date().getFullYear();
    }

    /* =====================================
       5. SHARED DEMO FORM HANDLER
    ===================================== */

    function initializeDemoForm(form, submitButton, status) {
      if (!form || !submitButton || !status) return;

      const textFields = form.querySelectorAll(
        [
          'input[type="text"]',
          'input[type="email"]',
          'input[type="tel"]',
          'input[type="url"]',
          "textarea"
        ].join(", ")
      );

      function prepareField(field) {
        field.value = field.value.trim();

        field.setCustomValidity(
          field.required && !field.value
            ? "Please fill out this field."
            : ""
        );
      }

      textFields.forEach((field) => {
        field.addEventListener("blur", () => {
          prepareField(field);
        });

        field.addEventListener("input", () => {
          field.setCustomValidity("");
          field.removeAttribute("aria-invalid");

          status.textContent = "";
          status.classList.remove("is-error");
        });
      });

      form.addEventListener(
        "invalid",
        (event) => {
          event.target.setAttribute("aria-invalid", "true");
        },
        true
      );

      form.addEventListener("change", () => {
        status.textContent = "";
        status.classList.remove("is-error");
      });

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        textFields.forEach(prepareField);

        if (!form.reportValidity()) return;

        status.classList.remove("is-error");
        status.textContent =
          "Thank you! Your enquiry passed validation. " +
          "This is an academic project demo; no message has been sent.";

        form.reset();

        form.querySelectorAll("[aria-invalid]").forEach((field) => {
          field.removeAttribute("aria-invalid");
        });

        textFields.forEach((field) => {
          field.setCustomValidity("");
        });
      });

      // Enable only after the submission handler is attached.
      submitButton.disabled = false;
    }

    /* =====================================
       6. CONTACT PAGE FORM
    ===================================== */

    const contactForm = document.querySelector("[data-contact-form]");

    if (contactForm) {
      initializeDemoForm(
        contactForm,
        contactForm.querySelector("[data-contact-submit]"),
        contactForm.querySelector("[data-contact-status]")
      );

      // Example: contact.html?service=seo
      const requestedService = new URLSearchParams(
        window.location.search
      ).get("service");

      if (requestedService) {
        const choices = contactForm.querySelectorAll(
          'input[name="services"]'
        );

        choices.forEach((choice) => {
          if (choice.value === requestedService) {
            choice.checked = true;
          }
        });
      }
    }

    /* =====================================
       7. ENQUIRE NOW POPUP
    ===================================== */

    const dialog = document.querySelector("[data-enquiry-dialog]");
    const enquiryTriggers = document.querySelectorAll(
      "[data-enquiry-open]"
    );

    if (dialog && typeof dialog.showModal === "function") {
      let openingTrigger = null;
      let startedOutside = false;

      const enquiryForm = dialog.querySelector("[data-enquiry-form]");
      const enquiryStatus = dialog.querySelector("[data-enquiry-status]");

      initializeDemoForm(
        enquiryForm,
        dialog.querySelector("[data-enquiry-submit]"),
        enquiryStatus
      );

      enquiryTriggers.forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
          // Keep normal new-tab behaviour for modified link clicks.
          if (
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          event.preventDefault();

          if (dialog.open) return;

          openingTrigger = trigger;
          setMenuState(false);

          if (enquiryStatus) {
            enquiryStatus.textContent = "";
            enquiryStatus.classList.remove("is-error");
          }

          dialog.showModal();
          document.body.classList.add("enquiry-is-open");

          dialog.querySelector("#enquiry-name")?.focus({
            preventScroll: true
          });
        });
      });

      // The × button's method="dialog" form closes it natively.
      // Escape also closes a native modal dialog.
      dialog.addEventListener("close", () => {
        document.body.classList.remove("enquiry-is-open");
        startedOutside = false;

        // On mobile, the navbar link is now hidden.
        // Return focus to the visible hamburger instead.
        const triggerIsInsideMobileMenu =
          !desktopQuery.matches &&
          openingTrigger &&
          navigation?.contains(openingTrigger);

        const focusTarget = triggerIsInsideMobileMenu
          ? menuToggle
          : openingTrigger;

        focusTarget?.focus({ preventScroll: true });
        openingTrigger = null;
      });

      function isOutsideDialog(event) {
        const bounds = dialog.getBoundingClientRect();

        return (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        );
      }

      dialog.addEventListener("pointerdown", (event) => {
        startedOutside =
          event.target === dialog && isOutsideDialog(event);
      });

      dialog.addEventListener("pointercancel", () => {
        startedOutside = false;
      });

      dialog.addEventListener("click", (event) => {
        if (
          startedOutside &&
          event.target === dialog &&
          isOutsideDialog(event)
        ) {
          dialog.close();
        }

        startedOutside = false;
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeWebsite,
      { once: true }
    );
  } else {
    initializeWebsite();
  }
})();