const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Bu script çalıştırılmadan önce npm install sharp favicons -g yapılmalıdır.

// Kaynak SVG logosu
const sourceIcon = path.join(__dirname, '../public/logo.svg');

// Hedef klasör
const outputDir = path.join(__dirname, '../public');

// public/icons klasörü yoksa oluştur
const iconsDir = path.join(outputDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// favicon.js NPM paketini kullanarak favicons oluştur
console.log('Favicon ve diğer ikonlar oluşturuluyor...');
try {
  const command = `npx favicons "${sourceIcon}" --path "/icons" --output "${iconsDir}"`;
  execSync(command, { stdio: 'inherit' });
  
  // favicon.ico'yu public klasörüne kopyala
  fs.copyFileSync(
    path.join(iconsDir, 'favicon.ico'), 
    path.join(outputDir, 'favicon.ico')
  );
  
  console.log('Favicon ve ikonlar başarıyla oluşturuldu!');
} catch (error) {
  console.error('Favicon oluşturma hatası:', error);
}
