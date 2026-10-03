# 模块十一：Connectors、Wallet 与集成中心（Connectors, Wallet & Ecosystem）

本模块记录 Facebook Aura (Meta Muse) 的扩展能力中枢与外部系统互联集成体系。Aura 将 Agent 深度赋能为能够操作用户现实世界服务与物理设备的自主中枢，包含第三方数据连接器（Connectors，含 MCP 细粒度授权）、自主交易钱包（Wallet，集成 Shop Pay 与 Link by Stripe）、敏感登录凭据安全库（Secure Credentials Store）、多平台消息通道（Messaging Channels，如 WhatsApp）以及智能穿戴/边缘硬件配对雷达（Devices），供 `/visual-verdict` skill 作为 390px 移动端 React 界面还原的视觉与逻辑基准。

---

## 1. 核心流程状态集

| 状态 ID | 状态说明 | 核心交互/控件 | 截图对应 |
|---|---|---|---|
| `HUB_01` | **已登录设置中枢仪表盘（Settings Dashboard）** | 顶部套餐卡片（Free plan / 0% used / 升级）、集成能力导航菜单项 | `images/01_settings_dashboard.png` |
| `HUB_02` | **Connectors 数据连接器市场（Connectors Hub）** | 顶部搜索栏、`Connected`（已连接服务：Browser、Gmail）与 `Available`（待连接服务：Asana、Box、Calendar、Calendly、Call Log、Canva、Contacts、Dropbox） | `images/02_connectors_list.png` |
| `HUB_03` | **连接器细粒度权限控制（Connector Permissions）** | 以 Gmail 为例：关联账号列表、断开连接，细分 `Read permissions`（草稿、标签、邮件正文、搜索、设置）逐项开关 | `images/03_connector_detail_gmail.png` |
| `HUB_04` | **智能体自主钱包（Agent Wallet）** | 授权 Agent 安全代下单与交易卡片，支持绑定 `Shop Pay` 与 `Link by Stripe` | `images/04_wallet_screen.png` |
| `HUB_05` | **安全凭据存储库（Secure Credentials Store）** | Agent 专用的网站与服务器账密库，空状态引导与 `Add a login` 入口 | `images/05_credentials_store.png` |
| `HUB_06` | **新建密码半屏抽屉（Add Password Sheet）** | 网站（Website）、用户名/邮箱（Username or email）、密码（带显隐眼睛）及 `Enter` 提交 | `images/06_credentials_add_login.png` |
| `HUB_07` | **外部消息通道（Messaging Channels）** | 允许用户在其它即时通讯软件中与 Agent 对话，当前支持 `WhatsApp` 绑定 | `images/07_messaging_channels.png` |
| `HUB_08` | **智能硬件与穿戴设备（Devices List）** | 本机设备标识（`sdk_gphone64_arm64`）、历史设备（`Pixel9Fold`）、开发者模式未认证硬件开关、右上角 `Add a device` | `images/08_devices_screen.png` |
| `HUB_09` | **设备配对鉴权弹窗（Device Pairing Permissions）** | 蓝牙/BLE 相对定位与附近设备扫描系统授权弹窗 | `images/09_devices_add_device.png` |
| `HUB_10` | **硬件雷达搜索半屏（Pairing Radar Sheet）** | 动态雷达扫描态（`Connect a device` / `Searching…` / 保持电源接通与配对模式提示） | `images/10_devices_pairing_radar.png` |

---

## 2. 界面视觉还原参考（React / 390px Mobile-First）

### 01. 连接器列表项规范（Connector Row Item）
- **布局形式**：
  - 高度 64px，左侧 40×40px 第三方品牌彩色图标（如 Gmail 红蓝黄、Calendar 蓝方块）。
  - 中间标题与次级来源（如 `Calendar` + `From this device`），字号 15px Medium + 12px Regular。
  - 右侧主操作：胶囊型药丸按钮 `Connect`（黑色边框/黑色实心，高 32px，内边距横向 14px，圆角 16px）。已连接项则显示极简右箭头 `ChevronRight`。

### 02. MCP 细粒度权限开关流（Fine-grained Permission Toggles）
- **分组排版**：
  - 分组小标题：`Read permissions`、`Write and delete permissions`（13px 浅灰大写 Tracking）。
  - 每一权限条目（如 `Access drafts`）：左侧功能名称（15px Regular），右侧 Switch 开关或文字按钮（`Allow`），支持用户单独吊销对 Agent 的某些敏感操作授权。

### 03. 硬件设备搜索抽屉（Device Radar Sheet）
- **交互规范**：
  - 底部展开约 40% 的 Modal Sheet（`rounded-t-3xl`）。
  - 居中标题 `Connect a device`（18px Bold）。
  - 动画占位区：旋转声纳/雷达动画波纹（半径 48px），文本 `Searching…` 伴随呼吸渐变。
  - 引导文案：底部浅灰提示 `Make sure the device you are connecting is plugged in to a power source and in pairing mode.`（13px 次级灰）。
