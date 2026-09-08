"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "./LocaleProvider";
import { Pause, Play } from "lucide-react";

/** A projected particle surface; all geometry is local and deterministic. */
export default function SignalCore() {
  const { t: { core: c } } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const tiltRef = useRef({ x: 0, y: 0 });
  const [mode, setMode] = useState<"orbit" | "sphere">("orbit");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const surface = canvas;
    const context = ctx;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0, height = 0, frame = 0, angle = angleRef.current, last = 0;
    let visible = true;
    let pointer = { x: 0, y: 0 };
    const tilt = tiltRef.current;
    const particles = Array.from({ length: 2400 }, (_, i) => {
      const u = (i % 100) / 100 * Math.PI * 2;
      const v = Math.floor(i / 100) / 24 * Math.PI * 2;
      if (mode === "orbit") {
        const r = 1.04 + .38 * Math.cos(v);
        return { x: r * Math.cos(u), y: r * Math.sin(u), z: .38 * Math.sin(v) };
      }
      const y = 1 - i / 2399 * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = i * Math.PI * (3 - Math.sqrt(5));
      return { x: Math.cos(theta) * r * 1.25, y: y * 1.25, z: Math.sin(theta) * r * 1.25 };
    });

    function draw(now: number) {
      const dt = last ? Math.min(now - last, 40) : 0;
      last = now;
      if (!paused && !media.matches) angle += dt * .00013;
      angleRef.current = angle;
      if (!paused && !media.matches) {
        tilt.x += (pointer.x - tilt.x) * .045;
        tilt.y += (pointer.y - tilt.y) * .045;
      }
      context.clearRect(0, 0, width, height);
      const scale = Math.min(width, height) * .285;
      const ax = .9 + tilt.y * .3, ay = angle + tilt.x * .35;
      const projected = particles.map(p => {
        const x = p.x * Math.cos(ay) + p.z * Math.sin(ay);
        const z = -p.x * Math.sin(ay) + p.z * Math.cos(ay);
        const y = p.y * Math.cos(ax) - z * Math.sin(ax);
        const depth = p.y * Math.sin(ax) + z * Math.cos(ax);
        const perspective = 4 / (4 - depth);
        return { x: width / 2 + x * scale * perspective, y: height / 2 + y * scale * perspective, depth };
      }).sort((a, b) => a.depth - b.depth);
      for (const p of projected) {
        const strength = (p.depth + 1.5) / 3;
        context.fillStyle = `rgba(${p.depth > .6 ? "201,255,224" : "116,231,175"},${.12 + strength * .78})`;
        context.beginPath();
        context.arc(p.x, p.y, .55 + strength * .85, 0, Math.PI * 2);
        context.fill();
      }
      frame = 0;
      if (visible && !document.hidden && !paused && !media.matches) frame = requestAnimationFrame(draw);
    }
    function refresh() {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      if (visible && !document.hidden) draw(performance.now());
    }
    function resize() {
      const bounds = surface.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      surface.width = Math.round(width * dpr); surface.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      refresh();
    }
    function move(e: PointerEvent) {
      if (media.matches || paused || e.pointerType === "touch") return;
      const rect = surface.getBoundingClientRect();
      pointer = { x: (e.clientX - rect.left) / width * 2 - 1, y: (e.clientY - rect.top) / height * 2 - 1 };
    }
    function leave() { pointer = { x: 0, y: 0 }; }
    const resizeObserver = new ResizeObserver(resize);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; refresh(); });
    resize();
    resizeObserver.observe(surface);
    observer.observe(surface);
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", refresh);
    media.addEventListener("change", refresh);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect(); observer.disconnect();
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", refresh);
      media.removeEventListener("change", refresh);
    };
  }, [mode, paused]);

  return <div className="signal-core">
    <div className="core-caption"><span><i /> {c.label}</span><span>{c.figure}</span></div>
    <div className="core-stage">
      <div className="core-cross cross-top" aria-hidden="true">+</div>
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="core-axis" aria-hidden="true">Y<br />│<br />X ─── Z</span>
      <span className="core-coordinate" aria-hidden="true">{mode === "orbit" ? c.toroidal : c.spherical}<br />{c.surface}</span>
    </div>
    <div className="core-controls">
      <div className="core-modes" role="group" aria-label={c.modes}>
        <button type="button" aria-pressed={mode === "orbit"} onClick={() => setMode("orbit")}>01 / {c.orbit}</button>
        <button type="button" aria-pressed={mode === "sphere"} onClick={() => setMode("sphere")}>02 / {c.sphere}</button>
      </div>
      <button className="pause-button" type="button" aria-label={paused ? c.play : c.pause} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={13} /> : <Pause size={13} />}</button>
    </div>
  </div>;
}
