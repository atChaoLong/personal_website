import test from "node:test";
import assert from "node:assert/strict";
import { createLearningUniverse, advanceLearningUniverse, universeView, explorationWaves, foundationPose, galaxyPose, topicPose, ambientPose, FOUNDATION_LESSONS, TOPIC_PERIOD, AMBIENT_PERIOD, MAX_GALAXIES, MAX_AMBIENT_STREAMS } from "../lib/knowledge-universe.ts";
import { enKnowledge, zhKnowledge } from "../lib/knowledge-content.ts";

const advance = (state, seconds) => advanceLearningUniverse(state, seconds, 12);
const concept = (state, galaxy, index = 0) => {
  const view = universeView(state);
  return topicPose(galaxy, index, state.time, view.physicalScale, state.studyClock, view.learningRate);
};

test("four basic ideas visibly grow the core before any galaxy or advanced label appears", () => {
  const state = createLearningUniverse();
  const initial = universeView(state);
  assert.ok(initial.explorationRadius < .2);
  assert.ok(AMBIENT_PERIOD / initial.learningRate >= 20);
  assert.ok(TOPIC_PERIOD / initial.learningRate >= 15);
  assert.equal(ambientPose(state, 0), null);
  assert.deepEqual(enKnowledge.foundation.map(concept => concept.title), ["Variables", "Loops", "Functions", "Arrays"]);
  assert.deepEqual(zhKnowledge.foundation.map(concept => concept.title), ["变量", "循环", "函数", "数组"]);
  assert.equal(enKnowledge.foundation.length, FOUNDATION_LESSONS.length);
  advance(state, 2.9);
  assert.equal(universeView(state).physicalScale, initial.physicalScale, "growth waits for the visible first arrival");
  advance(state, 1.1);
  assert.equal(state.basicsLearned, 1);
  assert.equal(foundationPose(0, state.time, universeView(state).physicalScale).opacity, 0);
  assert.ok(universeView(state).physicalScale > initial.physicalScale * 1.1);
  advance(state, 4);
  const foundation = universeView(state);
  assert.equal(state.basicsLearned, 3);
  assert.equal(state.discovered, 0);
  assert.equal(ambientPose(state, 0), null);
  assert.ok(foundation.physicalScale * foundation.zoom > initial.physicalScale * 1.3);
  advance(state, 2);
  assert.equal(state.basicsLearned, 4);
  assert.equal(state.discovered, 0, "galaxies follow the completed foundation");
});

test("sparse middle-stage discoveries reach the rich late composition within forty seconds", () => {
  const state = createLearningUniverse();
  const initial = universeView(state);
  advance(state, 12);
  assert.equal(state.galaxies.length, 1);
  const firstRadius = state.galaxies[0].radius;
  advance(state, 4);
  assert.equal(state.galaxies.length, 2);
  assert.equal(state.learned, 0);
  advance(state, 24);
  const later = universeView(state);
  assert.ok(state.learned >= 4);
  assert.equal(state.galaxies.length, 6);
  assert.ok(later.explorationRadius > initial.explorationRadius * 2.4, "projected discovery distance must expand too");
  assert.ok(later.learningRate > initial.learningRate * 5);
  assert.ok(ambientPose(state, MAX_AMBIENT_STREAMS - 1));
  assert.ok(state.galaxies.some(g => g.radius * later.zoom > firstRadius * 1.4));
  assert.ok(state.galaxies.every(g => g.duration > TOPIC_PERIOD / later.learningRate * 3));
});

test("the foundation hands over to individual perimeter arrivals, not a batch reveal", () => {
  const state = createLearningUniverse();
  advance(state, 9);
  assert.equal(ambientPose(state, 0), null);
  const catalog = [...enKnowledge.bridge, ...enKnowledge.fragments];
  const indices = Array.from({ length: MAX_AMBIENT_STREAMS }, (_, i) => i);
  let previous = 0;
  for (let i = 0; i < 60; i++) {
    advance(state, .1);
    const streams = indices.map(index => ambientPose(state, index)).filter(Boolean);
    assert.ok(streams.length - previous <= 1, "never introduce multiple streams in the same tenth of a second");
    assert.ok(streams.length <= 5, "the 9–15 second handover stays sparse");
    for (const stream of streams) assert.ok(stream.catalogIndex < enKnowledge.bridge.length, "bridge concepts precede frontier technology");
    previous = streams.length;
  }
  assert.ok(previous >= 3);
  const seen = new Set();
  for (let i = 0; i < 300; i++) {
    advance(state, .5);
    indices.forEach(index => { const pose = ambientPose(state, index); if (pose) seen.add(catalog[pose.catalogIndex % catalog.length].title); });
  }
  assert.equal(seen.size, catalog.length, "bounded concurrency still cycles through the entire catalog");
});

test("galaxy concepts emerge sequentially after their host starts to appear", () => {
  const state = createLearningUniverse();
  advance(state, 11);
  const galaxy = state.galaxies[0];
  assert.ok(galaxyPose(galaxy, state.time, universeView(state).physicalScale).opacity < .2);
  for (let i = 0; i < 4; i++) assert.equal(concept(state, galaxy, i).opacity, 0);
  advance(state, 1);
  assert.ok(concept(state, galaxy, 0).opacity > 0);
  assert.equal(concept(state, galaxy, 1).opacity, 0);
  assert.equal(concept(state, galaxy, 3).opacity, 0);
});

test("absorbing a whole discipline causes a major growth and discovery event", () => {
  const state = createLearningUniverse();
  advance(state, 11);
  const first = state.galaxies[0];
  const completion = first.born + first.duration;
  advance(state, completion - state.time - .05);
  assert.equal(state.learned, 0);
  const before = universeView(state);
  assert.ok(before.physicalScale > .4 && before.physicalScale < .5, "small concepts have already grown the core");
  advance(state, .05);
  assert.equal(state.learned, 1);
  assert.ok(!state.galaxies.some(g => g.id === first.id));
  advance(state, 7);
  const after = universeView(state);
  assert.ok(after.physicalScale * after.zoom > before.physicalScale * before.zoom * 1.4);
  assert.ok(after.zoom < before.zoom);
  assert.ok(after.explorationRadius > before.explorationRadius);
  assert.ok(state.discovered >= 4);
});

test("related concepts orbit their subject before flowing in faster than a galaxy", () => {
  const state = createLearningUniverse();
  advance(state, 10.3);
  const galaxy = state.galaxies[0];
  const toPhase = phase => { while (state.studyClock - galaxy.bornStudyClock < TOPIC_PERIOD * phase) advance(state, .02); return concept(state, galaxy); };
  const early = toPhase(.18);
  const host = galaxyPose(galaxy, state.time, universeView(state).physicalScale);
  assert.ok(Math.hypot(early.x - host.x, early.y - host.y) < .09);
  const late = toPhase(.9);
  assert.ok(Math.hypot(late.x, late.y) < Math.hypot(early.x, early.y) * .6);
  assert.ok(late.scale < early.scale);
  assert.equal(toPhase(1.1).cycle, 1);
  assert.ok((state.time - galaxy.born) / galaxy.duration < .85);
});

test("changing learning speed preserves the continuous study clock", () => {
  const state = createLearningUniverse();
  advance(state, 11);
  const first = state.galaxies[0];
  advance(state, first.born + first.duration - state.time - .01);
  const other = state.galaxies.find(g => g.id !== first.id);
  const previous = concept(state, other);
  const clock = state.studyClock;
  advance(state, .02);
  const next = concept(state, other);
  assert.ok(state.studyClock > clock && state.studyClock - clock < .03);
  assert.ok(Math.hypot(next.x - previous.x, next.y - previous.y) < .003);
});

test("progression and integrated speed are independent of render cadence", () => {
  const whole = createLearningUniverse(), frames = createLearningUniverse();
  advance(whole, 193.5);
  for (let i = 0; i < 1935; i++) advance(frames, .1);
  assert.equal(frames.learned, whole.learned);
  assert.equal(frames.discovered, whole.discovered);
  assert.deepEqual(frames.galaxies.map(g => g.id), whole.galaxies.map(g => g.id));
  assert.ok(Math.abs(universeView(frames).physicalScale - universeView(whole).physicalScale) < 1e-8);
  assert.ok(Math.abs(frames.studyClock - whole.studyClock) < .001);
});

test("continued exploration is bounded; pausing freezes space, speed and study phase", () => {
  const state = createLearningUniverse(), subjects = new Set();
  let lastClock = 0;
  for (let i = 0; i < 1200; i++) {
    advance(state, .5);
    assert.ok(state.galaxies.length + state.pending.length <= MAX_GALAXIES);
    assert.ok(explorationWaves(state).length <= MAX_GALAXIES);
    assert.equal(new Set(state.galaxies.map(g => g.slot)).size, state.galaxies.length);
    state.galaxies.forEach(g => subjects.add(g.subject));
    const view = universeView(state);
    assert.ok(Number.isFinite(view.physicalScale) && view.zoom > 0);
    assert.ok(view.physicalScale * view.zoom <= 1.080001);
    assert.ok(state.studyClock >= lastClock && view.learningRate < 1.81);
    lastClock = state.studyClock;
  }
  assert.equal(subjects.size, 12);
  assert.ok(state.learned > 50);
  const snapshot = structuredClone(state);
  advance(state, 0);
  assert.deepEqual(state, snapshot);
});

test("each foundational growth emits one outward scan that fades and expires", () => {
  const state = createLearningUniverse();
  assert.deepEqual(explorationWaves(state), []);
  for (const lesson of FOUNDATION_LESSONS) {
    advance(state, lesson.absorbedAt - state.time - .01);
    assert.deepEqual(explorationWaves(state), []);
    advance(state, .25);
    const [early] = explorationWaves(state);
    assert.equal(explorationWaves(state).length, 1);
    assert.equal(early.major, false);
    assert.equal(early.born, lesson.absorbedAt);
    assert.ok(early.opacity > 0);
    advance(state, .7);
    const [late] = explorationWaves(state);
    assert.ok(late.radius > early.radius);
    assert.ok(late.opacity < early.opacity);
    advance(state, .7);
    assert.deepEqual(explorationWaves(state), []);
  }
});

test("discipline growth emits a larger scan once; pause preserves its exact phase", () => {
  const state = createLearningUniverse();
  advance(state, 11);
  const completion = state.galaxies[0].born + state.galaxies[0].duration;
  advance(state, completion - state.time - .01);
  assert.deepEqual(explorationWaves(state), []);
  advance(state, .25);
  const waves = explorationWaves(state);
  assert.equal(waves.length, 1);
  assert.equal(waves[0].major, true);
  assert.equal(waves[0].born, completion);
  advance(state, 0);
  assert.deepEqual(explorationWaves(state), waves);
  advance(state, .9);
  assert.ok(explorationWaves(state)[0].radius > .25);
  advance(state, 1.5);
  assert.deepEqual(explorationWaves(state), [], "discovering new galaxies does not trigger another growth scan");
});
