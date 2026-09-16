import express from "express";
import {
  createService,
  deleteService,
  getAllServices,
  getServices,
  updateService,
} from "../controllers/serviceController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", asyncHandler(getServices));
router.get("/admin/all", protect, authorize("admin"), asyncHandler(getAllServices));
router.post("/", protect, authorize("admin"), asyncHandler(createService));
router.put("/:id", protect, authorize("admin"), asyncHandler(updateService));
router.delete("/:id", protect, authorize("admin"), asyncHandler(deleteService));

export default router;
