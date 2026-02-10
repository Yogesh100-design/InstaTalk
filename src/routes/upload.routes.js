import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/upload", upload.single("file"), (req, res) => {
  res.status(200).json({
    url: req.file.path,
    type: req.file.mimetype,
    name: req.file.originalname,
    size: req.file.size,
  });
});

export default router;
