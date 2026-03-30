import { Request, Response } from "express";
import { prisma } from "../config/db";

export const createApplication = async (req: Request, res: Response) => {
  try {
    const { company, role, platform, status, appliedDate } = req.body;

    const application = await prisma.application.create({
      data: {
        company,
        role,
        platform,
        status,
        appliedDate: new Date(appliedDate),
        userId: "demo-user", // temp
      },
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: "Error creating application" });
  }
};

export const getApplications = async (req: Request, res: Response) => {
  const applications = await prisma.application.findMany();
  res.json(applications);
};