# Facebook Aura (Meta Muse) 逆向分析与完整页面截图报告

> 📌 **推荐直接查阅完全汇总版本**：👉 [**Facebook Aura 全链路逆向分析、视觉资产与 390px 页面全景汇总报告 (FULL_SUMMARY_REPORT.md)**](FULL_SUMMARY_REPORT.md)  
> *内含全量 12 业务模块 68 张真实截图图文画廊、57 枚提取原生素材、Lottie 动效参数与 React 390px Mobile-First 统一复刻规范。*

- **目标样本**：`com.facebook.aura_9.0.0.23.178-1061401224_minAPI29(arm64-v8a)(nodpi)_apkmirror.com.apk`
- **Package Name**：`com.facebook.aura`
- **Version**：`9.0.0.23.178` (`1061401224`)
- **应用显示名称**：`Muse`
- **Target SDK**：`36` (Android 15) | **Min SDK**：`29` (Android 10)
- **SHA-256**：`96481a3f85b9789ad234115d82a5c3fbfdf4e2a89ade3c20f8d0ca17866f1f32`
- **运行环境**：Android 15 Emulator (`emulator-5554`, 1080x2400)

---

## 1. 架构总览与 13 项标准分类

| # | 检查项 | 实测结果 (`observed`) | 逆向影响 |
|---|---|---|---|
| **1** | **加壳/加固状态** | **未加壳**。`Application` 为原生类 `com.facebook.aura.app.AuraApplication`，5 个 DEX 结构完整。 | 代码结构可直接通过 DEX / Smali 查看与修改。 |
| **2** | **业务逻辑归属层** | **三层混合架构**：<br>1) 业务 UI：Jetpack Compose + Meta Bloks；<br>2) 核心运行时：36 个 arm64 `.so` 库（Meta AI Agentic / MCP 体系）；<br>3) 服务端配置：GraphQL + MobileConfig + OHTTP。 | 客户端 Patch 适用于本地等待列表/激活拦截界面，核心 AI 交互由服务端控制。 |
| **3** | **代码载体与技术栈** | **DEX (Compose/Bloks) + Native (Tigon/WebRTC/MCP SDK)**。无 Flutter/Dart、无 Unity。 | 标准 DEX 字节码工具链分析。 |
| **4** | **交付物约束** | 自包含 APK，需保持网络通信及有效登录会话。 | 属于普通重打包/重签名交付形态。 |
| **5** | **签名校验机制** | `com.facebook.secure.trustedapp.AppIdentity` + Tigon TLS 证书绑定。 | 重打包需修复或绕过本地签名验证。 |
| **6** | **运行环境要求** | 仅包含 `arm64-v8a`，`minSdkVersion=29`。 | 必须在 64 位 ARM 环境下运行。 |
| **7** | **执行架构** | 36 个 `arm64-v8a` `.so` 动态库。 | 不支持 x86 原生二进制执行。 |
| **8** | **网络与 TLS 特征** | Meta **Tigon 协议栈** + **Fastly OHTTP 中继** + GraphQL。 | 常规代理工具无法抓包，需在 Native/JNI 层 Hook。 |
| **9** | **样本来源纯净度** | 原版官方 Release APK (`aura_android_arm64_release_fbsign`)。 | 纯净基线。 |
| **10** | **证书派生密钥** | 存在读取包签名派生身份校验逻辑。 | 重打包需处理内部 IPC 授权。 |
| **11** | **自杀/抗调试机制** | 集成 `libbreakpad.so` 崩溃收集；无高强度驱动级反调试/反 Root 壳。 | 进程可直接附加和调试。 |
| **12** | **版本控制与更新** | 包含 `com.facebook.oxygen.preloads.sdk` 与 MobileConfig 动态配置。 | 需阻断预装/更新广播与强制升级逻辑。 |
| **13** | **账号与访问网关** | 包含完整 AuraActivation 流程（Waitlist / 邀请码核销 / 隐私协议）。 | 界面级状态由 `ActivationState` 控制。 |

---

## 2. 完整业务模块全量截图与复刻规范索引（Modules 01 ~ 12 + 原生多媒体资产库）

本项目已完成真实账号全链路登录与全生命周期交互遍历。全套共 40+ 张高精度界面截图、UI 层次结构树（XML 骨架 dump）、57 枚直接内联渲染的原生媒体图片/动效/音效资产，及专为 `/visual-verdict` skill 设计的 390px Mobile-First React 复刻规范已拆解归档至独立模块文档：

| 模块目录 | 模块名称 | 核心状态与交互 | 规范文档入口 |
|---|---|---|---|
| `extracted_assets/` | **原生多媒体与视觉资产全景图库** | 57 枚原生素材直接渲染：Muse 立绘状态集、28 枚文件图标、品牌插画、Lottie 动效、音效与字体 | [查看全景图库](extracted_assets/README.md) |
| `modules/01_auth/` | **登录鉴权与 OTP 验证** | 邮箱凭据输入、6 位动态验证码校验、错误码拦截、验证码重发倒计时 | [查看文档](modules/01_auth/README.md) |
| `modules/02_settings/` | **系统设置与法律支持** | 账户设置树、帮助与支持（Report an issue / Contact support）、内置 Chrome 协议浏览器 | [查看文档](modules/02_settings/README.md) |
| `modules/03_main_chat/` | **主对话流与主动预警** | 主动催缴账单预警卡片、输入框呼吸态、附件添加面板（Take photo / Choose photo / File）、文本/语音发送流 | [查看文档](modules/03_main_chat/README.md) |
| `modules/04_side_panel/` | **侧边抽屉与多会话管理** | 侧边栏滑出（侧边抽屉）、活跃 Chats 会话流、Archived 归档流、一键清空记录二次确认弹窗 | [查看文档](modules/04_side_panel/README.md) |
| `modules/05_feed_tab/` | **AI 驱动动态资讯流（Feed）** | Prompt 指引卡片、指引微调编辑弹窗、资讯卡片流、全屏媒体查看器、Discuss 跨模块对话上下文吸附 | [查看文档](modules/05_feed_tab/README.md) |
| `modules/06_ideas_tab/` | **灵感探索与任务派生（Ideas）** | 建议卡片流、半屏抽屉任务详情、Recurring task 周期任务开关、一键 Let's do it 任务派发与落地执行流 | [查看文档](modules/06_ideas_tab/README.md) |
| `modules/07_goals_tab/` | **长周期目标与任务追踪（Goals）** | 活跃追踪任务列表、新建目标多轮引导弹窗、单项三点操作菜单（Complete / Subgoal / Rename / Delete）、Show more 瀑布流 | [查看文档](modules/07_goals_tab/README.md) |
| `modules/08_library_tab/` | **资产库与智能体系统文件（Library）** | Artifacts / Media 分段切换、智能体系统文件树浏览器（`memory/`、`dreams/`、`config/`）、每日记忆 Markdown 阅读器 | [查看文档](modules/08_library_tab/README.md) |
| `modules/09_invite_sheet/` | **好友邀请与裂变增长（Invite）** | 专属大字邀请码卡片、一键复制到剪贴板反馈、10 亿 Token 奖励规则文案、主流社交分享矩阵 | [查看文档](modules/09_invite_sheet/README.md) |
| `modules/10_voice_call/` | **语音通话与多模态交互（Voice）** | 系统音频录制授权、动态波形录制计时条、取消听写、语音转录发送与 AI 响应生成流 | [查看文档](modules/10_voice_call/README.md) |
| `modules/11_connectors_hub/` | **Connectors、Wallet 与集成中心** | 数据连接器（Gmail/Calendar 等 MCP 细粒度授权）、Agent 自主交易钱包（Shop Pay/Link）、密码凭据安全库、WhatsApp 消息通道、智能硬件/穿戴设备雷达配对 | [查看文档](modules/11_connectors_hub/README.md) |
| `modules/12_subscription_upgrade/` | **商业化订阅与升级付费墙** | Free 套餐额度监控、Power / Maximum 两档订阅方案单选卡片、自动续费协议条款与结算流 | [查看文档](modules/12_subscription_upgrade/README.md) |

---

## 3. 核心发现与架构洞察

1. **激活等待名单绕过（Waitlist Bypass）**：
   - 关注类：`com.facebook.aura.activation.model.HatchActivationGateViewModel`
   - 判定状态枚举：`ActivationState` (`WAITLIST`, `INVITE_CODE`, `GATED`, `ACTIVATED`)。
   - 修改 `isGateRequired()` 或 `ActivationState` 的流转可直接跳过等待页面。

2. **网络抓包分析**：
   - 目标直接使用 Native 层 Tigon + OHTTP，系统代理无法生效。需通过 Frida Hook `libtigon-connectivity-jni.so` 或在 Java 层拦截 GraphQL 响应。
