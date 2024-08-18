
import { Request, Response } from "express";
import { db } from "./db";
import { messages } from "./db/schema";
import { eq, or, asc, and } from "drizzle-orm";

// Function to fetch messages between two users
export const fetchMessages = async (req: Request, res: Response) => {
  const { userId1, userId2 } = req.query;
  const currentUserId = parseInt(userId1 as string, 10);
  const otherUserId = parseInt(userId2 as string, 10);

  try {
    const messagesResult = await db.select({
      id: messages.id,
      content: messages.content,
      timestamp: messages.timestamp,
      senderId: messages.senderId,
      isSender: eq(messages.senderId, currentUserId) // Add this line
    })
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, currentUserId), eq(messages.receiverId, otherUserId)),
          and(eq(messages.senderId, otherUserId), eq(messages.receiverId, currentUserId))
        )
      )
      .orderBy(asc(messages.timestamp));

    res.json({ messages: messagesResult });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
