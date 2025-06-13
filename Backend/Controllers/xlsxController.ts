import multer from "multer";
import { Request, Response } from "express";
import { Express } from "express";
const xlsx = require("xlsx");

// Store files in memory
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Handle multiple file uploads
export const uploadXlsx = (req: Request, res: Response): void => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    const allData: any[] = [];

    files.forEach((file) => {
      const workbook = xlsx.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);

      allData.push(...jsonData); 
    });

    res.json(allData); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process the uploaded files" });
  }
};