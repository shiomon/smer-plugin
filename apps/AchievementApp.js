import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Version from '../components/Version.js'
import { CONFIG, CMD_PREFIX, GROUP_ONLY_MSG } from '../config/cfg.js'
import { injectAssets } from '../model/html-inject.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const achievementHtmlPath = path.resolve(__dirname, '../resources/achievement.html')
const tempDir = path.resolve(__dirname, '../html')
const tempAchievementPath = path.join(tempDir, '_achievement_temp.html')

class AchievementApp extends plugin {
  constructor() {
    super({
      name: 'Smer-成就',
      dsc: '查看成就进度',
      event: 'message',
      priority: 5000,
      rule: [
        { reg: `^${CMD_PREFIX}成就.*`, fnc: 'showAchievements' }
      ]
    })
    this.sys = global.smerSys
  }

  async showAchievements(e) {
    if (!e.group_id) return e.reply(GROUP_ONLY_MSG)
    try {
      const groupId = String(e.group_id)
      const data = this.sys.dm.readData(groupId)
      const unlockedKeys = data.sys.achievements || []
      const allAchievements = Object.entries(CONFIG.ACHIEVEMENTS).map(([key, ach]) => ({
        key,
        name: ach.name,
        desc: ach.desc,
        reward: ach.reward,
        unlocked: unlockedKeys.includes(key)
      }))
      const puppeteer = (await import('../../../lib/puppeteer/puppeteer.js')).default
      let htmlContent = fs.readFileSync(achievementHtmlPath, 'utf8')
      htmlContent = injectAssets(htmlContent)
      fs.writeFileSync(tempAchievementPath, htmlContent, 'utf8')
      const img = await puppeteer.screenshot('achievementPanel', {
        tplFile: tempAchievementPath,
        ownerName: '猫娘',
        pluginVer: Version.ver,
        yunzaiName: Version.name,
        yunzaiVer: Version.yunzai,
        achievementCount: Object.keys(CONFIG.ACHIEVEMENTS).length,
        unlockedCount: unlockedKeys.length,
        achievements: allAchievements
      })
      if (img) {
        await e.reply(img)
      } else {
        await e.reply('成就面板出图失败，请检查 Puppeteer 配置。')
      }
    } catch (error) {
      console.error('[Smer] 成就面板渲染失败:', error)
      await e.reply('成就面板渲染失败，请稍后重试')
    }
  }
}

export default AchievementApp
