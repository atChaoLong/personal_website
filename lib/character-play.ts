export type BodyPart = "idle" | "body" | "eyes" | "nose" | "mouth" | "hands" | "feet";
export type Trick = "wink" | "boop" | "highfive" | "dance" | "whistle" | "hop" | "spin" | "proud" | "cuddle";
export type Action = { kind: Trick; side: number; start: number };
export const durations: Record<Trick, number> = { wink: .85, boop: .8, highfive: 1.1, dance: 1.65, whistle: 1.3, hop: .95, spin: 1.25, proud: 1.4, cuddle: 2.4 };

/** Coordinates are local to the character, not the surrounding canvas button. */
export function hitPart(x: number, y: number, mode: "orbit" | "sphere"): BodyPart {
  const ax = Math.abs(x);
  if (ax > 1.22 && ax < 1.85 && y > -.6 && y < .8) return "hands";
  if (ax > .18 && ax < .95 && y > 1.06 && y < 1.65) return "feet";
  if (ax < .17 && y > .035 && y < .26) return "nose";
  if (ax < .36 && y >= .27 && y < .72) return "mouth";
  if (ax < .6 && y > -.48 && y < .035) return "eyes";
  const ry = mode === "orbit" ? .98 : 1.22;
  return x * x / 1.7 + y * y / (ry * ry) < 1 ? "body" : "idle";
}

export function tapTrick(part: BodyPart, bodyTap: number, double = false): Trick | null {
  if (part === "idle") return null;
  if (part === "body") return double ? "spin" : (["hop", "proud", "spin"] as const)[bodyTap % 3];
  return ({ eyes: "wink", nose: "boop", mouth: "whistle", hands: "highfive", feet: "dance" } as const)[part];
}

export function actionFrame(action: Action | null, time: number) {
  if (!action) return { kind: null, progress: 0, envelope: 0, side: 1 };
  const progress = Math.max(0, (time - action.start) / durations[action.kind]);
  if (progress >= 1) return { kind: null, progress: 1, envelope: 0, side: action.side };
  return { kind: action.kind, progress, envelope: Math.sin(Math.PI * progress), side: action.side };
}
