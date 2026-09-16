import express from "express";
import { getUsers, updateProfile } from "../controllers/userController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch("/me", protect, authorize("admin", "operator", "user"), asyncHandler(updateProfile));
router.get("/", protect, authorize("admin"), asyncHandler(getUsers));

export default router;
