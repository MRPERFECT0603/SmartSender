
import express, { Express, Request , Response } from "express";
import cors from "cors";
import MailRouter from "./Routes/MailRoutes";
import { handleCallback } from "./Services/authService";
import {connectDB} from "./Config/dbConfig";
import dotenv from "dotenv";
dotenv.config();

const app:Express = express();
const PORT = process.env.PORT;

//middleware
app.use(express.json());

app.use(
    cors({
      origin: ['http://localhost:3000' , 'https://smartsender.netlify.app']
    })
);

app.use("/api" , MailRouter);
app.get("/callback", handleCallback);

connectDB();

app.listen(PORT , ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})