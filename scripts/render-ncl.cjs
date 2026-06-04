const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const pluginRoot = 'E:/临时登录/Yunzai/plugins/smer-plugin';
const dataDir = path.join(pluginRoot, 'data');
const htmlSrc = path.join(pluginRoot, 'resources', 'panel.html');
const commonCssSrc = path.join(pluginRoot, 'resources', 'common.css');
const bgLoaderSrc = path.join(pluginRoot, 'resources', 'bg-loader.js');
const outputPath = path.join(pluginRoot, 'resources', 'preview-namecard-left.png');

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
    traits: [{ name: 'M体质', css: 'trait-lewd' }, { name: '极度敏感', css: 'trait-bad' }],
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
    satietyColor: '#33cc33', pluginVer: '3.3.0', yunzaiName: 'TRSS-Yunzai', yunzaiVer: '3.x'
  });
} catch(e) { console.log(e.message); rendered = html; }

const tempHtml = path.join(dataDir, 'preview_namecard_left.html');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(tempHtml, rendered, 'utf8');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`file:///${tempHtml.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForFunction('window.__smerReady === true', { timeout: 10000 }).catch(() => {});
  const body = await page.$('#container') || await page.$('body');
  const box = await body.boundingBox();
  if (box) await page.setViewport({ width: Math.ceil(box.width) + 60, height: Math.ceil(box.height) + 100 });
  await new Promise(r => setTimeout(r, 500));
  const body2 = await page.$('#container') || await page.$('body');
  await body2.screenshot({ path: outputPath, type: 'png' });
  await page.close(); await browser.close();
  console.log('渲染成功:', outputPath);
})();