// controllers/emailController.ts
import { Request, Response } from "express";
import { getTransporter } from "../Controllers/transporterManager";

export const sendMail = async (req: Request, res: Response) => {
  const {fromEmail  , toEmail , subject , text} = req.body;

  if (!fromEmail || !toEmail) {
    return res.status(400).send("Missing fromEmail && toEmail!!");
  }

  try {
    const transporter = await getTransporter(fromEmail);

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: subject,
      text: text,
    });

    res.status(200).send("Test email sent.");
  } catch (err) {
    console.error("Failed to send email:", err);
    res.status(500).send("Failed to send email.");
  }
};