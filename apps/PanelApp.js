import plugin from '../../../lib/plugins/plugin.js'
import { CMD_PREFIX, GROUP_ONLY_MSG } from '../config/cfg.js'

class PanelApp extends plugin {
  constructor() {
    super({
      name: 'Smer-面板',
      dsc: '查看猫娘状态面板',
      event: 'message',
      priority: 5000,
      rule: [
        { reg: `^${CMD_PREFIX}面板.*`, fnc: 'showPanel' }
      ]
    })
    this.sys = global.smerSys
  }

  async showPanel(e) {
    if (!e.group_id) return e.reply(GROUP_ONLY_MSG)
    const groupId = String(e.group_id)
    const data = this.sys.dm.readData(groupId)
    if (!data || !data.clothes) {
      await e.reply('数据加载失败，请先执行 #猫娘重置')
      return
    }
    if (!data.sys.ownerId) {
      await this.sys.dm.updateOwnerInfo(e, data)
    }
    this.sys.dm.saveData(data, groupId)
    await this.sys.renderer.renderPanel(e, data)
  }
}

export default PanelApp
