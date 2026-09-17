"use client";

import { memo, useEffect, useRef, type CSSProperties } from "react";

const glints = [[12, 64], [32, 41], [54, 72], [76, 33], [91, 61], [65, 48]];
const spine = (x: number) => .79 - x * .48 + Math.sin(x * 8) * .055;

// A small, cached cloud texture: no shaders, image downloads or per-frame noise.
function cloudTexture() {
  const texture = document.createElement("canvas");
  texture.width = 320; texture.height = 180;
  const ink = texture.getContext("2d")!;
  const pixels = ink.createImageData(texture.width, texture.height);
  const field = new Float32Array(4096);
  let seed = 8249;
  for (let i = 0; i < field.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    field[i] = seed / 4294967296;
  }
  const noise = (x: number, y: number) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = field[((iy & 63) << 6) + (ix & 63)];
    const b = field[((iy & 63) << 6) + ((ix + 1) & 63)];
    const c = field[(((iy + 1) & 63) << 6) + (ix & 63)];
    const d = field[(((iy + 1) & 63) << 6) + ((ix + 1) & 63)];
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
  for (let y = 0; y < texture.height; y++) {
    for (let x = 0; x < texture.width; x++) {
      const u = x / texture.width, v = y / texture.height;
      const n = noise(u * 5, v * 4) * .53 + noise(u * 13, v * 11) * .27 + noise(u * 32, v * 28) * .14 + noise(u * 71, v * 59) * .06;
      const offset = v - spine(u) + (n - .5) * .2;
      const band = Math.exp(-offset * offset / .025);
      const rift = 1 - Math.exp(-((offset + .02) ** 2) / .0009) * .8;
      const density = Math.max(0, n - .28) * band * rift;
      const index = (y * texture.width + x) * 4;
      pixels.data[index] = 102 + n * 24;
      pixels.data[index + 1] = 146 + n * 22;
      pixels.data[index + 2] = 162 + n * 27;
      pixels.data[index + 3] = Math.min(68, density * 145);
    }
  }
  ink.putImageData(pixels, 0, 0);
  return texture;
}

export default memo(function GuestbookNightSky() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    const context = surface.getContext("2d", { alpha: true });
    if (!context) return;
    let frame = 0, nearby = false;
    let paintedWidth = 0, paintedHeight = 0, paintedRatio = 0;
    let clouds: HTMLCanvasElement | null = null;
    const paint = () => {
      frame = 0;
      if (!nearby || document.hidden) return;
      // Layout dimensions are independent of the compositor-only camera drift.
      const width = surface.clientWidth, height = surface.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, width < 760 ? 1.25 : 1.5);
      if (!width || !height || (width === paintedWidth && height === paintedHeight && ratio === paintedRatio)) return;
      paintedWidth = width; paintedHeight = height; paintedRatio = ratio;
      surface.width = Math.round(width * ratio); surface.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      clouds ||= cloudTexture();
      context.drawImage(clouds, 0, 0, width, height);
      let seed = 76421;
      const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      const dot = (x: number, y: number, radius: number, color: string | CanvasGradient) => {
        context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = color; context.fill();
      };
      // Dim dust lives in the galaxy; the surrounding negative space stays quiet.
      const dustCount = Math.min(1400, Math.round(width * height / 550));
      for (let i = 0; i < dustCount; i++) {
        const t = random(), spread = random() + random() + random() - 1.5;
        const y = height * (spine(t) + spread * .14);
        dot(t * width, y, .22 + random() * .48, `rgba(179,206,218,${.05 + random() * .22})`);
      }
      const count = Math.min(650, Math.max(140, Math.round(width * height / 1450)));
      for (let i = 0; i < count; i++) {
        const x = random() * width, y = random() * height, depth = random();
        const radius = depth > .98 ? 1.15 : .3 + random() * .55;
        const alpha = depth > .95 ? .6 + random() * .25 : .12 + random() * .4;
        const color = i % 13 === 0 ? "221,216,198" : i % 7 === 0 ? "190,236,215" : "198,219,238";
        if (depth > .98) {
          const halo = context.createRadialGradient(x, y, 0, x, y, 9);
          halo.addColorStop(0, `rgba(${color},.22)`); halo.addColorStop(1, `rgba(${color},0)`);
          dot(x, y, 9, halo);
        }
        dot(x, y, radius, `rgba(${color},${alpha})`);
      }
    };
    const schedule = () => { if (nearby && !document.hidden && !frame) frame = requestAnimationFrame(paint); };
    const resize = new ResizeObserver(schedule);
    resize.observe(surface);
    const intersection = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      if (nearby) schedule();
      else { cancelAnimationFrame(frame); frame = 0; }
    }, { rootMargin: "200px" });
    intersection.observe(surface);
    document.addEventListener("visibilitychange", schedule);
    return () => { resize.disconnect(); intersection.disconnect(); cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", schedule); clouds = null; };
  }, []);

  return <div className="guestbook-night" aria-hidden="true">
    <canvas ref={canvas} className="guestbook-starfield" />
    <div className="guestbook-glints">{glints.map(([x, y], index) => <i key={index} style={{ left: `${x}%`, top: `${y}%`, "--glint-delay": `${-index * 2.7}s`, "--glint-duration": `${7 + index % 4 * 2}s` } as CSSProperties} />)}</div>
    <div className="guestbook-horizon" />
  </div>;
});
