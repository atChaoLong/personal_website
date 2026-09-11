type Fragment = {
  kind: "agent" | "model" | "inference" | "system" | "code" | "equation";
  title: string;
  en: string;
  zh: string;
};

// Learning subjects, not claims about the portfolio owner's project stack.
// One catalog keeps both languages and their orbital phases aligned.
const fragments: Fragment[] = [
  { kind: "agent", title: "MCP", en: "model context protocol", zh: "模型上下文协议" },
  { kind: "agent", title: "A2A", en: "agent interoperability", zh: "智能体互操作协议" },
  { kind: "agent", title: "Agent Harness", en: "long-running agent systems", zh: "长任务智能体运行框架" },
  { kind: "agent", title: "GraphRAG", en: "knowledge graphs + retrieval", zh: "知识图谱与检索增强" },
  { kind: "model", title: "Sparse MoE", en: "mixture of experts", zh: "稀疏混合专家架构" },
  { kind: "inference", title: "P/D Disaggregation", en: "prefill / decode separation", zh: "预填充与解码分离" },
  { kind: "agent", title: "Context Engineering", en: "curate the context", zh: "上下文工程" },
  { kind: "agent", title: "Agent Skills", en: "progressive disclosure", zh: "按需加载智能体能力" },
  { kind: "agent", title: "Multi-Agent Systems", en: "specialists + orchestration", zh: "多智能体协作与编排" },
  { kind: "system", title: "Durable Execution", en: "checkpoint / resume", zh: "持久执行与断点恢复" },
  { kind: "agent", title: "Agent Memory", en: "knowledge across sessions", zh: "跨会话的长期记忆" },
  { kind: "agent", title: "Tool Search", en: "discover tools on demand", zh: "按需发现与加载工具" },
  { kind: "agent", title: "Agentic RAG", en: "reason / retrieve / refine", zh: "推理驱动的检索增强" },
  { kind: "system", title: "Hybrid Search", en: "sparse + dense retrieval", zh: "稀疏与稠密混合检索" },
  { kind: "model", title: "Late Interaction", en: "token-level retrieval", zh: "细粒度词元交互检索" },
  { kind: "model", title: "Reranking", en: "cross-encoder relevance", zh: "交叉编码器相关性重排" },
  { kind: "model", title: "MLA", en: "multi-head latent attention", zh: "多头潜在注意力" },
  { kind: "model", title: "Mamba-2", en: "state space duality", zh: "状态空间对偶架构" },
  { kind: "model", title: "Hybrid SSM", en: "attention + state space", zh: "注意力与状态空间混合" },
  { kind: "model", title: "Diffusion Transformer", en: "diffusion + transformers", zh: "扩散 Transformer 架构" },
  { kind: "model", title: "Flow Matching", en: "learn continuous flows", zh: "连续生成流匹配" },
  { kind: "model", title: "VLA", en: "vision / language / action", zh: "视觉·语言·动作模型" },
  { kind: "model", title: "World Models", en: "learn environment dynamics", zh: "学习环境的动态规律" },
  { kind: "model", title: "Multimodal Reasoning", en: "understanding across modalities", zh: "跨模态理解与推理" },
  { kind: "model", title: "Test-Time Compute", en: "inference-time reasoning", zh: "推理时计算扩展" },
  { kind: "model", title: "RLVR", en: "verifiable rewards", zh: "可验证奖励强化学习" },
  { kind: "model", title: "GRPO", en: "group-relative optimization", zh: "组相对策略优化" },
  { kind: "model", title: "DPO", en: "direct preference optimization", zh: "直接偏好优化" },
  { kind: "model", title: "Distillation", en: "transfer model knowledge", zh: "模型知识蒸馏" },
  { kind: "model", title: "LoRA", en: "low-rank adaptation", zh: "低秩适配微调" },
  { kind: "inference", title: "Speculative Decoding", en: "draft / verify / accelerate", zh: "草拟·验证·加速解码" },
  { kind: "inference", title: "PagedAttention", en: "paged KV memory", zh: "分页式注意力缓存" },
  { kind: "inference", title: "FlashAttention", en: "IO-aware exact attention", zh: "面向 IO 优化的精确注意力" },
  { kind: "inference", title: "Prefix Caching", en: "reuse shared context", zh: "复用公共前缀上下文" },
  { kind: "inference", title: "KV-Aware Routing", en: "route toward cached state", zh: "感知 KV 缓存的请求路由" },
  { kind: "inference", title: "Continuous Batching", en: "dynamic request scheduling", zh: "连续批处理与动态调度" },
  { kind: "inference", title: "vLLM", en: "high-throughput serving", zh: "高吞吐大模型推理服务" },
  { kind: "inference", title: "SGLang", en: "structured generation runtime", zh: "结构化生成与推理运行时" },
  { kind: "system", title: "Ray Serve", en: "distributed model serving", zh: "分布式模型服务" },
  { kind: "system", title: "Event-Driven Systems", en: "events / streams / reactions", zh: "事件驱动的系统架构" },
  { kind: "system", title: "Temporal", en: "durable workflow orchestration", zh: "持久工作流编排" },
  { kind: "system", title: "OpenTelemetry", en: "traces / metrics / logs", zh: "链路·指标·日志可观测性" },
  { kind: "agent", title: "LangGraph", en: "stateful agent orchestration", zh: "有状态智能体编排" },
  { kind: "agent", title: "Deep Agents", en: "planning / files / subagents", zh: "规划·文件系统·子智能体" },
  { kind: "code", title: "while curious:", en: "    learn()", zh: "    learn()" },
  { kind: "equation", title: "Attention(Q, K, V)", en: "softmax(QKᵀ / √dₖ)V", zh: "softmax(QKᵀ / √dₖ)V" },
  { kind: "equation", title: "θ ← θ − η∇L(θ)", en: "one step further", zh: "再向前一步" },
  { kind: "equation", title: "∫ knowledge · dt", en: "the pursuit continues", zh: "探索仍在继续" },
];

const foundation = [
  { en: "Variables", zh: "变量", code: "x = 1" },
  { en: "Loops", zh: "循环", code: "for i in range(n)" },
  { en: "Functions", zh: "函数", code: "f(x) → y" },
  { en: "Arrays", zh: "数组", code: "[1, 2, 3]" },
];

const bridge = [
  { en: "Data Types", zh: "数据类型", detail: "int · string · bool" },
  { en: "Conditionals", zh: "条件判断", detail: "if / else" },
  { en: "Objects", zh: "对象", detail: "state + behavior", zhDetail: "状态与行为" },
  { en: "Algorithms", zh: "算法", detail: "step by step", zhDetail: "一步一步求解" },
  { en: "Data Structures", zh: "数据结构", detail: "lists · trees · graphs", zhDetail: "链表 · 树 · 图" },
  { en: "Recursion", zh: "递归", detail: "solve a smaller problem", zhDetail: "求解更小的问题" },
  { en: "HTTP", zh: "HTTP", detail: "request → response", zhDetail: "请求 → 响应" },
  { en: "SQL", zh: "SQL", detail: "SELECT · FROM · WHERE" },
];

const galaxies = [
  { id: "mathematics", en: "Mathematics", zh: "数学", enDetail: "structure · proof · probability", zhDetail: "结构 · 证明 · 概率" },
  { id: "computation", en: "Computer Science", zh: "计算机科学", enDetail: "algorithms · computation", zhDetail: "算法 · 计算 · 复杂性" },
  { id: "learning", en: "Machine Learning", zh: "机器学习", enDetail: "representation · optimization", zhDetail: "表征 · 优化 · 泛化" },
  { id: "systems", en: "Distributed Systems", zh: "分布式系统", enDetail: "consensus · coordination", zhDetail: "共识 · 协调 · 一致性" },
  { id: "cognition", en: "Language & Cognition", zh: "语言与认知", enDetail: "meaning · memory · reasoning", zhDetail: "语义 · 记忆 · 推理" },
  { id: "embodied", en: "Embodied Intelligence", zh: "具身智能", enDetail: "perception · action · world", zhDetail: "感知 · 行动 · 世界" },
  { id: "agents", en: "Agentic Systems", zh: "智能体系统", enDetail: "reasoning · tools · collaboration", zhDetail: "推理 · 工具 · 协作" },
  { id: "generative", en: "Generative Modeling", zh: "生成式建模", enDetail: "distributions · latent spaces", zhDetail: "分布 · 潜在空间" },
  { id: "causality", en: "Causal Inference", zh: "因果推断", enDetail: "interventions · counterfactuals", zhDetail: "干预 · 反事实" },
  { id: "information", en: "Information Theory", zh: "信息论", enDetail: "entropy · compression · signals", zhDetail: "熵 · 压缩 · 信号" },
  { id: "optimization", en: "Optimization", zh: "最优化理论", enDetail: "objectives · constraints · search", zhDetail: "目标 · 约束 · 搜索" },
  { id: "inference", en: "Inference Systems", zh: "推理系统", enDetail: "memory · scheduling · parallelism", zhDetail: "内存 · 调度 · 并行" },
];

const galaxyTopics = [
  { en: ["Linear Algebra", "Bayes' Theorem", "Gradient Descent", "Probability"], zh: ["线性代数", "贝叶斯定理", "梯度下降", "概率论"] },
  { en: ["Algorithms", "Data Structures", "Complexity", "Type Systems"], zh: ["算法", "数据结构", "计算复杂性", "类型系统"] },
  { en: ["Sparse MoE", "MLA", "Mamba-2", "Representation Learning"], zh: ["Sparse MoE", "MLA", "Mamba-2", "表征学习"] },
  { en: ["Consensus", "Event Sourcing", "Temporal", "Ray Serve"], zh: ["共识算法", "事件溯源", "Temporal", "Ray Serve"] },
  { en: ["Embeddings", "Attention", "Agent Memory", "Semantic Search"], zh: ["向量嵌入", "注意力机制", "智能体记忆", "语义检索"] },
  { en: ["VLA", "World Models", "Sensor Fusion", "Policy Learning"], zh: ["VLA", "世界模型", "传感器融合", "策略学习"] },
  { en: ["MCP", "A2A", "Agent Harness", "Context Engineering"], zh: ["MCP", "A2A", "Agent Harness", "上下文工程"] },
  { en: ["Diffusion Transformer", "Flow Matching", "Latent Spaces", "Distillation"], zh: ["Diffusion Transformer", "Flow Matching", "潜在空间", "知识蒸馏"] },
  { en: ["Causal Graphs", "Interventions", "Counterfactuals", "Identification"], zh: ["因果图", "干预", "反事实推理", "因果识别"] },
  { en: ["Entropy", "Mutual Information", "Compression", "Information Bottleneck"], zh: ["信息熵", "互信息", "压缩编码", "信息瓶颈"] },
  { en: ["Convexity", "Constraints", "GRPO", "DPO"], zh: ["凸性", "约束优化", "GRPO", "DPO"] },
  { en: ["PagedAttention", "KV-Aware Routing", "Speculative Decoding", "P/D Disaggregation"], zh: ["PagedAttention", "KV 缓存路由", "推测解码", "预填充/解码分离"] },
];

export const enKnowledge = {
  caption: "Never stop learning.",
  sub: "LEARN DEEPER. DISCOVER FURTHER.",
  description: "Four basic ideas — variables, loops, functions and arrays — slowly enter a small black hole, each making it grow. Only then do the first discipline galaxies appear. In about 35–40 seconds, learning accelerates and the view opens into a rich field of galaxies and advanced concepts. Whole galaxies are absorbed more slowly than individual ideas.",
  pause: "Pause knowledge flow",
  play: "Resume knowledge flow",
  replay: "Replay knowledge growth",
  foundation: foundation.map(({ en, code }) => ({ title: en, code })),
  bridge: bridge.map(({ en, detail }) => ({ kind: "code" as const, title: en, detail })),
  fragments: fragments.map(({ kind, title, en }) => ({ kind, title, detail: en })),
  galaxies: galaxies.map(({ id, en, enDetail }, i) => ({ id, title: en, detail: enDetail, topics: galaxyTopics[i].en })),
};

export const zhKnowledge: typeof enKnowledge = {
  caption: "求知，无止境。",
  sub: "学得越深，看见的未知越广",
  description: "变量、循环、函数和数组这四个基础概念缓慢进入小黑洞，每吸收一个就长大一点。打好基础后，才出现最初的学科星系。约三十五至四十秒内，学习逐渐加快，眼界打开，展现丰富的星系与进阶知识。完整星系的吸收仍比小知识点更慢。",
  pause: "暂停知识流",
  play: "继续知识流",
  replay: "重播知识生长",
  foundation: foundation.map(({ zh, code }) => ({ title: zh, code })),
  bridge: bridge.map(({ zh, detail, zhDetail }) => ({ kind: "code" as const, title: zh, detail: zhDetail ?? detail })),
  fragments: fragments.map(({ kind, title, zh }) => ({ kind, title, detail: zh })),
  galaxies: galaxies.map(({ id, zh, zhDetail }, i) => ({ id, title: zh, detail: zhDetail, topics: galaxyTopics[i].zh })),
};
