import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { FileStats } from '@/lib/services/fileProcessingService';

// Initialize the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema for one metadata option
const MetadataOption = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  category: z.string(),
});

// Define the schema for the full response with exactly three options
const MetadataResponseSchema = z.object({
  options: z.array(MetadataOption).length(3),
});

// Export TypeScript types for later use if needed
export type MetadataOptionType = z.infer<typeof MetadataOption>;
export type MetadataResponseType = z.infer<typeof MetadataResponseSchema>;

// Define the type for a single metadata option that has been selected for editing
export interface GeneratedMetadata {
  title: string;
  titleArabic?: string;
  description: string;
  descriptionArabic?: string;
  tags: string[];
  category: string;
}

// Custom error to be thrown when metadata generation fails
export class MetadataGenerationError extends Error {}

/**
 * Generates metadata for a dataset using the file content and basic file info.
 *
 * @param fileInfo - Basic file information including filename, row count, columns, and file size
 * @param sampleData - The sample data extracted from the file (not used directly in prompt)
 * @param fileContent - The content of the file as a string
 * @param language - The language option: 'en', 'ar', or 'both'
 * @returns A promise that resolves to three metadata options
 */
export const generateMetadata = async (
  fileInfo: { filename: string; rowCount: number; columns: string[]; fileSize: number },
  sampleData: any[],
  fileContent: string,
  language: 'en' | 'ar' | 'both'
): Promise<MetadataResponseType> => {
  // Prepare a brief preview of the file content (first 1000 characters)
  const fileContentPreview = fileContent.slice(0, 1000);
  
  // Prepare a summary of basic file info
  const fileBasicInfo = `Filename: ${fileInfo.filename}, Row Count: ${fileInfo.rowCount}, Columns: ${fileInfo.columns.join(", ")}, File Size: ${fileInfo.fileSize} bytes`;

  // Build the prompt including instructions and context.
  const userPrompt = `
You are an expert at generating metadata for datasets. Given the file content and basic file information provided below, please produce 3 distinct metadata options.
Each option must include:
- a title,
- a description,
- a list of tags,
- a category suggestion.

Respond with a JSON object that exactly matches the following schema:

{
  "options": [
    {
      "title": "string",
      "description": "string",
      "tags": ["string"],
      "category": "string"
    },
    {
      "title": "string",
      "description": "string",
      "tags": ["string"],
      "category": "string"
    },
    {
      "title": "string",
      "description": "string",
      "tags": ["string"],
      "category": "string"
    }
  ]
}

File Basic Information: ${fileBasicInfo}
File Content Preview: ${fileContentPreview}
Language: ${language}
  `;

  try {
    // Call the OpenAI API using the create method
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: "You are an expert metadata generator for datasets.",
        },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" }
    });

    // Extract and validate the response
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new MetadataGenerationError("No content received from OpenAI");
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
      const validatedResponse = MetadataResponseSchema.parse(parsedContent);
      return validatedResponse;
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      throw new MetadataGenerationError("Failed to parse metadata from AI response");
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
    throw new MetadataGenerationError("Metadata generation failed.");
  }
}; 