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

const proposalForm = document.getElementById("proposalForm");
const proposalNext = document.getElementById("proposalNext");
const proposalStatus = document.getElementById("proposalStatus");
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

if (proposalNext) {
  const nextUrl = new URL(window.location.href);

  nextUrl.searchParams.set("proposal", "success");
  nextUrl.hash = "contact";
  proposalNext.value = nextUrl.toString();
}

if (proposalStatus) {
  const params = new URLSearchParams(window.location.search);

  if (params.get("proposal") === "success") {
    proposalStatus.hidden = false;
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
  proposalForm.addEventListener("submit", () => {
    syncGroupPanels();
    syncOtherServiceField();
    updateRequestSummary();
  });
}

syncGroupPanels();
updateRequestSummary();
syncOtherServiceField();
