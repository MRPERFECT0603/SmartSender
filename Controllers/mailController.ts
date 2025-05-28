// controllers/emailController.ts
import { Request, Response } from "express";
import { getTransporter } from "../Controllers/transporterManager";


export const sendMail = async (req: Request, res: Response) => {
  const { fromEmail, xlsxData, subject, text } = req.body;

  if (!fromEmail || !xlsxData || !Array.isArray(xlsxData)) {
    return res.status(400).send("Missing fromEmail or xlsxData!");
  }

  try {
    const transporter = await getTransporter(fromEmail);

    for (const row of xlsxData) {
      const toEmail = row.email;
      if (!toEmail) continue;

      await transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject,
        text,
      });

      console.log(`Email sent to ${toEmail}`);
    }

    res.status(200).send("Emails sent successfully.");
  } catch (err) {
    console.error("Failed to send email:", err);
    res.status(500).send("Failed to send email.");
  }
};