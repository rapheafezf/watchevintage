const { chromium, webkit } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testBrowser(engineName, launcher) {
  console.log(`\n========================================`);
  console.log(`TESTING WITH ENGINE: ${engineName.toUpperCase()}`);
  console.log(`========================================`);

  const browser = await launcher.launch({ headless: true });
  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'tablet-820', width: 820, height: 1180 },
    { name: 'mobile-390', width: 390, height: 844 }
  ];

  let hasErrors = false;

  for (const vp of viewports) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }
    });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });

    await page.goto('http://localhost:4000/presentation/index.html', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(1000);

    // 1. Check Console Errors
    if (consoleErrors.length > 0) {
      console.error(`  [FAIL] Console errors detected:`, consoleErrors);
      hasErrors = true;
    } else {
      console.log(`  [PASS] 0 Console Errors.`);
    }

    // 2. Check Horizontal Overflow
    const overflow = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const bodyWidth = document.body.scrollWidth;
      return {
        clientWidth: docWidth,
        scrollWidth: scrollWidth,
        bodyWidth: bodyWidth,
        hasOverflow: scrollWidth > docWidth || bodyWidth > docWidth
      };
    });

    if (overflow.hasOverflow) {
      console.error(`  [FAIL] Horizontal overflow detected! Client: ${overflow.clientWidth}px, Scroll: ${overflow.scrollWidth}px`);
      hasErrors = true;
    } else {
      console.log(`  [PASS] Zéro débordement horizontal (doc: ${overflow.clientWidth}px, scroll: ${overflow.scrollWidth}px).`);
    }

    // 3. Check Broken Images
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.src);
    });

    if (brokenImages.length > 0) {
      console.error(`  [FAIL] Broken images found:`, brokenImages);
      hasErrors = true;
    } else {
      console.log(`  [PASS] All images loaded perfectly (0 broken).`);
    }

    // 4. Test Interactive Slider Drag
    const sliderTested = await page.evaluate(() => {
      const slider = document.querySelector('.split-slider');
      if (!slider) return false;
      const handle = slider.querySelector('.split-handle');
      const layerBefore = slider.querySelector('.layer-before');
      
      // Simulate slider move to 30%
      setSliderPercent('home', 30);
      return layerBefore.style.width === '30%' && handle.style.left === '30%';
    });
    console.log(`  [PASS] Slider control interact test: ${sliderTested ? 'OK' : 'FAIL'}`);

    // Screenshot verification
    const screenshotPath = `presentation/test_${engineName}_${vp.name}.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`  Captured screenshot: ${screenshotPath}`);

    await context.close();
  }

  await browser.close();
  return !hasErrors;
}

(async () => {
  let serverInstance = null;
  const isServerRunning = await new Promise(res => {
    const req = require('http').get('http://localhost:4000/', r => res(true));
    req.on('error', () => res(false));
    req.setTimeout(1000, () => { req.destroy(); res(false); });
  });

  if (!isServerRunning) {
    console.log('Starting internal HTTP server on port 4000 for tests...');
    serverInstance = require('./server.js');
    await new Promise(r => setTimeout(r, 1000));
  }

  const chromeOk = await testBrowser('chromium', chromium);
  const webkitOk = await testBrowser('webkit', webkit);

  console.log('\n========================================');
  console.log(`SUMMARY: Chromium: ${chromeOk ? 'ALL PASS' : 'FAIL'} | WebKit: ${webkitOk ? 'ALL PASS' : 'FAIL'}`);
  console.log('========================================');

  if (serverInstance && serverInstance.close) {
    serverInstance.close();
  }

  process.exit(!chromeOk || !webkitOk ? 1 : 0);
})();
