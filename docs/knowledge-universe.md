# Knowledge universe

The hero visualizes learning as exploration: small ideas establish a foundation, discipline galaxies are discovered, their related concepts are learned, then the whole discipline is absorbed. Each completed galaxy grows the core and widens the view to reveal further subjects. Galaxies represent knowledge still being studied. These are learning subjects, not claims that every technology is used in the portfolio's projects. The grouping is a visual metaphor, not a taxonomy or a physical simulation.

`lib/knowledge-content.ts` holds four introductory concepts (variables, loops, functions and arrays), eight bridge concepts (data types through SQL), 48 advanced ambient subjects, 12 disciplines/theories and four related concepts per discipline, with localized descriptions. Canonical technical names remain recognizable in both languages. A mixture of frontier topics and their foundations keeps the theme intelligible without claiming a performance ranking.

`lib/knowledge-universe.ts` is the deterministic learning model. The first nine seconds show only the four basic concepts, with no galaxies or advanced labels. Concepts reach the core at 3, 5, 7 and 9 seconds; each arrival adds knowledge and eases core growth over 0.85 seconds. The completed foundation unlocks the first galaxies at 10.2 and 14.4 seconds. Ambient streams start individually at the perimeter, separated by 0.9 units of the integrated study clock, with a gentle fade at the beginning of each flight. The first subjects are bridge concepts; the 9–15 second handover has at most five ambient streams. Galaxies emerge over 3.2 seconds, and each related concept has its own staggered reveal. These first disciplines take roughly 9–11 seconds to learn. Absorption causes further discoveries; the richer late-stage composition is reached around 35–40 seconds rather than requiring a two-minute visit.

Accumulated knowledge smoothly increases learning rate from 0.24x toward 1.8x and widens the projected discovery radius from 0.16 toward 0.47 stage widths. New galaxies spawn at this increasing projected distance divided by camera zoom, so both visible reach and physical world extent increase. Distant stars fade according to distance from the expanding visible field; no full-scene animated CSS mask is needed. Mature galaxies take around 25–28 seconds to learn, preserving their slower motion among the faster concepts. Absorption removes the galaxy, increases knowledge mass, eases the core/camera over 3.4 seconds and schedules new discoveries.

The integrated study clock preserves concept phases as learning speed changes. Ambient streams use that same clock for individual starts and continuous flight phases. A bounded pool cycles through the full catalog; it does not animate dozens of hidden labels. Discovery chooses free space, the active/pending population stays at or below six, and projected core size remains bounded as exploration continues.

Each actual core-growth event emits one outward exploration scan: a 1.6-second wave for each foundational concept and a larger 2.6-second wave for an absorbed discipline. The wave starts at the event horizon, expands with a bright leading edge and soft fading trail, and briefly illuminates nearby stars and knowledge labels as it passes. Waves are derived from absorption timestamps, so painting frames or discovering a new galaxy cannot retrigger them. One cached 512px radial sprite is reused on the existing canvas, with no added DOM or CSS animation. Pause freezes the wave; reduced motion omits it entirely.

`lib/knowledge-renderer.ts` draws stars, concepts, paths and galaxy sprites on one Canvas 2D surface. Labels and spiral gradients are cached, with a 128-entry text cache limit and cache invalidation when fonts or locale change. Desktop renders at most 24 ambient labels; mobile renders at most 16 and omits galaxy subtitles and alternate concept labels. The canvas pixel ratio is capped at 1.5 on desktop and 1.25 on mobile. The full 48-subject advanced catalog remains in rotation.

`components/useKnowledgeUniverse.ts` caps drawing at 30 fps without React state updates on frames. The black hole retains its CSS gradients, two disk animations and a compositor transform. Only changed core styles are written; no inherited per-frame CSS variables, animated SVG paths or individual DOM particles remain. The hero has 12 descendant elements and two CSS animations, down from 708 and 94. The clock and drawing stop during pause, opening, offscreen and background states. Locale changes preserve learning progress. Reduced motion paints a static snapshot at 48 seconds without advancing time; replay restarts the model. There is no additional graphics dependency.

Run the model's causal progression, speed, cadence and long-run boundedness tests with `node --experimental-strip-types --test tests/knowledge-universe.test.mjs` on a Node version supporting TypeScript stripping. Browser checks cover the actual pause/replay controls, locale continuity, resize, reduced motion and runtime errors.

## Local performance check

Measured on 2026-09-11 in headless Edge, 1440×960, DPR 1, against the local Next.js development server. Both versions advanced naturally to 42 seconds, then used the same six-second CDP Performance sample. No accelerated test clock was used. Results are comparative local measurements, not a guarantee for every device:

| Six-second sample | Before | After |
| --- | ---: | ---: |
| Main-thread task duration | 4.823 s | 1.010 s |
| Style recalculation duration | 2.409 s | 0.187 s |
| Layout count | 367 | 0 |
| Observed frame gaps above 33.5 ms | 35 | 0 |

The task-duration reduction is about 79%, and style-recalculation time fell about 92%. The canvas still draws at a maximum of 30 fps; headless browser animation callbacks are not a display FPS measurement.

## Terminology references

Names and brief descriptions checked against primary documentation on 2026-09-11:

- [Anthropic context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents): context management, memory and multi-agent patterns; includes MCP.
- [A2A protocol](https://a2a-protocol.org/latest/): agent interoperability.
- [Agent Skills](https://github.com/agentskills/agentskills/blob/main/docs/home.mdx): progressive disclosure.
- [Advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use): tool search.
- [Deep Agents](https://docs.langchain.com/oss/python/deepagents/overview): planning, filesystem context and subagents.
- [GraphRAG indexing](https://microsoft.github.io/graphrag/index/overview/): graph-based knowledge extraction.
- [DeepSeek-V3 technical report](https://arxiv.org/abs/2412.19437): MoE and MLA.
- [Mamba-2 / state space duality](https://arxiv.org/abs/2405.21060): state space model architecture.
- [Vision-language-action flow model](https://arxiv.org/abs/2410.24164): VLA and flow matching.
- [NVIDIA Dynamo](https://docs.nvidia.com/dynamo/latest/): distributed inference and cache-aware serving.
- [SGLang disaggregation](https://docs.sglang.ai/backend/pd_disaggregation.html): prefill/decode separation.
- [vLLM speculative decoding](https://docs.vllm.ai/en/v0.22.0/features/speculative_decoding/): draft and verification methods.
