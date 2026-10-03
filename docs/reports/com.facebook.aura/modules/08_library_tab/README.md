# 模块八：Library 资产库与智能体系统文件（Library & Agent Filesystem）

本模块记录 Facebook Aura (Meta Muse) 的 Library 资产与记忆文件系统。Library 不仅是用户生成的工件（Artifacts）与多媒体资产（Media）归档中心，更是直通 Agent 底层 Unix/Markdown 文件树的系统文件浏览器（System Files），支持直接查看 Agent 自主编写的每日记忆（Daily Memory Notes）、系统配置与基础设施状态监控，供 `/visual-verdict` skill 作为 390px 移动端 React 界面还原的视觉与逻辑基准。

---

## 1. 核心流程状态集

| 状态 ID | 状态说明 | 核心交互/控件 | 截图对应 |
|---|---|---|---|
| `LIB_01` | **Artifacts 工件分段页（空状态）** | 顶部分段控制器（`Artifacts` / `Media`），空状态标题 `Nothing created yet`，说明文案与占位图标 | `images/01_library_main_screen.png` |
| `LIB_02` | **Media 多媒体资产分段页（空状态）** | 切换至 `Media` 选项卡，空状态标题 `No Media yet`，说明文案 | `images/02_library_media_tab.png` |
| `LIB_03` | **右上角更多操作菜单（More Menu）** | 导航栏右侧三点图标弹出的操作浮层，含 `System Files` 入口 | `images/03_library_more_menu.png` |
| `LIB_04` | **智能体系统文件树（System Files Browser）** | Agent 运行时文件目录列表（`agents/`、`assets/`、`config/`、`data/`、`docs/`、`dreams/`、`hooks/`、`memory/`、`side-chats/`、`subscriptions/`、`user/`） | `images/04_library_system_files.png` |
| `LIB_05` | **记忆目录子项流（Memory Directory）** | `memory/` 子目录，包含分类文件夹（`bank/`、`groups/`、`people/`）及按日期归档的每日 Markdown 记录 | `images/05_library_system_files_memory.png` |
| `LIB_06` | **每日记忆 Markdown 查看器（Memory Note Viewer）** | 沉浸式阅读器，展示 Agent 自主记录的当日系统状态变更、低余额警告、SSH 异常登录与域名到期事件 | `images/06_library_file_viewer.png` |

---

## 2. 界面视觉还原参考（React / 390px Mobile-First）

### 01. 顶部双 Tab 分段控制器（Segmented Control）
- **布局形式**：
  - 胶囊型水平分段切换条，容器高 44px，背景次级浅灰 `#F3F4F6`，内边距 4px，圆角 22px。
  - 两个等宽 Tab：`Artifacts` 与 `Media`。
  - 选中态：白色滑块底色，加阴影 `shadow-sm`，文本加粗 `#111111`；未选中态文本中灰 `#6B7280`。

### 02. 空状态卡片（Empty State View）
- **视觉层级**：
  - 垂直居中展示于屏幕主体（距顶约 35%）。
  - 图标：极简线条几何轮廓，浅灰着色。
  - 主标题：18px，Bold，深黑 `#111111`（`Nothing created yet` / `No Media yet`）。
  - 引导文案：14px，常规字重，次级灰 `#6B7280`，文本居中对齐，最大宽度 300px。

### 03. 智能体系统文件浏览器（Agent System Files）
- **行项目排版（File Row Item）**：
  - 高度 64px，左右外边距 16px，底部 `1px solid #F3F4F6` 分割线。
  - 左侧图标：文件夹（Folder）采用金黄色/淡蓝轮廓图标（24×24px）；Markdown 文件采用灰色文件徽标。
  - 中间信息区：
    - 主文件名/目录名：15px Medium，`#111111`，单行截断。
    - 次级元数据：12px Regular，`#9CA3AF`（如 `Folder`、`MD · 1.9 KB`）。
  - 右侧状态：极简灰箭头 `ChevronRight` 或纯留白热区。

### 04. Markdown 记忆笔记查看器（Markdown Note Reader）
- **布局与排版**：
  - 顶部导航：左侧返回箭头（44×44px 热区），中间文件名（如 `2026-10-03.md`），右侧预留操作区。
  - 正文排版：
    - 顶部说明块（Callout）：圆角背景 `#F9FAFB`，浅灰边框，13px 提示 Agent 记忆说明。
    - 大标题 H1（如 `2026-10-03`）：22px Bold，字距紧凑。
    - 二级标题 H2（如 `State updates`）：16px Semibold，上边距 16px。
    - 项目符号列表：带圆点标记 `•`，行间距 1.5，深黑正文，时间戳高亮。
