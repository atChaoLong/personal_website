/** An open C orbit around a J, drawn to remain legible at small sizes. */
export default function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <g className="brand-orbit">
        <path d="M36.73 11.27a18 18 0 1 0 0 25.46" stroke="currentColor" strokeWidth="4.5" />
        <circle cx="41.5" cy="24" r="2.5" fill="currentColor" />
      </g>
      <path className="brand-initial" d="M29 15v13a6 6 0 0 1-12 0" stroke="currentColor" strokeWidth="4.5" />
    </svg>
  );
}
