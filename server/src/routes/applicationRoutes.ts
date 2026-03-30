import express from "express";
import { createApplication, getApplications } from "../controllers/applicationController";

const router = express.Router();

// POST /applications
router.post("/", createApplication);

// GET /applications
router.get("/", getApplications);

export default router;