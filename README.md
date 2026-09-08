# JCL.AI — AI Full-Stack Portfolio

蒋朝龙的个人作品集：大字号编辑式排版、可交互粒子装置与项目架构展示。

## 启动

```bash
npm install
npm run dev
```

打开 http://localhost:3000 。生产验证使用 `npm run build`。

## 主要文件

- `components/Portfolio.tsx`：个人介绍、项目、技术栈与经历。
- `components/SignalCore.tsx`：原生 Canvas 粒子曲面，支持形态切换、鼠标倾斜、暂停及减少动态效果。
- `app/globals.css`：设计变量、页面布局与移动端适配。
- `components/SignatureFooter.tsx`：保留的交互像素签名。
- `components/FooterReveal.tsx`：联系区覆盖在签名上，继续滚动时像幕布一样掀开；支持反向滚动、签名锚点和键盘访问。
- `DESIGN.md`：设计方向与内容约束。

项目内容沿用旧版简历信息；更新时使用真实项目数据，不虚构指标。项目架构展示是已有流程的示意图。

## 中英文与开场

- 文案集中于 `lib/messages.ts`，默认英文，支持中文、英文；导航栏可即时切换并记住选择。
- `?lang=zh` / `?lang=en` 可分享指定语言；Cookie 支持服务端首屏语言，本地存储作为偏好备份。
- `components/OpeningSequence.tsx` 提供 8 秒开场；`components/DeductionSequence.tsx` 用错落线索、逐段连线和镜头追踪展现工具间的推导关系，拉远揭示全貌后呈现 AI Agent，再接入原有品牌揭幕。每个标签页会话自动播放一次，支持跳过、Esc 和重播；锚点直达与减少动态效果模式自动略过。
- `components/AnimatedDiagrams.tsx` 为顺序流程、并行系统和核心架构提供信号动画与独立暂停控制；离开视口、切换后台或启用减少动态效果时暂停。
- `components/PixelText.tsx` 保留惯性扰动、弹簧归位和点击脉冲，用额外画布空间配合紧凑页尾。
- 项目使用 Next.js 服务端语言选择，以 `npm run build` 和 `npm run start` 运行，不使用静态导出。
