const CONFIG = {
  MAX_LOGS: 10, // 事件日志最大条数
  INTERACT_COOLDOWN: 30, // 互动指令全局冷却(秒)
  VOTE_EXPIRE: 3, // 投票超时时间(分钟)
  VOTE_REQUIRED: 3, // 投票通过所需同意人数
  STAT_LIMITS: { // 各状态上限
    satiety: 100, // 饱食度上限
    energy: 100, // 体力上限
    pain: 100, // 疼痛上限
    sensitivity: 100, // 敏感度上限
    hygiene: 100, // 清洁度上限
    lewd: 1314, // 涩气上限
    depravity: 1314, // 堕落值上限
    obedience: 1314 // 服从值上限
  },
  SATIETY_OPTIMAL_MIN: 60, // 饱食最优区间下限(此区间内加成最大)
  SATIETY_OPTIMAL_MAX: 80, // 饱食最优区间上限
  ENERGY_OPTIMAL_MIN: 80, // 体力最优区间下限
  ENERGY_OPTIMAL_MAX: 100, // 体力最优区间上限
  PAIN_OPTIMAL_MIN: 80, // 疼痛最优区间下限(M属性高pain有益)
  PAIN_OPTIMAL_MAX: 100, // 疼痛最优区间上限
  SENSITIVITY_OPTIMAL_MIN: 80, // 敏感度最优区间下限
  SENSITIVITY_OPTIMAL_MAX: 100, // 敏感度最优区间上限
  HYGIENE_OPTIMAL_MIN: 80, // 清洁度最优区间下限
  HYGIENE_OPTIMAL_MAX: 100, // 清洁度最优区间上限
  INTERACTION_EFFECTS: { // 各互动指令效果数值
    鞭打: {
      painGain: 15, // 疼痛增加
      critPainGain: 30, // 暴击疼痛增加
      depravityGain: 5, // 堕落增加
      obedienceGain: 8, // 服从增加
      critDepravityGain: 10, // 暴击堕落增加
      critObedienceGain: 16, // 暴击服从增加
      trainCoinReward: 10, // 调教币奖励
      critThreshold: 95, // 暴击阈值(RNG>=此值触发暴击)
      type: 'train' // 类型: train=调教 pet=宠爱
    },
    摸摸: {
      sensitivityGain: 10, // 敏感增加
      satietyGain: 10, // 饱食增加
      critSensitivityGain: 20,
      critSatietyGain: 20,
      painLoss: 15, // 疼痛减少
      critPainLoss: 25, // 暴击疼痛减少
      critThreshold: 95,
      type: 'pet'
    },
    打脸: {
      painGain: 10,
      critPainGain: 20,
      depravityGain: 4,
      obedienceGain: 6,
      critDepravityGain: 8,
      critObedienceGain: 12,
      trainCoinReward: 8,
      critThreshold: 90,
      type: 'train'
    },
    打屁股: {
      painGain: 12,
      critPainGain: 24,
      lewdGain: 8,
      depravityGain: 6,
      critLewdGain: 16,
      critDepravityGain: 12,
      trainCoinReward: 12,
      critThreshold: 88,
      type: 'train'
    },
    挠痒: {
      obedienceGain: 5,
      sensitivityGain: 10,
      lewdGain: 12,
      critThreshold: 85,
      critSensitivityGain: 18,
      critLewdGain: 20,
      trainCoinReward: 8,
      type: 'train'
    },
    投喂: {
      satietyGain: 30,
      energyGain: 20,
      painLoss: 20,
      critSatietyGain: 40,
      critEnergyGain: 30,
      critPainLoss: 35,
      critThreshold: 90,
      type: 'pet'
    },
    抱抱: {
      hygieneGain: 15,
      sensitivityGain: 8,
      painLoss: 10,
      critHygieneGain: 25,
      critSensitivityGain: 14,
      critPainLoss: 18,
      critThreshold: 85,
      type: 'pet'
    },
    羞辱: {
      depravityGain: 10,
      obedienceGain: 8,
      sensitivityGain: 5,
      critDepravityGain: 20,
      critObedienceGain: 16,
      critSensitivityGain: 10,
      trainCoinReward: 10,
      critThreshold: 90,
      type: 'train'
    },
    安慰: {
      satietyGain: 15,
      energyGain: 20,
      painLoss: 20,
      critSatietyGain: 25,
      critEnergyGain: 30,
      critPainLoss: 30,
      critThreshold: 85,
      type: 'pet'
    },
    洗澡: {
      hygieneGain: 50,
      energyGain: 10,
      painLoss: 15,
      critHygieneGain: 70,
      critEnergyGain: 15,
      critPainLoss: 25,
      critThreshold: 80,
      type: 'pet'
    },
    陪玩: {
      sensitivityGain: 8,
      hygieneGain: 10,
      painLoss: 15,
      critSensitivityGain: 14,
      critHygieneGain: 18,
      critPainLoss: 25,
      critThreshold: 85,
      type: 'pet'
    },
    振动: {
      painGain: 8,
      critPainGain: 16,
      sensitivityGain: 15,
      lewdGain: 10,
      critSensitivityGain: 25,
      critLewdGain: 20,
      trainCoinReward: 15,
      critThreshold: 90,
      type: 'train'
    },
    猫叫: {
      lewdGain: 8,
      depravityGain: 6,
      sensitivityGain: 3,
      critLewdGain: 16,
      critDepravityGain: 12,
      critSensitivityGain: 6,
      trainCoinReward: 10,
      critThreshold: 85,
      type: 'train'
    },
    禁闭: {
      satietyLoss: 10,
      energyLoss: 15,
      obedienceGain: 10,
      depravityGain: 8,
      sensitivityGain: 4,
      critObedienceGain: 20,
      critDepravityGain: 16,
      critSensitivityGain: 8,
      trainCoinReward: 15,
      critThreshold: 90,
      type: 'train'
    },
    滴蜡: {
      painGain: 12,
      critPainGain: 24,
      lewdGain: 6,
      sensitivityGain: 8,
      critLewdGain: 12,
      critSensitivityGain: 16,
      trainCoinReward: 12,
      critThreshold: 88,
      type: 'train'
    }
  },
  INTERACTION_TIME_COST: 15, // 互动消耗游戏时间(分钟)
  SHOP_TIME_COST: 5, // 购买消耗游戏时间(分钟)
  DAILY_ENERGY_RECOVERY: 30, // 每日体力恢复量
  DAILY_SATIETY_LOSS: 15, // 每日饱食消耗量
  NIGHT_EVENT_CHANCE: 0.4, // 半夜事件触发概率(0-1)
  TICK_DECAY: { // 每次tick(互动/购买后)的状态自然变化
    satiety: -5, // 饱食每次-5
    energy: -5, // 体力每次-5
    pain: 5, // 疼痛每次+5(痛觉积累)
    sensitivity: -5, // 敏感每次-5
    hygiene: -5 // 清洁每次-5
  },
  ACHIEVEMENTS: { // 成就定义: name=名称 desc=描述 target=目标值 reward=调教币奖励
    'first_blood': { name: '初次调教', desc: '累计调教100点', target: 100, reward: 50 },
    'train_500': { name: '千锤百炼', desc: '累计调教500点', target: 500, reward: 120 },
    'healer': { name: '温柔之手', desc: '累计宠爱200点', target: 200, reward: 60 },
    'obedience_66': { name: '初识顺从', desc: '服从值达到66', target: 66, reward: 40 },
    'obedience_299': { name: '渐趋顺从', desc: '服从值达到299', target: 299, reward: 60 },
    'obedience_520': { name: '死心塌地', desc: '服从值达到520', target: 520, reward: 80 },
    'obedience_888': { name: '深度臣服', desc: '服从值达到888', target: 888, reward: 120 },
    'obedience_1314': { name: '永恒臣服', desc: '服从值达到1314', target: 1314, reward: 200 },
    'lewd_66': { name: '涩气初绽', desc: '涩气值达到66', target: 66, reward: 40 },
    'lewd_299': { name: '欲念渐起', desc: '涩气值达到299', target: 299, reward: 60 },
    'lewd_520': { name: '欲念缠身', desc: '涩气值达到520', target: 520, reward: 80 },
    'lewd_888': { name: '欲壑难填', desc: '涩气值达到888', target: 888, reward: 120 },
    'lewd_1314': { name: '极欲化身', desc: '涩气值达到1314', target: 1314, reward: 200 },
    'depravity_66': { name: '堕落萌芽', desc: '堕落值达到66', target: 66, reward: 40 },
    'depravity_299': { name: '渐趋堕落', desc: '堕落值达到299', target: 299, reward: 60 },
    'depravity_520': { name: '沉沦初现', desc: '堕落值达到520', target: 520, reward: 80 },
    'depravity_888': { name: '堕落深渊', desc: '堕落值达到888', target: 888, reward: 120 },
    'depravity_1314': { name: '堕落终焉', desc: '堕落值达到1314', target: 1314, reward: 200 },
    'pain_m_awaken': { name: 'M显现', desc: '疼痛首次达到100', type: 'first_reach', stat: 'pain', value: 100, reward: 100 },
    'pain_collapse': { name: '濒临崩溃', desc: '连续3次疼痛为100', type: 'consecutive', stat: 'pain', value: 100, count: 3, reward: 80 },
    'sensitivity_stone': { name: '石女', desc: '敏感度归零', type: 'reach_zero', stat: 'sensitivity', reward: 50 },
    'sensitivity_fly': { name: '一触即飞', desc: '连续3次敏感度为100', type: 'consecutive', stat: 'sensitivity', value: 100, count: 3, reward: 100 },
    'energy_dying': { name: '奄奄一息', desc: '连续3次体力为0', type: 'consecutive', stat: 'energy', value: 0, count: 3, reward: 80 },
    'energy_revive': { name: '阎王不收', desc: '体力从0恢复', type: 'revive_from_zero', stat: 'energy', reward: 60 },
    'satiety_starving': { name: '饥肠辘辘', desc: '饱食归零', type: 'reach_zero', stat: 'satiety', reward: 50 },
    'satiety_starve_to_death': { name: '我饿死也不', desc: '连续3次饱食为0', type: 'consecutive', stat: 'satiety', value: 0, count: 3, reward: 100 },
    'satiety_overfeed': { name: '你要撑死我', desc: '连续3次饱食为100', type: 'consecutive', stat: 'satiety', value: 100, count: 3, reward: 80 },
    'hygiene_cinderella': { name: '灰姑娘', desc: '连续3次清洁为0', type: 'consecutive', stat: 'hygiene', value: 0, count: 3, reward: 60 },
    'hygiene_lotus': { name: '我有洁癖', desc: '连续3次清洁为100', type: 'consecutive', stat: 'hygiene', value: 100, count: 3, reward: 100 },
    'survivor_3': { name: '黏人的猫', desc: '猫娘存活3天', target: 3, reward: 60 },
    'survivor_30': { name: '久经调教', desc: '猫娘存活30天', target: 30, reward: 150 },
    'survivor_99': { name: '长长久久', desc: '猫娘存活99天', target: 99, reward: 200 },
    'survivor_520': { name: '我爱你', desc: '猫娘存活520天', target: 520, reward: 300 },
    'survivor_1314': { name: '一生一世', desc: '猫娘存活1314天', target: 1314, reward: 500 },
    'breaker_5': { name: '衣不蔽体', desc: '累计破坏5件衣物', target: 5, reward: 40 },
    'breaker_10': { name: '碎衣狂魔', desc: '累计破坏10件衣物', target: 10, reward: 70 },
    'shop_first_buy': { name: '初入衣柜', desc: '购买1件衣服', type: 'shop_buy', target: 1, reward: 30 },
    'shop_all_buy': { name: '全图鉴', desc: '商店衣服全买', type: 'shop_all', reward: 200 },
    'shop_has_bra': { name: '半柜芬芳', desc: '拥有5件胸罩', type: 'clothes_count', slot: 'bra', target: 5, reward: 50 },
    'shop_5_panty': { name: '迷迭香', desc: '拥有5件内裤', type: 'clothes_count', slot: 'panty', target: 5, reward: 80 },
    'shop_full_mythic': { name: '神装', desc: '拥有全套神话装', type: 'full_mythic', reward: 300 },
    'shop_5_shoes': { name: '足控', desc: '拥有5件鞋子', type: 'clothes_count', slot: 'shoes', target: 5, reward: 80 },
    'shop_destroy_master': { name: '善解人衣', desc: '触发2次10%掉光耐久', type: 'destroy_master', target: 2, reward: 100 },
    'shop_naked_3d': { name: '衣服是什么', desc: '未穿连续3天', type: 'naked_days', target: 3, reward: 60 },
    'shop_naked_7d': { name: '裸体猫娘', desc: '未穿连续7天', type: 'naked_days', target: 7, reward: 100 },
    'charm_520': { name: '小妖精', desc: '总魅力达到520', target: 520, reward: 80 },
    'charm_1314': { name: '姐就是女王', desc: '总魅力达到1314', target: 1314, reward: 150 },
    'charm_3640': { name: '万众倾倒', desc: '总魅力达到3640', target: 3640, reward: 200 }
  },

  STATUS_TEXTS: [ // 状态描述文本: priority越大越优先, 只显示第一个匹配的
    { priority: 100, condition: 'energy <= 0 && satiety <= 0', text: '已失去意识，需要紧急抢救...' },
    { priority: 95, condition: 'energy <= 20', text: '精疲力竭，连站起来的力气都没有...' },
    { priority: 90, condition: 'satiety <= 20', text: '饥饿难耐，肚子咕咕叫...' },
    { priority: 85, condition: 'hygiene <= 20', text: '浑身污垢，急需清洁...' },
    { priority: 82, condition: 'sensitivity <= 20', text: '一点感觉都没有吖~' },
    { priority: 80, condition: 'pain >= 80 && energy >= 50 && satiety >= 50', text: 'M属性觉醒，状态极佳！' },
    { priority: 75, condition: 'pain >= 50 && sensitivity >= 50', text: '身体火热，渴望更多刺激...' },
    { priority: 70, condition: 'depravity >= 1314', text: '堕天使' },
    { priority: 68, condition: 'depravity >= 666', text: '眼神迷离，已深深堕落...' },
    { priority: 65, condition: 'lewd >= 666', text: '气息紊乱，欲念缠身...' },
    { priority: 62, condition: 'lewd >= 299 && lewd < 666', text: '发情的猫' },
    { priority: 60, condition: 'obedience >= 520', text: '温顺乖巧，等待主人指令...' },
    { priority: 55, condition: 'energy >= 80 && satiety >= 80 && hygiene >= 50', text: '精神焕发，活力满满！' },
    { priority: 50, condition: 'pain <= 20', text: '状态平稳，等待调教...' },
    { priority: 0, condition: 'true', text: '正在适应中...' }
  ],

  TRAITS: [ // 特质标签: priority越大越优先, 每个css类别最多显示TRAIT_LIMITS个
    { priority: 100, condition: 'energy <= 0 && satiety <= 0', name: '濒死', css: 'trait-bad' },
    { priority: 95, condition: 'energy <= 20 && energy > 0', name: '虚脱', css: 'trait-bad' },
    { priority: 90, condition: 'satiety <= 20', name: '饥饿', css: 'trait-bad' },
    { priority: 80, condition: 'hygiene <= 20', name: '污垢', css: 'trait-bad' },
    { priority: 75, condition: 'pain >= 80', name: 'M体质', css: 'trait-lewd' },
    { priority: 70, condition: 'sensitivity >= 80', name: '极度敏感', css: 'trait-lewd' },
    { priority: 65, condition: 'lewd >= 666', name: '欲念缠身', css: 'trait-lewd' },
    { priority: 60, condition: 'lewd >= 299 && lewd < 666', name: '欲念渐起', css: 'trait-lewd' },
    { priority: 55, condition: 'depravity >= 666', name: '堕落深渊', css: 'trait-lewd' },
    { priority: 50, condition: 'depravity >= 299 && depravity < 666', name: '渐趋堕落', css: 'trait-lewd' },
    { priority: 45, condition: 'obedience >= 666', name: '绝对服从', css: 'trait-good' },
    { priority: 40, condition: 'obedience >= 299 && obedience < 666', name: '顺从', css: 'trait-good' },
    { priority: 35, condition: 'obedience >= 88 && obedience < 299', name: '初识顺从', css: 'trait-good' },
    { priority: 30, condition: 'energy >= 80 && satiety >= 80', name: '状态良好', css: 'trait-good' },
    { priority: 25, condition: 'hygiene >= 80', name: '洁净', css: 'trait-good' }
  ],

  TRAIT_LIMITS: { // 每个css类别的最大显示数量
    bad: 3, // trait-bad(负面)最多3个
    good: 3, // trait-good(正面)最多3个
    lewd: 4 // trait-lewd(涩向)最多4个
  }
}

const LOCATIONS = [ // 地点列表: name=地点名 modifier=每小时状态修正 (每项2+1-, 梦幻乐园除外)
  { name: '杂乱的卧室', modifier: { energy: 5, satiety: -3, hygiene: -5 } },
  { name: '黑海岸沙滩', modifier: { sensitivity: 5, depravity: 5, hygiene: 3, obedience: -3 } },
  { name: '幽暗的地下室', modifier: { pain: 5, obedience: 5, sensitivity: -3 } },
  { name: '温暖的浴场', modifier: { hygiene: 15, satiety: 3, sensitivity: 3, pain: -10 } },
  { name: '梦幻乐园', modifier: { lewd: 10, depravity: 10, obedience: 10 } },
  { name: '昏暗的酒吧', modifier: { lewd: 5, satiety: 5, energy: -5 } },
  { name: '教室', modifier: { energy: 3, pain: 5, lewd: -3, depravity: -3 } }
]

const EQUIPMENT_RARITY = { // 装备稀有度定义: name=显示名 color=标签色 charmRange=魅力区间 effectCount=效果条数 multiplier=训练加成系数
  common: { name: '普通', color: '#aaaaaa', charm: 0, multiplier: 1.0 },
  rare: { name: '稀有', color: '#44aaff', charmRange: [60, 120], effectCount: 1, multiplier: 1.3 },
  epic: { name: '传说', color: '#ff9933', charmRange: [120, 250], effectCount: 2, multiplier: 1.6 },
  mythic: { name: '神话', color: '#e91e63', charmRange: [250, 520], effectCount: 3, multiplier: 2.0 }
}

const EFFECT_POOL = [ // 效果随机池: stat=属性 range=[最小,最大]
  { stat: 'lewd', range: [1, 5] },
  { stat: 'depravity', range: [1, 5] },
  { stat: 'obedience', range: [1, 5] },
  { stat: 'pain', range: [1, 5] },
  { stat: 'sensitivity', range: [1, 5] },
  { stat: 'energy', range: [-5, -1] }
]

function generateRandomEffect(count) { // 从EFFECT_POOL随机抽取count条不重复效果
  const effect = {}
  const pool = [...EFFECT_POOL]
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    const { stat, range } = pool.splice(idx, 1)[0]
    const value = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1))
    effect[stat] = value
  }
  return effect
}

const CLOTHING_SLOTS = ['head', 'upper', 'lower', 'bra', 'panty', 'accessory', 'shoes'] // 装备槽位顺序

const CLOTHING_DB = { // 服装数据库: 每个槽位的所有装备, index决定商店编号(y序号)
  head: [
    { name: '发夹', dur: 100, rarity: 'common' },
    { name: '发带', dur: 100, rarity: 'common' },
    { name: '大圆框眼镜', dur: 100, rarity: 'common' },
    { name: '运动帽', dur: 100, rarity: 'common' },
    { name: '兔耳兜帽', rarity: 'rare' },
    { name: '猫耳贝雷帽', rarity: 'rare' },
    { name: '拘束头套', rarity: 'epic' },
    { name: '盲拘头套', rarity: 'epic' },
    { name: '毛绒猫耳', rarity: 'mythic' }
  ],
  upper: [
    { name: '白色T恤', dur: 100, rarity: 'common' },
    { name: '白色衬衫', dur: 100, rarity: 'common' },
    { name: '紧身透衣', dur: 100, rarity: 'common' },
    { name: '丝质睡衣', dur: 100, rarity: 'common' },
    { name: '女仆装', rarity: 'rare' },
    { name: '丝绸礼服', rarity: 'rare' },
    { name: '胶衣套装', rarity: 'epic' },
    { name: '束缚皮带', rarity: 'epic' },
    { name: '半透猫娘衣', rarity: 'mythic' }
  ],
  lower: [
    { name: '牛仔短裤', dur: 100, rarity: 'common' },
    { name: '百褶短裙', dur: 100, rarity: 'common' },
    { name: '紧身透短裤', dur: 100, rarity: 'common' },
    { name: '丝质短裙', dur: 100, rarity: 'common' },
    { name: '女仆短裙', rarity: 'rare' },
    { name: '皮质热裤', rarity: 'rare' },
    { name: '死库水', rarity: 'epic' },
    { name: '拘束裤', rarity: 'epic' },
    { name: '猫尾超短裙', rarity: 'mythic' }
  ],
  bra: [
    { name: '棉质胸罩', dur: 100, rarity: 'common' },
    { name: '蕾丝胸罩', dur: 100, rarity: 'common' },
    { name: '黑丝胸罩', dur: 100, rarity: 'common' },
    { name: '乳贴', dur: 100, rarity: 'common' },
    { name: '拘束胸罩', rarity: 'rare' },
    { name: '蕾丝半罩', rarity: 'rare' },
    { name: '振动乳贴', rarity: 'epic' },
    { name: '极拘束胸罩', rarity: 'epic' },
    { name: '乳首铃铛夹', rarity: 'mythic' }
  ],
  panty: [
    { name: '棉质内裤', dur: 100, rarity: 'common' },
    { name: '三角内裤', dur: 100, rarity: 'common' },
    { name: '蕾丝内裤', dur: 100, rarity: 'common' },
    { name: '黑丝紧内裤', dur: 100, rarity: 'common' },
    { name: 'C字裤', rarity: 'rare' },
    { name: '蕾丝丁字裤', rarity: 'rare' },
    { name: '开裆内裤', rarity: 'epic' },
    { name: '拘束内裤', rarity: 'epic' },
    { name: '猫型开档', rarity: 'mythic' }
  ],
  accessory: [
    { name: '手表', dur: 100, rarity: 'common' },
    { name: '手链', dur: 100, rarity: 'common' },
    { name: '普通项链', dur: 100, rarity: 'common' },
    { name: '腕带', dur: 100, rarity: 'common' },
    { name: '猫耳头饰', rarity: 'rare' },
    { name: '口球', rarity: 'rare' },
    { name: '真皮项圈', rarity: 'epic' },
    { name: '拘束项圈', rarity: 'epic' },
    { name: '猫铃项圈', rarity: 'mythic' }
  ],
  shoes: [
    { name: '休闲板鞋', dur: 100, rarity: 'common' },
    { name: '软底拖鞋', dur: 100, rarity: 'common' },
    { name: '黑色皮鞋', dur: 100, rarity: 'common' },
    { name: '运动鞋', dur: 100, rarity: 'common' },
    { name: '高跟鞋', rarity: 'rare' },
    { name: '猫爪短靴', rarity: 'rare' },
    { name: '拘束靴', rarity: 'epic' },
    { name: '过膝拘束靴', rarity: 'epic' },
    { name: '猫爪长筒靴', rarity: 'mythic' }
  ]
}

const CLOTHING_PRESETS = [ // 初始服装预设方案
  {
    name: '日常装',
    clothes: {
      head: { ...CLOTHING_DB.head[0] },
      upper: { ...CLOTHING_DB.upper[0] },
      lower: { ...CLOTHING_DB.lower[0] },
      bra: { ...CLOTHING_DB.bra[0] },
      panty: { ...CLOTHING_DB.panty[0] },
      accessory: { ...CLOTHING_DB.accessory[0] },
      shoes: { ...CLOTHING_DB.shoes[0] }
    }
  },
  {
    name: '睡衣装',
    clothes: {
      head: { ...CLOTHING_DB.head[1] },
      upper: { ...CLOTHING_DB.upper[3] },
      lower: { ...CLOTHING_DB.lower[3] },
      bra: { ...CLOTHING_DB.bra[1] },
      panty: { ...CLOTHING_DB.panty[2] },
      accessory: { ...CLOTHING_DB.accessory[1] },
      shoes: { ...CLOTHING_DB.shoes[1] }
    }
  },
  {
    name: '校园装',
    clothes: {
      head: { ...CLOTHING_DB.head[2] },
      upper: { ...CLOTHING_DB.upper[1] },
      lower: { ...CLOTHING_DB.lower[1] },
      bra: { ...CLOTHING_DB.bra[3] },
      panty: { ...CLOTHING_DB.panty[1] },
      accessory: { ...CLOTHING_DB.accessory[2] },
      shoes: { ...CLOTHING_DB.shoes[2] }
    }
  },
  {
    name: '运动装',
    clothes: {
      head: { ...CLOTHING_DB.head[3] },
      upper: { ...CLOTHING_DB.upper[2] },
      lower: { ...CLOTHING_DB.lower[2] },
      bra: { ...CLOTHING_DB.bra[2] },
      panty: { ...CLOTHING_DB.panty[3] },
      accessory: { ...CLOTHING_DB.accessory[3] },
      shoes: { ...CLOTHING_DB.shoes[3] }
    }
  }
]

const SHOP_ITEMS = { // 商店商品: cost=价格 type=类型 items=装备引用(slot:index) desc=描述(rarity从CLOTHING_DB动态读取)
  '兔耳兜帽': { cost: 60, type: 'clothing', items: ['head:4'], desc: '给猫娘戴上可爱的兔耳兜帽。' },
  '猫耳贝雷帽': { cost: 60, type: 'clothing', items: ['head:5'], desc: '给猫娘戴上猫耳贝雷帽。' },
  '女仆装': { cost: 60, type: 'clothing', items: ['upper:4'], desc: '强行扒掉猫娘的衣服，套上女仆装上装！' },
  '丝绸礼服': { cost: 70, type: 'clothing', items: ['upper:5'], desc: '给猫娘穿上优雅的丝绸礼服。' },
  '女仆短裙': { cost: 55, type: 'clothing', items: ['lower:4'], desc: '给猫娘穿上女仆短裙。' },
  '皮质热裤': { cost: 55, type: 'clothing', items: ['lower:5'], desc: '给猫娘穿上皮质热裤。' },
  '拘束胸罩': { cost: 50, type: 'clothing', items: ['bra:4'], desc: '给猫娘穿上拘束胸罩，紧紧勒住。' },
  '蕾丝半罩': { cost: 50, type: 'clothing', items: ['bra:5'], desc: '给猫娘换上蕾丝半罩。' },
  'C字裤': { cost: 45, type: 'clothing', items: ['panty:4'], desc: '给猫娘穿上C字裤。' },
  '蕾丝丁字裤': { cost: 45, type: 'clothing', items: ['panty:5'], desc: '给猫娘换上蕾丝丁字裤。' },
  '猫耳头饰': { cost: 50, type: 'clothing', items: ['accessory:4'], desc: '给猫娘戴上猫耳头饰。' },
  '口球': { cost: 55, type: 'clothing', items: ['accessory:5'], desc: '给猫娘戴上口球。' },
  '高跟鞋': { cost: 55, type: 'clothing', items: ['shoes:4'], desc: '给猫娘穿上高跟鞋。' },
  '猫爪短靴': { cost: 55, type: 'clothing', items: ['shoes:5'], desc: '给猫娘穿上猫爪短靴。' },
  '拘束头套': { cost: 120, type: 'clothing', items: ['head:6'], desc: '给猫娘戴上拘束头套，遮住双眼和嘴巴。' },
  '盲拘头套': { cost: 160, type: 'clothing', items: ['head:7'], desc: '给猫娘戴上完全封闭的盲拘头套！' },
  '胶衣套装': { cost: 200, type: 'clothing', items: ['upper:6'], desc: '给猫娘穿上紧身胶衣。' },
  '束缚皮带': { cost: 200, type: 'clothing', items: ['upper:7'], desc: '用束缚皮带紧紧勒住猫娘上身！' },
  '死库水': { cost: 180, type: 'clothing', items: ['lower:6'], desc: '给猫娘穿过膝死库水。' },
  '拘束裤': { cost: 180, type: 'clothing', items: ['lower:7'], desc: '给猫娘穿上拘束裤！' },
  '振动乳贴': { cost: 170, type: 'clothing', items: ['bra:6'], desc: '强行给猫娘贴上振动乳贴！' },
  '极拘束胸罩': { cost: 170, type: 'clothing', items: ['bra:7'], desc: '给猫娘穿上极度拘束的胸罩，紧紧勒入肌肤！' },
  '开裆内裤': { cost: 140, type: 'clothing', items: ['panty:6'], desc: '给猫娘穿上开裆内裤。' },
  '拘束内裤': { cost: 170, type: 'clothing', items: ['panty:7'], desc: '给猫娘穿上无法脱下的拘束内裤！' },
  '真皮项圈': { cost: 130, type: 'clothing', items: ['accessory:6'], desc: '咔嚓。给猫娘戴上真皮项圈。钥匙被扔掉了。' },
  '拘束项圈': { cost: 170, type: 'clothing', items: ['accessory:7'], desc: '给猫娘戴上无法脱下的拘束项圈！' },
  '拘束靴': { cost: 150, type: 'clothing', items: ['shoes:6'], desc: '给猫娘穿上拘束靴。' },
  '过膝拘束靴': { cost: 180, type: 'clothing', items: ['shoes:7'], desc: '给猫娘穿上过膝拘束靴！' },
  '毛绒猫耳': { cost: 500, type: 'clothing', items: ['head:8'], desc: '【猫娘专属】毛绒猫耳发箍，触感柔软令人爱不释手。' },
  '半透猫娘衣': { cost: 600, type: 'clothing', items: ['upper:8'], desc: '【猫娘专属】半透明猫娘衣，若隐若现引人遐想。' },
  '猫尾超短裙': { cost: 550, type: 'clothing', items: ['lower:8'], desc: '【猫娘专属】超短裙后伸出一根真猫尾，随心情摇摆。' },
  '乳首铃铛夹': { cost: 520, type: 'clothing', items: ['bra:8'], desc: '【猫娘专属】铃铛夹在乳首，一动就叮当作响。' },
  '猫型开档': { cost: 580, type: 'clothing', items: ['panty:8'], desc: '【猫娘专属】猫耳造型开档内裤，可爱又撩人。' },
  '猫铃项圈': { cost: 480, type: 'clothing', items: ['accessory:8'], desc: '【猫娘专属】项圈挂着铃铛，走动时叮铃作响。' },
  '猫爪长筒靴': { cost: 520, type: 'clothing', items: ['shoes:8'], desc: '【猫娘专属】过膝长筒靴，脚尖是软萌猫爪。' },
  '快感增强液': {
    cost: 30,
    type: 'consumable',
    effect: { sensitivity: 50 },
    desc: '猫娘使用快感增强液，敏感度大幅提升！'
  },
  '东方同人本': {
    cost: 40,
    type: 'consumable',
    effect: { energy: 20, depravity: 15 },
    desc: '猫娘躲在角落看完整本R18同人志。体力恢复了，但堕落值增加了...'
  },
  '高级恢复剂': {
    cost: 80,
    type: 'consumable',
    effect: { energy: 40, satiety: 30 },
    desc: '猫娘使用高级恢复剂，体力和饱食度恢复！'
  },
  '清洁喷雾': {
    cost: 25,
    type: 'consumable',
    effect: { hygiene: 60 },
    desc: '给猫娘喷上清洁喷雾，清洁度大幅提升。'
  },
  '体力药剂': {
    cost: 45,
    type: 'consumable',
    effect: { energy: 50, satiety: -10 },
    desc: '猫娘喝下体力药剂，体力大幅恢复但消耗饱食度。'
  },
  '神秘药水': {
    cost: 150,
    type: 'consumable',
    effect: { pain: 30, energy: 30, satiety: 20, depravity: 20, lewd: 10 },
    desc: '神秘的药水，全面恢复但增加堕落值和涩气值。'
  },
  '卸装水': {
    cost: 520,
    type: 'consumable',
    effect: {},
    stripTraining: true,
    desc: '强力溶解剂，洗掉猫娘身上所有调教装备（不影响普通衣物），可重新购买调教装备！'
  }
}

const RANDOM_EVENTS = { // 随机事件: text=文本 effect=效果 weight=权重(越大越容易触发)
  night: [
    { text: '猫娘半夜做噩梦惊醒了。', effect: { pain: -10 }, weight: 30 },
    { text: '猫娘偷偷爬起来吃了个夜宵。', effect: { satiety: 15 }, weight: 25 },
    { text: '猫娘半夜睡觉流口水，把衣服弄脏了。', effect: { hygiene: -15 }, weight: 25 },
    { text: '猫娘梦见了奇怪的事情，醒来时面色潮红。', effect: { depravity: 5, lewd: 3 }, weight: 20 }
  ],
  day: [
    { text: '猫娘在路上遇到了奇怪的人，被骚扰了一下。', effect: { pain: -15, depravity: 5 }, weight: 15 },
    { text: '猫娘发现了一个不错的休息地方，稍微恢复了精神。', effect: { energy: 15, pain: 10 }, weight: 20 },
    { text: '猫娘不小心摔了一跤，擦伤了皮肤。', effect: { pain: -10 }, weight: 15 },
    { text: '猫娘看到了令人惊讶的景象，受到了一些冲击。', effect: { depravity: 10, lewd: 5 }, weight: 15 },
    { text: '猫娘遇到了好心人，得到了一些帮助。', effect: { satiety: 10, pain: 5 }, weight: 20 },
    { text: '猫娘的衣服勾到了什么东西，稍微破损了。', effect: {}, special: 'damage_clothes', weight: 10 },
    { text: '猫娘突然感到身体不适，休息了一会儿。', effect: { energy: -20, satiety: -10 }, weight: 10 }
  ],
  location: {
    '杂乱的卧室': [
      { text: '猫娘在杂乱的房间里翻找东西，找到了一些零食。', effect: { energy: 10 }, weight: 30 },
      { text: '房间太乱了，猫娘被绊倒了。', effect: { pain: -5 }, weight: 25 }
    ],
    '黑海岸沙滩': [
      { text: '海风吹过，猫娘感到一丝惬意。', effect: { pain: 10, energy: 5 }, weight: 30 },
      { text: '沙滩上有些奇怪的人在盯着猫娘看。', effect: { depravity: 10, lewd: 5 }, weight: 25 }
    ],
    '幽暗的地下室': [
      { text: '地下室太黑了，猫娘感到害怕。', effect: { pain: -15 }, weight: 30 },
      { text: '猫娘在地下室发现了一些奇怪的道具。', effect: { depravity: 25, lewd: 15 }, weight: 25 }
    ],
    '温暖的浴场': [
      { text: '热水让猫娘放松了不少，疼痛缓解了。', effect: { pain: 10, hygiene: 10 }, weight: 35 },
      { text: '浴场里有人偷偷盯着猫娘看。', effect: { lewd: 5, depravity: 3 }, weight: 25 }
    ],
    '梦幻乐园': [
      { text: '乐园的奇幻氛围让猫娘完全沉醉了。', effect: { lewd: 15, depravity: 15, obedience: 15 }, weight: 35 },
      { text: '猫娘在旋转木马上被奇怪的人搂住了。', effect: { lewd: 10, obedience: 10 }, weight: 25 }
    ],
    '昏暗的酒吧': [
      { text: '酒吧的氛围让猫娘有些迷醉。', effect: { lewd: 10, depravity: 8 }, weight: 35 },
      { text: '有人请猫娘喝了一杯，身体变得热热的。', effect: { sensitivity: 8, lewd: 5 }, weight: 25 }
    ],
    '教室': [
      { text: '教室太挤了，猫娘被人推来推去。', effect: { pain: -8, sensitivity: 5 }, weight: 30 },
      { text: '有人趁乱摸了猫娘一把。', effect: { lewd: 8, sensitivity: 5 }, weight: 25 }
    ]
  }
}

const STAT_NAME_MAP = { // 属性键名→显示名映射
  satiety: '饱食',
  energy: '体力',
  pain: '疼痛',
  sensitivity: '敏感',
  hygiene: '清洁',
  lewd: '涩气',
  depravity: '堕落',
  obedience: '服从'
}

const USER_COLORS = ['#e91e63', '#1565c0', '#2e7d32', '#f57f17', '#6a1b9a', '#00838f', '#c62828', '#4527a0', '#ad1457', '#0d47a1']

function getUserColor(userId) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}


const CMD_PREFIX = '([#＃]猫娘|&)'

export {
  CONFIG,
  LOCATIONS,
  EQUIPMENT_RARITY,
  CLOTHING_SLOTS,
  CLOTHING_DB,
  CLOTHING_PRESETS,
  SHOP_ITEMS,
  RANDOM_EVENTS,
  STAT_NAME_MAP,
  getUserColor,
  generateRandomEffect,
  CMD_PREFIX
}
