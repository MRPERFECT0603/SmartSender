// controllers/emailController.ts
import { Request, Response } from "express";
import { console } from "inspector/promises";
<<<<<<< Updated upstream
=======
import { normalizeXlsxData } from '../Services/normalizeHelper'
import { EmailService } from '../Services/emailService';
import { EmailDraft } from '../Models/emailDraftModel';
>>>>>>> Stashed changes

const updateText = (text: string, name: string, user: string, contact: string, linkenIn?: string ) => {  
  const html = `
<<<<<<< Updated upstream
    <p>Dear ${name},</p>
    <p>${text.replace(/\n/g, '<br>')}</p>
    <p>Best Regards,<br>${user}
    <br>Contact No.${contact}<br>
    ${linkenIn
      ? `Connect with me on <a href="${linkenIn}" target="_blank">LinkedIn</a>.`
      : ''
    }
=======
    <p>Hi ${name},</p>
    <p>I hope you’re doing well.</p>
    
    <p>I’m Naman Gupta, currently working as a Backend Developer at <strong>Zopsmart Technologies</strong>. 
    My experience includes working with <strong>Spring Boot, Kafka, Docker, and Kubernetes</strong>, 
    along with building CI/CD workflows using <strong>GitHub Actions and Helm</strong> for deploying microservices.</p>
    
    <p>I am currently exploring new opportunities and wanted to check if there are any 
    <strong>SDE-1 backend</strong> openings at <strong>${company}</strong>. 
    If you find my profile relevant, I would be grateful if you could consider referring me for a suitable role.</p>
    
    <p>Thank you for your time and consideration! I truly appreciate any help you can provide.</p>
    
    <p>Resume: Attached Below</p>
    
    <p>Warm Regards,<br>
    Naman Gupta<br>
    Contact: +91${contact}<br>
    ${linkedIn ? `LinkedIn Profile: <a href="${linkedIn}" target="_blank">${linkedIn}</a>` : ''}
>>>>>>> Stashed changes
    </p>
  `;

  return html ;
};

<<<<<<< Updated upstream
export const sendMail = async (req: Request, res: Response) => {
  const { user, fromEmail, xlsxData, subject, text , linkenIn , contact } = req.body;
=======
export const updateSubject = (
  company: string,
  role: string = "SDE-1 Backend",
  experience: string = "1+ YOE",
  skills: string = "Java | Spring Boot | Microservices"
) => {
  return `Looking for ${role} Opportunities at ${company} | ${experience} | ${skills}`;
};

function capitalizeFirst(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const sendMail = async (req: Request, res: Response): Promise<void> => {
  const { user, fromEmail, xlsxData, subject, text, linkenIn, contact, company } = req.body;
>>>>>>> Stashed changes
  const files = req.files as Express.Multer.File[];
  console.log(linkenIn);

  if (!fromEmail || !xlsxData) {
    res.status(400).json({ error: "Missing fromEmail or xlsxData!" });
    return;
  }

  let ParsedData: any[] = [];
  try {
<<<<<<< Updated upstream
    const parsed = JSON.parse(xlsxData);
    if (!Array.isArray(parsed)) {
      return res.status(400).json({ error: "xlsxData must be an array." });
=======
    parsedData = JSON.parse(xlsxData);
    if (!Array.isArray(parsedData)) {
      res.status(400).json({ error: "xlsxData must be an array." });
      return;
>>>>>>> Stashed changes
    }
    ParsedData = parsed;
  } catch (err) {
    res.status(400).json({ error: "Invalid xlsxData format." });
    return;
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
      const htmlText = updateText(text, name, user, contact, linkenIn);

      const mailOptions: any = {
        from: fromEmail,
        to: toEmail,
        subject,
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

export const saveDraft = async (req: Request, res: Response) => {
  const { fromEmail, toEmail, subject, body, attachments } = req.body;
  try {
    const draft = await EmailDraft.create({ fromEmail, toEmail, subject, body, attachments });
    return res.status(201).json({ message: 'Draft saved', draft });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save draft' });
  }
};

export const sendDraft = async (req: Request, res: Response) => {
  const { draftId } = req.body;
  try {
    const draft = await EmailDraft.findById(draftId);
    if (!draft) return res.status(404).json({ error: 'Draft not found' });
    const emailService = new EmailService();
    await emailService.sendBulkMails({
      fromEmail: draft.fromEmail,
      normalizedData: [{ email: draft.toEmail, name: '', company: '', contact: '' }],
      files: [],
      user: '',
      subject: draft.subject,
      text: draft.body,
      linkenIn: '',
      contact: ''
    });
    draft.status = 'sent';
    await draft.save();
    return res.json({ message: 'Email sent', draft });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
};

// Get sent emails history
export const getSentEmails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fromEmail } = req.query;
    
    if (!fromEmail) {
      res.status(400).json({ error: 'fromEmail is required' });
      return;
    }

    // For now, we'll return an empty array since we need to implement email history tracking
    // In a real implementation, you would query a database table that stores sent email history
    const sentEmails: any[] = [];
    
    res.json({ emails: sentEmails });
  } catch (error) {
    console.error('Error fetching sent emails:', error);
    res.status(500).json({ error: 'Failed to fetch sent emails' });
  }
};