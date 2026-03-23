// Loads the web component script once
const DEFAULT_SRC =
  "https://delightful-desert-0ea5f300f.1.azurestaticapps.net/embed/quickfeedback-noiframe.js";

let injected = false;
export function loadQuickFeedback(src = DEFAULT_SRC) {
  if (injected) return;
  if (typeof window === "undefined") return; // safety for SSR
  if (document.querySelector(`script[src="${src}"]`)) {
    injected = true;
    return;
  }
  const s = document.createElement("script");
  s.src = src;
  s.defer = true;
  document.head.appendChild(s);
  injected = true;
}
