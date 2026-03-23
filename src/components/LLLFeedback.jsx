import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { loadQuickFeedback } from "../utils/loadQuickFeedback";

/**
 * Props:
 *  - orgId, promptId, apiBase: required (from your snippet)
 *  - src: script URL (optional; defaults to your provided URL)
 *  - mode: "inline" (matches your snippet)
 *  - theme: "auto" (matches your snippet)
 *  - source: optional; falls back to route pathname
 *  - style: optional inline styles for container layout
 */
export default function LLLFeedback({
  orgId = "EF86021F-DDFD-470D-BE07-1357DBA8FBFC",
  promptId = "7c949c0e-501b-4e0a-ac0b-3db60a13c9d5",
  apiBase = "https://rmrlllwebapi.azurewebsites.net",
  src = "https://delightful-desert-0ea5f300f.1.azurestaticapps.net/embed/quickfeedback-noiframe.js",
  mode = "inline",
  theme = "auto",
  source,
  style,
}) {
  const { pathname } = useLocation();

  useEffect(() => {
    loadQuickFeedback(src);
  }, [src]);

  // Custom elements work fine in React; kebab-case attributes pass through.
  return (
    <div style={style}>
      <lll-feedback
        org-id={orgId}
        prompt-id={promptId}
        api-base={apiBase}
        mode={mode}
        theme={theme}
        source={source || pathname}
      />
    </div>
  );
}
