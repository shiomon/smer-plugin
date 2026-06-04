import plugin from '../../../lib/plugins/plugin.js'
import { CONFIG } from '../config/cfg.js'

const ACTIONS = '摸摸|投喂|鞭打|打脸|打屁股|挠痒|抱抱|羞辱|安慰|洗澡|陪玩|振动|猫叫|禁闭|滴蜡'
const ACTION_REG = new RegExp(`^([#＃]猫娘|&)(${ACTIONS}).*`)
const ACTION_EXTRACT = new RegExp(`(${ACTIONS})`)

class InteractApp extends plugin {
  constructor() {
    super({
      name: 'Smer-互动',
      dsc: '与猫娘互动检定',
      event: 'message',
      priority: 5000,
      rule: [
        { reg: ACTION_REG, fnc: 'interact' }
      ]
    })
    this.sys = global.smerSys
  }

  async interact(e) {
    const match = e.msg.match(ACTION_EXTRACT)
    if (!match) return false

    const action = match[0]
    const groupId = String(e.group_id)
    const data = this.sys.dm.readData(groupId)
    const userId = String(e.user_id)
    const userName = e.sender.card || e.sender.nickname

    const now = Date.now()
    const cooldownMs = CONFIG.INTERACT_COOLDOWN * 1000
    if (data.sys.lastInteractTime && now - data.sys.lastInteractTime < cooldownMs) {
      const remain = Math.ceil((cooldownMs - (now - data.sys.lastInteractTime)) / 1000)
      await e.reply(`猫娘还在回味中...请${remain}秒后再来`)
      return
    }
    data.sys.lastInteractTime = now

    if (!data.sys.ownerId) {
      await this.sys.dm.updateOwnerInfo(e, data)
    }
    const ownerName = data.sys.ownerName || '猫娘'

    if (!data.sys.startTimestamp) {
      data.sys.startTimestamp = Date.now()
    }

    if (!data.users[userId]) {
      data.users[userId] = { name: userName, dmg: 0, heal: 0, contribution: 0 }
    }
    data.users[userId].name = userName

    const config = CONFIG.INTERACTION_EFFECTS[action]

    const harmfulActions = ['鞭打', '打脸', '打屁股', '挠痒', '羞辱', '振动', '禁闭', '滴蜡']
    if (data.stats.pain <= 0 && harmfulActions.includes(action)) {
      await e.reply(`你对着${ownerName}的尸体发起了攻击...但毫无反应。请先使用 #猫娘投喂 或 &投喂 抢救！`)
      return
    }

    const statsBefore = { ...data.stats }

    const result = this.sys.ie.executeInteraction(data, action, userName, userId, ownerName)

    if (config) {
      if (config.type === 'train') {
        data.users[userId].dmg = (data.users[userId].dmg || 0) + 1
        if (config.trainCoinReward) {
          data.sys.trainCoins = (data.sys.trainCoins || 0) + config.trainCoinReward
        }
      } else {
        data.users[userId].heal = (data.users[userId].heal || 0) + 1
      }
      data.users[userId].contribution = (data.users[userId].dmg || 0) + (data.users[userId].heal || 0)
    }

    this.sys.ie.applyClothingEffects(data)
    this.sys.es.tickTime(data, CONFIG.INTERACTION_TIME_COST)
    this.sys.shop.checkAchievements(data)

    const diffParts = []
    const pctNames = { satiety: '饱', energy: '体', pain: '疼', sensitivity: '敏', hygiene: '洁' }
    const progNames = { lewd: '涩', depravity: '堕', obedience: '服' }
    for (const [k, label] of Object.entries(pctNames)) {
      const d = Math.round((data.stats[k] - statsBefore[k]) * 10) / 10
      if (Math.abs(d) > 0.01) diffParts.push(`${label}${d > 0 ? '+' : ''}${d}%`)
    }
    for (const [k, label] of Object.entries(progNames)) {
      const d = Math.round(data.stats[k] - statsBefore[k])
      if (d !== 0) diffParts.push(`${label}${d > 0 ? '+' : ''}${d}`)
    }
    if (diffParts.length > 0) {
      result.logText += ` | ${diffParts.join(', ')}`
    }

    this.sys.dm.addLog(data, result.logText, result.logColor)
    this.sys.dm.saveData(data, groupId)

    const outMsg = this.sys.ie.formatInteractionReply(result)
    await e.reply(outMsg)
  }
}

export default InteractApp
