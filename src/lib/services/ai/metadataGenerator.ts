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
  language: 'en' | 'ar' | 'both' = 'en',
  fileContent?: string // Optional file content for better analysis
): Promise<GeneratedMetadata> {
  try {
    // In a real application, this would call an AI API like OpenAI
    // For this example, we'll simulate the AI response
    
    // Normally, you would do something like:
    // const prompt = `Generate metadata for a dataset with the following properties:
    //   Filename: ${fileStats.filename}
    //   Columns: ${fileStats.columns.join(', ')}
    //   Sample data: ${JSON.stringify(sampleData.slice(0, 5))}
    //   ${fileContent ? `File content preview: ${fileContent.slice(0, 1000)}...` : ''}
    //   Generate in language: ${language}`;
    //
    // const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    //   model: 'gpt-4',
    //   messages: [
    //     { role: 'system', content: 'You are a helpful assistant that generates metadata for datasets.' },
    //     { role: 'user', content: prompt }
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
      
      // Use file content to enhance description if available
      let enhancedDescription = `This dataset contains information about ${filename.toLowerCase()} with the following columns: ${columnNames}. It has ${fileStats.rowCount} records.`;
      
      if (fileContent && fileContent.length > 0) {
        // In a real AI implementation, the model would analyze the content
        // Here we'll just add a note that we have the content
        enhancedDescription += ` The data appears to be ${guessDataType(fileStats.columns, sampleData)} based on the column structure and content.`;
      }
      
      // Basic metadata in English
      const metadata: GeneratedMetadata = {
        title: `${filename} Dataset`,
        description: enhancedDescription,
        tags: [...fileStats.columns.slice(0, 5), filename.toLowerCase()],
        category: guessCategory(fileStats.columns, sampleData)
      };
      
      // Add Arabic translations if requested
      if (language === 'ar' || language === 'both') {
        metadata.titleArabic = `مجموعة بيانات ${filename}`;
        metadata.descriptionArabic = `تحتوي مجموعة البيانات هذه على معلومات حول ${filename.toLowerCase()} مع الأعمدة التالية: ${columnNames}. تحتوي على ${fileStats.rowCount} سجل.`;
        
        if (fileContent && fileContent.length > 0) {
          metadata.descriptionArabic += ` يبدو أن البيانات هي ${guessDataTypeArabic(fileStats.columns, sampleData)} بناءً على هيكل العمود والمحتوى.`;
        }
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

// Helper function to guess a category based on column names and sample data
function guessCategory(columns: string[], sampleData: any[]): string {
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

// Helper function to guess the type of data based on columns and sample data
function guessDataType(columns: string[], sampleData: any[]): string {
  const columnStr = columns.join(' ').toLowerCase();
  
  if (columnStr.includes('survey') || columnStr.includes('response') || columnStr.includes('feedback')) {
    return 'survey data';
  } else if (columnStr.includes('sales') || columnStr.includes('revenue') || columnStr.includes('profit')) {
    return 'financial data';
  } else if (columnStr.includes('student') || columnStr.includes('school') || columnStr.includes('education')) {
    return 'educational data';
  } else if (columnStr.includes('patient') || columnStr.includes('health') || columnStr.includes('medical')) {
    return 'healthcare data';
  } else if (columnStr.includes('customer') || columnStr.includes('client') || columnStr.includes('purchase')) {
    return 'customer data';
  } else {
    return 'structured data';
  }
}

// Helper function for Arabic data type descriptions
function guessDataTypeArabic(columns: string[], sampleData: any[]): string {
  const columnStr = columns.join(' ').toLowerCase();
  
  if (columnStr.includes('survey') || columnStr.includes('response') || columnStr.includes('feedback')) {
    return 'بيانات استطلاعية';
  } else if (columnStr.includes('sales') || columnStr.includes('revenue') || columnStr.includes('profit')) {
    return 'بيانات مالية';
  } else if (columnStr.includes('student') || columnStr.includes('school') || columnStr.includes('education')) {
    return 'بيانات تعليمية';
  } else if (columnStr.includes('patient') || columnStr.includes('health') || columnStr.includes('medical')) {
    return 'بيانات صحية';
  } else if (columnStr.includes('customer') || columnStr.includes('client') || columnStr.includes('purchase')) {
    return 'بيانات العملاء';
  } else {
    return 'بيانات منظمة';
  }
} 