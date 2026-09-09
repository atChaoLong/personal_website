"use client";

import { useEffect, useState, type RefObject } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import BrandMark from "./BrandMark";
import AtchaolongWordmark from "./AtchaolongWordmark";

const sections = ["work", "profile", "stack", "experience"];

export default function SiteNavigation({ originRef, onReplay }: { originRef: RefObject<HTMLDivElement | null>; onReplay: () => void }) {
  const { locale, setLocale, t } = useLocale();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const origin = originRef.current;
    if (!origin) return;

    // Observe the original, unchanging nav space so compacting the fixed bar
    // cannot move its own threshold or trigger a scroll/render feedback loop.
    setScrolled(origin.getBoundingClientRect().bottom < 0);
    const observer = new IntersectionObserver(([entry]) => {
      setScrolled(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    }, { threshold: 0 });
    observer.observe(origin);
    return () => observer.disconnect();
  }, [originRef]);

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <nav className="nav" aria-label={t.nav.label}>
        <a href="#top" className="brand" aria-label={scrolled ? t.nav.signatureHome : t.nav.home}>
          <span className="brand-primary" aria-hidden="true"><BrandMark /><span className="brand-wordmark">JCL<span className="brand-domain">.AI</span></span></span>
          <span className="brand-signature" aria-hidden="true"><AtchaolongWordmark /></span>
        </a>
        <div className="nav-links">{sections.map((section, index) => <a key={section} href={`#${section}`}><small>{String(index + 1).padStart(2, "0")}</small>{t.nav.items[index]}</a>)}</div>
        <div className="nav-actions">
          <button className="intro-replay" type="button" onClick={onReplay} aria-label={t.nav.replay} title={t.nav.replay}><Play size={13} /></button>
          <div className="locale-switch" role="group" aria-label={t.nav.language}><button type="button" lang="zh-CN" aria-label="切换为中文" aria-pressed={locale === "zh"} onClick={() => setLocale("zh")}>中</button><span aria-hidden="true">/</span><button type="button" lang="en" aria-label="Switch to English" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
          <a className="nav-cta" href="mailto:atchaolong@gmail.com">{t.nav.contact}<ArrowUpRight size={14} /></a>
        </div>
      </nav>
    </header>
  );
}
