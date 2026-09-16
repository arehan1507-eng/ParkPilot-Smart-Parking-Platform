import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const jwtSecret = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

const createToken = (id) =>
  jwt.sign({ id }, jwtSecret, {
    expiresIn: "7d",
  });

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const user = await User.create({ name, email, password, role: "user" });
  const token = createToken(user._id);

  res.status(201).json({
    message: "Account created successfully.",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      defaultVehicleNumber: user.defaultVehicleNumber,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = createToken(user._id);
  res.json({
    message: "Login successful.",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      defaultVehicleNumber: user.defaultVehicleNumber,
    },
  });
};

export const getMe = async (req, res) => {
  res.json(req.user);
};
