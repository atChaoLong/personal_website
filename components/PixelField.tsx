"use client";

import { useEffect, useRef } from "react";
import {
  COLORS,
  PIXEL_FIELD_TIER,
  getDeviceTier,
  isCoarsePointer,
  prefersReducedMotion,
} from "./ParticleConfig";

interface Pixel {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  influence: number;
  phase: number;
  attract: boolean;
}

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

const TRAIL_LIFE = 550;
const DECAY_MS = 700;

/**
 * Footer — Interactive Pixel Field.
 * A near-invisible digital dust texture that the Hero's Neural Network
 * "decomposes into" at the bottom of the page. Mouse movement cuts and
 * displaces nearby pixels (never a following blob), leaves a short-lived
 * wake trail, and dwelling briefly gathers a tiny transient structure
 * before everything settles back to idle.
 */
export default function PixelField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const coarse = isCoarsePointer();

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let tier = getDeviceTier(window.innerWidth);
    let cfg = PIXEL_FIELD_TIER[tier];
    const interactive = cfg.interactive && !reduced && !coarse;

    let pixels: Pixel[] = [];
    let trail: TrailPoint[] = [];
    let mouse: { x: number; y: number } | null = null;
    let hoverStrength = 0;
    let dwellTimer = 0;
    let dwellAnchor: { x: number; y: number } | null = null;
    let running = true;
    let rafId = 0;
    let lastTime = performance.now();
    let core = { x: 0, y: 0 };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.max(1, Math.floor(width * dpr));
      canvas!.height = Math.max(1, Math.floor(height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      core = { x: width / 2, y: height * 0.32 };

      tier = getDeviceTier(window.innerWidth);
      cfg = PIXEL_FIELD_TIER[tier];
      buildField();
    }

    function buildField() {
      pixels = [];
      const cols = Math.ceil(width / cfg.cellSize);
      const rows = Math.ceil(height / cfg.cellSize);
      const cap = 4200;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > cfg.density) continue;
          if (pixels.length >= cap) break;
          const jitterX = (Math.random() - 0.5) * cfg.cellSize * 0.75;
          const jitterY = (Math.random() - 0.5) * cfg.cellSize * 0.75;
          const bx = c * cfg.cellSize + cfg.cellSize / 2 + jitterX;
          const by = r * cfg.cellSize + cfg.cellSize / 2 + jitterY;
          const sizeRoll = Math.random();
          const size = sizeRoll < 0.72 ? 1 : sizeRoll < 0.94 ? 1.5 : 2;
          pixels.push({
            baseX: bx,
            baseY: by,
            x: bx,
            y: by,
            size,
            baseOpacity: 0.06 + Math.random() * 0.1,
            influence: 0,
            phase: Math.random() * Math.PI * 2,
            attract: Math.random() < 0.07,
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
      const now = performance.now();
      trail.push({ x, y, time: now });
      if (trail.length > 20) trail.shift();

      if (!dwellAnchor || Math.hypot(x - dwellAnchor.x, y - dwellAnchor.y) > 18) {
        dwellAnchor = { x, y };
        dwellTimer = 0;
      }
    }
    function onPointerLeave() {
      mouse = null;
      dwellAnchor = null;
      dwellTimer = 0;
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

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

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

    function drawMicroStructure(anchor: { x: number; y: number }, env: number, now: number) {
      const nearby = pixels
        .filter((p) => Math.hypot(p.baseX - anchor.x, p.baseY - anchor.y) < 58)
        .slice(0, 6);
      if (nearby.length < 2) return;
      const flicker = 0.5 + Math.sin(now * 0.01) * 0.5;
      ctx!.strokeStyle = `rgba(${COLORS.cyan},${0.14 * env * flicker})`;
      ctx!.lineWidth = 1;
      for (let i = 0; i < nearby.length - 1; i++) {
        ctx!.beginPath();
        ctx!.moveTo(nearby[i].x, nearby[i].y);
        ctx!.lineTo(nearby[i + 1].x, nearby[i + 1].y);
        ctx!.stroke();
      }
    }

    function draw(now: number) {
      const dt = Math.min(now - lastTime, 48);
      lastTime = now;

      ctx!.clearRect(0, 0, width, height);

      trail = trail.filter((t) => now - t.time < TRAIL_LIFE);

      const hoverTarget = mouse ? 1 : 0;
      const hoverEase = 1 - Math.pow(0.001, dt / DECAY_MS);
      hoverStrength += (hoverTarget - hoverStrength) * hoverEase;

      if (mouse && dwellAnchor) {
        dwellTimer += dt;
      } else {
        dwellTimer = Math.max(0, dwellTimer - dt * 2);
      }
      const dwellActive = dwellTimer > 550 && !!dwellAnchor;
      const dwellEnv = dwellActive ? Math.min(1, (dwellTimer - 550) / 500) : 0;

      for (const p of pixels) {
        let targetInf = 0;
        let dirX = 0;
        let dirY = 0;

        if (mouse) {
          const dx = p.baseX - mouse.x;
          const dy = p.baseY - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < cfg.mouseRadius) {
            const inf = Math.pow(1 - d / cfg.mouseRadius, 1.5);
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
          if (d < cfg.trailRadius) {
            const life = 1 - age / TRAIL_LIFE;
            const inf = Math.pow(1 - d / cfg.trailRadius, 1.5) * life * 0.7;
            if (inf > targetInf) {
              targetInf = inf;
              const len = d || 1;
              dirX = dx / len;
              dirY = dy / len;
            }
          }
        }

        const attackEase = 1 - Math.pow(0.001, dt / 110);
        const releaseEase = 1 - Math.pow(0.001, dt / DECAY_MS);
        const ease = targetInf > p.influence ? attackEase : releaseEase;
        p.influence += (targetInf - p.influence) * ease;

        let px = p.baseX + dirX * cfg.displaceAmount * p.influence;
        let py = p.baseY + dirY * cfg.displaceAmount * p.influence;

        if (p.attract && hoverStrength > 0.01) {
          px += (core.x - p.baseX) * 0.045 * hoverStrength;
          py += (core.y - p.baseY) * 0.045 * hoverStrength;
        }

        if (dwellActive && dwellAnchor) {
          const dx = p.baseX - dwellAnchor.x;
          const dy = p.baseY - dwellAnchor.y;
          const d = Math.hypot(dx, dy);
          if (d < 70) {
            const pull = (1 - d / 70) * dwellEnv * 0.22;
            px += (dwellAnchor.x - p.baseX) * pull;
            py += (dwellAnchor.y - p.baseY) * pull;
          }
        }

        p.x = px;
        p.y = py;

        const twinkle = reduced ? 0 : Math.sin(now * 0.0011 + p.phase) * 0.02;
        const opacity = Math.min(0.92, Math.max(0, p.baseOpacity + twinkle + p.influence * 0.85));
        const size = p.size * (1 + p.influence * 0.9);

        ctx!.fillStyle = `rgba(${COLORS.core},${opacity})`;
        ctx!.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }

      if (dwellActive && dwellAnchor) {
        drawMicroStructure(dwellAnchor, dwellEnv, now);
      }

      if (running && !reduced) rafId = requestAnimationFrame(draw);
    }

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
  }, []);

  return <canvas ref={canvasRef} className="pixel-field" aria-hidden="true" />;
}
