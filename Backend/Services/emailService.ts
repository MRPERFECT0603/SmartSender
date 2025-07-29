import { getTransporter } from "../Controllers/transporterManager";
import { updateSubject, updateText } from "../Controllers/mailController";
import fs from "fs";

interface SendBulkMailsParams {
  fromEmail: string;
  normalizedData: any[];
  files: Express.Multer.File[];
  user: string;
  subject: string;
  text: string;
  linkenIn: string;
  contact: string;
}

export class EmailService {
  async sendBulkMails({ fromEmail, normalizedData, files, user, subject, text, linkenIn, contact }: SendBulkMailsParams) {
    const result: { email: string; status: string }[] = [];
    const transporter = await getTransporter(fromEmail);

    for (const row of normalizedData) {
      const toEmail = row.email;
      const name = row.name || "Sir/Ma'am";
      const company = row.company;
      if (!toEmail) {
        result.push({ email: "N/A", status: "No email found" });
        continue;
      }
      const mailTitle = updateSubject(company);
      const htmlText = updateText(name, company, contact, linkenIn);

      const mailOptions: any = {
        from: fromEmail,
        to: toEmail,
        subject: mailTitle,
        html: htmlText,
      };

      if (files && files.length > 0) {
        mailOptions.attachments = files.map((file) => ({
          filename: file.originalname,
          path: file.path,
        }));
      }

      try {
        await transporter.sendMail(mailOptions);
        result.push({ email: toEmail, status: "Sent" });
      } catch (sendErr) {
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

    return result;
  }
} 