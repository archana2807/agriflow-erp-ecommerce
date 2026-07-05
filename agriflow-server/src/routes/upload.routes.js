import { Router } from "express";
import { upload, uploadImage } from "../controllers/upload.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

router.post("/image", protect, authorize("ADMIN"), upload.single("image"), uploadImage);

export default router;
