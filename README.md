# JCL.AI — AI Full-Stack Portfolio

一个以「AI Systems Laboratory」为概念的超宽屏个人作品集。

## 设计方向
参考 `awesome-design-md` 的 DESIGN.md 方法论，把设计规则沉淀到根目录 `DESIGN.md`，再用：
- Void-black / emerald terminal aesthetics
- Cinematic editorial spacing
- tsParticles neural constellation
- Framer Motion micro-interactions

## 启动

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## 重要
当前内容以你提供的旧版简历为基线，尤其是项目、技术栈和经历。你把最新简历补进来后，优先更新：
- `components/Portfolio.tsx` 的 projects / skills / timeline
- Hero headline 下方的定位
- 项目中的真实业务指标（不要虚构）

tsParticles 使用官方 `@tsparticles/engine + @tsparticles/slim + @tsparticles/react` 组合。
