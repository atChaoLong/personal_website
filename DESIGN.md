# JCL.AI — DESIGN.md

## Concept
A cinematic, terminal-native portfolio for an AI full-stack engineer. The visual language combines:
- void-black precision and sparse typography from developer-focused systems
- emerald signal accents and terminal metadata
- cinematic negative space and editorial pacing
- interactive particle constellation as a metaphor for AI systems and connected tools

The site must feel like an **AI systems laboratory**, not a generic developer portfolio.

## Visual rules
- Canvas: near-black `#050706`
- Primary accent: emerald `#9affc7`
- Secondary signal: cyan `#8bd8ff`
- Text: `#f3f7f4`
- Muted text: `#8d9992`
- Borders: translucent emerald/white hairlines
- Typography: Inter for editorial/display text; DM Mono for labels, metadata, architecture diagrams, and terminal UI.
- Avoid card-heavy SaaS dashboards.
- Prefer horizontal rules, oversized typography, sparse grids, technical labels and cinematic whitespace.
- Use rounded corners sparingly or not at all.
- Motion should be quiet, physical, and purposeful.

## Hero
- Full viewport.
- Particle constellation background with low opacity.
- Large statement: "I build intelligent systems that ship."
- Right side: terminal diagnostic panel.
- Small metadata row at bottom.
- CTA is rectangular and precise, not pill-shaped.

## Interaction
- tsParticles: 60–80 low-opacity particles, subtle links, slow movement, mouse grab interaction.
- Project rows shift a few pixels on hover.
- Orbit system rotates slowly.
- Motion should never overpower reading.
- Respect reduced-motion preferences in production.

## Content
Lead with AI engineering outcomes:
1. Agentic RAG / tool-use systems
2. Real-time ASR / RTC
3. Multimodal video generation
4. 0→1 full-stack product ownership

Do not fabricate metrics. If stronger current metrics are available, replace placeholders with verified numbers.

## Responsive
- Desktop: editorial two-column layouts.
- Mobile: single column, hide decorative terminal if needed.
- Maintain high contrast and readable body text.
