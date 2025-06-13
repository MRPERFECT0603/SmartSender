import express from "express";
import { uploadXlsx, upload as memoryUpload } from "../Controllers/xlsxController";
import multer from 'multer';
import { userLogin } from "../Controllers/userLogin";
const { sendMail } = require("../Controllers/mailController");

const MailRouter = express.Router();
const diskUpload = multer({ dest: 'uploads/' });

MailRouter.post("/upload", memoryUpload.array('files'), uploadXlsx);

MailRouter.post("/sendmail", diskUpload.array("attachments"), sendMail);

MailRouter.post("/userlogin", userLogin);

export default MailRouter;