import fs from 'fs'
import cfg from '../../../lib/config/config.js'

const Plugin_Path = `${process.cwd()}/plugins/smer-plugin`
const package_path = `${Plugin_Path}/package.json`

let currentVersion = '3.2.0'

try {
  if (fs.existsSync(package_path)) {
    const packageJson = JSON.parse(fs.readFileSync(package_path, 'utf8'))
    if (packageJson.version) {
      currentVersion = packageJson.version
    }
  }
} catch (e) {
  console.error('[Smer] 读取版本失败:', e)
}

const yunzai_ver = `v${cfg.package.version}`

let yunzaiName = cfg.package.name
if (yunzaiName === 'miao-yunzai') {
  yunzaiName = 'Miao-Yunzai'
} else if (yunzaiName === 'yunzai') {
  yunzaiName = 'Yunzai-Bot'
} else if (yunzaiName === 'trss-yunzai') {
  yunzaiName = 'TRSS-Yunzai'
} else {
  yunzaiName = yunzaiName.charAt(0).toUpperCase() + yunzaiName.slice(1)
}

const Version = {
  get ver() {
    return currentVersion
  },
  get name() {
    return yunzaiName
  },
  get yunzai() {
    return yunzai_ver
  }
}

export default Version
