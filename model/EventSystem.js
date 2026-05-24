import { CONFIG, LOCATIONS, RANDOM_EVENTS, CLOTHING_SLOTS } from '../config/cfg.js'
import { evalCondition } from './utils.js'

function getRandomWeightedItem(items) {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0)
  let random = Math.random() * totalWeight
  for (const item of items) {
    random -= (item.weight || 1)
    if (random <= 0) return item
  }
  return items[0]
}

class EventSystem {
  constructor(dataManager) {
    this.dm = dataManager
  }

  tickTime(data, minutes) {
    this.applyTickDecay(data)
    if (Math.random() < 0.15) {
      this.triggerRandomEvent(data, 'day')
    }
    this.updateTraits(data)
    this.checkDailyEvents(data)
  }

  checkDailyEvents(data) {
    const now = new Date()
    const today = now.toDateString()
    if (data.sys.lastCheckDate !== today) {
      data.sys.lastCheckDate = today
      data.sys.location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)].name
      data.stats.energy = this.dm.clampStat('energy', data.stats.energy + CONFIG.DAILY_ENERGY_RECOVERY)
      data.stats.satiety = this.dm.clampStat('satiety', data.stats.satiety - CONFIG.DAILY_SATIETY_LOSS)
      data.stats = this.dm.clampAllStats(data.stats)
      this.dm.addLog(data, `新的一天开始了。猫娘在 [${data.sys.location}] 醒来。`, '#aaa')
      if (Math.random() < CONFIG.NIGHT_EVENT_CHANCE) {
        this.triggerNightEvent(data)
      }
      if (this.shop) {
        this.shop.checkAchievements(data)
      }
    }
  }

  applyTickDecay(data) {
    const decay = CONFIG.TICK_DECAY
    for (const [stat, value] of Object.entries(decay)) {
      if (data.stats[stat] !== undefined) {
        data.stats[stat] = this.dm.clampStat(stat, data.stats[stat] + value)
      }
    }
  }

  triggerNightEvent(data) {
    const event = getRandomWeightedItem(RANDOM_EVENTS.night)
    this.applyEventEffect(data, event)
    this.dm.addLog(data, `<span style="color:#9c27b0;font-weight:600">半夜事件</span>：${event.text}`, '#999')
  }

  triggerRandomEvent(data, type) {
    if (type === 'day') {
      const event = getRandomWeightedItem(RANDOM_EVENTS.day)
      if (event.special === 'damage_clothes') {
        this.damageRandomClothing(data, 10)
      }
      this.applyEventEffect(data, event)
      this.dm.addLog(data, `<span style="color:#ff9800;font-weight:600">随机事件</span>：${event.text}`, '#888')
    } else if (type === 'location') {
      const locationEvents = RANDOM_EVENTS.location[data.sys.location] || []
      if (locationEvents.length > 0) {
        const event = getRandomWeightedItem(locationEvents)
        this.applyEventEffect(data, event)
        this.dm.addLog(data, `<span style="color:#2196f3;font-weight:600">地点事件</span>：${event.text}`, '#88aaff')
      }
    }
  }

  applyEventEffect(data, event) {
    if (!event.effect) return
    for (const [stat, value] of Object.entries(event.effect)) {
      if (data.stats[stat] !== undefined) {
        data.stats[stat] = this.dm.clampStat(stat, data.stats[stat] + value)
      }
    }
  }

  getLocationModifier(data, action) {
    const location = LOCATIONS.find(loc => loc.name === data.sys.location)
    if (!location || !location.modifier) return null
    const trainActions = ['鞭打', '打脸', '打屁股', '羞辱', '挠痒']
    const healActions = ['摸摸', '抱抱', '安慰', '投喂', '洗澡', '陪玩']
    if (trainActions.includes(action)) {
      return location.modifier
    } else if (healActions.includes(action)) {
      const reverseModifier = {}
      for (const [key, value] of Object.entries(location.modifier)) {
        reverseModifier[key] = -value * 0.5
      }
      return reverseModifier
    }
    return null
  }

  applyModifier(stats, modifier) {
    for (const [stat, value] of Object.entries(modifier)) {
      if (stats[stat] !== undefined) {
        stats[stat] += value
      }
    }
  }

  damageRandomClothing(data, damage) {
    const validTargets = CLOTHING_SLOTS.filter(
      slot => data.clothes[slot]?.rarity === 'common' && data.clothes[slot]?.dur > 0
    )
    if (validTargets.length > 0) {
      const target = validTargets[Math.floor(Math.random() * validTargets.length)]
      data.clothes[target].dur = Math.max(0, data.clothes[target].dur - damage)
      if (data.clothes[target].dur === 0) {
        data.clothes[target] = { name: '未穿', rarity: 'none', charm: 0, dur: 0, effect: null }
        data.sys.clothesBroken = (data.sys.clothesBroken || 0) + 1
        data.achievements.clothesBroken = (data.achievements.clothesBroken || 0) + 1
      }
    }
  }

  updateTraits(data) {
    const st = data.stats
    const counts = { 'trait-bad': 0, 'trait-good': 0, 'trait-lewd': 0 }
    const newTraits = []

    const sortedTraits = [...CONFIG.TRAITS].sort((a, b) => b.priority - a.priority)

    for (const trait of sortedTraits) {
      try {
        if (evalCondition(trait.condition, st)) {
          const css = trait.css
          const limit = CONFIG.TRAIT_LIMITS[css.replace('trait-', '')] || 5
          if (counts[css] < limit) {
            newTraits.push({ name: trait.name, css: css })
            counts[css]++
          }
        }
      } catch (e) {
        continue
      }
    }

    const isClothesEmpty = (slot) => data.clothes[slot]?.rarity === 'none' || (data.clothes[slot]?.rarity === 'common' && data.clothes[slot]?.dur <= 0)
    if (isClothesEmpty('upper') && isClothesEmpty('lower')) {
      newTraits.push({ name: '暴露', css: 'trait-lewd' })
    }
    const allEmpty = CLOTHING_SLOTS.every(isClothesEmpty)
    if (allEmpty) {
      newTraits.push({ name: '一丝不挂', css: 'trait-lewd' })
    }

    const hasMythic = Object.values(data.clothes).some(item => item.rarity === 'mythic')
    if (hasMythic) {
      newTraits.push({ name: '神话装', css: 'trait-good' })
    }

    data.traits = newTraits
  }

}

export default EventSystem
