export const uploadImage = async (imageUri) => {
  try {
    // Create FormData with the image
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    formData.append('upload_preset', 'ajroo_posts'); // Create this in Cloudinary settings
    
    // Upload to Cloudinary
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dwiw2bprt/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await response.json();
    
    if (data.secure_url) {
      return data.secure_url; // This is the URL you'll store in your database!
    }
    
    throw new Error('Upload failed');
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};