import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build the query
    const where: any = {};
    
    if (status && status !== 'all') {
      where.versions = {
        some: {
          status
        }
      };
    }
    
    if (search) {
      where.filename = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    // Fetch datasets with their latest version
    const datasets = await prisma.dataset.findMany({
      where,
      include: {
        versions: {
          orderBy: {
            versionNumber: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ datasets });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching datasets' },
      { status: 500 }
    );
  }
} 