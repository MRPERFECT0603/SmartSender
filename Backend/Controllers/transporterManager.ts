import { userModel } from '../Models/userModel';
import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

export const getTransporter = async (fromEmail: string): Promise<nodemailer.Transporter> => {

  const userData = await userModel.findOne({ email: fromEmail });

  if (!userData) {
    throw new Error("User not found or refresh token is missing");
  }

  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI 
  );

  oAuth2Client.setCredentials({
    refresh_token: userData.refreshToken
  });


  const accessTokenResponse = await oAuth2Client.getAccessToken();
  const accessToken = accessTokenResponse.token;

  if (!accessToken) {
    throw new Error("Failed to get access token from refresh token");
  }


  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: fromEmail,
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      refreshToken: userData.refreshToken,
      accessToken: accessToken,
    },
  });

  return transporter;
};