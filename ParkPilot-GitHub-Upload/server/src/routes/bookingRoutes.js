import express from "express";
import {
  createBooking,
  getDashboardAnalytics,
  getAllBookings,
  getParkingLayout,
  getMyBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("user", "admin"), asyncHandler(createBooking));
router.get("/layout", authorize("admin", "operator", "user"), asyncHandler(getParkingLayout));
router.get("/analytics", authorize("admin", "operator", "user"), asyncHandler(getDashboardAnalytics));
router.get("/my", authorize("user", "admin"), asyncHandler(getMyBookings));
router.get("/all", authorize("admin", "operator"), asyncHandler(getAllBookings));
router.patch("/:id/status", authorize("admin", "operator"), asyncHandler(updateBookingStatus));

export default router;
