import { User } from "../models/User.js";

export const getUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

export const updateProfile = async (req, res) => {
  const { name, phone, defaultVehicleNumber } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (typeof name === "string" && name.trim()) {
    user.name = name.trim();
  }
  if (typeof phone === "string") {
    user.phone = phone.trim();
  }
  if (typeof defaultVehicleNumber === "string") {
    user.defaultVehicleNumber = defaultVehicleNumber.trim().toUpperCase();
  }

  await user.save();
  const safeUser = await User.findById(user._id).select("-password");
  res.json({ message: "Profile updated successfully.", user: safeUser });
};
