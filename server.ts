
import express, { Express, Request , Response } from "express";
import cors from "cors";
import MailRouter from "./Routes/MailRoutes";
import { handleCallback } from "./Services/authService";

const app:Express = express();
const PORT = 8101;

//middleware
app.use(express.json());

app.use(
    cors({
      origin: ['http://localhost:8000']
    })
);

app.use("/api" , MailRouter);
app.get("/callback", handleCallback);


app.listen(PORT , ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})