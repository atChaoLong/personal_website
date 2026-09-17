import test from "node:test";
import assert from "node:assert/strict";
import { meteorTrajectory, signatureLanding, signatureFlightPoint } from "../lib/meteor-signature.ts";

test("cycling to a longer message does not change a lane clock or head position", () => {
  for (let lane = 0; lane < 8; lane++) {
    const short = meteorTrajectory(lane, 100, 1440, 380);
    const long = meteorTrajectory(lane, 390, 1440, 380);
    assert.equal(short.duration, long.duration);
    for (const progress of [0, .25, .8, 1]) {
      const head = (path, length) => path.startX + (path.endX - path.startX) * progress + length - 8;
      assert.ok(Math.abs(head(short, 100) - head(long, 390)) < 1e-8);
    }
  }
});

test("every lane reaches the sky edge at an in-bounds horizontal landing on phone and desktop", () => {
  for (const width of [320, 390, 1440, 3840]) {
    const height = width < 600 ? 330 : 380;
    for (const length of [100, Math.min(390, width * .7)]) {
      for (let lane = 0; lane < 8; lane++) {
        const path = meteorTrajectory(lane, length, width, height);
        assert.ok(path.impactX > width * .05 && path.impactX < width * .95);
        assert.ok(Math.abs(path.endX + length - 8 - path.impactX) < 1e-8);
        assert.equal(-70 + path.drift + 28, height, "head center reaches the exact bottom edge");
        assert.ok(path.startX < path.endX && path.slope > 0 && path.slope <= .7);
      }
    }
  }
});

test("covered, offscreen and upward targets do not cause invisible impacts", () => {
  const source = { x: 200, y: 450, strength: 1, slope: .7, speed: 22, tailLength: 140 };
  const target = { left: 0, top: 760, width: 1440, height: 220, bottom: 980 };
  assert.equal(signatureLanding(source, target, 990, 1000), null, "still covered by curtain");
  assert.equal(signatureLanding(source, target, 960, 1000), null, "wait for enough visible pixels to receive the ripple");
  assert.equal(signatureLanding(source, target, 750, 700), null, "below viewport");
  assert.equal(signatureLanding({ ...source, y: 999 }, target, 750, 1000), null, "source cannot fall upward");
  const revealed = signatureLanding(source, target, 850, 1000);
  assert.ok(revealed && revealed.y > 850 && revealed.y < target.bottom);
});

test("fall continues toward the exposed letter band and clamps to the word at viewport edges", () => {
  const target = { left: 0, top: 760, width: 390, height: 70, bottom: 830 };
  for (const x of [-60, 20, 350, 450]) {
    const landing = signatureLanding({ x, y: 420, strength: 1, slope: .4, speed: 20, tailLength: 100 }, target, 746, 844);
    assert.ok(landing && landing.x >= 390 * .06 && landing.x <= 390 * .94);
    assert.ok(landing.y > target.top && landing.y < target.bottom);
    assert.ok(landing.duration >= 160 && landing.duration <= 1100);
  }
});

test("the final fall inherits sky velocity and direction without jumping at the boundary", () => {
  for (const width of [320, 1440]) {
    const path = meteorTrajectory(2, 140, width, 380);
    const source = { x: path.impactX, y: 500, slope: path.slope, speed: path.drift / path.duration, strength: 1, tailLength: 140 };
    const landing = signatureLanding(source, { left: 0, top: 500, bottom: 500 + width * .165, width, height: width * .165 }, 500, 1000);
    assert.ok(landing);
    const start = signatureFlightPoint(source, landing, 0);
    assert.equal(start.x, 0); assert.equal(start.y, 0);
    assert.ok(Math.abs(start.angle - Math.atan2(1, path.slope)) < 1e-9);
    const dt = 1e-5;
    const early = signatureFlightPoint(source, landing, dt / (landing.duration / 1000));
    assert.ok(Math.abs(early.y / dt - source.speed) < .01, "vertical speed is continuous");
    assert.ok(Math.abs(early.x / dt - source.speed * source.slope) < .01, "horizontal speed is continuous");
    const end = signatureFlightPoint(source, landing, 1);
    assert.ok(Math.abs(source.x + end.x - landing.x) < 1e-8);
    assert.ok(Math.abs(source.y + end.y - landing.y) < 1e-8);
  }
});
