import { useState } from "react";
import Head from "next/head";
import GenerateMCQButton from '../components/GenerateMCQButton';

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState("");

  const handleUrlChange = (event) => {
    setPdfUrl(event.target.value);
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Techni-Quiz</title>
        <meta name="description" content="Generate multiple choice questions using Generative AI Gemini" />
      </Head>
      <h1 className="text-xl font-semibold mb-4 text-center">Techni-Quiz</h1>
      <h2 className="text-xl font-semibold mb-4 text-center"> One stop solution to MCQ generation</h2>
      <div className="mb-4">
        <input
          type="text"
          value={pdfUrl}
          onChange={handleUrlChange}
          placeholder="Enter PDF URL here"
          className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <GenerateMCQButton pdfUrl={pdfUrl} />
    </div>
  );
}
