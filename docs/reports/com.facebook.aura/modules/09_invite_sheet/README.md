# 模块九：Invite 好友邀请与裂变奖励弹窗（Invite & Referral System）

本模块记录 Facebook Aura (Meta Muse) 的好友邀请与裂变增长系统。Aura 通过顶部常驻的 `Invite` 入口提供全局专属邀请码分发、一键复制、Token 权益激励机制（每成功邀请获得 10 亿 Muse tokens）以及系统与主流社媒分享矩阵（Share、Messages、WhatsApp、Messenger、Instagram），供 `/visual-verdict` skill 作为 390px 移动端 React 界面还原的视觉与逻辑基准。

---

## 1. 核心流程状态集

| 状态 ID | 状态说明 | 核心交互/控件 | 截图对应 |
|---|---|---|---|
| `INV_01` | **邀请裂变全屏抽屉（Invite Sheet）** | 顶部拖拽手柄、专属邀请码大字展示（如 `K X 9 A B R`）、一键复制按钮、权益激励说明及底部社交应用矩阵 | `images/01_invite_bottom_sheet.png` |
| `INV_02` | **邀请码复制与即时反馈态（Code Copied）** | 点击复制图标后触觉与视觉反馈，邀请码自动写入剪贴板 | `images/02_invite_code_copied.png` |
| `INV_03` | **系统分享面板交互（System Share Intent）** | 点击 `Share` 后调起系统级原生产物分享卡片（`From Muse`，专属口令透传） | `images/03_invite_system_share_sheet.png` |

---

## 2. 界面视觉还原参考（React / 390px Mobile-First）

### 01. 邀请码高光卡片（Invite Code Highlight Card）
- **布局形式**：
  - 居中圆角卡片（`rounded-3xl`），浅灰背景 `#F7F7F8`，四周内边距 24px。
  - 邀请码字样：大号等宽粗体字体（字号 32px，Tracking 宽字距，如 `K X 9 A B R`），居中深黑 `#111111`。
  - 右侧浮动图标：44×44px 复制按钮（`Copy` 图标），浅灰圆底悬浮。

### 02. 权益说明文案（Incentive Copywriting）
- **字号与排版**：
  - 文本居中对齐，字号 14px，次级灰 `#555555`，行高 1.6。
  - 核心权益重点提示：`1 billion Muse tokens`，48 小时兑换时限与剩余使用次数（`30 uses left`）。

### 03. 底部社交分享网格（Social Share Grid）
- **布局矩阵**：
  - 水平横向滑动或多列等宽网格（共 5 个渠道：`Share`、`Messages`、`WhatsApp`、`Messenger`、`Instagram message`）。
  - 每个项包含 48×48px 品牌圆形图标与下方 12px 浅灰说明文字。
