import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "chat_uploads";
    let resource_type = "auto";

    if (file.mimetype.startsWith("image")) {
      folder = "chat_uploads/images";
      resource_type = "image";
    } else if (file.mimetype.startsWith("video")) {
      folder = "chat_uploads/videos";
      resource_type = "video";
    } else {
      folder = "chat_uploads/documents";
      resource_type = "raw"; // Use raw for documents to ensure download and avoid preview issues
    }

    return {
      folder,
      resource_type,
      public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

export default upload;
