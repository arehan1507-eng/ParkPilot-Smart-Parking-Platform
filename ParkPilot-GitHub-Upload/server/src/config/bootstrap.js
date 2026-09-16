import { Booking } from "../models/Booking.js";
import { User } from "../models/User.js";
import { BOOKING_ACTIVE_STATUSES, PARKING_SLOT_MAP, VEHICLE_RATES_PER_HOUR } from "./parkingConfig.js";

const defaultAdmin = {
  name: "Platform Admin",
  email: "admin@gmail.com",
  password: "loml",
  role: "admin",
  phone: "+91 98765 43210",
  defaultVehicleNumber: "DL01AB1234",
};

export const ensurePlatformDefaults = async () => {
  let admin = await User.findOne({ email: defaultAdmin.email });

  if (!admin) {
    await User.create(defaultAdmin);
  } else {
    let shouldSave = false;

    if (admin.role !== "admin") {
      admin.role = "admin";
      shouldSave = true;
    }
    if (defaultAdmin.phone && admin.phone !== defaultAdmin.phone) {
      admin.phone = defaultAdmin.phone;
      shouldSave = true;
    }
    if (
      defaultAdmin.defaultVehicleNumber &&
      admin.defaultVehicleNumber !== defaultAdmin.defaultVehicleNumber
    ) {
      admin.defaultVehicleNumber = defaultAdmin.defaultVehicleNumber;
      shouldSave = true;
    }

    const passwordMatches = await admin.comparePassword(defaultAdmin.password);
    if (!passwordMatches) {
      admin.password = defaultAdmin.password;
      shouldSave = true;
    }

    if (shouldSave) {
      await admin.save();
    }
  }

  const operatorExists = await User.exists({ email: "operator@servicehub.com" });
  if (!operatorExists) {
    await User.create({
      name: "Operations Manager",
      email: "operator@servicehub.com",
      password: "operator123",
      role: "operator",
      phone: "+91 90123 45678",
    });
  }

  let demoUser = await User.findOne({ email: "user@gmail.com" });
  if (!demoUser) {
    demoUser = await User.findOne({ email: "user@servicehub.com" });
  }

  if (!demoUser) {
    await User.create({
      name: "Sample Driver",
      email: "user@gmail.com",
      password: "user123",
      role: "user",
      phone: "+91 99887 77665",
      defaultVehicleNumber: "DL09FA2642",
    });
  } else {
    let shouldSaveUser = false;
    if (demoUser.email !== "user@gmail.com") {
      demoUser.email = "user@gmail.com";
      shouldSaveUser = true;
    }
    const userPasswordMatches = await demoUser.comparePassword("user123");
    if (!userPasswordMatches) {
      demoUser.password = "user123";
      shouldSaveUser = true;
    }
    if (demoUser.role !== "user") {
      demoUser.role = "user";
      shouldSaveUser = true;
    }
    if (shouldSaveUser) {
      await demoUser.save();
    }
  }

  const hasParkingBookings = await Booking.countDocuments({ slotNumber: { $exists: true } });
  if (hasParkingBookings === 0) {
    const sampleUser = await User.findOne({ email: "user@gmail.com" });
    if (!sampleUser) {
      return;
    }

    const slots = [21, 22, 25, 30, 50, 58];
    const now = new Date();

    for (let index = 0; index < slots.length; index += 1) {
      const slot = PARKING_SLOT_MAP.get(slots[index]);
      if (!slot) {
        continue;
      }

      const start = new Date(now.getTime() - index * 5 * 3600000);
      const durationHours = (index % 4) + 1;
      const end = new Date(start.getTime() + durationHours * 3600000);
      const vehicleType = index % 2 === 0 ? "Car" : "Truck";
      const normalizedStatus = index < 2 ? "active" : index < 4 ? "pending" : "completed";

      await Booking.create({
        userId: sampleUser._id,
        bookingId: `BK000${index + 1}`,
        slotNumber: slot.number,
        zone: slot.zone,
        locationName:
          index % 3 === 0
            ? "Main Building Parking"
            : index % 3 === 1
              ? "North Wing Parking"
              : "Visitor Basement Parking",
        vehicleNumber: `DL0${index + 1}XX${2200 + index}`,
        vehicleType,
        durationHours,
        startTime: start,
        endTime: end,
        amount: VEHICLE_RATES_PER_HOUR[vehicleType] * durationHours,
        paymentStatus: index % 3 === 0 ? "pending" : "paid",
        status: BOOKING_ACTIVE_STATUSES.includes(normalizedStatus) ? normalizedStatus : "completed",
        notes: "Bootstrapped sample booking",
      });
    }
  }
};
