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

const tempHtml = path.join(dataDir, 'debug2_rendered.html');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(tempHtml, rendered, 'utf8');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const filePath = tempHtml.replace(/\\/g, '/');

  // 模拟TRSS: networkidle2 + 默认viewport + 无beforeScreenshot
  const page = await browser.newPage();
  await page.goto(`file:///${filePath}`, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // 立即获取boundingBox（模拟TRSS无beforeScreenshot）
  const body = await page.$('#container') || await page.$('body');
  const box = await body.boundingBox();
  console.log('=== TRSS模式 (networkidle2, 无等待) ===');
  console.log('viewport:', await page.viewport());
  console.log('#container boundingBox:', JSON.stringify(box));
  
  // 立即截图
  await body.screenshot({ path: path.join(pluginRoot, 'resources', 'debug-trss.png'), type: 'png' });
  
  // 等待3秒后再获取
  await new Promise(r => setTimeout(r, 3000));
  const box2 = await body.boundingBox();
  console.log('\n3秒后 #container boundingBox:', JSON.stringify(box2));
  console.log('高度差:', box2.height - box.height);
  
  // 检查字体加载状态
  const fontsReady = await page.evaluate(() => document.fonts.ready.then(() => 'ready').catch(() => 'error'));
  console.log('document.fonts.ready:', fontsReady);
  
  // 检查背景图加载状态
  const bgStatus = await page.evaluate(() => {
    const bg = document.getElementById('bgImage');
    return {
      hasBg: !!bg,
      loaded: bg?.classList.contains('loaded'),
      bgImage: bg?.style.backgroundImage ? 'has' : 'none',
      opacity: getComputedStyle(bg).opacity
    };
  });
  console.log('背景图状态:', JSON.stringify(bgStatus));
  
  // 检查是否有overflow:hidden导致截断
  const overflowInfo = await page.evaluate(() => {
    const container = document.getElementById('container');
    const body = document.body;
    const html = document.documentElement;
    return {
      containerOverflow: getComputedStyle(container).overflow,
      containerOverflowY: getComputedStyle(container).overflowY,
      bodyOverflow: getComputedStyle(body).overflow,
      bodyOverflowY: getComputedStyle(body).overflowY,
      htmlOverflow: getComputedStyle(html).overflow,
      htmlOverflowY: getComputedStyle(html).overflowY,
      containerHeight: container.offsetHeight,
      bodyScrollHeight: body.scrollHeight,
      htmlScrollHeight: html.scrollHeight,
      bodyClientHeight: body.clientHeight,
      htmlClientHeight: html.clientHeight
    };
  });
  console.log('\noverflow信息:', JSON.stringify(overflowInfo, null, 2));
  
  await page.close();
  await browser.close();
})();