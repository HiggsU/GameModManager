# 🎮 Game Mod Manager

一个现代、卡通风格的游戏 Mod 管理工具，让给游戏打 Mod 变得简单有趣！

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ 特性

- 🎯 **拖拽安装** - 直接拖拽 Mod 文件到目标目录，自动完成安装
- 📁 **多游戏支持** - 管理多个游戏的 Mod，每个游戏可配置多个目标目录
- 💾 **自动备份** - 安装前自动备份被替换的文件，安全无忧
- ↩️ **一键还原** - 支持单独还原或一键还原所有 Mod
- 📜 **完整记录** - 记录每次操作的详细信息，新增/替换文件一目了然
- 🎨 **卡通界面** - 现代卡通风格，符合游戏主题

## 📦 安装

### 前置要求

- Node.js 18+
- npm 或 yarn

### 开发环境运行

```bash
# 安装依赖
npm install

# 启动开发模式
npm run electron:dev
```

### 构建生产版本

```bash
# 构建应用
npm run electron:build
```

## 🚀 使用方法

### 1. 添加游戏

点击左侧 **"添加游戏"** 按钮：
- 输入游戏名称
- 选择游戏根目录（游戏安装目录）

### 2. 配置目标目录

在游戏详情页，点击 **"添加目录"** 配置 Mod 要放置的目标目录：
- 给目录起个名字（如：Mods、Plugins）
- 选择完整的目录路径

### 3. 安装 Mod

1. 选择一个目标目录
2. 拖拽 Mod 文件到放置区域，或点击选择文件
3. 点击 **"安装 Mod"** 按钮

### 4. 管理 Mod

- **查看历史** - 切换到"历史记录"标签查看所有安装记录
- **还原 Mod** - 点击单条记录的"还原"按钮
- **一键还原** - 点击"一键还原全部"恢复游戏到初始状态

## 📁 数据存储

应用数据存储在用户数据目录下：
- Windows: `%APPDATA%/game-mod-manager/`
- macOS: `~/Library/Application Support/game-mod-manager/`
- Linux: `~/.config/game-mod-manager/`

## 🔧 技术栈

- **前端**: Vue 3 + Vite
- **桌面框架**: Electron
- **样式**: 原生 CSS（CSS Variables）
- **文件操作**: fs-extra

## 📝 开发计划

- [ ] 支持压缩包直接安装
- [ ] Mod 预设功能
- [ ] Mod 版本管理
- [ ] 支持更多备份策略
- [ ] Mod 冲突检测

## 📄 许可证

MIT License

---

Made with ❤️ for gamers