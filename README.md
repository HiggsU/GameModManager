# 🎮 Game Mod Manager

一个现代、卡通风格的游戏 Mod 管理工具，让给游戏打 Mod 变得简单有趣！

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ 特性

- 🎯 **拖拽安装** - 直接拖拽 Mod 文件到目标目录，自动完成安装
- 📁 **多游戏支持** - 管理多个游戏的 Mod，每个游戏可配置多个目标目录
- 📂 **多目录操作** - 一次安装可同时操作多个目录，支持新增、替换、删除文件
- 🌳 **树形浏览** - 浏览目录时支持展开子目录，方便选择要删除的项目
- 💾 **自动备份** - 安装前自动备份被替换的文件，安全无忧
- ↩️ **一键还原** - 支持单独还原或一键还原所有 Mod
- 📜 **完整记录** - 记录每次操作的详细信息，新增/替换/删除文件一目了然
- 🎨 **卡通界面** - 现代卡通风格，支持深色/浅色主题切换

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
3. 在安装预览中：
   - 查看每个目录要新增/替换的文件
   - 点击"浏览目录"选择要删除的文件/文件夹
4. 输入 Mod 名称，点击 **"创建 Mod"** 按钮

### 4. 管理 Mod

- **查看详情** - 点击 Mod 卡片查看安装的文件列表
- **启用/禁用** - 切换 Mod 的启用状态
- **还原 Mod** - 点击"还原"按钮恢复文件
- **一键还原** - 点击"还原全部"恢复游戏到初始状态

## 🛠️ 开发命令

```bash
# 开发模式
npm run electron:dev

# 构建 Vue
npm run build

# 构建完整应用
npm run electron:build

# 预览构建结果
npm run electron:preview

# 清理构建产物 (dist, dist_electron)
npm run clean

# 深度清理 (包括 node_modules)
npm run clean:deep
```

## 📁 数据存储

应用数据存储在用户数据目录下：
- Windows: `%APPDATA%/game-mod-manager/`
- macOS: `~/Library/Application Support/game-mod-manager/`
- Linux: `~/.config/game-mod-manager/`

存储内容包括：
- 游戏配置信息
- Mod 安装记录
- 文件备份

## 🔧 技术栈

- **前端**: Vue 3 + Vite
- **桌面框架**: Electron
- **样式**: 原生 CSS（CSS Variables）
- **文件操作**: fs-extra
- **数据存储**: electron-store

## 📝 开发计划

- [ ] 支持压缩包直接安装
- [ ] Mod 预设功能
- [ ] Mod 版本管理
- [ ] 支持更多备份策略
- [ ] Mod 冲突检测
- [ ] 多语言支持

## 📄 许可证

MIT License

---

Made with ❤️ for gamers