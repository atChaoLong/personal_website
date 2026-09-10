# JCL.AI — Design direction

An independent AI engineer’s portfolio: oversized editorial typography, playful particle characters, and concrete engineering work. Keep the existing project facts and personal identity.

## Visual system
- Near-black canvas `#080b0a`, warm-white text `#edf1e9`, mint accent `#bcf8ce`.
- Inter for headlines and body, DM Mono for navigation and technical metadata; system and Chinese fallbacks must work without Google Fonts.
- Generous spacing, square corners and fine borders. Use accent color for emphasis, rather than applying the same green treatment everywhere.
- The contact section reverses to a full mint surface to give the long page a clear ending.
- Identity: a mint open C orbit, a warm-white J and one satellite point form the custom mark. Pair it with the compact JCL.AI wordmark. The navigation mark and browser icons share the same geometry; interaction is a brief orbit tilt on hover or keyboard focus, with no idle animation. Reduced motion keeps the mark still.

## Reading order
1. Personal positioning and an interactive particle core.
2. A featured PE Workbench case study with four selectable architecture layers, followed by four selected projects.
3. Two co-authored financial AI papers with publication links and original architecture figures.
4. Engineer profile and systems thinking.
5. Technical stack and experience.
6. Contact and an interactive pixel signature with spring-based displacement.

## Interaction
- Particle surface: orbit/sphere buttons, pointer-driven tilt, pause/resume.
- Animation stops offscreen and in background tabs. Respect live reduced-motion preferences.
- Keep the particle rotation, gaze and character pose when pausing; no visual reset.
- The hero contains only the orbit/sphere characters and their controls, with no coordinate axes or technical space labels. Eyes follow the page pointer. Hover provides restrained anticipation; clicking eyes, nose, mouth, hands or feet triggers a wink, boop, whistle, high five or two-step respectively. Body clicks cycle through hop, proud pose and spin; double clicking spins, and holding the body gives a hug. Every action ends and settles instead of sharing a looping body shake. Empty canvas clicks do nothing.
- Small trick buttons expose the same actions to touch and keyboard users. Enter or Space on the character cycles body tricks. Preserve native vertical touch scrolling; dragging, scrolling or leaving cancels a pending hold. Pausing freezes the current pose and disables trick buttons.
- Project details use native disclosure elements with keyboard support.
- All links and controls have visible keyboard focus. Mobile navigation remains accessible.
- The navigation stays fixed above the page and reserves its original height in the hero. Once that original space leaves the viewport, it becomes a compact dark glass bar and replaces JCL.AI with a custom lowercase atchaolong wordmark: mint at, warm-white circular letterforms and an extended g signature tail. The change reverses at the top, reserves the same brand width and respects reduced motion. Anchor links account for the fixed header; the opening still covers and disables navigation.
- Signature: fine square pixels sampled from the actual letterforms, with room around the text for displacement. Pointer speed affects the disturbance; leaving releases it into a damped spring return.
- Click, touch, Enter or Space launch a bounded expanding pulse. Preserve a faint home-position impression so the word remains legible during interaction.
- The signature stops rendering when settled, offscreen or hidden. Reduced motion renders static text, including after resize and font loading. Keep a text fallback until the canvas is ready.

## Responsive
- Desktop: two-column hero and projects.
- Mobile: stacked hero, compact particle surface, single-column projects, two-column skill grid.
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
