export const uploadImage = async (imageUri) => {
  try {
    // Create FormData with the image
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "upload.jpg",
    });
    formData.append("upload_preset", "ajroo_posts"); // Create this in Cloudinary settings

    // Upload to Cloudinary
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dwiw2bprt/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (data.secure_url && data.public_id) {
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    }

    throw new Error("Upload failed");
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
};

// In your Post creation screen
// import { uploadImage } from '../api/upload';
// import { addPost } from '../api/posts';

// const handleCreatePost = async () => {
//   try {
//     // 1. First upload the image and get URL
//     const imageUrl = await uploadImage(selectedImage.uri);

//     // 2. Then create post with the URL
//     const postData = {
//       name: "Drill",
//       category: "tools",
//       image: imageUrl, // Store the Cloudinary URL
//       pricePerDay: 50,
//       city: "Amman",
//       area: "Downtown",
//       condition: "good"
//     };

//     const response = await addPost(postData);

//     if (response.ok) {
//       // Success!
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };
