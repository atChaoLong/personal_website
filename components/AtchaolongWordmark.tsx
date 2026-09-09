import type { CSSProperties } from "react";

// Custom lowercase letterforms: open terminals, circular counters and a shared g tail.
const letters = [
  "M21 24a9 10 0 1 1-18 0 9 10 0 1 1 18 0M21 14v20",
  "M32 6v22q0 6 6 6h5M27 14h16",
  "M66 17c-2-2-4-3-7-3-6 0-10 4-10 10s4 10 10 10c3 0 5-1 7-3",
  "M75 6v28M75 23c0-6 4-9 9-9s9 3 9 9v11",
  "M121 24a9 10 0 1 1-18 0 9 10 0 1 1 18 0M121 14v20",
  "M149 24a9 10 0 1 1-18 0 9 10 0 1 1 18 0",
  "M160 6v22q0 6 6 6",
  "M194 24a9 10 0 1 1-18 0 9 10 0 1 1 18 0",
  "M204 14v20M204 23c0-6 4-9 9-9s9 3 9 9v11",
  "M250 24a9 10 0 1 1-18 0 9 10 0 1 1 18 0M250 14v20",
];

export default function AtchaolongWordmark() {
  return (
    <svg className="atchaolong-wordmark" viewBox="0 0 256 50" fill="none" aria-hidden="true" focusable="false">
      {letters.map((path, index) => (
        <path key={index} className={`signature-glyph${index < 2 ? " signature-at" : ""}`} d={path} stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" style={{ "--glyph": index } as CSSProperties} />
      ))}
      <path className="signature-tail" d="M250 34c0 8-5 12-13 12h-50" pathLength="1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
