// controllers/routeController.js

import Route from "../models/routesModel.js";

// Create a new predefined route
export const createRoute = async (req, res) => {
  const { from, to, distance, price } = req.body;

  try {
    const existingRoute = await Route.findOne({ from: from, to: to });

    if (existingRoute) {
      return res.status(400).send({
        success: false,
        message: "Route already exists",
      });
    }
    // Create the original route
    const originalRoute = new Route({ from, to, distance, price });
    await originalRoute.save();

    // Create the reversed route
    const reversedRoute = new Route({ from: to, to: from, distance, price });
    await reversedRoute.save();

    // Respond with both routes
    res.status(201).json({
      success: true,
      originalRoute,
      reversedRoute,
    });
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

//calculate route
export const calculateRoute = async (req, res) => {
  const { from, to } = req.body;

  try {
    // Find the route that matches the "from" and "to" fields
    const route = await Route.findOne({ from, to });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    // Assuming the route document has distance and price fields
    const { distance, price } = route;

    // Define the average speed (in km/h). This could be adjusted based on road type, traffic, etc.
    const averageSpeed = 37.7; // km/h

    // Calculate duration in hours
    const durationInHours = distance / averageSpeed;

    // Convert duration to minutes
    const durationInMinutes = durationInHours * 60;

    // Round duration to 1 decimal place
    const roundedDuration = Math.round(durationInMinutes * 10) / 10;

    res.status(200).json({
      success: true,
      from,
      to,
      distance,
      duration: roundedDuration,
      price,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
