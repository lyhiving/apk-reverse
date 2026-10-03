# 模块三：AI 管家主对话流与卡片信息交互（Main Chat & Proactive Agent Cards）

本模块记录 Facebook Aura (Meta Muse) 最核心的 AI 交互首页。包含 Proactive 预警通知卡片流（腾讯云/阿里云/UptimeRobot/招行还款）、实时时间分割线、多态输入条（语音/键盘/发送切换/中止生成）、以及即时 Agent 状态机，供 `/visual-verdict` skill 作为 390px 移动端 React 界面还原的视觉与逻辑基准。

---

## 1. 核心流程状态集

| 状态 ID | 状态说明 | 核心交互/控件 | 截图对应 |
|---|---|---|---|
| `CHAT_01` | **主对话流默认首屏** | 历史同步卡片流、底部 5 Tab 导航栏、顶部 Agent 状态（pony）、Voice/Attachment 入口 | `images/01_chat_main_screen.png` |
| `CHAT_02` | **输入激活态（Typing & Send）** | 软键盘弹起、输入框变高、右侧麦克风平滑切换为黑色高亮 Send 发送按钮 | `images/02_chat_input_typing.png` |
| `CHAT_03` | **流式生成态（Streaming & Stop）** | 顶部显示 `pony is working` 动态状态、右侧出现红色/深色 Stop generating 停止按钮 | `images/03_chat_response_streaming.png` |
| `CHAT_04` | **回复完成态（Full Chat Feed）** | 用户右对齐药丸气泡、Agent 左对齐正文气泡、自动吸底与完整滚动流 | `images/04_chat_response_completed.png` |

---

## 2. 界面视觉还原参考（React / 390px Mobile-First）

### 01. 顶部状态栏与操作链
- **左上角**：`Open side panel`（抽屉汉堡按钮，Touch target 44×44px）。
- **居中标题区**：
  - 第一行：Agent 名称 `pony`（字号 17px，Semibold，居中）。
  - 第二行（生成时触发）：`is working`（字号 12px，次级灰，带动态微脉冲呼吸灯）。
- **右上角**：`Invite`（带胶囊微框或文字按钮，用于裂变邀请好友）。

---

### 02. 主动式通知卡片（Proactive Warning Cards）
Aura 的最大特色是 Agent 主动向用户汇报云服务、运维和账单动态：
1. **时间戳分割线（Date Divider）**：
   - 样式：居中显示，如 `OCT 3, 1:17 PM`、`OCT 3, 7:38 PM`、`2:03 AM`。
   - 字号 11px，浅灰大写，两翼无装饰线或微下沉。
2. **结构化卡片排版**：
   - 导语标题加粗（15px，如 `阿里云账户的事，跟你同步下：`）。
   - 正文内容（14px，行高 1.45，常规字重，含具体服务器名、额度及截止时间）。
   - 卡片背景：采用与聊天气泡一致或微凸起的圆角卡片（Corner radius 16px）。

---

### 03. 聊天气泡（Chat Bubbles）
- **用户气泡（User Bubble）**：
  - 右对齐（`justify-end`）。
  - 背景色：主强调色（黑色/深灰，或品牌色）。
  - 文本：白色 15px。
  - 圆角：右上平角/小圆角，其余三角为 18px 大圆角。
- **AI 助手气泡（Agent Bubble）**：
  - 左对齐（`justify-start`）。
  - 背景：微灰底色（`#F2F4F7`）或纯白卡片加轻微边框。
  - 文本：深黑 15px。
  - 圆角：左上平角，其余三角为 18px 大圆角。

---

### 04. 底部动态输入条（Floating Composer Bar）
- **组件构成**：
  1. `Add attachment`：左侧加号图标按钮（支持拍照/选图/传文件）。
  2. `Message` 文本域：
     - 未聚焦时提示 `Message`，聚焦后自动根据文字行数自适应增高。
     - 灰底圆角胶囊（Border radius 24px）。
  3. **右侧动态操作按钮（Action Switcher）**：
     - **无文字状态**：展示麦克风图标（`Voice input`，点击开启即时语音通话）。
     - **有文字状态**：平滑变换为黑色圆形箭头按钮（`Send message`）。
     - **生成中状态**：变为带正方形停止图标的按钮（`Stop generating`）。

---

### 05. 底部 5 大一级导航（Bottom Navigation Bar）
- 高度 64px，毛玻璃半透明底或纯白底加顶部 0.5px 分割线。
- 5 个均分 Tab 项（图标 + 选中文本）：
  1. `Chat`（主对话 - 当前高亮）
  2. `Feed`（动态资讯流）
  3. `Ideas`（灵感与探索）
  4. `Goals`（目标与长期任务追踪）
  5. `Library`（知识库、记忆与文件）
