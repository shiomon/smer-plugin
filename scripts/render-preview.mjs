import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginRoot = path.resolve(__dirname, '..')
const dataDir = path.join(pluginRoot, 'data')
const htmlSrc = path.join(pluginRoot, 'resources', 'panel.html')
const commonCssSrc = path.join(pluginRoot, 'resources', 'common.css')
const bgLoaderSrc = path.join(pluginRoot, 'resources', 'bg-loader.js')
const outputPath = path.join(pluginRoot, 'resources', 'preview-moved.png')

const commonCss = fs.readFileSync(commonCssSrc, 'utf8')
const bgLoader = fs.readFileSync(bgLoaderSrc, 'utf8')

let html = fs.readFileSync(htmlSrc, 'utf8')
html = html.replace('<!-- COMMON_CSS -->', `<style>${commonCss}</style>`)
html = html.replace('<!-- BG_LOADER -->', `<script>${bgLoader}</script>`)

const tempHtmlPath = path.join(dataDir, 'preview_temp.html')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
fs.writeFileSync(tempHtmlPath, html, 'utf8')

const puppeteer = (await import('../../../lib/puppeteer/puppeteer.js')).default

const renderData = {
  tplFile: tempHtmlPath,
  imgType: 'jpeg',
  quality: 100,
  pageGotoParams: { waitUntil: 'networkidle0' },
  ownerName: '猫娘',
  ownerAvatar: '',
  statusText: '正在适应中...',
  traits: [
    { name: 'M体质', css: 'trait-lewd' },
    { name: '极度敏感', css: 'trait-bad' }
  ],
  stats: {
    satiety: 80, energy: 65, pain: 30,
    sensitivity: 72, hygiene: 55,
    lewd: 520, depravity: 180, obedience: 90
  },
  clothes: {},
  slotList: [],
  totalCharm: 0,
  maxCharm: 3640,
  totalEffectText: '无',
  isWearingCommon: false,
  presetName: '日常装',
  achievements: [],
  logs: [
    { time: '1日 14:20', text: '有人摸了摸猫娘的头', color: '#2e7d32' },
    { time: '1日 14:15', text: '猫娘被投喂了小鱼干', color: '#f57f17' }
  ],
  topUsers: [
    { name: '主人A', dmg: 120, heal: 50, contributionPct: 60 },
    { name: '主人B', dmg: 30, heal: 80, contributionPct: 40 }
  ],
  sys: {
    location: '温暖的浴场',
    trainCoins: 100,
    day: 1,
    realTime: '14:30',
    achievementsCount: 0,
    totalAchievements: 48,
    time: '08:00'
  },
  locationModifier: '调教+10%',
  trainBonus: 1.32,
  trainBonusDetail: '1.0 饱+0.20 体+0.025 痛+0.025 敏+0.025 洁+0.025 装+0.04',
  satietyColor: '#33cc33',
  pluginVer: '3.3.0',
  yunzaiName: 'Miao-Yunzai',
  yunzaiVer: '3.x'
}

try {
  const img = await puppeteer.screenshot('previewMoved', renderData)
  if (img) {
    const base64 = img.toString('base64')
    fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'))
    console.log('渲染成功！输出:', outputPath)
  } else {
    console.log('截图失败，puppeteer返回空')
  }
} catch (e) {
  console.error('渲染出错:', e)
}