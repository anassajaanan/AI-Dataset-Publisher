# AI-Powered Metadata Generation

This document describes the AI-powered metadata generation feature of the Dataset Publishing Platform.

## Overview

The AI-powered metadata generation feature uses artificial intelligence to generate metadata for datasets, including title, description, tags, and category suggestions. The feature integrates with AI services such as OpenAI to analyze dataset contents and generate relevant metadata. The generated metadata is presented to the user for review and editing, with the ability to save drafts and make changes before final publication. The platform now supports bilingual metadata generation in both English and Arabic.

## User Flow

1. User uploads a dataset file
2. User navigates to the metadata generation step
3. User selects the language for metadata generation (English, Arabic, or both)
4. The system sends the dataset contents to the AI service for analysis
5. The AI service generates metadata suggestions (up to three options)
6. The system displays the suggested metadata options to the user
7. User selects one of the options and edits the metadata as needed
8. User saves the metadata as a draft or proceeds to the next step

## Components

### Metadata Editor Component

The metadata editor component provides a form for editing dataset metadata, with support for AI-generated suggestions. It includes fields for title, description, tags, and category, with the ability to save drafts and switch between languages. The component now supports bilingual editing with tabs for English and Arabic content.

![Metadata Editor Component](../assets/metadata-editor.png)

### AI Suggestions Component

The AI suggestions component displays multiple AI-generated metadata suggestions alongside the metadata editor. It shows the suggested title, description, tags, and category for each option. The user can select one of the options for further editing.

![AI Suggestions Component](../assets/ai-suggestions.png)

### Language Toggle Component

The language toggle component allows the user to switch between English, Arabic, or bilingual mode for metadata generation and editing. It updates the UI language and triggers new AI suggestions when the language is changed.

![Language Toggle Component](../assets/language-toggle.png)

## API Endpoints

### Generate Metadata

```
POST /api/metadata
```

Generates metadata for a dataset using AI services.

#### Request

```json
{
  "datasetId": "64f7e8a12b3c4d5e6f7a8b9c",
  "language": "both"
}
```

The `language` parameter can be:
- `"en"` - Generate metadata in English only
- `"ar"` - Generate metadata in Arabic only
- `"both"` - Generate metadata in both English and Arabic

#### Response

**Success (200 OK)**

```json
{
  "message": "Metadata generated successfully",
  "metadata": [
    {
      "title": "US Population Demographics 2020",
      "description": "This dataset contains demographic information about the US population based on the 2020 census, including age, gender, ethnicity, and geographic distribution.",
      "tags": ["demographics", "census", "population", "united states", "2020"],
      "category": "Demographics"
    },
    {
      "title": "2020 United States Census Data",
      "description": "Comprehensive demographic data from the 2020 US Census, featuring population statistics by age, gender, ethnicity, and geographic region.",
      "tags": ["census", "demographics", "population statistics", "US", "2020"],
      "category": "Government Data"
    },
    {
      "title": "American Population Statistics (2020)",
      "description": "A detailed collection of population statistics from across the United States, compiled from the 2020 census and organized by demographic categories.",
      "tags": ["population", "statistics", "demographics", "US", "census data", "2020"],
      "category": "Social Sciences"
    }
  ]
}
```

### Enhanced Metadata Generation

```
POST /api/metadata/enhanced
```

Provides more advanced metadata generation options with additional customization.

#### Request

```json
{
  "datasetId": "64f7e8a12b3c4d5e6f7a8b9c",
  "language": "both",
  "options": {
    "includeFields": ["title", "description", "tags", "category"],
    "customPrompt": "Focus on scientific applications of this dataset"
  }
}
```

#### Response

Similar to the standard metadata generation endpoint.

### Save Metadata

```
PUT /api/datasets/{id}/metadata
```

Saves metadata for a dataset.

#### Request

```json
{
  "metadata": {
    "title": "US Population Demographics 2020",
    "titleArabic": "بيانات سكان الولايات المتحدة 2020",
    "description": "This dataset contains demographic information about the US population based on the 2020 census, including age, gender, ethnicity, and geographic distribution.",
    "descriptionArabic": "تحتوي مجموعة البيانات هذه على معلومات ديموغرافية حول سكان الولايات المتحدة بناءً على إحصاء عام 2020، بما في ذلك العمر والجنس والعرق والتوزيع الجغرافي.",
    "tags": ["demographics", "census", "population", "united states", "2020"],
    "license": "CC BY 4.0",
    "author": "US Census Bureau"
  }
}
```

#### Response

**Success (200 OK)**

```json
{
  "message": "Metadata updated successfully",
  "metadata": {
    "_id": "64f7e8a12b3c4d5e6f7a8b9d",
    "datasetId": "64f7e8a12b3c4d5e6f7a8b9c",
    "versionId": "64f7e8a12b3c4d5e6f7a8b9e",
    "title": "US Population Demographics 2020",
    "titleArabic": "بيانات سكان الولايات المتحدة 2020",
    "description": "This dataset contains demographic information about the US population based on the 2020 census, including age, gender, ethnicity, and geographic distribution.",
    "descriptionArabic": "تحتوي مجموعة البيانات هذه على معلومات ديموغرافية حول سكان الولايات المتحدة بناءً على إحصاء عام 2020، بما في ذلك العمر والجنس والعرق والتوزيع الجغرافي.",
    "keywords": ["demographics", "census", "population", "united states", "2020"],
    "license": "CC BY 4.0",
    "author": "US Census Bureau",
    "createdAt": "2023-09-05T15:30:45Z",
    "updatedAt": "2023-09-05T15:30:45Z"
  }
}
```

## Implementation Details

### AI Integration

The metadata generation feature integrates with AI services to generate metadata suggestions. The current implementation uses the OpenAI API, with the following approach:

1. The dataset contents are analyzed to extract key information
2. A prompt is constructed with instructions for generating metadata
3. The prompt is sent to the OpenAI API with appropriate parameters
4. The API response is parsed to extract the generated metadata
5. Multiple metadata options are presented to the user for selection

#### Example Prompt

```
You are an expert at generating metadata for datasets. Given the file content and basic file information provided below, please produce 3 distinct metadata options.
Each option must include:
- a title,
- a description,
- a list of tags,
- a category suggestion.

File Basic Information: Filename: us_population_2020.csv, Row Count: 50000, Columns: id, age_group, gender, ethnicity, state, population, File Size: 5242880 bytes
File Content Preview: id,age_group,gender,ethnicity,state,population
1,18-24,Male,Caucasian,California,1250000
2,18-24,Female,Caucasian,California,1300000
3,25-34,Male,African American,New York,980000

Language: both
```

### Bilingual Support

The feature now fully supports metadata generation in both English and Arabic, with the following approach:

1. The user selects the desired language for metadata generation (English, Arabic, or both)
2. The language parameter is included in the API request
3. The AI service generates metadata in the specified language(s)
4. For bilingual mode, both English and Arabic metadata fields are populated
5. The UI displays tabs for switching between English and Arabic content
6. The metadata is stored with separate fields for English and Arabic content (`title`/`titleArabic`, `description`/`descriptionArabic`)
7. The UI displays the appropriate language based on the user's preference, with proper text direction (LTR for English, RTL for Arabic)

### Multiple Metadata Options

The feature now generates multiple metadata options for the user to choose from:

1. The AI service generates three distinct metadata options
2. The options are displayed in a grid layout for easy comparison
3. The user can select one of the options for further editing
4. The selected option is loaded into the metadata editor
5. The user can make additional changes before saving

### Draft Saving

The feature includes draft saving functionality to prevent data loss during the metadata editing process:

1. The user can save the current metadata as a draft at any time
2. Drafts are stored in the database with a reference to the dataset and version
3. When the user returns to the metadata editing step, the latest draft is loaded
4. The user can continue editing from where they left off
5. When the metadata is finalized, the draft is converted to the official metadata

### Metadata Validation

The feature includes validation for metadata fields to ensure quality and completeness:

1. Title: Required, maximum length of 100 characters
2. Description: Required, maximum length of 1000 characters
3. Tags: At least 3 tags, maximum of 10 tags
4. Category: Required, must be one of the predefined categories

## Configuration Options

The feature can be configured with the following options:

- AI service provider (OpenAI, Hugging Face, etc.)
- AI model parameters (temperature, max tokens, etc.)
- Required metadata fields
- Validation rules for metadata fields
- Available languages for metadata generation
- Predefined categories for dataset categorization

## Security Considerations

The feature implements several security measures:

- API key management for AI service access
- Input validation to prevent prompt injection
- Rate limiting for AI service requests
- Content filtering for generated metadata
- Access control to restrict metadata editing permissions

## Performance Considerations

The feature is optimized for performance:

- Caching of AI-generated metadata to reduce API calls
- Asynchronous metadata generation to prevent UI blocking
- Batch processing for multiple metadata fields
- Debounced user input to reduce API calls during editing
- Optimistic UI updates to improve perceived performance

## Accessibility

The feature is designed with accessibility in mind:

- Keyboard navigation for all interactive elements
- Screen reader support with ARIA attributes
- High contrast mode for visually impaired users
- Error messages that are clear and descriptive
- Language selection for multilingual support
- RTL layout support for Arabic content

## Future Enhancements

Planned enhancements for the feature include:

- Support for additional languages beyond English and Arabic
- Enhanced AI models for more accurate metadata generation
- Customizable metadata templates for different dataset types
- Collaborative metadata editing with multiple users
- Version history for metadata changes 