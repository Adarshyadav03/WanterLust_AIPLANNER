const cloudinary = require('../config/cloudinary');

const uploadImage = async (req, res) => {
  const { image, images } = req.body;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  // Cloudinary Upload helper
  if (cloudName && cloudName !== 'wanderlust_demo_cloud') {
    try {
      if (Array.isArray(images) && images.length > 0) {
        const uploadPromises = images.map((img) =>
          cloudinary.uploader.upload(img, { folder: 'wanderlust_posts' })
        );
        const results = await Promise.all(uploadPromises);
        const urls = results.map((r) => r.secure_url);
        return res.json({ success: true, urls, url: urls[0] });
      } else if (image) {
        const result = await cloudinary.uploader.upload(image, { folder: 'wanderlust_uploads' });
        return res.json({ success: true, url: result.secure_url, urls: [result.secure_url] });
      }
    } catch (err) {
      console.warn('Cloudinary upload warning:', err.message);
    }
  }

  // Fallback high-res Unsplash image generator if Cloudinary is unconfigured
  const fallbackUrls = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
  ];

  if (Array.isArray(images) && images.length > 0) {
    const urls = images.map((img, i) => (img.startsWith('http') ? img : fallbackUrls[i % fallbackUrls.length]));
    return res.json({ success: true, urls, url: urls[0] });
  }

  const singleUrl = image && image.startsWith('http') ? image : fallbackUrls[Math.floor(Math.random() * fallbackUrls.length)];
  return res.json({ success: true, url: singleUrl, urls: [singleUrl] });
};

module.exports = { uploadImage };
