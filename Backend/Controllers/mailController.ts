// controllers/emailController.ts
import { Request, Response } from "express";
import { getTransporter } from "./transporterManager";
import multer from "multer";
import path from "path";
import fs from "fs";
import { console } from "inspector/promises";
import { normalizeXlsxData } from '../Services/normalizeHelper'
import { EmailService } from '../Services/emailService';

export const updateText = (
  name: string,
  company: string,
  contact: string,
  linkedIn?: string
) => {
  const html = `
    <p>Hi ${name},</p>
    <p>I hope you’re doing well.</p>
    
    <p>I’m Naman Gupta, currently working as a Backend Developer at Zopsmart Technologies. 
    My experience includes working with Spring Boot, Kafka, Docker, and Kubernetes, 
    along with building CI/CD workflows using GitHub Actions and Helm for deploying microservices.</p>
    
    <p>I am currently exploring new opportunities and wanted to check if there are any 
    SDE-1 backend openings at ${company}. 
    If you find my profile relevant, I would be grateful if you could consider referring me for a suitable role.</p>
    
    <p>Thank you for your time and consideration! I truly appreciate any help you can provide.</p>
    
    <p>Resume: Attached Below</p>
    
    <p>Warm Regards,<br>
    Naman Gupta<br>
    Contact: +91${contact}<br>
    ${linkedIn ? `LinkedIn Profile: <a href="${linkedIn}" target="_blank">${linkedIn}</a>` : ''}
    </p>
  `;

  return html;
};

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

export const sendMail = async (req: Request, res: Response) => {
  const { user, fromEmail, xlsxData, subject, text, linkenIn, contact, company } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!fromEmail || !xlsxData) {
    return res.status(400).json({ error: "Missing fromEmail or xlsxData!" });
  }

  let parsedData: any[] = [];
  try {
    parsedData = JSON.parse(xlsxData);
    if (!Array.isArray(parsedData)) {
      return res.status(400).json({ error: "xlsxData must be an array." });
    }
  } catch (err) {
    return res.status(400).json({ error: "Invalid xlsxData format." });
  }

  const normalizedData = normalizeXlsxData(parsedData);
  const emailService = new EmailService();
  const companyCap = capitalizeFirst(company);

  try {
    const result = await emailService.sendBulkMails({
      fromEmail,
      normalizedData,
      files,
      user,
      subject: updateSubject(companyCap),
      text: updateText(capitalizeFirst(user), companyCap, contact, linkenIn),
      linkenIn,
      contact
    });
    console.log(result);
    res.status(200).json({ message: "Send process complete.", result });
  } catch (err) {
    console.error("Critical error:", err);
    res.status(500).json({ error: "Server error during sending." });
  }
};