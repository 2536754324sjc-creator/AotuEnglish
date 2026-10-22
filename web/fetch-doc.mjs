import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1200 });
await page.goto('https://www.modelscope.cn/docs/model-service/API-Inference/intro', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 4000));
const text = await page.evaluate(() => document.body.innerText);
console.log('=== 页面正文（前 4000 字）===');
console.log(text.slice(0, 4000));
await browser.close();
