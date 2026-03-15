/**
 * 清理脚本 - 删除构建产生的文件和缓存
 * 用法: npm run clean
 */

const fs = require('fs-extra')
const path = require('path')

// 要清理的目录列表
const dirsToClean = [
  'dist',           // Vite 构建输出
  'dist_electron',  // Electron 构建输出
]

// 要清理的文件列表
const filesToClean = [
  // 可以添加需要清理的特定文件
]

async function clean() {
  console.log('🧹 开始清理...\n')
  
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
  
  console.log('\n✨ 清理完成!')
}

clean().catch(err => {
  console.error('清理过程中出错:', err)
  process.exit(1)
})