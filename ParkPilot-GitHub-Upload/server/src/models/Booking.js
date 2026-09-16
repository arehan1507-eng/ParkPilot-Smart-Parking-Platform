import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Legacy field from service-booking version; optional for backward compatibility.
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: false,
    },
    // Legacy field from service-booking version; optional for backward compatibility.
    date: {
      type: Date,
      required: false,
    },
    slotNumber: {
      type: Number,
      min: 1,
      max: 200,
    },
    zone: {
      type: String,
      enum: ["A", "B", "C"],
    },
    locationName: {
      type: String,
      trim: true,
      default: "",
    },
    vehicleNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    vehicleType: {
      type: String,
      enum: ["Bike", "Car", "SUV", "Truck"],
      default: "Car",
    },
    durationHours: {
      type: Number,
      min: 1,
      max: 24,
      default: 1,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    amount: {
      type: Number,
      min: 0,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending"],
      default: "paid",
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled", "confirmed", "in-progress"],
      default: "active",
    },
    bookingId: {
      type: String,
      unique: true,
      required: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ slotNumber: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ userId: 1, startTime: -1 });

export const Booking = mongoose.model("Booking", bookingSchema);
