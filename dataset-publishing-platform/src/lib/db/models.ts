import mongoose, { Schema, Document, Model } from 'mongoose';

// Dataset interface
export interface IDataset extends Document {
  filename: string;
  fileSize: number;
  rowCount: number;
  columns: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Dataset Version interface
export interface IDatasetVersion extends Document {
  datasetId: mongoose.Types.ObjectId;
  versionNumber: number;
  filePath: string;
  status: 'draft' | 'review' | 'published' | 'rejected';
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dataset Metadata interface
export interface IDatasetMetadata extends Document {
  datasetId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  keywords: string[];
  license: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dataset Schema
const DatasetSchema = new Schema<IDataset>(
  {
    filename: { type: String, required: true },
    fileSize: { type: Number, required: true },
    rowCount: { type: Number, required: true },
    columns: { type: [String], required: true },
  },
  { timestamps: true }
);

// Dataset Version Schema
const DatasetVersionSchema = new Schema<IDatasetVersion>(
  {
    datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true },
    versionNumber: { type: Number, required: true },
    filePath: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['draft', 'review', 'published', 'rejected'], 
      default: 'draft',
      required: true 
    },
    comments: { type: String },
  },
  { timestamps: true }
);

// Dataset Metadata Schema
const DatasetMetadataSchema = new Schema<IDatasetMetadata>(
  {
    datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: { type: [String], required: true },
    license: { type: String, required: true },
    author: { type: String, required: true },
  },
  { timestamps: true }
);

// Create models or get existing ones
export const Dataset = mongoose.models.Dataset as Model<IDataset> || 
  mongoose.model<IDataset>('Dataset', DatasetSchema);

export const DatasetVersion = mongoose.models.DatasetVersion as Model<IDatasetVersion> || 
  mongoose.model<IDatasetVersion>('DatasetVersion', DatasetVersionSchema);

export const DatasetMetadata = mongoose.models.DatasetMetadata as Model<IDatasetMetadata> || 
  mongoose.model<IDatasetMetadata>('DatasetMetadata', DatasetMetadataSchema); 