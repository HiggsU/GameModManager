# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Development (runs Vite + Electron with hot reload)
npm run electron:dev

# Build Vue frontend only
npm run build

# Build complete Electron application
npm run electron:build

# Preview production build
npm run electron:preview

# Clean build output (dist, dist_electron)
npm run clean

# Deep clean (includes node_modules)
npm run clean:deep
```

## Architecture Overview

This is an Electron + Vue 3 desktop application for managing game mods. The architecture follows a main/renderer process pattern with IPC communication.

### Process Communication

```
┌─────────────────────────────────────────────────────────────┐
│  Renderer Process (Vue 3)                                   │
│  src/App.vue + src/components/*.vue                         │
│  Access IPC via window.electronAPI (from preload.js)        │
└───────────────────────┬─────────────────────────────────────┘
                        │ IPC (invoke/send)
┌───────────────────────▼─────────────────────────────────────┐
│  Main Process (Node.js)                                     │
│  electron/main.js                                           │
│  Handles file operations, mod management, dialogs           │
└─────────────────────────────────────────────────────────────┘
```

### Key Files

- **electron/main.js** - Main process; contains all IPC handlers, game/mod management logic, and file operations
- **electron/preload.js** - Exposes `window.electronAPI` to renderer via contextBridge
- **src/App.vue** - Root Vue component; contains all application state and business logic
- **src/components/** - UI components (stateless, receive props from App.vue)

### IPC API Reference (window.electronAPI)

The renderer communicates with the main process through these exposed methods:

**Window Controls:** `minimize()`, `maximize()`, `close()`

**File Selection:** `selectFolder()`, `selectFiles()`, `selectItem()`

**Game Management:** `getGames()`, `saveGames(games)`, `addGame(game)`, `updateGame(game)`, `deleteGame(gameId)`

**Mod Operations:** `installMod(data)`, `restoreMod(data)`, `reinstallMod(data)`, `restoreAllMods(data)`, `deleteModHistory(data)`, `deleteForMod(data)`

**File Operations:** `listDirectory(dirPath)`, `openFolder(folderPath)`, `pathExists(filePath)`, `getFileInfo(filePath)`

### Data Storage

Application data is stored in the Electron userData directory:

```
{userData}/GameModManager/
├── games.json          # Game configurations and mod records
└── backups/
    └── {gameId}/
        └── {modId}/
            ├── originals/   # Backup of replaced files
            ├── deleted/     # Backup of deleted files
            └── modfiles/    # Copy of installed mod files
```

### Mod Installation Flow

1. User selects files/directories to install and optionally items to delete
2. `installMod` handler:
   - Creates backup directory for the mod
   - Backs up and removes any files marked for deletion
   - For each source file: backs up existing files, then copies mod files
   - Records all operations (new/replace/delete) with file hashes
   - Saves mod metadata to games.json

### Key Technical Details

- **Path handling:** Use `path.relative()` and `path.join()` for cross-platform compatibility
- **File hashing:** MD5 hashes track file changes for safe restoration
- **Frameless window:** Custom title bar in `TitleBar.vue` handles window controls
- **Theming:** Light/dark mode controlled by `isLightMode` state in App.vue
- **Path alias:** `@` maps to `src/` directory (configured in vite.config.js)