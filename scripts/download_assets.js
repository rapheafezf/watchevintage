const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  const allWatches = JSON.parse(fs.readFileSync('data/all_watches.json', 'utf8'));
  const productAvailable = JSON.parse(fs.readFileSync('data/product_available.json', 'utf8'));
  const productSoldout = JSON.parse(fs.readFileSync('data/product_soldout.json', 'utf8'));

  console.log('Downloading logo...');
  await downloadFile('https://www.watchandvintage.fr/wp-content/uploads/2022/09/logo_250.webp', 'redesign/assets/logo.webp');

  console.log('Downloading catalog images...');
  for (let i = 0; i < allWatches.length; i++) {
    const w = allWatches[i];
    const filename = `watch_${i + 1}.webp`;
    try {
      await downloadFile(w.img, path.join('redesign/assets/watches', filename));
      w.localImg = `assets/watches/${filename}`;
      console.log(`Downloaded ${w.title} -> ${filename}`);
    } catch (e) {
      console.error(`Failed ${w.img}:`, e.message);
    }
  }
  fs.writeFileSync('data/all_watches.json', JSON.stringify(allWatches, null, 2));

  console.log('Downloading gallery images for Citizen (Available)...');
  const availableImgs = productAvailable.imgs.filter(u => u.includes('DSCF') && (u.includes('1000x1000') || u.endsWith('.webp') || u.endsWith('.jpg')));
  const citizenGallery = [];
  for (let i = 0; i < Math.min(availableImgs.length, 8); i++) {
    const url = availableImgs[i];
    const filename = `citizen_gallery_${i + 1}.webp`;
    try {
      await downloadFile(url, path.join('redesign/assets/gallery/citizen', filename));
      citizenGallery.push(`assets/gallery/citizen/${filename}`);
      console.log(`Downloaded citizen gallery ${i + 1}`);
    } catch (e) {
      console.error(e.message);
    }
  }
  productAvailable.localGallery = citizenGallery;
  fs.writeFileSync('data/product_available.json', JSON.stringify(productAvailable, null, 2));

  console.log('Downloading gallery images for Longines (Sold Out)...');
  const soldoutImgs = productSoldout.imgs.filter(u => u.includes('DSCF') && (u.includes('1000x1000') || u.endsWith('.webp') || u.endsWith('.jpg')));
  const longinesGallery = [];
  for (let i = 0; i < Math.min(soldoutImgs.length, 8); i++) {
    const url = soldoutImgs[i];
    const filename = `longines_gallery_${i + 1}.webp`;
    try {
      await downloadFile(url, path.join('redesign/assets/gallery/longines', filename));
      longinesGallery.push(`assets/gallery/longines/${filename}`);
      console.log(`Downloaded longines gallery ${i + 1}`);
    } catch (e) {
      console.error(e.message);
    }
  }
  productSoldout.localGallery = longinesGallery;
  fs.writeFileSync('data/product_soldout.json', JSON.stringify(productSoldout, null, 2));

  console.log('All downloads completed successfully!');
})();
