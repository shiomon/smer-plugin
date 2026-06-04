import plugin from '../../../lib/plugins/plugin.js'

const pendingReset = new Map()

class ResetApp extends plugin {
  constructor() {
    super({
      name: 'Smer-重置',
      dsc: '重置猫娘世界',
      event: 'message',
      priority: 5000,
      rule: [
        { reg: '^([#＃]猫娘|&)重置确认$', fnc: 'confirmReset' },
        { reg: '^([#＃]猫娘|&)重置.*', fnc: 'resetWorld' }
      ]
    })
    this.sys = global.smerSys
  }

  async resetWorld(e) {
    if (e.isGroup && !e.isMaster && !e.member?.is_admin) {
      await e.reply('暂无权限，只有管理员才能重置')
      return
    }
    const groupId = String(e.group_id)
    pendingReset.set(groupId, Date.now())
    await e.reply('⚠️ 当前猫娘调教数据会重置\n确认请发送 #猫娘重置确认 或 &重置确认')
  }

  async confirmReset(e) {
    if (e.isGroup && !e.isMaster && !e.member?.is_admin) {
      await e.reply('暂无权限，只有管理员才能重置')
      return
    }
    const groupId = String(e.group_id)
    if (!pendingReset.has(groupId)) {
      await e.reply('请先发送 #猫娘重置 或 &重置')
      return
    }
    pendingReset.delete(groupId)

    this.sys.dm.resetData(groupId)
    const data = this.sys.dm.readData(groupId)
    data.sys.ownerId = ''
    data.sys.ownerName = '猫娘'
    data.sys.ownerAvatar = ''
    this.sys.dm.saveData(data, groupId)
    await this.sys.dm.updateOwnerInfo(e, data)
    this.sys.dm.saveData(data, groupId)
    const flavor = ['一切归零，新的故事悄然开始...', '旧梦散尽，未知的命运再度降临...', '白纸铺开，新的篇章等你落笔...', '尘封过往，崭新的生活从此刻起...', '轮回重启，愿这次温柔以待...']
    const line = flavor[Math.floor(Math.random() * flavor.length)]
    await e.reply(`世界线已重置！地点：${data.sys.location}\n${line}`)
    await this.sys.renderer.renderPanel(e, data)
  }
}

export default ResetApp
