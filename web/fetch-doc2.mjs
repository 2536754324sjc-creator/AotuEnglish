import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1400 });
await page.goto('https://www.modelscope.cn/docs/model-service/API-Inference/intro', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 3000));
const text = await page.evaluate(() => document.body.innerText);
// 找图片生成章节
const idx = text.indexOf('图像生成');
const idx2 = text.indexOf('图片生成');
const idx3 = text.indexOf('文生图');
console.log('图像生成位置:', idx, '图片生成位置:', idx2, '文生图位置:', idx3);
const start = Math.max(idx, idx2, idx3);
if (start > 0) {
  console.log('=== 图片生成章节 ===');
  console.log(text.slice(start - 200, start + 3500));
} else {
  console.log('=== 未找到，输出全文后半部分 ===');
  console.log(text.slice(4000, 9000));
}
await browser.close();
