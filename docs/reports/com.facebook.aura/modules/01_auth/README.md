# 模块一：用户认证与登录流（Authentication & Onboarding Flow）

本模块记录 Facebook Aura (Meta Muse) 的全套身份认证界面、表单交互状态、验证码填写以及边界异常弹窗，供 `/visual-verdict` skill 作为 390px 移动端 React 界面还原的视觉与逻辑基准。

---

## 1. 核心流程状态集

| 状态 ID | 状态说明 | 核心交互/控件 | 截图对应 |
|---|---|---|---|
| `AUTH_01` | **欢迎登录首屏** | 手机/邮箱输入框、Settings 按钮、Continue 按钮（默认禁用） | `images/01_welcome_screen.png` |
| `AUTH_02` | **凭据输入完成态** | 填入合法邮箱后，Continue 按钮由浅灰变为高亮可点击态 | `images/02_email_entered.png` |
| `AUTH_03` | **OTP 验证码等待态** | 6 槽位独立输入框、动态倒计时与重发链接、切换密码登录入口 | `images/03_otp_code_prompt.png` |
| `AUTH_04` | **OTP 验证码填写态** | 6 位数字全部填入（`737821`），准备向服务端核销 | `images/04_otp_code_filled.png` |
| `AUTH_05` | **异常弹窗态（Invalid Request）** | 会话超时/失效模态弹窗，含居中提示与单主操作按钮 OK | `images/05_invalid_session_dialog.png` |
| `AUTH_06` | **密码兜底登录态** | 密码输入框、明文切换眼睛图标、Forgot password? 链接 | `images/06_password_screen.png` |
| `AUTH_07` | **Web 找回与恢复页（Meta Auth）** | Chrome Custom Tabs 托管的 `auth.meta.com` 账号安全恢复页面 | `images/07_web_account_recovery.png` |
| `AUTH_08` | **OTP 验证码失效/错误提示态** | 红色/错误提示文案 `Please request another code and try again`，Next 禁用 | `images/08_otp_expired_error.png` |

---

## 2. 界面视觉还原参考（React / 390px Mobile-First）

### 01. 欢迎与凭据输入首屏 (`01_welcome_screen.png`)
![Welcome](images/01_welcome_screen.png)
- **容器布局**：纵向居中布局，两翼 padding 为 16px。
- **元素层级**：
  1. 顶部导航栏（透明背景，右上角为设置齿轮按钮）。
  2. 居中应用 Logo / 欢迎文案：`Welcome to Muse`（粗体 28px）。
  3. 输入框（圆角 12px，背景微灰，悬浮提示 `Mobile number or email`）。
  4. 提示说明小字（12px 浅灰色）。
  5. 底部固定/跟随主按钮：`Continue`（圆角全宽按钮）。

---

### 02. 输入完成态 (`02_email_entered.png`)
![Email Entered](images/02_email_entered.png)
- **状态变化**：Continue 按钮高亮为可交互主色（黑色/深色），键盘弹出时不遮挡输入框。

---

### 03. 验证码输入框与切换入口 (`03_otp_code_prompt.png`)
![OTP Prompt](images/03_otp_code_prompt.png)
- **组件结构**：
  - 提示标题：`Enter your code to log in`
  - 动态提示：`We sent your code to lyhiving@gmail.com... Resend code`
  - 6 槽位数字验证码组件（分段式方框或下划线）。
  - 下方操作链：`Next` 主按钮 + `Try another way` / `Use password instead` 辅助文本按钮。

---

### 04. 验证码填满状态 (`04_otp_code_filled.png`)
![OTP Filled](images/04_otp_code_filled.png)
- **交互逻辑**：6 个数字槽位填满后，高亮 Next 按钮或直接触发自动提交。

---

### 05. 会话失效异常弹窗 (`05_invalid_session_dialog.png`)
![Invalid Session](images/05_invalid_session_dialog.png)
- **模态弹窗规格**：
  - 居中卡片（宽度约 80%，圆角 20px，背景白色，外层暗色遮罩）。
  - 标题：`Invalid Request`（居中加粗 18px）。
  - 正文：`Something went wrong with your login session. Please close this page and try again.`（居中 14px）。
  - 单按钮：`OK`（全宽实心按钮，点击关闭弹窗重试）。

---

### 06. 密码登录备用页面 (`06_password_screen.png`)
![Password Screen](images/06_password_screen.png)
- **表单布局**：
  - 标题：`Enter your password`
  - 说明：`To log in, enter the password associated with lyhiving@gmail.com.`
  - 密码输入框（带尾部密码可见性切换 Toggle 按钮）。
  - `Next` 按钮 + `Forgot password?` 找回密码链接。

---

### 07. Web 托管账号安全恢复页 (`07_web_account_recovery.png`)
![Web Account Recovery](images/07_web_account_recovery.png)
- **容器与承载**：
  - 由 Chrome Custom Tabs 加载托管的 Meta 官方认证域 `auth.meta.com`。
  - 顶部原生 Toolbar（含关闭 X 按钮及当前域名安全锁）。
  - 居中展示 Meta Logo 及 `Forgot password?` 安全找回表单。
  - 支持手机/邮箱重置查找与安全邮件核验。

---

### 08. 验证码校验失败/失效提示态 (`08_otp_expired_error.png`)
![OTP Expired Error](images/08_otp_expired_error.png)
- **交互与视觉规范**：
  - 6 个槽位填满后，如果服务端核销不通过或验证码已过期，输入框下方动态插入居中红色提示文案：`Please request another code and try again`（字号 14px，深红/警告色）。
  - 下方 `Next` 主操作按钮重置为灰色禁用态（`disabled`）。
  - 引导用户点击说明文案中的 `Resend code` 重新派发验证码。


