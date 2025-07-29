import { userModel } from '../Models/userModel';
import dotenv from "dotenv";
import { Request, Response } from 'express';

dotenv.config();

export const userLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, googleId, name, picture } = req.body;
        
        if (!email || !name) {
            res.status(400).json({ error: 'Email and name are required' });
            return;
        }

        // Check if user exists
        let userData = await userModel.findOne({ email });

        if (!userData) {
            // Create new user
            userData = new userModel({
                email,
                googleId: googleId || null, // Optional for app password users
                name,
                picture,
                createdAt: new Date()
            });
            await userData.save();
            
            res.status(201).json({
                message: "New user created",
                email,
                profile: null
            });
        } else {
            // Update existing user's info
            if (googleId) {
                userData.googleId = googleId;
            }
            userData.name = name;
            if (picture) {
                userData.picture = picture;
            }
            await userData.save();
            
            res.status(200).json({
                message: "User found",
                email,
                profile: userData.profile || null
            });
        }

    } catch (error: any) {
        console.error("Login Error:", error);
        res.status(500).json({
            error: error.message || "Internal Server Error",
        });
    }
};

export const saveProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, name, contact, linkedIn, company, position, appPassword } = req.body;
        
        if (!email || !name) {
            res.status(400).json({ error: 'Email and name are required' });
            return;
        }

        // Find and update user profile
        const userData = await userModel.findOne({ email });
        
        if (!userData) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        userData.profile = {
            email,
            name,
            contact: contact || '',
            linkedIn: linkedIn || '',
            company: company || '',
            position: position || '',
            appPassword: appPassword || ''
        };
        
        await userData.save();

        res.status(200).json({
            message: "Profile saved successfully",
            profile: userData.profile
        });

    } catch (error: any) {
        console.error("Profile Save Error:", error);
        res.status(500).json({
            error: error.message || "Internal Server Error",
        });
    }
};