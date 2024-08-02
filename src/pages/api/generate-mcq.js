// pages/api/generate-mcq.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import pdf from 'pdf-parse';

if (!process.env.GEMINI_API_KEY) throw new Error("No Gemini API key");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { pdfUrl } = req.body; // Extract the URL from the request body

      if (!pdfUrl) {
        return res.status(400).json({ message: "PDF URL not provided" });
      }

      // Fetch the PDF content
      const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
      const pdfData = await pdf(Buffer.from(pdfResponse.data));

      console.log("Extracted PDF Text:", pdfData.text);

      if (!pdfData.text || pdfData.text.trim().length === 0) {
        console.error("No text extracted from PDF.");
        return res.status(400).json({ message: "No text content found in the PDF" });
      }

      // Generate MCQs using the Gemini API
      const prompt = `From the provided text, generate 2 multiple choice questions with options and a correct answer in JSON format.\n${pdfData.text}`;
      const result = await model.generateContent(prompt);
      let generatedMCQs = result.response.text(); // Parse the response

      console.log("Raw response from model:", generatedMCQs);

      generatedMCQs = generatedMCQs.replace(/```json|```/g, '').trim();

      console.log("Cleaned response:", generatedMCQs);

      let mcqs;
      try {
        mcqs = JSON.parse(generatedMCQs);
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        return res.status(500).json({ message: "Failed to parse generated MCQs" });
      }

      return res.status(200).json(mcqs);
    } catch (error) {
      console.error("Error generating quiz:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
