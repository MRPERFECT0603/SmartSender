import express from "express";
import { uploadXlsx, upload as memoryUpload } from "../Controllers/xlsxController";
import multer from 'multer';
import { userLogin, saveProfile } from "../Controllers/userLogin";
import { sendMail, getSentEmails } from "../Controllers/mailController";
import { scheduleEmail, getScheduledEmails, cancelScheduledEmail } from "../Controllers/schedulingController";

const MailRouter = express.Router();
const diskUpload = multer({ dest: 'uploads/' });

MailRouter.post("/upload", memoryUpload.array('files'), uploadXlsx);

MailRouter.post("/sendmail", diskUpload.array("attachments"), sendMail);

// Scheduling routes
MailRouter.post("/schedule", diskUpload.array("attachments"), scheduleEmail);
MailRouter.get("/scheduled", getScheduledEmails);
MailRouter.delete("/scheduled/:emailId", cancelScheduledEmail);

// Sent emails history
MailRouter.get("/sent-emails", getSentEmails);

// User authentication and profile
MailRouter.post("/userlogin", userLogin);
MailRouter.post("/userlogin/profile", saveProfile);

export default MailRouter;