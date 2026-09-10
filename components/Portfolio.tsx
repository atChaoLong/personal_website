"use client";

import { Fragment, useRef, useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Braces, Database, Github, Mail, MapPin, Network, Plus, Radio, Terminal, Workflow } from "lucide-react";
import { LocaleProvider, useLocale } from "./LocaleProvider";
import SiteNavigation from "./SiteNavigation";
import { PrivateEquityProject, ResearchSection } from "./FeaturedResearch";
import OpeningSequence from "./OpeningSequence";
import SignalCore from "./SignalCore";
import FooterReveal from "./FooterReveal";
import { AnimatedFlow, SystemsDiagram } from "./AnimatedDiagrams";
import ProjectArchitecture from "./ProjectArchitecture";
import type { Locale } from "@/lib/messages";

const icons = [Network, Workflow, Braces, Terminal, Database, Radio];
const reveal = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: .48, ease: "easeOut" as const } } };
const number = (index: number) => String(index + 1).padStart(2, "0");

export default function Portfolio({ initialLocale }: { initialLocale: Locale }) { return <LocaleProvider initialLocale={initialLocale}><PortfolioContent /></LocaleProvider>; }

function PortfolioContent() {
  const { locale, t } = useLocale();
  const navigationOrigin = useRef<HTMLDivElement>(null);
  const [introActive, setIntroActive] = useState(false);
  const [introRequest, setIntroRequest] = useState(0);
  return <MotionConfig reducedMotion="user">
    <OpeningSequence request={introRequest} onActiveChange={setIntroActive} />
    <main inert={introActive} data-locale={locale}>
      <a className="skip-link" href="#work">{t.nav.skip}</a>
      <div className="noise" aria-hidden="true" />
      <SiteNavigation originRef={navigationOrigin} onReplay={() => setIntroRequest(n => n + 1)} />
      <section className="hero" id="top">
        <div ref={navigationOrigin} className="nav-origin" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" />{t.hero.name}<span className="eyebrow-divider">/</span>{t.hero.role}</div>
            <h1>{t.hero.title[0]}<br /><span>{t.hero.title[1]}</span><br />{t.hero.title[2]}<span className="title-period">.</span></h1>
            <p className="hero-statement">{t.hero.statement}<br /><span>{t.hero.sub}</span></p>
            <div className="hero-actions"><a className="primary-btn" href="#work">{t.hero.action}<ArrowDown size={16} /></a><a className="text-link" href="https://github.com/atchaolong" target="_blank" rel="noreferrer">GitHub<ArrowUpRight size={15} /></a></div>
            <div className="hero-role">{t.hero.tags.map((tag, i) => <Fragment key={i}>{i > 0 && <span>×</span>}{tag}</Fragment>)}</div>
          </div>
          <SignalCore />
        </div>
        <div className="hero-footer"><span><MapPin size={12} />{t.hero.location}</span><a href="#work">{t.hero.scroll}<ArrowDown size={12} /></a><span className="hero-index">{t.hero.note}</span></div>
      </section>
      <div className="signal-strip" aria-hidden="true">{t.hero.strip.map((tag, i) => <Fragment key={i}>{i > 0 && <i /> }<span>{tag}</span></Fragment>)}</div>

      <section className="work-section" id="work"><div className="section work-inner">
        <div className="section-label"><span>{t.work.label}</span><span>{t.work.meta}</span></div>
        <div className="section-heading"><h2>{t.work.title[0]}<br /><em>{t.work.title[1]}</em></h2><p>{t.work.description}</p></div>
        <PrivateEquityProject />
        <div className="projects">{t.projects.map((project, i) => <article className="project" key={i} id={`project-${i + 1}`}>
          <div className={`project-visual${project.architecture ? " project-visual-detailed" : ""}`} aria-label={`${project.title} ${t.work.overview}`}>
            <div className="project-visual-label"><span>{t.work.system} / {number(i)}</span><span>{t.work.diagram}</span></div>
            {project.architecture ? <ProjectArchitecture kind={project.architecture} /> : <AnimatedFlow steps={project.steps} parallel={project.parallel} />}
            <div className="project-visual-note">{project.kicker}</div>
          </div>
          <div className="project-main"><span className="project-kicker">{t.work.project} / {number(i)}</span><h3>{project.title}</h3><p>{project.description}</p>
            <div className="stack">{project.stack.map((item, n) => <span key={n}>{item}</span>)}</div>
            <details className="project-details"><summary>{t.work.details}<Plus size={16} /></summary><dl><dt>{t.work.contribution}</dt><dd>{project.role}</dd><dt>{t.work.flow}</dt><dd>{project.flow ?? project.steps.join(project.parallel ? " + " : " → ")}</dd></dl>{project.engineering && <div className="project-engineering">{project.engineering.map(item => <section key={item.title}><h4>{item.title}</h4><p>{item.description}</p></section>)}{project.note && <p className="project-implementation-note">{project.note}</p>}</div>}</details>
          </div>
        </article>)}</div>
      </div></section>

      <ResearchSection />

      <section className="section profile-section" id="profile">
        <div className="section-label"><span>{t.profile.label}</span><span>{t.profile.meta}</span></div>
        <div className="profile-grid"><motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: .2 }}><h2>{t.profile.title[0]}<br /><em>{t.profile.title[1]}</em></h2></motion.div><motion.div className="profile-copy" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: .2 }}>{t.profile.paragraphs.map((p, i) => <p key={i}>{p}</p>)}<div className="profile-meta">{t.profile.tags.map((tag, i) => <span key={i}>{tag}</span>)}</div></motion.div></div>
      </section>
      <section className="systems-section" id="systems">
        <SystemsDiagram />
        <motion.div className="system-copy" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: .2 }}><span className="section-kicker">{t.systems.label}</span><h2>{t.systems.title[0]}<br /><em>{t.systems.title[1]}</em></h2><p>{t.systems.description}</p><div className="system-tags">{t.systems.tags.map((tag, i) => <span key={i}>{tag}</span>)}</div></motion.div>
      </section>
      <section className="section" id="stack"><div className="section-label"><span>{t.stack.label}</span><span>{t.stack.meta}</span></div><div className="section-heading"><h2>{t.stack.title[0]}<br /><em>{t.stack.title[1]}</em></h2><p>{t.stack.description}</p></div><div className="skills">{t.stack.groups.map((name, i) => { const Icon = icons[i]; return <motion.article className="skill" key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .04 }}><span className="skill-num">{number(i)}</span><Icon size={18} /><h3>{name}</h3><div>{t.stack.skills[i].map((skill, n) => <span key={n}>{skill}</span>)}</div></motion.article>; })}</div></section>
      <section className="section experience" id="experience"><div className="section-label"><span>{t.experience.label}</span><span>{t.experience.meta}</span></div><div className="section-heading"><h2>{t.experience.title[0]}<br /><em>{t.experience.title[1]}</em></h2><p>{t.experience.description}</p></div><div className="timeline-list">{t.experience.rows.map((row, i) => <div key={row.year}><time>{row.year}</time><span>{number(2 - i)}</span><b>{row.title}</b><p>{row.description}</p></div>)}</div></section>
      <FooterReveal><footer id="contact"><span className="section-kicker">{t.contact.label}</span><h2>{t.contact.title[0]}<br /><em>{t.contact.title[1]}</em></h2><p>{t.contact.description}</p><div className="footer-actions"><a className="primary-btn" href="mailto:atchaolong@gmail.com"><Mail size={15} />{t.contact.action}</a><a className="ghost-btn" href="https://github.com/atchaolong" target="_blank" rel="noreferrer"><Github size={15} />GitHub</a></div><div className="footer-bottom"><span>© 2026 {t.contact.copyright}</span><a href="mailto:atchaolong@gmail.com">ATCHAOLONG@GMAIL.COM</a><button className="footer-replay" type="button" onClick={() => setIntroRequest(n => n + 1)}>{t.intro.replay} ↗</button><a href="#top">{t.contact.back}</a></div></footer></FooterReveal>
    </main>
  </MotionConfig>;
}
