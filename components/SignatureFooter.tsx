"use client";

import PixelText from "./PixelText";
import { useLocale } from "./LocaleProvider";

export default function SignatureFooter() {
  const { t: { signature: s } } = useLocale();
  return (
    <footer className="signature-footer" id="signature" aria-label={s.label}>
      <div className="signature-meta"><span><i />{s.human}</span><span>{s.play}</span></div>
      <div className="signature-text-wrapper"><PixelText text="ATCHAOLONG" actionLabel={s.action} staticLabel={s.static} className="signature-text" /></div>
      <div className="signature-caption"><span className="signature-hint-desktop">{s.desktop}</span><span className="signature-hint-touch">{s.touch}</span><span className="signature-hint-reduced">{s.reduced}</span><span>{s.home}</span></div>
    </footer>
  );
}
