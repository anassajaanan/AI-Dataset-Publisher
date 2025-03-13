import React from 'react';
import { DatasetList } from '@/components/dashboard/DatasetList';

export const metadata = {
  title: 'Dashboard - Dataset Publishing Platform',
  description: 'Manage your datasets and view their status',
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <DatasetList />
      </div>
    </div>
  );
} 