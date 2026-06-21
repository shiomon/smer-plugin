import plugin from '../../../lib/plugins/plugin.js'
import { CONFIG, getUserColor, CMD_PREFIX } from '../config/cfg.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Version from '../components/Version.js'
import { injectAssets } from '../model/html-inject.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const shopHtmlPath = path.resolve(__dirname, '../resources/shop.html')
const tempDir = path.resolve(__dirname, '../data')
const tempShopPath = path.join(tempDir, '_shop_temp.html')

const BUY_ITEM_REG = new RegExp(`^${CMD_PREFIX}购买`)

class ShopApp extends plugin {
  constructor() {
    super({
      name: 'Smer-商店',
      dsc: '购买商品与换装',
      event: 'message',
      priority: 5000,
      rule: [
        { reg: `^${CMD_PREFIX}商店.*`, fnc: 'showShop' },
        { reg: `^${CMD_PREFIX}购买.*`, fnc: 'buyItem' }
      ]
    })
    this.sys = global.smerSys
  }

  async showShop(e) {
    const groupId = String(e.group_id)
    try {
      const puppeteer = (await import('../../../lib/puppeteer/puppeteer.js')).default
      let htmlContent = fs.readFileSync(shopHtmlPath, 'utf8')
      htmlContent = injectAssets(htmlContent)
      fs.writeFileSync(tempShopPath, htmlContent, 'utf8')
      const img = await puppeteer.screenshot('shopPanel', {
        tplFile: tempShopPath,
        pluginVer: Version.ver,
        yunzaiName: Version.name,
        yunzaiVer: Version.yunzai
      })
      if (img) {
        await e.reply(img)
      } else {
        await e.reply('商店面板出图失败，请检查 Puppeteer 配置。')
      }
    } catch (error) {
      console.error('[Smer] 商店面板渲染失败:', error)
      const data = this.sys.dm.readData(groupId)
      const msg = this.sys.shop.formatShopMessage(data.sys.trainCoins || 0, data.sys.ownerName || '猫娘')
      await e.reply(msg)
    }
  }

  async buyItem(e) {
    const itemText = e.msg.replace(BUY_ITEM_REG, '').trim()
    const groupId = String(e.group_id)
    const data = this.sys.dm.readData(groupId)

    const item = this.sys.shop.findShopItemByCode(itemText) || this.sys.shop.findShopItem(itemText)
    if (!item) {
      return e.reply(`黑市里没有这件商品，请发送 #猫娘商店 查看目录。`)
    }

    const currentMoney = data.sys.trainCoins || 0

    if (currentMoney < item.cost) {
      return e.reply(`调教币不足！需要 ${item.cost} 调教币，当前只有 ${currentMoney} 调教币。`)
    }

    const userName = e.sender.card || e.sender.nickname
    const userId = String(e.user_id)
    const result = this.sys.shop.executePurchase(data, item, data.sys.ownerName || '猫娘')
    if (!result.success) {
      return e.reply(result.message)
    }

    data.sys.trainCoins = currentMoney - item.cost
    this.sys.es.tickTime(data, CONFIG.SHOP_TIME_COST)
    this.sys.dm.addLog(data, `<span style="color:${getUserColor(userId)};font-weight:600">${userName}</span>：${result.logText}`, '#ff66ff')
    this.sys.dm.saveData(data, groupId)

    await e.reply(`${result.message}\n(花费 ${item.cost} 调教币，剩余 ${data.sys.trainCoins} 调教币)`)
  }
}

export default ShopApp
