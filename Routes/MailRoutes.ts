import express from "express";
import { uploadXlsx, upload } from "../Controllers/xlsxController"; 
import { userLogin } from "../Controllers/userLogin";
const { sendMail } = require("../Controllers/mailController");

const MailRouter = express.Router();


MailRouter.post("/sendmail", sendMail);
MailRouter.post("/userlogin", userLogin);
MailRouter.post("/upload", upload.single('file'), uploadXlsx); 

export default MailRouter;