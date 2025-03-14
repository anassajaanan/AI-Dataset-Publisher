import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset } from '@/lib/db/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to MongoDB
    try {
      await connectToDatabase();
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { message: 'Database connection error. Please try again later.' },
        { status: 500 }
      );
    }
    
    // Get the ID from params
    const datasetId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const maxRows = parseInt(searchParams.get('rows') || '10', 10);
    
    // Get dataset info from database
    const dataset = await Dataset.findById(datasetId);
    
    if (!dataset) {
      return NextResponse.json(
        { message: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, you would read the file from storage
    // For this example, we'll generate sample data based on the columns
    
    const headers = dataset.columns || [];
    
    // Generate sample data based on column names
    const rows = [];
    for (let i = 0; i < Math.min(maxRows, 20); i++) {
      const row = headers.map(column => {
        // Generate appropriate sample data based on column name
        if (column.toLowerCase().includes('id')) {
          return i + 1;
        } else if (column.toLowerCase().includes('name')) {
          const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'];
          return names[i % names.length];
        } else if (column.toLowerCase().includes('age')) {
          return 20 + Math.floor(Math.random() * 50);
        } else if (column.toLowerCase().includes('date')) {
          const date = new Date();
          date.setDate(date.getDate() - i * 7);
          return date.toISOString().split('T')[0];
        } else if (column.toLowerCase().includes('email')) {
          const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com'];
          return `user${i + 1}@${domains[i % domains.length]}`;
        } else if (column.toLowerCase().includes('price') || column.toLowerCase().includes('cost')) {
          return (Math.random() * 100).toFixed(2);
        } else if (column.toLowerCase().includes('quantity') || column.toLowerCase().includes('count')) {
          return Math.floor(Math.random() * 100);
        } else {
          return `Sample ${column} ${i + 1}`;
        }
      });
      rows.push(row);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        headers,
        rows,
        totalRows: dataset.rowCount || rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching dataset preview:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the dataset preview' },
      { status: 500 }
    );
  }
} 