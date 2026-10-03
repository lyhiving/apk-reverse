# 模块十二：订阅方案与升级付费墙（Subscription & Upgrade Paywall）

本模块记录 Facebook Aura (Meta Muse) 的商业化订阅与 Token 算力扩容付费墙（Upgrade Paywall）。Aura 实行基于每周 Token 预算的消耗机制（Free 基础版），针对高频自动化任务（如邮件自动清洗、跨平台会议预订等）提供两档高级订阅包（`Power` 与 `Maximum`），供 `/visual-verdict` skill 作为 390px 移动端 React 界面还原的视觉与逻辑基准。

---

## 1. 核心流程状态集

| 状态 ID | 状态说明 | 核心交互/控件 | 截图对应 |
|---|---|---|---|
| `UPG_01` | **升级付费墙半屏抽屉（Upgrade Paywall Sheet）** | 顶部拖拽手柄、主标题 `Upgrade`、价值引导文案、订阅方案列表与法律协议说明 | `images/01_upgrade_paywall_sheet.png` |
| `UPG_02` | **套餐方案卡片选中态（Plan Selection）** | `Power`（500M weekly tokens）与 `Maximum`（3B weekly tokens）单选卡片高亮选中态 | `images/02_upgrade_plan_selected.png` |
| `UPG_03` | **结账确认与提交态（Checkout Transition）** | 点击底部胶囊按钮 `Continue` 触发 Google Play 原生账单结算中转 | `images/03_upgrade_payment_checkout.png` |

---

## 2. 界面视觉还原参考（React / 390px Mobile-First）

### 01. 订阅套餐卡片（Subscription Tier Cards）
- **布局形式**：
  - 纵向堆叠的大圆角卡片（`rounded-2xl`，高 100px，外边距 16px）。
  - 未选中态：浅灰背景 `#F7F7F8`，1px 浅灰描边 `#E5E7EB`。
  - 选中态：加粗黑色外边框 `2px solid #000000` 或高亮背景底色。
  - 内部文本排版：
    - 套餐名（如 `Power`、`Maximum`）：18px Bold，深黑 `#111111`。
    - 权益描述（如 `500M weekly Muse tokens`）：14px Regular，次级灰 `#666666`。

### 02. 底部协议与操作区（Sticky Checkout Action）
- **吸底固定**：
  - 悬浮于屏幕底部安全区之上。
  - 条款文本：11px 次级灰 `#888888`，居中排版，含协议链接 `Terms of Service` 与 `Learn more`。
  - 主按钮：高度 48px 纯黑胶囊按钮（`rounded-full`，白色加粗字 `Continue`）。
