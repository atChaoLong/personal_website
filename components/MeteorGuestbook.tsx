"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { ArrowUpRight, Pause, Play, Send, Sparkles, X } from "lucide-react";
import { arrangeMeteorLanes, characterCount, meteorLength, MESSAGE_LIMIT, NAME_LIMIT, type GuestMessage, type GuestPage, type GuestErrorCode } from "@/lib/guestbook";
import { useLocale } from "./LocaleProvider";
import GuestbookNightSky from "./GuestbookNightSky";
import { METEOR_ACTIVITY, METEOR_LANDING, meteorAppearance, meteorTrajectory } from "@/lib/meteor-signature";
import "./MeteorGuestbook.css";

type Selection = { message: GuestMessage; lane: number; pinned: boolean };
const dateLabel = (date: number, locale: string) => new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", { year: "numeric", month: "short", day: "numeric" }).format(date);

export default function MeteorGuestbook() {
  const { t, locale, ready: localeReady } = useLocale();
  const copy = t.guestbook;
  const root = useRef<HTMLElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const meteorNodes = useRef(new Map<number, HTMLButtonElement>());
  const dismiss = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycle = useRef(0);
  const requestId = useRef("");
  const submitting = useRef(false);
  const fetchedAt = useRef(0);
  const [page, setPage] = useState<GuestPage | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [lanes, setLanes] = useState<GuestMessage[]>([]);
  const [size, setSize] = useState({ width: 1000, height: 320 });
  const [nearby, setNearby] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [launch, setLaunch] = useState(0);
  const [mode, setMode] = useState<"write" | "read" | null>(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<{ code: GuestErrorCode; seconds?: number } | null>(null);
  const [sent, setSent] = useState(false);
  const [archive, setArchive] = useState<GuestPage | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [archiveError, setArchiveError] = useState(false);
  const count = characterCount(body);
  const maxMeteors = size.width < 600 ? 2 : 4;
  const laneCount = reduced ? maxMeteors * 2 : maxMeteors;
  const running = nearby && !hidden && !paused && !reduced && mode === null;

  useEffect(() => {
    const footer = root.current?.closest(".footer-reveal");
    footer?.dispatchEvent(new CustomEvent(METEOR_ACTIVITY, { detail: running }));
    return () => { footer?.dispatchEvent(new CustomEvent(METEOR_ACTIVITY, { detail: false })); };
  }, [running, reduced]);

  const fetchLatest = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/guestbook", { cache: "no-store", signal });
      if (!response.ok) throw new Error("Unavailable");
      const data = await response.json() as GuestPage;
      if (signal?.aborted) return;
      setPage(data); setLoadState("ready"); fetchedAt.current = Date.now();
    } catch {
      if (!signal?.aborted) setLoadState("error");
    }
  }, []);

  useEffect(() => {
    if (!root.current || !sky.current) return;
    const observer = new IntersectionObserver(([entry]) => setNearby(entry.isIntersecting), { rootMargin: "100px" });
    observer.observe(root.current);
    const resize = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    resize.observe(sky.current);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    motion(); visibility();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); resize.disconnect(); media.removeEventListener("change", motion); document.removeEventListener("visibilitychange", visibility); if (dismiss.current) clearTimeout(dismiss.current); };
  }, []);

  useEffect(() => {
    if (!localeReady || window.location.hash !== "#guestbook") return;
    let frame = 0;
    let interacted = false;
    const controller = new AbortController();
    const align = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { if (!interacted) root.current?.scrollIntoView({ block: "start", behavior: "instant" }); }); };
    for (const event of ["wheel", "touchstart", "pointerdown", "keydown"]) window.addEventListener(event, () => { interacted = true; }, { signal: controller.signal, passive: true, once: true });
    align();
    if (document.readyState !== "complete") window.addEventListener("load", align, { once: true, signal: controller.signal });
    return () => { controller.abort(); cancelAnimationFrame(frame); };
  }, [localeReady]);

  useEffect(() => {
    if (!nearby || hidden || mode !== null) return;
    const controller = new AbortController();
    if (Date.now() - fetchedAt.current > 25_000) void fetchLatest(controller.signal);
    const interval = setInterval(() => void fetchLatest(controller.signal), 30_000);
    return () => { controller.abort(); clearInterval(interval); };
  }, [nearby, hidden, mode, fetchLatest]);

  useEffect(() => {
    if (!page) return;
    setLanes(previous => arrangeMeteorLanes(page.messages, previous, laneCount));
  }, [page, laneCount]);

  useEffect(() => {
    setSelection(previous => previous && lanes[previous.lane]?.id === previous.message.id ? previous : null);
  }, [lanes]);

  useLayoutEffect(() => {
    if (!selection || !popup.current || !sky.current) return;
    const target = meteorNodes.current.get(selection.lane);
    if (!target) return;
    const bounds = sky.current.getBoundingClientRect(), meteor = target.getBoundingClientRect(), card = popup.current;
    const left = Math.max(12, Math.min(bounds.width - card.offsetWidth - 12, meteor.right - bounds.left - card.offsetWidth * .7));
    const below = meteor.bottom - bounds.top + 10;
    const top = Math.max(10, Math.min(bounds.height - card.offsetHeight - 10, below));
    card.style.left = `${left}px`; card.style.top = `${top}px`;
  }, [selection, size, locale]);

  useEffect(() => {
    if (mode === null || !dialog.current) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.current.open) dialog.current.showModal();
    return () => { document.body.style.overflow = oldOverflow; };
  }, [mode]);

  function clearDismiss() { if (dismiss.current) clearTimeout(dismiss.current); }
  function releaseSoon() { clearDismiss(); dismiss.current = setTimeout(() => setSelection(current => current?.pinned ? current : null), 160); }
  function catchMeteor(message: GuestMessage, lane: number, pinned: boolean) { clearDismiss(); setSelection(current => current?.pinned && !pinned ? current : { message, lane, pinned }); }
  function cycleLane(index: number) {
    if (!page?.messages.length) return;
    setLanes(previous => {
      const occupied = new Set(previous.filter((_, lane) => lane !== index).map(message => message.id));
      let next = previous[index];
      for (let attempt = 0; attempt < page.messages.length; attempt++) {
        const candidate = page.messages[(cycle.current++) % page.messages.length];
        if (!occupied.has(candidate.id)) { next = candidate; break; }
      }
      return next === previous[index] ? previous : previous.map((message, lane) => lane === index ? next : message);
    });
  }
  function landMeteor(message: GuestMessage, index: number) {
    if (!running || selection?.lane === index || !sky.current) return;
    const bounds = sky.current.getBoundingClientRect();
    const tailLength = meteorLength(message.body, size.width);
    const { impactX, slope, drift, duration } = meteorTrajectory(index, tailLength, size.width, size.height);
    root.current?.closest(".footer-reveal")?.dispatchEvent(new CustomEvent(METEOR_LANDING, { detail: {
      x: bounds.left + impactX, y: bounds.bottom, slope, speed: drift / duration, tailLength, ...meteorAppearance(index), strength: .7 + characterCount(message.body) / MESSAGE_LIMIT * .6,
    } }));
  }
  function open(next: "write" | "read") {
    clearDismiss(); setSelection(null); setMode(next); setError(null); setArchiveError(false);
    if (next === "read") setArchive(page);
  }
  async function older() {
    if (!archive?.nextCursor || loadingMore) return;
    setLoadingMore(true); setArchiveError(false);
    try {
      const response = await fetch(`/api/guestbook?before=${archive.nextCursor}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Unavailable");
      const next = await response.json() as GuestPage;
      setArchive(current => current ? { ...next, messages: [...current.messages, ...next.messages.filter(message => !current.messages.some(item => item.id === message.id))] } : next);
    } catch { setArchiveError(true); } finally { setLoadingMore(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!body.trim() || count > MESSAGE_LIMIT || characterCount(name) > NAME_LIMIT) { setError({ code: "invalid" }); return; }
    submitting.current = true; setSending(true); setError(null);
    requestId.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, body, website, requestId: requestId.current }) });
      const result = await response.json();
      if (!response.ok) {
        const code = Object.hasOwn(copy.errors, result.error) ? result.error as GuestErrorCode : "unavailable";
        setError({ code, seconds: Number(result.retryAfter) || 5 }); return;
      }
      const message = result.message as GuestMessage;
      setPage(current => ({ messages: [message, ...(current?.messages ?? []).filter(item => item.id !== message.id)].slice(0, 60), total: (current?.total ?? 0) + (current?.messages.some(item => item.id === message.id) ? 0 : 1), nextCursor: current?.nextCursor ?? null }));
      setLanes(current => [message, ...current.filter(item => item.id !== message.id)].slice(0, laneCount));
      setLaunch(value => value + 1); setBody(""); requestId.current = ""; setSent(true); setLoadState("ready");
      dialog.current?.close(); void fetchLatest();
    } catch { setError({ code: "unavailable" }); }
    finally { submitting.current = false; setSending(false); }
  }

  return <section ref={root} className="meteor-guestbook" id="guestbook" aria-labelledby="guestbook-title" data-running={running} data-reduced={reduced}>
    <GuestbookNightSky />
    <div className="guestbook-heading"><div><span className="guestbook-kicker">{copy.label}</span><h3 id="guestbook-title">{copy.title}</h3><p>{copy.subtitle}</p></div><button className="guestbook-write" type="button" onClick={() => open("write")}><Sparkles size={15} />{copy.write}<ArrowUpRight size={16} /></button></div>
    <div className="guestbook-toolbar"><span className="guestbook-count"><i />{page?.total ?? "—"} {copy.count}</span><span className="guestbook-hint">{copy.hint}</span><button type="button" className="guestbook-browse" disabled={!page} onClick={() => open("read")}>{copy.browse}<ArrowUpRight size={12} /></button><button className="guestbook-pause" type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? copy.play : copy.pause}>{paused ? <Play size={13} /> : <Pause size={13} />}</button></div>
    <p className="guestbook-announcement" role="status">{sent ? copy.success : ""}</p>
    <div ref={sky} className="guestbook-sky" data-running={running} data-reduced={reduced} onKeyDown={event => { if (event.key === "Escape") setSelection(null); }}>
      {!reduced && <div className="guestbook-light-traces" aria-hidden="true">{Array.from({ length: maxMeteors }, (_, index) => {
        const length = size.width < 600 ? 72 + index * 12 : 90 + index * 22;
        const { startX, endX, drift, angle, duration } = meteorTrajectory(index + 4, length, size.width, size.height, true);
        const appearance = meteorAppearance(index + 2);
        const style = { "--meteor-length": `${length}px`, "--meteor-start": `${startX}px`, "--meteor-end": `${endX}px`, "--meteor-y": "-70px", "--meteor-drift": `${drift}px`, "--meteor-duration": `${duration}s`, "--meteor-delay": `${-duration * ((index * .23 + .12) % 1)}s`, "--meteor-angle": `${angle}deg`, "--meteor-tone": appearance.tone, "--meteor-brightness": appearance.brightness * .7 } as CSSProperties;
        return <span key={index} className="guestbook-light-trace" style={style}><span className="meteor-trail"><i /><b /></span></span>;
      })}</div>}
      {lanes.map((message, index) => {
        const held = selection?.lane === index;
        const length = meteorLength(message.body, size.width);
        const { startX, endX, drift, angle, duration, impactX } = meteorTrajectory(index, length, size.width, size.height);
        const appearance = meteorAppearance(index);
        const style = { "--meteor-length": `${length}px`, "--meteor-start": `${startX}px`, "--meteor-end": `${endX}px`, "--meteor-y": "-70px", "--meteor-drift": `${drift}px`, "--meteor-duration": `${duration}s`, "--meteor-delay": `${-duration * ((index * .18 + .35) % 1)}s`, "--meteor-angle": `${angle}deg`, "--meteor-tone": appearance.tone, "--meteor-brightness": appearance.brightness } as CSSProperties;
        const preview = message.body.replace(/\s+/g, " ");
        return <button key={`${index}-${index === 0 ? launch : 0}`} ref={node => { if (node) meteorNodes.current.set(index, node); else meteorNodes.current.delete(index); }} className="guestbook-meteor" type="button" style={style} tabIndex={reduced ? 0 : -1} data-depth={appearance.depth} data-caption-side={impactX < size.width * .46 ? "right" : "left"} data-message-id={message.id} data-held={held} aria-label={`${message.name || copy.visitor}: ${message.body}`} aria-expanded={held} onAnimationIteration={event => { if (event.target !== event.currentTarget) return; landMeteor(message, index); cycleLane(index); }} onPointerEnter={event => { if (event.pointerType === "mouse") catchMeteor(message, index, false); }} onPointerLeave={releaseSoon} onFocus={() => catchMeteor(message, index, false)} onBlur={releaseSoon} onClick={() => catchMeteor(message, index, true)}>
          <span className="meteor-caption"><span className="meteor-preview">{preview}</span><span className="meteor-author">{message.name || copy.visitor}</span></span><span className="meteor-trail" aria-hidden="true"><i /><b /></span>
        </button>;
      })}
      {!page?.messages.length && <div className="guestbook-empty"><span className="guestbook-beacon" aria-hidden="true"><i /></span><p>{loadState === "loading" ? copy.loading : loadState === "error" ? copy.loadError : copy.empty}</p>{loadState === "error" && <button type="button" onClick={() => void fetchLatest()}>{copy.retry}</button>}</div>}
      {selection && <aside ref={popup} className="guestbook-caught" role="dialog" aria-modal="false" aria-label={copy.caught} onPointerEnter={clearDismiss} onPointerLeave={releaseSoon}><div className="guestbook-caught-meta"><span>{copy.caught}</span><button type="button" aria-label={copy.release} onClick={() => setSelection(null)}><X size={15} /></button></div><p>{selection.message.body}</p><div className="guestbook-caught-author"><strong>{selection.message.name || copy.visitor}</strong><time dateTime={new Date(selection.message.createdAt).toISOString()}>{dateLabel(selection.message.createdAt, locale)}</time></div></aside>}
    </div>
    <dialog ref={dialog} className="guestbook-dialog" aria-labelledby="guestbook-dialog-title" onClose={() => setMode(null)} onClick={event => { if (event.target !== event.currentTarget) return; const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) event.currentTarget.close(); }}>
      <div className="guestbook-dialog-heading"><span>{copy.label}</span><button type="button" aria-label={copy.close} onClick={() => dialog.current?.close()}><X size={20} /></button></div>
      <h3 id="guestbook-dialog-title">{mode === "write" ? copy.formTitle : copy.listTitle}</h3>
      {mode === "write" ? <form onSubmit={submit}>
        <p className="guestbook-form-note">{copy.formDescription}</p>
        <label htmlFor="guestbook-name">{copy.name}</label><input id="guestbook-name" name="nickname" value={name} autoComplete="nickname" maxLength={NAME_LIMIT * 2} placeholder={copy.namePlaceholder} onChange={event => { setName(event.target.value); requestId.current = ""; }} disabled={sending} />
        <label htmlFor="guestbook-message">{copy.message}</label><textarea id="guestbook-message" name="message" value={body} required maxLength={MESSAGE_LIMIT * 2} rows={5} placeholder={copy.messagePlaceholder} onChange={event => { setBody(event.target.value); requestId.current = ""; }} disabled={sending} aria-describedby="guestbook-character-count guestbook-form-error" />
        <div className="guestbook-form-count" id="guestbook-character-count" data-invalid={count > MESSAGE_LIMIT}>{count} / {MESSAGE_LIMIT}</div>
        <div className="guestbook-honeypot" aria-hidden="true"><label htmlFor="guestbook-website">Website</label><input id="guestbook-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></div>
        <p className="guestbook-form-error" id="guestbook-form-error" role="alert">{error ? copy.errors[error.code].replace("{seconds}", String(error.seconds ?? 5)) : ""}</p>
        <button className="guestbook-submit" type="submit" disabled={sending || count > MESSAGE_LIMIT || characterCount(name) > NAME_LIMIT}>{sending ? copy.sending : copy.submit}<Send size={15} /></button>
      </form> : <div className="guestbook-archive">{!archive?.messages.length && <p>{copy.noMessages}</p>}{archive?.messages.map(message => <article key={message.id}><p>{message.body}</p><div><strong>{message.name || copy.visitor}</strong><time dateTime={new Date(message.createdAt).toISOString()}>{dateLabel(message.createdAt, locale)}</time></div></article>)}{archiveError && <p role="alert">{copy.loadError}</p>}{archive?.nextCursor && <button type="button" className="guestbook-load-more" onClick={() => void older()} disabled={loadingMore}>{loadingMore ? copy.loadingMore : copy.more}</button>}</div>}
    </dialog>
  </section>;
}
