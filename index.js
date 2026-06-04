import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import DataManager from './model/DataManager.js'
import EventSystem from './model/EventSystem.js'
import InteractionEngine from './model/InteractionEngine.js'
import ShopSystem from './model/ShopSystem.js'
import PanelRenderer from './model/PanelRenderer.js'
import Version from './components/Version.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const dm = new DataManager()
const es = new EventSystem(dm)
const ie = new InteractionEngine(es, dm)
const shop = new ShopSystem(dm)
const renderer = new PanelRenderer(dm)

es.shop = shop

dm.initData()

global.smerSys = { dm, es, ie, shop, renderer }

const appsDir = path.join(__dirname, 'apps')
const appFiles = fs.readdirSync(appsDir).filter(f => f.endsWith('.js'))

const apps = {}
for (const file of appFiles) {
  try {
    const mod = await import(`./apps/${file}`)
    const name = file.replace('.js', '')
    apps[name] = mod.default
  } catch (err) {
    logger.error(`smer-plugin 加载失败: ${file}`)
    logger.error(err)
  }
}

logger.info(`smer-plugin v${Version.ver} 加载完成`)

export { apps }
