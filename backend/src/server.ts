
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { login, signup } from "./auth";
import { db } from "./db";
import { verifyEmail } from "./verifyEmail";
import { Server } from "socket.io";
import { setupSocketIO } from "./sockethandler";
import { fetchMessages } from "./fetchMessage";
import { getUserStatuses } from "./getUserStatuses";
import { messages, users } from "./db/schema";
import { and, eq, sql, or, like, desc } from "drizzle-orm";
import multer from 'multer';
import path from 'path';
import fs from 'fs'

dotenv.config();

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
});

// Set up Socket.IO
setupSocketIO(io);

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  
  const fileUrl = `https://hirychat.onrender.com/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

app.get("/", async (req, res) => {
    try {
        const data = await db.query.users.findMany({});
        return res.json({ data });
    } catch (error) {
        return res.json({ error }); 
    }
});

app.post("/api/signup", signup);
app.post("/api/login", login);
app.post("/api/verify-email", verifyEmail);

app.get("/api/messages", fetchMessages);    
app.get("/api/user-statuses", getUserStatuses);

app.get('/api/unread-messages', async (req, res) => {
  const userId = parseInt(req.query.userId as string, 10);

  try {
    const unreadMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        content: messages.content,
        timestamp: messages.timestamp,
        senderUsername: users.username,
        senderEmail: users.email,  // Add this line to fetch sender's email
      })
      .from(messages)
      .innerJoin(users, eq(users.id, messages.senderId))
      .where(and(
        eq(messages.receiverId, userId),
        eq(messages.read, false)
      ))
      .orderBy(desc(messages.timestamp))
      .execute();

    res.json({ messages: unreadMessages });
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/mark-messages-read', async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    await db.update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.senderId, senderId),
          eq(messages.receiverId, receiverId),
          eq(messages.read, false)
        )
      )
      .execute();

    res.status(200).json({ message: 'Messages marked as read successfully' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/latest-messages', async (req, res) => {
  const userId = parseInt(req.query.userId as string, 10);

  try {
    // First, fetch all messages for the user ordered by timestamp
    const allMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        content: messages.content,
        timestamp: messages.timestamp,
        read: messages.read,
        senderUsername: users.username,
        senderEmail: users.email,
      })
      .from(messages)
      .innerJoin(users, eq(users.id, messages.senderId))
      .where(eq(messages.receiverId, userId))
      .orderBy(desc(messages.timestamp))
      .execute();

    // Group messages by senderId and pick the latest one
    const latestMessagesMap = new Map();
    allMessages.forEach(msg => {
      if (!latestMessagesMap.has(msg.senderId) || latestMessagesMap.get(msg.senderId).timestamp < msg.timestamp) {
        latestMessagesMap.set(msg.senderId, msg);
      }
    });

    const latestMessages = Array.from(latestMessagesMap.values());

    res.json({ messages: latestMessages });
  } catch (error) {
    console.error('Error fetching latest messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
