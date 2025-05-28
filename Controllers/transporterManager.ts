// utils/transporterManager.ts
import nodemailer from "nodemailer";
import { authorize } from "../Services/authService";
import dotenv from "dotenv";
import { Request, Response } from 'express';

dotenv.config();

const transporters: Record<string, nodemailer.Transporter> = {};

export const getTransporter = async (fromEmail: string): Promise<nodemailer.Transporter> => {

  if (transporters[fromEmail]) {
    return transporters[fromEmail];
  }

  const oAuth2Client = await authorize(fromEmail);
  const accessToken = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: fromEmail,
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      refreshToken: oAuth2Client.credentials.refresh_token!,
      accessToken: accessToken.token!,
    },
  });

  transporters[fromEmail] = transporter;
  return transporter;
};

export const getTransporterAPI = (req: Request<{ userEmail: string }> , res: Response)=>{
  const userEmail = req.body;
  getTransporter(userEmail).then((transporter) =>{
    res.status(200).send("Transporter Created.");
  })
  .catch((err: Error) => {
    res.status(500).send("Error creating transporter: " + err.message);
  });
}