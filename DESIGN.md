# JCL.AI — Design direction

An independent AI engineer’s portfolio: oversized editorial typography, playful particle characters, and concrete engineering work. Keep the existing project facts and personal identity.

## Visual system
- Near-black canvas `#080b0a`, warm-white text `#edf1e9`, mint accent `#bcf8ce`.
- Inter for headlines and body, DM Mono for navigation and technical metadata; system and Chinese fallbacks must work without Google Fonts.
- Generous spacing, square corners and fine borders. Use accent color for emphasis, rather than applying the same green treatment everywhere.
- The contact section reverses to a full mint surface to give the long page a clear ending.

## Reading order
1. Personal positioning and an interactive particle core.
2. Four selected projects, each with a schematic based on its existing system flow.
3. Engineer profile and systems thinking.
4. Technical stack and experience.
5. Contact and an interactive pixel signature with spring-based displacement.

## Interaction
- Particle surface: orbit/sphere buttons, pointer-driven tilt, pause/resume.
- Animation stops offscreen and in background tabs. Respect live reduced-motion preferences.
- Keep the particle rotation, gaze and character pose when pausing; no visual reset.
- The hero contains only the orbit/sphere characters and their controls, with no coordinate axes or technical space labels. Eyes follow the page pointer; body, eyes, nose, hands and feet have distinct reactions. Tap and keyboard activation provide a tickle reaction.
- Project details use native disclosure elements with keyboard support.
- All links and controls have visible keyboard focus. Mobile navigation remains accessible.
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
- Preserve parallel relationships (K12 Web + Mini Program + Admin) instead of showing them as sequential pipelines.
## Languages and opening

- `lib/messages.ts` is the typed Chinese/English dictionary. Keep both locales complete; product and library names may retain their original names.
- The navigation has a Chinese/English switch. Selection updates the page, title, description and document language, and is remembered locally. `?lang=zh` / `?lang=en` links override the saved preference.
- The server reads the language cookie for initial rendering to avoid flashing the default language on repeat visits. The Next.js runtime is required; this is not a static export.
- English is the default for new visitors; explicit language links and saved preferences take precedence.
- The opening lasts 8 seconds: the camera follows an uneven field of clues, a traced connection introduces each next capability, and a pullback exposes the whole pattern before the AI Agent is revealed. The original brand reveal follows. It appears once per tab session and can be skipped, escaped or replayed. Anchor links bypass the automatic opening. Reduced-motion users go straight to the page.
- Diagrams show sequential signal travel, simultaneous parallel capabilities, and round-trip communication around the AI core. Each diagram can be paused; offscreen and background diagrams stop automatically.
- Footer signature: compact layout, oversized type and a separate 72px canvas bleed retain the existing spring interaction without allocating large vertical gaps.
