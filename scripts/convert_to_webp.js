const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png'));

  for (const f of files) {
    const srcPath = path.join(srcDir, f);
    const destName = f.replace('.png', '.webp');
    const destPath = path.join(destDir, destName);

    console.log(`Converting ${srcPath} -> ${destPath}`);
    try {
      const meta = await sharp(srcPath).metadata();
      let pipeline = sharp(srcPath);
      if (meta.height > 15000 || meta.width > 15000) {
        console.log(`  Resizing image ${f} (original: ${meta.width}x${meta.height}) to fit WebP 16k limit`);
        pipeline = pipeline.resize({ height: 12000, fit: 'inside' });
      }
      await pipeline
        .webp({ quality: 82, effort: 4 })
        .toFile(destPath);
    } catch (err) {
      console.error(`Error converting ${f}:`, err.message);
    }
  }
}

async function run() {
  await processDir('captures/before/desktop', 'presentation/assets/captures/before/desktop');
  await processDir('captures/before/mobile', 'presentation/assets/captures/before/mobile');
  await processDir('captures/after/desktop', 'presentation/assets/captures/after/desktop');
  await processDir('captures/after/mobile', 'presentation/assets/captures/after/mobile');

  fs.mkdirSync('presentation/assets', { recursive: true });
  if (fs.existsSync('redesign/assets/logo.webp')) {
    fs.copyFileSync('redesign/assets/logo.webp', 'presentation/assets/logo.webp');
  }

  console.log('All images converted to WebP successfully!');
}

run().catch(console.error);
