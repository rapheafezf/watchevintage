const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to homepage...');
  await page.goto('https://www.watchandvintage.fr/en/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Accept cookies if present
  try {
    const acceptBtn = await page.$('#cmplz-accept, .cmplz-accept, button.cmplz-accept, .cmplz-btn-accept');
    if (acceptBtn) {
      console.log('Clicking cookie consent...');
      await acceptBtn.click();
      await page.waitForTimeout(1500);
    }
  } catch (e) {
    console.log('Consent error:', e.message);
  }

  // Extract styles
  const styles = await page.evaluate(() => {
    const getStyles = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      return {
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        letterSpacing: cs.letterSpacing,
        lineHeight: cs.lineHeight
      };
    };

    const logo = document.querySelector('.custom-logo, .site-logo img, header img');
    return {
      body: getStyles('body'),
      h1: getStyles('h1'),
      h2: getStyles('h2'),
      h3: getStyles('h3'),
      button: getStyles('button, .button, .btn'),
      header: getStyles('header, .site-header'),
      logoSrc: logo ? logo.src : null,
      title: document.title,
    };
  });

  console.log('Computed styles:', JSON.stringify(styles, null, 2));
  fs.writeFileSync('data/styles.json', JSON.stringify(styles, null, 2));

  // Catalog
  console.log('Navigating to catalog...');
  await page.waitForTimeout(2500);
  await page.goto('https://www.watchandvintage.fr/en/product-category/by-type/watches/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  const catalogData = await page.evaluate(() => {
    const items = [];
    const products = document.querySelectorAll('.product, li.product, .type-product');
    products.forEach(p => {
      const titleEl = p.querySelector('.woocommerce-loop-product__title, h2, h3, .product-title');
      const priceEl = p.querySelector('.price');
      const linkEl = p.querySelector('a.woocommerce-LoopProduct-link, a');
      const imgEl = p.querySelector('img');
      const isSoldOut = p.classList.contains('outofstock') || 
                        p.innerText.toLowerCase().includes('sold out') || 
                        !!p.querySelector('.sold-out, .badge-sold-out, .out-of-stock');
      
      if (titleEl && linkEl) {
        items.push({
          title: titleEl.innerText.trim(),
          price: priceEl ? priceEl.innerText.trim() : '',
          url: linkEl.href,
          img: imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '') : '',
          isSoldOut
        });
      }
    });
    return items;
  });

  console.log(`Found ${catalogData.length} products in catalog.`);
  fs.writeFileSync('data/catalog_sample.json', JSON.stringify(catalogData, null, 2));

  // Inspect page details
  console.log('Products sample:', catalogData.slice(0, 5));

  await browser.close();
  console.log('Recon complete!');
})();
