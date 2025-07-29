import { userModel } from '../Models/userModel';
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const getTransporter = async (fromEmail: string): Promise<nodemailer.Transporter> => {
  const userData = await userModel.findOne({ email: fromEmail });

  if (!userData) {
    throw new Error("User not found");
  }

  // Get app password from user profile
  const appPassword = userData.profile?.appPassword;
  
  if (!appPassword) {
    throw new Error("App password not configured. Please set up your Gmail app password in your profile.");
  }

  // Create transporter using user's app password
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: fromEmail,
      pass: appPassword, // Use the app password from user profile
    },
  });

  return transporter;
};