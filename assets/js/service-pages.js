// Track outbound contact clicks when GA4 is present.
window.addEventListener("DOMContentLoaded", () => {
  const trackedLinks = document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]');

  trackedLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (typeof window.gtag !== "function") {
        return;
      }

      const href = link.getAttribute("href") || "";
      const eventName = href.startsWith("tel:") ? "phone_click" : "email_click";

      window.gtag("event", eventName, {
        link_url: href,
        page_path: window.location.pathname,
        page_title: document.title
      });
    });
  });
});
