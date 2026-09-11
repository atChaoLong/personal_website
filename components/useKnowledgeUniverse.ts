"use client";

import { useEffect, useRef, type RefObject } from "react";
import { advanceLearningUniverse, createLearningUniverse, universeView, type LearningUniverse } from "../lib/knowledge-universe";
import { createKnowledgeRenderer, type KnowledgeContent } from "../lib/knowledge-renderer";

/** A single 30 fps canvas; only the core's compositor transform remains in DOM. */
export function useKnowledgeUniverse(ref: RefObject<HTMLDivElement | null>, active: boolean, content: KnowledgeContent) {
  const universe = useRef(createLearningUniverse());
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const core = root.querySelector<HTMLElement>(".blackhole-growth")!;
    const halo = root.querySelector<HTMLElement>(".blackhole-insight")!;
    const canvas = root.querySelector<HTMLCanvasElement>(".knowledge-canvas")!;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 760px)");
    const renderer = createKnowledgeRenderer(canvas, content, getComputedStyle(root).getPropertyValue("--mono").trim() || "monospace");
    if (!renderer) return;
    const staticUniverse = createLearningUniverse();
    advanceLearningUniverse(staticUniverse, 48, content.galaxies.length);
    let disposed = false, nextMetadata = 0;
    let lastTransform = "", lastHalo = "";
    const paint = (state: LearningUniverse, forceMetadata = false) => {
      const view = universeView(state);
      const counts = renderer.paint(state, !media.matches);
      const transform = `scale(${(view.physicalScale * view.zoom).toFixed(4)})`;
      const opacity = media.matches ? "0" : Math.max((1 - view.pulse) * .62, (1 - view.basicPulse) * .22).toFixed(3);
      // Avoid inherited CSS variables and redundant subtree style invalidation.
      if (transform !== lastTransform) { core.style.transform = transform; lastTransform = transform; }
      if (opacity !== lastHalo) { halo.style.opacity = opacity; lastHalo = opacity; }
      if (forceMetadata || state.time >= nextMetadata) {
        root.dataset.learned = String(state.learned);
        root.dataset.basicsLearned = String(state.basicsLearned);
        root.dataset.discovered = String(state.discovered);
        root.dataset.activeGalaxies = String(state.galaxies.length);
        root.dataset.universeTime = state.time.toFixed(2);
        root.dataset.studyClock = state.studyClock.toFixed(3);
        root.dataset.learningRate = view.learningRate.toFixed(3);
        root.dataset.explorationRadius = view.explorationRadius.toFixed(3);
        root.dataset.ambientVisible = String(counts.ambientVisible);
        root.dataset.relatedVisible = String(counts.relatedVisible);
        root.dataset.foundationVisible = String(counts.foundationVisible);
        root.dataset.growthWaves = String(counts.growthWaves);
        nextMetadata = state.time + .25;
      }
    };
    const renderCurrent = () => paint(media.matches ? staticUniverse : universe.current, true);
    const resize = () => { renderer.resize(root.clientWidth, mobile.matches, window.devicePixelRatio || 1); renderCurrent(); };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    mobile.addEventListener("change", resize);
    media.addEventListener("change", renderCurrent);
    resize();
    document.fonts.ready.then(() => { if (!disposed) { renderer.invalidateText(); renderCurrent(); } });
    let frame = 0;
    let previous = performance.now();
    let nextPaint = previous + 1000 / 30;
    const tick = (now: number) => {
      if (!active || media.matches || document.hidden) return;
      if (now >= nextPaint) {
        advanceLearningUniverse(universe.current, Math.min((now - previous) / 1000, .12), content.galaxies.length);
        previous = now;
        nextPaint += 1000 / 30;
        if (nextPaint < now) nextPaint = now + 1000 / 30;
        paint(universe.current);
      }
      frame = requestAnimationFrame(tick);
    };
    if (active && !media.matches) frame = requestAnimationFrame(tick);
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); mobile.removeEventListener("change", resize); media.removeEventListener("change", renderCurrent); renderer.dispose(); };
  }, [ref, active, content]);
}
