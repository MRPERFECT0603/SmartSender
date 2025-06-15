import { userModel } from '../Models/userModel';
import dotenv from "dotenv";
import { authorize } from "../Services/authService";
import { Request, Response } from 'express';
import { google } from "googleapis";

dotenv.config();

export const userLogin = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, userName } = req.body;
        let accessToken: any;
        let authUrl: string;
        let userData = await userModel.findOne({ email });

        // Case 1: New user
        if (!userData) {
            const { authUrl } = await authorize(email);
            return res.status(202).json({
                message: "User needs to authenticate",
                authUrl,
            });
        }
        // Case 2: Returning user
        else {
            const oAuth2Client = new google.auth.OAuth2(
                process.env.CLIENT_ID,
                process.env.CLIENT_SECRET,
                process.env.REDIRECT_URI
            );

            oAuth2Client.setCredentials({
                refresh_token: userData.refreshToken,
            });

            const tokenResponse = await oAuth2Client.getAccessToken();

            if (!tokenResponse || !tokenResponse.token) {
                return res.status(500).json({ error: "Failed to retrieve access token" });
            }

            accessToken = tokenResponse;
        }

        res.status(200).json({
            message: "Login successful",
            email,
            accessToken: accessToken?.token || null,
        });

    } catch (error: any) {
        console.error("Login Error:", error);
        res.status(500).json({
            error: error.message || "Internal Server Error",
        });
    }
};