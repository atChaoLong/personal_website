import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';

const source = stripTypeScriptTypes(readFileSync(new URL('../lib/character-play.ts', import.meta.url), 'utf8'));
const { hitPart, tapTrick, actionFrame, durations } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('each face and limb target selects its own trick in both shapes', () => {
  for (const mode of ['orbit', 'sphere']) {
    for (const [x, y, part, trick] of [[.28, -.2, 'eyes', 'wink'], [0, .13, 'nose', 'boop'], [0, .43, 'mouth', 'whistle'], [1.46, .4, 'hands', 'highfive'], [-.49, 1.28, 'feet', 'dance']]) {
      assert.equal(hitPart(x, y, mode), part);
      assert.equal(tapTrick(part, 0), trick);
    }
  }
});
test('clicking empty canvas does not trigger a body action', () => {
  for (const point of [[0, -1.8], [2.1, 0], [-2, 1.9]]) {
    assert.equal(tapTrick(hitPart(...point, 'orbit'), 0), null);
  }
});
test('body clicks vary; double click has a dedicated spin', () => {
  assert.deepEqual([0, 1, 2, 3].map(n => tapTrick('body', n)), ['hop', 'proud', 'spin', 'hop']);
  assert.equal(tapTrick('body', 1, true), 'spin');
  assert.equal(tapTrick('nose', 1, true), 'boop');
});
test('every action settles completely instead of looping a shared reaction', () => {
  for (const kind of Object.keys(durations)) {
    const action = { kind, side: -1, start: 5 };
    assert.equal(actionFrame(action, 5 + durations[kind] / 2).kind, kind);
    assert.equal(actionFrame(action, 5 + durations[kind] + .001).kind, null);
    assert.equal(actionFrame(action, 100).envelope, 0);
    assert.equal(actionFrame(action, 5.1).side, -1);
  }
  assert.equal(actionFrame(null, 100).kind, null);
});
