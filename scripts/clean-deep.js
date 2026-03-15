/**
 * 深度清理脚本 - 删除所有生成的文件，包括 node_modules
 * 用法: npm run clean:deep
 */

const fs = require('fs-extra')
const path = require('path')

// 要清理的目录列表
const dirsToClean = [
  'dist',           // Vite 构建输出
  'dist_electron',  // Electron 构建输出
  'node_modules',   // 依赖包
]

// 要清理的文件列表
const filesToClean = [
  'package-lock.json', // 锁文件（可选，重新 npm install 会生成）
]

async function clean() {
  console.log('🧹 开始深度清理...\n')
  console.log('⚠️  这将删除 node_modules，之后需要重新运行 npm install\n')
  
  // 清理目录
  for (const dir of dirsToClean) {
    const dirPath = path.join(__dirname, '..', dir)
    if (await fs.exists(dirPath)) {
      try {
        await fs.remove(dirPath)
        console.log(`✅ 已删除目录: ${dir}`)
      } catch (err) {
        console.log(`❌ 删除失败: ${dir} - ${err.message}`)
      }
    } else {
      console.log(`⏭️  跳过 (不存在): ${dir}`)
    }
  }
  
  // 清理文件
  for (const file of filesToClean) {
    const filePath = path.join(__dirname, '..', file)
    if (await fs.exists(filePath)) {
      try {
        await fs.remove(filePath)
        console.log(`✅ 已删除文件: ${file}`)
      } catch (err) {
        console.log(`❌ 删除失败: ${file} - ${err.message}`)
      }
    }
  }
  
  console.log('\n✨ 深度清理完成!')
  console.log('💡 提示: 请运行 npm install 重新安装依赖')
}

clean().catch(err => {
  console.error('清理过程中出错:', err)
  process.exit(1)
})