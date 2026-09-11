import { ambientPose, explorationWaves, foundationPose, galaxyPose, topicPose, universeView, MAX_AMBIENT_STREAMS, type LearningUniverse } from "./knowledge-universe";

type Fragment = { kind: string; title: string; detail: string };
export type KnowledgeContent = {
  foundation: { title: string; code: string }[];
  bridge: Fragment[];
  fragments: Fragment[];
  galaxies: { id: string; title: string; detail: string; topics: string[] }[];
};
type Sprite = { image: HTMLCanvasElement; width: number; height: number };
const colors = ["#d2c5a0", "#b9dac7", "#abc9da", "#bdc0df", "#ced2a7", "#a7d5cf"];
const ink: Record<string, string> = { agent: "#bfd9d0", model: "#d4cfb9", inference: "#b8d1df", system: "#c7c4df", code: "#bad6c2", equation: "#d0ccb7" };
const clamp = (x: number) => Math.max(0, Math.min(1, x));

/** One bounded drawing surface. Text and spiral gradients are rasterized once. */
export function createKnowledgeRenderer(canvas: HTMLCanvasElement, content: KnowledgeContent, mono: string) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return null;
  const ctx = context;
  const labels = new Map<string, Sprite>();
  const catalog = [...content.bridge, ...content.fragments];
  let width = 1, ratio = 1, compact = false;

  // Cache the luminous wavefront once; each scan is a single scaled drawImage.
  const scanSprite = document.createElement("canvas");
  scanSprite.width = scanSprite.height = 512;
  const scan = scanSprite.getContext("2d")!;
  const light = scan.createRadialGradient(256, 256, 0, 256, 256, 256);
  light.addColorStop(0, "#a8f2c700");
  light.addColorStop(.84, "#a8f2c700");
  light.addColorStop(.92, "#a8f2c71a");
  light.addColorStop(.968, "#befbce80");
  light.addColorStop(.98, "#e3ffe3e6");
  light.addColorStop(.988, "#bcf8ce55");
  light.addColorStop(1, "#bcf8ce00");
  scan.fillStyle = light; scan.fillRect(0, 0, 512, 512);

  function label(title: string, detail: string, color: string, size = 11): Sprite {
    const key = `${title}|${detail}|${color}|${size}`;
    const cached = labels.get(key);
    if (cached) return cached;
    const image = document.createElement("canvas");
    const draw = image.getContext("2d")!;
    draw.font = `${size}px ${mono}`;
    const titleWidth = draw.measureText(title).width;
    draw.font = `8px ${mono}`;
    const w = Math.ceil(Math.max(titleWidth, draw.measureText(detail).width)) + 16;
    const h = detail ? 38 : 23;
    image.width = w * 2; image.height = h * 2;
    draw.scale(2, 2);
    draw.textAlign = "center"; draw.textBaseline = "top";
    draw.font = `${size}px ${mono}`;
    draw.fillStyle = color;
    draw.shadowColor = "#080b0a"; draw.shadowBlur = 4;
    draw.fillText(title, w / 2, 4);
    if (detail) { draw.font = `8px ${mono}`; draw.fillStyle = "#82978a"; draw.fillText(detail, w / 2, 21); }
    const sprite = { image, width: w, height: h };
    // Keep long visits bounded as subjects rotate through different galaxy colors.
    if (labels.size >= 128) labels.delete(labels.keys().next().value!);
    labels.set(key, sprite);
    return sprite;
  }

  const spirals = colors.map(color => {
    const image = document.createElement("canvas");
    image.width = 320; image.height = 220;
    const draw = image.getContext("2d")!;
    draw.translate(160, 110); draw.scale(2, 2);
    const glow = draw.createRadialGradient(0, 0, 1, 0, 0, 65);
    glow.addColorStop(0, `${color}38`); glow.addColorStop(.5, `${color}12`); glow.addColorStop(1, `${color}00`);
    draw.save(); draw.rotate(-.38); draw.scale(1, .5);
    draw.fillStyle = glow; draw.fillRect(-80, -80, 160, 160);
    draw.strokeStyle = color; draw.lineWidth = .65; draw.globalAlpha = .55;
    for (let arm = 0; arm < 2; arm++) {
      draw.beginPath();
      for (let i = 0; i < 48; i++) {
        const r = 3 + i * 1.38, a = i * .15 + arm * Math.PI;
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (i === 0) draw.moveTo(x, y); else draw.lineTo(x, y);
      }
      draw.stroke();
    }
    draw.fillStyle = color;
    for (let i = 0; i < 24; i++) {
      const r = 14 + i % 12 * 4.3, a = i % 12 * .61 + (i < 12 ? 0 : Math.PI);
      draw.globalAlpha = .4 + i % 4 * .15;
      draw.beginPath(); draw.arc(Math.cos(a) * r, Math.sin(a) * r, i % 3 === 0 ? 1.3 : .65, 0, Math.PI * 2); draw.fill();
    }
    draw.restore(); draw.globalAlpha = .9; draw.fillStyle = color;
    draw.beginPath(); draw.arc(0, 0, 2, 0, Math.PI * 2); draw.fill();
    return image;
  });

  function text(sprite: Sprite, x: number, y: number, scale: number, opacity: number) {
    if (opacity < .015 || scale < .08) return;
    ctx.globalAlpha = Math.min(1, opacity);
    ctx.drawImage(sprite.image, x - sprite.width * scale / 2, y, sprite.width * scale, sprite.height * scale);
  }
  function dot(x: number, y: number, color: string, opacity: number, radius = 1.2) {
    ctx.globalAlpha = opacity; ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }

  return {
    resize(size: number, mobile: boolean, deviceRatio: number) {
      width = Math.max(1, size); compact = mobile;
      ratio = Math.min(deviceRatio, mobile ? 1.25 : 1.5);
      const pixels = Math.round(width * ratio);
      if (canvas.width !== pixels || canvas.height !== pixels) { canvas.width = pixels; canvas.height = pixels; }
    },
    invalidateText() { labels.clear(); },
    paint(state: LearningUniverse, showWaves = true) {
      const view = universeView(state), centerX = width * .5, centerY = width * .46;
      const waves = showWaves ? explorationWaves(state) : [];
      const scanLight = (x: number, y: number) => {
        if (!waves.length) return 0;
        const distance = Math.hypot(x, y) / width;
        return waves.reduce((brightest, wave) => Math.max(brightest, wave.opacity * clamp(1 - Math.abs(distance - wave.radius) / wave.band)), 0);
      };
      const projected = width * view.zoom;
      const scope = width * view.explorationRadius;
      let ambientVisible = 0, relatedVisible = 0, foundationVisible = 0;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, width);
      for (let i = 0; i < 96; i++) {
        const x = (((i * 73 + 19) % 101) / 100 - .5) * width * 1.15;
        const y = (((i * 37 + 11) % 97) / 96 - .5) * width * .75;
        const distance = Math.hypot(x / (scope + width * .07), y / (scope * .66 + width * .06));
        const illuminated = scanLight(x, y);
        const opacity = clamp(clamp(1 - distance) * (.15 + i % 4 * .06) * (i < 32 ? 1 : view.maturity) + illuminated * .75);
        if (opacity > .01) dot(centerX + x, centerY + y, illuminated > .1 ? "#ddffe5" : "#bcd7cc", opacity, (i % 5 === 0 ? 1 : .6) + illuminated * .9);
      }

      // Faint orbital dust, drawn as a few paths rather than masked gradient layers.
      ctx.strokeStyle = "#b9d7c2"; ctx.lineWidth = .5;
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = .05 + view.maturity * .025;
        ctx.beginPath(); ctx.ellipse(centerX, centerY, scope * (.5 + i * .2), scope * (.3 + i * .1), -.28, state.time * .015 + i, state.time * .015 + i + 2.6); ctx.stroke();
      }
      for (const wave of waves) {
        const radius = wave.radius * width;
        ctx.globalAlpha = wave.opacity;
        ctx.drawImage(scanSprite, centerX - radius, centerY - radius, radius * 2, radius * 2);
      }

      for (let i = 0; i < (compact ? 16 : MAX_AMBIENT_STREAMS); i++) {
        const pose = ambientPose(state, i);
        if (!pose || pose.opacity < .015) continue;
        const fragment = catalog[pose.catalogIndex % catalog.length];
        const x = centerX + pose.x * scope, y = centerY + pose.y * scope;
        text(label(fragment.title, !compact && i % 3 === 0 ? fragment.detail : "", ink[fragment.kind] ?? "#bad6c2"), x, y, pose.scale, pose.opacity * (1 + scanLight(x - centerX, y - centerY) * .45));
        ambientVisible++;
      }
      // Small non-text particles share the study clock and cost no DOM animations.
      if (state.foundationStudyClock !== null) for (let i = 0; i < (compact ? 10 : 20); i++) {
        const elapsed = state.studyClock - state.foundationStudyClock - 2 - i * .65;
        if (elapsed <= 0) continue;
        const phase = elapsed / 3 - Math.floor(elapsed / 3), angle = i * 2.399 + phase * 3;
        const r = scope * (1 - phase);
        dot(centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r * .66, "#c7decf", Math.sin(phase * Math.PI) * .35, .8);
      }

      content.foundation.forEach((concept, index) => {
        if (index < state.basicsLearned) return;
        const pose = foundationPose(index, state.time, view.physicalScale);
        if (pose.opacity < .015) return;
        const x = centerX + pose.x * projected, y = centerY + pose.y * projected;
        dot(x, y, "#bfd7c5", pose.opacity);
        text(label(concept.title, concept.code, "#bfd7c5", 12), x, y + 8 * pose.scale, pose.scale * view.zoom, pose.opacity);
        foundationVisible++;
      });

      state.galaxies.forEach(galaxy => {
        const pose = galaxyPose(galaxy, state.time, view.physicalScale);
        if (pose.opacity < .01) return;
        const subject = content.galaxies[galaxy.subject], color = colors[galaxy.slot];
        const x = centerX + pose.x * projected, y = centerY + pose.y * projected;
        const size = Math.min(148, Math.max(82, width * .2)) * galaxy.visualScale * view.zoom * pose.scale;
        ctx.globalAlpha = pose.opacity * .14; ctx.strokeStyle = color; ctx.lineWidth = .5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + width * .04, centerY, centerX, centerY); ctx.stroke();
        ctx.save(); ctx.globalAlpha = pose.opacity; ctx.translate(x, y); ctx.rotate(pose.rotation * Math.PI / 180);
        ctx.drawImage(spirals[galaxy.slot], -size / 2, -size * .344, size, size * .688); ctx.restore();
        const labelScale = Math.min(1, galaxy.visualScale * view.zoom) * pose.scale;
        text(label(subject.title, compact ? "" : subject.detail, color, compact ? 9 : 10), x, y + size * .23, labelScale, pose.opacity * pose.labelOpacity);
        subject.topics.forEach((name, index) => {
          const topic = topicPose(galaxy, index, state.time, view.physicalScale, state.studyClock, view.learningRate);
          const opacity = topic.opacity * pose.opacity;
          if (opacity < .015) return;
          const tx = centerX + topic.x * projected, ty = centerY + topic.y * projected;
          const scale = topic.scale * galaxy.labelScale * view.zoom;
          dot(tx, ty, color, opacity, 1);
          if (!compact || index % 2 === 0) text(label(name, "", color, compact ? 9 : 10), tx, ty + 5, scale, opacity);
          relatedVisible++;
        });
      });
      ctx.globalAlpha = 1;
      return { ambientVisible, relatedVisible, foundationVisible, growthWaves: waves.length };
    },
    dispose() { labels.clear(); canvas.width = 1; canvas.height = 1; },
  };
}
