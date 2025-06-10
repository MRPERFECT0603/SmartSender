import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    refreshToken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const userModel = mongoose.model("User", userSchema);