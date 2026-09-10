// Public descriptions only. Private workbench code, data and configuration stay in their source repositories.
export const enFeatured = {
  research: {
    label: "02 / SELECTED RESEARCH", meta: "TWO PAPERS. ONE THREAD: EVIDENCE.",
    title: ["Better answers.", "Stronger evidence."],
    description: "Research I’ve co-authored on financial AI: how to find the right evidence, reason across sources, and adapt to real data.",
    author: "Chaolong Jiang · co-author", accepted: "ACCEPTED", paper: "Read paper", venue: "Conference", figure: "Open full architecture", figureNote: "Architecture figure from the paper", award: "Best Paper", bridge: "Explore the research workbench",
    papers: [
      {
        name: "FinSAgent", venue: "IJCAI 2026 · FinLLM Workshop", awardVenue: "FinLLM Workshop · IJCAI 2026",
        title: "FinSAgent: Corpus-Aligned Multi-Agent RAG Framework for Evidence-Grounded SEC Filing Question Answering",
        headline: "From a matching passage to supporting evidence.",
        description: "Specialized agents investigate SEC filings from complementary perspectives. A local corpus view guides question decomposition; multi-path retrieval and feature-gated reranking help distinguish valid evidence from merely similar text.",
        points: ["10-K structure guides agent specialization", "Corpus-aware planning before deeper retrieval", "Evidence validity informs reranking"],
        alt: "FinSAgent architecture: specialized agents, corpus-aware decomposition, multi-path retrieval, feature-gated reranking and answer synthesis.",
      },
      {
        name: "VeritasFi", venue: "WWW 2026 · Industry Track", awardVenue: "Agentic AI in Financial Services · AAAI 2026",
        title: "VeritasFi: An Adaptable, Multi-tiered RAG Framework for Multi-modal Financial Question Answering",
        headline: "One question. Multiple sources of truth.",
        description: "A financial QA framework combining multimodal documents, live data tools and an expert-curated memory bank. Domain-to-entity reranker training supports adaptation from general financial knowledge to company-specific data.",
        points: ["Text, tables and figures in a unified pipeline", "Documents, tools and memory in parallel", "Two-stage reranker adaptation"],
        alt: "VeritasFi architecture: query preprocessing branches into document retrieval, memory lookup and tool use, then merges into a grounded answer.",
      },
    ],
  },
  pe: {
    kicker: "FEATURED SYSTEM / PRIVATE EQUITY RESEARCH", name: "PE Workbench", type: "PROJECT CASE STUDY",
    title: ["From scattered documents", "to traceable research."],
    description: "An agent workspace for private equity research. Bring company materials into a project, investigate with tools, inspect the evidence behind a claim, and carry findings into research notes and versioned memos.",
    architecture: "EXPLORE THE ARCHITECTURE", hint: "Select a layer to see how it works.",
    foundation: "Built on Pi Agent Harness and Pi Web, extended with a PE research toolset and document pipeline.",
    output: "CONNECTS TO", related: "Related financial AI research", stack: ["Next.js / React", "TypeScript", "Pi SDK", "Python", "SQLite", "SSE"],
    layers: [
      { name: "Research workspace", label: "INTERFACE", title: "The source is one click away.", description: "The browser brings projects, agent sessions and source inspection together. Structured tool results become native visual components alongside the written analysis.", points: ["Project-bound uploads and research sessions", "PDF page previews and spreadsheet cell inspection", "Schema-driven charts, comparisons and research briefs"], tech: ["Next.js / React", "Generative UI", "Source citations"], output: "Questions and files → a project-scoped session" },
      { name: "Agent runtime", label: "ORCHESTRATION", title: "A research agent with a working context.", description: "The web server creates Pi SDK sessions with the PE system prompt, registered tools and research skills. Session events stream back to the browser as the agent works.", points: ["PE tools and skills registered through the extension API", "Project context and persistent conversation state", "Provider integration and streaming session updates"], tech: ["Pi SDK", "pe-boot", "SSE"], output: "Research question → tool calls → streamed response" },
      { name: "Evidence & research tools", label: "DOMAIN LOGIC", title: "Every important claim needs a trail.", description: "Dataset search returns evidence with citations. Source-detail tools inspect decisive passages, values and formulas; additional tools preserve research notes and compare memo versions.", points: ["Search across document chunks, metric facts and cells", "Resolve citations to original pages and cell ranges", "Save research notes, generate memos and compare history"], tech: ["Evidence retrieval", "Source detail", "Versioned memos"], output: "Retrieved evidence → verified context → research artifacts" },
      { name: "Document pipeline", label: "DATA FOUNDATION", title: "Keep the context with the content.", description: "A Python ingestion worker classifies uploaded company materials and writes structured evidence to a project-specific SQLite collection. Original files and source locations remain available for inspection.", points: ["Project registry binds uploads to the correct dataset", "Documents, chunks, metrics and source locations", "Original materials alongside generated artifacts"], tech: ["Python", "SQLite", "Document adapters"], output: "Uploaded materials → searchable, source-linked evidence" },
    ],
  },
};

export const zhFeatured: typeof enFeatured = {
  research: {
    label: "02 / 研究论文", meta: "两篇论文，同一个关键词：证据。",
    title: ["让回答更可靠，", "让证据更扎实。"],
    description: "我参与共同署名的金融 AI 研究：如何找到有效证据、结合多源信息，并适配真实业务数据。",
    author: "蒋朝龙（Chaolong Jiang）· 共同作者", accepted: "已接收", paper: "阅读论文", venue: "会议主页", figure: "查看完整架构图", figureNote: "论文原始架构图", award: "最佳论文", bridge: "探索投研工作台",
    papers: [
      {
        name: "FinSAgent", venue: "IJCAI 2026 · FinLLM 研讨会", awardVenue: "IJCAI 2026 · FinLLM 研讨会",
        title: "FinSAgent: Corpus-Aligned Multi-Agent RAG Framework for Evidence-Grounded SEC Filing Question Answering",
        headline: "从语义相似，走向真正支持结论的证据。",
        description: "多个专业智能体从不同视角调查 SEC 文件，利用本地语料概览指导问题拆解，再通过多路检索与特征门控重排序，区分有效证据和仅仅语义相似的文本。",
        points: ["以 10-K 文件结构指导智能体分工", "基于真实语料规划，再深入检索", "将证据有效性纳入重排序"],
        alt: "FinSAgent 架构：专业智能体、语料感知问题拆解、多路检索、特征门控重排序与答案合成。",
      },
      {
        name: "VeritasFi", venue: "WWW 2026 · 产业方向", awardVenue: "AAAI 2026 · 金融服务智能体研讨会",
        title: "VeritasFi: An Adaptable, Multi-tiered RAG Framework for Multi-modal Financial Question Answering",
        headline: "一个问题，连接多种信息来源。",
        description: "将多模态文档、实时数据工具与专家知识记忆库结合到金融问答中，通过“领域到实体”的两阶段重排序训练，让通用金融知识快速适配企业自身的数据。",
        points: ["统一处理文本、表格与图像", "文档、工具与记忆库并行检索", "两阶段训练实现企业数据适配"],
        alt: "VeritasFi 架构：问题预处理后并行进行文档检索、记忆库查询和工具调用，最终汇总为有证据支撑的回答。",
      },
    ],
  },
  pe: {
    kicker: "重点项目 / 私募投研", name: "PE Workbench", type: "项目案例",
    title: ["从散落的资料，", "到可追溯的研究。"],
    description: "面向私募投研的智能体工作台。将公司资料纳入项目，用工具展开调查，查看结论背后的原始证据，再沉淀为研究笔记与可追踪版本的投研备忘录。",
    architecture: "探索系统架构", hint: "选择一个层次，查看它如何工作。",
    foundation: "基于 Pi Agent Harness 与 Pi Web，扩展私募投研工具集和文档处理管线。",
    output: "衔接关系", related: "相关金融 AI 研究", stack: ["Next.js / React", "TypeScript", "Pi SDK", "Python", "SQLite", "SSE"],
    layers: [
      { name: "投研工作空间", label: "交互层", title: "结论与原文，只隔一次点击。", description: "浏览器将项目、智能体会话和证据查看组合到一起。结构化工具结果渲染为原生可视化组件，与文字分析共同呈现。", points: ["绑定项目的资料上传与研究会话", "PDF 页码预览与表格单元格查看", "基于结构约定的图表、对比与研究简报"], tech: ["Next.js / React", "生成式界面", "来源引用"], output: "问题与文件 → 对应项目的研究会话" },
      { name: "智能体运行时", label: "编排层", title: "让智能体带着上下文工作。", description: "Web 服务通过 Pi SDK 创建会话，注入投研提示词、注册工具与研究技能，工作过程中的会话事件持续流式传回浏览器。", points: ["通过扩展 API 注册投研工具和技能", "项目上下文与持久化对话状态", "模型提供方接入与流式会话更新"], tech: ["Pi SDK", "pe-boot", "SSE"], output: "研究问题 → 工具调用 → 流式回答" },
      { name: "证据与投研工具", label: "领域层", title: "重要结论，都有迹可循。", description: "数据集检索返回带有引用的证据，来源详情工具进一步核对关键段落、数值与公式；研究工具负责保存笔记并对比备忘录版本。", points: ["检索文档片段、指标事实与表格单元格", "将引用定位到原始页码与单元格范围", "保存研究笔记、生成备忘录并对比历史"], tech: ["证据检索", "原文核验", "版本化备忘录"], output: "检索证据 → 核验上下文 → 研究产物" },
      { name: "文档处理管线", label: "数据层", title: "保留内容，也保留它的上下文。", description: "Python 入库任务对上传的公司材料分类，将结构化证据写入项目专属的 SQLite 数据库，同时保留原始文件和定位信息，方便回查。", points: ["通过项目注册表将上传绑定到对应数据集", "存储文档、片段、指标与来源位置", "保留原始材料及生成的研究产物"], tech: ["Python", "SQLite", "文档适配器"], output: "上传资料 → 可检索、可定位的证据" },
    ],
  },
};
