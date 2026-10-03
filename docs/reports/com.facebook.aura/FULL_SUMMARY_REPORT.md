# Facebook Aura (Meta Muse) 全链路逆向分析、视觉资产与 390px 页面全景汇总报告

> **目标样本**：`com.facebook.aura_9.0.0.23.178-1061401224_minAPI29(arm64-v8a)(nodpi)_apkmirror.com.apk`  
> **应用名称**：`Muse` (Facebook Aura) | **版本**：`9.0.0.23.178` (`1061401224`)  
> **Target SDK**：`36` (Android 15) | **Min SDK**：`29` (Android 10)  
> **包名**：`com.facebook.aura` | **SHA-256**：`96481a3f85b9789ad234115d82a5c3fbfdf4e2a89ade3c20f8d0ca17866f1f32`  
> **测试环境**：Android 15 ARM64 模拟器 (`emulator-5554`, 1080×2400)  
> **全量资产**：包含 12 个业务模块全生命周期 68 张高精度真机截图、57 枚直接内联渲染的原生提取素材（Lottie、Opus/MP3、WebP、40×40 图标），专为 `/visual-verdict` 技能提供一站式 React 390px Mobile-First 复刻基准。

---

## 目录索引
1. [架构总览与 13 项逆向标准分类](#1-架构总览与-13-项逆向标准分类)
2. [原生多媒体与视觉资产图库（提取成果）](#2-原生多媒体与视觉资产图库提取成果)
3. [全量 12 业务模块全景截图与交互规范（Modules 01 ~ 12）](#3-全量-12-业务模块全景截图与交互规范modules-01--12)
   - [模块一：登录鉴权与 OTP 验证 (Auth)](#模块一登录鉴权与-otp-验证-auth)
   - [模块二：系统设置与法律支持 (Settings)](#模块二系统设置与法律支持-settings)
   - [模块三：主对话流与主动预警 (Main Chat)](#模块三主对话流与主动预警-main-chat)
   - [模块四：侧边抽屉与多会话管理 (Side Panel)](#模块四侧边抽屉与多会话管理-side-panel)
   - [模块五：AI 驱动动态资讯流 (Feed)](#模块五ai-驱动动态资讯流-feed)
   - [模块六：灵感探索与任务派生 (Ideas)](#模块六灵感探索与任务派生-ideas)
   - [模块七：长周期目标与任务追踪 (Goals)](#模块七长周期目标与任务追踪-goals)
   - [模块八：资产库与智能体系统文件 (Library)](#模块八资产库与智能体系统文件-library)
   - [模块九：好友邀请与裂变增长 (Invite)](#模块九好友邀请与裂变增长-invite)
   - [模块十：语音通话与多模态交互 (Voice)](#模块十语音通话与多模态交互-voice)
   - [模块十一：Connectors、Wallet 与集成中心 (Hub)](#模块十一connectorswallet-与集成中心-hub)
   - [模块十二：商业化订阅与升级付费墙 (Upgrade)](#模块十二商业化订阅与升级付费墙-upgrade)
4. [390px Mobile-First React 统一复刻规范与设计系统](#4-390px-mobile-first-react-统一复刻规范与设计系统)

---

## 1. 架构总览与 13 项逆向标准分类

| # | 检查项 | 判定状态 | 实测观察结论 (`observed`) | 逆向工程影响与应对 |
|---|---|---|---|---|
| **1** | **加壳/加固状态** | **未加壳** | `Application` 为官方原生类 `com.facebook.aura.app.AuraApplication`，5 个 DEX 结构完整规范。 | 代码层无反编译混淆壳，可用 DEX/Smali 工具直接反编译。 |
| **2** | **业务逻辑归属层** | **三层混合** | 业务 UI：Jetpack Compose + Meta Bloks；核心运行时：36 个 arm64 `.so`；配置中枢：GraphQL + MobileConfig。 | 本地 Patch 可改写 UI 排队门禁，核心推理依赖服务端 GraphQL。 |
| **3** | **代码载体技术栈** | **Compose + Native** | DEX 字节码 + Native (`libtigon`, `libwebrtc`, MCP SDK)。无 Flutter/Dart、无 Unity。 | 标准 Android DEX 与 JNI Native 逆向工具链。 |
| **4** | **交付物约束** | **独立安装包** | 需保持联网通信及合法用户 Token 会话。 | 标准签名重打包交付形态。 |
| **5** | **签名校验机制** | **双重签名校验** | `AppIdentity` 检查包指纹，Tigon 底层捆绑 Meta 官方 TLS 证书。 | 重打包需 Hook 签名计算方法。 |
| **6** | **运行环境要求** | **64 位 ARM** | 原生库仅收录 `arm64-v8a`，`minSdkVersion=29` (Android 10+)。 | 必须在 ARM64 模拟器或实体机运行，不支持 x86_64 原生直跑。 |
| **7** | **执行架构** | **Native JNI 驱动** | 36 个 `arm64-v8a` 动态链接库。 | 高性能网络与媒体流走 Native，反编译需结合 Ghidra/IDA。 |
| **8** | **网络与 TLS 特征** | **Tigon + OHTTP** | 依托 Meta 自研 Tigon 协议栈，结合 Fastly OHTTP 匿名中继。 | 系统级 Wi-Fi 代理失效，需在 Native/JNI 挂钩 Tigon 发包函数。 |
| **9** | **样本来源纯净度** | **官方 Release** | `aura_android_arm64_release_fbsign` 渠道签名。 | 无第三方注入代码，纯净基线。 |
| **10**| **证书派生密钥** | **内部 IPC 派生** | 存在读取系统签名生成 AppIdentity 验证凭据的逻辑。 | 重打包需修改派生源头返回值。 |
| **11**| **自杀/抗调试** | **常规级别** | 集成 `libbreakpad.so` 异常收集；未集成驱动级反调试/ptrace 自杀进程。 | 允许直接附加 GDB/LLDB 调试与 Frida 动态注入。 |
| **12**| **版本更新机制** | **动态远程配置** | 集成 `oxygen.preloads.sdk` 与 MobileConfig 动态参数系统。 | 需屏蔽预装与强更广播接收器。 |
| **13**| **账号与访问网关**| **AuraActivation** | 基于 `HatchActivationGateViewModel` 与枚举 `ActivationState`。 | 改写 `isGateRequired()` 可直接绕过等待名单排队页面。 |

---

## 2. 原生多媒体与视觉资产图库（提取成果）

本仓库已从 APK 内部解混淆提取出全套多媒体与矢量动效资产，存放于 `extracted_assets/`。

### 01. Muse 角色多状态立绘（480×480 WebP / PNG）
| 日间待机态 (`aura_bot_body.webp`) | 夜间暗黑态 (`aura_bot_body_night.webp`) | 思考/工作高亮态 (`aura_bot_working.webp`) | 穿戴硬件机器人 (`hatch_wearables_jollybot.png`) |
|:---:|:---:|:---:|:---:|
| <img src="extracted_assets/character_avatars/aura_bot_body.webp" width="130"/> | <img src="extracted_assets/character_avatars/aura_bot_body_night.webp" width="130"/> | <img src="extracted_assets/character_avatars/aura_bot_working.webp" width="130"/> | <img src="extracted_assets/character_avatars/hatch_wearables_jollybot.png" width="130"/> |

### 02. 官方品牌标识与裂变大插画
| Muse 品牌标 | Meta AI 光环 | 邀请礼盒大插画 | 10 亿 Token 金币奖励 |
|:---:|:---:|:---:|:---:|
| <img src="extracted_assets/branding_and_illustrations/muse_wordmark.png" width="140"/> | <img src="extracted_assets/branding_and_illustrations/meta_ai_icon.png" width="64"/> | <img src="extracted_assets/branding_and_illustrations/hatch_invite_gift_illustration.webp" width="140"/> | <img src="extracted_assets/branding_and_illustrations/hatch_invite_reward_coins_illustration.webp" width="140"/> |

### 03. Library 资产库 28 枚原生文件图标矩阵（40×40 PNG）
| 文件夹 | 展开目录 | Markdown 记忆 | 智能体工作流 | 基础工件 | 构建产物 | 代码文件 | 纯文本 |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| <img src="extracted_assets/system_file_icons/hatch_file_types_folder_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_folderopen_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_markdown_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_agentic_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_artifact_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_buildartifact_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_code_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_document_40.png" width="36"/> |
| **检索索引** | **Word 档** | **Excel 表格** | **PPT 幻灯** | **Google Slides** | **PDF 格式** | **HTML 网页** | **Git 仓库** |
| <img src="extracted_assets/system_file_icons/hatch_file_types_documentsearch_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_worddocument_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_excelspreadsheet_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_powerpoint_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_googleslides_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_pdf_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_html_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_git_40.png" width="36"/> |
| **音频录音** | **视频回退** | **图片媒体** | **压缩归档** | **日历日程** | **定时任务** | **待办待办** | **核销凭据** |
| <img src="extracted_assets/system_file_icons/hatch_file_types_audio_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_videofallback_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_imagefallback_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_zip_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_calendar_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_clock_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_todo_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_check_40.png" width="36"/> |
| **代发邮件** | **消息片段** | **安全审计** | **红心收藏** |  |  |  |  |
| <img src="extracted_assets/system_file_icons/hatch_file_types_emailsent_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_message_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_shield_40.png" width="36"/> | <img src="extracted_assets/system_file_icons/hatch_file_types_heart_40.png" width="36"/> |  |  |  |  |

### 04. 连接器、钱包与生态图标
| Shop Pay 钱包 | Link by Stripe | Health Connect | 系统日历 | 即时聊天 | 通话记录 | 系统通知 | FB 圆标 | IG 圆标 |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| <img src="extracted_assets/connector_and_brand_icons/hatch_connector_shoppay.png" width="36"/> | <img src="extracted_assets/connector_and_brand_icons/hatch_connector_stripe.png" width="36"/> | <img src="extracted_assets/connector_and_brand_icons/health_connect_icon.webp" width="36"/> | <img src="extracted_assets/connector_and_brand_icons/hatch_connector_genericcal.png" width="36"/> | <img src="extracted_assets/connector_and_brand_icons/hatch_connector_genericchat.png" width="36"/> | <img src="extracted_assets/connector_and_brand_icons/hatch_connector_genericphone.png" width="36"/> | <img src="extracted_assets/connector_and_brand_icons/hatch_connector_genericnotifs.png" width="36"/> | <img src="extracted_assets/connector_and_brand_icons/facebook_logo_round.png" width="36"/> | <img src="extracted_assets/connector_and_brand_icons/instagram_logo_round.png" width="36"/> |

### 05. 核心 Lottie 动效与交互提示音效
- **Lottie 动效**：
  - `animations_lottie/hatch_logo_intro.json`（81 帧，Splash 唤醒单次播放）
  - `animations_lottie/hatch_logo_outro.json`（31 帧，Logo 缩小过渡单次播放）
  - `animations_lottie/hatch_ptr_loader.json`（360 帧，下拉刷新无限循环）
  - `animations_lottie/hatch_loading_gesture.json`（360 帧，任务执行呼吸动效）
- **语音音效（Opus / MP3 / WAV 48kHz）**：
  - `audio_sound_effects/hatch_voice_call_start.[mp3|opus|wav]`（0.4 秒，双频上扬接通提示音）
  - `audio_sound_effects/hatch_voice_call_end.[mp3|opus|wav]`（0.4 秒，双频柔和下降挂断提示音）

---

## 3. 全量 12 业务模块全景截图与交互规范（Modules 01 ~ 12）

### 模块一：登录鉴权与 OTP 验证 (Auth)
Aura 鉴权采用“邮箱输入 -> 6 位动态 OTP 校验码 -> 状态机分发”的标准无密码/验证码登录体系。

| 01 欢迎与邮箱输入 | 02 邮箱填入就绪态 | 03 验证码输入框 | 04 验证码填满态 | 05 会话错误拦截 |
|:---:|:---:|:---:|:---:|:---:|
| <img src="modules/01_auth/images/01_welcome_screen.png" width="160"/> | <img src="modules/01_auth/images/02_email_entered.png" width="160"/> | <img src="modules/01_auth/images/03_otp_code_prompt.png" width="160"/> | <img src="modules/01_auth/images/04_otp_code_filled.png" width="160"/> | <img src="modules/01_auth/images/05_invalid_session_dialog.png" width="160"/> |
| **06 兜底密码模式** | **07 网页账户找回** | **08 验证码过期提示** | **09 校验成功流转** |  |
| <img src="modules/01_auth/images/06_password_screen.png" width="160"/> | <img src="modules/01_auth/images/07_web_account_recovery.png" width="160"/> | <img src="modules/01_auth/images/08_otp_expired_error.png" width="160"/> | <img src="modules/01_auth/images/09_otp_filled_success.png" width="160"/> |  |

- **核心交互规范**：
  - 邮箱输入框高度 48px，`rounded-xl`，背景 `#F3F4F6`，无边框。
  - OTP 验证框由 6 个独立 44×54px 的输入单元格组成，自动聚焦与剪贴板一键粘贴填充。
  - 底部重新发送验证码（`Resend code`）带 60s 动态倒计时。

---

### 模块二：系统设置与法律支持 (Settings)
包含未登录/已登录两种形态的系统偏好设置、问题反馈工单系统与法律合规协议展示。

| 01 未登录设置主页 | 02 帮助与支持中心 | 03 问题报告工单 | 04 反馈提交确认 |
|:---:|:---:|:---:|:---:|
| <img src="modules/02_settings/images/01_settings_root.png" width="160"/> | <img src="modules/02_settings/images/02_help_and_support.png" width="160"/> | <img src="modules/02_settings/images/03_report_issue_screen.png" width="160"/> | <img src="modules/02_settings/images/04_contact_support_feedback.png" width="160"/> |
| **05 法律条款列表** | **06 Muse 补充隐私协议** | **07 已登录中枢主页** |  |
| <img src="modules/02_settings/images/05_legal_info_list.png" width="160"/> | <img src="modules/02_settings/images/06_muse_supplemental_privacy_policy.png" width="160"/> | <img src="modules/02_settings/images/07_authenticated_settings_root.png" width="160"/> |  |

- **核心交互规范**：
  - 分组列表采用卡片包裹，分割线 `#E5E7EB` 边距 16px。
  - 问题上报表单包含多行文本域（`min-h-[120px]`）与截图附件上传区。
  - 隐私条款使用内置 Chrome Custom Tabs / WebView 容器呈现，顶部附带关闭与分享操作。

---

### 模块三：主对话流与主动预警 (Main Chat)
Muse 核心交互中枢，支持主动任务预警（催缴电费/账单）、图文流式响应与快捷输入附件面板。

| 01 主对话与预警卡片 | 02 输入框激活与附件 | 03 流式回复生成态 | 04 回答完成态与互动 |
|:---:|:---:|:---:|:---:|
| <img src="modules/03_main_chat/images/01_chat_main_screen.png" width="160"/> | <img src="modules/03_main_chat/images/02_chat_input_typing.png" width="160"/> | <img src="modules/03_main_chat/images/03_chat_response_streaming.png" width="160"/> | <img src="modules/03_main_chat/images/04_chat_response_completed.png" width="160"/> |

- **核心交互规范**：
  - 顶部主动预警（`Pay Duke Energy bill`）采用淡暖黄背景 `#FFFBEB`，左侧预警图标，右侧行动按钮 `Pay bill`。
  - 输入框常态高度 48px，圆角 `rounded-full`，左侧加号附件按钮（`+`），右侧录音/发送切换。
  - 流式回答尾部伴随闪烁光标与 `Stop generating` 红色方块中断控件。

---

### 模块四：侧边抽屉与多会话管理 (Side Panel)
负责承载历史会话组织、快速新开对话、归档归档管理（Archived）以及一键清空记录的交互抽屉。

| 01 侧边抽屉展开态 | 02 空会话待机态 | 03 活跃对话记录流 | 04 归档对话管理 |
|:---:|:---:|:---:|:---:|
| <img src="modules/04_side_panel/images/01_side_panel_drawer.png" width="160"/> | <img src="modules/04_side_panel/images/02_side_chat_empty_session.png" width="160"/> | <img src="modules/04_side_panel/images/03_side_panel_active_threads.png" width="160"/> | <img src="modules/04_side_panel/images/04_side_panel_archived_chats.png" width="160"/> |

- **核心交互规范**：
  - 抽屉宽度 300px（占屏幕宽度约 78%），附带 `#000000/40` 半透明遮罩层。
  - 会话项支持左滑归档/重命名，长按呼出删除二次确认对话框。
  - 顶部常驻快捷搜索与 `New chat` 药丸按钮。

---

### 模块五：AI 驱动动态资讯流 (Feed)
Aura 的内容消费与启发模块，将 Agent 每日从全球网络中根据用户兴趣定制的资讯、深度分析与摘要结构化推送。

| 01 资讯流主界面 | 02 微调提示词弹窗 | 03 资讯卡片瀑布流 | 04 全屏富媒体查看器 | 05 一键 Discuss 跨模块吸附 |
|:---:|:---:|:---:|:---:|:---:|
| <img src="modules/05_feed_tab/images/01_feed_main_screen.png" width="160"/> | <img src="modules/05_feed_tab/images/02_feed_edit_prompt_dialog.png" width="160"/> | <img src="modules/05_feed_tab/images/03_feed_articles_stream.png" width="160"/> | <img src="modules/05_feed_tab/images/04_feed_media_fullscreen.png" width="160"/> | <img src="modules/05_feed_tab/images/05_feed_discuss_chat_handoff.png" width="160"/> |

- **核心交互规范**：
  - 顶部动态卡片展示今日 Prompt 指引，点击右上角铅笔弹出半屏微调弹窗（`Edit interests`）。
  - 文章卡片左侧包含大圆角配图，右侧文章标题、媒体来源及发布时间戳。
  - 卡片底部 `Discuss with Muse` 按钮点击后平滑过渡至主对话流，自动携带文章上下文。

---

### 模块六：灵感探索与任务派生 (Ideas)
将 AI 的启发性建议转化为现实中可执行的周期性或即时性自动化任务。

| 01 灵感探索主页 | 02 灵感详情半屏抽屉 | 03 更多操作菜单 | 04 任务执行中会话 | 05 任务计划落地方案 |
|:---:|:---:|:---:|:---:|:---:|
| <img src="modules/06_ideas_tab/images/01_ideas_main_screen.png" width="160"/> | <img src="modules/06_ideas_tab/images/02_ideas_bottom_sheet_detail.png" width="160"/> | <img src="modules/06_ideas_tab/images/03_ideas_more_actions_menu.png" width="160"/> | <img src="modules/06_ideas_tab/images/04_ideas_executed_session.png" width="160"/> | <img src="modules/06_ideas_tab/images/05_ideas_ai_response_plan.png" width="160"/> |

- **核心交互规范**：
  - 灵感卡片以标签聚合（如 `Productivity`、`Learning`），配备独立主题色彩。
  - 点击卡片从底部滑出 60% 高度 Modal Sheet，内含详细执行步骤与周期任务开关（`Recurring task: ON/OFF`）。
  - 底部吸底黑色大按钮 `Let's do it` 点击后自动派发 Agentic 工作流。

---

### 模块七：长周期目标与任务追踪 (Goals)
管理跨越数天至数周的长周期目标（如健身、求职、项目推进），支持拆解子目标（Subgoals）与打勾核销。

| 01 Goals 目标追踪主页 | 02 创建目标多轮引导 | 03 单项更多操作菜单 | 04 展开目标瀑布流 | 05 目标详情与进度 |
|:---:|:---:|:---:|:---:|:---:|
| <img src="modules/07_goals_tab/images/01_goals_main_screen.png" width="160"/> | <img src="modules/07_goals_tab/images/02_goals_create_prompt.png" width="160"/> | <img src="modules/07_goals_tab/images/03_goals_item_more_menu.png" width="160"/> | <img src="modules/07_goals_tab/images/04_goals_expanded_list.png" width="160"/> | <img src="modules/07_goals_tab/images/05_goal_detail_view.png" width="160"/> |

- **核心交互规范**：
  - 目标卡片左侧为圆圈复选框（点击触发打勾动效），右侧三点菜单包含 `Complete`、`Add subgoal`、`Rename`、`Delete`。
  - 新建目标采用对话式分步气泡引导，支持自然语言拆解任务。
  - 进度条（Progress bar）高度 4px，圆角 `rounded-full`，填充色使用深黑 `#111111`。

---

### 模块八：资产库与智能体系统文件 (Library)
展示用户生成的工件（Artifacts）、媒体文件，以及 Agent 的核心底层系统文件系统（`memory/`、`dreams/`、`config/`）。

| 01 资产库 Artifacts 列表 | 02 媒体资产 Media 分栏 | 03 资产操作操作菜单 | 04 系统文件目录树 | 05 每日记忆 Markdown 文件 | 06 文档在线代码查看器 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| <img src="modules/08_library_tab/images/01_library_main_screen.png" width="160"/> | <img src="modules/08_library_tab/images/02_library_media_tab.png" width="160"/> | <img src="modules/08_library_tab/images/03_library_more_menu.png" width="160"/> | <img src="modules/08_library_tab/images/04_library_system_files.png" width="160"/> | <img src="modules/08_library_tab/images/05_library_system_files_memory.png" width="160"/> | <img src="modules/08_library_tab/images/06_library_file_viewer.png" width="160"/> |

- **核心交互规范**：
  - 顶部双分段胶囊切换器：`Artifacts` 与 `Media`。
  - 文件树采用紧凑折叠列表，左侧匹配系统 40×40 图标（如 `.md` 显示 Markdown 专属图标），右侧显示最后修改时间。
  - 查看器支持 Markdown 富文本渲染与源代码 Raw 视图一键切换。

---

### 模块九：好友邀请与裂变增长 (Invite)
Aura 的病毒式增长裂变机制，以专属邀请码、10 亿 Token 奖励及多渠道社交分享为主。

| 01 邀请半屏抽屉 | 02 邀请码一键复制反馈 | 03 呼出系统分享面板 |
|:---:|:---:|:---:|
| <img src="modules/09_invite_sheet/images/01_invite_bottom_sheet.png" width="180"/> | <img src="modules/09_invite_sheet/images/02_invite_code_copied.png" width="180"/> | <img src="modules/09_invite_sheet/images/03_invite_system_share_sheet.png" width="180"/> |

- **核心交互规范**：
  - 顶部礼盒大插画与大号标题 `Invite a friend`。
  - 邀请码展示卡片采用浅灰背景 `#F3F4F6`，字号 20px Monospace 加粗，点击后即时提示黑色 Toast `Copied to clipboard`。
  - 底部包含 `Share invite link` 主按钮与 Facebook/Instagram/WhatsApp 快捷分享入口。

---

### 模块十：语音通话与多模态交互 (Voice)
Aura 提供系统麦克风鉴权、动态波形录制计时、快捷取消听写与实时语音转录发送的全链路语音体验。

| 01 麦克风录音授权请求 | 02 离线语音识别模型提示 | 03 语音通话连接界面 | 03b 实时录音与波形计时条 | 04 语音转录发送中 | 05 AI 语音回复完成态 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| <img src="modules/10_voice_call/images/01_voice_initial_prompt.png" width="160"/> | <img src="modules/10_voice_call/images/02_voice_active_call_interface.png" width="160"/> | <img src="modules/10_voice_call/images/03_voice_connected_screen.png" width="160"/> | <img src="modules/10_voice_call/images/03_voice_recording_state.png" width="160"/> | <img src="modules/10_voice_call/images/04_voice_sent_transcription.png" width="160"/> | <img src="modules/10_voice_call/images/05_voice_ai_response.png" width="160"/> |

- **核心交互规范**：
  - 录音态输入条高度 56px，左侧圆形取消按钮（`X`），中间等宽计时器（如 `0:16`）与动态波形跳动，右侧纯黑圆形发送按钮。
  - 发送转录伴随 `hatch_voice_call_start` 音效播放，挂断伴随 `hatch_voice_call_end` 音效播放。

---

### 模块十一：Connectors、Wallet 与集成中心 (Hub)
Agent 操纵现实服务的核心连接器中枢：第三方数据读取授权（Gmail 等 MCP 粒度控制）、代下单钱包、账密安全库及智能硬件配对雷达。

| 01 设置中枢与额度 | 02 数据连接器市场 | 03 Gmail 细粒度权限控制 | 04 智能体自主钱包 | 05 凭据安全存储库 | 06 新建网站密码抽屉 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| <img src="modules/11_connectors_hub/images/01_settings_dashboard.png" width="160"/> | <img src="modules/11_connectors_hub/images/02_connectors_list.png" width="160"/> | <img src="modules/11_connectors_hub/images/03_connector_detail_gmail.png" width="160"/> | <img src="modules/11_connectors_hub/images/04_wallet_screen.png" width="160"/> | <img src="modules/11_connectors_hub/images/05_credentials_store.png" width="160"/> | <img src="modules/11_connectors_hub/images/06_credentials_add_login.png" width="160"/> |
| **07 外部消息通道** | **08 智能设备列表** | **09 设备配对鉴权** | **10 硬件搜索雷达** | **10b 扫描到新硬件** |  |
| <img src="modules/11_connectors_hub/images/07_messaging_channels.png" width="160"/> | <img src="modules/11_connectors_hub/images/08_devices_screen.png" width="160"/> | <img src="modules/11_connectors_hub/images/09_devices_add_device.png" width="160"/> | <img src="modules/11_connectors_hub/images/10_devices_pairing_radar.png" width="160"/> | <img src="modules/11_connectors_hub/images/10_devices_pairing_scan.png" width="160"/> |  |

- **核心交互规范**：
  - 连接器条目高度 64px，左侧 40×40 品牌彩色图标，中间功能名与来源，右侧 `Connect` 胶囊按钮（未连）或右箭头 `ChevronRight`（已连）。
  - MCP 权限细分 `Read permissions` 与 `Write/Delete`，每一项配独立开关，提供高透明度隐私控制。
  - 硬件配对半屏抽屉配备声纳波纹动画与 `Searching…` 动态呼吸渐变。

---

### 模块十二：商业化订阅与升级付费墙 (Upgrade)
每周 Token 算力扩容付费墙，针对高阶用户提供 `Power`（5 亿 Token/周）与 `Maximum`（30 亿 Token/周）阶梯订阅。

| 01 升级付费墙半屏抽屉 | 02 套餐方案选中态 | 03 Google Play 结账确认 |
|:---:|:---:|:---:|
| <img src="modules/12_subscription_upgrade/images/01_upgrade_paywall_sheet.png" width="180"/> | <img src="modules/12_subscription_upgrade/images/02_upgrade_plan_selected.png" width="180"/> | <img src="modules/12_subscription_upgrade/images/03_upgrade_payment_checkout.png" width="180"/> |

- **核心交互规范**：
  - 套餐卡片纵向排布，高度 100px，未选中态浅灰背景 `#F7F7F8`，选中态采用 2px 纯黑外边框高亮。
  - 底部吸底条款文本字号 11px，包含服务条款与隐私政策超链接。
  - 主操作按钮为高度 48px 纯黑胶囊按钮，白色加粗字 `Continue`。

---

## 4. 390px Mobile-First React 统一复刻规范与设计系统

为保障 `/visual-verdict` skill 能够一比一像素级复刻 Facebook Aura 的原生质感，全套界面需严格遵守以下统一设计系统契约：

### 01. 移动端视口与间距约束 (Layout Constraints)
- **基准设备宽度**：`w-[390px]` 移动端优先，固定屏幕外边距 `px-4`（16px）或极窄边距 `px-3`（12px）。
- **水平防溢出**：严禁出现水平滚动轴，强制在容器根节点声明 `overflow-x-hidden min-h-screen`。
- **触控热区**：所有独立按钮、列表点击项及图标的点击热区必须保证 `min-h-[44px] min-w-[44px]`。
- **安全区防遮挡**：底部常驻导航栏与操作区必须包含 `pb-[env(safe-area-inset-bottom,16px)]`。

### 02. 主题色彩系统 (Color Palette)
- **主背景色**：
  - 日间浅色：`#FFFFFF` (主页面背景) / `#F9FAFB` (次级卡片底色) / `#F3F4F6` (输入框与未选中态)。
  - 夜间深色：`#0A0A0C` (极黑底色) / `#16161A` (深色卡片背景)。
- **品牌与重点色**：
  - 主操作/文字：纯黑 `#000000` / 深灰 `#111111` / 正文 `#374151` / 辅助灰 `#6B7280`。
  - 警示与状态色：预警黄 `#FEF3C7` / `#D97706`；成功绿 `#DEF7EC` / `#059669`；强调蓝 `#EBF5FF` / `#1C64F2`。

### 03. 字体排印规范 (Typography System)
- **字体定义**：
  - 正文字体族：优先使用 `Optimistic Text`，回退系统 `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`。
  - 代码/数字字体：优先使用 `Roboto Mono` 或 `ui-monospace, monospace`。
- **层级字阶**：
  - 大标题（Header 1）：`text-[22px] font-bold leading-tight tracking-tight`
  - 卡片标题（Title）：`text-[16px] font-semibold leading-normal`
  - 正文（Body）：`text-[14px] font-normal leading-relaxed text-gray-700`
  - 辅助说明（Caption/Legal）：`text-[12px] font-normal leading-normal text-gray-500`

### 04. 统一复刻技术栈与依赖清单 (Tech Stack)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.453.0",
    "lottie-react": "^2.4.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4"
  }
}
```

---

## 5. 结论与交付物验证清单

1. **样本分析完整度**：完成 13 项标准分类全量评估，确认无第三方加固壳，分析并定位了 Tigon 网络中继与 `ActivationState` 激活状态机。
2. **业务流程覆盖度**：遍历了自首次登录、主对话、多会话抽屉、资讯流、灵感派发、目标追踪、资产库系统文件、好友邀请、语音交互、连接器钱包到订阅付费墙的 **全部 12 个业务模块**，采集并归档了 **68 张高精度界面截图**。
3. **原生资产提取完备度**：提取了解混淆的 57 枚核心多媒体与图标素材，包含 4 款 Muse 角色立绘形态、28 枚文件系统图标、品牌插画、4 组 Lottie 动画及无损/Web 兼容的语音提示音效。
4. **复刻规范可用性**：提供了结构化的 XML dump 层次、视觉参数表及标准的 390px Mobile-First React 示范代码，完全达到直接供 `/visual-verdict` 技能复刻的黄金基准。
