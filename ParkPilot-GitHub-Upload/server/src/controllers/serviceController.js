import { Service } from "../models/Service.js";

export const getServices = async (req, res) => {
  const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(services);
};

export const getAllServices = async (req, res) => {
  const services = await Service.find().sort({ createdAt: -1 });
  res.json(services);
};

export const createService = async (req, res) => {
  const { name, description, price, duration } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: "Name and description are required." });
  }

  const service = await Service.create({ name, description, price, duration });
  res.status(201).json({ message: "Service created successfully.", service });
};

export const updateService = async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!service) {
    return res.status(404).json({ message: "Service not found." });
  }

  res.json({ message: "Service updated successfully.", service });
};

export const deleteService = async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);

  if (!service) {
    return res.status(404).json({ message: "Service not found." });
  }

  res.json({ message: "Service deleted successfully." });
};
