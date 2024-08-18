
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto"
import { sendVerificationEmail } from "./emailService";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      console.log(`user : ${email} already exists`)
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate verification code
    const verificationCode = crypto.randomBytes(3).toString('hex');
    
    // Create new user
    const newUser = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      verificationCode,
      isVerified: false,
    }).returning();
    
    // Send verification email
    await sendVerificationEmail(email, verificationCode);
    
    console.log(`Signup initiated: Verification email sent to ${email}`);
    res.status(201).json({ message: "Verification email sent. Please check your inbox." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      console.log('invalid credentials')
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Check if user is verified
    if (!user[0].isVerified) {
      // Generate new verification code
      const verificationCode = crypto.randomBytes(3).toString('hex');
      
      // Update user with new verification code
      await db.update(users)
        .set({ verificationCode })
        .where(eq(users.id, user[0].id));
      
      // Send verification email
      await sendVerificationEmail(email, verificationCode);
      
      return res.status(403).json({ 
        message: "Please verify your email before logging in",
        isVerified: false,
        email: email
      });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user[0].id }, JWT_SECRET, { expiresIn: "1h" });
    console.log(`Login successful: User logged in with email ${email}`);
    res.json({ 
      token, 
      isVerified: true,
      user: {
        id: user[0].id,
        username: user[0].username,  // Added this line
        email: user[0].email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};