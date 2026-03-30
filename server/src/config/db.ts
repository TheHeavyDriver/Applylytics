import { PrismaClient } from "@prisma/client";
import "dotenv/config";

// We don't pass the URL in the constructor here. 
// Prisma automatically looks for DATABASE_URL in the environment.
export const prisma = new PrismaClient();

console.log("✅ Prisma Client Initialized");