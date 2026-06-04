import plugin from '../../../lib/plugins/plugin.js'
import { CONFIG } from '../config/cfg.js'

const VOTE_EXPIRE_MS = (CONFIG.VOTE_EXPIRE || 3) * 60 * 1000
const VOTE_REQUIRED = CONFIG.VOTE_REQUIRED || 3

const activeVotes = new Map()

class VoteApp extends plugin {
  constructor() {
    super({
      name: 'Smer-投票',
      dsc: '投票更换猫娘',
      event: 'message.group',
      priority: 5000,
      rule: [
        { reg: '^([#＃]猫娘|&)变', fnc: 'startVote' },
        { reg: '^([#＃]猫娘|&)同意', fnc: 'agreeVote' },
        { reg: '^([#＃]猫娘|&)不同意', fnc: 'vetoVote' }
      ]
    })
    this.sys = global.smerSys
  }

  async startVote(e) {
    const at = e.message?.find(m => m.type === 'at')
    const targetId = String(e.at || at?.qq || at?.id || '')
    if (!targetId || targetId === '0') {
      await e.reply('请@目标群友，格式：#猫娘变@群友 或 &变@群友')
      return true
    }

    const bot = e.bot ?? Bot
    const group = bot.pickGroup?.(e.group_id) || e.group
    const targetMember = group?.pickMember?.(Number(targetId))
    if (!targetMember) {
      await e.reply('未找到该群友')
      return true
    }

    let targetName = at?.text || at?.name || ''
    if (!targetName) {
      let info = targetMember?.info
      if (!info?.nickname) {
        try { info = await targetMember?.getInfo?.() } catch {}
      }
      targetName = info?.card || info?.nickname || ''
    }
    if (!targetName) {
      try {
        const simpleInfo = await targetMember?.getSimpleInfo?.()
        targetName = simpleInfo?.nickname || ''
      } catch {}
    }
    if (!targetName) {
      targetName = String(targetId)
    }

    const groupId = String(e.group_id)
    const existing = activeVotes.get(groupId)
    if (existing && Date.now() < existing.expireTime) {
      const need = VOTE_REQUIRED - existing.votes.size
      await e.reply([
        '当前已有进行中的投票：将 ', segment.at(Number(existing.targetId)), ' 变为猫娘\n',
        '管理或当事人可否决，发送 #猫娘不同意 或 &不同意',
        `还需 ${need} 人发送 #猫娘同意 或 &同意\n`
      ])
      return true
    }

    if (existing?.timer) {
      clearTimeout(existing.timer)
    }

    const avatarUrl = `https://q1.qlogo.cn/g?b=qq&s=100&nk=${targetId}`

    const voteData = {
      targetId,
      targetName,
      targetAvatar: avatarUrl,
      groupId,
      votes: new Set([String(e.user_id)]),
      expireTime: Date.now() + VOTE_EXPIRE_MS,
      timer: null
    }

    voteData.timer = setTimeout(async () => {
      const v = activeVotes.get(groupId)
      if (!v) return
      activeVotes.delete(groupId)
      try {
        await e.reply(['❌', segment.at(Number(v.targetId)), ' 变为猫娘的投票已超时，未达到 ' + VOTE_REQUIRED + ' 票，投票失败。']).catch(() => {})
      } catch {}
    }, VOTE_EXPIRE_MS)

    activeVotes.set(groupId, voteData)

    const need = VOTE_REQUIRED - 1
    const minutes = VOTE_EXPIRE_MS / 60000
    await e.reply([
      '【猫娘更替投票】\n',
      '提议将 ', segment.at(Number(targetId)), ' 变为猫娘进行调教！\n',
      '⚠️ 当前猫娘调教数据会重置\n\n',
      `⏰ 限时 ${minutes} 分钟，超时未达 ${VOTE_REQUIRED} 票失败`,
      `❌ 否决：管理或当事人发送 #猫娘不同意 或 &不同意 \n`,
      `✅ 同意：发送 #猫娘同意 或 &同意（还需 ${need} 人）\n`     
    ])
    return true
  }

  async agreeVote(e) {
    const groupId = String(e.group_id)
    const vote = activeVotes.get(groupId)

    if (!vote || Date.now() >= vote.expireTime) {
      if (vote?.timer) clearTimeout(vote.timer)
      activeVotes.delete(groupId)
      await e.reply('当前没有进行中的投票，请先发送 #猫娘变@群友 或 &变@群友')
      return true
    }

    const userId = String(e.user_id)
    if (vote.votes.has(userId)) {
      await e.reply('你已经同意过了，请其他人发送 #猫娘同意 或 &同意')
      return true
    }

    vote.votes.add(userId)
    const remaining = VOTE_REQUIRED - vote.votes.size

    if (remaining <= 0) {
      if (vote.timer) clearTimeout(vote.timer)
      activeVotes.delete(groupId)

      this.sys.dm.resetData(groupId)

      const data = this.sys.dm.readData(groupId)
      if (!data) {
        await e.reply('数据加载失败，请先执行 &重置')
        return true
      }

      data.sys.ownerId = vote.targetId
      data.sys.ownerName = vote.targetName
      data.sys.ownerAvatar = vote.targetAvatar
      this.sys.dm.saveData(data, groupId)

      await e.reply(['✅', segment.at(Number(vote.targetId)), ' 已成为新的猫娘！\n头像和昵称已更新，查看面板发：#猫娘面板 或 &面板'])
      await this.sys.renderer.renderPanel(e, data)
    } else {
      await e.reply(`已记录同意！还需 ${remaining} 人发送 #猫娘同意 或 &同意`)
    }
    return true
  }

  async vetoVote(e) {
    const groupId = String(e.group_id)
    const vote = activeVotes.get(groupId)

    if (!vote || Date.now() >= vote.expireTime) {
      await e.reply('当前没有进行中的投票')
      return true
    }

    const member = e.member
    const userId = String(e.user_id)
    const isAdmin = member?.is_admin || member?.is_owner
    const isTarget = userId === vote.targetId
    if (!isAdmin && !isTarget) {
      await e.reply('只有管理或被投票当事人可以否决投票')
      return true
    }

    if (vote.timer) clearTimeout(vote.timer)
    activeVotes.delete(groupId)

    await e.reply(['❌', segment.at(Number(e.user_id)), ' 否决了将 ', segment.at(Number(vote.targetId)), ' 变为猫娘的投票。'])
    return true
  }
}

export default VoteApp
