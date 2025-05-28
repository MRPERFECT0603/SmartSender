import multer from "multer";
import { Request, Response } from "express";
import { Express } from "express";
const xlsx = require("xlsx");

const storage = multer.memoryStorage();
export const upload = multer({ storage });
export const uploadXlsx = (req: Request, res: Response): void => {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
  
      const workbook = xlsx.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
  
      res.json(jsonData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to process the uploaded file" });
    }
  };