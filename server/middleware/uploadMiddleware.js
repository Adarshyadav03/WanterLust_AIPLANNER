// Buffer array handler for memory upload
const uploadMemoryImages = (req, res, next) => {
  // If base64 files array or images array sent in body, pass through
  if (req.body && (req.body.images || req.body.image)) {
    return next();
  }
  next();
};

module.exports = { uploadMemoryImages };
