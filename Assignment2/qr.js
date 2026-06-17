const Jimp = require("jimp");
const jsQR = require("jsqr");

/**
 * Decodes a QR code from an image file.
 * @param {string} imagePath - Path to the image file.
 * @returns {Promise<string>} - The decoded QR string.
 * @throws {Error} - If no QR code is found.
 */
async function decodeQR(imagePath) {
  const image = await Jimp.read(imagePath);

  const { data, width, height } = image.bitmap;

  // jsQR expects a Uint8ClampedArray of RGBA pixels
  const pixels = new Uint8ClampedArray(data);

  const result = jsQR(pixels, width, height);

  if (!result) {
    throw new Error("No QR code found");
  }

  return result.data;
}

// Standalone test — only runs when executed directly: node qr.js <imagePath>
if (require.main === module) {
  const imagePath = process.argv[2];
  if (!imagePath) {
    console.error("Usage: node qr.js <path-to-image>");
    process.exit(1);
  }

  decodeQR(imagePath)
    .then((qrData) => {
      console.log("QR Decoded successfully:");
      console.log(qrData);
    })
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
}

module.exports = { decodeQR };
