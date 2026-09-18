"use client";

import { memo, useEffect, useRef, type CSSProperties } from "react";

const glints = [[12, 64], [32, 41], [54, 72], [76, 33], [91, 61], [65, 48]];
const spine = (x: number) => .64 + Math.sin(x * 6.4) * .07 - x * .06;

// Build each cloud bank once, in small slices. Motion later belongs to the compositor.
function nebulaPainter(surface: HTMLCanvasElement, foreground: boolean, compact: boolean) {
  const ink = surface.getContext("2d")!;
  const width = compact ? 256 : 480, height = compact ? 256 : 240;
  const pixels = ink.createImageData(width, height);
  const field = new Float32Array(4096);
  let seed = foreground ? 26947 : 8249, row = 0;
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
  return () => {
    const deadline = performance.now() + 4;
    do {
      for (let column = 0; column < width; column++) {
        const u = column / width, v = row / height;
        // Warped billows and darker channels break up the broad, horizontal cloud banks.
        const warp = noise(u * 3 + 11, v * 3 + 7);
        const x = u * (compact ? 3 : 6.5) + (warp - .5) * 1.3;
        const y = v * 4.5 + noise(u * 4 + 5, v * 3) * .9;
        const coarse = noise(x, y);
        const detail = noise(x * 2.1, y * 2.1) * .29 + noise(x * 4.3, y * 4.3) * .18 + noise(x * 8.7, y * 8.7) * .1 + noise(x * 17.3, y * 17.3) * .05 + noise(x * 34.7, y * 34.7) * .02;
        const billow = coarse * .36 + detail;
        const density = Math.max(0, billow - .32) * 1.25;
        const center = foreground ? .68 + Math.sin(u * 7 + .8) * .085 : .49 + Math.sin(u * 5.5) * .09;
        const offset = v - center + (warp - .5) * .17;
        const bank = Math.exp(-offset * offset / (foreground ? .025 : .055));
        const channel = .24 + .76 * Math.min(1, Math.abs(billow - .48) * 9);
        const light = Math.max(0, Math.min(1, .5 + (noise(x, y - .16) - coarse) * 3));
        const edge = Math.min(1, u * 9, (1 - u) * 9, v * 8, (1 - v) * 8);
        const index = (row * width + column) * 4;
        pixels.data[index] = foreground ? 77 + light * 72 : 72 + light * 54;
        pixels.data[index + 1] = foreground ? 138 + light * 83 : 107 + light * 69;
        pixels.data[index + 2] = foreground ? 140 + light * 67 : 145 + light * 64;
        pixels.data[index + 3] = Math.min(132, density * 380) * bank * channel * edge;
      }
      row++;
    } while (row < height && performance.now() < deadline);
    if (row < height) return true;
    // Publish a completed texture atomically; resizing never reveals partially drawn rows.
    surface.width = width; surface.height = height;
    ink.putImageData(pixels, 0, 0);
    surface.dataset.ready = "true";
    return false;
  };
}

export default memo(function GuestbookNightSky() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const farCloud = useRef<HTMLCanvasElement>(null);
  const nearCloud = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    const context = surface.getContext("2d", { alpha: true });
    if (!context) return;
    const far = farCloud.current, near = nearCloud.current;
    if (!far || !near) return;
    let frame = 0, cloudFrame = 0, nearby = false;
    let paintedWidth = 0, paintedHeight = 0, paintedRatio = 0;
    let compactClouds: boolean | null = null;
    let cloudJobs: Array<() => boolean> = [];
    const paintCloudSlice = () => {
      cloudFrame = 0;
      if (!nearby || document.hidden || !cloudJobs.length) return;
      if (!cloudJobs[0]()) cloudJobs.shift();
      if (cloudJobs.length) cloudFrame = requestAnimationFrame(paintCloudSlice);
    };
    const resumeClouds = () => { if (cloudJobs.length && !cloudFrame) cloudFrame = requestAnimationFrame(paintCloudSlice); };
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
      const compact = width < 760;
      if (compact !== compactClouds) {
        compactClouds = compact;
        cloudJobs = [nebulaPainter(far, false, compact), nebulaPainter(near, true, compact)];
        resumeClouds();
      }
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
    const schedule = () => {
      if (!nearby || document.hidden) return;
      if (!frame) frame = requestAnimationFrame(paint);
      resumeClouds();
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(surface);
    const intersection = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      if (nearby) schedule();
      else { cancelAnimationFrame(frame); cancelAnimationFrame(cloudFrame); frame = 0; cloudFrame = 0; }
    }, { rootMargin: "200px" });
    intersection.observe(surface);
    document.addEventListener("visibilitychange", schedule);
    window.addEventListener("resize", schedule, { passive: true });
    return () => { resize.disconnect(); intersection.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(cloudFrame); document.removeEventListener("visibilitychange", schedule); window.removeEventListener("resize", schedule); cloudJobs = []; };
  }, []);

  return <div className="guestbook-night" aria-hidden="true">
    <canvas ref={farCloud} className="guestbook-nebula guestbook-nebula-far" />
    <canvas ref={canvas} className="guestbook-starfield" />
    <canvas ref={nearCloud} className="guestbook-nebula guestbook-nebula-near" />
    <div className="guestbook-glints">{glints.map(([x, y], index) => <i key={index} style={{ left: `${x}%`, top: `${y}%`, "--glint-delay": `${-index * 1.7}s`, "--glint-duration": `${3.8 + index % 4}s` } as CSSProperties} />)}</div>
    <div className="guestbook-horizon" />
  </div>;
});
