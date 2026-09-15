"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowDown, ArrowUpRight, Pause, Play, X } from "lucide-react";
import type { SystemProject } from "@/lib/project-content";
import { useLocale } from "./LocaleProvider";
import { AnimatedFlow } from "./AnimatedDiagrams";
import ProjectArchitecture from "./ProjectArchitecture";
import { cardTransform, getCardPose, getDealerHands, type DealerLayout } from "@/lib/project-dealer-motion";
import { createParticleDealer } from "./ParticleDealer";
import "./ProjectScrollShowcase.css";

const accents = ["#bcf8ce", "#99d9f0", "#d6b3f5", "#ded8ab"];
const clamp = (value: number, max = 1) => Math.max(0, Math.min(max, value));
const number = (index: number) => String(index + 1).padStart(2, "0");

function ProjectPreview({ project }: { project: SystemProject }) {
  const slot = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const box = slot.current;
    const content = figure.current;
    if (!box || !content) return;
    const fit = () => {
      if (!content.offsetWidth || !content.offsetHeight) return;
      const scale = Math.min(1, box.clientWidth / content.offsetWidth, box.clientHeight / content.offsetHeight);
      content.style.setProperty("--diagram-scale", String(scale));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    observer.observe(content);
    fit();
    return () => observer.disconnect();
  }, []);

  return <div className="project-scroll-preview">
    <div ref={slot} className="project-scroll-diagram-slot"><div ref={figure} className="project-scroll-diagram">
      {project.architecture ? <ProjectArchitecture kind={project.architecture} /> : <AnimatedFlow steps={project.steps} parallel={project.parallel} />}
    </div></div>
    <div className="project-scroll-mini"><AnimatedFlow steps={project.steps} parallel={project.parallel} /></div>
  </div>;
}

export default function ProjectScrollShowcase() {
  const { t, locale } = useLocale();
  const projects: SystemProject[] = t.projects;
  const copy = t.work.showcase;
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const particleCanvas = useRef<HTMLCanvasElement>(null);
  const effectsPaused = useRef(false);
  const meter = useRef<HTMLSpanElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const metrics = useRef({ start: 0, travel: 0, step: 0 });
  const refresh = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const project = expanded === null ? null : projects[expanded];

  useLayoutEffect(() => { setReady(true); }, []);

  useLayoutEffect(() => {
    if (!ready) return;
    const section = root.current;
    const sticky = frame.current;
    const view = viewport.current;
    if (!section || !sticky || !view || !particleCanvas.current) return;
    const dealer = createParticleDealer(particleCanvas.current);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let anchorFrame = 0;
    let nearby = true;
    let initialized = false;
    let pinned = false;
    let lastProgress = 0;
    let lastWidth = 0;
    let lastHeight = 0;
    let layout: DealerLayout = { width: 0, height: 0, card: { left: 0, top: 0, width: 0, height: 0 }, narrow: false };
    let activeIndex = -1;
    let displayedPosition = 0;
    let lastFrame = 0;

    const targetPosition = () => metrics.current.travel ? clamp((window.scrollY - metrics.current.start) / metrics.current.travel) * (projects.length - 1) : 0;
    const paint = (position = targetPosition()) => {
      const { start, travel } = metrics.current;
      const progress = travel ? clamp((window.scrollY - start) / travel) : 0;
      pinned = window.scrollY >= start - 1 && window.scrollY <= start + travel + 1;
      lastProgress = progress;
      displayedPosition = position;
      section.dataset.dealerPosition = position.toFixed(4);
      const current = Math.min(projects.length - 1, Math.floor(position + .4));
      if (meter.current) meter.current.style.transform = `scaleX(${position / (projects.length - 1)})`;
      if (counter.current && current !== activeIndex) counter.current.textContent = number(current);
      activeIndex = current;
      cards.current.forEach((card, index) => {
        if (!card) return;
        const pose = getCardPose(index, position, layout);
        const active = index === current;
        card.dataset.active = String(active);
        card.dataset.visible = String(active);
        card.inert = !active;
        card.style.zIndex = String(pose.z);
        if (motion.matches) {
          card.style.transform = "none";
          card.style.opacity = active ? "1" : "0";
          card.style.setProperty("--card-face", "1");
          card.style.setProperty("--card-back", "0");
          card.style.setProperty("--card-shade", "0");
        } else {
          card.style.transform = cardTransform(pose);
          card.style.opacity = String(pose.opacity);
          card.style.setProperty("--card-face", String(pose.face));
          card.style.setProperty("--card-back", String(pose.back));
          card.style.setProperty("--card-shade", String(Math.max(0, -pose.depth / 1900) * .36));
        }
      });
      dealer?.render(motion.matches || effectsPaused.current ? [] : getDealerHands(position, projects.length, layout));
    };

    const measure = () => {
      const previous = metrics.current;
      const wasPinned = initialized && pinned;
      const progress = lastProgress;
      const top = parseFloat(getComputedStyle(sticky).top) || 0;
      const start = section.getBoundingClientRect().top + window.scrollY - top;
      const step = Math.round(Math.max(240, Math.min(310, sticky.clientHeight * .43)));
      const travel = step * (projects.length - 1);
      const first = cards.current[0];
      if (first) {
        layout = {
          width: view.clientWidth,
          height: view.clientHeight,
          card: { left: first.offsetLeft, top: first.offsetTop, width: first.offsetWidth, height: first.offsetHeight },
          narrow: window.matchMedia("(max-width:1099px)").matches,
        };
        dealer?.resize(layout.width, layout.height, layout.narrow);
      }
      const changed = Math.abs(start - previous.start) > 1 || view.clientWidth !== lastWidth || sticky.clientHeight !== lastHeight || travel !== previous.travel;
      metrics.current = { start, travel, step };
      lastWidth = view.clientWidth;
      lastHeight = sticky.clientHeight;
      section.style.setProperty("--project-travel", `${travel}px`);
      if (wasPinned && changed) window.scrollTo({ top: start + progress * travel, behavior: "instant" });
      initialized = true;
      paint();
    };

    const tick = (time: number) => {
      animationFrame = 0;
      if (!nearby || document.hidden) { lastFrame = 0; return; }
      const target = targetPosition();
      const dt = lastFrame ? Math.min(40, time - lastFrame) : 16;
      lastFrame = time;
      const next = motion.matches ? target : displayedPosition + (target - displayedPosition) * (1 - Math.exp(-dt / 110));
      const settled = Math.abs(target - next) < .001;
      paint(settled ? target : next);
      if (!settled) animationFrame = requestAnimationFrame(tick);
      else lastFrame = 0;
    };
    const schedule = () => {
      if (!nearby || document.hidden || animationFrame) return;
      // A short, bounded catch-up lets discrete wheel steps read as a hand gesture.
      animationFrame = requestAnimationFrame(tick);
    };
    const onMotionChange = () => paint();
    const followHash = () => {
      const match = /^#project-(\d+)$/.exec(window.location.hash);
      if (!match) return;
      const index = Number(match[1]) - 1;
      if (!cards.current[index]) return;
      window.scrollTo({ top: metrics.current.start + index * metrics.current.step, behavior: "instant" });
      paint();
    };
    // The browser may restore an anchor after hydration changes the deck's height.
    const settleHash = () => {
      cancelAnimationFrame(anchorFrame);
      anchorFrame = requestAnimationFrame(() => { measure(); followHash(); });
    };
    const onAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      // Clicking the current hash does not emit hashchange.
      if (link && link.target !== "_blank" && /^#project-\d+$/.test(link.getAttribute("href") ?? "")) settleHash();
    };
    measure();
    settleHash();
    const loadAlignment = new AbortController();
    if (document.readyState !== "complete") {
      window.addEventListener("load", () => { settleHash(); loadAlignment.abort(); }, { once: true, signal: loadAlignment.signal });
      // A late font/image load must not pull someone back after they start browsing.
      for (const type of ["wheel", "touchstart", "pointerdown", "keydown"]) {
        window.addEventListener(type, () => loadAlignment.abort(), { once: true, passive: true, signal: loadAlignment.signal });
      }
    }
    refresh.current = measure;
    const observer = new ResizeObserver(measure);
    observer.observe(view);
    observer.observe(sticky);
    if (section.parentElement) observer.observe(section.parentElement);
    const visibility = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      if (nearby) schedule();
      else {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        lastFrame = 0;
        // Returning from another section should reveal the correct end of the deck.
        paint();
      }
    }, { rootMargin: "200px 0px" });
    visibility.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("hashchange", settleHash);
    document.addEventListener("click", onAnchorClick);
    document.addEventListener("visibilitychange", schedule);
    motion.addEventListener("change", onMotionChange);
    return () => {
      refresh.current = () => {};
      observer.disconnect();
      visibility.disconnect();
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(anchorFrame);
      loadAlignment.abort();
      dealer?.dispose();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      window.removeEventListener("hashchange", settleHash);
      document.removeEventListener("click", onAnchorClick);
      document.removeEventListener("visibilitychange", schedule);
      motion.removeEventListener("change", onMotionChange);
    };
  }, [ready, projects.length]);

  useLayoutEffect(() => { refresh.current(); }, [locale]);
  useLayoutEffect(() => { effectsPaused.current = paused || expanded !== null; refresh.current(); }, [paused, expanded]);

  useEffect(() => {
    if (expanded === null || !dialog.current) return;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!element.open) element.showModal();
    return () => { document.body.style.overflow = overflow; };
  }, [expanded]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const { start, travel, step } = metrics.current;
    const current = Math.round(clamp(window.scrollY - start, travel) / step) * step;
    const next = event.key === "ArrowRight" ? clamp(current + step, travel)
      : event.key === "ArrowLeft" ? clamp(current - step, travel)
      : event.key === "Home" ? 0 : event.key === "End" ? travel : null;
    if (next === null) return;
    event.preventDefault();
    window.scrollTo({ top: start + next, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return <section ref={root} className="project-scroll" data-ready={ready} data-paused={paused || expanded !== null} aria-labelledby="project-scroll-label">
    <div ref={frame} className="project-scroll-frame" role="group" tabIndex={0} aria-describedby="project-scroll-instructions" onKeyDown={onKeyDown}>
      <div className="project-scroll-meta"><span id="project-scroll-label">{copy.label}</span><span className="project-scroll-hint"><ArrowDown size={13} aria-hidden="true" />{copy.hint}</span><button type="button" className="diagram-toggle" aria-pressed={paused} aria-label={paused ? copy.play : copy.pause} title={paused ? copy.play : copy.pause} onClick={() => setPaused(value => !value)}>{paused ? <Play size={11} /> : <Pause size={11} />}</button></div>
      <p id="project-scroll-instructions" className="sr-only">{copy.keyboard}</p>
      <div ref={viewport} className="project-deal-table">
        <div className="project-deal-surface" aria-hidden="true" />
        <div className="project-deal-source" aria-hidden="true"><span>{copy.deck}</span><i /><small>ATCHAOLONG</small></div>
        <canvas ref={particleCanvas} className="project-dealer-particles" aria-hidden="true" />
        {projects.map((item, index) => <article key={index} ref={element => { cards.current[index] = element; }} className="project project-scroll-card" id={`project-${index + 1}`} aria-labelledby={`project-title-${index + 1}`} style={{ "--project-accent": accents[index] } as CSSProperties}>
          <div className="project-deal-back" aria-hidden="true"><span>ATCHAOLONG / SYSTEMS</span><svg viewBox="0 0 180 120" fill="none"><path d="m90 13 59 31-59 31-59-31 59-31Zm-59 47 59 31 59-31M31 76l59 31 59-31" /><circle cx="90" cy="44" r="8" /></svg><b>{number(index)}<small> / {number(projects.length - 1)}</small></b></div>
          <div className="project-deal-face">
            <div className="project-deal-copy">
              <div className="project-scroll-heading"><span className="project-kicker">[{number(index)}] <span>{item.kicker}</span></span><h3 id={`project-title-${index + 1}`}>{item.title}</h3></div>
              <p className="project-scroll-description">{item.description}</p>
              <div className="stack project-scroll-tags">{item.stack.map((tag, i) => <span key={i}>{tag}</span>)}{item.stack.length > 2 && <span className="project-scroll-more" aria-hidden="true">+{item.stack.length - 2}</span>}</div>
              <button className="project-scroll-details" type="button" aria-haspopup="dialog" aria-controls="project-engineering-dialog" onClick={() => setExpanded(index)}>{t.work.details}<ArrowUpRight size={17} aria-hidden="true" /></button>
            </div>
            <ProjectPreview project={item} />
          </div>
        </article>)}
      </div>
      <div className="project-scroll-footer"><span>{number(projects.length - 1)} {copy.projects}</span><div className="project-scroll-progress" aria-hidden="true"><span ref={meter} /></div><span><span ref={counter}>01</span> / {number(projects.length - 1)}</span></div>
    </div>
    <dialog ref={dialog} id="project-engineering-dialog" className="project-scroll-dialog" aria-labelledby="project-engineering-title" onClose={() => setExpanded(null)} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close();
    }}>
      {project && <>
        <div className="project-dialog-header"><div><span className="project-kicker">{project.kicker}</span><h3 id="project-engineering-title">{project.title}</h3></div><button type="button" autoFocus aria-label={copy.close} onClick={() => dialog.current?.close()}><X size={21} aria-hidden="true" /></button></div>
        <div className="project-dialog-intro"><p>{project.description}</p><div className="stack">{project.stack.map(tag => <span key={tag}>{tag}</span>)}</div></div>
        <div className="project-dialog-architecture">{project.architecture ? <ProjectArchitecture kind={project.architecture} /> : <AnimatedFlow steps={project.steps} parallel={project.parallel} />}</div>
        <div className="project-dialog-engineering"><dl><dt>{t.work.contribution}</dt><dd>{project.role}</dd><dt>{t.work.flow}</dt><dd>{project.flow ?? project.steps.join(project.parallel ? " + " : " → ")}</dd></dl>{project.engineering && <div className="project-engineering">{project.engineering.map(item => <section key={item.title}><h4>{item.title}</h4><p>{item.description}</p></section>)}{project.note && <p className="project-implementation-note">{project.note}</p>}</div>}</div>
      </>}
    </dialog>
  </section>;
}
