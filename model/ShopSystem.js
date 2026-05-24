import { CONFIG, CLOTHING_DB, SHOP_ITEMS, EQUIPMENT_RARITY, CLOTHING_SLOTS, generateRandomEffect } from '../config/cfg.js'

const SLOT_NAMES = {
  head: '头饰', upper: '上装', lower: '下装', bra: '胸罩', panty: '内裤', accessory: '饰品', shoes: '鞋子'
}

class ShopSystem {
  constructor(dataManager) {
    this.dm = dataManager
  }

  formatShopMessage(coins, ownerName) {
    let msg = `【${ownerName}黑市】(当前调教币: ${coins})\n`
    msg += `指令格式: &购买[商品名] / &购买y[序号]换装 / &购买d[序号]道具\n\n`

    const clothingItems = []
    const consumableItems = []

    for (const [name, item] of Object.entries(SHOP_ITEMS)) {
      if (item.type === 'clothing') {
        const [firstSlot, firstIdx] = item.items[0].split(':')
        const clothingData = CLOTHING_DB[firstSlot][parseInt(firstIdx)]
        const rarity = EQUIPMENT_RARITY[clothingData.rarity]
        const slotDesc = item.items.map(spec => {
          const [slot] = spec.split(':')
          return SLOT_NAMES[slot] || slot
        }).join('+')
        clothingItems.push({ name, cost: item.cost, desc: `${rarity.name} ${slotDesc}` })
      } else if (item.type === 'consumable') {
        consumableItems.push({ name, cost: item.cost, desc: item.desc.replace(/猫娘/g, '').slice(0, 15) })
      }
    }

    if (clothingItems.length > 0) {
      msg += `【换装区】\n`
      clothingItems.forEach((item, index) => {
        msg += `${index + 1}. ${item.name} (${item.desc}) - ${item.cost}币\n`
      })
      msg += `\n`
    }

    if (consumableItems.length > 0) {
      msg += `【道具区】\n`
      consumableItems.forEach((item, index) => {
        msg += `${index + 1}. ${item.name} (${item.desc}) - ${item.cost}币\n`
      })
    }

    return msg
  }

  findShopItem(itemText) {
    if (SHOP_ITEMS[itemText]) return { name: itemText, ...SHOP_ITEMS[itemText] }
    return null
  }

  findShopItemByCode(code) {
    const match = code.match(/^([yd])(\d+)$/i)
    if (!match) return null
    const type = match[1].toLowerCase()
    const index = parseInt(match[2]) - 1
    const items = type === 'y'
      ? Object.entries(SHOP_ITEMS).filter(([, v]) => v.type === 'clothing')
      : Object.entries(SHOP_ITEMS).filter(([, v]) => v.type === 'consumable')
    if (index < 0 || index >= items.length) return null
    const [name, item] = items[index]
    return { name, ...item }
  }

  executePurchase(data, item, ownerName) {
    try {
      switch (item.type) {
        case 'clothing':
          return this.purchaseClothing(data, item, ownerName)
        case 'consumable':
          return this.purchaseConsumable(data, item, ownerName)
        default:
          return { success: false, message: '未知的商品类型' }
      }
    } catch (error) {
      console.error('[Smer] 购买商品失败:', error)
      const hasWorn = CLOTHING_SLOTS.some(slot => {
        const c = data.clothes[slot]
        return c && c.rarity === 'common' && (c.dur === undefined || c.dur > 0)
      })
      if (hasWorn) {
        return { success: false, message: '猫娘身上还有衣物未脱净，无法购买调教装！\n💡 需先通过调教互动打掉所有衣物耐久。' }
      }
      return { success: false, message: `购买失败: ${error.message}` }
    }
  }

  purchaseClothing(data, item, ownerName) {
    const wornSlots = CLOTHING_SLOTS.filter(slot => {
      const c = data.clothes[slot]
      return c && c.rarity === 'common' && (c.dur === undefined || c.dur > 0)
    })
    if (wornSlots.length > 0) {
      const slotNames = {
        head: '头饰', upper: '上装', lower: '下装',
        bra: '胸罩', panty: '内裤', accessory: '饰品', shoes: '鞋子'
      }
      const wornNames = wornSlots.map(s => slotNames[s]).join('、')
      return {
        success: false,
        message: `猫娘身上还有${wornNames}未脱净，无法购买调教装！\n💡 提示：当所有衣物耐久归零后，商店将开放调教装购买权限。`
      }
    }

    const clothingStr = []
    const effectsApplied = []

    for (const itemSpec of item.items) {
      const [slot, index] = itemSpec.split(':')
      if (!CLOTHING_DB[slot]) continue
      const clothingData = CLOTHING_DB[slot][parseInt(index)]
      if (!clothingData) continue

      const newRarity = clothingData.rarity
      const rarityInfo = EQUIPMENT_RARITY[newRarity]
      if (!rarityInfo) {
        console.error(`[Smer] 未知稀有度: ${newRarity}, 商品: ${clothingData.name}`)
        continue
      }
      const effect = generateRandomEffect(rarityInfo.effectCount)
      const charmRange = rarityInfo.charmRange
      const charm = charmRange
        ? charmRange[0] + Math.floor(Math.random() * (charmRange[1] - charmRange[0] + 1))
        : (rarityInfo.charm || 0)

      data.clothes[slot] = {
        name: clothingData.name,
        rarity: newRarity,
        charm: charm,
        effect: effect
      }
      if (!data.achievements.clothesCount) data.achievements.clothesCount = {}
      data.achievements.clothesCount[slot] = (data.achievements.clothesCount[slot] || 0) + 1
      clothingStr.push(clothingData.name)
      effectsApplied.push(effect)
    }

    for (const effect of effectsApplied) {
      for (const [stat, value] of Object.entries(effect)) {
        if (data.stats[stat] !== undefined) {
          data.stats[stat] = this.dm.clampStat(stat, data.stats[stat] + value)
        }
      }
    }

    data.achievements.totalCharm = this.dm.getTotalCharm(data)

    if (clothingStr.length === 0) {
      return { success: false, message: '购买失败：商品数据异常，请联系管理员' }
    }

    return {
      success: true,
      message: this.dm.replaceOwnerName(item.desc, data),
      logText: `购买并装备了【${clothingStr.join('、')}】！`
    }
  }

  purchaseConsumable(data, item, ownerName) {
    if (item.effect) {
      for (const [stat, value] of Object.entries(item.effect)) {
        if (data.stats[stat] !== undefined) {
          data.stats[stat] = this.dm.clampStat(stat, data.stats[stat] + value)
        }
      }
    }
    if (item.stripTraining) {
      this.dm.stripTrainingClothes(data)
      data.achievements.totalCharm = this.dm.getTotalCharm(data)
    }
    return {
      success: true,
      message: this.dm.replaceOwnerName(item.desc, data),
      logText: item.stripTraining
        ? '使用了【卸装水】，所有调教装备被溶解！'
        : `使用了【${item.name}】！`
    }
  }

  checkAchievements(data) {
    const newAchievements = []
    const lastUserName = Object.values(data.users).sort((a, b) => ((b.contribution || 0)) - ((a.contribution || 0)))[0]?.name || ''

    data.achievements.totalCharm = this.dm.getTotalCharm(data)
    this.dm.updateStatHistory(data)

    for (const [key, achievement] of Object.entries(CONFIG.ACHIEVEMENTS)) {
      if (data.sys.achievements.includes(key)) continue

      let unlocked = false
      const ach = achievement

      if (ach.type === 'first_reach') {
        const statVal = data.stats[ach.stat] || 0
        const reachedKey = `${key}_reached`
        if (statVal >= ach.value && !data.sys.firstReach[reachedKey]) {
          data.sys.firstReach[reachedKey] = true
          unlocked = true
        }
      } else if (ach.type === 'consecutive') {
        unlocked = this.dm.checkConsecutive(data, ach.stat, ach.value, ach.count)
      } else if (ach.type === 'reach_zero') {
        const statVal = data.stats[ach.stat] || 0
        const zeroKey = `${key}_zero`
        if (statVal === 0 && !data.sys.firstReach[zeroKey]) {
          data.sys.firstReach[zeroKey] = true
          unlocked = true
        }
      } else if (ach.type === 'revive_from_zero') {
        const statVal = data.stats[ach.stat] || 0
        const history = data.sys.statHistory?.[ach.stat] || []
        const wasZero = history.length > 1 && history[history.length - 2] === 0
        const nowAlive = statVal > 0
        const reviveKey = `${key}_revived`
        if (wasZero && nowAlive && !data.sys.firstReach[reviveKey]) {
          data.sys.firstReach[reviveKey] = true
          unlocked = true
        }
      } else if (ach.type === 'shop_buy') {
        const buyCount = data.achievements.shopBuyCount || 0
        unlocked = buyCount >= ach.target
      } else if (ach.type === 'shop_all') {
        unlocked = (data.achievements.shopAllBought || false)
      } else if (ach.type === 'has_clothes') {
        const item = data.clothes[ach.slot]
        unlocked = item && item.rarity !== 'none'
      } else if (ach.type === 'clothes_count') {
        const count = data.achievements.clothesCount?.[ach.slot] || 0
        unlocked = count >= ach.target
      } else if (ach.type === 'full_mythic') {
        const slots = ['head', 'upper', 'lower', 'bra', 'panty', 'accessory', 'shoes']
        unlocked = slots.every(slot => data.clothes[slot]?.rarity === 'mythic')
      } else if (ach.type === 'naked_days') {
        const nakedDays = data.achievements.nakedDays || 0
        unlocked = nakedDays >= ach.target
      } else if (ach.type === 'destroy_master') {
        const destroyCount = data.achievements.destroyMasterCount || 0
        unlocked = destroyCount >= ach.target
      } else {
        switch (key) {
          case 'first_blood':
          case 'train_500':
            unlocked = (data.achievements.totalTrain || 0) >= ach.target
            break
          case 'healer':
            unlocked = (data.achievements.totalHeal || 0) >= ach.target
            break
          case 'survivor_3':
          case 'survivor_30':
          case 'survivor_99':
          case 'survivor_520':
          case 'survivor_1314':
            unlocked = (data.achievements.survivalDays || 0) >= ach.target
            break
          case 'breaker_5':
          case 'breaker_10':
            unlocked = (data.achievements.clothesBroken || 0) >= ach.target
            break
          case 'obedience_66':
          case 'obedience_299':
          case 'obedience_520':
          case 'obedience_888':
          case 'obedience_1314':
            unlocked = (data.stats.obedience || 0) >= ach.target
            break
          case 'lewd_66':
          case 'lewd_299':
          case 'lewd_520':
          case 'lewd_888':
          case 'lewd_1314':
            unlocked = (data.stats.lewd || 0) >= ach.target
            break
          case 'depravity_66':
          case 'depravity_299':
          case 'depravity_520':
          case 'depravity_888':
          case 'depravity_1314':
            unlocked = (data.stats.depravity || 0) >= ach.target
            break
          case 'charm_520':
          case 'charm_1314':
          case 'charm_3640':
            unlocked = (data.achievements.totalCharm || 0) >= ach.target
            break
        }
      }

      if (unlocked) {
        data.sys.achievements.push(key)
        data.sys.trainCoins += ach.reward
        newAchievements.push(ach)
      }
    }

    if (newAchievements.length > 0) {
      const achievementNames = newAchievements.map(a => `【${a.name}】`).join('、')
      this.dm.addLog(data, `${lastUserName ? lastUserName + ' ' : ''}解锁成就：${achievementNames}`, '#ffcc00')
    }
  }
}

export default ShopSystem
