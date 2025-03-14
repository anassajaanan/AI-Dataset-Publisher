# AI-Powered Metadata Generation

This document describes the AI-powered metadata generation feature of the Dataset Publishing Platform.

## Overview

The AI-powered metadata generation feature uses artificial intelligence to generate metadata for datasets, including title, description, tags, and category suggestions. The feature integrates with AI services such as OpenAI to analyze dataset contents and generate relevant metadata. The generated metadata is presented to the user for review and editing, with the ability to save drafts and make changes before final publication.

## User Flow

1. User uploads a dataset file
2. User navigates to the metadata generation step
3. User selects the language for metadata generation (English or Arabic)
4. The system sends the dataset contents to the AI service for analysis
5. The AI service generates metadata suggestions
6. The system displays the suggested metadata to the user
7. User reviews and edits the metadata as needed
8. User saves the metadata as a draft or proceeds to the next step

## Components

### Metadata Editor Component

The metadata editor component provides a form for editing dataset metadata, with support for AI-generated suggestions. It includes fields for title, description, tags, and category, with the ability to save drafts and switch between languages.

![Metadata Editor Component](../assets/metadata-editor.png)

### AI Suggestions Component

The AI suggestions component displays AI-generated metadata suggestions alongside the metadata editor. It shows the suggested title, description, tags, and category, with confidence scores for each suggestion. The user can apply individual suggestions to the metadata editor.

![AI Suggestions Component](../assets/ai-suggestions.png)

### Language Toggle Component

The language toggle component allows the user to switch between English and Arabic for metadata generation and editing. It updates the UI language and triggers new AI suggestions when the language is changed.

![Language Toggle Component](../assets/language-toggle.png)

## API Endpoints

### Generate Metadata

```
POST /api/metadata/generate
```

Generates metadata for a dataset using AI services.

#### Request

```json
{
  "datasetId": "64f7e8a12b3c4d5e6f7a8b9c",
  "language": "en",
  "includeFields": ["title", "description", "tags", "category"]
}
```

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "metadata": {
      "title": "US Population Demographics 2020",
      "description": "This dataset contains demographic information about the US population based on the 2020 census, including age, gender, ethnicity, and geographic distribution.",
      "tags": ["demographics", "census", "population", "united states", "2020"],
      "category": "Demographics"
    },
    "confidence": {
      "title": 0.92,
      "description": 0.87,
      "tags": 0.85,
      "category": 0.94
    }
  }
}
```

### Save Metadata

```
POST /api/metadata/save
```

Saves metadata for a dataset.

#### Request

```json
{
  "datasetId": "64f7e8a12b3c4d5e6f7a8b9c",
  "metadata": {
    "title": "US Population Demographics 2020",
    "description": "This dataset contains demographic information about the US population based on the 2020 census, including age, gender, ethnicity, and geographic distribution.",
    "tags": ["demographics", "census", "population", "united states", "2020"],
    "category": "Demographics"
  },
  "isDraft": true
}
```

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "metadataId": "64f7e8a12b3c4d5e6f7a8b9d",
    "datasetId": "64f7e8a12b3c4d5e6f7a8b9c",
    "isDraft": true,
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
5. Confidence scores are calculated based on the API response

#### Example Prompt

```
Generate metadata for the following dataset:

Column names: id, age_group, gender, ethnicity, state, population
Sample data:
1, 18-24, Male, Caucasian, California, 1250000
2, 18-24, Female, Caucasian, California, 1300000
3, 25-34, Male, African American, New York, 980000

Please provide the following metadata in JSON format:
1. Title: A concise and descriptive title for the dataset
2. Description: A detailed description of the dataset contents and potential uses
3. Tags: 5-10 relevant keywords or phrases for the dataset
4. Category: The most appropriate category for the dataset

Language: English
```

### Bilingual Support

The feature supports metadata generation in both English and Arabic, with the following approach:

1. The user selects the desired language for metadata generation
2. The language parameter is included in the API request
3. The AI service generates metadata in the specified language
4. The UI displays the metadata in the specified language, with appropriate text direction (LTR for English, RTL for Arabic)

### Draft Saving

The feature includes draft saving functionality to prevent data loss during the metadata editing process:

1. The user can save the current metadata as a draft at any time
2. Drafts are stored in the database with a reference to the dataset and user
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

## Future Enhancements

Planned enhancements for the feature include:

- Support for additional languages beyond English and Arabic
- Enhanced AI models for more accurate metadata generation
- Customizable metadata templates for different dataset types
- Collaborative metadata editing with multiple users
- Version history for metadata changes 