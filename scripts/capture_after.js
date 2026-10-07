const { chromium } = require('playwright');
const path = require('path');

const wait = (ms) => new Promise(res => setTimeout(res, ms));

async function run() {
  const browser = await chromium.launch({ headless: true });

  const pages = [
    { name: 'home', url: 'http://localhost:4000/index.html' },
    { name: 'catalog', url: 'http://localhost:4000/catalog.html' },
    { name: 'product_available', url: 'http://localhost:4000/product-available.html' },
    { name: 'product_soldout', url: 'http://localhost:4000/product-soldout.html' },
    { name: 'cart', url: 'http://localhost:4000/cart.html' },
    { name: 'checkout', url: 'http://localhost:4000/checkout.html' }
  ];

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2
  });

  // Start server if needed
  let serverInstance = null;
  const isServerRunning = await new Promise(res => {
    const req = require('http').get('http://localhost:4000/', r => res(true));
    req.on('error', () => res(false));
    req.setTimeout(1000, () => { req.destroy(); res(false); });
  });

  if (!isServerRunning) {
    console.log('Starting internal HTTP server on port 4000...');
    const serverModule = require('./server.js');
    serverInstance = serverModule;
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('--- CAPTURING AFTER: DESKTOP (1440x900) ---');
  const dPage = await desktopContext.newPage();
  for (const p of pages) {
    console.log(`Capturing ${p.name} Desktop...`);
    await dPage.goto(p.url, { waitUntil: 'load', timeout: 15000 });
    await dPage.waitForTimeout(1200);
    await dPage.screenshot({ path: `captures/after/desktop/${p.name}.png` });
    await dPage.screenshot({ path: `captures/after/desktop/${p.name}_full.png`, fullPage: true });
  }
  await dPage.close();
  await desktopContext.close();

  console.log('--- CAPTURING AFTER: MOBILE (390x844) ---');
  const mPage = await mobileContext.newPage();
  for (const p of pages) {
    console.log(`Capturing ${p.name} Mobile...`);
    await mPage.goto(p.url, { waitUntil: 'load', timeout: 15000 });
    await mPage.waitForTimeout(1200);
    await mPage.screenshot({ path: `captures/after/mobile/${p.name}.png` });
    await mPage.screenshot({ path: `captures/after/mobile/${p.name}_full.png`, fullPage: true });
  }
  await mPage.close();
  await mobileContext.close();

  await browser.close();
  console.log('ALL AFTER CAPTURES FINISHED SUCCESSFULLY!');
  if (serverInstance && serverInstance.close) {
    serverInstance.close();
  }
  process.exit(0);
}

run().catch(err => {
  console.error('After capture error:', err);
  process.exit(1);
});
