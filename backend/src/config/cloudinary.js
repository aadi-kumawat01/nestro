import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUD_NAME?.trim();

const apiKey = process.env.CLOUDINARY_API_KEY?.trim();

const apiSecret = process.env.CLOUDINARY_SECRET_KEY?.trim();

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Cloudinary environment variables are missing");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;
