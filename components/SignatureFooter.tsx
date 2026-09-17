"use client";

import PixelText from "./PixelText";
import { useLocale } from "./LocaleProvider";

export default function SignatureFooter() {
  const { t: { signature: s } } = useLocale();
  return (
    <footer className="signature-footer" aria-label={s.label}>
      <div className="signature-text-wrapper"><PixelText text="ATCHAOLONG" actionLabel={s.action} staticLabel={s.static} className="signature-text" /></div>
    </footer>
  );
}
