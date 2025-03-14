import axios from 'axios';
import { FileStats } from '@/components/upload/FileUpload';

export type GeneratedMetadata = {
  title: string;
  titleArabic?: string;
  description: string;
  descriptionArabic?: string;
  tags: string[];
  category: string;
};

export class MetadataGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MetadataGenerationError';
  }
}

export async function generateMetadata(
  fileStats: FileStats,
  sampleData: any[],
  language: 'en' | 'ar' | 'both' = 'en'
): Promise<GeneratedMetadata> {
  try {
    // In a real application, this would call an AI API like OpenAI
    // For this example, we'll simulate the AI response
    
    // Normally, you would do something like:
    // const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    //   model: 'gpt-4',
    //   messages: [
    //     { role: 'system', content: 'You are a helpful assistant that generates metadata for datasets.' },
    //     { role: 'user', content: `Generate metadata for a dataset with the following properties:
    //       Filename: ${fileStats.filename}
    //       Columns: ${fileStats.columns.join(', ')}
    //       Sample data: ${JSON.stringify(sampleData.slice(0, 5))}
    //       Generate in language: ${language}` 
    //     }
    //   ]
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    
    // For this example, we'll simulate the AI response
    const simulateAIResponse = (): GeneratedMetadata => {
      const filename = fileStats.filename.replace(/\.\w+$/, '');
      const columnNames = fileStats.columns.join(', ');
      
      // Basic metadata in English
      const metadata: GeneratedMetadata = {
        title: `${filename} Dataset`,
        description: `This dataset contains information about ${filename.toLowerCase()} with the following columns: ${columnNames}. It has ${fileStats.rowCount} records.`,
        tags: [...fileStats.columns.slice(0, 5), filename.toLowerCase()],
        category: guessCategory(fileStats.columns)
      };
      
      // Add Arabic translations if requested
      if (language === 'ar' || language === 'both') {
        metadata.titleArabic = `مجموعة بيانات ${filename}`;
        metadata.descriptionArabic = `تحتوي مجموعة البيانات هذه على معلومات حول ${filename.toLowerCase()} مع الأعمدة التالية: ${columnNames}. تحتوي على ${fileStats.rowCount} سجل.`;
      }
      
      return metadata;
    };
    
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return simulateAIResponse();
  } catch (error) {
    console.error('Error generating metadata:', error);
    throw new MetadataGenerationError('Failed to generate metadata. Please try again.');
  }
}

// Helper function to guess a category based on column names
function guessCategory(columns: string[]): string {
  const columnStr = columns.join(' ').toLowerCase();
  
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
  } else {
    return 'General';
  }
} 