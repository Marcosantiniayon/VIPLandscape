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

const portfolioCards = Array.from(document.querySelectorAll(".portfolio-card"));
const portfolioMoreBtn = document.getElementById("portfolioMoreBtn");
const portfolioSection = document.getElementById("portfolio");
const extraPortfolioCards = portfolioCards.filter((card) => card.dataset.portfolioExtra === "true");

let portfolioExpanded = false;

let activeLightboxIndex = 0;
let lightboxElements = null;

function ensurePortfolioImageLoaded(card) {
  const image = card.querySelector("img");

  if (!image) {
    return;
  }

  if (!image.getAttribute("src")) {
    const source = image.dataset.src;

    if (source) {
      image.setAttribute("src", source);
      image.removeAttribute("data-src");
    }
  }
}

function getVisiblePortfolioCards() {
  return portfolioCards.filter((card) => {
    if (card.hidden) {
      return false;
    }

    const image = card.querySelector("img");
    return Boolean(image?.getAttribute("src"));
  });
}

function getVisiblePortfolioImages() {
  return getVisiblePortfolioCards()
    .map((card) => card.querySelector("img"))
    .filter((img) => Boolean(img));
}

function waitForImageReady(image) {
  if (!image) {
    return Promise.resolve();
  }

  image.loading = "eager";

  if (image.complete && image.naturalWidth > 0) {
    return Promise.resolve();
  }

  if (typeof image.decode === "function") {
    return image.decode().catch(() => {
      // Fallback to load events if decode fails.
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    });
  }

  return new Promise((resolve) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  });
}

async function preloadExtraPortfolioImages() {
  const tasks = extraPortfolioCards.map((card) => {
    ensurePortfolioImageLoaded(card);
    return waitForImageReady(card.querySelector("img"));
  });

  await Promise.all(tasks);
}

async function setPortfolioExpanded(isExpanded, options = {}) {
  const { shouldScrollOnCollapse = false } = options;
  portfolioExpanded = isExpanded;

  if (portfolioExpanded) {
    if (portfolioMoreBtn) {
      portfolioMoreBtn.disabled = true;
      portfolioMoreBtn.textContent = "Loading...";
    }

    await preloadExtraPortfolioImages();

    extraPortfolioCards.forEach((card) => {
      ensurePortfolioImageLoaded(card);
      card.hidden = false;
      card.classList.remove("fade-in");
      card.classList.add("visible");
      card.style.transitionDelay = "0ms";
      observer.unobserve(card);
    });
  } else {
    extraPortfolioCards.forEach((card) => {
      card.hidden = true;
    });

    if (lightboxElements && !lightboxElements.lightbox.hidden) {
      closeLightbox();
    }

    if (shouldScrollOnCollapse) {
      portfolioSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (portfolioMoreBtn) {
    portfolioMoreBtn.disabled = false;
    portfolioMoreBtn.textContent = portfolioExpanded ? "Show Less Work" : "Show More Work";
    portfolioMoreBtn.setAttribute("aria-expanded", String(portfolioExpanded));
  }
}

if (portfolioMoreBtn) {
  if (extraPortfolioCards.length === 0) {
    portfolioMoreBtn.hidden = true;
  } else {
    setPortfolioExpanded(false);
    portfolioMoreBtn.addEventListener("click", async () => {
      const collapsing = portfolioExpanded;
      await setPortfolioExpanded(!portfolioExpanded, {
        shouldScrollOnCollapse: collapsing
      });
    });
  }
}

function ensureLightboxElements() {
  if (lightboxElements) {
    return lightboxElements;
  }

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Portfolio image viewer");
  lightbox.hidden = true;

  lightbox.innerHTML = `
    <div class="lightbox-dialog">
      <button type="button" class="lightbox-close" aria-label="Close image viewer">&#10005;</button>
      <button type="button" class="lightbox-prev" aria-label="Show previous image">&#10094;</button>
      <img class="lightbox-image" alt="">
      <button type="button" class="lightbox-next" aria-label="Show next image">&#10095;</button>
      <div class="lightbox-caption" aria-live="polite"></div>
    </div>
  `;

  document.body.append(lightbox);

  const closeButton = lightbox.querySelector(".lightbox-close");
  const prevButton = lightbox.querySelector(".lightbox-prev");
  const nextButton = lightbox.querySelector(".lightbox-next");
  const image = lightbox.querySelector(".lightbox-image");
  const caption = lightbox.querySelector(".lightbox-caption");

  closeButton?.addEventListener("click", () => closeLightbox());
  prevButton?.addEventListener("click", () => showLightboxImage(activeLightboxIndex - 1));
  nextButton?.addEventListener("click", () => showLightboxImage(activeLightboxIndex + 1));

  lightbox.addEventListener("click", (event) => {
    const target = event.target;
    const clickedImage = target instanceof Element && target.closest(".lightbox-image");
    const clickedNavigation = target instanceof Element && target.closest(".lightbox-prev, .lightbox-next");

    if (!clickedImage && !clickedNavigation) {
      closeLightbox();
    }
  });

  lightboxElements = {
    lightbox,
    image,
    caption,
    closeButton
  };

  return lightboxElements;
}

function showLightboxImage(index) {
  const visibleImages = getVisiblePortfolioImages();

  if (!visibleImages.length) {
    return;
  }

  const lightbox = ensureLightboxElements();
  activeLightboxIndex = (index + visibleImages.length) % visibleImages.length;

  const currentImage = visibleImages[activeLightboxIndex];
  const source = currentImage.getAttribute("src") ?? "";
  const alt = currentImage.getAttribute("alt") ?? "Portfolio image";

  if (lightbox.image) {
    lightbox.image.setAttribute("src", source);
    lightbox.image.setAttribute("alt", alt);
  }

  if (lightbox.caption) {
    lightbox.caption.textContent = `${activeLightboxIndex + 1} / ${visibleImages.length}`;
  }
}

function openLightbox(index) {
  const lightbox = ensureLightboxElements();

  showLightboxImage(index);

  lightbox.lightbox.hidden = false;
  requestAnimationFrame(() => {
    lightbox.lightbox.classList.add("is-open");
  });

  document.body.classList.add("lightbox-open");
  lightbox.closeButton?.focus();
}

function closeLightbox() {
  const lightbox = ensureLightboxElements();

  lightbox.lightbox.classList.remove("is-open");

  window.setTimeout(() => {
    if (!lightbox.lightbox.classList.contains("is-open")) {
      lightbox.lightbox.hidden = true;
    }
  }, 200);

  document.body.classList.remove("lightbox-open");
}

if (portfolioCards.length > 0) {
  portfolioCards.forEach((card, index) => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Open portfolio image ${index + 1}`);

    card.addEventListener("click", () => {
      const visibleCards = getVisiblePortfolioCards();
      const visibleIndex = visibleCards.indexOf(card);

      if (visibleIndex > -1) {
        openLightbox(visibleIndex);
      }
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const visibleCards = getVisiblePortfolioCards();
        const visibleIndex = visibleCards.indexOf(card);

        if (visibleIndex > -1) {
          openLightbox(visibleIndex);
        }
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!lightboxElements || lightboxElements.lightbox.hidden) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    } else if (event.key === "ArrowLeft") {
      showLightboxImage(activeLightboxIndex - 1);
    } else if (event.key === "ArrowRight") {
      showLightboxImage(activeLightboxIndex + 1);
    }
  });
}

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
