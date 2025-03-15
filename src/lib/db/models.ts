import mongoose, { Schema, Document, Model } from 'mongoose';

// Dataset interface
export interface IDataset extends Document {
  filename: string;
  fileSize: number;
  rowCount: number;
  columns: string[];
  createdAt: Date;
  updatedAt: Date;
  versions: mongoose.Types.ObjectId[];
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
  versionId?: mongoose.Types.ObjectId;
  title?: string;
  titleArabic?: string;
  description?: string;
  descriptionArabic?: string;
  keywords: string[];
  keywordsArabic?: string[];
  category: string;
  categoryArabic?: string;
  author: string;
  language: 'en' | 'ar' | 'both';
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
    versions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DatasetVersion',
      required: true,
      validate: {
        validator: (v: any[]) => Array.isArray(v) && v.length > 0,
        message: 'Dataset must have at least one version'
      }
    }]
  },
  { timestamps: true }
);

// Dataset Version Schema
const DatasetVersionSchema = new Schema<IDatasetVersion>(
  {
    datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true },
    versionNumber: { type: Number, required: true, min: 1 },
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
    versionId: { type: Schema.Types.ObjectId, ref: 'DatasetVersion' },
    title: { type: String, required: false },
    titleArabic: { type: String, required: false },
    description: { type: String, required: false },
    descriptionArabic: { type: String, required: false },
    keywords: { type: [String], required: true },
    keywordsArabic: { type: [String], required: false },
    category: { type: String, required: true },
    categoryArabic: { type: String, required: false },
    author: { type: String, required: true },
    language: { type: String, enum: ['en', 'ar', 'both'], default: 'en', required: true }
  },
  { timestamps: true }
);

// Updated pre-save hook to handle various language scenarios
DatasetMetadataSchema.pre('save', function(next) {
  if (this.language === 'ar') {
    // Allow Arabic content in either title/description or titleArabic/descriptionArabic
    const hasTitle = (this.title && this.title.trim() !== '') || 
                    (this.titleArabic && this.titleArabic.trim() !== '');
    const hasDescription = (this.description && this.description.trim() !== '') || 
                          (this.descriptionArabic && this.descriptionArabic.trim() !== '');
    
    if (!hasTitle) {
      return next(new Error('Title is required for Arabic metadata (in either title or titleArabic field)'));
    }
    if (!hasDescription) {
      return next(new Error('Description is required for Arabic metadata (in either description or descriptionArabic field)'));
    }
  } 
  else if (this.language === 'en') {
    // English-only: require title and description
    if (!this.title || this.title.trim() === '') {
      return next(new Error('Title is required for English metadata'));
    }
    if (!this.description || this.description.trim() === '') {
      return next(new Error('Description is required for English metadata'));
    }
  } 
  else if (this.language === 'both') {
    // Bilingual: require both English and Arabic fields
    if (!this.title || this.title.trim() === '') {
      return next(new Error('English title is required for bilingual metadata'));
    }
    if (!this.description || this.description.trim() === '') {
      return next(new Error('English description is required for bilingual metadata'));
    }
    if (!this.titleArabic || this.titleArabic.trim() === '') {
      return next(new Error('Arabic title is required for bilingual metadata'));
    }
    if (!this.descriptionArabic || this.descriptionArabic.trim() === '') {
      return next(new Error('Arabic description is required for bilingual metadata'));
    }
  }
  
  next();
});

// Create models or get existing ones
export const Dataset = mongoose.models.Dataset as Model<IDataset> || 
  mongoose.model<IDataset>('Dataset', DatasetSchema);

export const DatasetVersion = mongoose.models.DatasetVersion as Model<IDatasetVersion> || 
  mongoose.model<IDatasetVersion>('DatasetVersion', DatasetVersionSchema);

export const DatasetMetadata = mongoose.models.DatasetMetadata as Model<IDatasetMetadata> || 
  mongoose.model<IDatasetMetadata>('DatasetMetadata', DatasetMetadataSchema, 'datasetmetadata'); 