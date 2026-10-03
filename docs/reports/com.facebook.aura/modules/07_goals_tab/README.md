# 模块七：Goals 目标与长周期任务追踪（Goals & Autonomous Tracking）

本模块记录 Facebook Aura (Meta Muse) 的 Goals 目标追踪与管理系统。Aura 具备主动将关键运维预警、域名续费、安全调查、资产交易等事项沉淀为“长效追踪目标（Tracking Goals）”的能力。每个目标包含独立的 CheckBox 复选框核销态、上下文级展开折叠（Show more / Show less）、快捷三点操作菜单（Complete、Add a subgoal、Rename、Delete），以及全套引导式目标创建弹窗（Track something new），供 `/visual-verdict` skill 作为 390px 移动端 React 界面还原的视觉与逻辑基准。

---

## 1. 核心流程状态集

| 状态 ID | 状态说明 | 核心交互/控件 | 截图对应 |
|---|---|---|---|
| `GOAL_01` | **Goals 模块首屏（Tracking 列表）** | 顶部 Goals 标题、`Tracking` 活跃任务分组、单项标题与背景说明、`Track something new` 新建入口 | `images/01_goals_main_screen.png` |
| `GOAL_02` | **新建目标引导抽屉（Track Something New）** | 半屏引导弹窗，提示 Agent 将通过对话多轮提问确认追踪指标，主按钮 `Let's do it` | `images/02_goals_create_prompt.png` |
| `GOAL_03` | **目标快捷操作菜单（Item Context Menu）** | 目标卡片右侧三点菜单弹出的浮层，包含 `Complete`、`Add a subgoal`、`Rename`、`Delete` | `images/03_goals_item_more_menu.png` |
| `GOAL_04` | **全量目标展开瀑布流（Expanded List）** | 点击 `Show more` 后完整展开的多项并发任务链（云服务器续费、域名到期、SSH 后门告警、域名报价处理） | `images/04_goals_expanded_list.png` |
| `GOAL_05` | **目标多级详情与子任务卡片（Goal Detail View）** | 点击卡片主体后进入的目标详情流，支持添加子目标与对话联动 | `images/05_goal_detail_view.png` |

---

## 2. 界面视觉还原参考（React / 390px Mobile-First）

### 01. 目标列表项规范（Goal Item Row）
- **左侧状态控件**：
  - 标准圆角复选框（CheckBox，尺寸 24×24px）。
  - 未完成态为浅灰描边圆环，点击即时触发勾选与轻微划线收起动画。
- **中间内容区**：
  - **目标名称（Title）**：字号 16px，Medium/Semibold 字重，深黑 `#111111`，单行或双行展示。
  - **背景与进展（Subtitle & Context）**：字号 13px，次级灰 `#666666`，行高 1.4，包含关键日期和当前卡点（如 `Waiting for lyhiving to confirm...`）。
- **右侧操作热区**：
  - 44×44px 更多选项图标按钮（三点横向或纵向图标），点击在触摸点下方弹出快捷操作菜单。

---

### 02. 新建目标引导抽屉（Create Goal Sheet）
- **弹窗布局**：
  - 覆盖底部约 40% 的 Modal Sheet（`rounded-t-3xl`，圆角 24px）。
  - 标题：`Track something new`（20px 加粗）。
  - 说明：`First, we'll work out what to track together in chat. I'll ask a few questions to pin down exactly what you want me to follow.`。
  - 按钮：底部居中胶囊按钮 `Let's do it`（高 48px，黑色背景，白色粗体字，带图标）。

---

### 03. 目标上下文操作菜单（Goal Context Menu）
- 紧贴触发按钮展开的圆角弹出卡片（`rounded-2xl`，阴影 `shadow-lg`，背景纯白）：
  1. `Complete`（对勾图标）
  2. `Add a subgoal`（加号图标）
  3. `Rename`（铅笔图标）
  4. 分割线
  5. `Delete`（垃圾桶图标，警告红字）
