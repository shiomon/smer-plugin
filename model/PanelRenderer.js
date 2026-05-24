import { CONFIG, EQUIPMENT_RARITY, LOCATIONS, STAT_NAME_MAP, CLOTHING_SLOTS } from '../config/cfg.js'
import Version from '../components/Version.js'
import { evalCondition, calculateDays } from './utils.js'

const CLOTHING_SLOT_LIST = CLOTHING_SLOTS.map(slot => ({ key: slot, label: { head: '头饰', upper: '上装', lower: '下装', bra: '胸罩', panty: '内裤', accessory: '饰品', shoes: '鞋子' }[slot] }))
import { htmlPath } from './DataManager.js'

class PanelRenderer {
  constructor(dataManager) {
    this.dm = dataManager
  }

  formatEffectText(effect) {
    if (!effect) return ''
    const parts = []
    const fullMap = { ...STAT_NAME_MAP }
    for (const [stat, value] of Object.entries(effect)) {
      const name = fullMap[stat] || stat
      const sign = value > 0 ? '+' : ''
      if (['lewd', 'depravity', 'obedience', 'sensitivity'].includes(stat)) {
        parts.push(`${name}${sign}${value}%`)
      } else {
        parts.push(`${name}${sign}${value}%`)
      }
    }
    return parts.join(', ')
  }

  addRarityInfo(clothes) {
    const result = {}
    for (const slot of CLOTHING_SLOTS) {
      const item = clothes[slot]
      if (!item || item.rarity === 'none') {
        result[slot] = { name: '未穿', rarity: 'none', charm: 0, dur: 0, effect: null, rarityName: '', rarityColor: '#666', effectText: '', isEmpty: true }
        continue
      }
      const rarity = EQUIPMENT_RARITY[item.rarity]
      const isEmpty = item.rarity === 'common' && item.dur <= 0
      result[slot] = {
        ...item,
        rarityName: rarity ? rarity.name : '',
        rarityColor: rarity ? rarity.color : '#666',
        effectText: this.formatEffectText(item.effect),
        isEmpty: isEmpty
      }
    }
    return result
  }

  getLocationModifierText(locationName) {
    const location = LOCATIONS.find(loc => loc.name === locationName)
    if (!location || !location.modifier) return ''

    const effects = []
    for (const [stat, value] of Object.entries(location.modifier)) {
      const sign = value > 0 ? '+' : ''
      if (STAT_NAME_MAP[stat]) {
        effects.push(`${STAT_NAME_MAP[stat]}${sign}${value}%`)
      }
    }

    return effects.length > 0 ? effects.join(', ') : ''
  }

  generateStatusText(stats) {
    const st = stats
    for (const rule of CONFIG.STATUS_TEXTS) {
      try {
        if (evalCondition(rule.condition, st)) {
          return rule.text
        }
      } catch (e) {
        continue
      }
    }
    return '正在适应中...'
  }

  getTotalEffectText(data) {
    const fullMap = { ...STAT_NAME_MAP }
    const totals = {}
    for (const slot of CLOTHING_SLOTS) {
      const item = data.clothes[slot]
      if (!item || item.rarity === 'none') continue
      if (item.rarity === 'common' && item.dur <= 0) continue
      if (!item.effect) continue
      for (const [stat, value] of Object.entries(item.effect)) {
        totals[stat] = (totals[stat] || 0) + value
      }
    }
    const parts = []
    for (const [stat, value] of Object.entries(totals)) {
      const name = fullMap[stat] || stat
      const sign = value > 0 ? '+' : ''
      parts.push(`${name}${sign}${value}%`)
    }
    return parts.length > 0 ? parts.join(', ') : '无'
  }

  getSatietyColor(value) {
    if (value >= CONFIG.SATIETY_OPTIMAL_MIN && value <= CONFIG.SATIETY_OPTIMAL_MAX) {
      return '#33cc33'
    }
    return '#ff3333'
  }

  buildRenderData(data) {
    const ownerName = data.sys.ownerName || '猫娘'

    const allUsersEntries = Object.entries(data.users)
    const totalContribution = allUsersEntries.reduce((sum, u) => sum + (u[1].contribution || 0), 0)
    const topUsers = allUsersEntries
      .sort((a, b) => (b[1].contribution || 0) - (a[1].contribution || 0))
      .slice(0, 5)
      .map(u => {
        const c = u[1].contribution || 0
        const pct = totalContribution > 0 ? Math.round(c / totalContribution * 100) : 0
        return { name: u[1].name, dmg: u[1].dmg || 0, heal: u[1].heal || 0, contributionPct: pct }
      })

    const hasCommon = CLOTHING_SLOTS.some(slot => {
      const c = data.clothes[slot]
      return c && c.rarity === 'common' && c.dur > 0
    })

    const statusText = this.generateStatusText(data.stats)
    const clothesWithRarity = this.addRarityInfo(data.clothes)
    const totalCharm = this.dm.getTotalCharm(data)
    const totalEffectText = hasCommon ? (data.sys.presetName || '日常装') : this.getTotalEffectText(data)
    const trainBonus = this.dm.getTrainBonusSync(data)

    return {
      tplFile: htmlPath,
      pluginVer: Version.ver,
      yunzaiName: Version.name,
      yunzaiVer: Version.yunzai,
      sys: {
        ...data.sys,
        time: this.dm.formatTime(data.sys.timeMin),
        realTime: this.getRealTime(),
        day: calculateDays(data.sys.startTimestamp),
        achievementsCount: (data.sys.achievements || []).length,
        totalAchievements: Object.keys(CONFIG.ACHIEVEMENTS).length
      },
      stats: data.stats,
      clothes: clothesWithRarity,
      clothesStr: {
        head: '头饰',
        upper: '上装',
        lower: '下装',
        bra: '胸罩',
        panty: '内裤',
        accessory: '饰品',
        shoes: '鞋子'
      },
      slotList: CLOTHING_SLOT_LIST,
      totalCharm: totalCharm,
      maxCharm: 520 * 7,
      totalEffectText: totalEffectText,
      isWearingCommon: hasCommon,
      presetName: data.sys.presetName || '日常装',
      traits: data.traits,
      achievements: this.getUnlockedAchievements(data),
      logs: data.logs,
      topUsers: topUsers,
      statusText: statusText,
      ownerName: ownerName,
      ownerAvatar: data.sys.ownerAvatar || '',
      locationModifier: this.getLocationModifierText(data.sys.location),
      trainBonus: trainBonus,
      trainBonusDetail: this.dm.getTrainBonusDetail(data),
      satietyColor: this.getSatietyColor(data.stats.satiety)
    }
  }

  getRealTime() {
    const now = new Date()
    const h = now.getHours().toString().padStart(2, '0')
    const m = now.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
  }

  getUnlockedAchievements(data) {
    const unlocked = data.sys.achievements || []
    const classify = (key) => {
      if (key.startsWith('charm_')) return 'ach-charm'
      if (key.startsWith('first_blood') || key.startsWith('train_') || key === 'healer') return 'ach-train'
      if (key.startsWith('obedience_')) return 'ach-obey'
      if (key.startsWith('lewd_')) return 'ach-lewd'
      if (key.startsWith('depravity_')) return 'ach-depravity'
      if (key.startsWith('survivor_') || key.startsWith('shop_naked_')) return 'ach-survive'
      if (key.startsWith('breaker_') || key.startsWith('shop_') || key.startsWith('full_mythic')) return 'ach-shop'
      return 'ach-special'
    }
    return unlocked.map(key => {
      const ach = CONFIG.ACHIEVEMENTS[key]
      return ach ? { name: ach.name, key, cls: classify(key) } : null
    }).filter(Boolean)
  }

  async renderPanel(e, data) {
    const renderData = this.buildRenderData(data)
    const puppeteer = (await import('../../../lib/puppeteer/puppeteer.js')).default

    try {
      const img = await puppeteer.screenshot('ownerPanel', renderData)
      if (img) {
        await e.reply(img)
      } else {
        await e.reply('面板出图失败，请检查 Puppeteer 配置。')
      }
    } catch (error) {
      console.error('[Smer] 面板渲染失败:', error)
      await e.reply('面板渲染出错，请稍后重试。')
    }
  }
}

export default PanelRenderer
