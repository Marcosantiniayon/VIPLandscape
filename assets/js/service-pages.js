// Track outbound contact clicks when GA4 is present.
window.addEventListener("DOMContentLoaded", () => {
  const trackedLinks = document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]');

  trackedLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (typeof window.gtag !== "function") {
        return;
      }

      const href = link.getAttribute("href") || "";
      const isPhoneLink = href.startsWith("tel:");
      const eventName = isPhoneLink ? "phone_click" : "email_click";

      window.gtag("event", eventName, {
        contact_method: isPhoneLink ? "phone" : "email",
        page_path: window.location.pathname,
        page_title: document.title
      });
    });
  });
});
