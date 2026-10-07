const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const wait = (ms) => new Promise(res => setTimeout(res, ms));

async function smoothScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight || totalHeight >= 4000) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });
  await page.waitForTimeout(1000);
}

async function acceptCookies(page) {
  try {
    const btn = await page.$('#cmplz-accept, .cmplz-accept, button.cmplz-accept, .cmplz-btn-accept');
    if (btn) {
      await btn.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {}
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  const urls = {
    home: 'https://www.watchandvintage.fr/en/',
    catalog: 'https://www.watchandvintage.fr/en/product-category/by-type/watches/',
    product_available: 'https://www.watchandvintage.fr/en/shop/citizen-date-flake-cal-2710-1966/',
    product_soldout: 'https://www.watchandvintage.fr/en/shop/longines-ultra-chron-automatic-7827-1967-2/',
    cart: 'https://www.watchandvintage.fr/en/cart/',
    checkout: 'https://www.watchandvintage.fr/en/checkout/'
  };

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    deviceScaleFactor: 2
  });

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2
  });

  console.log('--- CAPTURING BEFORE: DESKTOP ---');
  const dPage = await desktopContext.newPage();

  // 1. Home
  console.log('Capturing Home Desktop...');
  await dPage.goto(urls.home, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await acceptCookies(dPage);
  await smoothScroll(dPage);
  await dPage.screenshot({ path: 'captures/before/desktop/home.png' });
  await dPage.screenshot({ path: 'captures/before/desktop/home_full.png', fullPage: true });
  await wait(3000);

  // 2. Catalog
  console.log('Capturing Catalog Desktop...');
  await dPage.goto(urls.catalog, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await acceptCookies(dPage);
  await smoothScroll(dPage);
  await dPage.screenshot({ path: 'captures/before/desktop/catalog.png' });
  await dPage.screenshot({ path: 'captures/before/desktop/catalog_full.png', fullPage: true });
  await wait(3000);

  // 3. Product Available
  console.log('Capturing Product Available Desktop...');
  await dPage.goto(urls.product_available, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await acceptCookies(dPage);
  await smoothScroll(dPage);
  await dPage.screenshot({ path: 'captures/before/desktop/product_available.png' });
  await dPage.screenshot({ path: 'captures/before/desktop/product_available_full.png', fullPage: true });

  // Extract available product data
  const availableProductData = await dPage.evaluate(() => {
    const title = document.querySelector('h1.product_title, h1')?.innerText?.trim();
    const price = document.querySelector('p.price, .woocommerce-Price-amount')?.innerText?.trim();
    const desc = document.querySelector('.woocommerce-product-details__short-description, .product-short-description')?.innerText?.trim();
    const fullDesc = document.querySelector('#tab-description, .woocommerce-Tabs-panel--description')?.innerText?.trim();
    const imgs = Array.from(document.querySelectorAll('.woocommerce-product-gallery img, .wp-post-image')).map(i => i.src || i.dataset.src);
    const specs = {};
    document.querySelectorAll('.woocommerce-product-attributes tr, table.shop_attributes tr').forEach(tr => {
      const label = tr.querySelector('th')?.innerText?.trim();
      const val = tr.querySelector('td')?.innerText?.trim();
      if (label && val) specs[label] = val;
    });
    return { title, price, desc, fullDesc, imgs: [...new Set(imgs)], specs };
  });
  fs.writeFileSync('data/product_available.json', JSON.stringify(availableProductData, null, 2));

  // Add to cart for cart & checkout captures
  console.log('Adding product to cart...');
  try {
    const addToCartBtn = await dPage.$('button[name="add-to-cart"], .single_add_to_cart_button');
    if (addToCartBtn) {
      await addToCartBtn.click();
      await dPage.waitForTimeout(2500);
    }
  } catch (e) {
    console.log('Add to cart button click error:', e.message);
  }
  await wait(3000);

  // 4. Cart Desktop
  console.log('Capturing Cart Desktop...');
  await dPage.goto(urls.cart, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await smoothScroll(dPage);
  await dPage.screenshot({ path: 'captures/before/desktop/cart.png' });
  await dPage.screenshot({ path: 'captures/before/desktop/cart_full.png', fullPage: true });
  await wait(3000);

  // 5. Checkout Desktop (WITHOUT placing order)
  console.log('Capturing Checkout Desktop (Tunnel début)...');
  await dPage.goto(urls.checkout, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await smoothScroll(dPage);
  await dPage.screenshot({ path: 'captures/before/desktop/checkout.png' });
  await dPage.screenshot({ path: 'captures/before/desktop/checkout_full.png', fullPage: true });
  await wait(3000);

  // 6. Product Sold Out Desktop
  console.log('Capturing Product Sold Out Desktop...');
  await dPage.goto(urls.product_soldout, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await smoothScroll(dPage);
  await dPage.screenshot({ path: 'captures/before/desktop/product_soldout.png' });
  await dPage.screenshot({ path: 'captures/before/desktop/product_soldout_full.png', fullPage: true });

  const soldOutData = await dPage.evaluate(() => {
    const title = document.querySelector('h1.product_title, h1')?.innerText?.trim();
    const price = document.querySelector('p.price, .woocommerce-Price-amount')?.innerText?.trim();
    const desc = document.querySelector('.woocommerce-product-details__short-description, .product-short-description')?.innerText?.trim();
    const fullDesc = document.querySelector('#tab-description, .woocommerce-Tabs-panel--description')?.innerText?.trim();
    const imgs = Array.from(document.querySelectorAll('.woocommerce-product-gallery img, .wp-post-image')).map(i => i.src || i.dataset.src);
    const specs = {};
    document.querySelectorAll('.woocommerce-product-attributes tr, table.shop_attributes tr').forEach(tr => {
      const label = tr.querySelector('th')?.innerText?.trim();
      const val = tr.querySelector('td')?.innerText?.trim();
      if (label && val) specs[label] = val;
    });
    return { title, price, desc, fullDesc, imgs: [...new Set(imgs)], specs };
  });
  fs.writeFileSync('data/product_soldout.json', JSON.stringify(soldOutData, null, 2));

  await dPage.close();
  await desktopContext.close();

  console.log('--- CAPTURING BEFORE: MOBILE (390x844) ---');
  const mPage = await mobileContext.newPage();

  // Mobile Home
  console.log('Capturing Home Mobile...');
  await mPage.goto(urls.home, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await acceptCookies(mPage);
  await smoothScroll(mPage);
  await mPage.screenshot({ path: 'captures/before/mobile/home.png' });
  await mPage.screenshot({ path: 'captures/before/mobile/home_full.png', fullPage: true });
  await wait(3000);

  // Mobile Catalog
  console.log('Capturing Catalog Mobile...');
  await mPage.goto(urls.catalog, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await acceptCookies(mPage);
  await smoothScroll(mPage);
  await mPage.screenshot({ path: 'captures/before/mobile/catalog.png' });
  await mPage.screenshot({ path: 'captures/before/mobile/catalog_full.png', fullPage: true });
  await wait(3000);

  // Mobile Product Available
  console.log('Capturing Product Available Mobile...');
  await mPage.goto(urls.product_available, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await acceptCookies(mPage);
  await smoothScroll(mPage);
  await mPage.screenshot({ path: 'captures/before/mobile/product_available.png' });
  await mPage.screenshot({ path: 'captures/before/mobile/product_available_full.png', fullPage: true });

  // Add to cart on mobile
  try {
    const addToCartBtn = await mPage.$('button[name="add-to-cart"], .single_add_to_cart_button');
    if (addToCartBtn) {
      await addToCartBtn.click();
      await mPage.waitForTimeout(2500);
    }
  } catch (e) {}
  await wait(3000);

  // Mobile Cart
  console.log('Capturing Cart Mobile...');
  await mPage.goto(urls.cart, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await smoothScroll(mPage);
  await mPage.screenshot({ path: 'captures/before/mobile/cart.png' });
  await mPage.screenshot({ path: 'captures/before/mobile/cart_full.png', fullPage: true });
  await wait(3000);

  // Mobile Checkout
  console.log('Capturing Checkout Mobile...');
  await mPage.goto(urls.checkout, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await smoothScroll(mPage);
  await mPage.screenshot({ path: 'captures/before/mobile/checkout.png' });
  await mPage.screenshot({ path: 'captures/before/mobile/checkout_full.png', fullPage: true });
  await wait(3000);

  // Mobile Product Sold Out
  console.log('Capturing Product Sold Out Mobile...');
  await mPage.goto(urls.product_soldout, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await smoothScroll(mPage);
  await mPage.screenshot({ path: 'captures/before/mobile/product_soldout.png' });
  await mPage.screenshot({ path: 'captures/before/mobile/product_soldout_full.png', fullPage: true });

  await mPage.close();
  await mobileContext.close();
  await browser.close();

  console.log('ALL BEFORE CAPTURES COMPLETED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
