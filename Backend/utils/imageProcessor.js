// Backend/utils/imageProcessor.js
const sharp = require('sharp');

exports.processImage = async (file) => {
  const filename = `processed-${Date.now()}.webp`;
  
  await sharp(file.path)
    .resize(800, 800, { fit: 'inside' })
    .webp({ quality: 80 })
    .toFile(`uploads/products/${filename}`);
  
  // Delete original
  fs.unlinkSync(file.path);
  
  return filename;
};