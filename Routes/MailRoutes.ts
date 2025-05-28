import express from "express";
import { getTransporterAPI } from "../Controllers/transporterManager";
import { uploadXlsx, upload } from "../Controllers/xlsxController"; 

const MailRouter = express.Router();

const { sendMail } = require("../Controllers/mailController");

MailRouter.post("/sendMail", sendMail);
MailRouter.post("/userLogin", getTransporterAPI);
MailRouter.post("/upload", upload.single('file'), uploadXlsx); 

export default MailRouter;