# Preview Components

This section documents the components used for displaying dataset previews in the Dataset Publishing Platform.

## DatasetPreview Component

The `DatasetPreview` component displays a preview of the dataset contents, including a table of data and summary statistics.

### Usage

```tsx
import { DatasetPreview } from '@/components/preview/DatasetPreview';

const MyComponent = () => {
  return (
    <DatasetPreview 
      datasetId="64f7e8a12b3c4d5e6f7a8b9c"
      maxRows={100}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datasetId` | `string` | Required | ID of the dataset to preview |
| `maxRows` | `number` | `100` | Maximum number of rows to display in the preview |
| `version` | `number` | `undefined` | Version of the dataset to preview (defaults to latest) |
| `showStats` | `boolean` | `true` | Whether to show summary statistics |
| `showControls` | `boolean` | `true` | Whether to show preview controls (pagination, search, etc.) |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- Tabular data display with pagination
- Column sorting and filtering
- Data type detection and appropriate formatting
- Summary statistics for numerical columns
- Search functionality
- Responsive design with horizontal scrolling for wide tables
- Accessibility support with proper table semantics

### Implementation Details

The `DatasetPreview` component fetches data from the `/api/datasets/:datasetId/preview` endpoint and displays it in a table format. It automatically detects data types and formats values accordingly. For numerical columns, it calculates and displays summary statistics such as mean, median, min, and max values.

## ColumnList Component

The `ColumnList` component displays a list of columns in a dataset with their data types and statistics.

### Usage

```tsx
import { ColumnList } from '@/components/preview/ColumnList';

const MyComponent = () => {
  return (
    <ColumnList 
      columns={[
        { name: 'id', type: 'number', nullable: false },
        { name: 'name', type: 'string', nullable: true },
        { name: 'age', type: 'number', nullable: true },
        { name: 'city', type: 'string', nullable: false }
      ]}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Array<{ name: string, type: string, nullable: boolean }>` | Required | Array of column definitions |
| `onColumnClick` | `(column: string) => void` | `undefined` | Callback function called when a column is clicked |
| `selectedColumn` | `string` | `undefined` | Currently selected column name |
| `showTypes` | `boolean` | `true` | Whether to show data types |
| `showNullable` | `boolean` | `true` | Whether to show nullable status |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- List of columns with data types
- Visual indicators for nullable columns
- Selection functionality for interactive column selection
- Compact and expanded view modes
- Search and filter functionality for large column lists

### Implementation Details

The `ColumnList` component displays a list of columns in a dataset, including their names, data types, and nullable status. It provides interactive selection functionality and can be used in conjunction with other components to display detailed information about selected columns.

## StatsSummary Component

The `StatsSummary` component displays summary statistics for a dataset or a specific column.

### Usage

```tsx
import { StatsSummary } from '@/components/preview/StatsSummary';

const MyComponent = () => {
  return (
    <StatsSummary 
      stats={{
        rowCount: 1500,
        columnCount: 10,
        fileSize: 1024567,
        missingValues: 25,
        duplicateRows: 0
      }}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stats` | `DatasetStats \| ColumnStats` | Required | Statistics object to display |
| `type` | `'dataset' \| 'column'` | `'dataset'` | Type of statistics to display |
| `showChart` | `boolean` | `true` | Whether to show visual charts for applicable statistics |
| `compact` | `boolean` | `false` | Whether to use a compact display mode |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- Summary statistics display for datasets and columns
- Visual charts for numerical data distribution
- Missing value highlighting
- Data quality indicators
- Responsive design with different display modes

### Implementation Details

The `StatsSummary` component displays summary statistics for a dataset or a specific column. For datasets, it shows information such as row count, column count, file size, and data quality metrics. For columns, it shows statistics specific to the data type, such as mean, median, min, and max for numerical columns, or unique value count and most frequent values for categorical columns. 