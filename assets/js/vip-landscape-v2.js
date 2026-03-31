window.addEventListener("load", () => {
  const heroBg = document.getElementById("heroBg");

  if (heroBg) {
    heroBg.classList.add("loaded");
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".service-card, .pillar, .testi-card, .step, .portfolio-card, .city").forEach((el) => {
  el.classList.add("fade-in");
  observer.observe(el);
});

document.querySelectorAll(".service-card").forEach((el, i) => {
  el.style.transitionDelay = i * 70 + "ms";
});

document.querySelectorAll(".step").forEach((el, i) => {
  el.style.transitionDelay = i * 80 + "ms";
});

document.querySelectorAll(".portfolio-card").forEach((el, i) => {
  el.style.transitionDelay = i * 90 + "ms";
});

document.querySelectorAll(".city").forEach((el, i) => {
  el.style.transitionDelay = i * 20 + "ms";
});

const navMenuToggle = document.getElementById("navMenuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const MOBILE_NAV_BREAKPOINT = 1024;

function setMobileMenuOpen(isOpen) {
  if (!navMenuToggle || !mobileMenu) {
    return;
  }

  mobileMenu.hidden = !isOpen;
  navMenuToggle.classList.toggle("is-open", isOpen);
  navMenuToggle.setAttribute("aria-expanded", String(isOpen));
  navMenuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  document.body.classList.toggle("no-scroll", isOpen);
}

if (navMenuToggle && mobileMenu) {
  navMenuToggle.addEventListener("click", () => {
    const isOpen = navMenuToggle.getAttribute("aria-expanded") === "true";
    setMobileMenuOpen(!isOpen);
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMobileMenuOpen(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMobileMenuOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > MOBILE_NAV_BREAKPOINT) {
      setMobileMenuOpen(false);
    }
  });
}

const proposalForm = document.getElementById("proposalForm");
const proposalStatus = document.getElementById("proposalStatus");
const proposalError = document.getElementById("proposalError");
const requestSummaryField = document.getElementById("requestSummaryField");
const otherServiceCheckbox = document.getElementById("otherServiceCheckbox");
const otherServiceField = document.getElementById("otherServiceField");
const groupCheckboxes = Array.from(document.querySelectorAll('input[name="Service Groups[]"]'));
const serviceCheckboxes = Array.from(document.querySelectorAll('input[name="Specific Services[]"]'));
const groupPanels = Array.from(document.querySelectorAll("[data-group-panel]"));

const serviceGroupMap = {
  "Landscape Maintenance": "ongoing-care",
  "Tree & Shrub Care": "ongoing-care",
  "Cleanup / One-Time Service": "ongoing-care",
  "HOA / Community Grounds Management": "ongoing-care",
  "Commercial Property Grounds Management": "ongoing-care",
  "Irrigation & Water Management": "water-systems",
  "Landscape Enhancements": "upgrades-installations",
  "Hardscape Services": "upgrades-installations",
  "Landscape Lighting": "upgrades-installations",
  "Pergolas & Shade Structures": "upgrades-installations",
  "Outdoor Kitchens & BBQ Areas": "upgrades-installations",
  "Not Sure Yet": "need-help-choosing",
  Other: "need-help-choosing"
};

function updateRequestSummary() {
  const selectedGroups = groupCheckboxes
    .filter((input) => input.checked)
    .map((input) => input.value);

  const selectedServices = serviceCheckboxes
    .filter((input) => input.checked)
    .map((input) => input.value);

  const summaryParts = [];

  if (selectedGroups.length > 0) {
    summaryParts.push(`Groups: ${selectedGroups.join(", ")}`);
  }

  if (selectedServices.length > 0) {
    summaryParts.push(`Specific services: ${selectedServices.join(", ")}`);
  }

  if (requestSummaryField) {
    requestSummaryField.value = summaryParts.join(" | ");
  }
}

function syncGroupPanels() {
  groupPanels.forEach((panel) => {
    const panelKey = panel.getAttribute("data-group-panel");
    const groupInput = groupCheckboxes.find((input) => input.dataset.groupToggle === panelKey);
    const isActive = Boolean(groupInput?.checked);

    panel.hidden = !isActive;

    if (!isActive) {
      panel.querySelectorAll('input[type="checkbox"]').forEach((input) => {
        input.checked = false;
      });
    }
  });
}

function syncOtherServiceField() {
  if (!otherServiceCheckbox || !otherServiceField) {
    return;
  }

  otherServiceField.hidden = !otherServiceCheckbox.checked;

  if (!otherServiceCheckbox.checked) {
    const otherServiceInput = otherServiceField.querySelector("input");

    if (otherServiceInput) {
      otherServiceInput.value = "";
    }
  }
}

serviceCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    syncOtherServiceField();
    updateRequestSummary();
  });
});

groupCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    syncGroupPanels();
    syncOtherServiceField();
    updateRequestSummary();
  });
});

document.querySelectorAll("[data-proposal-service]").forEach((link) => {
  link.addEventListener("click", () => {
    const targetValue = link.getAttribute("data-proposal-service");
    const targetGroupKey = serviceGroupMap[targetValue];
    const targetGroup = groupCheckboxes.find((input) => input.dataset.groupToggle === targetGroupKey);
    const targetCheckbox = serviceCheckboxes.find((input) => input.value === targetValue);

    if (targetGroup) {
      targetGroup.checked = true;
      syncGroupPanels();
    }

    if (targetCheckbox) {
      targetCheckbox.checked = true;
    }

    syncOtherServiceField();
    updateRequestSummary();
  });
});

if (proposalForm) {
  proposalForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    syncGroupPanels();
    syncOtherServiceField();
    updateRequestSummary();

    if (!proposalForm.checkValidity()) {
      proposalForm.reportValidity();
      return;
    }

    const endpoint = proposalForm.getAttribute("action") ?? "";
    const submitButton = proposalForm.querySelector(".proposal-submit");
    const originalButtonText = submitButton?.textContent ?? "";

    if (proposalStatus) {
      proposalStatus.hidden = true;
    }

    if (proposalError) {
      proposalError.hidden = true;
    }

    if (!endpoint || endpoint.includes("REPLACE_WITH_FORM_ID")) {
      if (proposalError) {
        proposalError.textContent = "Formspree endpoint is not set yet. Replace REPLACE_WITH_FORM_ID with your real Formspree form ID.";
        proposalError.hidden = false;
      }

      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json"
        },
        body: new FormData(proposalForm)
      });

      if (response.ok) {
        proposalForm.reset();
        syncGroupPanels();
        syncOtherServiceField();
        updateRequestSummary();

        if (proposalStatus) {
          proposalStatus.hidden = false;
        }
      } else {
        let errorMessage = "We couldn't send your request right now. Please try again in a few minutes.";

        try {
          const payload = await response.json();

          if (Array.isArray(payload?.errors) && payload.errors[0]?.message) {
            errorMessage = payload.errors[0].message;
          }
        } catch {
          // Keep default message when no JSON payload is returned.
        }

        if (response.status === 429) {
          errorMessage = "Too many requests right now. Please wait a minute and try again.";
        }

        if (proposalError) {
          proposalError.textContent = errorMessage;
          proposalError.hidden = false;
        }
      }
    } catch {
      if (proposalError) {
        proposalError.textContent = "Network error while sending your request. Check your connection and try again.";
        proposalError.hidden = false;
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}

syncGroupPanels();
updateRequestSummary();
syncOtherServiceField();
