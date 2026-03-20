/**
 * Resizes a base64 image string to a maximum width and height using a canvas.
 * This is useful for reducing payload size before sending to AI services.
 */
export async function resizeImage(base64: string, maxWidth = 1024, maxHeight = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      // Return as JPEG with 0.7 quality to further reduce size
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = (err) => reject(err);
  });
}
