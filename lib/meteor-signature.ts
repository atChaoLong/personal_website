export const METEOR_LANDING = "guestbook:meteor-landing";
export const METEOR_ACTIVITY = "guestbook:meteor-activity";
export const SIGNATURE_IMPACT = "signature:meteor-impact";
export type MeteorLanding = { x: number; y: number; strength: number; slope: number; speed: number; tailLength: number; tone?: string; brightness?: number };
export type SignatureImpact = { x: number; y: number; strength: number };

export function meteorAppearance(index: number) {
  const depth = index % 3;
  return { depth, tone: depth === 1 ? "188,248,206" : "187,221,244", brightness: depth === 2 ? .58 : depth === 1 ? 1 : .8 };
}

export function meteorTrajectory(index: number, length: number, width: number, height: number) {
  const impactX = width * (.3 + ((index * .227) % .61));
  const drift = height + 42; // The head starts 42px above the sky and ends on its lower edge.
  const travel = Math.min(width * .4, drift * .7);
  const endX = impactX - length + 8;
  // A lane keeps its clock when its next message has a different tail length.
  const duration = [24, 19, 29, 22, 26, 20, 31, 23][index % 8] + (width < 600 ? 2 : 0);
  return { startX: endX - travel, endX, drift, impactX, duration, slope: travel / drift, angle: Math.atan2(drift, travel) * 180 / Math.PI };
}

type Bounds = { left: number; top: number; width: number; height: number; bottom: number };
export function signatureLanding(source: MeteorLanding, target: Bounds, curtainBottom: number, viewportHeight: number) {
  const y = Math.max(target.top + target.height * .46, curtainBottom + 12);
  const exposed = Math.min(target.bottom, viewportHeight) - Math.max(target.top, curtainBottom, 0);
  // The sticky signature can intersect the viewport while still behind the contact curtain.
  if (target.width <= 0 || exposed < target.height * .15 || y < 0 || y > Math.min(target.bottom - 8, viewportHeight - 8) || source.y >= y) return null;
  const fall = y - source.y;
  const x = Math.max(target.left + target.width * .06, Math.min(target.left + target.width * .94, source.x + fall * source.slope));
  const speed = Math.max(1, source.speed);
  const duration = 1000 * (Math.sqrt(speed * speed + 2 * 420 * fall) - speed) / 420;
  return { x, y, duration: Math.max(160, Math.min(1100, duration)) };
}

export function signatureFlightPoint(source: MeteorLanding, destination: { x: number; y: number; duration: number }, time: number) {
  const dx = destination.x - source.x, dy = destination.y - source.y;
  const t = Math.max(0, Math.min(1, time));
  const initial = Math.min(.95, source.speed * destination.duration / 1000 / dy);
  const progress = initial * t + (1 - initial) * t * t;
  const controlX = dy * .5 * source.slope;
  const x = 2 * (1 - progress) * progress * controlX + progress * progress * dx;
  const y = dy * progress;
  const angle = Math.atan2(dy, 2 * (1 - progress) * controlX + 2 * progress * (dx - controlX));
  return { x, y, angle };
}
