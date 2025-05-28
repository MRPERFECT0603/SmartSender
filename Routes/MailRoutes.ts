import express from "express";
import { getTransporterAPI } from "../Controllers/transporterManager";

const MailRouter = express.Router();

const {sendMail} = require("../Controllers/mailController");


MailRouter.post("/sendMail" , sendMail);
MailRouter.post("/userLogin" , getTransporterAPI);


 
export default MailRouter;