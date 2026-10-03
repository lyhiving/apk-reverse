# 模块四：侧边抽屉与多会话管理（Side Panel & Thread Management）

本模块记录 Facebook Aura (Meta Muse) 的侧边会话管理架构。Aura 采用了双层会话体系：**全局主对话（Main chat）** 与 **按主题分类的独立侧聊（Side chats）**，支持实时生成会话主题摘要、归档侧聊、以及从侧边栏直达高级设置。供 `/visual-verdict` skill 作为 390px 移动端 React 界面还原的视觉与逻辑基准。

---

## 1. 核心流程状态集

| 状态 ID | 状态说明 | 核心交互/控件 | 截图对应 |
|---|---|---|---|
| `PANEL_01` | **侧边抽屉默认首屏（Empty Side Chats）** | 80% 宽度侧滑抽屉、Main chat 固定入口、Side chats 分组、Start a side chat 空态插画与说明、底部 Settings 与 New side chat 工具栏 | `images/01_side_panel_drawer.png` |
| `PANEL_02` | **新建侧聊空白首屏（New Session）** | 干净的全新对话上下文、无 Proactive 卡片干扰、可直接发送主题问题 | `images/02_side_chat_empty_session.png` |
| `PANEL_03` | **会话聚合列表态（Active Side Chats）** | AI 自动根据首条提问提炼的主题摘要卡片（如 `General planning discussion`）、轻触即切换会话 | `images/03_side_panel_active_threads.png` |
| `PANEL_04` | **已归档侧聊抽屉页（Archived Chats）** | 顶部返回箭头、`Archived chats are here` 空状态提示、历史会话隔离存储 | `images/04_side_panel_archived_chats.png` |

---

## 2. 界面视觉还原参考（React / 390px Mobile-First）

### 01. 抽屉容器布局（Drawer Container Specification）
- **层级与遮罩**：
  - 侧边栏宽度：屏幕宽度的约 80%（在 390px 手机上约为 312px）。
  - 右侧遮罩区：约 20%（78px），带有半透明暗色遮罩（`rgba(0,0,0,0.4)`），点击任意位置触发 Dismiss 关闭抽屉。
  - 入场动画：水平自左向右滑动（`slide-in-from-left duration-250 ease-out`）。

---

### 02. 头部品牌与邀请入口
- **Agent 标志**：左上方加粗标题 `pony`（22px，Semibold）。
- **邀请胶囊（Invite Button）**：右上角浅底椭圆胶囊按钮，文本 `Invite`（13px 中黑）。

---

### 03. 会话层级与列表项规范
1. **主会话（Main Chat Row）**：
   - 顶部首选项目，图标为对话气泡。
   - 标题：`Main chat`（字号 16px，高亮显示，当前活跃时背景微灰）。
2. **主题侧聊分组（Side Chats Header）**：
   - 标题：`Side chats`（字号 16px，Medium）。
   - 右侧辅助按钮：`Archived`（点击滑动进入已归档会话抽屉）。
3. **侧聊列表项（Side Chat Item）**：
   - AI 自动提炼的标题（如 `General planning discussion`）。
   - 字号 15px，单行省略号截断（`truncate`），点击直接切换会话栈。

---

### 04. 底部固定操作栏（Sticky Bottom Bar）
- 位于抽屉最下端，高度 56px，左右两翼对齐：
  - **左下角**：`Settings` 齿轮图标按钮（44×44px 可触碰热区，点击进入已登录态高级全局设置）。
  - **右下角**：`New side chat` 编辑图标按钮（44×44px，点击即时开启新分支侧聊）。
