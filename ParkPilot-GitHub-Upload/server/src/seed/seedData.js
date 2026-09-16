import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Booking } from "../models/Booking.js";
import { User } from "../models/User.js";
import { PARKING_SLOT_MAP, VEHICLE_RATES_PER_HOUR } from "../config/parkingConfig.js";

dotenv.config();

const users = [
  {
    name: "Platform Admin",
    email: "admin@gmail.com",
    password: "loml",
    role: "admin",
    phone: "+91 98765 43210",
    defaultVehicleNumber: "DL01AB1234",
  },
  {
    name: "Operations Manager",
    email: "operator@servicehub.com",
    password: "operator123",
    role: "operator",
    phone: "+91 90123 45678",
  },
  {
    name: "Sample Driver",
    email: "user@gmail.com",
    password: "user123",
    role: "user",
    phone: "+91 99887 77665",
    defaultVehicleNumber: "DL09FA2642",
  },
];

const seed = async () => {
  try {
    await connectDB();
    await Promise.all([Booking.deleteMany(), User.deleteMany()]);

    const createdUsers = [];
    for (const entry of users) {
      const createdUser = await User.create(entry);
      createdUsers.push(createdUser);
    }

    const demoUser = createdUsers.find((user) => user.role === "user");
    const now = new Date();
    const sampleData = [
      { slotNumber: 21, vehicleType: "Car", durationHours: 3, shiftHours: -1, status: "active" },
      { slotNumber: 22, vehicleType: "Bike", durationHours: 2, shiftHours: -3, status: "pending" },
      { slotNumber: 25, vehicleType: "SUV", durationHours: 4, shiftHours: -8, status: "completed" },
      { slotNumber: 50, vehicleType: "Truck", durationHours: 6, shiftHours: -24, status: "completed" },
      { slotNumber: 58, vehicleType: "Car", durationHours: 1, shiftHours: -30, status: "pending" },
    ];

    for (let index = 0; index < sampleData.length; index += 1) {
      const entry = sampleData[index];
      const slot = PARKING_SLOT_MAP.get(entry.slotNumber);
      if (!slot) {
        continue;
      }

      const start = new Date(now.getTime() + entry.shiftHours * 3600000);
      const end = new Date(start.getTime() + entry.durationHours * 3600000);
      await Booking.create({
        userId: demoUser._id,
        bookingId: `BK000${index + 1}`,
        slotNumber: slot.number,
        zone: slot.zone,
        locationName:
          index % 3 === 0
            ? "Main Building Parking"
            : index % 3 === 1
              ? "North Wing Parking"
              : "Visitor Basement Parking",
        vehicleNumber: `DL0${index + 2}EK${7400 + index}`,
        vehicleType: entry.vehicleType,
        durationHours: entry.durationHours,
        startTime: start,
        endTime: end,
        amount: VEHICLE_RATES_PER_HOUR[entry.vehicleType] * entry.durationHours,
        paymentStatus: index % 2 === 0 ? "paid" : "pending",
        status: entry.status,
        notes: "Seeded booking",
      });
    }

    console.log("Seed completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
