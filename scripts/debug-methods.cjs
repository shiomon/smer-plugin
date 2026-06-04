const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const pluginRoot = path.resolve(__dirname, '..');
const dataDir = path.join(pluginRoot, 'data');
const htmlSrc = path.join(pluginRoot, 'resources', 'panel.html');
const commonCssSrc = path.join(pluginRoot, 'resources', 'common.css');
const bgLoaderSrc = path.join(pluginRoot, 'resources', 'bg-loader.js');

const commonCss = fs.readFileSync(commonCssSrc, 'utf8');
const bgLoader = fs.readFileSync(bgLoaderSrc, 'utf8');

let html = fs.readFileSync(htmlSrc, 'utf8');
html = html.replace('<!-- COMMON_CSS -->', `<style>${commonCss}</style>`);
html = html.replace('<!-- BG_LOADER -->', `<script>${bgLoader}</script>`);

try {
  const artTemplate = require('art-template');
  const renderFn = artTemplate.compile(html);
  var rendered = renderFn({
    ownerName: '猫娘', ownerAvatar: '', statusText: '正在适应中...',
    traits: [{ name: 'M体质', css: 'trait-lewd' }],
    stats: { satiety: 80, energy: 65, pain: 30, sensitivity: 72, hygiene: 55, lewd: 520, depravity: 180, obedience: 90 },
    clothes: {
      head: { name: '猫耳发箍', rarity: 'rare', rarityName: '稀有', rarityColor: '#7c4dff', charm: 85, dur: 0, effect: null, effectText: '敏感+5%', isEmpty: false },
      upper: { name: '蕾丝吊带', rarity: 'epic', rarityName: '传说', rarityColor: '#ff6d00', charm: 180, dur: 0, effect: null, effectText: '涩气+8%', isEmpty: false },
      lower: { name: '短裙', rarity: 'common', rarityName: '', rarityColor: '#666', charm: 0, dur: 78, effect: null, effectText: '', isEmpty: false },
      bra: { name: '未穿', rarity: 'none', rarityName: '', rarityColor: '#666', charm: 0, dur: 0, effect: null, effectText: '', isEmpty: true },
      panty: { name: '未穿', rarity: 'none', rarityName: '', rarityColor: '#666', charm: 0, dur: 0, effect: null, effectText: '', isEmpty: true },
      accessory: { name: '铃铛项圈', rarity: 'mythic', rarityName: '神话', rarityColor: '#e91e63', charm: 260, dur: 0, effect: null, effectText: '服从+10%', isEmpty: false },
      shoes: { name: '未穿', rarity: 'none', rarityName: '', rarityColor: '#666', charm: 0, dur: 0, effect: null, effectText: '', isEmpty: true }
    },
    slotList: [{ key: 'head', label: '头饰' }, { key: 'upper', label: '上装' }, { key: 'lower', label: '下装' }, { key: 'bra', label: '胸罩' }, { key: 'panty', label: '内裤' }, { key: 'accessory', label: '饰品' }, { key: 'shoes', label: '鞋子' }],
    totalCharm: 525, maxCharm: 3640, totalEffectText: '涩气+8%, 服从+10%',
    isWearingCommon: true, presetName: '日常装',
    achievements: [{ name: '初调教', key: 'first_blood_1', cls: 'ach-train' }],
    logs: [{ time: '1日 14:20', text: '摸了摸猫娘的头', color: '#2e7d32' }],
    topUsers: [{ name: '主人A', dmg: 120, heal: 50, contributionPct: 60 }],
    sys: { location: '温暖的浴场', trainCoins: 100, day: 1, realTime: '14:30', achievementsCount: 1, totalAchievements: 48, time: '08:00' },
    locationModifier: '调教+10%', trainBonus: 1.32,
    trainBonusDetail: '1.0 饱+0.20 体+0.025',
    satietyColor: '#33cc33', pluginVer: '3.3.0', yunzaiName: 'Miao-Yunzai', yunzaiVer: '3.x'
  });
} catch(e) { rendered = html; }

const tempHtml = path.join(dataDir, 'debug3_rendered.html');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(tempHtml, rendered, 'utf8');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const filePath = tempHtml.replace(/\\/g, '/');

  // 方案A: 框架默认 - body.screenshot() (当前方式)
  const pageA = await browser.newPage();
  await pageA.goto(`file:///${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  const bodyA = await pageA.$('#container') || await pageA.$('body');
  const boxA = await bodyA.boundingBox();
  const buffA = await bodyA.screenshot({ type: 'png' });
  fs.writeFileSync(path.join(pluginRoot, 'resources', 'debug-A-body-screenshot.png'), buffA);
  console.log('方案A body.screenshot:', boxA.height, 'px, 图片大小:', buffA.length);

  // 方案B: page.screenshot + clip=boundingBox (yenai Webpage方式)
  const pageB = await browser.newPage();
  await pageB.setViewport({ width: 910, height: 2000 });
  await pageB.goto(`file:///${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  const bodyB = await pageB.$('#container') || await pageB.$('body');
  const boxB = await bodyB.boundingBox();
  const buffB = await pageB.screenshot({ type: 'png', clip: boxB });
  fs.writeFileSync(path.join(pluginRoot, 'resources', 'debug-B-page-clip.png'), buffB);
  console.log('方案B page.screenshot+clip:', boxB.height, 'px, 图片大小:', buffB.length);

  // 方案C: page.screenshot + fullPage
  const pageC = await browser.newPage();
  await pageC.setViewport({ width: 910, height: 2000 });
  await pageC.goto(`file:///${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  const buffC = await pageC.screenshot({ type: 'png', fullPage: true });
  fs.writeFileSync(path.join(pluginRoot, 'resources', 'debug-C-fullPage.png'), buffC);
  console.log('方案C page.screenshot fullPage: 图片大小:', buffC.length);

  // 方案D: 设置viewport高度=内容高度后再body.screenshot
  const pageD = await browser.newPage();
  await pageD.setViewport({ width: 910, height: 2000 });
  await pageD.goto(`file:///${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  const bodyD = await pageD.$('#container') || await pageD.$('body');
  const boxD = await bodyD.boundingBox();
  await pageD.setViewport({ width: 910, height: Math.ceil(boxD.height) + 100 });
  await new Promise(r => setTimeout(r, 200));
  const boxD2 = await bodyD.boundingBox();
  const buffD = await bodyD.screenshot({ type: 'png' });
  fs.writeFileSync(path.join(pluginRoot, 'resources', 'debug-D-viewport-match.png'), buffD);
  console.log('方案D viewport匹配后body.screenshot:', boxD2.height, 'px, 图片大小:', buffD.length);

  await pageA.close(); await pageB.close(); await pageC.close(); await pageD.close();
  await browser.close();
  console.log('\n所有方案完成');
})();