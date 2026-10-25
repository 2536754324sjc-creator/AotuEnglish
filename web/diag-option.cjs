// 精确诊断：单题答题时，选项点击是否生效
const puppeteer = require('puppeteer-core');
const BASE = 'https://aotuenglish.vercel.app';

(async () => {
  const b = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--ignore-certificate-errors'],
  });
  const page = await b.newPage();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // 登录
  await page.goto(BASE + '/login?mode=signup', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(4000);
  const email = `opt${Date.now()}@example.com`;
  await page.click('#email');
  await page.keyboard.type(email);
  await page.click('#password');
  await page.keyboard.type('password123');
  await page.click('#confirm');
  await page.keyboard.type('password123');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (x) => (x.innerText || '').replace(/\s/g, '') === '注册并开始',
    );
    if (btn) btn.click();
  });
  for (let i = 0; i < 40; i++) {
    await wait(500);
    const tok = await page.evaluate(() => localStorage.getItem('aotu.token'));
    if (tok && !page.url().includes('/login')) break;
  }

  await page.goto(BASE + '/learn/unit/kids-a-greetings', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(6000);

  // 第 1 题：列出所有按钮
  const btns = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button')).map((x, i) => ({
      i,
      text: (x.innerText || '').replace(/\s/g, '').slice(0, 20),
      aria: x.getAttribute('aria-label'),
      pressed: x.getAttribute('aria-pressed'),
      disabled: x.disabled,
      hasImg: Boolean(x.querySelector('img')),
      cls: x.className.slice(0, 60),
    })),
  );
  console.log('第 1 题所有按钮:');
  btns.forEach((x) => console.log(' ', JSON.stringify(x)));

  // 点第一个有图片的
  const clicked = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) => x.querySelector('img'));
    if (!b) return null;
    b.click();
    return (b.innerText || '').slice(0, 20);
  });
  console.log('\n点击了图片选项:', clicked);
  await wait(1500);

  // 看选中状态
  const after = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return {
      pressedStates: btns.map((x) => x.getAttribute('aria-pressed')).filter((v) => v !== null),
      checkDisabled: (() => {
        const c = btns.find((x) => ['检查', '检查一下'].includes((x.innerText || '').replace(/\s/g, '')));
        return c ? c.disabled : 'no-check-btn';
      })(),
    };
  });
  console.log('选中状态:', JSON.stringify(after));

  // 点检查
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(
      (x) => ['检查', '检查一下'].includes((x.innerText || '').replace(/\s/g, '')) && !x.disabled,
    );
    if (b) b.click();
  });
  await wait(2500);
  const result = await page.evaluate(() => document.body.innerText.slice(0, 100).replace(/\n/g, '|'));
  console.log('检查后:', result);

  await b.close();
})();
