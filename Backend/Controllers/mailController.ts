// controllers/emailController.ts
import { Request, Response } from "express";
import { getTransporter } from "./transporterManager";

export const sendMail = async (req: Request, res: Response) => {
  const { fromEmail, xlsxData, subject, text } = req.body;

  if (!fromEmail || !xlsxData || !Array.isArray(xlsxData)) {
    return res.status(400).json({ error: "Missing fromEmail or xlsxData!" });
  }

  const result: { email: string; status: string }[] = []

  try {
    const transporter = await getTransporter(fromEmail);

    for (const row of xlsxData) {
      const toEmail = row.email;
      if (!toEmail) {
        result.push({ email: "N/A", status: "❌ No email found" });
        continue;
      }

      try {
        await transporter.sendMail({
          from: fromEmail,
          to: toEmail,
          subject,
          text,
        });
        console.log(`✅ Email sent to ${toEmail}`);
        result.push({ email: toEmail, status: "✅ Sent" });
      } catch (sendErr) {
        console.error(`❌ Failed to send email to ${toEmail}:`, sendErr);
        result.push({ email: toEmail, status: "❌ Failed" });
      }
    }

    res.status(200).json({ message: "Send process complete.", result });
  } catch (err) {
    console.error("❌ Critical error:", err);
    res.status(500).json({ error: "Server error during sending." });
  }
};