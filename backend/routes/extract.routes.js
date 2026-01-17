import express from "express";
import multer from "multer";
import { extractController } from "../controllers/extract.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), extractController);
export default router;
