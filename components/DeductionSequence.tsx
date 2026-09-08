"use client";

import type { CSSProperties } from "react";
import { Search, Database, Wrench, Code2, Eye, Layers, BrainCircuit } from "lucide-react";
import { useLocale } from "./LocaleProvider";

// Uneven positions and causal reveals let the camera follow a thought, rather
// than present six capabilities at once. All times share the opening's clock.
const clues = [
  { icon: Search, x: 155, y: 270, at: .25, tilt: -5 },
  { icon: Database, x: 325, y: 145, at: 1.0, tilt: 4 },
  { icon: Wrench, x: 520, y: 290, at: 1.65, tilt: -3 },
  { icon: Code2, x: 765, y: 175, at: 2.2, tilt: 6 },
  { icon: Eye, x: 700, y: 470, at: 2.7, tilt: -4 },
  { icon: Layers, x: 380, y: 455, at: 3.15, tilt: 3 },
];
const threads = [
  "M155 270 C195 270 235 145 325 145",
  "M325 145 C410 145 400 290 520 290",
  "M520 290 C600 290 665 175 765 175",
  "M765 175 C830 240 780 420 700 470",
  "M700 470 C620 530 445 510 380 455",
];

export default function DeductionSequence() {
  const { t } = useLocale();
  return <div className="deduction-scene" aria-hidden="true">
    <div className="deduction-haze" />
    <div className="deduction-scan" />
    <div className="deduction-plane">
      <div className="deduction-camera">
        <svg className="deduction-wiring" viewBox="0 0 1000 620">
          <g className="deduction-underlay"><path d="M90 390H255L450 85M580 70L860 340H940M220 550L540 390L870 555" /><circle cx="520" cy="290" r="200" /><path d="M490 290h60m-30-30v60" /></g>
          {threads.map((d, i) => <g key={d} style={{ "--at": `${clues[i + 1].at - .5}s` } as CSSProperties}>
            <path className="deduction-thread" d={d} pathLength="100" />
            <path className="deduction-tracer" d={d} pathLength="100" />
          </g>)}
          <g className="deduction-connections"><path d="M155 270Q275 460 380 455M325 145Q600 70 765 175M520 290Q600 435 700 470M380 455Q470 375 520 290" pathLength="100" /></g>
          {clues.map(({ x, y }, i) => <path className="deduction-converge" key={i} d={`M${x} ${y} Q${(x + 500) / 2 + 35} ${y} 500 310`} pathLength="100" style={{ "--at": `${3.9 + i * .045}s` } as CSSProperties} />)}
        </svg>
        {clues.map(({ icon: Icon, x, y, at, tilt }, i) => <div className="deduction-clue" key={i} style={{ left: `${x / 10}%`, top: `${y / 6.2}%`, "--at": `${at}s`, "--tilt": `${tilt}deg` } as CSSProperties}>
          <div className="clue-evidence">
            <span className="clue-index">{String(i + 1).padStart(2, "0")}<i /></span>
            <div className="clue-symbol"><Icon size={24} strokeWidth={1.2} /><i /></div>
            <span className="clue-name">{t.intro.tools[i]}</span>
            <div className="clue-fragments"><i /><i /><i /><i /><i /></div>
          </div>
        </div>)}
      </div>
    </div>
    <div className="deduction-answer">
      <div className="answer-emblem"><BrainCircuit size={35} strokeWidth={1} /><i /><i /></div>
      <span className="answer-kicker">{t.intro.resolved}</span>
      <strong>{t.intro.agent}</strong>
      <span className="answer-rule" />
    </div>
    <div className="deduction-captions">{t.intro.assemble.map((text, i) => <span key={i} style={{ "--at": `${[.2, 1.75, 3.55][i]}s` } as CSSProperties}>{text}</span>)}</div>
    <span className="deduction-label">{t.intro.assemblyLabel}</span>
    <div className="deduction-vignette" /><div className="deduction-grain" />
    <div className="deduction-letterbox deduction-letterbox-top" /><div className="deduction-letterbox deduction-letterbox-bottom" />
  </div>;
}
