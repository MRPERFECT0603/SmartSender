import {userModel}  from '../Models/userModel';
import dotenv from "dotenv";
import { authorize } from "../Services/authService";
import { Request, Response } from 'express';
import { google } from "googleapis";

dotenv.config();

export const userLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, userName } = req.body;
    let userData = await userModel.findOne({ email });

    if (!userData) {
      const { authUrl } = await authorize(email);
      // Inform frontend to redirect the user
      return res.status(202).json({
        message: "Authorization required",
        authUrl,
      });
    }

    // Existing user - use stored refresh token
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    );
    oAuth2Client.setCredentials({ refresh_token: userData.refreshToken });

    const accessToken = await oAuth2Client.getAccessToken();
    if (!accessToken || !accessToken.token) {
      return res.status(500).json({ error: "Failed to retrieve access token" });
    }

    return res.status(200).json({
      message: "Login successful",
      email,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
