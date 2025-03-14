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
  titleArabic: z.string().optional(),
  descriptionArabic: z.string().optional(),
});

// Define the schema for the full response with exactly three options
const MetadataResponseSchema = z.object({
  options: z.array(MetadataOption).length(3),
});

// Export TypeScript types for later use
export type MetadataOptionType = z.infer<typeof MetadataOption>;
export type MetadataResponseType = z.infer<typeof MetadataResponseSchema>;

export class EnhancedMetadataGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnhancedMetadataGenerationError';
  }
}

/**
 * Generates metadata for a dataset using the file content and basic file info
 *
 * @param fileStats - Basic file information including row count, columns, and file size
 * @param sampleData - Sample data from the file for context
 * @param fileContent - The content of the uploaded file as a string
 * @param language - The language for metadata generation ('en', 'ar', or 'both')
 * @returns A promise that resolves to three metadata options
 */
export const generateEnhancedMetadata = async (
  fileStats: FileStats,
  sampleData: any[],
  fileContent: string,
  language: 'en' | 'ar' | 'both' = 'en'
): Promise<MetadataResponseType> => {
  try {
    // Prepare a brief preview of the file content (first 1000 characters)
    const fileContentPreview = fileContent.slice(0, 1000);

    // Prepare a summary of basic file info
    const fileBasicInfo = `Filename: ${fileStats.filename}, Row Count: ${fileStats.rowCount}, Columns: ${fileStats.columns.join(
      ", "
    )}, File Size: ${fileStats.fileSize} bytes`;

    // Prepare sample data summary (first 5 rows)
    const sampleDataSummary = JSON.stringify(sampleData.slice(0, 5));

    // Build the prompt including instructions and context
    const userPrompt = `
You are an expert at generating metadata for datasets. Given the file content and basic file information provided below, please produce 3 distinct metadata options.
Each option must include:
- a title,
- a description,
- a list of tags (5-10 relevant keywords),
- a category suggestion.

${language === 'ar' || language === 'both' ? 
  'Also include Arabic translations for the title and description.' : ''}

Respond with a JSON object that exactly matches the following schema:

{
  "options": [
    {
      "title": "string",
      "description": "string",
      "tags": ["string"],
      "category": "string"${language === 'ar' || language === 'both' ? ',\n      "titleArabic": "string",\n      "descriptionArabic": "string"' : ''}
    },
    {
      "title": "string",
      "description": "string",
      "tags": ["string"],
      "category": "string"${language === 'ar' || language === 'both' ? ',\n      "titleArabic": "string",\n      "descriptionArabic": "string"' : ''}
    },
    {
      "title": "string",
      "description": "string",
      "tags": ["string"],
      "category": "string"${language === 'ar' || language === 'both' ? ',\n      "titleArabic": "string",\n      "descriptionArabic": "string"' : ''}
    }
  ]
}

File Basic Information: ${fileBasicInfo}
Sample Data: ${sampleDataSummary}
File Content Preview: ${fileContentPreview}
`;

    // If OpenAI API key is not available, use the fallback simulation
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. Using fallback simulation.');
      return simulateAIResponse(fileStats, language);
    }

    // Call the OpenAI API with Structured Outputs using our zod schema
    const completion = await openai.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert metadata generator for datasets.",
        },
        { role: "user", content: userPrompt },
      ],
      response_format: zodResponseFormat(MetadataResponseSchema, "metadata_response"),
    });

    // Return the parsed metadata options
    const metadataResponse = completion.choices[0].message.parsed;
    return metadataResponse;
  } catch (error) {
    console.error("Error generating metadata:", error);
    throw new EnhancedMetadataGenerationError("Metadata generation failed. Please try again.");
  }
};

/**
 * Fallback function to simulate AI response when OpenAI API is not available
 */
function simulateAIResponse(fileStats: FileStats, language: 'en' | 'ar' | 'both'): MetadataResponseType {
  const filename = fileStats.filename.replace(/\.\w+$/, '');
  const columnNames = fileStats.columns.join(', ');
  
  // Create three different metadata options with varying styles
  const options: MetadataOptionType[] = [
    {
      title: `${filename} Dataset`,
      description: `This dataset contains information about ${filename.toLowerCase()} with the following columns: ${columnNames}. It has ${fileStats.rowCount} records and provides valuable insights for research and analysis.`,
      tags: [...fileStats.columns.slice(0, 5), filename.toLowerCase(), 'data', 'research'],
      category: guessCategory(fileStats.columns, 1),
      ...(language === 'ar' || language === 'both' ? {
        titleArabic: `مجموعة بيانات ${filename}`,
        descriptionArabic: `تحتوي مجموعة البيانات هذه على معلومات حول ${filename.toLowerCase()} مع الأعمدة التالية: ${columnNames}. تحتوي على ${fileStats.rowCount} سجل وتوفر رؤى قيمة للبحث والتحليل.`
      } : {})
    },
    {
      title: `Comprehensive ${filename} Analysis Data`,
      description: `A detailed dataset focusing on ${filename.toLowerCase()} metrics. This collection includes ${fileStats.rowCount} entries with ${fileStats.columns.length} variables (${columnNames}), suitable for in-depth statistical analysis and visualization.`,
      tags: [...fileStats.columns.slice(0, 3), 'analysis', 'statistics', 'metrics', filename.toLowerCase(), 'data science'],
      category: guessCategory(fileStats.columns, 2),
      ...(language === 'ar' || language === 'both' ? {
        titleArabic: `بيانات تحليل ${filename} الشاملة`,
        descriptionArabic: `مجموعة بيانات مفصلة تركز على مقاييس ${filename.toLowerCase()}. تتضمن هذه المجموعة ${fileStats.rowCount} إدخالاً مع ${fileStats.columns.length} متغيرًا (${columnNames})، مناسبة للتحليل الإحصائي المتعمق والتصور.`
      } : {})
    },
    {
      title: `${filename} Research Collection`,
      description: `This research-oriented dataset provides ${fileStats.rowCount} records of ${filename.toLowerCase()} data. The dataset includes key variables such as ${fileStats.columns.slice(0, 3).join(', ')}, and more, making it ideal for exploratory data analysis and research projects.`,
      tags: [filename.toLowerCase(), 'research', 'collection', 'data analysis', ...fileStats.columns.slice(0, 4)],
      category: guessCategory(fileStats.columns, 3),
      ...(language === 'ar' || language === 'both' ? {
        titleArabic: `مجموعة أبحاث ${filename}`,
        descriptionArabic: `توفر مجموعة البيانات البحثية هذه ${fileStats.rowCount} سجلاً من بيانات ${filename.toLowerCase()}. تتضمن مجموعة البيانات متغيرات رئيسية مثل ${fileStats.columns.slice(0, 3).join(', ')}، وأكثر، مما يجعلها مثالية لتحليل البيانات الاستكشافية ومشاريع البحث.`
      } : {})
    }
  ];

  return { options };
}

/**
 * Helper function to guess a category based on column names and a seed value
 */
function guessCategory(columns: string[], seed: number): string {
  const columnStr = columns.join(' ').toLowerCase();
  const categories = [
    'Finance', 'People', 'Time Series', 'Geography', 'Products', 
    'Healthcare', 'Education', 'Research', 'Demographics', 'General'
  ];
  
  // Use deterministic category selection based on column content and seed
  if (columnStr.includes('price') || columnStr.includes('cost') || columnStr.includes('revenue')) {
    return 'Finance';
  } else if (columnStr.includes('name') || columnStr.includes('email') || columnStr.includes('phone')) {
    return 'People';
  } else if (columnStr.includes('date') || columnStr.includes('time') || columnStr.includes('year')) {
    return 'Time Series';
  } else if (columnStr.includes('country') || columnStr.includes('city') || columnStr.includes('location')) {
    return 'Geography';
  } else if (columnStr.includes('product') || columnStr.includes('item') || columnStr.includes('inventory')) {
    return 'Products';
  } else if (columnStr.includes('patient') || columnStr.includes('health') || columnStr.includes('medical')) {
    return 'Healthcare';
  } else if (columnStr.includes('student') || columnStr.includes('school') || columnStr.includes('education')) {
    return 'Education';
  } else {
    // If no specific category is detected, use the seed to select one
    return categories[(seed + columns.length) % categories.length];
  }
} 