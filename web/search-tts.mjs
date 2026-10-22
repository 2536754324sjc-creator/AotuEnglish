import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1200 });
await page.goto('https://www.modelscope.cn/models?name=%E8%AF%AD%E9%9F%B3%E5%90%88%E6%88%90&tasks=text-to-speech', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 4000));
const text = await page.evaluate(() => document.body.innerText);
const i = text.indexOf('共找到');
console.log(text.slice(i, i + 1800));
await browser.close();
