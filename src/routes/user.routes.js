import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getAllUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protect, getAllUsers);

export default router;
