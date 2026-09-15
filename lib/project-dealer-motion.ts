export type DealerLayout = {
  width: number;
  height: number;
  card: { left: number; top: number; width: number; height: number };
  narrow: boolean;
};
export type CardPose = { x: number; y: number; depth: number; scale: number; angle: number; tilt: number; yaw: number; face: number; back: number; opacity: number; z: number };
export type DealerHand = {
  x: number; y: number; angle: number; scale: number; grip: number; presence: number; mirror: 1 | -1;
  gesture: "push" | "lift"; pitch: number; yaw: number; turn: number; release: number; energy: number;
};

export const CARD_PERSPECTIVE = 1600;
export const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const ramp = (value: number, from: number, to: number) => ease((value - from) / (to - from));
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;
const radians = (degrees: number) => degrees * Math.PI / 180;

export function getCardPose(index: number, position: number, layout: DealerLayout): CardPose {
  const { card, height, narrow } = layout;
  const incoming = position - index + 1;
  const outgoing = position - index;
  const sourceX = (narrow ? card.left + card.width * .2 : 116) - card.left - card.width / 2;
  const sourceY = height * .7 - card.top - card.height / 2;

  if (index > 0 && incoming < .94) {
    // Touch the back, lift its near edge, then turn the wrist through an actual flip.
    const lift = ramp(incoming, .24, .52);
    const turn = ramp(incoming, .43, .83);
    const settle = ramp(incoming, .78, .94);
    const waiting = Math.max(0, index - position - 1);
    const tilt = mix(154, 103, lift) - 112 * turn + 9 * settle;
    const yaw = -16 * (1 - turn) + 8 * Math.sin(turn * Math.PI);
    const x = mix(sourceX, -card.width * .09, lift) * (1 - turn) + waiting * 4 * (1 - turn);
    const y = mix(sourceY, card.height * .16, lift) * (1 - turn) - 18 * Math.sin(turn * Math.PI) + waiting * 5 * (1 - turn);
    const depth = mix(-80, 100, lift) * (1 - turn);
    const angle = mix(-17, -7, lift) * (1 - turn) + 5 * Math.sin(turn * Math.PI);
    const sy = Math.sin(radians(yaw)), cy = Math.cos(radians(yaw));
    const st = Math.sin(radians(tilt)), ct = Math.cos(radians(tilt));
    const sa = Math.sin(radians(angle)), ca = Math.cos(radians(angle));
    // Dot the rotated surface normal with the vector toward the perspective camera.
    const facing = ct * cy * (CARD_PERSPECTIVE - depth) - (sy * ca + st * cy * sa) * x - (sy * sa - st * cy * ca) * y;
    return {
      x, y, depth,
      scale: mix(narrow ? .32 : .23, .48, lift) + .52 * turn,
      angle, tilt, yaw,
      // Switch surfaces edge-on, avoiding flattened backfaces in animated descendants.
      face: facing >= 0 ? 1 : 0,
      back: facing < 0 ? 1 : 0,
      opacity: narrow ? ramp(incoming, .06, .16) : 1,
      z: incoming > .06 ? 20 + index : 5 - index,
    };
  }

  // A planted palm sends the outgoing project into the scene's vanishing point.
  const push = ramp(outgoing, .15, .67);
  return {
    x: card.width * .045 * push,
    y: -card.height * .19 * push,
    depth: -1900 * push,
    scale: mix(1, .62, push),
    angle: -4 * Math.sin(push * Math.PI),
    tilt: -25 * Math.sin(push * Math.PI * .75),
    yaw: 9 * Math.sin(push * Math.PI),
    face: 1,
    back: 0,
    opacity: 1 - ramp(outgoing, .53, .75),
    z: 12 + index,
  };
}

export function cardTransform(pose: CardPose) {
  return `perspective(${CARD_PERSPECTIVE}px) translate3d(${pose.x}px,${pose.y}px,${pose.depth}px) rotateZ(${pose.angle}deg) rotateX(${pose.tilt}deg) rotateY(${pose.yaw}deg) scale(${pose.scale})`;
}

/** Same right-to-left transform order and center-origin perspective as the DOM card. */
export function cardContact(pose: CardPose, layout: DealerLayout, u: number, v: number) {
  const { card } = layout;
  const yaw = radians(pose.yaw), tilt = radians(pose.tilt), angle = radians(pose.angle);
  const localX = card.width * u * pose.scale, localY = card.height * v * pose.scale;
  const x = localX * Math.cos(yaw), z = -localX * Math.sin(yaw);
  const y = localY * Math.cos(tilt) - z * Math.sin(tilt);
  const depth = localY * Math.sin(tilt) + z * Math.cos(tilt) + pose.depth;
  const perspective = CARD_PERSPECTIVE / (CARD_PERSPECTIVE - depth);
  return {
    x: card.left + card.width / 2 + (pose.x + x * Math.cos(angle) - y * Math.sin(angle)) * perspective,
    y: card.top + card.height / 2 + (pose.y + x * Math.sin(angle) + y * Math.cos(angle)) * perspective,
    scale: pose.scale * perspective,
  };
}

export function getDealerHands(position: number, count: number, layout: DealerLayout): DealerHand[] {
  if (position <= 0 || position >= count - 1) return [];
  const index = Math.floor(position), phase = position - index;
  const old = getCardPose(index, position, layout);
  const next = getCardPose(index + 1, position, layout);
  const push = ramp(phase, .15, .67);
  const lift = ramp(phase, .24, .52);
  const turn = ramp(phase, .43, .83);
  const release = ramp(phase, .8, .96);
  const palm = cardContact(old, layout, .28, .08);
  const fingertips = cardContact(next, layout, -.32, -.42);
  const reach = 1 - ramp(phase, .025, .15);
  const approach = 1 - ramp(phase, .08, .24);
  const mobile = layout.narrow ? .63 : 1;
  return [
    {
      x: palm.x + reach * 60 * mobile,
      y: palm.y + reach * 36 * mobile,
      angle: mix(-65, -90, push),
      scale: mobile * 1.18 * mix(1, .5, push),
      grip: ramp(phase, .06, .16),
      presence: ramp(phase, .015, .095) * (1 - ramp(phase, .53, .7)),
      mirror: -1,
      gesture: "push",
      pitch: mix(-8, -48, push),
      yaw: mix(-18, 12, push),
      turn: push,
      release: 0,
      energy: ramp(phase, .08, .16) * (1 - ramp(phase, .4, .6)),
    },
    {
      x: fingertips.x - approach * 36 * mobile + release * (layout.narrow ? 24 : -38) * mobile,
      y: fingertips.y + approach * 52 * mobile + release * 64 * mobile,
      angle: next.angle + mix(-30, 22, lift) + (layout.narrow ? -8 : 42) * turn - 20 * release,
      scale: mobile * mix(.9, 1.22, lift) * (1 - release * .12),
      grip: ramp(phase, .12, .27) * (1 - release),
      presence: ramp(phase, .075, .17) * (1 - ramp(phase, .89, .99)),
      mirror: 1,
      gesture: "lift",
      pitch: mix(24, -24, turn),
      yaw: mix(-35, 48, turn),
      turn,
      release,
      energy: ramp(phase, .16, .27) * (1 - release),
    },
  ];
}
