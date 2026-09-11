"use client";

import { useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import HeroAtmosphere from "./HeroAtmosphere";

export default function HeroKnowledgeScene({ suspended }: { suspended: boolean }) {
  const { t } = useLocale();
  const [paused, setPaused] = useState(false);
  const [generation, setGeneration] = useState(0);

  return <div className="hero-knowledge-scene">
    <div className="knowledge-vortex-stage" role="img" aria-label={t.knowledge.description}>
      <HeroAtmosphere key={generation} suspended={suspended || paused} />
    </div>
    <div className="knowledge-scene-footer">
      <div className="blackhole-caption"><span aria-hidden="true">∞</span><p>{t.knowledge.caption}<small>{t.knowledge.sub}</small></p></div>
      <div className="knowledge-scene-controls">
        <button type="button" className="knowledge-motion-toggle knowledge-replay" onClick={() => { setGeneration(value => value + 1); setPaused(false); }} aria-label={t.knowledge.replay} title={t.knowledge.replay}><RotateCcw size={13} /></button>
        <button type="button" className="knowledge-motion-toggle" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? t.knowledge.play : t.knowledge.pause} title={paused ? t.knowledge.play : t.knowledge.pause}>{paused ? <Play size={13} /> : <Pause size={13} />}</button>
      </div>
    </div>
  </div>;
}
