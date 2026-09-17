"use client";

import { useEffect, useRef } from "react";
import { METEOR_ACTIVITY, METEOR_LANDING, SIGNATURE_IMPACT, signatureFlightPoint, signatureLanding, type MeteorLanding } from "@/lib/meteor-signature";

type Flight = {
  animation: Animation;
  source: MeteorLanding;
  destination: { x: number; y: number; duration: number };
  targetTop: number;
  targetWidth: number;
};
function frames(source: MeteorLanding, destination: Flight["destination"]) {
  return Array.from({ length: 25 }, (_, index) => {
    const t = (index / 24) ** 2;
    const { x, y, angle } = signatureFlightPoint(source, destination, t);
    return { offset: t, transform: `translate3d(${x}px,${y}px,0) rotate(${angle}rad)` };
  });
}

/** Continue an actual guestbook meteor across the footer, then wake the letter particles. */
export default function MeteorSignatureBridge() {
  const overlay = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const layer = overlay.current;
    const root = layer?.closest(".footer-reveal");
    const target = root?.querySelector<HTMLElement>(".pixel-text");
    const curtain = root?.querySelector<HTMLElement>("#contact");
    if (!layer || !root || !target || !curtain) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const flights = new Map<Animation, Flight>();
    let disposed = false;
    let scrollFrame = 0;
    const clear = () => {
      cancelAnimationFrame(scrollFrame); scrollFrame = 0;
      for (const animation of flights.keys()) animation.cancel();
      flights.clear(); layer.replaceChildren();
    };
    const activity = (event: Event) => { if (!(event as CustomEvent<boolean>).detail) clear(); };
    const trackScroll = () => {
      if (!flights.size || scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const origin = layer.getBoundingClientRect(), bounds = target.getBoundingClientRect();
        const curtainBottom = curtain.getBoundingClientRect().bottom;
        for (const flight of flights.values()) {
          const source = { ...flight.source, x: flight.source.x + origin.left, y: flight.source.y + origin.top };
          const destination = signatureLanding(source, bounds, curtainBottom, window.innerHeight);
          if (!destination) { flight.animation.cancel(); continue; }
          // Keep the original clock and incoming velocity as the curtain exposes more of the word.
          flight.destination.x = destination.x - origin.left;
          flight.destination.y = destination.y - origin.top;
          flight.targetTop = bounds.top - origin.top;
          flight.targetWidth = bounds.width;
          (flight.animation.effect as KeyframeEffect).setKeyframes(frames(flight.source, flight.destination));
        }
      });
    };
    const land = (event: Event) => {
      if (disposed || reduced.matches || document.hidden || flights.size >= 4 || root.querySelector(".guestbook-sky")?.getAttribute("data-running") !== "true") return;
      const source = (event as CustomEvent<MeteorLanding>).detail;
      const bounds = target.getBoundingClientRect();
      const destination = signatureLanding(source, bounds, curtain.getBoundingClientRect().bottom, window.innerHeight);
      if (!destination) return;
      const origin = layer.getBoundingClientRect();
      const localSource = { ...source, x: source.x - origin.left, y: source.y - origin.top };
      const localDestination = { ...destination, x: destination.x - origin.left, y: destination.y - origin.top };
      const streak = document.createElement("span");
      streak.className = "signature-falling-meteor";
      streak.style.left = `${localSource.x}px`;
      streak.style.top = `${localSource.y}px`;
      streak.style.setProperty("--fall-length", `${source.tailLength}px`);
      streak.style.setProperty("--meteor-tone", source.tone ?? "188,248,206");
      streak.style.setProperty("--meteor-brightness", String(source.brightness ?? 1));
      streak.appendChild(document.createElement("i"));
      layer.appendChild(streak);
      const animation = streak.animate(frames(localSource, localDestination), { duration: destination.duration, easing: "linear", fill: "forwards" });
      const flight: Flight = { animation, source: localSource, destination: localDestination, targetTop: bounds.top - origin.top, targetWidth: bounds.width };
      flights.set(animation, flight);
      animation.finished.then(() => {
        if (disposed || document.hidden || reduced.matches) return;
        const current = target.getBoundingClientRect(), layerBounds = layer.getBoundingClientRect();
        const hitX = flight.destination.x + layerBounds.left, hitY = flight.destination.y + layerBounds.top;
        if (Math.abs(current.top - layerBounds.top - flight.targetTop) > 2 || current.width !== flight.targetWidth || hitY < curtain.getBoundingClientRect().bottom || hitY < 0 || hitY > Math.min(current.bottom, innerHeight)) return;
        target.dispatchEvent(new CustomEvent(SIGNATURE_IMPACT, { detail: { x: hitX - current.left, y: hitY - current.top, strength: source.strength } }));
      }).catch(() => { /* Pause, resize, hidden pages or a covered target cancel the short flight. */ }).finally(() => { animation.cancel(); flights.delete(animation); streak.remove(); });
    };
    root.addEventListener(METEOR_LANDING, land);
    root.addEventListener(METEOR_ACTIVITY, activity);
    window.addEventListener("scroll", trackScroll, { passive: true });
    window.addEventListener("resize", clear);
    document.addEventListener("visibilitychange", clear);
    reduced.addEventListener("change", clear);
    const resize = new ResizeObserver(clear);
    resize.observe(root); resize.observe(target);
    return () => {
      disposed = true; clear();
      resize.disconnect();
      root.removeEventListener(METEOR_LANDING, land); root.removeEventListener(METEOR_ACTIVITY, activity);
      window.removeEventListener("scroll", trackScroll); window.removeEventListener("resize", clear);
      document.removeEventListener("visibilitychange", clear); reduced.removeEventListener("change", clear);
    };
  }, []);
  return <div ref={overlay} className="signature-meteor-bridge" aria-hidden="true" />;
}
