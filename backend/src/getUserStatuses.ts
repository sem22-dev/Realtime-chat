
import { Request, Response } from "express";
import { db } from "./db";
import { userStatus } from "./db/schema";

export const getUserStatuses = async (req: Request, res: Response) => {
  try {
    const statuses = await db.select().from(userStatus);
    res.json({ statuses });
  } catch (error) {
    console.error("Error fetching user statuses:", error);
    res.status(500).json({ error: "Failed to fetch user statuses" });
  }
};