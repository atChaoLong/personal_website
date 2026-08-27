"use client";

import { useEffect, useRef } from "react";
import {
  COLORS,
  MAX_SIGNAL_CHAINS,
  RING_NODE_COUNT,
  getDeviceTier,
  isCoarsePointer,
  magneticFalloff,
  prefersReducedMotion,
} from "./ParticleConfig";

type Ring = "ring1" | "ring2" | "edge";

interface Node {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  ring: Ring;
  size: number;
  driftPhase: number;
  driftAmp: number;
  influence: number;
  activeUntil: number;
}
interface Edge {
  a: number;
  b: number;
  base: number;
}
interface SignalChain {
  path: number[];
  seg: number;
  t: number;
  speed: number;
}
interface Ripple {
  x: number;
  y: number;
  start: number;
}

const RIPPLE_MS = 700;

/**
 * Layer 2/3 — organized neural network + AI core + hero interaction.
 * Nodes are laid out in three concentric rings around a fixed core point
 * (hub-and-spoke topology with organic jitter) instead of a random point
 * cloud, so the network reads as "AI visualization" rather than noise.
 */
export default function NeuralNetwork() {
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
    let maxChains = MAX_SIGNAL_CHAINS[tier];

    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let adjacency: number[][] = [];
    let coreAdjacency: number[] = [];
    let chains: SignalChain[] = [];
    let ripples: Ripple[] = [];
    let core = { x: 0, y: 0 };
    let mouse: { x: number; y: number } | null = null;
    let running = true;
    let rafId = 0;
    let lastTime = performance.now();

    let coreBoostUntil = 0;
    let clusterBoost: { ring: Ring; until: number; start: number } | null = null;
    let nextEventAt = performance.now() + 4000 + Math.random() * 4000;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.max(1, Math.floor(width * dpr));
      canvas!.height = Math.max(1, Math.floor(height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      core = { x: width * 0.66, y: height * 0.46 };

      const newTier = getDeviceTier(window.innerWidth);
      tier = newTier;
      maxChains = MAX_SIGNAL_CHAINS[tier];
      buildNetwork();
    }

    function buildNetwork() {
      const counts = RING_NODE_COUNT[tier];
      const minSpan = Math.min(width, height);
      const r1Radius = minSpan * 0.13;
      const r2Radius = minSpan * 0.27;
      const edgeRadius = minSpan * 0.42;

      nodes = [];
      for (let i = 0; i < counts.ring1; i++) {
        const angle = (i / counts.ring1) * Math.PI * 2 + Math.random() * 0.4;
        const radius = r1Radius * (0.85 + Math.random() * 0.3);
        nodes.push(makeNode(core.x + Math.cos(angle) * radius, core.y + Math.sin(angle) * radius, "ring1"));
      }
      for (let i = 0; i < counts.ring2; i++) {
        const angle = (i / counts.ring2) * Math.PI * 2 + Math.random() * 0.6;
        const radius = r2Radius * (0.75 + Math.random() * 0.5);
        nodes.push(makeNode(core.x + Math.cos(angle) * radius, core.y + Math.sin(angle) * radius, "ring2"));
      }
      for (let i = 0; i < counts.edge; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = edgeRadius * (0.7 + Math.random() * 0.6);
        nodes.push(makeNode(core.x + Math.cos(angle) * radius, core.y + Math.sin(angle) * radius, "edge"));
      }

      buildEdges(counts);
    }

    function makeNode(x: number, y: number, ring: Ring): Node {
      const roll = Math.random();
      const sizeTier = roll < 0.7 ? 0 : roll < 0.95 ? 1 : 2;
      const size = sizeTier === 0 ? 0.8 + Math.random() * 0.7 : sizeTier === 1 ? 1.7 + Math.random() * 0.8 : 2.8 + Math.random();
      return {
        homeX: Math.max(4, Math.min(width - 4, x)),
        homeY: Math.max(4, Math.min(height - 4, y)),
        x, y,
        ring,
        size,
        driftPhase: Math.random() * Math.PI * 2,
        driftAmp: ring === "edge" ? 4 + Math.random() * 4 : ring === "ring2" ? 6 + Math.random() * 6 : 8 + Math.random() * 6,
        influence: 0,
        activeUntil: 0,
      };
    }

    function homeDist(i: number, j: number) {
      return Math.hypot(nodes[i].homeX - nodes[j].homeX, nodes[i].homeY - nodes[j].homeY);
    }

    function buildEdges(counts: { ring1: number; ring2: number; edge: number }) {
      const ring1Start = 0;
      const ring2Start = counts.ring1;
      const edgeStart = counts.ring1 + counts.ring2;

      const next: Edge[] = [];
      coreAdjacency = [];

      for (let i = 0; i < counts.ring1; i++) {
        const idx = ring1Start + i;
        next.push({ a: -1, b: idx, base: 0.17 });
        coreAdjacency.push(idx);
      }
      for (let i = 0; i < counts.ring1; i++) {
        if (Math.random() < 0.85) {
          next.push({ a: ring1Start + i, b: ring1Start + ((i + 1) % counts.ring1), base: 0.11 });
        }
      }
      for (let i = 0; i < counts.ring2; i++) {
        if (Math.random() < 0.75) {
          next.push({ a: ring2Start + i, b: ring2Start + ((i + 1) % counts.ring2), base: 0.09 });
        }
      }
      for (let i = 0; i < counts.ring2; i++) {
        const bIdx = ring2Start + i;
        let nearest = ring1Start;
        let bestDist = Infinity;
        for (let j = 0; j < counts.ring1; j++) {
          const aIdx = ring1Start + j;
          const d = homeDist(aIdx, bIdx);
          if (d < bestDist) { bestDist = d; nearest = aIdx; }
        }
        if (Math.random() < 0.6) next.push({ a: nearest, b: bIdx, base: 0.07 });
      }
      for (let i = 0; i < counts.edge; i++) {
        if (Math.random() > 0.55) continue;
        const bIdx = edgeStart + i;
        let nearest = ring2Start;
        let bestDist = Infinity;
        for (let j = 0; j < counts.ring2; j++) {
          const aIdx = ring2Start + j;
          const d = homeDist(aIdx, bIdx);
          if (d < bestDist) { bestDist = d; nearest = aIdx; }
        }
        next.push({ a: nearest, b: bIdx, base: 0.05 });
      }

      edges = next;
      adjacency = nodes.map(() => []);
      for (const e of next) {
        if (e.a >= 0) adjacency[e.a].push(e.b);
        if (e.b >= 0) adjacency[e.b].push(e.a);
      }
      chains = [];
    }

    function rewireSparse() {
      const counts = RING_NODE_COUNT[tier];
      const structuralCount = counts.ring1 * 2 + counts.ring2 * 2;
      edges = edges.filter((e, i) => i < structuralCount || Math.random() < 0.5);
      const edgeStart = counts.ring1 + counts.ring2;
      const ring2Start = counts.ring1;
      for (let i = 0; i < counts.edge; i++) {
        if (Math.random() > 0.15) continue;
        edges.push({ a: ring2Start + Math.floor(Math.random() * counts.ring2), b: edgeStart + i, base: 0.05 });
      }
      adjacency = nodes.map(() => []);
      for (const e of edges) {
        if (e.a >= 0) adjacency[e.a].push(e.b);
        if (e.b >= 0) adjacency[e.b].push(e.a);
      }
    }

    function pointOf(i: number) {
      return i === -1 ? core : nodes[i];
    }

    function spawnChain() {
      if (chains.length >= maxChains + 1 || !coreAdjacency.length) return;
      const start = coreAdjacency[Math.floor(Math.random() * coreAdjacency.length)];
      const path = [-1, start];
      let current = start;
      let prev = -1;
      const hops = 2 + Math.floor(Math.random() * 3);
      for (let h = 0; h < hops; h++) {
        const options = (adjacency[current] || []).filter((n) => n !== prev);
        if (!options.length) break;
        const next = options[Math.floor(Math.random() * options.length)];
        path.push(next);
        prev = current;
        current = next;
        if (Math.random() < 0.25) break;
      }
      if (path.length >= 2) chains.push({ path, seg: 0, t: 0, speed: 0.5 + Math.random() * 0.35 });
    }

    function maybeTriggerEvent(now: number) {
      if (now < nextEventAt) return;
      nextEventAt = now + 4000 + Math.random() * 8000;
      const roll = Math.random();
      if (roll < 0.28) coreBoostUntil = now + 1400;
      else if (roll < 0.6) clusterBoost = { ring: Math.random() < 0.5 ? "ring1" : "ring2", until: now + 2200, start: now };
      else if (roll < 0.85) { if (!reduced) spawnChain(); }
      else rewireSparse();
    }

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function onPointerLeave() { mouse = null; }
    function onPointerDown(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, start: performance.now() });
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
      (entries) => { if (entries[0]?.isIntersecting) start(); else stop(); },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(canvas);

    if (!coarse) {
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
      canvas.addEventListener("pointerdown", onPointerDown);
    }
    document.addEventListener("visibilitychange", onVisibility);

    function draw(now: number) {
      const dt = Math.min(now - lastTime, 48);
      lastTime = now;

      ctx!.clearRect(0, 0, width, height);
      maybeTriggerEvent(now);

      const breathe = 1 + Math.sin(now * 0.0009) * 0.06;

      for (const n of nodes) {
        n.driftPhase += dt * 0.00035;
        const driftX = Math.sin(n.driftPhase) * n.driftAmp;
        const driftY = Math.cos(n.driftPhase * 0.8) * n.driftAmp;

        let targetInfluence = 0;
        let pullX = 0;
        let pullY = 0;
        if (mouse && n.ring !== "edge") {
          const d = Math.hypot(n.homeX - mouse.x, n.homeY - mouse.y);
          targetInfluence = magneticFalloff(d, 240);
          pullX = (mouse.x - n.homeX) * 0.18;
          pullY = (mouse.y - n.homeY) * 0.18;
        }
        const ease = 1 - Math.pow(0.001, dt / 500);
        n.influence += (targetInfluence - n.influence) * ease;

        n.x = n.homeX + driftX + pullX * n.influence;
        n.y = n.homeY + driftY + pullY * n.influence;
      }

      for (const e of edges) {
        const a = pointOf(e.a);
        const b = pointOf(e.b);
        if (!a || !b) continue;
        let opacity = e.base * breathe;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        if (mouse) {
          const d = Math.hypot(mx - mouse.x, my - mouse.y);
          if (d < 140) opacity += (1 - d / 140) * 0.22;
        }
        for (const r of ripples) {
          const age = now - r.start;
          if (age > RIPPLE_MS) continue;
          const radius = (age / RIPPLE_MS) * 220;
          const d = Math.hypot(mx - r.x, my - r.y);
          if (Math.abs(d - radius) < 36) opacity += 0.28 * (1 - age / RIPPLE_MS);
        }
        if (clusterBoost && e.a >= 0 && nodes[e.a]?.ring === clusterBoost.ring) {
          const p = now - clusterBoost.start;
          const life = clusterBoost.until - clusterBoost.start;
          opacity += Math.sin(Math.min(1, p / life) * Math.PI) * 0.16;
        }
        ctx!.strokeStyle = `rgba(${COLORS.core},${Math.min(opacity, 0.45)})`;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
      }

      if (!reduced) {
        chains = chains.filter((c) => c.seg < c.path.length - 1);
        for (const c of chains) {
          c.t += c.speed * (dt / 1000);
          const a = pointOf(c.path[c.seg]);
          const b = pointOf(c.path[c.seg + 1]);
          if (a && b) {
            const x = a.x + (b.x - a.x) * Math.min(c.t, 1);
            const y = a.y + (b.y - a.y) * Math.min(c.t, 1);
            ctx!.beginPath();
            ctx!.arc(x, y, 1.8, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(${COLORS.cyan},0.9)`;
            ctx!.shadowColor = `rgba(${COLORS.cyan},0.9)`;
            ctx!.shadowBlur = 7;
            ctx!.fill();
            ctx!.shadowBlur = 0;
          }
          if (c.t >= 1) {
            const arrivedIdx = c.path[c.seg + 1];
            if (arrivedIdx >= 0) nodes[arrivedIdx].activeUntil = now + 420;
            c.seg += 1;
            c.t = 0;
          }
        }
        if (chains.length < maxChains && Math.random() < 0.01) spawnChain();
      }

      for (const n of nodes) {
        const signalBoost = now < n.activeUntil ? (n.activeUntil - now) / 420 : 0;
        let clusterEnv = 0;
        if (clusterBoost && n.ring === clusterBoost.ring) {
          const p = now - clusterBoost.start;
          const life = clusterBoost.until - clusterBoost.start;
          clusterEnv = Math.sin(Math.min(1, p / life) * Math.PI) * 0.4;
        }
        const r = n.size * (1 + n.influence * 0.7 + signalBoost * 0.8);
        const baseOpacity = n.ring === "edge" ? 0.24 : n.ring === "ring2" ? 0.34 : 0.46;
        const opacity = Math.min(1, (baseOpacity + n.influence * 0.4 + signalBoost * 0.5 + clusterEnv) * breathe);

        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${COLORS.core},${opacity})`;
        if (signalBoost > 0.4) {
          ctx!.shadowColor = `rgba(${COLORS.cyan},0.6)`;
          ctx!.shadowBlur = 8;
        }
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }

      const coreBoost = now < coreBoostUntil ? (coreBoostUntil - now) / 1400 : 0;
      const coreAge = now * 0.00018;
      for (let ring = 1; ring <= 3; ring++) {
        ctx!.beginPath();
        ctx!.arc(core.x, core.y, 15 + ring * 13 + Math.sin(coreAge + ring) * 2, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${COLORS.core},${(0.16 - ring * 0.035 + coreBoost * 0.06) * breathe})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }
      ctx!.beginPath();
      ctx!.arc(core.x, core.y, 5.5 + coreBoost * 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(${COLORS.core},${0.85 + coreBoost * 0.15})`;
      ctx!.shadowColor = `rgba(${COLORS.core},0.85)`;
      ctx!.shadowBlur = 16 + coreBoost * 10;
      ctx!.fill();
      ctx!.shadowBlur = 0;

      ripples = ripples.filter((r) => now - r.start < RIPPLE_MS);
      for (const r of ripples) {
        const age = now - r.start;
        const radius = (age / RIPPLE_MS) * 220;
        ctx!.beginPath();
        ctx!.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${COLORS.cyan},${0.32 * (1 - age / RIPPLE_MS)})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      if (clusterBoost && now > clusterBoost.until) clusterBoost = null;

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
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />;
}
