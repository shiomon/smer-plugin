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

const tempHtml = path.join(dataDir, 'debug_rendered.html');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(tempHtml, rendered, 'utf8');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const filePath = tempHtml.replace(/\\/g, '/');

  // 测试1: 默认viewport (800x600) - 模拟TRSS
  const page1 = await browser.newPage();
  await page1.goto(`file:///${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await page1.waitForFunction('window.__smerReady === true', { timeout: 10000 }).catch(() => {});
  const body1 = await page1.$('#container') || await page1.$('body');
  const box1 = await body1.boundingBox();
  const vp1 = await page1.viewport();
  console.log('=== 测试1: 默认viewport (模拟TRSS) ===');
  console.log('viewport:', vp1);
  console.log('#container boundingBox:', JSON.stringify(box1));
  await body1.screenshot({ path: path.join(pluginRoot, 'resources', 'debug-1-default-vp.png'), type: 'png' });
  await page1.close();

  // 测试2: goto后设viewport - 当前方案
  const page2 = await browser.newPage();
  await page2.goto(`file:///${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await page2.setViewport({ width: 910, height: 1200 });
  await page2.waitForFunction('window.__smerReady === true', { timeout: 10000 }).catch(() => {});
  const body2 = await page2.$('#container') || await page2.$('body');
  const box2 = await body2.boundingBox();
  console.log('\n=== 测试2: goto后设viewport ===');
  console.log('viewport:', await page2.viewport());
  console.log('#container boundingBox:', JSON.stringify(box2));
  await body2.screenshot({ path: path.join(pluginRoot, 'resources', 'debug-2-after-goto-vp.png'), type: 'png' });
  await page2.close();

  // 测试3: goto前设viewport - yenai模式
  const page3 = await browser.newPage();
  await page3.setViewport({ width: 910, height: 1200 });
  await page3.goto(`file:///${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await page3.waitForFunction('window.__smerReady === true', { timeout: 10000 }).catch(() => {});
  const body3 = await page3.$('#container') || await page3.$('body');
  const box3 = await body3.boundingBox();
  console.log('\n=== 测试3: goto前设viewport (yenai模式) ===');
  console.log('viewport:', await page3.viewport());
  console.log('#container boundingBox:', JSON.stringify(box3));
  await body3.screenshot({ path: path.join(pluginRoot, 'resources', 'debug-3-before-goto-vp.png'), type: 'png' });
  await page3.close();

  // 测试4: goto前设viewport + page.screenshot(fullPage) 
  const page4 = await browser.newPage();
  await page4.setViewport({ width: 910, height: 1200 });
  await page4.goto(`file:///${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await page4.waitForFunction('window.__smerReady === true', { timeout: 10000 }).catch(() => {});
  const body4 = await page4.$('#container') || await page4.$('body');
  const box4 = await body4.boundingBox();
  console.log('\n=== 测试4: goto前设viewport + page.screenshot clip ===');
  console.log('viewport:', await page4.viewport());
  console.log('#container boundingBox:', JSON.stringify(box4));
  await page4.screenshot({ path: path.join(pluginRoot, 'resources', 'debug-4-page-clip.png'), clip: box4, type: 'png' });
  await page4.close();

  await browser.close();
  console.log('\n所有测试完成');
})();