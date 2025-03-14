import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { FileStats } from '@/lib/services/fileProcessingService';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

// Define schema for a single metadata option
const metadataOptionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  category: z.string().min(1, "Category is required"),
  arabicTitle: z.string().optional(),
  arabicDescription: z.string().optional(),
});

// Define schema for the full response (requiring exactly 3 options)
const metadataResponseSchema = z.array(metadataOptionSchema).length(3);

// Export types for later use
export type MetadataOptionType = z.infer<typeof metadataOptionSchema>;
export type MetadataResponseType = z.infer<typeof metadataResponseSchema>;

// Error class for metadata generation
export class MetadataGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MetadataGenerationError";
  }
}

/**
 * Generate enhanced metadata for a dataset using OpenAI
 */
export async function generateEnhancedMetadata({
  fileStats,
  sampleData,
  fileContent,
  language = 'en'
}: {
  fileStats: {
    name: string;
    size: number;
    rowCount: number;
    columns: string[];
  };
  sampleData?: string[][];
  fileContent?: string;
  language?: 'en' | 'ar';
}): Promise<MetadataResponseType> {
  try {
    // If OpenAI API key is not available, use the simulation function
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not available, using simulation");
      return simulateAIResponse(fileStats, language);
    }

    // Prepare a preview of the file content
    const contentPreview = fileContent 
      ? fileContent.substring(0, 2000) + (fileContent.length > 2000 ? '...' : '')
      : '';

    // Prepare sample data for the prompt
    const sampleDataString = sampleData 
      ? sampleData.slice(0, 5).map(row => row.join(', ')).join('\n')
      : '';

    // Create a user prompt
    const userPrompt = `
      I have a dataset with the following information:
      - Filename: ${fileStats.name}
      - Number of rows: ${fileStats.rowCount}
      - Columns: ${fileStats.columns.join(', ')}
      - File size: ${Math.round(fileStats.size / 1024)} KB

      ${contentPreview ? `Here's a preview of the file content:\n${contentPreview}` : ''}
      ${sampleDataString ? `Here's a sample of the data:\n${sampleDataString}` : ''}

      Please generate three distinct metadata options for this dataset. Each option should have a different style or focus.
      ${language === 'ar' ? 'Please include Arabic translations for the title and description.' : ''}
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "system",
          content: `You are a data scientist specializing in metadata generation for datasets. 
          Generate three distinct metadata options for the dataset described. 
          Each option should have a different style or focus (e.g., academic, business, educational).
          For each option, provide a title, description, relevant tags (at least 3), and a category.
          ${language === 'ar' ? 'Include Arabic translations for the title and description.' : ''}
          
          Format your response as a valid JSON array with exactly 3 objects, each with the following structure:
          {
            "title": "Dataset Title",
            "description": "A detailed description of the dataset",
            "tags": ["tag1", "tag2", "tag3"],
            "category": "Category Name",
            ${language === 'ar' ? '"arabicTitle": "عنوان مجموعة البيانات", "arabicDescription": "وصف تفصيلي لمجموعة البيانات"' : ''}
          }`
        },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new MetadataGenerationError("No content received from OpenAI");
    }

    try {
      const parsedContent = JSON.parse(content);
      const options = parsedContent.options || parsedContent;
      
      // Validate the response against our schema
      const validatedOptions = metadataResponseSchema.parse(
        Array.isArray(options) ? options : [options]
      );
      
      return validatedOptions;
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      throw new MetadataGenerationError("Failed to parse metadata from AI response");
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
    if (error instanceof MetadataGenerationError) {
      throw error;
    }
    throw new MetadataGenerationError("Failed to generate metadata");
  }
}

/**
 * Simulate AI response for development or when OpenAI API is not available
 */
function simulateAIResponse(
  fileStats: { name: string; size: number; rowCount: number; columns: string[] },
  language: 'en' | 'ar' = 'en'
): MetadataResponseType {
  // Try to guess the category based on column names
  const columnString = fileStats.columns.join(' ').toLowerCase();
  let guessedCategory = "General";
  
  if (columnString.includes('patient') || columnString.includes('diagnosis') || columnString.includes('hospital')) {
    guessedCategory = "Healthcare";
  } else if (columnString.includes('student') || columnString.includes('school') || columnString.includes('grade')) {
    guessedCategory = "Education";
  } else if (columnString.includes('price') || columnString.includes('sales') || columnString.includes('revenue')) {
    guessedCategory = "Business";
  } else if (columnString.includes('temperature') || columnString.includes('weather') || columnString.includes('climate')) {
    guessedCategory = "Climate";
  } else if (columnString.includes('species') || columnString.includes('habitat') || columnString.includes('animal')) {
    guessedCategory = "Biology";
  }

  // Create three distinct metadata options
  const options: MetadataResponseType = [
    {
      title: `${fileStats.name.split('.')[0]} Analysis Dataset`,
      description: `A comprehensive dataset containing ${fileStats.rowCount} records with ${fileStats.columns.length} variables including ${fileStats.columns.slice(0, 3).join(', ')}${fileStats.columns.length > 3 ? ' and more' : ''}. This dataset is suitable for academic research and statistical analysis.`,
      tags: ["research", "statistics", "analysis", fileStats.name.split('.')[0].toLowerCase()],
      category: guessedCategory,
      ...(language === 'ar' ? {
        arabicTitle: `مجموعة بيانات تحليل ${fileStats.name.split('.')[0]}`,
        arabicDescription: `مجموعة بيانات شاملة تحتوي على ${fileStats.rowCount} سجل مع ${fileStats.columns.length} متغير بما في ذلك ${fileStats.columns.slice(0, 3).join(', ')}${fileStats.columns.length > 3 ? ' والمزيد' : ''}. هذه المجموعة مناسبة للبحث الأكاديمي والتحليل الإحصائي.`
      } : {})
    },
    {
      title: `${guessedCategory} Insights: ${fileStats.name.split('.')[0]}`,
      description: `This dataset provides valuable insights into ${guessedCategory.toLowerCase()} trends and patterns. With ${fileStats.rowCount} entries and key metrics such as ${fileStats.columns.slice(0, 4).join(', ')}, it's an essential resource for data-driven decision making.`,
      tags: [guessedCategory.toLowerCase(), "insights", "data-driven", "trends"],
      category: guessedCategory,
      ...(language === 'ar' ? {
        arabicTitle: `رؤى ${guessedCategory}: ${fileStats.name.split('.')[0]}`,
        arabicDescription: `توفر مجموعة البيانات هذه رؤى قيمة حول اتجاهات وأنماط ${guessedCategory.toLowerCase()}. مع ${fileStats.rowCount} إدخال ومقاييس رئيسية مثل ${fileStats.columns.slice(0, 4).join(', ')}، إنها مورد أساسي لاتخاذ القرارات المستندة إلى البيانات.`
      } : {})
    },
    {
      title: `Educational ${fileStats.name.split('.')[0]} Dataset`,
      description: `A curated dataset designed for educational purposes, featuring ${fileStats.columns.length} key variables across ${fileStats.rowCount} observations. Perfect for students and educators looking to practice data analysis and visualization techniques.`,
      tags: ["education", "learning", "practice", "visualization"],
      category: "Education",
      ...(language === 'ar' ? {
        arabicTitle: `مجموعة بيانات ${fileStats.name.split('.')[0]} التعليمية`,
        arabicDescription: `مجموعة بيانات منسقة مصممة للأغراض التعليمية، تضم ${fileStats.columns.length} متغيرًا رئيسيًا عبر ${fileStats.rowCount} ملاحظة. مثالية للطلاب والمعلمين الراغبين في ممارسة تقنيات تحليل البيانات والتصور.`
      } : {})
    }
  ];

  return options;
} 