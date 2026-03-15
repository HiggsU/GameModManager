# Game Mod Manager

🎮 一个现代化的游戏Mod管理工具，简化游戏打Mod的操作流程。

## ✨ 功能特性

- **📁 游戏管理** - 添加多个游戏项目，配置Mod目标目录
- **🎯 拖拽安装** - 直接拖拽Mod文件到配置的目录即可安装
- **💾 自动备份** - 替换文件时自动备份原文件，安全无忧
- **📝 完整记录** - 记录每个Mod文件的安装方式（新增/替换）
- **🔄 一键还原** - 支持单个还原、批量还原、一键还原所有Mod

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run electron:dev
```

### 打包发布

```bash
npm run electron:build
```

## 📖 使用说明

### 1. 添加游戏

点击"添加游戏"按钮，输入游戏名称并选择游戏根目录。

### 2. 配置Mod目录

为游戏添加Mod目标目录（相对路径），例如：
- `BepInEx/plugins` - BepInEx插件目录
- `Mods` - 通用Mods目录
- `Data` - 数据目录

### 3. 安装Mod

将Mod文件直接拖拽到对应的目录配置卡片上即可自动安装。

### 4. 还原Mod

在Mod记录区域，可以：
- 还原单个Mod文件
- 还原某次批量添加的所有Mod
- 一键还原所有已安装的Mod

## 🎨 技术栈

- **Electron** - 跨平台桌面应用框架
- **Vue 3** - 渐进式JavaScript框架
- **Vite** - 下一代前端构建工具
- **electron-store** - 持久化数据存储

## 📝 开发说明

```
GameModManager/
├── electron/           # Electron主进程
│   ├── main.js        # 主进程入口
│   └── preload.js     # 预加载脚本
├── src/               # Vue前端
│   ├── components/    # Vue组件
│   ├── styles/        # 样式文件
│   ├── App.vue        # 根组件
│   └── main.js        # 入口文件
├── public/            # 静态资源
├── index.html         # HTML模板
├── vite.config.js     # Vite配置
└── package.json       # 项目配置
```

## 📜 License

MIT License