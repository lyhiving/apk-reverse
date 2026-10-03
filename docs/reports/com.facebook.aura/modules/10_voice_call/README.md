# 模块十：Voice 语音通话与多模态交互（Voice & Audio Dictation）

本模块记录 Facebook Aura (Meta Muse) 的语音交互与听写转录系统。Aura 通过主对话输入栏底部的语音入口（Voice Input）实现了从系统麦克风鉴权、动态波形计时条（Waveform Recording Bar）、快捷取消（Cancel Dictation）到一键发送转录并驱动 Agent 实时回答的全链路语音多模态流，供 `/visual-verdict` skill 作为 390px 移动端 React 界面还原的视觉与逻辑基准。

---

## 1. 核心流程状态集

| 状态 ID | 状态说明 | 核心交互/控件 | 截图对应 |
|---|---|---|---|
| `VOICE_01` | **麦克风权限请求弹窗（Audio Permission）** | 原生系统级授权弹窗（`Allow Muse to record audio?`），选项：`While using the app`、`Only this time`、`Don’t allow` | `images/01_voice_initial_prompt.png` |
| `VOICE_02` | **离线语音模型更新提示（Offline Speech Prompt）** | 引导下载离线语音识别数据包弹窗（`Download English (US) update`，44.26 MB），支持 `Cancel` 或 `Download` | `images/02_voice_active_call_interface.png` |
| `VOICE_03` | **实时录音与计时交互条（Live Recording Bar）** | 输入栏状态切换为录音态：左侧取消图标 `Cancel dictation`、中间实时录音计时器（`0:16`）、右侧黑色圆形发送按钮 `Send message` | `images/03_voice_recording_state.png` |
| `VOICE_04` | **语音上屏与生成呼吸态（Voice Sent & Generating）** | 语音转文字气泡上屏，输入框右侧进入停止生成图标态（`Stop generating`） | `images/04_voice_sent_transcription.png` |
| `VOICE_05` | **AI 语音应答完成态（AI Speech Response）** | Agent 针对用户语音诉求生成的回答卡片流，支持点赞/点踩互动 | `images/05_voice_ai_response.png` |

---

## 2. 界面视觉还原参考（React / 390px Mobile-First）

### 01. 语音录制输入条（Voice Recording Input Bar）
- **尺寸与布局**：
  - 固定悬浮于底部导航栏之上（距底 60px），高度 56px。
  - 左侧操作：40×40px 圆形浅灰取消按钮（`X` 图标，`Cancel dictation`）。
  - 中间声波与计时区：
    - 字体采用等宽数字展示（如 `0:16`），字号 15px Medium，深黑 `#111111`。
    - 伴随音频输入展现动态声波高度律动（Height 4px~20px，间距 3px，颜色 `#111111`）。
  - 右侧发送按钮：
    - 40×40px 纯黑圆形按钮（`#000000`），白色向上箭头图标（`ArrowUp`），点击触发即时语音转录派发。

### 02. 语音流状态切换（State Transitions）
- 从普通文本输入态平滑滑动过渡到录音态，保持左侧附件 `Add attachment` 按钮位置锚定，隐藏文本输入框占位符，展开计时与声波组件。
