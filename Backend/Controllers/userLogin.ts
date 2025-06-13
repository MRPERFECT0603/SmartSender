import {userModel}  from '../Models/userModel';
import dotenv from "dotenv";
import { authorize } from "../Services/authService";
import { Request, Response } from 'express';
import { google } from "googleapis";

dotenv.config();

export const userLogin = async (req: Request, res: Response) : Promise<any> => {
    try {
        const { email , userName} = req.body; 
        let oAuth2Client;
        let accessToken;

        let userData = await userModel.findOne({ email : email });

        if (!userData) {
            oAuth2Client = await authorize(email);
            console.log(oAuth2Client);
            const refresh_token  = oAuth2Client.credentials.refresh_token;
            if (!refresh_token) {
                res.status(400).json({ error: "Authorization failed. No refresh token received." });
            }

            accessToken = await oAuth2Client.getAccessToken();
            userData = new userModel({
                userName,
                email,
                refreshToken: refresh_token,
            });

            await userData.save();
        }
        else {

            oAuth2Client = new google.auth.OAuth2(
                process.env.CLIENT_ID,
                process.env.CLIENT_SECRET
            );

            oAuth2Client.setCredentials({
                refresh_token: userData.refreshToken,
            });

            accessToken = await oAuth2Client.getAccessToken();
            if (!accessToken || !accessToken.token) {
                res.status(500).json({ error: "Failed to retrieve access token" });
            }
        }

        res.status(200).json({
            message: "Login successful",
            email,
        });
    } catch (error: any) {
        res.status(500).json({
            error: error.message || "Internal Server Error",
        });
    }
};