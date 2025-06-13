// controllers/emailController.ts
import { Request, Response } from "express";
import { getTransporter } from "./transporterManager";
import multer from "multer";
import path from "path";
import fs from "fs";
import { console } from "inspector/promises";


const updateText = (text : string , name: string , user:string) : string => {

  const updatedText = `Dear ${name},\n\n${text}\n\nYours,\n${user}`;
  
  return updatedText;
}


export const sendMail = async (req: Request, res: Response) => {
  const { user, fromEmail, xlsxData, subject, text } = req.body;
  const files = req.files as Express.Multer.File[];
  console.log(files);
   if (!fromEmail || !xlsxData) {
    return res.status(400).json({ error: "Missing fromEmail or xlsxData!" });
  }

  let ParsedData: any[] = [];
  try {
    const parsed = JSON.parse(xlsxData);
    if (!Array.isArray(parsed)) {
      return res.status(400).json({ error: "xlsxData must be an array." });
    }
    ParsedData = parsed;
  } catch (err) {
    return res.status(400).json({ error: "Invalid xlsxData format." });
  }
  const normalizedData = ParsedData.map((row: any) => {
  const normalizedRow: Record<string, any> = {};
  for (const key in row) {
    normalizedRow[key.toLowerCase()] = row[key];
  }
  return normalizedRow;
});

  const result: { email: string; status: string }[] = []

  try {
    const transporter = await getTransporter(fromEmail);

    for (const row of normalizedData) {
      const toEmail = row.email;
      const name = row.name || "Sir/Ma'am";
      if (!toEmail) {
        result.push({ email: "N/A", status: "No email found" });
        continue;
      }
      const updatedText = updateText(text , name , user);
     const mailOptions: any = {
        from: fromEmail,
        to: toEmail,
        subject,
        text: updatedText,
      };

      if (files && files.length > 0) {
  mailOptions.attachments = files.map((file) => ({
    filename: file.originalname,
    path: file.path,
  }));
}

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${toEmail}`);
        result.push({ email: toEmail, status: "Sent" });
      } catch (sendErr) {
        console.error(`Failed to send email to ${toEmail}:`, sendErr);
        result.push({ email: toEmail, status: "Failed" });
      }
    }


    if (files && files.length > 0) {
  files.forEach((file) => {
    fs.unlink(file.path, (err) => {
      if (err) console.error("Failed to delete uploaded file:", err);
    });
  });
}

    console.log(result);
    res.status(200).json({ message: "Send process complete.", result });
  } catch (err) {
    console.error("Critical error:", err);
    res.status(500).json({ error: "Server error during sending." });
  }
};