import type { DealerHand } from "@/lib/project-dealer-motion";

type Vec3 = [number, number, number];
type Sample = { bone: number; t: number; ring: number; x: number; y: number; z: number; seed: number; alpha: number };
const OPEN: Vec3[][] = [
  [[-28, 25, 0], [-47, 5, 3], [-59, -13, 5], [-54, -30, 4]],
  [[-24, -12, 0], [-28, -43, 0], [-27, -67, 2], [-24, -82, 3]],
  [[-5, -18, 0], [-6, -56, 0], [-5, -80, 2], [-3, -97, 3]],
  [[14, -15, 0], [17, -50, 0], [20, -73, 2], [22, -86, 3]],
  [[30, -7, 0], [38, -32, 0], [42, -52, 2], [43, -65, 3]],
];
const PRESS: Vec3[][] = [
  [[-28, 25, 0], [-50, 10, -3], [-65, -7, 1], [-74, -20, 8]],
  [[-24, -12, 0], [-36, -45, -6], [-45, -70, -1], [-49, -87, 10]],
  [[-5, -18, 0], [-8, -56, -6], [-9, -83, -1], [-10, -102, 10]],
  [[14, -15, 0], [23, -49, -6], [30, -76, -1], [36, -92, 10]],
  [[30, -7, 0], [47, -29, -5], [58, -50, 0], [65, -64, 10]],
];
const HOOK: Vec3[][] = [
  [[-28, 25, 0], [-47, 0, 8], [-40, -38, 17], [-24, -59, 21]],
  [[-24, -12, 0], [-33, -48, -5], [-37, -77, 7], [-28, -61, 29]],
  [[-5, -18, 0], [-7, -48, 5], [0, -62, 24], [10, -45, 40]],
  [[14, -15, 0], [20, -37, 11], [30, -43, 30], [32, -22, 41]],
  [[30, -7, 0], [41, -20, 13], [46, -17, 31], [40, -3, 37]],
];
const CARRY: Vec3[][] = [
  HOOK[0], HOOK[1],
  [[-5, -18, 0], [3, -47, 4], [14, -69, 14], [21, -77, 29]],
  [[14, -15, 0], [30, -41, 5], [43, -57, 16], [49, -56, 32]],
  [[30, -7, 0], [51, -25, 8], [65, -34, 19], [65, -25, 33]],
];
const hash = (n: number) => { const v = Math.sin(n * 127.1 + 31.7) * 43758.5453; return v - Math.floor(v); };
const colors = ["#436950", "#649879", "#88bd99", "#ace8bc", "#cdffdb", "#effff0"];

function sampleHand(): Sample[] {
  const points: Sample[] = [];
  for (let row = 0; row < 15; row++) {
    const t = row / 14;
    const width = 18 + 18 * Math.sin(t * Math.PI * .72);
    for (let side = 0; side < 20; side++) {
      const angle = (side + (row % 2) * .5) / 20 * Math.PI * 2;
      points.push({ bone: -1, t, ring: 0, x: Math.cos(angle) * width + 3 * t, y: 60 - t * 80, z: Math.sin(angle) * 13, seed: hash(points.length), alpha: 1 });
    }
  }
  for (let row = 0; row < 9; row++) {
    const t = row / 8;
    for (let side = 0; side < 12; side++) {
      const angle = (side + row * .3) / 12 * Math.PI * 2;
      points.push({ bone: -1, t, ring: 0, x: Math.cos(angle) * (19 - t * 3) + t * 5, y: 65 + t * 61, z: Math.sin(angle) * 10, seed: hash(points.length), alpha: (1 - t) * .8 });
    }
  }
  for (let bone = 0; bone < 15; bone++) {
    for (let along = 0; along < 7; along++) {
      for (let side = 0; side < 7; side++) {
        points.push({ bone, t: along / 6, ring: (side + along * .4) / 7 * Math.PI * 2, x: 0, y: 0, z: 0, seed: hash(points.length), alpha: 1 });
      }
    }
  }
  return points;
}

/** A scroll-painted point cloud: no per-particle DOM, timers, textures or perpetual render loop. */
export function createParticleDealer(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return null;
  const ctx = context;
  const samples = sampleHand();
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 24;
  const glow = sprite.getContext("2d")!;
  const gradient = glow.createRadialGradient(12, 12, 0, 12, 12, 12);
  gradient.addColorStop(0, "#ddffeccc");
  gradient.addColorStop(.25, "#bcf8ce66");
  gradient.addColorStop(1, "#bcf8ce00");
  glow.fillStyle = gradient;
  glow.fillRect(0, 0, 24, 24);
  let width = 0;
  let height = 0;
  let ratio = 1;
  let stride = 1;

  function clear() { ctx.clearRect(0, 0, width, height); }
  function resize(w: number, h: number, narrow: boolean) {
    const dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1.25 : 1.5);
    if (width === w && height === h && dpr === ratio) return;
    width = w;
    height = h;
    ratio = dpr;
    stride = narrow ? 2 : 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function render(hands: DealerHand[]) {
    clear();
    for (const hand of hands) {
      if (hand.presence < .005) continue;
      const angle = hand.angle * Math.PI / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const grip = hand.grip;
      const joints = OPEN.map((finger, f) => finger.map((p, j) => p.map((value, axis) => {
        const target = hand.gesture === "push" ? PRESS[f][j][axis]
          : HOOK[f][j][axis] + (CARRY[f][j][axis] - HOOK[f][j][axis]) * hand.turn;
        return value + (target - value) * grip;
      }) as Vec3));
      // Palm pressure and a hooked fingertip have different pivots. Subtract the
      // articulated contact before turning the wrist so it stays on the card.
      const anchor: Vec3 = hand.gesture === "push" ? [0, 15, 0]
        : joints[1][3].map((value, axis) => value + (joints[0][3][axis] - value) * grip * .5) as Vec3;
      const yaw = hand.yaw * Math.PI / 180, pitch = hand.pitch * Math.PI / 180;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const project = (x: number, y: number, z: number) => {
        const dx = (x - anchor[0]) * hand.mirror, dy = y - anchor[1], dz = z - anchor[2];
        const px = dx * cy + dz * sy, depth = dz * cy - dx * sy;
        const py = dy * cp - depth * sp;
        return { x: hand.x + (px * cos - py * sin) * hand.scale, y: hand.y + (px * sin + py * cos) * hand.scale, z: dy * sp + depth * cp };
      };
      const bones = joints.flatMap((finger, f) => finger.slice(0, 3).map((p, j) => {
        const end = finger[j + 1];
        const dx = end[0] - p[0];
        const dy = end[1] - p[1];
        const length = Math.hypot(dx, dy) || 1;
        return { p, end, nx: -dy / length, ny: dx / length, radius: (f === 0 ? 7.8 : f === 4 ? 5.2 : 6.5) - j * .9 };
      }));
      const scatter = (1 - hand.presence) ** 2 * 24;
      for (let i = 0; i < samples.length; i += stride) {
        const point = samples[i];
        let { x, y, z } = point;
        if (point.bone >= 0) {
          const bone = bones[point.bone];
          const radius = bone.radius * (1 - point.t * .15);
          const ring = Math.cos(point.ring) * radius;
          x = bone.p[0] + (bone.end[0] - bone.p[0]) * point.t + ring * bone.nx;
          y = bone.p[1] + (bone.end[1] - bone.p[1]) * point.t + ring * bone.ny;
          z = bone.p[2] + (bone.end[2] - bone.p[2]) * point.t + Math.sin(point.ring) * radius;
        }
        const projected = project(x, y, z);
        const dustX = Math.sin(point.seed * 70) * scatter;
        const dustY = Math.cos(point.seed * 90) * scatter;
        const sx = projected.x + dustX;
        const sy = projected.y + dustY;
        const light = Math.max(0, Math.min(5, Math.floor(2.4 + projected.z * .035 + point.seed * 1.8)));
        ctx.globalAlpha = hand.presence * point.alpha * (.64 + point.seed * .32);
        ctx.fillStyle = colors[light];
        const size = (.9 + point.seed * .85) * Math.min(1, hand.scale + .3);
        ctx.fillRect(sx, sy, size, size);
        if (i % (stride * 13) === 0 && light > 2) {
          ctx.globalAlpha = hand.presence * point.alpha * .28;
          ctx.drawImage(sprite, sx - 5, sy - 5, 11, 11);
        }
      }
      // Sparse wrist filaments clarify follow-through without leaving a solid arm.
      for (let i = 0; i < 36; i += stride) {
        const t = i / 36;
        const point = project(Math.sin(i * 2.4) * (8 + t * 16), 88 + t * 90, Math.cos(i * 1.7) * 10);
        ctx.globalAlpha = hand.presence * hand.energy * (1 - t) * .48;
        ctx.fillStyle = colors[3];
        ctx.fillRect(point.x, point.y, 1.3, 1.3);
      }
      if (hand.gesture === "push") {
        // A pressure pulse expands from the planted palm, not from the card edges.
        const radius = (24 + hand.turn * 86) * hand.scale;
        ctx.globalAlpha = hand.presence * hand.energy * (1 - hand.turn) * .38;
        ctx.strokeStyle = colors[3];
        ctx.lineWidth = .8;
        ctx.beginPath();
        ctx.ellipse(hand.x, hand.y, radius, radius * .58, angle, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = hand.presence * hand.energy * .5;
      const contactSize = (hand.gesture === "push" ? 68 : 28) * hand.scale;
      ctx.drawImage(sprite, hand.x - contactSize / 2, hand.y - contactSize / 2, contactSize, contactSize);
      ctx.globalAlpha = 1;
    }
    canvas.dataset.hands = String(hands.filter(hand => hand.presence >= .005).length);
  }

  return { resize, render, clear, dispose: () => { clear(); canvas.width = canvas.height = 0; } };
}
