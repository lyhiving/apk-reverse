# 模块五：Feed 动态资讯流与个性化提示词（Feed Stream & Contextual Handoff）

本模块记录 Facebook Aura (Meta Muse) 的 Feed 动态资讯流系统。Aura 将 AI Agent 的自主摄取与个性化资讯整理紧密融合，允许用户直接查看和编辑生成 Feed 的系统级 Prompt 指令（Prompt instructions），支持富文本图文卡片流、互动点赞/点踩、以及一键“Discuss”将文章上下文无缝挂载注入主对话输入框的核心联动机制。供 `/visual-verdict` skill 作为 390px 移动端 React 界面还原的视觉与逻辑基准。

---

## 1. 核心流程状态集

| 状态 ID | 状态说明 | 核心交互/控件 | 截图对应 |
|---|---|---|---|
| `FEED_01` | **Feed 默认首屏（Prompt 指引卡片）** | 顶部 Feed 大标题、Prompt 指引气泡、编辑指令与 Got it 按钮、首篇图文资讯预览 | `images/01_feed_main_screen.png` |
| `FEED_02` | **个性化提示词编辑弹窗** | `Feed instructions` 多行文本编辑框（默认：`Make me a feed about my interests...`）、Cancel / Save 按钮组 | `images/02_feed_edit_prompt_dialog.png` |
| `FEED_03` | **资讯瀑布流主界面（Clean Stream）** | 极简无干扰资讯卡片流、支持滚动的富文本 WebView 渲染块、底部快捷操作栏（Like / Dislike / Discuss / 耗时标识） | `images/03_feed_articles_stream.png` |
| `FEED_04` | **媒体沉浸式全屏查看器** | 全屏大图展示、顶部左上角 Close 返回按钮、右上角 More options 辅助操作 | `images/04_feed_media_fullscreen.png` |
| `FEED_05` | **Feed 与 Chat 上下文联动跨流交互** | 点击 Discuss 后自动切回 Chat 主会话，并在输入框上方挂载 `Discuss the post: [Title]` 胶囊卡片（附带 Remove context X 按钮） | `images/05_feed_discuss_chat_handoff.png` |

---

## 2. 界面视觉还原参考（React / 390px Mobile-First）

### 01. 提示词指令卡片（Prompt Instructions Card）
- **布局定位**：位于 Feed 页面顶部首屏（首次进入或点击右上角编辑按钮触发）。
- **容器规范**：
  - 背景色：浅灰微底色卡片（`#F4F4F6`，圆角 16px）。
  - 内边距：`p-4`（16px）。
- **元素层级**：
  1. 标题：`Prompt instructions`（粗体 16px，颜色 `#1C1C1E`）。
  2. 描述文案：`Your feed is powered by the instructions below. Any edits you make to this prompt will apply to future posts on the feed.`（次级灰 13px，行高 1.4）。
  3. 指令展示框：圆角 12px 浅白背景块，固定展示当前默认提示词。
  4. 操作按钮组：两列均分按钮（`Edit` 浅底次级按钮 + `Got it` 纯黑主按钮，高度 40px，圆角 20px）。

---

### 02. 资讯内容卡片流（Feed Article Card）
- **流式卡片结构**：
  - **标题**：加粗 18px，行高 1.35，颜色 `#000000`。
  - **摘要正文**：14px，常规字重，次级深灰 `#3C3C43`，行高 1.5。
  - **架构结构图/插图（Embedded Media）**：嵌入式图文块或轻量 HTML/Canvas 渲染，高度约 240px，自适应屏幕宽度。
  - **卡片间距**：每篇资讯间隔 24px，两翼屏幕安全留白（gutter）16px。

---

### 03. 资讯操作栏（Social & Contextual Actions Bar）
位于每篇 Feed 卡片的底部，高度 44px，横向排布：
1. **点赞 / 点踩（Like / Dislike）**：
   - 包含拇指向上/向下描边图标，点击触发轻触微震动与即时高亮反馈。
2. **讨论（Discuss）按钮**：
   - 图标：双气泡或对话图标。
   - 文本：`Discuss`（字号 14px，Medium）。
   - **交互关键**：点击立即跳转切换至第一导航 Tab `Chat`，并将当前文章元数据作为上下文实体挂载。
3. **阅读时间与元数据（Post Info）**：
   - 右对齐显示预估阅读时长（如 `3 min`）及发布时间戳感叹号按钮（点击展示生成时间详情）。

---

### 04. 跨模块上下文挂载条（Chat Context Handoff Attachment）
- **在 Chat 模块输入条上方的表现**：
  - 位于底部输入条正上方，吸附式悬浮展示。
  - 背景色：纯白或微黄提示底色，带 0.5px 浅灰边框与轻微外阴影（`shadow-sm`）。
  - 左侧：标题 `Discuss the post:`（12px 灰色小字）+ 文章名（13px 加粗截断 `truncate`）。
  - 右侧：圆形微型叉号关闭按钮（`Remove context`，Touch target 32×32px），点击可一键移除附带的 Feed 讨论上下文。
