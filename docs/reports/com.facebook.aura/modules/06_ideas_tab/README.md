# 模块六：Ideas 灵感探索与行动建议（Ideas & Autonomous Action Planning）

本模块记录 Facebook Aura (Meta Muse) 的 Ideas 灵感与行动建议系统。Aura 通过对用户日常上下文的观察，主动生成可落地的执行建议（如日历社交邀请、维修配件自动下单订购、流失订阅自动退订、搬家报价与工单自动规划等）。用户轻触建议卡片可唤出带有“What's included”（含周期性定时任务勾选）的沉浸式详情抽屉，并能一键执行“Let's do it”完成端到端任务派生与会话上下文注入。供 `/visual-verdict` skill 作为 390px 移动端 React 界面还原的视觉与逻辑基准。

---

## 1. 核心流程状态集

| 状态 ID | 状态说明 | 核心交互/控件 | 截图对应 |
|---|---|---|---|
| `IDEA_01` | **Ideas 灵感探索首屏（Cards Stream）** | 顶部 Ideas 标题、高优先级 Agent 行动方案卡片列表、左侧图标 + 标题 + 详述布局 | `images/01_ideas_main_screen.png` |
| `IDEA_02` | **建议详情沉浸式半屏抽屉（Action Sheet）** | 顶部 Dismiss 拖动条、完整任务目标、`What’s included` 说明、`Recurring task` 周期性复选框、主按钮 `Let's do it` | `images/02_ideas_bottom_sheet_detail.png` |
| `IDEA_03` | **建议反馈与次级菜单（More Actions Menu）** | 左下角三点/更多图标弹窗、包含 `More like this`（更多类似）与 `Not interested`（不感兴趣） | `images/03_ideas_more_actions_menu.png` |
| `IDEA_04` | **执行流式生成态（Executing & Streaming）** | 自动向会话流提交建议并触发 `pony is working` 动态规划响应 | `images/04_ideas_executed_session.png` |
| `IDEA_05` | **执行规划完成态（Full Action Plan）** | AI 结合用户日历和联系人给出的落地实施指引气泡 | `images/05_ideas_ai_response_plan.png` |

---

## 2. 界面视觉还原参考（React / 390px Mobile-First）

### 01. 灵感建议卡片（Idea Proposal Card）
- **流式卡片结构**：
  - **左侧引导图标**：44×44px 居左展示。
  - **核心命题标题**：17px 加粗，颜色 `#000000`，如 `Losing touch with someone? I'll find a time and draft the invite.`。
  - **实施逻辑正文**：14px，常规字重，次级灰 `#555555`，行高 1.45。
  - **点击热区**：整个卡片为 `clickable` 容器（min-height 120px，带点击微缩放缩放反馈）。

---

### 02. 底部行动抽屉（Action Sheet Specification）
- **抽屉容器规范**：
  - 覆盖屏幕高度的约 50%（从底部升起，动画 `slide-up`）。
  - 上边缘圆角：24px，带有顶部半透明暗色遮罩背景。
  - 顶部居中把手：40×4px 圆角指示胶囊。
- **内容组织**：
  1. 完整愿景标题（20px 加粗）。
  2. 详细执行手段说明（15px 次级正文）。
  3. `What’s included` 小节：
     - `Recurring task`（含勾选状态 CheckBox）。
     - 副标题：`A weekly look for open windows.`（说明该任务将加入后台定时巡检）。
- **底部吸底按钮栏**：
  - 左侧：圆形 `More actions` 图标按钮（44×44px，微灰圆底）。
  - 右侧：全宽胶囊按钮 `Let's do it`（黑色主强调色，高 52px，白色 16px 粗体文案，居中带有闪烁或星形动作图标）。
