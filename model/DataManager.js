import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { CONFIG, CLOTHING_DB, CLOTHING_PRESETS, CLOTHING_SLOTS, LOCATIONS, EQUIPMENT_RARITY } from '../config/cfg.js'
import { calculateDays, beijingNow } from './utils.js'
import { injectAssets } from './html-inject.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginRoot = path.resolve(__dirname, '..')
const dataDir = path.join(pluginRoot, 'data')
const htmlPath = path.join(pluginRoot, 'html', 'owner_smer_temp.html')
const htmlSrc = path.join(pluginRoot, 'resources', 'panel.html')

function makeEmptySlot() {
  return { name: '未穿', rarity: 'none', charm: 0, dur: 0, effect: null }
}

class DataManager {
  getDataPath(groupId) {
    return path.join(dataDir, `${groupId || 'default'}.json`)
  }

  initData() {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      const htmlDir = path.join(pluginRoot, 'html')
      if (!fs.existsSync(htmlDir)) {
        fs.mkdirSync(htmlDir, { recursive: true })
      }
      const oldPath = path.join(dataDir, 'owner_smer_data.json')
      if (fs.existsSync(oldPath) && !fs.existsSync(this.getDataPath('default'))) {
        fs.renameSync(oldPath, this.getDataPath('default'))
      }
      let htmlContent = fs.readFileSync(htmlSrc, 'utf8')
      htmlContent = injectAssets(htmlContent)
      fs.writeFileSync(htmlPath, htmlContent, 'utf8')
    } catch (error) {
      console.error('[Smer] 初始化失败:', error)
    }
  }

  resetData(groupId) {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    const preset = CLOTHING_PRESETS[Math.floor(Math.random() * CLOTHING_PRESETS.length)]
    const clothes = {}
    for (const [slot, item] of Object.entries(preset.clothes)) {
      const fresh = { name: item.name, rarity: item.rarity }
      if (item.rarity === 'common') {
        fresh.dur = 100
      } else if (item.rarity !== 'none') {
        const rInfo = EQUIPMENT_RARITY[item.rarity]
        if (rInfo?.charmRange) {
          fresh.charm = Math.floor(Math.random() * (rInfo.charmRange[1] - rInfo.charmRange[0] + 1)) + rInfo.charmRange[0]
        } else {
          fresh.charm = 0
        }
      }
      clothes[slot] = fresh
    }
    const allSlots = [...CLOTHING_SLOTS]
    const shuffled = allSlots.sort(() => Math.random() - 0.5)
    const skipSlots = new Set([shuffled[0], shuffled[1]])
    for (const slot of skipSlots) {
      clothes[slot] = makeEmptySlot()
    }

    const defaultData = {
      sys: {
        day: 1,
        timeMin: 480,
        location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)].name,
        trainCoins: 100,
        achievements: [],
        clothesBroken: 0,
        ownerId: '',
        ownerName: '猫娘',
        presetName: preset.name,
        startTimestamp: null,
        lastCheckDate: null,
        statHistory: {
          pain: [],
          energy: [],
          satiety: [],
          sensitivity: [],
          hygiene: []
        },
        firstReach: {}
      },
      stats: {
        satiety: Math.floor(Math.random() * 51) + 30,
        energy: Math.floor(Math.random() * 51) + 40,
        pain: Math.floor(Math.random() * 61) + 30,
        sensitivity: Math.floor(Math.random() * 30) + 5,
        hygiene: Math.floor(Math.random() * 51) + 40,
        lewd: 0,
        depravity: 0,
        obedience: 0
      },
      clothes: clothes,
      traits: [],
      logs: [],
      users: {},
      achievements: {
        totalTrain: 0,
        totalHeal: 0,
        totalDepravity: 0,
        survivalDays: 0,
        clothesBroken: 0,
        totalCharm: 0
      }
    }
    this.saveData(defaultData, groupId)
  }

  readData(groupId) {
    const dataPath = this.getDataPath(groupId)
    try {
      if (!fs.existsSync(dataPath)) {
        this.resetData(groupId)
      }
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
      if (data.stats.hp !== undefined) {
        data.stats.pain = data.stats.hp
        delete data.stats.hp
        delete data.stats.sanity
        delete data.stats.stress
        delete data.stats.corruption
        delete data.stats.bust
        delete data.stats.waist
        delete data.stats.hip
      }
      if (data.stats.lewd === undefined) data.stats.lewd = 0
      if (data.stats.depravity === undefined) data.stats.depravity = 0
      if (data.stats.obedience === undefined) data.stats.obedience = 0
      if (data.stats.satiety === undefined) data.stats.satiety = 60
      for (const key of ['satiety', 'energy', 'pain', 'sensitivity', 'hygiene', 'lewd', 'depravity', 'obedience']) {
        if (data.stats[key] === undefined) data.stats[key] = 0
      }
      if (data.clothes.hat && !data.clothes.head) {
        data.clothes.head = data.clothes.hat
        delete data.clothes.hat
      }
      if (data.clothes.underwear && !data.clothes.bra) {
        data.clothes.bra = makeEmptySlot()
        delete data.clothes.underwear
      }
      for (const slot of CLOTHING_SLOTS) {
        if (!data.clothes[slot]) {
          data.clothes[slot] = makeEmptySlot()
        }
        if (data.clothes[slot].rarity === 'none') {
          data.clothes[slot] = makeEmptySlot()
        }
        if (data.clothes[slot].rarity === 'common' && data.clothes[slot].dur !== undefined && data.clothes[slot].dur <= 0) {
          data.clothes[slot] = makeEmptySlot()
        }
        if (data.clothes[slot].rarity !== 'none' && data.clothes[slot].rarity !== 'common') {
          if (data.clothes[slot].charm === undefined) {
            data.clothes[slot].charm = 0
          }
        }
      }
      if (!data.achievements) {
        data.achievements = { totalTrain: 0, totalHeal: 0, totalDepravity: 0, survivalDays: 0, clothesBroken: 0, totalCharm: 0 }
      }
      if (data.achievements.totalDamage !== undefined && data.achievements.totalTrain === undefined) {
        data.achievements.totalTrain = data.achievements.totalDamage
        delete data.achievements.totalDamage
      }
      if (data.achievements.totalCorruption !== undefined && data.achievements.totalDepravity === undefined) {
        data.achievements.totalDepravity = data.achievements.totalCorruption
        delete data.achievements.totalCorruption
        delete data.achievements.totalHeal
      }
      if (data.achievements.totalHeal === undefined) data.achievements.totalHeal = 0
      if (!data.sys.achievements) {
        data.sys.achievements = []
      }
      if (typeof data.sys.clothesBroken !== 'number') {
        data.sys.clothesBroken = 0
      }
      if (!data.sys.ownerId) {
        data.sys.ownerId = ''
      }
      if (!data.sys.ownerName) {
        data.sys.ownerName = '猫娘'
      }
      if (data.sys.trainCoins === undefined) {
        data.sys.trainCoins = 100
      }
      return data
    } catch (error) {
      console.error('[Smer] 读取数据失败:', error)
      this.resetData(groupId)
      try {
        return JSON.parse(fs.readFileSync(this.getDataPath(groupId), 'utf8'))
      } catch (e) {
        console.error('[Smer] 重置后读取仍失败:', e)
        return null
      }
    }
  }

  saveData(data, groupId) {
    try {
      const dataPath = this.getDataPath(groupId)
      const pctStats = ['satiety', 'energy', 'pain', 'sensitivity', 'hygiene']
      for (const s of pctStats) {
        if (data.stats[s] !== undefined) {
          data.stats[s] = Math.max(0, Math.min(100, Math.round(data.stats[s] * 10) / 10))
        }
      }
      for (const s of ['lewd', 'depravity', 'obedience']) {
        if (data.stats[s] !== undefined) {
          data.stats[s] = Math.max(0, Math.min(1314, Math.round(data.stats[s])))
        }
      }
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('[Smer] 保存数据失败:', error)
    }
  }

  async updateOwnerInfo(e, data) {
    try {
      const bot = e.bot ?? Bot
      const group = bot.pickGroup?.(e.group_id) || e.group

      let ownerId = group?.info?.owner_id
      if (!ownerId) {
        try {
          const groupInfo = await group?.renew?.()
          ownerId = groupInfo?.owner_id
        } catch {}
      }
      if (!ownerId) {
        try {
          const groupInfo = await group?.getInfo?.()
          ownerId = groupInfo?.owner_id
        } catch {}
      }
      if (ownerId && ownerId !== data.sys.ownerId) {
        data.sys.ownerId = String(ownerId)
        const ownerMember = group?.pickMember?.(Number(ownerId))
        let info = ownerMember?.info
        if (!info?.nickname) {
          try {
            info = await ownerMember?.getInfo?.()
          } catch {}
        }
        let card = info?.card
        let nickname = info?.nickname
        data.sys.ownerName = card || nickname || String(ownerId)
      }
      if (ownerId) {
        data.sys.ownerAvatar = `https://q1.qlogo.cn/g?b=qq&s=100&nk=${ownerId}`
      }
    } catch (error) {
      console.error('[Smer] 获取猫娘信息失败:', error)
    }
  }

  replaceOwnerName(text, data) {
    return text.replace(/猫娘/g, data.sys.ownerName || '猫娘')
  }

  stripTrainingClothes(data) {
    for (const slot of CLOTHING_SLOTS) {
      const r = data.clothes[slot]?.rarity
      if (r === 'rare' || r === 'epic' || r === 'mythic') {
        data.clothes[slot] = makeEmptySlot()
      }
    }
  }

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val))
  }

  clampStat(statName, value) {
    const limit = CONFIG.STAT_LIMITS[statName] || 100
    return this.clamp(value, 0, limit)
  }

  clampAllStats(stats) {
    for (const key in stats) {
      stats[key] = this.clampStat(key, stats[key])
    }
  }

  formatTime(mins) {
    const h = Math.floor(mins / 60).toString().padStart(2, '0')
    const m = (mins % 60).toString().padStart(2, '0')
    return `${h}:${m}`
  }

  addLog(data, text, color = '#ccc') {
    const now = beijingNow()
    const h = now.getHours().toString().padStart(2, '0')
    const m = now.getMinutes().toString().padStart(2, '0')
    const day = calculateDays(data.sys.startTimestamp)
    const timeStr = `${day}日 ${h}:${m}`
    data.logs.unshift({ time: timeStr, text: text, color: color })
    if (data.logs.length > CONFIG.MAX_LOGS) {
      data.logs = data.logs.slice(0, CONFIG.MAX_LOGS)
    }
  }

  updateStatHistory(data) {
    if (!data.sys.statHistory) {
      data.sys.statHistory = { pain: [], energy: [], satiety: [], sensitivity: [], hygiene: [] }
    }
    if (!data.sys.firstReach) {
      data.sys.firstReach = {}
    }
    for (const stat of ['pain', 'energy', 'satiety', 'sensitivity', 'hygiene']) {
      if (!data.sys.statHistory[stat]) data.sys.statHistory[stat] = []
      data.sys.statHistory[stat].push(data.stats[stat])
      if (data.sys.statHistory[stat].length > 10) {
        data.sys.statHistory[stat].shift()
      }
    }
  }

  checkConsecutive(data, stat, value, count) {
    const history = data.sys.statHistory?.[stat] || []
    if (history.length < count) return false
    for (let i = history.length - count; i < history.length; i++) {
      if (history[i] !== value) return false
    }
    return true
  }

  getTotalCharm(data) {
    let total = 0
    for (const slot of CLOTHING_SLOTS) {
      if (data.clothes[slot]?.rarity !== 'none' && data.clothes[slot]?.rarity !== 'common') {
        total += data.clothes[slot]?.charm || 0
      }
    }
    return total
  }

  _statBonus(val, optMin, optMax, weight = 1) {
    if (val <= 0) return 0
    const baseBonus = weight === 2 ? 0.2 : 0.1
    const nonOptBonus = weight === 2 ? 0.05 : 0.025
    if (val >= optMin && val <= optMax) return baseBonus
    return nonOptBonus
  }

  getTrainBonusSync(data) {
    let bonus = 1.0
    const s = data.stats
    bonus += this._statBonus(s.satiety, CONFIG.SATIETY_OPTIMAL_MIN, CONFIG.SATIETY_OPTIMAL_MAX, 2)
    bonus += this._statBonus(s.energy, CONFIG.ENERGY_OPTIMAL_MIN, CONFIG.ENERGY_OPTIMAL_MAX, 1)
    bonus += this._statBonus(s.pain, CONFIG.PAIN_OPTIMAL_MIN, CONFIG.PAIN_OPTIMAL_MAX, 1)
    bonus += this._statBonus(s.sensitivity, CONFIG.SENSITIVITY_OPTIMAL_MIN, CONFIG.SENSITIVITY_OPTIMAL_MAX, 1)
    bonus += this._statBonus(s.hygiene, CONFIG.HYGIENE_OPTIMAL_MIN, CONFIG.HYGIENE_OPTIMAL_MAX, 1)
    for (const slot of CLOTHING_SLOTS) {
      const item = data.clothes[slot]
      if (item && item.rarity !== 'none' && item.rarity !== 'common' && item.effect) {
        const rarity = EQUIPMENT_RARITY[item.rarity]
        if (rarity) bonus += (rarity.multiplier - 1.0) * 0.1
      }
    }
    return bonus
  }

  getTrainBonusDetail(data) {
    const s = data.stats
    const parts = ['1.0']
    const sb = this._statBonus(s.satiety, CONFIG.SATIETY_OPTIMAL_MIN, CONFIG.SATIETY_OPTIMAL_MAX, 2)
    if (sb) parts.push(`饱+${sb.toFixed(2)}`)
    const eb = this._statBonus(s.energy, CONFIG.ENERGY_OPTIMAL_MIN, CONFIG.ENERGY_OPTIMAL_MAX, 1)
    if (eb) parts.push(`体+${eb.toFixed(2)}`)
    const pb = this._statBonus(s.pain, CONFIG.PAIN_OPTIMAL_MIN, CONFIG.PAIN_OPTIMAL_MAX, 1)
    if (pb) parts.push(`痛+${pb.toFixed(2)}`)
    const snb = this._statBonus(s.sensitivity, CONFIG.SENSITIVITY_OPTIMAL_MIN, CONFIG.SENSITIVITY_OPTIMAL_MAX, 1)
    if (snb) parts.push(`敏+${snb.toFixed(2)}`)
    const hb = this._statBonus(s.hygiene, CONFIG.HYGIENE_OPTIMAL_MIN, CONFIG.HYGIENE_OPTIMAL_MAX, 1)
    if (hb) parts.push(`洁+${hb.toFixed(2)}`)
    let equipBonus = 0
    for (const slot of CLOTHING_SLOTS) {
      const item = data.clothes[slot]
      if (item && item.rarity !== 'none' && item.rarity !== 'common' && item.effect) {
        const rarity = EQUIPMENT_RARITY[item.rarity]
        if (rarity) equipBonus += (rarity.multiplier - 1.0) * 0.1
      }
    }
    if (equipBonus) parts.push(`装+${equipBonus.toFixed(2)}`)
    return parts.join(' ')
  }
}

export default DataManager
export { htmlPath }
