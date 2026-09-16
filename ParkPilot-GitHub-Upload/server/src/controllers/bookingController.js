import { Booking } from "../models/Booking.js";
import {
  BOOKING_ACTIVE_STATUSES,
  PARKING_SLOT_DEFINITIONS,
  PARKING_SLOT_MAP,
  VEHICLE_RATES_PER_HOUR,
} from "../config/parkingConfig.js";

const buildBookingId = () => `BK${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 90 + 10)}`;

const parseDateTime = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const startOfDay = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const endOfDay = (date) => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
};

const overlaps = (leftStart, leftEnd, rightStart, rightEnd) => leftStart < rightEnd && leftEnd > rightStart;

const normalizeLegacyStatus = (status) => {
  if (status === "confirmed") {
    return "pending";
  }
  if (status === "in-progress") {
    return "active";
  }
  return status;
};

const serializeBooking = (booking) => {
  const value = booking?.toObject ? booking.toObject() : booking;
  const normalizedStatus = normalizeLegacyStatus(value.status);
  const startTime = value.startTime || value.date || value.createdAt;
  return {
    ...value,
    status: normalizedStatus,
    startTime,
    durationHours: value.durationHours || 1,
    vehicleType: value.vehicleType || "Car",
    vehicleNumber: value.vehicleNumber || "",
    paymentStatus: value.paymentStatus || "paid",
    amount: value.amount || 0,
    locationName: value.locationName || "Main Building Parking",
  };
};

const buildLayoutFromBookings = (bookings, atTime) => {
  const grouped = new Map();
  const occupiedCount = { value: 0 };
  const bookedCount = { value: 0 };
  const availableCount = { value: 0 };

  for (const slot of PARKING_SLOT_DEFINITIONS) {
    if (!grouped.has(slot.zone)) {
      grouped.set(slot.zone, []);
    }

    let status = slot.isDisabled ? "disabled" : "available";
    let currentBooking = null;

    if (!slot.isDisabled) {
      const matching = bookings.find((booking) => {
        if (booking.slotNumber !== slot.number) {
          return false;
        }

        const start = booking.startTime ? new Date(booking.startTime) : booking.date ? new Date(booking.date) : null;
        const durationHours = booking.durationHours || 1;
        const end = booking.endTime ? new Date(booking.endTime) : start ? new Date(start.getTime() + durationHours * 3600000) : null;
        if (!start || !end) {
          return false;
        }

        return overlaps(start, end, atTime, new Date(atTime.getTime() + 1));
      });

      if (matching) {
        currentBooking = matching;
        const mappedStatus = normalizeLegacyStatus(matching.status);
        status = mappedStatus === "active" ? "occupied" : mappedStatus === "pending" ? "booked" : "available";
      }
    }

    if (status === "available") {
      availableCount.value += 1;
    } else if (status === "occupied") {
      occupiedCount.value += 1;
    } else if (status === "booked") {
      bookedCount.value += 1;
    }

    grouped.get(slot.zone).push({
      ...slot,
      status,
      booking: currentBooking
        ? {
            bookingId: currentBooking.bookingId,
            userName: currentBooking.userId?.name,
            vehicleNumber: currentBooking.vehicleNumber || "N/A",
            vehicleType: currentBooking.vehicleType || "Car",
          }
        : null,
    });
  }

  return {
    zones: Array.from(grouped.entries()).map(([zone, slots]) => ({
      zone,
      available: slots.filter((slot) => slot.status === "available").length,
      total: slots.length,
      slots,
    })),
    counts: {
      available: availableCount.value,
      occupied: occupiedCount.value,
      booked: bookedCount.value,
      total: PARKING_SLOT_DEFINITIONS.length,
    },
  };
};

const fetchScopedBookings = async ({ user, query, includeUser = true }) => {
  const mongoQuery = {};

  if (user.role === "user") {
    mongoQuery.userId = user._id;
  }

  if (query.status && query.status !== "all") {
    mongoQuery.status = query.status;
  }

  if (query.vehicleType && query.vehicleType !== "all") {
    mongoQuery.vehicleType = query.vehicleType;
  }

  let bookingQuery = Booking.find(mongoQuery).sort({ startTime: -1, createdAt: -1 });
  if (includeUser) {
    bookingQuery = bookingQuery.populate("userId", "name email role");
  }
  const bookings = await bookingQuery;

  const searchValue = query.search?.trim().toLowerCase();
  if (!searchValue) {
    return bookings;
  }

  return bookings.filter((booking) => {
    const userName = booking.userId?.name?.toLowerCase() || "";
    return (
      booking.bookingId?.toLowerCase().includes(searchValue) ||
      `${booking.slotNumber || ""}`.includes(searchValue) ||
      (booking.vehicleNumber || "").toLowerCase().includes(searchValue) ||
      userName.includes(searchValue)
    );
  });
};

export const getParkingLayout = async (req, res) => {
  const selectedAt = req.query.at ? parseDateTime(req.query.at) : new Date();
  if (!selectedAt) {
    return res.status(400).json({ message: "Invalid date-time value in query param 'at'." });
  }

  const queryStart = new Date(selectedAt.getTime() - 24 * 3600000);
  const queryEnd = new Date(selectedAt.getTime() + 24 * 3600000);
  const bookings = await Booking.find({
    slotNumber: { $exists: true },
    status: { $in: BOOKING_ACTIVE_STATUSES.concat("in-progress", "confirmed") },
    $or: [
      { startTime: { $lte: queryEnd }, endTime: { $gte: queryStart } },
      { date: { $gte: queryStart, $lte: queryEnd } },
    ],
  }).populate("userId", "name");

  const layout = buildLayoutFromBookings(bookings, selectedAt);
  res.json({
    at: selectedAt.toISOString(),
    ...layout,
  });
};

export const createBooking = async (req, res) => {
  const { slotNumber, locationName, vehicleNumber, vehicleType, durationHours, startTime, notes } = req.body;

  if (!slotNumber || !locationName || !vehicleNumber || !vehicleType || !durationHours || !startTime) {
    return res
      .status(400)
      .json({
        message:
          "slotNumber, locationName, vehicleNumber, vehicleType, durationHours, and startTime are required.",
      });
  }

  const slot = PARKING_SLOT_MAP.get(Number(slotNumber));
  if (!slot) {
    return res.status(404).json({ message: "Selected slot does not exist." });
  }

  if (slot.isDisabled) {
    return res.status(400).json({ message: "Selected slot is disabled." });
  }

  if (!VEHICLE_RATES_PER_HOUR[vehicleType]) {
    return res.status(400).json({ message: "Invalid vehicle type selected." });
  }

  const normalizedDuration = Number(durationHours);
  if (!Number.isFinite(normalizedDuration) || normalizedDuration < 1 || normalizedDuration > 24) {
    return res.status(400).json({ message: "Duration must be between 1 and 24 hours." });
  }

  const start = parseDateTime(startTime);
  if (!start) {
    return res.status(400).json({ message: "Invalid booking start time." });
  }
  const end = new Date(start.getTime() + normalizedDuration * 3600000);

  const conflictingBooking = await Booking.findOne({
    slotNumber: Number(slotNumber),
    status: { $in: BOOKING_ACTIVE_STATUSES.concat("in-progress", "confirmed") },
    $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }, { date: start }],
  });

  if (conflictingBooking) {
    return res.status(409).json({ message: "This slot is already reserved for the selected time window." });
  }

  const amount = VEHICLE_RATES_PER_HOUR[vehicleType] * normalizedDuration;
  const booking = await Booking.create({
    userId: req.user._id,
    bookingId: buildBookingId(),
    slotNumber: Number(slotNumber),
    zone: slot.zone,
    locationName: locationName.trim(),
    vehicleNumber: vehicleNumber.trim().toUpperCase(),
    vehicleType,
    durationHours: normalizedDuration,
    startTime: start,
    endTime: end,
    amount,
    paymentStatus: Math.random() > 0.25 ? "paid" : "pending",
    status: "active",
    notes: notes || "",
  });

  const populated = await booking.populate("userId", "name email role");

  res.status(201).json({
    message: "Slot booked successfully.",
    booking: serializeBooking(populated),
  });
};

export const getMyBookings = async (req, res) => {
  const bookings = await fetchScopedBookings({ user: req.user, query: req.query, includeUser: false });
  res.json(bookings.map(serializeBooking));
};

export const getAllBookings = async (req, res) => {
  const bookings = await fetchScopedBookings({ user: req.user, query: req.query, includeUser: true });
  res.json(bookings.map(serializeBooking));
};

export const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["pending", "active", "completed", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid booking status." });
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate("userId", "name email role");

  if (!booking) {
    return res.status(404).json({ message: "Booking not found." });
  }

  res.json({ message: "Booking updated successfully.", booking: serializeBooking(booking) });
};

export const getDashboardAnalytics = async (req, res) => {
  const scopeQuery = req.user.role === "user" ? { userId: req.user._id } : {};
  const bookings = (await Booking.find(scopeQuery).sort({ startTime: -1, createdAt: -1 })).map(
    serializeBooking
  );

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
  const totalBookings = bookings.length;
  const avgBookingValue = totalBookings ? totalRevenue / totalBookings : 0;

  const today = new Date();
  const sevenDays = [];

  for (let index = 6; index >= 0; index -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - index);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const dayBookings = bookings.filter((booking) => {
      const stamp = booking.startTime || booking.date || booking.createdAt;
      return stamp >= dayStart && stamp <= dayEnd;
    });

    sevenDays.push({
      label: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(day),
      revenue: dayBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0),
      bookings: dayBookings.length,
    });
  }

  const vehicleCounts = { Bike: 0, Car: 0, SUV: 0, Truck: 0 };
  for (const booking of bookings) {
    if (vehicleCounts[booking.vehicleType] !== undefined) {
      vehicleCounts[booking.vehicleType] += 1;
    }
  }

  const nearNowBookings = await Booking.find({
    status: { $in: BOOKING_ACTIVE_STATUSES.concat("in-progress", "confirmed") },
    slotNumber: { $exists: true },
    ...(req.user.role === "user" ? { userId: req.user._id } : {}),
  }).populate("userId", "name");

  const layout = buildLayoutFromBookings(nearNowBookings, new Date());
  const occupancyRate = layout.counts.total
    ? Number((((layout.counts.occupied + layout.counts.booked) / layout.counts.total) * 100).toFixed(1))
    : 0;

  res.json({
    totals: {
      totalRevenue,
      totalBookings,
      avgBookingValue,
      totalSlots: PARKING_SLOT_DEFINITIONS.length,
    },
    layoutCounts: layout.counts,
    occupancyRate,
    trends: sevenDays,
    vehicleDistribution: Object.entries(vehicleCounts).map(([type, count]) => ({ type, count })),
    recentBookings: bookings.slice(0, 12),
  });
};
