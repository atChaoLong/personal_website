"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, ISourceOptions } from "@tsparticles/engine";
import { FAR_FIELD_COUNT, getDeviceTier, prefersReducedMotion } from "./ParticleConfig";

/**
 * Layer 1 — distant ambient dust.
 * Small, low-opacity, no links, no interactivity. Purely spatial depth
 * behind the neural network (Layer 2/3, see NeuralNetwork.tsx).
 */
export default function ParticlesBackground() {
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(FAR_FIELD_COUNT.desktop);
  const [reduced, setReduced] = useState(false);
  const containerRef = useRef<Container | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const container = containerRef.current;
        if (!container) return;
        if (entries[0]?.isIntersecting) container.play();
        else container.pause();
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setCount(FAR_FIELD_COUNT[getDeviceTier(window.innerWidth)]);
    update();
    setReduced(prefersReducedMotion());
    window.addEventListener("resize", update);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => {
      window.removeEventListener("resize", update);
      mq.removeEventListener?.("change", onChange);
    };
  }, []);

  const options: ISourceOptions = useMemo(() => ({
    fullScreen: { enable: false },
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    particles: {
      number: { value: count, density: { enable: true, area: 1600 } },
      color: { value: ["#c9ffe4", "#8bd8ff", "#5fe3a4"] },
      links: { enable: false },
      move: {
        enable: !reduced,
        speed: 0.18,
        direction: "none",
        outModes: { default: "out" },
        random: true
      },
      opacity: { value: { min: 0.05, max: 0.32 } },
      size: { value: { min: 0.5, max: 1.4 } }
    },
    interactivity: {
      events: { onHover: { enable: false }, onClick: { enable: false }, resize: { enable: true } }
    },
    detectRetina: true
  }), [count, reduced]);

  if (!ready) return null;

  return (
    <div ref={rootRef} className="particles particles-far">
      <Particles
        id="far-field-particles"
        className="tsparticles-fill"
        options={options}
        particlesLoaded={async (container) => {
          containerRef.current = container ?? null;
        }}
      />
    </div>
  );
}
