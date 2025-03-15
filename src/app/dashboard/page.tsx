import React from 'react';
import { DatasetTable } from '@/components/dashboard/DatasetTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Dataset Publishing Platform',
  description: 'Manage your datasets and view their status',
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <DatasetTable />
      </div>
    </div>
  );
} 