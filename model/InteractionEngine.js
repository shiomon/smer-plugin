import { CONFIG, EQUIPMENT_RARITY, CLOTHING_SLOTS, getUserColor } from '../config/cfg.js'

const DUR_LOSS_ACTIONS = new Set(['鞭打', '打脸', '打屁股', '振动', '滴蜡'])

const ACTION_META = {
  '鞭打':  { critColor: '#ff3333', normalColor: '#ff6666' },
  '打脸':  { critColor: '#ff3333', normalColor: '#ff6666' },
  '打屁股': { critColor: '#ff3333', normalColor: '#ff6666' },
  '摸摸':  { critColor: '#33cc33', normalColor: '#aaffaa' },
  '挠痒':  { critColor: '#ff33ff', normalColor: '#ff66ff' },
  '投喂':  { critColor: '#33cc33', normalColor: '#33cc33' },
  '抱抱':  { critColor: '#44ff44', normalColor: '#aaffaa' },
  '羞辱':  { critColor: '#ff9900', normalColor: '#ffcc00' },
  '安慰':  { critColor: '#33cc33', normalColor: '#aaffaa' },
  '洗澡':  { critColor: '#44aaff', normalColor: '#88ccff' },
  '陪玩':  { critColor: '#44ff44', normalColor: '#88cc44' },
  '振动':  { critColor: '#e91e63', normalColor: '#ff66ff' },
  '猫叫':  { critColor: '#ff9800', normalColor: '#ffcc80' },
  '禁闭':  { critColor: '#7b1fa2', normalColor: '#ab47bc' },
  '滴蜡':  { critColor: '#ff5722', normalColor: '#ff8a65' }
}

const TRAIN_STATS = new Set(['lewd', 'depravity', 'obedience'])

class InteractionEngine {
  constructor(eventSystem, dataManager) {
    this.es = eventSystem
    this.dm = dataManager
  }

  executeInteraction(data, action, userName, userId, ownerName) {
    const config = CONFIG.INTERACTION_EFFECTS[action]
    if (!config) {
      return { logText: '未知的互动方式', replyText: '未知的互动方式', logColor: '#ccc', roll: 0 }
    }

    const roll = Math.floor(Math.random() * 100) + 1
    const isCritSuccess = config.critThreshold > 0 && roll >= config.critThreshold

    const baseBonus = this.dm.getTrainBonusSync(data)
    const sensitivityMultiplier = 1 + (data.stats.sensitivity / 200)
    const bonus = baseBonus * sensitivityMultiplier
    const locationModifier = this.es.getLocationModifier(data, action)

    this.applyAction(data, action, config, isCritSuccess, bonus, locationModifier)

    const meta = ACTION_META[action]
    const logColor = isCritSuccess ? meta.critColor : meta.normalColor
    let logText = this.getLogText(userName, isCritSuccess, false, '猫娘', action, userId)
    let replyText = this.getLogText(userName, isCritSuccess, false, ownerName, action, userId)

    if (DUR_LOSS_ACTIONS.has(action)) {
      const broken = this.damageRandomCommonClothing(data)
      if (broken.length > 0) {
        const names = broken.map(c => c.name).join('、')
        const msg = `\n【爆衣警告】${names} 被彻底撕碎了！`
        logText += msg
        replyText += msg
      }
    }

    return { logText, replyText, logColor, roll }
  }

  applyTrainStat(data, stat, value, bonus) {
    if (data.stats.satiety <= 0 || data.stats.energy <= 0 || data.stats.pain <= 0 || data.stats.sensitivity <= 0 || data.stats.hygiene <= 0) {
      return
    }
    if (TRAIN_STATS.has(stat)) {
      data.stats[stat] += Math.round(value * bonus)
    } else {
      data.stats[stat] += value
    }
  }


  ACTION_SPECS = {
    '鞭打':   { trainStats: ['depravity', 'obedience'], painGain: true, achType: 'totalTrain', achValue: (c, isCrit) => isCrit ? c.critPainGain : c.painGain },
    '打脸':   { trainStats: ['depravity', 'obedience'], painGain: true, achType: 'totalTrain', achValue: (c, isCrit) => isCrit ? c.critPainGain : c.painGain },
    '打屁股': { trainStats: ['lewd', 'depravity'], painGain: true, achType: 'totalTrain', achValue: (c, isCrit) => isCrit ? c.critPainGain : c.painGain },
    '摸摸':   { directGains: ['sensitivity', 'satiety'], painLoss: true, achType: 'totalHeal', achValue: 10 },
    '挠痒':   { trainStats: ['obedience', 'lewd'], trainAlways: ['obedience'], directGains: ['sensitivity'], achType: 'totalTrain', achValue: 5 },
    '投喂':   { directGains: ['satiety', 'energy'], painLoss: true, achType: 'totalHeal', achValue: 15 },
    '抱抱':   { directGains: ['hygiene', 'sensitivity'], painLoss: true, achType: 'totalHeal', achValue: 10 },
    '羞辱':   { trainStats: ['depravity', 'obedience'], directGains: ['sensitivity'], achType: 'totalTrain', achValue: 10 },
    '安慰':   { directGains: ['satiety', 'energy'], painLoss: true, achType: 'totalHeal', achValue: 15 },
    '洗澡':   { directGains: ['hygiene', 'energy'], painLoss: true, achType: 'totalHeal', achValue: 10 },
    '陪玩':   { directGains: ['sensitivity', 'hygiene'], painLoss: true, achType: 'totalHeal', achValue: 10 },
    '振动':   { trainStats: ['lewd'], directGains: ['sensitivity'], painGain: true, achType: 'totalTrain', achValue: 10 },
    '猫叫':   { trainStats: ['lewd', 'depravity'], directGains: ['sensitivity'], achType: 'totalTrain', achValue: 8 },
    '禁闭':   { trainStats: ['obedience', 'depravity'], directGains: ['sensitivity'], preLoss: ['satiety', 'energy'], achType: 'totalTrain', achValue: 15 },
    '滴蜡':   { trainStats: ['lewd'], directGains: ['sensitivity'], painGain: true, achType: 'totalTrain', achValue: 10 }
  }

  applyAction(data, action, config, isCrit, bonus, modifier) {
    const spec = this.ACTION_SPECS[action]
    if (!spec) return

    if (spec.preLoss) {
      for (const stat of spec.preLoss) {
        data.stats[stat] -= config[stat + 'Loss']
      }
    }

    if (spec.painGain) {
      data.stats.pain += isCrit ? (config.critPainGain || config.painGain) : config.painGain
    }

    if (spec.painLoss) {
      data.stats.pain -= isCrit ? (config.critPainLoss || config.painLoss) : config.painLoss
    }

    if (spec.trainStats) {
      for (const stat of spec.trainStats) {
        const isAlways = spec.trainAlways && spec.trainAlways.includes(stat)
        if (isAlways) {
          this.applyTrainStat(data, stat, config[stat + 'Gain'], bonus)
        } else {
          const critKey = 'crit' + stat.charAt(0).toUpperCase() + stat.slice(1) + 'Gain'
          const value = isCrit ? (config[critKey] || config[stat + 'Gain']) : config[stat + 'Gain']
          this.applyTrainStat(data, stat, value, bonus)
        }
      }
    }

    if (spec.directGains) {
      for (const stat of spec.directGains) {
        const critKey = 'crit' + stat.charAt(0).toUpperCase() + stat.slice(1) + 'Gain'
        const value = isCrit ? (config[critKey] || config[stat + 'Gain']) : config[stat + 'Gain']
        data.stats[stat] += value
      }
    }

    const achValue = typeof spec.achValue === 'function' ? spec.achValue(config, isCrit) : spec.achValue
    data.achievements[spec.achType] = (data.achievements[spec.achType] || 0) + achValue

    if (modifier) this.es.applyModifier(data.stats, modifier)
  }

  damageRandomCommonClothing(data) {
    const commonSlots = CLOTHING_SLOTS.filter(slot => {
      const item = data.clothes[slot]
      return item && item.rarity === 'common' && item.dur > 0
    })
    if (commonSlots.length === 0) return []

    const targetSlot = commonSlots[Math.floor(Math.random() * commonSlots.length)]
    const item = data.clothes[targetSlot]
    const broken = []

    if (Math.random() < 0.1) {
      item.dur = 0
      data.achievements.destroyMasterCount = (data.achievements.destroyMasterCount || 0) + 1
    } else {
      const damage = Math.floor(Math.random() * 31) + 20
      item.dur = Math.max(0, item.dur - damage)
    }

    if (item.dur === 0) {
      broken.push({ ...item })
      data.clothes[targetSlot] = { name: '未穿', rarity: 'none', charm: 0, dur: 0, effect: null }
      data.sys.clothesBroken = (data.sys.clothesBroken || 0) + 1
      data.achievements.clothesBroken = (data.achievements.clothesBroken || 0) + 1
    }
    return broken
  }

  applyClothingEffects(data) {
    const bonus = this.dm.getTrainBonusSync(data)
    for (const [slot, item] of Object.entries(data.clothes)) {
      if (item.rarity === 'none') continue
      if (item.rarity === 'common' && item.dur <= 0) continue
      if (item.effect) {
        const rarity = EQUIPMENT_RARITY[item.rarity] || { multiplier: 1.0 }
        for (const [stat, value] of Object.entries(item.effect)) {
          if (data.stats[stat] !== undefined) {
            if (['lewd', 'depravity', 'obedience'].includes(stat)) {
              data.stats[stat] += Math.round(value * rarity.multiplier * bonus)
            } else {
              data.stats[stat] += Math.round(value * rarity.multiplier)
            }
          }
        }
      }
    }
  }

  getLogText(userName, isCrit, isFail, ownerName, action, userId) {
    const u = `<span style="color:${getUserColor(userId)};font-weight:600">${userName}</span>：`
    const logs = {
      鞭打: { crit: () => `${u} 挥鞭抽出了【暴击】！${ownerName}皮开肉绽！`, normal: () => `${u} 狠狠鞭打了${ownerName}。` },
      打脸: { crit: () => `${u} 一巴掌扇出了【暴击】！${ownerName}脸都肿了！`, normal: () => `${u} 扇了${ownerName}一巴掌。` },
      打屁股: { crit: () => `${u} 一巴掌打出【暴击】！${ownerName}屁股红透了！`, normal: () => `${u} 狠狠打了${ownerName}的屁股。` },
      摸摸: { crit: () => `${u} 极其温柔地抚摸...${ownerName}发出了呼噜声！`, normal: () => `${u} 摸了摸${ownerName}的头。` },
      挠痒: { crit: () => `${u} 挠痒挤出了【暴击】！${ownerName}笑到窒息！`, normal: () => `${u} 疯狂挠${ownerName}的痒！` },
      投喂: { crit: () => `${u} 投喂了丰盛大餐！`, normal: () => `${u} 投喂了零食，${ownerName}恢复了饱食度和体力。` },
      抱抱: { crit: () => `${u} 给了${ownerName}一个暴击抱抱！温暖溢出！`, normal: () => `${u} 给了${ownerName}一个温暖的抱抱。` },
      羞辱: { crit: () => `${u} 的羞辱让${ownerName}深深恐惧！`, normal: () => `${u} 对${ownerName}进行了严厉羞辱。` },
      安慰: { crit: () => `${u} 的温柔安慰让${ownerName}感动不已！`, normal: () => `${u} 温柔地安慰了${ownerName}。` },
      洗澡: { crit: () => `${u} 小心翼翼帮${ownerName}洗澡，非常舒适。`, normal: () => `${u} 帮${ownerName}洗了个澡，清洁度恢复了。` },
      陪玩: { crit: () => `${u} 陪${ownerName}玩出了【暴击】！开心极了！`, normal: () => `${u} 陪${ownerName}玩耍，状态恢复了不少。` },
      振动: { crit: () => `${u} 开启了【强力振动】！${ownerName}身体颤抖不已！`, normal: () => `${u} 开启了振动模式，${ownerName}敏感度大幅提升。` },
      猫叫: { crit: () => `${u}让${ownerName}学出了【暴击猫叫】！${ownerName}彻底沦陷！`, normal: () => `${u}让${ownerName}学了一声猫叫，${ownerName}害羞了。` },
      禁闭: { crit: () => `${u} 把${ownerName}关进小黑屋，彻底屈服！`, normal: () => `${u} 把${ownerName}关进了禁闭室。` },
      滴蜡: { crit: () => `${u} 滴蜡滴出了【暴击】！${ownerName}又痛又爽！`, normal: () => `${u} 在${ownerName}身上滴下蜡烛。` }
    }
    const entry = logs[action]
    if (!entry) return `${u} 对${ownerName}进行了${action}。`
    if (isCrit && entry.crit) return entry.crit()
    return entry.normal ? entry.normal() : `${userName} 对${ownerName}进行了${action}。`
  }

  formatInteractionReply(result) {
    const cleanText = result.replyText.replace(/<[^>]+>/g, '').replace(/\n/g, ' ')
    return `RNG检定[${result.roll}]:\n${cleanText}`
  }
}

export default InteractionEngine
