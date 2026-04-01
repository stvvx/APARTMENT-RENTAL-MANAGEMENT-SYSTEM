const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @param {string} filePath 
 * @param {string} folder 
 * @returns {Promise<string>} 
 */
const uploadToCloudinary = async (filePath, folder = 'apartments') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (err) {
    throw err;
  }
};

module.exports = { cloudinary, uploadToCloudinary };
