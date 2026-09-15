import multer from "multer";

import cloudinary from "../config/cloudinary.js";

const storage = {
  _handleFile(req, file, callback) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "nestro",

        resource_type: "image",

        use_filename: false,

        unique_filename: true,

        overwrite: false,
      },

      (error, result) => {
        if (error) {
          console.error("CLOUDINARY UPLOAD ERROR:");

          console.error(error);

          return callback(error);
        }

        if (!result || !result.secure_url) {
          const uploadError = new Error(
            "Cloudinary upload completed without image URL",
          );

          console.error("CLOUDINARY RESULT ERROR:", result);

          return callback(uploadError);
        }

        callback(null, {
          path: result.secure_url,

          filename: result.public_id,

          size: result.bytes,

          mimetype: file.mimetype,

          originalname: file.originalname,
        });
      },
    );

    uploadStream.on("error", (error) => {
      console.error("CLOUDINARY STREAM ERROR:", error);
    });

    file.stream.on("error", (error) => {
      console.error("FILE STREAM ERROR:", error);

      uploadStream.destroy(error);
    });

    file.stream.pipe(uploadStream);
  },

  _removeFile(req, file, callback) {
    if (!file?.filename) {
      return callback(null);
    }

    cloudinary.uploader.destroy(
      file.filename,
      {
        resource_type: "image",
      },
      (error) => {
        if (error) {
          console.error("CLOUDINARY DELETE ERROR:", error);
        }

        callback(error || null);
      },
    );
  },
};

const fileFilter = (req, file, callback) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(new Error("Only JPEG, PNG and WebP images are allowed"));
  }

  callback(null, true);
};

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,

    files: 6,

    fields: 40,
  },

  fileFilter,
});

export default upload;
