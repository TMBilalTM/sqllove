const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// İkonların oluşturulacağı klasör
const iconDir = path.join(__dirname, '../public/icons');

// Klasör yoksa oluştur
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Kaynak logo dosyası (bu dosyayı projeye eklemelisiniz)
const sourceIcon = path.join(__dirname, '../src/assets/sqllove-logo.png');

// Oluşturulacak ikon boyutları
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Her boyut için ikon oluşturma
async function generateIcons() {
  try {
    for (const size of iconSizes) {
      await sharp(sourceIcon)
        .resize(size, size)
        .toFile(path.join(iconDir, `icon-${size}x${size}.png`));
      
      console.log(`Created icon: ${size}x${size}`);
    }
    
    // Favicon için ayrıca bir ikon oluştur
    await sharp(sourceIcon)
      .resize(32, 32)
      .toFile(path.join(__dirname, '../public/favicon.ico'));
    
    console.log('Created favicon.ico');
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// İkonları oluştur
generateIcons();
