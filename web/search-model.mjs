import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1200 });
// 搜索模型
await page.goto('https://www.modelscope.cn/models?name=Qwen-Image-2.1-Turbo', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 4000));
const text = await page.evaluate(() => document.body.innerText);
console.log('=== 搜索结果 ===');
console.log(text.slice(0, 1500));
await browser.close();
