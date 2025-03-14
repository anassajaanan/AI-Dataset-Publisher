# Metadata Components

This section documents the components used for metadata generation and editing in the Dataset Publishing Platform.

## MetadataEditor Component

The `MetadataEditor` component provides a form for editing dataset metadata, with support for AI-generated suggestions.

### Usage

```tsx
import { MetadataEditor } from '@/components/metadata/MetadataEditor';

const MyComponent = () => {
  const handleSave = (metadata) => {
    console.log('Metadata saved:', metadata);
  };

  return (
    <MetadataEditor 
      datasetId="64f7e8a12b3c4d5e6f7a8b9c"
      onSave={handleSave}
      language="en"
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datasetId` | `string` | Required | ID of the dataset to edit metadata for |
| `initialMetadata` | `Metadata` | `undefined` | Initial metadata values (if not provided, will be fetched from API) |
| `onSave` | `(metadata: Metadata) => void` | Required | Callback function called when metadata is saved |
| `onCancel` | `() => void` | `undefined` | Callback function called when editing is canceled |
| `language` | `'en' \| 'ar'` | `'en'` | Language for metadata editing |
| `readOnly` | `boolean` | `false` | Whether the editor is in read-only mode |
| `showAiSuggestions` | `boolean` | `true` | Whether to show AI-generated suggestions |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- Form for editing dataset metadata (title, description, tags, category)
- AI-generated metadata suggestions
- Bilingual support (English and Arabic)
- Draft saving functionality
- Form validation
- Rich text editor for description field
- Tag input with autocomplete
- Category selection with predefined options

### Implementation Details

The `MetadataEditor` component provides a form for editing dataset metadata. It can fetch existing metadata from the API or use provided initial values. When AI suggestions are enabled, it fetches suggestions from the `/api/metadata/generate` endpoint and displays them alongside the form fields. The component supports bilingual editing with language switching and provides draft saving functionality to prevent data loss.

## TagInput Component

The `TagInput` component provides an input field for entering and managing tags.

### Usage

```tsx
import { TagInput } from '@/components/metadata/TagInput';

const MyComponent = () => {
  const [tags, setTags] = useState(['demographics', 'census']);

  return (
    <TagInput 
      value={tags}
      onChange={setTags}
      suggestions={['population', 'united states', '2020']}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string[]` | Required | Array of current tag values |
| `onChange` | `(tags: string[]) => void` | Required | Callback function called when tags change |
| `suggestions` | `string[]` | `[]` | Array of tag suggestions |
| `placeholder` | `string` | `'Add tags...'` | Placeholder text for the input field |
| `maxTags` | `number` | `10` | Maximum number of tags allowed |
| `disabled` | `boolean` | `false` | Whether the input is disabled |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- Tag input with autocomplete suggestions
- Tag creation and deletion
- Duplicate tag prevention
- Maximum tag limit
- Keyboard navigation for accessibility
- Responsive design

### Implementation Details

The `TagInput` component allows users to enter and manage tags for a dataset. It provides autocomplete suggestions and prevents duplicate tags. Tags can be added by typing and pressing Enter or selecting from suggestions, and can be removed by clicking the remove button or pressing Backspace when the input is empty.

## LanguageToggle Component

The `LanguageToggle` component provides a toggle for switching between languages.

### Usage

```tsx
import { LanguageToggle } from '@/components/metadata/LanguageToggle';

const MyComponent = () => {
  const [language, setLanguage] = useState('en');

  return (
    <LanguageToggle 
      value={language}
      onChange={setLanguage}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `'en' \| 'ar'` | Required | Current language value |
| `onChange` | `(language: 'en' \| 'ar') => void` | Required | Callback function called when language changes |
| `disabled` | `boolean` | `false` | Whether the toggle is disabled |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- Toggle between English and Arabic languages
- Visual indication of current language
- Accessibility support with proper ARIA attributes
- RTL support for Arabic language

### Implementation Details

The `LanguageToggle` component provides a simple toggle for switching between English and Arabic languages. It uses appropriate icons and labels for each language and supports right-to-left (RTL) layout for Arabic.

## MetadataSuggestions Component

The `MetadataSuggestions` component displays AI-generated metadata suggestions.

### Usage

```tsx
import { MetadataSuggestions } from '@/components/metadata/MetadataSuggestions';

const MyComponent = () => {
  const handleApplySuggestion = (field, value) => {
    console.log(`Apply suggestion for ${field}:`, value);
  };

  return (
    <MetadataSuggestions 
      datasetId="64f7e8a12b3c4d5e6f7a8b9c"
      onApplySuggestion={handleApplySuggestion}
      language="en"
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datasetId` | `string` | Required | ID of the dataset to generate suggestions for |
| `onApplySuggestion` | `(field: string, value: any) => void` | Required | Callback function called when a suggestion is applied |
| `language` | `'en' \| 'ar'` | `'en'` | Language for suggestions |
| `fields` | `string[]` | `['title', 'description', 'tags', 'category']` | Fields to generate suggestions for |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- Display of AI-generated metadata suggestions
- Apply suggestion buttons for each field
- Confidence scores for suggestions
- Loading state during suggestion generation
- Error handling for failed suggestions

### Implementation Details

The `MetadataSuggestions` component fetches AI-generated metadata suggestions from the `/api/metadata/generate` endpoint and displays them alongside the metadata form. Each suggestion includes a confidence score and an apply button that, when clicked, calls the `onApplySuggestion` callback with the field name and suggested value. 