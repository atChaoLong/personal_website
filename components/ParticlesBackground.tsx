"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, ISourceOptions } from "@tsparticles/engine";
import { FAR_FIELD_COUNT, getDeviceTier, isCoarsePointer, prefersReducedMotion } from "./ParticleConfig";

/**
 * Layer 1 — living particle field.
 * Twinkling, drifting nodes connected by faint links/triangles, with a
 * slow orbital attract drift. Sits behind the neural network
 * (Layer 2/3, see NeuralNetwork.tsx) for spatial depth.
 */
export default function ParticlesBackground() {
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(FAR_FIELD_COUNT.desktop);
  const [reduced, setReduced] = useState(false);
  const [coarse, setCoarse] = useState(false);
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
    setCoarse(isCoarsePointer());
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
    fpsLimit: 90,
    particles: {
      number: { value: count, density: { enable: true, area: 1200 } },
      color: { value: ["#c9ffe4", "#8bd8ff", "#5fe3a4"] },
      links: {
        enable: true,
        distance: 130,
        color: "#9affc7",
        opacity: 0.15,
        width: 1,
        triangles: { enable: true, color: "#5fe3a4", opacity: 0.025 }
      },
      move: {
        enable: !reduced,
        speed: { min: 0.25, max: 0.85 },
        direction: "none",
        outModes: { default: "bounce" },
        random: true,
        straight: false,
        attract: { enable: true, distance: 220, rotate: { x: 900, y: 1800 } }
      },
      opacity: {
        value: { min: 0.12, max: 0.45 },
        animation: { enable: true, speed: 0.6, sync: false, startValue: "random" }
      },
      size: {
        value: { min: 0.5, max: 2 },
        animation: { enable: true, speed: 1.2, sync: false, startValue: "random" }
      },
      shadow: { enable: true, blur: 5, color: { value: "#9affc7" } },
      shape: { type: "circle" }
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: { enable: !reduced && !coarse, mode: ["grab", "bubble"] },
        onClick: { enable: !reduced && !coarse, mode: "push" },
        resize: { enable: true }
      },
      modes: {
        grab: { distance: 170, links: { opacity: 0.4 } },
        bubble: { distance: 170, size: 3.5, duration: 0.4, opacity: 0.7 },
        push: { quantity: 2 }
      }
    },
    detectRetina: true
  }), [count, reduced, coarse]);

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
