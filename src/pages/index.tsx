import Image from "next/image";
import Head from "next/head";
import GenerateMCQButton from '../components/GenerateMCQButton';

export default function Home() {
  const pdfUrl = "https://delhiplanning.delhi.gov.in/sites/default/files/english_compressed_1.pdf";

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Generate MCQs with Generative AI Gemini</title>
        <meta name="description" content="Generate multiple choice questions using Generative AI Gemini" />
      </Head>
      <h1 className="text-2xl font-bold mb-4">Generate MCQs with Generative AI Gemini</h1>
      <GenerateMCQButton pdfUrl={pdfUrl} />
    </div>
  );
}

