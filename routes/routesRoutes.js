// routes/routeRoutes.js

import express from "express";
import {
  createRoute,
  getRoutes,
  updateRoute,
  deleteRoute,
} from "../controllers/routesController.js";

const router = express.Router();

// Create a new route
router.post("/create", createRoute);

// Get all routes
router.get("/", getRoutes);

// Update a route
router.put("/:id", updateRoute);

// Delete a route
router.delete("/:id", deleteRoute);

export default router;
