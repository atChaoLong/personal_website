export type SystemProject = {
  title: string; kicker: string; description: string; stack: string[]; role: string;
  steps: string[]; parallel: boolean; architecture?: "finance" | "speech" | "video";
  flow?: string; engineering?: { title: string; description: string }[]; note?: string;
};

export const enSystemProjects: SystemProject[] = [
  {
    title: "FinSAgent", kicker: "MULTI-AGENT FINANCIAL RESEARCH", architecture: "finance",
    description: "A financial research system that routes questions to specialized agents, runs their investigations concurrently, and synthesizes evidence and tool results into an answer. A two-phase streaming path delivers a preliminary draft while deeper analysis continues.",
    stack: ["LangGraph", "FastAPI / SSE", "Chroma / FAISS", "BM25", "Reranker"], role: "AI SYSTEM DESIGN · FULL-STACK",
    steps: ["ROUTE", "INVESTIGATE", "SYNTHESIZE"], parallel: false,
    flow: "Question → routing → selected agents in parallel → synthesis. Each agent can decompose queries, retrieve evidence and call tools.",
    engineering: [
      { title: "Specialized orchestration", description: "LangGraph coordinates general, market, company, quantitative and legal-risk subgraphs. Selected agents run concurrently and report completion independently." },
      { title: "Shared evidence layer", description: "Chroma-backed collections, FAISS dense retrieval and BM25 feed the reranker. PageIndex retrieval and chunk-risk calibration are configurable extensions to the evidence pipeline." },
      { title: "Progressive delivery", description: "FastAPI exposes session-based chat and SSE events. The two-phase path runs a general draft alongside the multi-agent workflow, then delivers the synthesized result." },
    ],
    note: "This schematic follows the current implementation. The paper’s architecture is shown separately in Research.",
  },
  {
    title: "Real-time ASR", kicker: "MULTI-SPEAKER MEETING INTELLIGENCE", architecture: "speech",
    description: "A meeting backend that receives Agora audio by speaker, segments speech with Silero VAD and transcribes it with Qwen3-ASR. Transcripts feed optional translation and contextual summaries, with ordered delivery and persistent meeting history.",
    stack: ["Agora RTC", "Silero VAD", "Qwen3-ASR / vLLM", "FastAPI", "SQLite"], role: "REAL-TIME PIPELINE · BACKEND",
    steps: ["AUDIO", "SEGMENT", "TRANSCRIBE", "DELIVER"], parallel: false,
    flow: "Per-speaker PCM → VAD → ASR → translation / summary branches → Agora delivery and SQLite storage. Summary and finalization status are also available over HTTP/SSE.",
    engineering: [
      { title: "Speaker-aware audio pipeline", description: "Each Agora UID has an ASR client and audio buffer. Silero VAD segments 16 kHz PCM with pre-roll before sending speech to an OpenAI-compatible Qwen3-ASR endpoint." },
      { title: "Independent language workflows", description: "Per-utterance translation is opt-in. Summaries aggregate speaker context and support content-triggered, requested and final meeting summaries; multilingual results retain their delivery status." },
      { title: "Delivery and meeting lifecycle", description: "A paced sender preserves message chunk order over Agora. SQLite stores translations and versioned summaries. Closing a channel starts an asynchronous finalization job, observable through polling or SSE." },
    ],
    note: "The diagram shows the modular Qwen3-ASR path. A legacy FunASR WebSocket entry point also remains in the repository.",
  },
  {
    title: "KaraVideo", kicker: "CREATIVE AI / MULTI-MODEL PLATFORM", architecture: "video",
    description: "A multilingual AI video platform connecting text, image and template workflows to model-specific providers. It brings generation, asynchronous task tracking, subscription credits and media delivery into a complete creation experience.",
    stack: ["Next.js / React", "TypeScript", "Supabase", "Cloudflare R2", "Stripe", "FFmpeg", "next-intl"], role: "PRODUCT · FULL-STACK",
    steps: ["CREATE", "VALIDATE", "GENERATE", "DELIVER"], parallel: false,
    flow: "Creation request → authentication, parameter validation and credits → task factory → selected provider. Status checks or callbacks update task records; Supabase Realtime delivers changes to the interface. Media jobs handle storage and post-processing.",
    engineering: [
      { title: "Model-specific tasks behind a shared interface", description: "Generation services cover text, images, templates, consistent characters and video tools. Factories choose a model adapter; a shared task base standardizes execution and status checking while allowing provider-specific behavior." },
      { title: "Asynchronous task lifecycle", description: "Supabase PostgreSQL separates task definitions from execution statuses and external task IDs. Scheduled checks and provider callbacks reconcile results; the creation interface subscribes to status updates through Supabase Realtime." },
      { title: "Subscriptions and credit accounting", description: "Server routes validate the session and model parameters before deducting credits. Failure paths support credit refunds, while Stripe webhooks synchronize subscription changes with the application database." },
      { title: "Media delivery and discovery", description: "Scheduled jobs transfer generated media to Cloudflare R2 and use FFmpeg for thumbnails and watermark processing. Personal creations, publishing, favorites and the moderated Explore gallery sit alongside localized pages powered by next-intl." },
    ],
    note: "Each task uses the adapter for its selected external model service. Scheduled media jobs handle storage and post-processing separately from generation.",
  },
];

export const zhSystemProjects: SystemProject[] = [
  {
    title: "FinSAgent", kicker: "多智能体金融研究", architecture: "finance",
    description: "将金融问题路由给专业智能体，并行展开调查，再综合证据与工具结果生成回答。两阶段流式链路让初步答案先到达，同时继续完成更深入的分析。",
    stack: ["LangGraph", "FastAPI / SSE", "Chroma / FAISS", "BM25", "重排序"], role: "AI 系统设计 · 全栈开发",
    steps: ["路由", "调查", "汇总"], parallel: false,
    flow: "问题 → 路由调度 → 被选中的智能体并行调查 → 汇总。各智能体可拆解问题、检索证据并调用工具。",
    engineering: [
      { title: "专业智能体编排", description: "LangGraph 协调通用、市场、公司、量化与法律风险五类子图。被选中的智能体并发执行，各自完成时独立推送进度。" },
      { title: "共享证据层", description: "Chroma 管理数据集合，FAISS 稠密检索与 BM25 召回候选，再交给重排序器。PageIndex 检索与片段风险校准作为可配置能力接入证据管线。" },
      { title: "渐进式交付", description: "FastAPI 提供多会话对话与 SSE 事件。两阶段链路让通用智能体的初步答案与多智能体工作流同时推进，最后交付汇总结果。" },
    ],
    note: "此图对应当前代码实现；论文中的研究架构另见“研究”板块。",
  },
  {
    title: "实时语音识别", kicker: "多说话人会议智能", architecture: "speech",
    description: "按说话人接收 Agora 音频，经 Silero VAD 分段后交给 Qwen3-ASR 转写。识别文本分别进入可选翻译与上下文摘要链路，支持有序回传与会议历史持久化。",
    stack: ["Agora RTC", "Silero VAD", "Qwen3-ASR / vLLM", "FastAPI", "SQLite"], role: "实时处理管线 · 后端开发",
    steps: ["音频", "分段", "转写", "交付"], parallel: false,
    flow: "各说话人的 PCM → VAD → ASR → 翻译 / 摘要分支 → Agora 回传与 SQLite 存储。摘要和会议收尾状态也可通过 HTTP/SSE 获取。",
    engineering: [
      { title: "按说话人处理音频", description: "每个 Agora UID 对应独立的 ASR 客户端与音频缓冲。Silero VAD 对 16 kHz PCM 做语音分段并保留预录音，再调用兼容 OpenAI 接口的 Qwen3-ASR 服务。" },
      { title: "独立的语言处理链路", description: "逐句翻译按需开启；摘要累积说话人上下文，支持内容触发、主动请求和会议结束时的总结，多语言结果保留各自的交付状态。" },
      { title: "消息交付与会议生命周期", description: "发送队列控制节奏，保持 Agora 消息分块的顺序。SQLite 保存翻译与带版本的摘要，关闭频道后启动异步收尾任务，可通过轮询或 SSE 跟踪。" },
    ],
    note: "图中展示模块化的 Qwen3-ASR 链路；仓库中也保留了旧版 FunASR WebSocket 入口。",
  },
  {
    title: "KaraVideo", kicker: "创作型 AI / 多模型平台", architecture: "video",
    description: "面向多语言用户的 AI 视频平台，将文本、图片与模板等创作方式接入不同模型服务，串联视频生成、异步任务跟踪、订阅积分与媒体交付，形成完整的创作体验。",
    stack: ["Next.js / React", "TypeScript", "Supabase", "Cloudflare R2", "Stripe", "FFmpeg", "next-intl"], role: "产品设计 · 全栈开发",
    steps: ["创作", "校验", "生成", "交付"], parallel: false,
    flow: "创作请求 → 身份、参数与积分校验 → 任务工厂 → 选定的模型服务。状态检查或回调更新任务记录，再由 Supabase Realtime 同步到界面；媒体任务负责存储和后处理。",
    engineering: [
      { title: "统一接口下的模型适配", description: "生成服务覆盖文生视频、图生视频、模板、角色一致性与视频工具。工厂按模型选择任务适配器，共享任务基类统一执行与状态查询，同时保留各提供方的处理差异。" },
      { title: "异步任务生命周期", description: "Supabase PostgreSQL 将任务定义与执行状态分表保存，并关联外部任务 ID。定时查询与提供方回调同步结果，创作界面通过 Supabase Realtime 订阅状态变化。" },
      { title: "订阅与积分结算", description: "服务端先校验会话与模型参数，再执行积分扣减；失败路径支持积分返还。Stripe Webhook 将订阅变化同步到应用数据库。" },
      { title: "媒体交付与内容发现", description: "定时任务将生成媒体转存到 Cloudflare R2，并使用 FFmpeg 处理缩略图与水印。个人作品、发布、收藏和带审核的探索广场，与 next-intl 驱动的多语言页面共同构成产品层。" },
    ],
    note: "每个任务使用选定外部模型服务的适配器，定时媒体任务另行负责存储与后处理。",
  },
];

export const enProjectDiagrams = {
  video: { label: "KaraVideo generation and delivery architecture", input: "Text · images · templates", inputSub: "Next.js creation workspace / next-intl", gate: "Auth · parameters · credits", gateSub: "Server validation / subscription balance", routing: "TASK FACTORY · SELECTED MODEL ADAPTER", providers: ["Kling", "Runway", "Veo", "Wan"], providerNote: "Provider-specific execution & status checks", state: "Supabase task records", stateSub: "Polling / callbacks → Realtime UI updates", delivery: "R2 + FFmpeg", deliverySub: "Media storage & post-processing", library: "Library / Explore", librarySub: "Save · publish · discover", caption: "ASYNCHRONOUS GENERATION · MEDIA DELIVERY" },
  finance: { label: "Financial research orchestration", route: "Question → orchestrator", routeSub: "LangGraph routing", parallel: "SELECTED AGENTS · PARALLEL INVESTIGATION", agents: ["General", "Market", "Company", "Quant", "Legal risk"], resources: "SHARED EVIDENCE & TOOLS", tools: ["FAISS + BM25", "Reranker", "Financial tools"], finish: "Synthesis → answer", finishSub: "FastAPI / SSE", caption: "PER-AGENT PROGRESS · TWO-PHASE RESPONSE" },
  speech: { label: "Meeting audio processing and delivery", input: "Agora audio · per speaker", inputSub: "UID → PCM buffer", segment: "Silero VAD → Qwen3-ASR", segmentSub: "Speech segments → transcript", branches: ["Translation", "Contextual summary"], branchNotes: ["Opt-in · per utterance", "Buffered · requested · final"], finish: "Agora delivery + SQLite", finishSub: "Summary & job status · HTTP / SSE", caption: "PARALLEL LANGUAGE WORKFLOWS" },
};
export const zhProjectDiagrams: typeof enProjectDiagrams = {
  video: { label: "KaraVideo 视频生成与交付架构", input: "文本 · 图片 · 模板", inputSub: "Next.js 创作空间 / next-intl", gate: "身份 · 参数 · 积分", gateSub: "服务端校验 / 订阅余额", routing: "任务工厂 · 选择对应模型适配器", providers: ["Kling", "Runway", "Veo", "Wan"], providerNote: "各提供方的执行与状态查询", state: "Supabase 任务记录", stateSub: "轮询 / 回调 → Realtime 界面更新", delivery: "R2 + FFmpeg", deliverySub: "媒体存储与后处理", library: "作品库 / 探索广场", librarySub: "保存 · 发布 · 发现", caption: "异步生成 · 媒体交付" },
  finance: { label: "金融研究智能体编排", route: "问题 → 路由调度", routeSub: "LangGraph 编排", parallel: "按需选择智能体 · 并行调查", agents: ["通用", "市场", "公司", "量化", "法律风险"], resources: "共享证据与工具", tools: ["FAISS + BM25", "重排序", "金融工具"], finish: "汇总 → 回答", finishSub: "FastAPI / SSE", caption: "独立进度推送 · 两阶段回答" },
  speech: { label: "会议音频处理与结果交付", input: "Agora 音频 · 按说话人接收", inputSub: "UID → PCM 缓冲", segment: "Silero VAD → Qwen3-ASR", segmentSub: "语音分段 → 转写文本", branches: ["翻译", "上下文摘要"], branchNotes: ["按需开启 · 逐句处理", "内容触发 · 请求 · 会后"], finish: "Agora 回传 + SQLite", finishSub: "摘要与任务状态 · HTTP / SSE", caption: "并行的语言处理链路" },
};
