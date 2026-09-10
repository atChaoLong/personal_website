"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, BookOpen, Database, FileSearch, Layers3, Monitor, Trophy, X, ZoomIn } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import finSAgentFigure from "@/app/static/FinSAgent/论文架构图.webp";
import veritasFiFigure from "@/app/static/VeritasFi/论文架构图.webp";
import "./FeaturedResearch.css";

const publications = [
  { figure: finSAgentFigure, paper: "https://arxiv.org/abs/2607.18102", venue: "https://finllm.github.io/workshop/", award: "https://finllm.github.io/workshop/" },
  { figure: veritasFiFigure, paper: "https://dl.acm.org/doi/10.1145/3774904.3792795", venue: "https://www2026.thewebconf.org/accepted/industry.html", award: "https://lei-ding07.github.io/" },
];
const layerIcons = [Monitor, Layers3, FileSearch, Database];

export function PrivateEquityProject() {
  const { t } = useLocale();
  const copy = t.pe;
  const [selected, setSelected] = useState(0);
  const layer = copy.layers[selected];
  return <article className="pe-feature" id="pe-workbench" aria-labelledby="pe-title">
    <div className="pe-masthead"><span>{copy.kicker}</span><span>{copy.type}</span></div>
    <div className="pe-introduction">
      <div><span className="pe-name">{copy.name}</span><h3 id="pe-title">{copy.title[0]}<br /><em>{copy.title[1]}</em></h3></div>
      <div><p>{copy.description}</p><div className="stack">{copy.stack.map(item => <span key={item}>{item}</span>)}</div></div>
    </div>
    <div className="pe-architecture">
      <div className="pe-architecture-heading"><span>{copy.architecture}</span><span>{copy.hint}</span></div>
      <div className="pe-explorer">
        <div className="pe-layers" role="group" aria-label={copy.architecture}>
          {copy.layers.map((item, index) => {
            const Icon = layerIcons[index];
            return <button type="button" key={index} aria-pressed={selected === index} aria-controls="pe-layer-detail" onClick={() => setSelected(index)}>
              <span className="pe-layer-index">0{index + 1}</span><Icon size={20} aria-hidden="true" /><span className="pe-layer-name"><small>{item.label}</small><strong>{item.name}</strong></span><ArrowUpRight size={17} aria-hidden="true" />
            </button>;
          })}
        </div>
        <div className="pe-layer-detail" id="pe-layer-detail" aria-live="polite" aria-atomic="true">
          <span className="pe-detail-index" aria-hidden="true">0{selected + 1}</span>
          <div className="pe-detail-copy"><h4>{layer.title}</h4><p>{layer.description}</p><ul>{layer.points.map(point => <li key={point}>{point}</li>)}</ul><div className="stack">{layer.tech.map(tech => <span key={tech}>{tech}</span>)}</div></div>
          <div className="pe-output"><span>{copy.output}</span><p>{layer.output}</p></div>
        </div>
      </div>
    </div>
    <div className="pe-footnote"><p>{copy.foundation}</p><a href="#research">{copy.related}<ArrowDown size={14} /></a></div>
  </article>;
}

export function ResearchSection() {
  const { locale, t } = useLocale();
  const [expanded, setExpanded] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const copy = t.research;

  return <section className="research-section" id="research"><div className="section">
    <div className="section-label"><span>{copy.label}</span><span>{copy.meta}</span></div>
    <div className="section-heading"><h2>{copy.title[0]}<br /><em>{copy.title[1]}</em></h2><p>{copy.description}</p></div>
    <div className="publications">{copy.papers.map((paper, index) => {
      const source = publications[index];
      return <article className="publication" key={paper.name} aria-labelledby={`paper-${index}`}>
        <div className="publication-info">
          <div className="publication-venue"><span className="accepted-badge"><span />{copy.accepted}</span><span>{paper.venue}</span></div>
          <h3 id={`paper-${index}`}>{paper.name}<span>0{index + 1}</span></h3>
          <p className="publication-title" lang="en">{paper.title}</p>
          <p className="publication-author">{copy.author}</p>
          <a className="publication-award" href={source.award} target="_blank" rel="noreferrer"><Trophy size={16} aria-hidden="true" /><span><strong>{copy.award}</strong><span>{paper.awardVenue}</span></span><ArrowUpRight size={14} aria-hidden="true" /></a>
          <h4>{paper.headline}</h4><p className="publication-description">{paper.description}</p>
          <ul className="publication-points">{paper.points.map(point => <li key={point}>{point}</li>)}</ul>
          <div className="publication-links"><a href={source.paper} target="_blank" rel="noreferrer"><BookOpen size={15} />{copy.paper}<ArrowUpRight size={14} /></a><a href={source.venue} target="_blank" rel="noreferrer">{copy.venue}<ArrowUpRight size={14} /></a></div>
        </div>
        <figure className="publication-figure">
          <button type="button" onClick={() => { setExpanded(index); dialog.current?.showModal(); }} aria-label={`${paper.name} · ${copy.figure}`}><Image src={source.figure} alt={paper.alt} sizes="(max-width: 900px) 90vw, 45vw" /><span className="figure-zoom"><ZoomIn size={16} />{copy.figure}</span></button>
          <figcaption><span>FIG. 0{index + 1}</span>{copy.figureNote}</figcaption>
        </figure>
      </article>;
    })}</div>
    <a className="research-return" href="#pe-workbench">{copy.bridge}<ArrowUpRight size={15} /></a>
    <dialog className="research-dialog" ref={dialog} aria-labelledby="research-dialog-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="research-dialog-bar"><strong id="research-dialog-title">{copy.papers[expanded].name} · {copy.figureNote}</strong><button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label={locale === "zh" ? "关闭架构图" : "Close architecture figure"}><X size={22} /></button></div>
      <div className="research-dialog-image"><Image src={publications[expanded].figure} alt={copy.papers[expanded].alt} sizes="95vw" /></div>
      <a className="research-original" href={publications[expanded].figure.src} target="_blank" rel="noreferrer">{copy.figure}<ArrowUpRight size={14} /></a>
    </dialog>
  </div></section>;
}
