export const MAX_GALAXIES = 6;
export const TOPIC_PERIOD = 4.5;
export const AMBIENT_PERIOD = 6;
export const INITIAL_LEARNING_RATE = .24;
export const MAX_AMBIENT_STREAMS = 24;
export const AMBIENT_STAGGER = .9;
export const FOUNDATION_LESSONS = [
  { born: 0, absorbedAt: 3, angle: -145 },
  { born: 0, absorbedAt: 5, angle: -35 },
  { born: .7, absorbedAt: 7, angle: 145 },
  { born: 1.4, absorbedAt: 9, angle: 35 },
];

export type LearningGalaxy = {
  id: number;
  slot: number;
  subject: number;
  born: number;
  duration: number;
  angle: number;
  radius: number;
  bornStudyClock: number;
  visualScale: number;
  labelScale: number;
};

export type LearningUniverse = {
  time: number;
  learned: number;
  discovered: number;
  galaxies: LearningGalaxy[];
  pending: number[];
  recentAbsorptions: number[];
  lastAbsorbed: number;
  studyClock: number;
  basicsLearned: number;
  foundationStudyClock: number | null;
};

export function createLearningUniverse(): LearningUniverse {
  return { time: 0, learned: 0, discovered: 0, galaxies: [], pending: [], recentAbsorptions: [], lastAbsorbed: -100, studyClock: 0, basicsLearned: 0, foundationStudyClock: null };
}

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smooth = (value: number) => { const x = clamp(value); return x * x * (3 - 2 * x); };

export function universeView(universe: LearningUniverse, at = universe.time) {
  // Small discoveries provide a foundation; complete disciplines add much more.
  const settled = universe.learned - universe.recentAbsorptions.length;
  const accumulated = settled + universe.recentAbsorptions.reduce((sum, time) => sum + smooth((at - time) / 3.4), 0);
  const foundation = FOUNDATION_LESSONS.slice(0, universe.basicsLearned).reduce((sum, lesson) => sum + .35 * smooth((at - lesson.absorbedAt) / .85), 0);
  const knowledge = foundation + accumulated * 2;
  const maturity = 1 - Math.exp(-knowledge / 4);
  const physicalScale = .30 * Math.sqrt(1 + foundation + accumulated * 3.4);
  const zoom = Math.min(Math.pow(1 + knowledge * .18, -.34), 1.08 / physicalScale);
  // Both projected and physical discovery distance grow with understanding.
  const explorationRadius = .16 + .31 * maturity;
  const learningRate = INITIAL_LEARNING_RATE + 1.56 * maturity;
  const lastBasic = FOUNDATION_LESSONS[universe.basicsLearned - 1]?.absorbedAt ?? -100;
  return { physicalScale, zoom, accumulated, foundation, maturity, explorationRadius, learningRate, basicPulse: clamp((at - lastBasic) / .85), pulse: clamp((at - universe.lastAbsorbed) / 3.4) };
}

/** One outward scan per knowledge gain, derived from events rather than frames. */
export function explorationWaves(universe: LearningUniverse) {
  const events = [
    ...FOUNDATION_LESSONS.slice(0, universe.basicsLearned).map((lesson, index) => ({ id: `basic-${index}`, born: lesson.absorbedAt, major: false })),
    ...universe.recentAbsorptions.map((born, index) => ({ id: `galaxy-${born}-${index}`, born, major: true })),
  ];
  return events.flatMap(event => {
    const duration = event.major ? 2.6 : 1.6;
    const age = universe.time - event.born;
    if (age < 0 || age >= duration) return [];
    const progress = age / duration;
    const origin = universeView(universe, event.born);
    const start = origin.physicalScale * origin.zoom * .145;
    const reach = event.major ? .34 + origin.maturity * .23 : .23 + origin.maturity * .12;
    const radius = start + (reach - start) * (1 - Math.pow(1 - progress, 2.2));
    const opacity = smooth(age / .12) * Math.pow(1 - progress, 1.25) * (event.major ? .9 : .66);
    return [{ ...event, progress, radius, opacity, band: event.major ? .025 : .018 }];
  });
}

/** A stream starts at the perimeter, one at a time; never reveal pre-running labels. */
export function ambientPose(universe: LearningUniverse, index: number) {
  if (universe.foundationStudyClock === null) return null;
  const clock = universe.studyClock - universe.foundationStudyClock - .4 - index * AMBIENT_STAGGER;
  if (clock <= 0) return null;
  const cycle = Math.floor(clock / AMBIENT_PERIOD);
  const phase = clock / AMBIENT_PERIOD - cycle;
  const approach = Math.pow(phase, 1.25);
  const angle = (index * 137.508 + 205) * Math.PI / 180 + Math.pow(phase, 1.5) * 4.45;
  const radius = (1 - approach) * (.94 + index % 3 * .05);
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * .66, scale: .95 - .9 * Math.pow(phase, 1.6), opacity: smooth(phase / .14) * (1 - smooth((phase - .79) / .21)) * .72, catalogIndex: index + cycle * MAX_AMBIENT_STREAMS };
}

/** Four finite lessons: each visible arrival grows the core before galaxies exist. */
export function foundationPose(index: number, at: number, coreScale: number) {
  const lesson = FOUNDATION_LESSONS[index];
  const age = at - lesson.born;
  const progress = clamp(age / (lesson.absorbedAt - lesson.born));
  const approach = Math.pow(progress, 1.65);
  const angle = (lesson.angle + approach * 85) * Math.PI / 180;
  const radius = (.175 + index * .012) * (1 - approach) + coreScale * .13 * approach;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * .68, scale: 1 - approach * .72, opacity: smooth(age / .55) * (1 - smooth((progress - .76) / .24)) };
}

function advanceStudyClock(universe: LearningUniverse, target: number) {
  // Integrate speed, rather than multiplying total age by a changing rate.
  // Short Simpson intervals keep phase continuous across growth events and fps.
  let cursor = universe.time;
  while (cursor < target) {
    const end = Math.min(cursor + .25, target);
    const midpoint = (cursor + end) / 2;
    universe.studyClock += (end - cursor) / 6 * (universeView(universe, cursor).learningRate + 4 * universeView(universe, midpoint).learningRate + universeView(universe, end).learningRate);
    cursor = end;
  }
}

export function galaxyPose(galaxy: LearningGalaxy, at: number, coreScale: number) {
  const age = Math.max(0, at - galaxy.born);
  const progress = clamp(age / galaxy.duration);
  const angle = galaxy.angle + Math.pow(progress, 1.5) * 1.05;
  const approach = Math.pow(progress, 1.7);
  const horizon = coreScale * .145;
  const xRadius = galaxy.radius * (1 - approach) + horizon * approach;
  const yRadius = galaxy.radius * .64 * (1 - approach) + horizon * approach;
  return {
    x: Math.cos(angle) * xRadius,
    y: Math.sin(angle) * yRadius,
    progress,
    scale: (.72 + .28 * smooth(age / 2)) * (1 - .96 * Math.pow(progress, 4)),
    opacity: smooth(age / 3.2) * (1 - smooth((progress - .93) / .07)),
    labelOpacity: 1 - smooth((progress - .66) / .22),
    rotation: progress * 28,
  };
}

function discover(universe: LearningUniverse, subjectCount: number) {
  if (universe.galaxies.length >= MAX_GALAXIES) return;
  const { zoom, physicalScale, explorationRadius, maturity } = universeView(universe);
  const discoveryRadius = explorationRadius / zoom;
  const candidates = [-140, -38, 145, 28, -86, 82, -175, 0];
  const occupied = universe.galaxies.map(galaxy => galaxyPose(galaxy, universe.time, physicalScale));
  let angle = candidates[universe.discovered % candidates.length] * Math.PI / 180;
  let best = -1;
  // Pick open space at discovery time, rather than overlapping existing subjects.
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[(i + universe.discovered) % candidates.length] * Math.PI / 180;
    const x = Math.cos(candidate) * discoveryRadius;
    const y = Math.sin(candidate) * discoveryRadius * .64;
    const distance = occupied.length ? Math.min(...occupied.map(pose => Math.hypot(pose.x - x, pose.y - y))) : 1;
    if (distance > best) { best = distance; angle = candidate; }
  }
  const id = universe.discovered++;
  const slot = Array.from({ length: MAX_GALAXIES }, (_, i) => i).find(i => !universe.galaxies.some(g => g.slot === i))!;
  // Early disciplines establish the story quickly; mature galaxies retain a slow orbit.
  const duration = 9 + (id % 3) * 1.5 + 16 * Math.pow(maturity, 3);
  universe.galaxies.push({ id, slot, subject: id % subjectCount, born: universe.time, duration, angle, radius: discoveryRadius, bornStudyClock: universe.studyClock, visualScale: (.6 + .4 * maturity) / zoom, labelScale: 1 / zoom });
}

/** Advance only active scene time. Discoveries are caused by absorption events. */
export function advanceLearningUniverse(universe: LearningUniverse, elapsed: number, subjectCount: number) {
  const target = universe.time + Math.max(0, elapsed);
  let changed = false;
  while (true) {
    const nextDiscovery = Math.min(...universe.pending);
    const nextAbsorption = Math.min(...universe.galaxies.map(g => g.born + g.duration));
    const nextBasic = FOUNDATION_LESSONS[universe.basicsLearned]?.absorbedAt ?? Infinity;
    const next = Math.min(nextDiscovery, nextAbsorption, nextBasic);
    if (next > target || !Number.isFinite(next)) break;
    advanceStudyClock(universe, next);
    universe.time = next;
    if (nextBasic <= nextDiscovery && nextBasic <= nextAbsorption) {
      universe.basicsLearned++;
      if (universe.basicsLearned === FOUNDATION_LESSONS.length) {
        universe.foundationStudyClock = universe.studyClock;
        universe.pending.push(next + 1.2, next + 5.4);
      }
    } else if (nextAbsorption <= nextDiscovery) {
      const absorbed = universe.galaxies.filter(g => g.born + g.duration <= next);
      universe.galaxies = universe.galaxies.filter(g => g.born + g.duration > next);
      universe.learned += absorbed.length;
      universe.lastAbsorbed = next;
      universe.recentAbsorptions.push(...absorbed.map(() => next));
      // Each learned discipline opens new subjects; cap simultaneous DOM work.
      const room = MAX_GALAXIES - universe.galaxies.length - universe.pending.length;
      for (let i = 0; i < Math.min(room, absorbed.length * 2); i++) universe.pending.push(next + 1.2 + i * 1.8);
    } else {
      universe.pending.splice(universe.pending.indexOf(next), 1);
      discover(universe, subjectCount);
    }
    changed = true;
  }
  advanceStudyClock(universe, target);
  universe.time = target;
  universe.recentAbsorptions = universe.recentAbsorptions.filter(time => target - time < 4);
  return changed;
}

export function topicPose(galaxy: LearningGalaxy, index: number, at: number, coreScale: number, studyClock: number, learningRate: number) {
  const period = TOPIC_PERIOD + index * .35;
  const age = Math.max(0, at - galaxy.born);
  const clock = Math.max(0, studyClock - galaxy.bornStudyClock) + index * period / 4;
  const cycle = Math.floor(clock / period);
  const phase = clock / period - cycle;
  const orbitPhase = Math.min(phase, .38);
  const releaseAt = phase <= .38 ? at : at - (phase - .38) * period / learningRate;
  const source = galaxyPose(galaxy, Math.max(galaxy.born, releaseAt), coreScale);
  const angle = index * Math.PI / 2 + orbitPhase * Math.PI * 2 + cycle * .32;
  const orbit = .095 * galaxy.visualScale * Math.max(.5, source.scale);
  const originX = source.x + Math.cos(angle) * orbit;
  const originY = source.y + Math.sin(angle) * orbit * .7;
  const travel = clamp((phase - .38) / .62);
  const eased = Math.pow(travel, 1.65);
  const bend = Math.sin(travel * Math.PI) * .045;
  const fade = smooth((age - 1.2 - index * 1.1) / 1.8) * (1 - smooth((phase - .91) / .09));
  return {
    x: originX * (1 - eased) - originY * bend,
    y: originY * (1 - eased) + originX * bend,
    scale: .86 - eased * .8,
    opacity: fade * (phase < .08 ? phase / .08 : 1),
    cycle,
    travel,
  };
}
