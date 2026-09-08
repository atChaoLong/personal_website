"use client";

import type { ReactNode } from "react";
import SignatureFooter from "./SignatureFooter";

export default function FooterReveal({ children }: { children: ReactNode }) {
  return <div className="footer-reveal">
    {children}
    <div className="signature-reveal" onFocusCapture={event => {
      // A sticky element can be in the viewport but covered by the contact
      // panel. Reveal the whole ending when keyboard navigation reaches it.
      if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) {
        event.currentTarget.parentElement?.scrollIntoView({ block: "end", behavior: "instant" });
      }
    }}><SignatureFooter /></div>
    <span id="signature" className="signature-anchor" aria-hidden="true" />
  </div>;
}
