"use client";

import { useEffect, useRef } from "react";
import { METEOR_ACTIVITY, SIGNATURE_IMPACT, type SignatureImpact } from "@/lib/meteor-signature";

type Pixel = { homeX: number; homeY: number; x: number; y: number; vx: number; vy: number; alpha: number; seed: number };
type Pulse = { x: number; y: number; start: number; strength?: number; meteor?: boolean };
interface PixelTextProps { text: string; actionLabel: string; staticLabel: string; className?: string; fontFamily?: string; fontWeight?: string | number }

const MINT = "188,248,206";
const ICE = "224,255,242";
const BLEED = 72;

/** Sample actual glyphs, then displace their pixels with a damped spring field. */
export default function PixelText({ text, actionLabel, staticLabel, className, fontFamily = "Inter, system-ui, sans-serif", fontWeight = 800 }: PixelTextProps) {
  const surfaceRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!surface || !canvas || !ctx) return;
    const host = surface, target = canvas, context = ctx;
    const impression = document.createElement("canvas");
    const impressionInk = impression.getContext("2d")!;
    // Quantized opacity lets thousands of particles share 32 fill operations.
    const inks = Array.from({ length: 32 }, (_, i) => `rgba(${i < 16 ? MINT : ICE},${((i % 16) + 1) / 16})`);
    const footer = host.closest(".footer-reveal");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0, height = 0, step = 2, radius = 100;
    let pixels: Pixel[] = [], pulses: Pulse[] = [];
    let pointer: { x: number; y: number; vx: number; vy: number; time: number } | null = null;
    let frame = 0, last = 0, visible = false, disposed = false, introduced = false;
    let previousWidth = 0, previousHeight = 0, previousDpr = 0;

    function paint(now = performance.now()) {
      context.clearRect(0, 0, width, height);
      for (const pulse of pulses) {
        if (!pulse.meteor) continue;
        const age = Math.min(1, (now - pulse.start) / 2200);
        const reach = Math.max(180, width * .55);
        // Expanding elliptical wavefronts travel through the letter surface.
        for (let ring = 0; ring < 3; ring++) {
          const phase = (age - ring * .11) / (1 - ring * .11);
          if (phase <= 0 || phase >= 1) continue;
          const r = (1 - (1 - phase) ** 2) * reach;
          context.beginPath();
          context.ellipse(pulse.x, pulse.y, r, Math.max(1, r * .42), 0, 0, Math.PI * 2);
          context.lineWidth = ring === 0 ? 1.4 : .7;
          context.strokeStyle = `rgba(${ring === 0 ? ICE : MINT},${(1 - phase) ** 2 * (ring === 0 ? .65 : .3)})`;
          context.stroke();
        }
        if (age < .3) {
          const glow = context.createRadialGradient(pulse.x, pulse.y, 0, pulse.x, pulse.y, 28);
          glow.addColorStop(0, `rgba(${ICE},${(1 - age / .3) * .5})`);
          glow.addColorStop(1, `rgba(${MINT},0)`);
          context.fillStyle = glow; context.fillRect(pulse.x - 28, pulse.y - 28, 56, 56);
        }
        if (age < .5) {
          const t = age * 2;
          context.fillStyle = `rgba(${ICE},${(1 - t) * .8})`;
          for (let i = 0; i < 9; i++) {
            const spread = (i - 4) * 13 * t * (pulse.strength ?? 1);
            const lift = Math.sin(t * Math.PI) * (18 + (i % 3) * 12);
            context.fillRect(pulse.x + spread, pulse.y - lift, 1.5, 1.5);
          }
        }
      }
      // A very faint home-position impression keeps the word readable during disruption.
      if (impression.width && impression.height) context.drawImage(impression, 0, 0, width, height);
      const batches = Array.from({ length: 32 }, () => new Path2D());
      const trails = new Path2D();
      for (const p of pixels) {
        const dx = p.x - p.homeX, dy = p.y - p.homeY;
        const displacement = Math.sqrt(dx * dx + dy * dy);
        const energy = Math.min(1, displacement / 45);
        const size = step * (.87 - energy * .22);
        const opacity = Math.max(0, Math.min(15, Math.round(p.alpha * (.88 - energy * .2) * 16) - 1));
        batches[opacity + (energy > .24 ? 16 : 0)].rect(p.x, p.y, size, size);
        if (energy > .3) trails.rect(p.x - p.vx * 1.4, p.y - p.vy * 1.4, size * .7, size * .7);
      }
      for (let i = 0; i < batches.length; i++) { context.fillStyle = inks[i]; context.fill(batches[i]); }
      context.fillStyle = `rgba(${MINT},.075)`; context.fill(trails);
    }

    function draw(now: number) {
      frame = 0;
      if (!visible || document.hidden || disposed) return;
      // CSS meteors remain smooth; only the expensive, short-lived letter simulation is capped.
      const interval = 1000 / (width < 600 ? 30 : 60);
      if (last && Math.floor(now / interval) === Math.floor(last / interval)) { frame = requestAnimationFrame(draw); return; }
      const dt = Math.min(last ? (now - last) / 16.667 : 1, 2);
      last = now;
      let moving = false;
      if (!reduced.matches) {
        pulses = pulses.filter(p => now - p.start < (p.meteor ? 2200 : 1400));
        // Integrate in small steps so high and low refresh-rate screens feel alike.
        const count = Math.ceil(dt / .5), tick = dt / count;
        const damping = Math.pow(.83, tick);
        const waveFields = pulses.map(pulse => {
          const age = (now - pulse.start) / (pulse.meteor ? 2200 : 1400);
          return { ...pulse, front: pulse.meteor ? (1 - (1 - age) ** 2) * Math.max(180, width * .55) : age * Math.hypot(width, height), force: (1 - age) * radius * (pulse.meteor ? .82 * (pulse.strength ?? 1) : 1.35) };
        });
        for (const p of pixels) {
            let tx = p.homeX, ty = p.homeY;
            if (pointer) {
              const dx = p.homeX - pointer.x, dy = p.homeY - pointer.y;
              const distance = Math.hypot(dx, dy);
              if (distance < radius) {
                const influence = Math.pow(1 - distance / radius, 1.5);
                const nx = distance > .01 ? dx / distance : Math.cos(p.seed * 6.28);
                const ny = distance > .01 ? dy / distance : Math.sin(p.seed * 6.28);
                const push = radius * .78 * influence;
                tx += nx * push + pointer.vx * influence * .9;
                ty += ny * push + pointer.vy * influence * .9;
              }
            }
            for (const pulse of waveFields) {
              const dx = p.homeX - pulse.x, dy = p.homeY - pulse.y;
              const scaledY = pulse.meteor ? dy / .42 : dy;
              const distance = Math.sqrt(dx * dx + scaledY * scaledY);
              const envelope = Math.max(0, 1 - Math.abs(distance - pulse.front) / (radius * .65));
              const strength = envelope * pulse.force;
              if (distance > .01) {
                tx += dx / distance * strength;
                ty += dy / distance * strength;
              }
            }
            for (let iteration = 0; iteration < count; iteration++) {
              p.vx = (p.vx + (tx - p.x) * .045 * tick) * damping;
              p.vy = (p.vy + (ty - p.y) * .045 * tick) * damping;
              p.x += p.vx * tick; p.y += p.vy * tick;
            }
            if (Math.abs(p.x - tx) + Math.abs(p.y - ty) + Math.abs(p.vx) + Math.abs(p.vy) > .06) moving = true;
            else { p.x = tx; p.y = ty; p.vx = 0; p.vy = 0; }
        }
        if (pointer) { pointer.vx *= Math.pow(.8, dt); pointer.vy *= Math.pow(.8, dt); }
      }
      paint(now);
      // No permanent idle loop: wake only for interaction, entry, resize, or unsettled pixels.
      if (!reduced.matches && (moving || pulses.length)) frame = requestAnimationFrame(draw);
    }
    function wake() {
      if (!frame && visible && !document.hidden && !disposed) {
        last = 0;
        frame = requestAnimationFrame(draw);
      }
    }
    function rest() {
      pointer = null; pulses = [];
      for (const p of pixels) { p.x = p.homeX; p.y = p.homeY; p.vx = 0; p.vy = 0; }
    }

    function build(force = false) {
      if (disposed) return;
      const bounds = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, bounds.width < 600 ? 1.5 : 2);
      if (!bounds.width || !bounds.height) return;
      if (!force && bounds.width === previousWidth && bounds.height === previousHeight && dpr === previousDpr) return;
      previousWidth = width = bounds.width; previousHeight = bounds.height; height = bounds.height + BLEED * 2; previousDpr = dpr;
      target.width = Math.round(width * dpr); target.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      impression.width = target.width; impression.height = target.height;
      impressionInk.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mask = document.createElement("canvas");
      mask.width = Math.ceil(width); mask.height = Math.ceil(height);
      const ink = mask.getContext("2d", { willReadFrequently: true });
      if (!ink) return;
      const reference = 200, tracking = -.035;
      ink.font = `${fontWeight} ${reference}px ${fontFamily}`;
      const measure = (size: number) => [...text].reduce((total, ch) => total + ink.measureText(ch).width, 0) + Math.max(0, text.length - 1) * size * tracking;
      const margin = width < 600 ? 8 : 12;
      const fontSize = Math.min((width - margin * 2) / measure(reference) * reference, (height - BLEED * 2) * .96);
      ink.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      const metrics = ink.measureText(text);
      const ascent = metrics.actualBoundingBoxAscent || fontSize * .75;
      const descent = metrics.actualBoundingBoxDescent || 0;
      const stretch = 1.28;
      const textHeight = (ascent + descent) * stretch;
      let x = (width - measure(fontSize)) / 2;
      ink.translate(0, (height - textHeight) / 2);
      ink.scale(1, stretch);
      ink.textBaseline = "alphabetic";
      ink.fillStyle = "white";
      for (const ch of text) { ink.fillText(ch, x, ascent); x += ink.measureText(ch).width + fontSize * tracking; }
      const data = ink.getImageData(0, 0, mask.width, mask.height).data;
      // Dense small squares, not the old stretched rectangular mosaic.
      step = Math.max(1.25, Math.sqrt(width * textHeight / 23000));
      radius = Math.max(48, Math.min(155, width * .12));
      pixels = [];
      for (let y = step / 2; y < height; y += step) {
        for (let x = step / 2; x < width; x += step) {
          const alpha = data[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3] / 255;
          if (alpha < .35) continue;
          const seed = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
          pixels.push({ homeX: x, homeY: y, x, y, vx: 0, vy: 0, alpha, seed });
        }
      }
      impressionInk.fillStyle = `rgba(${MINT},.075)`;
      for (const p of pixels) impressionInk.fillRect(p.homeX, p.homeY, step * .78, step * .78);
      host.dataset.ready = "true";
      rest(); paint(); wake();
    }
    function enter() {
      if (introduced || reduced.matches || !pixels.length) return;
      introduced = true;
      for (const p of pixels) {
        p.x += Math.sin(p.seed * 17) * 22;
        p.y += Math.cos(p.seed * 11) * 30;
      }
    }
    function move(event: PointerEvent) {
      if (reduced.matches || event.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      const x = event.clientX - rect.left, y = event.clientY - rect.top + BLEED, now = performance.now();
      const dt = pointer ? Math.max(8, now - pointer.time) / 16.667 : 1;
      pointer = { x, y, vx: pointer ? Math.max(-45, Math.min(45, (x - pointer.x) / dt)) : 0, vy: pointer ? Math.max(-45, Math.min(45, (y - pointer.y) / dt)) : 0, time: now };
      wake();
    }
    function leave() { pointer = null; wake(); }
    function pulse(event: MouseEvent) {
      if (reduced.matches) return;
      const rect = host.getBoundingClientRect();
      const x = event.detail === 0 ? width / 2 : event.clientX - rect.left;
      const y = event.detail === 0 ? height / 2 : event.clientY - rect.top + BLEED;
      pulses.push({ x, y, start: performance.now() });
      pulses = pulses.slice(-3);
      wake();
    }
    function meteorImpact(event: Event) {
      if (reduced.matches || !visible || document.hidden) return;
      const { x, y, strength } = (event as CustomEvent<SignatureImpact>).detail;
      if (![x, y, strength].every(Number.isFinite)) return;
      pulses.push({ x, y: y + BLEED, start: performance.now(), strength: Math.max(.5, Math.min(1.4, strength)), meteor: true });
      pulses = pulses.slice(-3);
      wake();
    }
    function meteorActivity(event: Event) {
      // Keep the linked surfaces in sync even when media-change callbacks arrive in different orders.
      if (host.getAttribute("aria-disabled") !== String(reduced.matches)) preference();
      if ((event as CustomEvent<boolean>).detail || !pulses.some(p => p.meteor)) return;
      pulses = pulses.filter(p => !p.meteor);
      if (!pulses.length && !pointer) {
        cancelAnimationFrame(frame); frame = 0; rest(); paint();
      } else wake();
    }
    function visibility() {
      cancelAnimationFrame(frame); frame = 0;
      rest(); paint();
      if (!document.hidden) wake();
    }
    function preference() {
      host.setAttribute("aria-label", reduced.matches ? staticLabel : actionLabel);
      host.setAttribute("aria-disabled", String(reduced.matches));
      rest(); paint(); wake();
    }
    build();
    preference();
    const resize = new ResizeObserver(() => build());
    resize.observe(host);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { enter(); wake(); }
      else { cancelAnimationFrame(frame); frame = 0; rest(); paint(); }
    }, { threshold: .15 });
    intersection.observe(host);
    document.fonts.ready.then(() => { if (!disposed) build(true); });
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    host.addEventListener("pointercancel", leave);
    host.addEventListener("click", pulse);
    host.addEventListener(SIGNATURE_IMPACT, meteorImpact);
    footer?.addEventListener(METEOR_ACTIVITY, meteorActivity);
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", preference);
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      resize.disconnect(); intersection.disconnect();
      host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointercancel", leave); host.removeEventListener("click", pulse);
      host.removeEventListener(SIGNATURE_IMPACT, meteorImpact); footer?.removeEventListener(METEOR_ACTIVITY, meteorActivity);
      window.removeEventListener("blur", leave); document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", preference);
    };
  }, [text, fontFamily, fontWeight, actionLabel, staticLabel]);

  return <button type="button" ref={surfaceRef} className={`pixel-text ${className ?? ""}`} aria-label={actionLabel}>
    <canvas ref={canvasRef} className="pixel-text-canvas" aria-hidden="true" />
    <span className="pixel-text-fallback" aria-hidden="true">{text}</span>
  </button>;
}
