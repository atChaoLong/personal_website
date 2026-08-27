"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Braces, Database, Github, Mail, MapPin, Network, Radio, Terminal, Workflow } from "lucide-react";
import CursorGlow from "./CursorGlow";
import NeuralNetwork from "./NeuralNetwork";
import ParticlesBackground from "./ParticlesBackground";
import PixelField from "./PixelField";
import PixelText from "./PixelText";

const projects = [
  { index: "01", title: "FinsAgent", kicker: "AGENTIC RAG / FINANCE", description: "面向金融场景的 Agentic RAG 智能问答系统，让任务规划、检索、工具调用与结果验证形成完整闭环。", stack: ["LangGraph", "FastAPI", "Vector DB", "Reranker"], role: "AI SYSTEM DESIGN · FULL-STACK", flow: "PLAN → RETRIEVE → ACT → VERIFY" },
  { index: "02", title: "Real-time ASR", kicker: "REAL-TIME AI / RTC", description: "多人会议语音识别、翻译与摘要系统，贯通音频采集、实时转写、翻译、摘要和低延迟回传。", stack: ["AgoraRTC", "WebSocket", "FunASR", "FastAPI"], role: "REAL-TIME PIPELINE · BACKEND", flow: "AUDIO → ASR → TRANSLATE → RETURN" },
  { index: "03", title: "Karavideo", kicker: "MULTIMODAL GENERATION", description: "多模态 AI 内容生产平台，覆盖文生视频、图生视频、视频标签、水印处理与内容广场体验。", stack: ["Next.js", "AI APIs", "SEO", "Video"], role: "PRODUCT · FULL-STACK", flow: "TEXT / IMAGE → VIDEO" },
  { index: "04", title: "K12 AI Stack", kicker: "PRODUCT ENGINEERING / 0→1", description: "独立负责 K12 产品体系，从 Web、小程序到后台、数据库和服务器部署，持续支撑真实教学业务。", stack: ["React", "Node.js", "Mini Program", "Supabase"], role: "0→1 · PRODUCT OWNER", flow: "WEB + MINI PROGRAM + ADMIN" },
];

const skillGroups = [
  { number: "01", name: "AI / AGENTS", icon: Network, skills: ["LangGraph", "LangChain", "RAG", "Tool Use"] },
  { number: "02", name: "AI / ML", icon: Workflow, skills: ["PyTorch", "Transformer", "BERT", "YOLO"] },
  { number: "03", name: "FRONTEND", icon: Braces, skills: ["TypeScript", "React", "Next.js", "Vue"] },
  { number: "04", name: "BACKEND", icon: Terminal, skills: ["Python", "FastAPI", "Flask", "Node.js"] },
  { number: "05", name: "DATA", icon: Database, skills: ["MySQL", "Elasticsearch", "Supabase", "Redis"] },
  { number: "06", name: "INFRASTRUCTURE", icon: Radio, skills: ["Docker", "Linux", "CI/CD", "Cloud"] },
];

const reveal = { hidden: { opacity: 0, y: 18, filter: "blur(5px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.48, ease: "easeOut" as const } } };

export default function Portfolio() {
  return (
    <main>
      <div className="noise" aria-hidden="true" /><CursorGlow />
      <section className="hero" id="top">
        <ParticlesBackground /><NeuralNetwork />
        <nav className="nav" aria-label="主导航">
          <a href="#top" className="brand" aria-label="JCL.AI 首页">JCL<span>.AI</span></a>
          <div className="nav-links"><a href="#profile">PROFILE</a><a href="#stack">STACK</a><a href="#work">WORK</a><a href="#experience">LOG</a></div>
          <a className="nav-cta" href="mailto:atchaolong@gmail.com">CONTACT <ArrowUpRight size={13} /></a>
        </nav>
        <div className="hero-content">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> SYSTEM ONLINE · CHENGDU, CN</div>
            <h1>JCL<span>.AI</span></h1><div className="hero-role">AI FULL-STACK ENGINEER</div>
            <p className="hero-statement">Building intelligent systems<br />that move from idea to production.</p>
            <div className="tech-tags"><span>[ AI ]</span><span>[ FULL-STACK ]</span><span>[ SYSTEMS ]</span></div>
            <div className="hero-actions"><a className="primary-btn" href="#work">VIEW PROJECTS <ArrowDown size={15} /></a><a className="ghost-btn" href="mailto:atchaolong@gmail.com">CONTACT ME <ArrowUpRight size={15} /></a></div>
          </div>
          <aside className="core-readout" aria-label="AI 系统状态">
            <div className="readout-head"><span>NEURAL_CORE</span><span>LIVE</span></div>
            <div className="readout-row"><span>01</span><b>AGENTIC_RAG</b><i>READY</i></div><div className="readout-row"><span>02</span><b>MULTIMODAL_AI</b><i>READY</i></div><div className="readout-row"><span>03</span><b>REALTIME_SYSTEMS</b><i>READY</i></div>
            <div className="readout-signal"><span /><span /><span /><span /><span /><span /></div><p>Signals travel across the network.<br />Move, hover, and click to interact.</p>
          </aside>
        </div>
        <div className="hero-footer"><span><MapPin size={13} /> 30.67° N · 104.06° E</span><span>SCROLL TO EXPLORE</span><span className="hero-index">SYS / 001</span></div>
      </section>
      <div className="signal-strip" aria-hidden="true"><span>AGENTIC SYSTEMS</span><i /><span>MULTIMODAL AI</span><i /><span>REAL-TIME INFRA</span><i /><span>PRODUCT ENGINEERING</span></div>

      <section className="section profile-section" id="profile">
        <motion.div className="section-label" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}><span>01 / ENGINEER PROFILE</span><span>IDENTITY &amp; APPROACH</span></motion.div>
        <div className="profile-grid"><motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}><h2>I turn AI capability<br />into <em>working systems.</em></h2></motion.div><motion.div className="profile-copy" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}><p>我是蒋朝龙，一名 AI 全栈工程师。我关注的不只是模型能做什么，更在意如何把模型、数据、工具、界面与基础设施组合成真正可用的产品。</p><p>从 Agentic RAG、实时语音到多模态内容生成，我在抽象智能与真实工程之间搭桥，让想法能够被部署、被验证，也被用户使用。</p><div className="profile-meta"><span>AI</span><span>FULL-STACK</span><span>SYSTEMS</span><span>PRODUCT</span></div></motion.div></div>
      </section>

      <section className="systems-section" id="systems">
        <div className="system-visual" aria-hidden="true"><div className="system-lines"><span /><span /><span /><span /></div><div className="system-core"><Network size={29} /><b>AI CORE</b><small>ORCHESTRATION LAYER</small></div><div className="system-node node-a">CONTEXT</div><div className="system-node node-b">TOOLS</div><div className="system-node node-c">STATE</div><div className="system-node node-d">STREAM</div></div>
        <motion.div className="system-copy" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}><span className="section-kicker">SYSTEMS THINKING</span><h2>The model is<br /><em>only one layer.</em></h2><p>真正决定 AI 产品质量的，是上下文、检索、工具、状态、流式输出与工程基础设施如何协同。我的工作，是让每一层都清晰、可靠、可演进。</p><div className="system-tags"><span>CONTEXT</span><span>RETRIEVAL</span><span>TOOLS</span><span>STATE</span><span>STREAMING</span></div></motion.div>
      </section>

      <section className="section" id="stack"><div className="section-label"><span>02 / TECHNICAL STACK</span><span>CAPABILITY MAP</span></div><div className="section-heading"><h2>Built across<br /><em>the entire stack.</em></h2><p>全栈不是“什么都懂一点”，而是能把一个想法从模型与 API，一路推进到用户手中。</p></div><div className="skills">{skillGroups.map(({ number, name, icon: Icon, skills }, index) => <motion.article className="skill" key={name} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}><span className="skill-num">{number}</span><Icon size={18} /><h3>{name}</h3><div>{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></motion.article>)}</div></section>

      <section className="work-section" id="work"><div className="section work-inner"><div className="section-label"><span>03 / SELECTED WORK</span><span>2024—2026</span></div><div className="section-heading"><h2>Systems I&apos;ve<br /><em>built &amp; shipped.</em></h2><p>从模型能力到产品界面：关注它能否真正运行、持续迭代，并解决一个具体问题。</p></div><div className="projects">{projects.map((project) => <motion.article className="project" key={project.title} variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}><div className="project-index">{project.index}</div><div className="project-main"><span className="project-kicker">{project.kicker}</span><h3>{project.title}</h3><p>{project.description}</p><div className="stack">{project.stack.map((item) => <span key={item}>{item}</span>)}</div></div><div className="project-side"><span>ROLE</span><b>{project.role}</b><span>ARCHITECTURE</span><b>{project.flow}</b><ArrowUpRight className="project-arrow" size={23} /></div></motion.article>)}</div></div></section>

      <section className="section experience" id="experience"><div className="section-label"><span>04 / SYSTEM LOG</span><span>ENGINEERING HISTORY</span></div><div className="section-heading"><h2>From code<br />to <em>systems.</em></h2><p>持续从工程实现走向系统设计，也持续把新的 AI 能力带进可用产品。</p></div><div className="timeline-list"><div><time>2026</time><span>03</span><b>Agentic Systems</b><p>聚焦 Agent、RAG、多模态与生产级 AI 产品。</p></div><div><time>2025</time><span>02</span><b>AI Product / Full-Stack</b><p>金融 RAG、实时 ASR、AI 视频与招聘项目持续落地。</p></div><div><time>2024</time><span>01</span><b>Software → Artificial Intelligence</b><p>从坚实的软件工程基础进入 AI 工程方向。</p></div></div></section>

      <footer id="contact"><div className="footer-network" aria-hidden="true"><span /><i /><i /><i /><i /></div><span className="section-kicker">OPEN TO COLLABORATION</span><h2>Let&apos;s build something<br /><em>intelligent.</em></h2><p>Have an ambitious product, an AI system, or a difficult engineering problem?</p><div className="footer-actions"><a className="primary-btn" href="mailto:atchaolong@gmail.com"><Mail size={15} /> START A CONVERSATION</a><a className="ghost-btn" href="https://github.com/atchaolong" target="_blank" rel="noreferrer"><Github size={15} /> GITHUB</a></div><div className="footer-bottom"><span>© 2026 JIANG CHAOLONG</span><a href="mailto:atchaolong@gmail.com">ATCHAOLONG@GMAIL.COM</a><a href="#top">BACK TO CORE ↑</a></div></footer>

      <footer className="signature-footer" id="signature"><PixelField /><PixelText text="ATCHAOLONG" className="signature-text" /></footer>
    </main>
  );
}
