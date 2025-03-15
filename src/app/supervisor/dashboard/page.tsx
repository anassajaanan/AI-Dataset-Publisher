import React from 'react';
import { Metadata } from 'next';
import { SupervisorDashboardContent } from '@/components/supervisor/SupervisorDashboard';

export const metadata = {
  title: 'Supervisor Dashboard - Dataset Publishing Platform',
  description: 'Review and manage datasets submitted for approval',
};

export default function SupervisorDashboard() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supervisor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Review and manage datasets submitted for approval</p>
        </div>
      </div>
      
      <SupervisorDashboardContent />
    </div>
  );
} 