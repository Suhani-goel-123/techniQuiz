// pages/api/generate-mcq.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import pdf from 'pdf-parse';

if (!process.env.GEMINI_API_KEY) throw new Error("No Gemini API key");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const pdfUrl = "https://www.rsb.org.uk/images/15_Photosynthesis.pdf";

export async function POST(req) {
  try {
    if (!pdfUrl) {
      return NextResponse.json({ message: "PDF URL not provided" }, { status: 400 });
    }

    // Fetch the PDF content
    const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const pdfData = await pdf(Buffer.from(pdfResponse.data));

    // Log the extracted text content
    console.log("Extracted PDF Text:", pdfData.text);

    // Ensure that some content is present
    if (!pdfData.text || pdfData.text.trim().length === 0) {
      console.error("No text extracted from PDF.");
      return NextResponse.json({ message: "No text content found in the PDF" }, { status: 400 });
    }

    // Generate MCQs using the Gemini API
    const prompt = `From the provided text, generate 10 multiple choice questions with options and a correct answer in JSON format.\n${pdfData.text}`;
    const result = await model.generateContent(prompt);
    let generatedMCQs = result.response.text(); // Parse the response

    // Debug log the raw response
    console.log("Raw response from model:", generatedMCQs);

    // Clean the response text to ensure it's valid JSON
    generatedMCQs = generatedMCQs.replace(/```json|```/g, '').trim();

    // Debug log the cleaned response
    console.log("Cleaned response:", generatedMCQs);

    let mcqs;
    try {
      mcqs = JSON.parse(generatedMCQs);
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
      return NextResponse.json({ message: "Failed to parse generated MCQs" }, { status: 500 });
    }

    return NextResponse.json(mcqs);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await POST(req).then((response) => {
      res.status(response.status).json(response.body);
    }).catch((error) => {
      console.error("Error in handler:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
