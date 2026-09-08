"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "./LocaleProvider";
import { Pause, Play } from "lucide-react";

type Mood = "idle" | "body" | "eyes" | "nose" | "hands" | "feet";
const clamp = (n: number) => Math.max(-1, Math.min(1, n));

/** The particle shapes are the bodies; limbs and expressions share their pose. */
export default function SignalCore() {
  const { t: { core: c } } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activateRef = useRef<() => void>(() => {});
  const animationRef = useRef({ mode: "orbit", time: 0, excitement: 0, reaction: "idle" as Mood, gaze: { x: 0, y: 0 } });
  const hintId = useId();
  const [mode, setMode] = useState<"orbit" | "sphere">("orbit");
  const [paused, setPaused] = useState(false);
  const [mood, setMood] = useState<Mood>("idle");

  useEffect(() => {
    const surface = canvasRef.current, context = surface?.getContext("2d");
    if (!surface || !context) return;
    const canvas = surface, ctx = context;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saved = animationRef.current.mode === mode ? animationRef.current : { time: 0, excitement: 0, reaction: "idle" as Mood, gaze: { x: 0, y: 0 } };
    let width = 0, height = 0, frame = 0, last = 0, time = saved.time, visible = false, settle = 0;
    let reaction: Mood = saved.reaction, shown: Mood = "idle", excitement = saved.excitement, tapUntil = 0;
    let pointer: { x: number; y: number } | null = null;
    const gaze = { ...saved.gaze };
    let pose = { x: 0, y: 0, scale: 1, sx: 1, sy: 1 };
    const particles = Array.from({ length: 2000 }, (_, i) => {
      const u = (i % 100) / 100 * Math.PI * 2, v = Math.floor(i / 100) / 20 * Math.PI * 2;
      if (mode === "orbit") {
        const r = .94 + .34 * Math.cos(v);
        return { x: r * Math.cos(u), y: r * Math.sin(u), z: .34 * Math.sin(v) };
      }
      const y = 1 - i / 1999 * 2, r = Math.sqrt(1 - y * y), theta = i * Math.PI * (3 - Math.sqrt(5));
      return { x: Math.cos(theta) * r * 1.13, y: y * 1.13, z: Math.sin(theta) * r * 1.13 };
    });
    function moodAtPointer(): Mood {
      if (!pointer) return "idle";
      const x = (pointer.x - pose.x) / (pose.scale * pose.sx), y = (pointer.y - pose.y) / (pose.scale * pose.sy);
      if (Math.abs(x) > 1.22 && Math.abs(x) < 1.85 && y > -.6 && y < .8) return "hands";
      if (Math.abs(x) > .18 && Math.abs(x) < .95 && y > 1.06 && y < 1.65) return "feet";
      if (Math.abs(x) < .17 && y > .02 && y < .36) return "nose";
      if (Math.abs(x) < .6 && y > -.45 && y < .02) return "eyes";
      const ry = mode === "orbit" ? .87 : 1.22;
      return x * x / 1.7 + y * y / (ry * ry) < 1 ? "body" : "idle";
    }
    function ellipse(x: number, y: number, rx: number, ry: number, fill: string) {
      ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    }
    function curve(p: number[], color = "#bcf8ce", line = .036) {
      ctx.strokeStyle = color; ctx.lineWidth = line; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(p[0], p[1]);
      if (p.length === 6) ctx.quadraticCurveTo(p[2], p[3], p[4], p[5]);
      else ctx.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
      ctx.stroke();
    }
    function draw(now: number) {
      frame = 0;
      if (!visible || document.hidden || !width || !height) return;
      const moving = !paused && !media.matches, dt = last ? Math.min(now - last, 40) : 16;
      last = now; if (moving) time += dt / 1000;
      reaction = paused ? reaction : now < tapUntil ? "body" : media.matches ? "idle" : moodAtPointer();
      if (shown !== reaction) { shown = reaction; setMood(reaction); }
      const ease = 1 - Math.exp(-dt / 110), target = reaction === "idle" ? 0 : 1;
      excitement = moving ? excitement + (target - excitement) * ease : paused ? excitement : target;
      const scale = Math.min(width, height) * .235, wobble = excitement * Math.sin(time * 17);
      pose = { x: width / 2, y: height * .44 + Math.sin(time * 1.9) * scale * .035 - excitement * scale * .055, scale, sx: 1 + wobble * .035, sy: 1 - wobble * .035 };
      if (moving) {
        const gx = pointer ? clamp((pointer.x - pose.x) / (width * .35)) : 0, gy = pointer ? clamp((pointer.y - pose.y) / (height * .35)) : 0;
        gaze.x += (gx - gaze.x) * ease; gaze.y += (gy - gaze.y) * ease;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.save(); ctx.translate(pose.x, pose.y); ctx.scale(scale * pose.sx, scale * pose.sy);
      ellipse(0, 1.48, .73 - excitement * .06, .065, "#bcf8ce0b");
      // Short, rounded limbs attach at the silhouette, with a relaxed resting
      // pose. Only the nearer hand waves; foot taps alternate without flailing.
      for (const side of [-1, 1]) {
        const greeting = reaction === "hands" && side === (gaze.x < 0 ? -1 : 1);
        const armEnergy = excitement * (greeting ? 1 : reaction === "body" ? .35 : .12);
        const wave = Math.sin(time * 6.5 + side) * armEnergy;
        const handX = side * (1.46 + wave * .025), handY = .4 - armEnergy * .42 + wave * .065;
        const shoulder = mode === "orbit" ? 1.2 : 1.08;
        const arm = [side * shoulder, .16, side * 1.4, .22 - armEnergy * .24, handX, handY];
        curve(arm, "#284d3a", .105); curve(arm, "#a7d9ba", .072);
        ctx.save(); ctx.translate(handX, handY); ctx.scale(side, 1);
        ctx.rotate(-.2 - armEnergy * 2.1 + wave * .2);
        // A soft mitten with one thumb, rather than separate stick fingers.
        const mitten = ctx.createLinearGradient(-.12, -.13, .14, .18);
        mitten.addColorStop(0, "#d0f4dc"); mitten.addColorStop(1, "#88bca0");
        ctx.fillStyle = mitten; ctx.beginPath(); ctx.moveTo(-.07, -.1);
        ctx.bezierCurveTo(-.19, -.07, -.17, .12, -.08, .19);
        ctx.bezierCurveTo(.015, .27, .15, .17, .13, .065);
        ctx.bezierCurveTo(.24, .045, .22, -.07, .12, -.075);
        ctx.quadraticCurveTo(.045, -.15, -.07, -.1); ctx.fill();
        curve([-.09, -.02, -.11, .065, -.065, .1], "#e4ffe94a", .018); ctx.restore();
        const footEnergy = excitement * (reaction === "feet" ? 1 : reaction === "body" ? .45 : .1);
        const tap = Math.max(0, Math.sin(time * 6 + (side === 1 ? Math.PI : 0))) * footEnergy;
        const ankleX = side * (.49 + tap * .055), ankleY = 1.28 - tap * .13;
        const leg = [side * .46, 1.0, side * .45, 1.16, ankleX, ankleY];
        curve(leg, "#284d3a", .12); curve(leg, "#a7d9ba", .085);
        ctx.save(); ctx.translate(ankleX, ankleY); ctx.scale(side, 1); ctx.rotate(-.08 - tap * .2);
        const shoe = ctx.createLinearGradient(0, -.05, 0, .17);
        shoe.addColorStop(0, "#c8efd6"); shoe.addColorStop(1, "#81b195");
        ctx.fillStyle = shoe; ctx.beginPath(); ctx.moveTo(-.1, -.045);
        ctx.bezierCurveTo(-.16, -.04, -.17, .11, -.1, .14);
        ctx.bezierCurveTo(0, .19, .27, .16, .25, .065);
        ctx.bezierCurveTo(.24, -.025, .07, -.08, -.1, -.045); ctx.fill();
        curve([-.09, .125, .065, .17, .21, .115], "#48795d", .025); ctx.restore();
      }
      // Keep the torus recognisable; rotate particles around its central opening.
      const ay = mode === "sphere" ? time * .18 : Math.sin(time * .35) * .13;
      const ax = mode === "orbit" ? .76 + gaze.y * .045 : .25, az = mode === "orbit" ? time * .07 : 0;
      const projected = particles.map(p => {
        const px = p.x * Math.cos(az) - p.y * Math.sin(az), py = p.x * Math.sin(az) + p.y * Math.cos(az);
        const x = px * Math.cos(ay) + p.z * Math.sin(ay), z = -px * Math.sin(ay) + p.z * Math.cos(ay);
        const y = py * Math.cos(ax) - z * Math.sin(ax), depth = py * Math.sin(ax) + z * Math.cos(ax), perspective = 4 / (4 - depth);
        return { x: x * perspective, y: y * perspective, depth };
      }).sort((a, b) => a.depth - b.depth);
      for (const p of projected) {
        const strength = (p.depth + 1.5) / 3, radius = (.55 + strength * .8) / scale;
        ellipse(p.x, p.y, radius, radius, `rgba(${p.depth > .6 ? "209,255,226" : "116,231,175"},${.14 + strength * .72})`);
      }
      const blink = Math.sin(time * 1.15) > .996;
      for (const side of [-1, 1]) {
        const wink = blink || (reaction === "eyes" && side === (gaze.x < 0 ? -1 : 1)), eyeX = side * .28, eyeY = -.2;
        curve([eyeX - .13, -.5, eyeX, -.57 - excitement * .08, eyeX + .12, -.49 + side * wobble * .035], "#d8ffe5", .026);
        if (wink) { curve([eyeX - .15, eyeY, eyeX, eyeY + .09, eyeX + .15, eyeY], "#e4ffec", .045); continue; }
        ellipse(eyeX, eyeY, .185, .225, "#d9ffe6");
        ctx.save(); ctx.beginPath(); ctx.ellipse(eyeX, eyeY, .17, .21, 0, 0, Math.PI * 2); ctx.clip();
        const pupilX = eyeX + gaze.x * .075, pupilY = eyeY + gaze.y * .09;
        ellipse(pupilX, pupilY, .087, .115, "#102d22"); ellipse(pupilX + .025, pupilY - .036, .029, .034, "#f1fff5"); ctx.restore();
      }
      const boop = reaction === "nose" ? Math.sin(time * 23) * .045 : 0;
      ellipse(boop, .135, reaction === "nose" ? .12 : .085, .065, reaction === "nose" ? "#f1c5b8" : "#95dcae");
      if (excitement > .08) {
        ellipse(-.51, .16, .14, .065, `rgba(239,169,154,${excitement * .65})`);
        ellipse(.51, .16, .14, .065, `rgba(239,169,154,${excitement * .65})`);
      }
      if (reaction === "body" || reaction === "feet" || reaction === "hands") {
        ctx.fillStyle = "#08251b"; ctx.strokeStyle = "#cfffde"; ctx.lineWidth = .025;
        ctx.beginPath(); ctx.moveTo(-.25, .35); ctx.quadraticCurveTo(0, .41, .25, .35); ctx.bezierCurveTo(.22, .79, -.19, .78, -.25, .35); ctx.fill(); ctx.stroke();
        ellipse(.04, .59, .12, .067, "#e8a994"); curve([-.14, .405, 0, .44, .14, .405], "#e2ffea", .045);
      } else if (reaction === "nose") {
        ellipse(0, .43, .09, .115, "#08251b");
        ctx.strokeStyle = "#cfffde"; ctx.lineWidth = .025; ctx.beginPath(); ctx.ellipse(0, .43, .09, .115, 0, 0, Math.PI * 2); ctx.stroke();
      } else curve([-.22, .34, .01, .55, .25, .3], "#d2ffdf", .034);
      ctx.restore();
      animationRef.current = { mode, time, excitement, reaction, gaze: { ...gaze } };
      if (moving) frame = requestAnimationFrame(draw);
    }
    function refresh() { cancelAnimationFrame(frame); frame = 0; last = 0; if (visible && !document.hidden) draw(performance.now()); }
    function resize() {
      const bounds = canvas.getBoundingClientRect(); width = bounds.width; height = bounds.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); refresh();
    }
    function move(event: PointerEvent) {
      if (!visible || paused || media.matches || event.pointerType === "touch" || canvas.closest("main")?.inert) return;
      const rect = canvas.getBoundingClientRect(); pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    function leave() { pointer = null; }
    activateRef.current = () => {
      if (paused) return;
      tapUntil = performance.now() + 1400; refresh();
      window.clearTimeout(settle); settle = window.setTimeout(refresh, 1450);
    };
    setMood("idle");
    const resizeObserver = new ResizeObserver(resize);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; refresh(); });
    resize(); resizeObserver.observe(canvas); observer.observe(canvas);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave); window.addEventListener("scroll", leave, { passive: true });
    document.addEventListener("visibilitychange", refresh); media.addEventListener("change", refresh);
    return () => {
      cancelAnimationFrame(frame); window.clearTimeout(settle); resizeObserver.disconnect(); observer.disconnect();
      window.removeEventListener("pointermove", move); document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave); window.removeEventListener("scroll", leave);
      document.removeEventListener("visibilitychange", refresh); media.removeEventListener("change", refresh); activateRef.current = () => {};
    };
  }, [mode, paused]);

  return <div className="signal-core">
    <div className="core-stage"><button type="button" className="core-character" onClick={() => activateRef.current()} aria-label={c.interact} aria-describedby={hintId}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className={`character-quip ${mood === "idle" ? "" : "character-quip-visible"}`} aria-hidden="true">{mood === "idle" ? "" : c.reactions[mood]}</span>
    </button></div>
    <div className="core-controls">
      <div className="core-modes" role="group" aria-label={c.modes}>
        <button type="button" aria-pressed={mode === "orbit"} onClick={() => setMode("orbit")}>01 / {c.orbit}</button>
        <button type="button" aria-pressed={mode === "sphere"} onClick={() => setMode("sphere")}>02 / {c.sphere}</button>
      </div>
      <button className="pause-button" type="button" aria-label={paused ? c.play : c.pause} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={13} /> : <Pause size={13} />}</button>
    </div>
    <p className="character-hint" id={hintId}>{c.hint}</p>
  </div>;
}
