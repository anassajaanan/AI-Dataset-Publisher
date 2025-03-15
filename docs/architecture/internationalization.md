# Internationalization (i18n)

This document describes the internationalization (i18n) strategy implemented in the Dataset Publishing Platform.

## Overview

The Dataset Publishing Platform implements a comprehensive internationalization (i18n) strategy to support multiple languages and locales. The platform is designed to be fully bilingual, supporting both English and Arabic, with the ability to add more languages in the future. The i18n strategy covers text translation, date and number formatting, right-to-left (RTL) layout support, and locale-specific content.

## Supported Languages

The platform currently supports the following languages:

- English (en) - Default language
- Arabic (ar) - Full RTL support

## Technology Stack

The platform uses the following technologies for internationalization:

- **next-intl**: For translation management and language switching
- **React Context API**: For storing and accessing the current locale
- **CSS Modules**: For RTL-aware styling
- **Intl API**: For date, number, and currency formatting
- **Tailwind CSS**: For RTL-responsive layouts with dir attributes

## Bilingual Metadata Support

The platform provides comprehensive support for bilingual metadata in datasets:

### Database Schema

The `DatasetMetadata` model includes fields for both English and Arabic content:

```typescript
interface IDatasetMetadata {
  title?: string;              // English title
  titleArabic?: string;        // Arabic title
  description?: string;        // English description
  descriptionArabic?: string;  // Arabic description
  keywords: string[];          // English tags/keywords
  keywordsArabic?: string[];   // Arabic tags/keywords
  category: string;            // English category
  categoryArabic?: string;     // Arabic category
  language: 'en' | 'ar' | 'both'; // Metadata language mode
}
```

### Language Modes

The platform supports three language modes for metadata:

1. **English Only (en)**: Only English fields are required
2. **Arabic Only (ar)**: Only Arabic fields are required (can be stored in either primary or Arabic-specific fields)
3. **Bilingual (both)**: Both English and Arabic fields are required

### UI Components

The dataset detail page includes a language toggle for switching between English and Arabic metadata display when bilingual content is available. The UI automatically adjusts layout direction (LTR/RTL) based on the selected language.

### Validation

The platform includes robust validation for different language scenarios:

- For English-only metadata: Validates English fields
- For Arabic-only metadata: Validates Arabic fields (which can be stored in either primary or Arabic-specific fields)
- For bilingual metadata: Validates both English and Arabic fields

## Translation Management

### Translation Files

Translations are stored in JSON files organized by language code:

```
/src
  /locales
    /en
      common.json
      auth.json
      datasets.json
      metadata.json
      upload.json
    /ar
      common.json
      auth.json
      datasets.json
      metadata.json
      upload.json
```

Example translation file (`en/common.json`):

```json
{
  "app": {
    "name": "Dataset Publishing Platform",
    "tagline": "Streamline your dataset publishing workflow"
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "upload": "Upload",
    "datasets": "Datasets",
    "profile": "Profile",
    "settings": "Settings",
    "logout": "Logout"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "edit": "Edit",
    "delete": "Delete",
    "submit": "Submit",
    "confirm": "Confirm",
    "back": "Back",
    "next": "Next"
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email address",
    "invalidPassword": "Password must be at least 8 characters long",
    "serverError": "An error occurred. Please try again later."
  }
}
```

### Translation Keys

Translation keys follow a hierarchical structure to organize translations by feature and component:

- `common.*`: Common UI elements and messages
- `auth.*`: Authentication-related messages
- `datasets.*`: Dataset-related messages
- `metadata.*`: Metadata-related messages
- `upload.*`: Upload-related messages

### Message Format

The platform uses ICU message format for complex translations with variables, pluralization, and selection:

```json
{
  "datasets": {
    "count": "{count, plural, =0 {No datasets} one {# dataset} other {# datasets}}",
    "lastUpdated": "Last updated {date, date, medium} at {date, time, short}",
    "status": "{status, select, draft {Draft} pending_review {Pending Review} published {Published} other {Unknown}}"
  }
}
```

## Implementation

### Next.js Configuration

The platform configures Next.js to support internationalization:

```typescript
// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    localeDetection: true
  }
}
```

### Translation Provider

The platform uses a translation provider to make translations available throughout the application:

```tsx
// src/providers/TranslationProvider.tsx
import { NextIntlProvider } from 'next-intl';

export function TranslationProvider({ children, locale, messages }) {
  return (
    <NextIntlProvider locale={locale} messages={messages}>
      {children}
    </NextIntlProvider>
  );
}

// src/pages/_app.tsx
import { TranslationProvider } from '../providers/TranslationProvider';

function MyApp({ Component, pageProps }) {
  const { locale, messages } = pageProps;
  
  return (
    <TranslationProvider locale={locale} messages={messages}>
      <Component {...pageProps} />
    </TranslationProvider>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      locale,
      messages: (await import(`../locales/${locale}/common.json`)).default
    }
  };
}
```

### Using Translations

The platform provides hooks and components for using translations:

```tsx
// Example component using translations
import { useTranslations } from 'next-intl';

function DatasetList({ datasets }) {
  const t = useTranslations('datasets');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('count', { count: datasets.length })}</p>
      
      <ul>
        {datasets.map(dataset => (
          <li key={dataset.id}>
            <h3>{dataset.title}</h3>
            <p>{t('lastUpdated', { date: new Date(dataset.updatedAt) })}</p>
            <span className="status">{t('status', { status: dataset.status })}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Language Switcher

The platform includes a language switcher component:

```tsx
// src/components/LanguageSwitcher.tsx
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

export function LanguageSwitcher() {
  const router = useRouter();
  const t = useTranslations('common');
  
  const changeLanguage = (locale) => {
    router.push(router.pathname, router.asPath, { locale });
  };
  
  return (
    <div className="language-switcher">
      <button
        onClick={() => changeLanguage('en')}
        className={router.locale === 'en' ? 'active' : ''}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        className={router.locale === 'ar' ? 'active' : ''}
      >
        العربية
      </button>
    </div>
  );
}
```

## RTL Support

### Document Direction

The platform sets the document direction based on the current locale:

```tsx
// src/pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, locale: ctx.locale };
  }

  render() {
    const dir = this.props.locale === 'ar' ? 'rtl' : 'ltr';
    
    return (
      <Html lang={this.props.locale} dir={dir}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

### Component-Level RTL Support

For components that need to display content in both LTR and RTL directions (such as the dataset detail page), we use the `dir` attribute to control text direction:

```tsx
{/* Arabic Metadata */}
{(metadata.language === 'ar' || (metadata.language === 'both' && activeTab === 'arabic')) && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
    {/* Arabic content */}
  </div>
)}

{/* English Metadata */}
{(metadata.language === 'en' || (metadata.language === 'both' && activeTab === 'english')) && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* English content */}
  </div>
)}
```

## Date and Number Formatting

The platform uses the Intl API for locale-aware date and number formatting:

```tsx
// Example of date and number formatting
import { useFormatter } from 'next-intl';

function DatasetDetails({ dataset }) {
  const format = useFormatter();
  
  return (
    <div>
      <h1>{dataset.title}</h1>
      <p>
        Created: {format.dateTime(new Date(dataset.createdAt), {
          dateStyle: 'medium',
          timeStyle: 'short'
        })}
      </p>
      <p>
        Size: {format.number(dataset.size / 1024 / 1024, {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          unit: 'megabyte',
          unitDisplay: 'short'
        })}
      </p>
      <p>
        Rows: {format.number(dataset.rowCount, {
          notation: 'compact'
        })}
      </p>
    </div>
  );
}
```

## Locale-Specific Content

The platform supports locale-specific content for certain features:

- Different metadata templates for each language
- Language-specific validation rules
- Culturally appropriate examples and placeholders
- Language-specific sorting and filtering

## Metadata Bilingual Support

The platform supports bilingual metadata for datasets with full Arabic support:

```typescript
// Example of bilingual metadata structure
interface DatasetMetadata {
  // English fields
  title: string;
  description: string;
  keywords: string[];
  category: string;
  
  // Arabic fields
  titleArabic: string;
  descriptionArabic: string;
  keywordsArabic: string[];
  categoryArabic: string;
  
  // Language setting
  language: 'en' | 'ar' | 'both';
}
```

When the language is set to 'ar' (Arabic only), the system ensures that:
1. Arabic content can be stored in either the main fields or Arabic-specific fields
2. Tags/keywords are properly stored in both `keywords` and `keywordsArabic` fields
3. The UI displays the appropriate content based on the language setting

The metadata editor allows users to edit metadata in both languages:

```tsx
// Example of bilingual metadata editor
function MetadataEditor({ metadata, onChange }) {
  const [activeLanguage, setActiveLanguage] = useState('en');
  const t = useTranslations('metadata');
  
  return (
    <div>
      <div className="language-tabs">
        <button
          onClick={() => setActiveLanguage('en')}
          className={activeLanguage === 'en' ? 'active' : ''}
        >
          English
        </button>
        <button
          onClick={() => setActiveLanguage('ar')}
          className={activeLanguage === 'ar' ? 'active' : ''}
        >
          العربية
        </button>
      </div>
      
      <div className="form-group">
        <label>{t('title')}</label>
        <input
          type="text"
          value={metadata.title[activeLanguage]}
          onChange={(e) => onChange({
            ...metadata,
            title: {
              ...metadata.title,
              [activeLanguage]: e.target.value
            }
          })}
          dir={activeLanguage === 'ar' ? 'rtl' : 'ltr'}
        />
      </div>
      
      {/* Additional form fields for description, tags, etc. */}
    </div>
  );
}
```

## Testing

The platform includes tests for internationalization:

- Unit tests for translation loading and formatting
- Integration tests for language switching
- Visual regression tests for RTL layout
- Accessibility tests for internationalized content

## Performance Considerations

The platform optimizes internationalization for performance:

- Lazy loading of translation files
- Server-side rendering of translated content
- Caching of formatted dates and numbers
- Minimizing layout shifts when switching languages

## Configuration Options

The internationalization system can be configured with the following options:

- Default language
- Available languages
- Date and time formats
- Number formats
- Translation loading strategy
- Fallback behavior for missing translations

## Future Enhancements

Planned enhancements for the internationalization system include:

- Support for additional languages
- Machine translation integration for user-generated content
- Language detection based on user preferences
- Improved translation management workflow
- Performance optimizations for translation loading 

## Recent Enhancements

### March 2024 Updates

- Added comprehensive bilingual support for dataset metadata
- Implemented language toggle in dataset detail page
- Enhanced RTL formatting for Arabic content display
- Updated database models to properly handle multilingual content
- Added validation for different language scenarios
- Improved error handling for language-specific operations 