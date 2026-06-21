import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Version from '../components/Version.js'
import { CMD_PREFIX } from '../config/cfg.js'
import { injectAssets } from '../model/html-inject.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const helpHtmlPath = path.resolve(__dirname, '../resources/help.html')
const tempDir = path.resolve(__dirname, '../data')
const tempHelpPath = path.join(tempDir, '_help_temp.html')

class HelpApp extends plugin {
  constructor() {
    super({
      name: 'Smer-帮助',
      dsc: '猫娘调教帮助指南',
      event: 'message',
      priority: 5000,
      rule: [
        { reg: `^${CMD_PREFIX}帮助.*`, fnc: 'showHelp' }
      ]
    })
    this.sys = global.smerSys
  }

  async showHelp(e) {
    try {
      const puppeteer = (await import('../../../lib/puppeteer/puppeteer.js')).default
      let htmlContent = fs.readFileSync(helpHtmlPath, 'utf8')
      htmlContent = injectAssets(htmlContent)
      fs.writeFileSync(tempHelpPath, htmlContent, 'utf8')
      const img = await puppeteer.screenshot('helpPanel', {
        tplFile: tempHelpPath,
        ownerName: '猫娘',
        pluginVer: Version.ver,
        yunzaiName: Version.name,
        yunzaiVer: Version.yunzai
      })
      if (img) {
        await e.reply(img)
      } else {
        await e.reply('帮助面板出图失败，请检查 Puppeteer 配置。')
      }
    } catch (error) {
      console.error('[Smer] 帮助面板渲染失败:', error)
      await e.reply('帮助面板渲染失败，请稍后重试')
    }
  }
}

export default HelpApp
