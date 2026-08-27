# JCL.AI Footer — Interactive Pixel Field / Pixel Intelligence Effect

现在为 JCL.AI 网站重新设计并实现一个高级的 Footer 视觉交互效果。

参考灵感：

**TRAE 官网底部的 Interactive Footer / Pixel-cutting hover effect。**

TRAE 官方设计团队将这个效果描述为：

> Interactive Footer：通过鼠标互动实现 pixel-cutting hover effect，作为网站隐藏彩蛋，同时呼应品牌的 pixel DNA。

但是：

## 不要直接复制 TRAE 的视觉、Logo、文案、颜色或具体实现。

我要的是：

> **借鉴“鼠标驱动像素场 + Footer 隐藏彩蛋”的交互理念，为 JCL.AI 创造属于自己的 AI / Neural / Digital Intelligence Footer。**

---

# 一、最终视觉目标

Footer 不应该只是：

```text
GitHub
Email
© 2026 JCL.AI
```

而应该成为整个网站最后一个：

# Visual Signature

当用户滚动到网站底部时，首先看到一个非常克制的 Footer。

静止状态：

```text
────────────────────────────────────

             JCL.AI

      AI FULL-STACK ENGINEER

      Building intelligent systems.

────────────────────────────────────

        GitHub    Email    Contact

             © 2026 JCL.AI
```

但是：

**Footer 周围存在一个几乎不可察觉的 Pixel Field。**

用户移动鼠标之后：

> Footer 像一个“数字智能系统”被激活。

---

# 二、核心效果：Interactive Pixel Field

建立一个覆盖 Footer 的：

**Pixel Field / Digital Particle Surface**

静止状态：

- 非常淡
- 低对比度
- 几乎不可察觉
- 不抢 Footer 内容

鼠标移动进入 Footer 后：

**像素开始响应鼠标。**

---

# 三、不要做普通粒子跟随

禁止：

```text
鼠标
 ↓
粒子跟着鼠标跑
```

这太普通。

需要做：

# Pixel Cutting / Pixel Displacement

鼠标经过的位置形成一个：

**局部“切割 / 擦除 / 扭曲区域”。**

例如：

```text
正常：

· · · · · · · · · · ·
· · · · · · · · · · ·
· · · · · · · · · · ·


鼠标经过：

· · · · · · · · · · ·
· ·  · ·   · · · · ·
·  ·       · · · · ·
· ·  · ·   · · · · ·
· · · · · · · · · · ·
```

不是简单隐藏。

而是：

**Pixel Field 被鼠标切开。**

---

# 四、Pixel Field 的视觉语言

像素不要是传统游戏里的：

```text
████████
```

也不要是大颗粒点。

建议使用：

**极小的 square pixels / micro dots**

尺寸：

- 1px
- 2px
- 少量 3px

形成非常细腻的数字纹理。

---

# 五、静态状态

用户没有操作时：

Pixel Field：

```text
· · · · · · · · · · ·
 · · · · · · · · · ·
· · · · · · · · · · ·
 · · · · · · · · · ·
```

但是：

opacity 非常低。

不要让 Footer 看起来像：

> “我这里有一堆粒子。”

应该是：

> “这里似乎有某种数字纹理。”

---

# 六、鼠标进入 Footer

当 cursor 进入 Footer：

Pixel Field 激活。

可以产生：

**subtle wake-up effect**

例如：

```text
        cursor
           ↓
      ╭────────╮
     /          \
    |  pixel    |
    |  field    |
     \          /
      ╰────────╯
```

附近 pixels：

- slight displacement
- opacity increase
- slight scale
- local brightness increase

但不要：

❌ 粒子爆炸

❌ 大量粒子飞散

❌ neon glow

---

# 七、Pixel Cutting

这是整个效果最重要的部分。

鼠标移动时：

在鼠标轨迹附近产生一个：

**动态切割区域。**

可以理解为：

```text
Pixel Field
████████████████████

       ↓ cursor

███████      ███████
██████        ██████
██████        ██████
███████      ███████

████████████████████
```

但视觉上不是一个明显的洞。

而是：

**局部像素被推开 / 切断 / 位移。**

---

# 八、鼠标移动轨迹

不要只响应当前 cursor position。

记录非常短的：

**mouse trail**

例如最近：

**8~20 个位置**

每个位置都有衰减。

这样鼠标快速移动时：

会留下：

```text
●
  ●
    ●
      ●
        ●
```

形成：

**Pixel Wake Trail**

但是 trail 很快消失。

推荐：

**300~700ms**

---

# 九、Trail 不要变成光带

这一点非常重要。

不要：

```text
████████████████
```

不要：

- neon trail
- glowing line
- laser
- rainbow

而应该是：

**像素被轻微扰动之后自然恢复。**

---

# 十、加入“Digital Intelligence”感觉

JCL.AI 的 Footer 不应该只是 Pixel。

可以让部分 pixel：

**短暂形成微小结构。**

例如：

```text
· · ·   · ·
  · ─ ·
·   ·   ·
  · ─ ·
```

然后消失。

像：

**AI 正在重新组织信息。**

不要形成固定 Logo。

不要形成复杂文字。

只需要：

**瞬时结构。**

---

# 十一、鼠标停留

如果用户把鼠标停在 Footer 某个位置：

附近 pixels 可以：

- 缓慢聚集
- 形成微型 cluster
- 然后缓慢解散

例如：

```text
       ·
     · ● ·
    · ●●● ·
     · ● ·
       ·
```

持续：

**1~2 秒**

然后恢复。

---

# 十二、鼠标离开

鼠标离开 Footer：

Pixel Field 不应该立即停止。

应该：

```text
Active
 ↓
Decay
 ↓
Recover
 ↓
Idle
```

整个恢复：

**500~1000ms**

非常柔和。

---

# 十三、Footer 与 JCL.AI Logo 的关系

Footer 中央：

```text
JCL.AI
```

是核心。

当用户鼠标靠近 Footer：

可以让非常少量 pixels：

**朝 JCL.AI 聚拢。**

不是所有 pixels。

只让少量局部 pixels：

```text
·     ·
  ↘
    JCL.AI
  ↗
·     ·
```

产生：

**“数字空间正在围绕品牌核心组织”**

的感觉。

---

# 十四、可以加入极轻微的 Neural Network 语言

因为 JCL.AI Hero 已经有 Neural Network。

Footer 不应该重复 Hero。

这里应该是：

### Hero

完整 Neural Network

↓

### Footer

Neural Network 解构成 Pixel Field

↓

### 最终

Pixel Field 围绕 JCL.AI 聚合

形成视觉叙事：

```text
Hero
AI Network
      ↓
Projects
Engineering
      ↓
Footer
Pixels
      ↓
JCL.AI
```

也就是说：

**Footer 是整个系统的“归零状态”。**

---

# 十五、颜色

严格限制。

使用网站现有 accent color。

Pixel：

默认：

**非常低 opacity 的 neutral / accent**

Active Pixel：

稍微增加亮度。

不要新增：

- 红色
- 紫色
- 绿色
- 彩虹
- neon blue

整个效果应该和 JCL.AI 当前视觉系统一致。

---

# 十六、不要影响 Footer 文案

Pixel Field 必须位于：

**Footer background layer**

内容位于：

**Foreground layer**

例如：

```text
Footer
│
├── PixelField Canvas
│
├── Gradient / background
│
└── Footer Content
    ├── JCL.AI
    ├── description
    ├── links
    └── copyright
```

Canvas：

```css
position: absolute;
inset: 0;
pointer-events: none;
```

鼠标事件由 Footer container 捕获。

---

# 十七、实现方式

不要为了这个效果强行使用 tsParticles。

这个效果更适合：

**Canvas 2D**

或者：

**WebGL**

优先选择：

**Canvas 2D**

如果 Canvas 2D 无法达到足够好的视觉效果，再考虑 WebGL。

因为这里重点是：

- pixel displacement
- mouse trail
- local field
- decay
- dynamic pixel activation

Canvas 会比较容易控制。

---

# 十八、Pixel Field 算法

可以采用：

```text
base grid
+
random jitter
+
mouse influence field
+
trail influence
+
displacement
+
opacity decay
+
local clustering
```

核心思想：

每个 pixel 都有：

```text
x
y
baseX
baseY
size
opacity
velocity
phase
noise
```

然后：

```text
distance(pixel, mouse)
```

计算 influence。

例如：

```text
distance < radius
    ↓
displacement
brightness
scale
```

随着距离增加：

```text
influence → 0
```

必须使用平滑 easing。

不要硬切。

---

# 十九、不要做成规则网格

虽然底层可以使用 grid。

但是最终：

**绝对不能看起来像 CSS grid。**

加入：

- jitter
- density variation
- size variation
- opacity variation

让它更像：

**digital dust / pixel intelligence**

---

# 二十、响应式

Desktop：

完整 Pixel Field。

Tablet：

减少 density。

Mobile：

大幅降低粒子数量。

并且：

**没有 mouse interaction。**

移动端可以改成：

轻微自动呼吸。

不要监听 touch 做复杂交互。

---

# 二十一、性能

必须：

- requestAnimationFrame
- devicePixelRatio 限制
- resize cleanup
- mouse listener cleanup
- IntersectionObserver
- Footer 不在 viewport 时停止 animation
- reduced-motion 降级

建议：

Desktop：

大约：

**1500~4000 pixels**

根据实际 FPS 动态调整。

不要机械追求数量。

如果 1000 pixels 看起来已经很好：

就不要增加到 10000。

---

# 二十二、Reduced Motion

如果：

```css
prefers-reduced-motion: reduce
```

则：

Pixel Field：

- 静态
- 无 trail
- 无 displacement
- 无自动动画

但是：

仍然可以保留：

**非常轻微的静态 pixel texture。**

---

# 二十三、最重要的设计要求

这个效果必须满足：

### 用户第一次看到

几乎不知道这里有特效。

### 用户移动鼠标

突然发现：

> “卧槽，这里居然会响应。”

### 用户继续移动

发现：

> “它不是普通粒子，它是在被切割 / 重组。”

### 用户停下来

发现：

> “像素又慢慢恢复了。”

这就是：

# Hidden Interaction

---

# 二十四、不要照抄 TRAE

TRAE 的效果只是 inspiration。

不要：

- 复制 TRAE 的 Logo
- 复制 TRAE 的 Pixel 图形
- 复制 TRAE 的颜色
- 复制 TRAE 的动画时间
- 复制 TRAE 的 Footer layout
- 复制 TRAE 的源码

我要的是：

**同一种设计思想 + JCL.AI 自己的视觉语言。**

---

# 二十五、与现有 Hero Neural Network 统一

Hero：

```text
Neural Network
```

Footer：

```text
Pixel Field
```

二者应该属于同一个设计系统。

例如：

Hero 的 accent color：

Footer Pixel 使用同一 accent。

Hero 的 motion：

Footer 的 motion 同样克制。

Hero 的节点：

Footer 可以抽象成 micro pixels。

让用户感觉：

> 这个网站从头到尾都是一个系统。

---

# 二十六、最终效果想象

用户滚到页面底部：

```text
────────────────────────────────────

               JCL.AI

          AI FULL-STACK ENGINEER

     Building intelligent systems.

       GitHub     Email     Contact


       · · · · · · · · · · · ·
     · · · · · · · · · · · · ·
       · · · · · · · · · · ·
     · · · · · · · · · · · ·


               © 2026
────────────────────────────────────
```

然后鼠标：

```text
                    🖱
                     ↓

       · · ·       · · ·
     · ·   · ·   · ·   ·
       ·     · ·     ·
     ·   ·         ·   ·
       ·     JCL.AI
     ·   ·         ·   ·
       ·     · ·     ·
     · ·   · ·   · ·   ·
       · · ·       · · ·
```

像素被鼠标：

**切开、扰动、重组。**

鼠标移动：

```text
        🖱 →
     · · ·
       · · ·
          · · ·
             · · ·
```

留下短暂的 Pixel Wake Trail。

鼠标停留：

```text
         ·
       · ● ·
      · ●●● ·
       · ● ·
         ·
```

附近像素短暂聚集。

鼠标离开：

```text
Active
 ↓
Decay
 ↓
Recover
 ↓
Idle
```

整个效果最终恢复安静。

---

# 二十七、最终目标

我不要一个：

**“Footer 加了 Canvas 粒子”**

的效果。

我要：

# JCL.AI 的隐藏彩蛋。

用户必须主动探索才发现。

这是整个网站最后一个：

**“Oh, that's cool.”**

的瞬间。

---

# 二十八、执行流程

直接开始：

1. 检查当前 Footer
2. 检查现有视觉系统
3. 检查现有 accent color
4. 检查现有 Hero Neural Network
5. 设计 Pixel Field
6. 实现 Canvas
7. 加入 mouse interaction
8. 加入 pixel cutting
9. 加入 trail
10. 加入 clustering
11. 加入 decay
12. 加入 Footer / viewport lifecycle
13. 加入 mobile degradation
14. 加入 reduced-motion
15. 实际启动网站
16. 浏览器查看 Footer
17. 鼠标实际测试
18. 调整 density / displacement / opacity / decay
19. 再次浏览器验证
20. 最终运行 TypeScript / build 检查

不要只告诉我：

> “已经完成。”

必须实际在浏览器中验证视觉效果。

如果第一次实现看起来像：

**普通 Canvas 粒子**

继续修改。

如果看起来像：

**赛博朋克特效**

降低强度。

如果看起来：

**太弱，用户根本发现不了**

适当增强 interaction。

最终必须做到：

> **静态高级、交互惊喜、动画克制、品牌统一。**

JCL.AI 的 Footer 应该成为整个网站最后一个值得用户主动发现的视觉彩蛋。