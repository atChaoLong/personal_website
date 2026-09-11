# JCL.AI — Design direction

An independent AI engineer’s portfolio: oversized editorial typography, an abstract knowledge vortex, and concrete engineering work. Keep the existing project facts and personal identity.

## Visual system
- Near-black canvas `#080b0a`, warm-white text `#edf1e9`, mint accent `#bcf8ce`.
- Inter for headlines and body, DM Mono for navigation and technical metadata; system and Chinese fallbacks must work without Google Fonts.
- Generous spacing, square corners and fine borders. Use accent color for emphasis, rather than applying the same green treatment everywhere.
- The contact section reverses to a full mint surface to give the long page a clear ending.
- The hero centers on an abstract knowledge black hole: a dark event horizon, tilted mint and pale gold accretion disk, fine filaments, and code, equations and research fragments spiraling inward. Use varied typographic treatments with light annotation rules; keep fragments sparse enough to read as individual discoveries. Stagger the arrival cycles, accelerate and shrink fragments near the horizon, and replenish them endlessly. Fine particles connect the distant field to the center. Do not add a person or portrait. Keep the black hole and knowledge field anchored in one square stage across breakpoints, with soft edges that protect the copy and caption. The localized caption expresses lifelong learning. Use one bounded Canvas 2D layer for the knowledge field and cached sprites; retain CSS transforms for the black hole core, with no pointer loop; pause the knowledge flow with its dedicated control, during the opening, offscreen and in background tabs. Reduced motion shows a static composition.
- Identity: a mint open C orbit, a warm-white J and one satellite point form the custom mark. Pair it with the compact JCL.AI wordmark. The navigation mark and browser icons share the same geometry; interaction is a brief orbit tilt on hover or keyboard focus, with no idle animation. Reduced motion keeps the mark still.

## Reading order
1. Personal positioning and an endless flow of knowledge into an abstract black hole.
2. A featured PE Workbench case study with four selectable architecture layers, followed by four selected projects.
3. Two co-authored financial AI papers with publication links and original architecture figures.
4. Engineer profile and systems thinking.
5. Technical stack and experience.
6. Contact and an interactive pixel signature with spring-based displacement.

## Interaction
- Hero: the first nine seconds show only four basic concepts (variables, loops, functions and arrays). Each arrival grows the black hole; galaxies and advanced labels stay hidden until the foundation is complete. After the foundation, bridge concepts enter individually from the perimeter; never reveal a batch of labels already mid-flight. One or two discipline galaxies emerge over 3.2 seconds around 10–15 seconds, followed by their individually staggered topics. The rich late composition still emerges around 35–40 seconds. Each galaxy has four related concepts that orbit it before streaming quickly toward the core. Knowledge accumulation widens both projected discovery distance and physical world extent, smoothly introduces more subjects, and accelerates small concepts using a shared integrated study clock. The first galaxies take roughly 9–11 seconds to learn; mature galaxies retain slower 25–28 second orbits. Their completed absorption triggers a larger increase in knowledge mass, a widening camera view and further discoveries. Each growth event sends out one exploration shockwave from the horizon: a gentle 1.6-second scan for a foundational concept, or a stronger 2.6-second scan for a whole discipline. The front briefly lights nearby stars and labels; reuse one cached sprite on the canvas, freeze it on pause and omit it for reduced motion. The catalog contains four introductory concepts, eight bridge concepts, 48 ambient technical subjects and 12 disciplines/theories; at most six galaxies and 24 related concepts are active together. Continue learning and replenishing subjects without resetting accumulated knowledge. Keep newly discovered galaxies readable as world space expands. A single Canvas 2D renderer caches text and galaxy sprites at up to 30 fps, with at most 24 ambient labels on desktop or 16 on mobile. Pixel ratio is capped at 1.5/1.25 respectively. Avoid per-frame inherited CSS variables, masked DOM particles and SVG path updates. The renderer stops during pause, opening, offscreen and background states. Reduced motion uses a static learning snapshot. Replay restarts the model. See [knowledge universe notes](docs/knowledge-universe.md) for mechanics, tests and terminology sources.
- Animation stops offscreen and in background tabs. Respect live reduced-motion preferences.
- Project details use native disclosure elements with keyboard support.
- All links and controls have visible keyboard focus. Mobile navigation remains accessible.
- The navigation stays fixed above the page and reserves its original height in the hero. Once that original space leaves the viewport, it becomes a compact dark glass bar and replaces JCL.AI with a custom lowercase atchaolong wordmark: mint at, warm-white circular letterforms and an extended g signature tail. The change reverses at the top, reserves the same brand width and respects reduced motion. Anchor links account for the fixed header; the opening still covers and disables navigation.
- Signature: fine square pixels sampled from the actual letterforms, with room around the text for displacement. Pointer speed affects the disturbance; leaving releases it into a damped spring return.
- Click, touch, Enter or Space launch a bounded expanding pulse. Preserve a faint home-position impression so the word remains legible during interaction.
- The signature stops rendering when settled, offscreen or hidden. Reduced motion renders static text, including after resize and font loading. Keep a text fallback until the canvas is ready.

## Responsive
- Desktop: two-column hero and projects.
- Mobile: stacked hero with a centered knowledge vortex, single-column projects, two-column skill grid.
- Avoid horizontal overflow, including at 320px viewport width.

## Content integrity
- Do not invent project metrics, clients, live status, external demos, or architecture details.
- Architecture previews are schematics, not product screenshots.
- KaraVideo follows the inspected implementation: localized Next.js creation forms, server-side session/parameter/credit validation, service-specific task factories and external model adapters. Supabase PostgreSQL separates task definitions and statuses; scheduled polling and provider callbacks update statuses, then Supabase Realtime updates the UI. Separate scheduled jobs handle R2 transfer, FFmpeg thumbnails and watermark processing. Stripe webhooks synchronize subscriptions; failure paths support credit refunds. Depict provider selection, not simultaneous execution of every model, and avoid presenting generated tagging as implemented when the Explore API returns empty tags.
- FinSAgent's project diagram follows the implementation: LangGraph routing, selected specialist subgraphs running concurrently, shared hybrid retrieval/tools, then synthesis. The two-phase chat path runs a preliminary draft concurrently with the multi-agent analysis. Do not restore the old planning/retrieval/validation-loop schematic from the outdated README. PageIndex and chunk-risk calibration are configurable, not guaranteed active.
- Real-time ASR's diagram follows the modular Qwen3-ASR path: per-UID Agora PCM, Silero VAD, Qwen3-ASR over an OpenAI-compatible HTTP interface, independent translation and contextual-summary branches, then Agora message delivery and SQLite persistence. Translation is opt-in. HTTP/SSE also exposes summaries and asynchronous meeting finalization; the old FunASR WebSocket entry remains as a separate legacy path. Avoid claiming all results use WebSocket or that summaries must wait for translation.
- PE Workbench is based on Pi Agent Harness and Pi Web. Describe the inspected PE extensions: project-bound Python ingestion, SQLite evidence, Pi SDK sessions, source inspection, research notes, versioned memos and schema-driven UI. Do not imply that it uses the papers' complete architectures or that the underlying harness was independently built by the portfolio owner.
- Research attribution is co-authorship as Chaolong Jiang. FinSAgent is accepted at IJCAI 2026's FinLLM Workshop and received that workshop's Best Paper award. VeritasFi is accepted in WWW 2026's Industry Track; its Best Paper award belongs to the AAAI 2026 Workshop on Agentic AI in Financial Services. Keep the venues distinct.
- Public paper sources: arxiv.org/abs/2607.18102, arxiv.org/abs/2510.10828, dl.acm.org/doi/10.1145/3774904.3792795, finllm.github.io/workshop/, www2026.thewebconf.org/accepted/industry.html. VeritasFi's workshop award is also recorded by co-author Lei Ding at lei-ding07.github.io/.
- Paper figures retain their original colors on a light surface. Use the native dialog for enlargement, with Escape, focus return and a link to the original image. Workbench layers use explicit buttons and update only on interaction; private data, configuration and source files must never be copied into the portfolio.
- Preserve parallel relationships (K12 Web + Mini Program + Admin) instead of showing them as sequential pipelines.
## Languages and opening

- `lib/messages.ts` is the typed Chinese/English dictionary. Keep both locales complete; product and library names may retain their original names.
- The navigation has a Chinese/English switch. Selection updates the page, title, description and document language, and is remembered locally. `?lang=zh` / `?lang=en` links override the saved preference.
- The server reads the language cookie for initial rendering to avoid flashing the default language on repeat visits. The Next.js runtime is required; this is not a static export.
- English is the default for new visitors; explicit language links and saved preferences take precedence.
- The opening lasts 8 seconds: the camera follows an uneven field of clues, a traced connection introduces each next capability, and a pullback exposes the whole pattern before the AI Agent is revealed. The original brand reveal follows. It appears once per tab session and can be skipped, escaped or replayed. Anchor links bypass the automatic opening. Reduced-motion users go straight to the page.
- Diagrams show sequential signal travel, simultaneous parallel capabilities, and round-trip communication around the AI core. Each diagram can be paused; offscreen and background diagrams stop automatically.
- Footer signature: compact layout, oversized type and a separate 72px canvas bleed retain the existing spring interaction without allocating large vertical gaps.
