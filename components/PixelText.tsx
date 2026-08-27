"use client";

import { useEffect, useRef } from "react";
import { COLORS, isCoarsePointer, prefersReducedMotion } from "./ParticleConfig";

interface GlyphPixel {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  influence: number;
  phase: number;
}

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

const TARGET_POINTS = 6500;
const TRAIL_LIFE = 500;
const DECAY_MS = 650;
const REF_SIZE = 200;
const TRACKING_EM = -0.045;

function trackedWidth(ctx: CanvasRenderingContext2D, str: string, tracking: number): number {
  let total = 0;
  for (const ch of str) total += ctx.measureText(ch).width + tracking;
  return Math.max(0, total - tracking);
}

function fillTracked(ctx: CanvasRenderingContext2D, str: string, x: number, y: number, tracking: number): void {
  let cursor = x;
  for (const ch of str) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + tracking;
  }
}

interface PixelTextProps {
  text: string;
  className?: string;
  fontFamily?: string;
  fontWeight?: string | number;
}

/**
 * Signature — pixel-glyph reconstruction (Pixel Field, Option A).
 * The font size is solved so the rendered glyphs fill the full width of
 * the container exactly (and the container height is trimmed to match the
 * glyph bounding box — no wasted space in either axis). Characters are
 * sampled from their real rendered shapes and rebuilt as a dense mosaic of
 * tiny squares. At rest it reads as normal type; the moment the cursor
 * comes near, the pixels that make up the letterforms themselves get
 * pushed apart / displaced — the text is literally what's being
 * disturbed, not a layer drawn over it.
 */
export default function PixelText({
  text,
  className,
  fontFamily = "Inter, system-ui, sans-serif",
  fontWeight = 800,
}: PixelTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const coarse = isCoarsePointer();
    const interactive = !reduced && !coarse;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let mouseRadius = 80;
    let trailRadius = 56;
    let displaceAmount = 24;
    let pixels: GlyphPixel[] = [];
    let trail: TrailPoint[] = [];
    let mouse: { x: number; y: number } | null = null;
    let running = true;
    let rafId = 0;
    let lastTime = performance.now();

    function build() {
      const containerWidth = container!.clientWidth;
      if (containerWidth < 2) return;

      const measureCanvas = document.createElement("canvas");
      const mctx = measureCanvas.getContext("2d");
      if (!mctx) return;
      mctx.font = `${fontWeight} ${REF_SIZE}px ${fontFamily}`;
      const refTracking = REF_SIZE * TRACKING_EM;
      const refWidth = trackedWidth(mctx, text, refTracking);
      if (refWidth <= 0) return;
      const fontSize = (containerWidth / refWidth) * REF_SIZE;
      const tracking = fontSize * TRACKING_EM;

      mctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      const metrics = mctx.measureText(text);
      const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.72;
      const descent = metrics.actualBoundingBoxDescent || fontSize * 0.08;

      width = containerWidth;
      height = Math.max(1, Math.ceil(ascent + descent));

      canvas!.width = Math.max(1, Math.floor(width * dpr));
      canvas!.height = Math.max(1, Math.floor(height * dpr));
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      container!.style.height = `${height}px`;

      mouseRadius = fontSize * 0.42;
      trailRadius = fontSize * 0.3;
      displaceAmount = fontSize * 0.16;

      const sample = document.createElement("canvas");
      sample.width = Math.max(1, Math.floor(width * dpr));
      sample.height = Math.max(1, Math.floor(height * dpr));
      const sctx = sample.getContext("2d");
      if (!sctx) return;
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      sctx.textBaseline = "alphabetic";
      sctx.fillStyle = "#fff";
      fillTracked(sctx, text, 0, ascent, tracking);
      const data = sctx.getImageData(0, 0, sample.width, sample.height).data;

      let step = Math.sqrt((width * height) / TARGET_POINTS);
      step = Math.max(2, Math.min(18, step));

      pixels = [];
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const sx = Math.min(sample.width - 1, Math.floor(x * dpr));
          const sy = Math.min(sample.height - 1, Math.floor(y * dpr));
          const idx = (sy * sample.width + sx) * 4;
          const alpha = data[idx + 3];
          if (alpha < 40) continue;
          pixels.push({
            baseX: x,
            baseY: y,
            x,
            y,
            size: step * 0.88,
            baseOpacity: Math.min(1, alpha / 255),
            influence: 0,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) {
        mouse = null;
        return;
      }
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse = { x, y };
      trail.push({ x, y, time: performance.now() });
      if (trail.length > 16) trail.shift();
    }
    function onPointerLeave() {
      mouse = null;
    }
    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }
    function start() {
      if (reduced || (running && rafId)) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(draw);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    function draw(now: number) {
      const dt = Math.min(now - lastTime, 48);
      lastTime = now;

      ctx!.clearRect(0, 0, width, height);
      trail = trail.filter((t) => now - t.time < TRAIL_LIFE);

      for (const p of pixels) {
        let targetInf = 0;
        let dirX = 0;
        let dirY = 0;

        if (mouse) {
          const dx = p.baseX - mouse.x;
          const dy = p.baseY - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < mouseRadius) {
            const inf = Math.pow(1 - d / mouseRadius, 1.4);
            if (inf > targetInf) {
              targetInf = inf;
              const len = d || 1;
              dirX = dx / len;
              dirY = dy / len;
            }
          }
        }

        for (const tp of trail) {
          const age = now - tp.time;
          if (age > TRAIL_LIFE) continue;
          const dx = p.baseX - tp.x;
          const dy = p.baseY - tp.y;
          const d = Math.hypot(dx, dy);
          if (d < trailRadius) {
            const life = 1 - age / TRAIL_LIFE;
            const inf = Math.pow(1 - d / trailRadius, 1.4) * life * 0.6;
            if (inf > targetInf) {
              targetInf = inf;
              const len = d || 1;
              dirX = dx / len;
              dirY = dy / len;
            }
          }
        }

        const attackEase = 1 - Math.pow(0.001, dt / 120);
        const releaseEase = 1 - Math.pow(0.001, dt / DECAY_MS);
        const ease = targetInf > p.influence ? attackEase : releaseEase;
        p.influence += (targetInf - p.influence) * ease;

        p.x = p.baseX + dirX * displaceAmount * p.influence;
        p.y = p.baseY + dirY * displaceAmount * p.influence;

        const twinkle = reduced ? 0 : Math.sin(now * 0.0012 + p.phase) * 0.03;
        const opacity = Math.min(1, Math.max(0, p.baseOpacity * (1 - p.influence * 0.6) + twinkle));
        const size = p.size * (1 - p.influence * 0.25);

        ctx!.fillStyle = `rgba(${COLORS.core},${opacity})`;
        ctx!.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }

      if (running && !reduced) rafId = requestAnimationFrame(draw);
    }

    build();
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => build()).catch(() => {});
    }

    const resizeObserver = new ResizeObserver(build);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) start();
        else stop();
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(canvas);

    if (interactive) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("blur", onPointerLeave);
    }
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      draw(performance.now());
    } else {
      rafId = requestAnimationFrame(draw);
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (interactive) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("blur", onPointerLeave);
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [text, fontFamily, fontWeight]);

  return (
    <div ref={containerRef} className={`pixel-text ${className ?? ""}`}>
      <canvas ref={canvasRef} className="pixel-text-canvas" aria-hidden="true" />
      <span className="sr-only">{text}</span>
    </div>
  );
}
