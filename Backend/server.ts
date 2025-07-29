
import express, { Express, Request , Response } from "express";
import cors from "cors";
import MailRouter from "./Routes/MailRoutes";
import { handleCallback } from "./Services/authService";
import {connectDB} from "./Config/dbConfig";
import { SchedulingService } from "./Services/schedulingService";
import dotenv from "dotenv";
dotenv.config();

const app:Express = express();
const PORT = process.env.PORT;

//middleware
app.use(express.json());

app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:3001", "https://smartsender.netlify.app"],
      credentials: true, 
    })
);

// Add request logging
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use("/api" , MailRouter);
app.get("/callback", handleCallback);

// Expose Google client ID to frontend
app.get("/api/google-config", (req: Request, res: Response) => {
  res.json({
    clientId: process.env.CLIENT_ID
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Initialize database and start scheduler
connectDB().then(() => {
    // Start the email scheduler
    const schedulingService = new SchedulingService();
    schedulingService.startScheduler();
    
    app.listen(PORT , ()=>{
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});