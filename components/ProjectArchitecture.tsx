"use client";

import { AudioLines, GitBranch, Network, Clapperboard } from "lucide-react";
import type { SystemProject } from "@/lib/project-content";
import { useLocale } from "./LocaleProvider";
import { MotionToggle, useDiagramMotion } from "./AnimatedDiagrams";
import "./ProjectArchitecture.css";

function Wire() { return <div className="project-wire" aria-hidden="true"><i /></div>; }

export default function ProjectArchitecture({ kind }: { kind: NonNullable<SystemProject["architecture"]> }) {
  const { t } = useLocale();
  const motion = useDiagramMotion();
  const finance = t.projectDiagrams.finance;
  const speech = t.projectDiagrams.speech;
  const video = t.projectDiagrams.video;
  return <div ref={motion.ref} className={`project-architecture diagram-motion architecture-${kind}`} data-running={motion.running} role="group" aria-label={t.projectDiagrams[kind].label}>
    <div className="project-architecture-stage">
      {kind === "finance" && <>
        <div className="architecture-terminal"><GitBranch size={17} aria-hidden="true" /><div><strong>{finance.route}</strong><small>{finance.routeSub}</small></div></div>
        <Wire />
        <div className="agent-cluster">
          <div className="architecture-cluster-label"><Network size={12} aria-hidden="true" />{finance.parallel}</div>
          <div className="agent-roles">{finance.agents.map(agent => <span key={agent}><i aria-hidden="true" />{agent}</span>)}</div>
          <div className="agent-resources"><small>{finance.resources}</small><div>{finance.tools.map(tool => <span key={tool}>{tool}</span>)}</div></div>
        </div>
        <Wire />
        <div className="architecture-terminal architecture-result"><strong>{finance.finish}</strong><small>{finance.finishSub}</small></div>
      </>}
      {kind === "speech" && <>
        <div className="architecture-terminal"><AudioLines size={17} aria-hidden="true" /><div><strong>{speech.input}</strong><small>{speech.inputSub}</small></div></div>
        <Wire />
        <div className="architecture-terminal"><strong>{speech.segment}</strong><small>{speech.segmentSub}</small></div>
        <Wire />
        <div className="speech-branches">{speech.branches.map((branch, i) => <div key={branch}><strong>{branch}</strong><small>{speech.branchNotes[i]}</small></div>)}</div>
        <Wire />
        <div className="architecture-terminal architecture-result"><strong>{speech.finish}</strong><small>{speech.finishSub}</small></div>
      </>}
      {kind === "video" && <>
        <div className="architecture-terminal"><Clapperboard size={17} aria-hidden="true" /><div><strong>{video.input}</strong><small>{video.inputSub}</small></div></div>
        <Wire />
        <div className="architecture-terminal"><strong>{video.gate}</strong><small>{video.gateSub}</small></div>
        <Wire />
        <div className="video-adapters"><div className="architecture-cluster-label"><GitBranch size={12} aria-hidden="true" />{video.routing}</div><div className="video-provider-list">{video.providers.map(provider => <span key={provider}>{provider}</span>)}</div><small>{video.providerNote}</small></div>
        <Wire />
        <div className="architecture-terminal architecture-result"><strong>{video.state}</strong><small>{video.stateSub}</small></div>
        <div className="video-delivery"><div><strong>{video.delivery}</strong><small>{video.deliverySub}</small></div><div><strong>{video.library}</strong><small>{video.librarySub}</small></div></div>
      </>}
    </div>
    <div className="flow-caption"><span>{t.projectDiagrams[kind].caption}</span><MotionToggle paused={motion.paused} toggle={motion.toggle} /></div>
  </div>;
}
