'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileUp } from 'lucide-react';
import NewVersionForm from './NewVersionForm';

interface NewVersionDialogProps {
  datasetId: string;
  onSuccess?: () => void;
}

export default function NewVersionDialog({ datasetId, onSuccess }: NewVersionDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1">
          <FileUp className="h-4 w-4" />
          New Version
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Version</DialogTitle>
          <DialogDescription>
            Upload a new file to create a new version of this dataset.
          </DialogDescription>
        </DialogHeader>
        <NewVersionForm 
          datasetId={datasetId} 
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 