import { db } from "./db";
import { users } from "./db/schema";
import { Response, Request } from "express";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const verifyEmail = async (req: Request, res: Response) => {
    try {
      const { email, verificationCode } = req.body;
      
      // Check if user exists and verification code matches
      const user = await db.select().from(users).where(eq(users.email, email));
      
      if (user.length === 0 || user[0].verificationCode !== verificationCode) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      // Update user as verified
      await db.update(users)
        .set({ isVerified: true, verificationCode: null })
        .where(eq(users.id, user[0].id));
      
      // Generate JWT token
      const token = jwt.sign({ id: user[0].id }, JWT_SECRET, { expiresIn: "1h" });
      
      console.log(`Email verified successfully for user: ${email}`);
      res.json({ 
        token, 
        message: "Email verified successfully",
        user: {
          id: user[0].id,
          username: user[0].username,
          email: user[0].email
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };