import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { FileStats } from '@/lib/services/fileProcessingService';

// Initialize the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema for one metadata option in English
const MetadataOption = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  category: z.string(),
});

// Define the schema for one metadata option with Arabic support
const BilingualMetadataOption = MetadataOption.extend({
  titleArabic: z.string(),
  descriptionArabic: z.string(),
  tagsArabic: z.array(z.string()),
  categoryArabic: z.string(),
});

// Define the schema for the full response with exactly three options
const MetadataResponseSchema = z.object({
  options: z.array(MetadataOption).length(3),
});

// Define the schema for the full bilingual response with exactly three options
const BilingualMetadataResponseSchema = z.object({
  options: z.array(BilingualMetadataOption).length(3),
});

// Export TypeScript types for later use if needed
export type MetadataOptionType = z.infer<typeof MetadataOption>;
export type BilingualMetadataOptionType = z.infer<typeof BilingualMetadataOption>;
export type MetadataResponseType = z.infer<typeof MetadataResponseSchema>;
export type BilingualMetadataResponseType = z.infer<typeof BilingualMetadataResponseSchema>;

// Define the type for a single metadata option that has been selected for editing
export interface GeneratedMetadata {
  title: string;
  titleArabic?: string;
  description: string;
  descriptionArabic?: string;
  tags: string[];
  tagsArabic?: string[];
  category: string;
  categoryArabic?: string;
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
): Promise<MetadataResponseType | BilingualMetadataResponseType> => {
  // Prepare a brief preview of the file content (first 1000 characters)
  const fileContentPreview = fileContent.slice(0, 1000);
  
  // Prepare a summary of basic file info
  const fileBasicInfo = `Filename: ${fileInfo.filename}, Row Count: ${fileInfo.rowCount}, Columns: ${fileInfo.columns.join(", ")}, File Size: ${fileInfo.fileSize} bytes`;

  // Define the response schema based on the language option
  let schemaExample = '';
  let languageInstructions = '';
  
  if (language === 'en') {
    schemaExample = `{
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
}`;
    languageInstructions = "Generate all metadata in English only.";
  } else if (language === 'ar') {
    schemaExample = `{
  "options": [
    {
      "title": "string (in Arabic)",
      "description": "string (in Arabic)",
      "tags": ["string (in Arabic)"],
      "category": "string (in Arabic)"
    },
    {
      "title": "string (in Arabic)",
      "description": "string (in Arabic)",
      "tags": ["string (in Arabic)"],
      "category": "string (in Arabic)"
    },
    {
      "title": "string (in Arabic)",
      "description": "string (in Arabic)",
      "tags": ["string (in Arabic)"],
      "category": "string (in Arabic)"
    }
  ]
}`;
    languageInstructions = "Generate all metadata in Arabic only. Ensure that all text including titles, descriptions, tags, and categories are in Arabic.";
  } else if (language === 'both') {
    schemaExample = `{
  "options": [
    {
      "title": "string (in English)",
      "titleArabic": "string (in Arabic)",
      "description": "string (in English)",
      "descriptionArabic": "string (in Arabic)",
      "tags": ["string (in English)"],
      "tagsArabic": ["string (in Arabic)"],
      "category": "string (in English)",
      "categoryArabic": "string (in Arabic)"
    },
    {
      "title": "string (in English)",
      "titleArabic": "string (in Arabic)",
      "description": "string (in English)",
      "descriptionArabic": "string (in Arabic)",
      "tags": ["string (in English)"],
      "tagsArabic": ["string (in Arabic)"],
      "category": "string (in English)",
      "categoryArabic": "string (in Arabic)"
    },
    {
      "title": "string (in English)",
      "titleArabic": "string (in Arabic)",
      "description": "string (in English)",
      "descriptionArabic": "string (in Arabic)",
      "tags": ["string (in English)"],
      "tagsArabic": ["string (in Arabic)"],
      "category": "string (in English)",
      "categoryArabic": "string (in Arabic)"
    }
  ]
}`;
    languageInstructions = "Generate metadata in both English and Arabic. Provide English versions in the 'title', 'description', 'tags', and 'category' fields, and Arabic translations in the 'titleArabic', 'descriptionArabic', 'tagsArabic', and 'categoryArabic' fields.";
  }

  // Build the prompt including enhanced instructions and context.
  const userPrompt = `
You are a highly experienced metadata generator for datasets. Analyze the provided file content and basic file information carefully, and produce 3 distinct metadata options that are comprehensive and detailed.

${languageInstructions}

For each metadata option, ensure you generate:
- A compelling and accurate title that reflects the essence of the dataset.
- A comprehensive, detailed description that fully explains the dataset’s content.
- A list of up to 10 highly relevant tags. If the file content is extensive, include more tags to capture all key aspects.
- A well-considered category suggestion.

Respond with a JSON object that exactly matches the following schema:

${schemaExample}

File Basic Information: ${fileBasicInfo}
File Content Preview: ${fileContentPreview}
  `;

  try {
    // Call the OpenAI API using the create method with the o3-mini model
    const completion = await openai.chat.completions.create({
      model: "o3-mini",
      messages: [
        {
          role: "system",
          content: "You are a highly experienced metadata generator for datasets. Your task is to analyze the provided file content and basic file details to generate comprehensive metadata. Your output must include a compelling title, a detailed and thorough description, up to 10 relevant tags, and an appropriate category suggestion. Ensure that your metadata is accurate, engaging, and reflective of the dataset content.",
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
      
      // Validate based on language option
      if (language === 'both') {
        const validatedResponse = BilingualMetadataResponseSchema.parse(parsedContent);
        return validatedResponse;
      } else {
        const validatedResponse = MetadataResponseSchema.parse(parsedContent);
        return validatedResponse;
      }
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      throw new MetadataGenerationError("Failed to parse metadata from AI response");
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
    throw new MetadataGenerationError("Metadata generation failed.");
  }
};
