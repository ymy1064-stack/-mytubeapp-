export const validateImageData = (imageData) => {
  if (!imageData || typeof imageData !== 'string') {
    return { valid: false, error: 'Image data must be a string' };
  }

  if (!imageData.startsWith('data:image/')) {
    return { valid: false, error: 'Invalid image format. Must be data URL' };
  }

  // Extract base64 data
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  
  // Check if it's valid base64
  try {
    Buffer.from(base64Data, 'base64');
  } catch {
    return { valid: false, error: 'Invalid base64 data' };
  }

  // Check size (5MB limit)
  const sizeInBytes = Buffer.from(base64Data, 'base64').length;
  if (sizeInBytes > 5 * 1024 * 1024) {
    return { 
      valid: false, 
      error: `Image too large. Maximum size is 5MB, got ${Math.round(sizeInBytes / 1024 / 1024 * 100) / 100}MB` 
    };
  }

  return { valid: true, size: sizeInBytes };
};

export const validateThumbnailType = (type) => {
  return ['long', 'short'].includes(type);
};
