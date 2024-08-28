// controllers/routeController.js

import Route from "../models/routesModel.js";

// Create a new predefined route
export const createRoute = async (req, res) => {
  const { from, to, distance, price } = req.body;

  try {
    const route = new Route({ from, to, distance, price });
    await route.save();
    res.status(201).json({ success: true, route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all predefined routes
export const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.status(200).json({ success: true, routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an existing route
export const updateRoute = async (req, res) => {
  const { id } = req.params;
  const { from, to, distance, price } = req.body;

  try {
    const route = await Route.findByIdAndUpdate(
      id,
      { from, to, distance, price },
      { new: true }
    );
    if (!route) {
      return res
        .status(404)
        .json({ success: false, message: "Route not found" });
    }
    res.status(200).json({ success: true, route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a route
export const deleteRoute = async (req, res) => {
  const { id } = req.params;

  try {
    const route = await Route.findByIdAndDelete(id);
    if (!route) {
      return res
        .status(404)
        .json({ success: false, message: "Route not found" });
    }
    res.status(200).json({ success: true, message: "Route deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
