# Dashboard Components

This section documents the components used for the dataset dashboard and management in the Dataset Publishing Platform.

## DatasetList Component

The `DatasetList` component displays a list of datasets with filtering and sorting options.

### Usage

```tsx
import { DatasetList } from '@/components/dashboard/DatasetList';

const MyComponent = () => {
  const handleDatasetClick = (datasetId) => {
    console.log('Dataset clicked:', datasetId);
  };

  return (
    <DatasetList 
      onDatasetClick={handleDatasetClick}
      filter={{ status: 'published' }}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onDatasetClick` | `(datasetId: string) => void` | `undefined` | Callback function called when a dataset is clicked |
| `filter` | `DatasetFilter` | `{}` | Filter criteria for datasets |
| `sortBy` | `string` | `'updatedAt'` | Field to sort datasets by |
| `sortOrder` | `'asc' \| 'desc'` | `'desc'` | Sort order for datasets |
| `page` | `number` | `1` | Current page number |
| `limit` | `number` | `10` | Number of datasets per page |
| `showPagination` | `boolean` | `true` | Whether to show pagination controls |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- List of datasets with key information
- Sorting by different fields (updated date, title, status, etc.)
- Filtering by status, category, and search term
- Pagination for large dataset lists
- Status indicators with color coding
- Quick action buttons for common operations
- Responsive design with different layouts for different screen sizes

### Implementation Details

The `DatasetList` component fetches datasets from the `/api/datasets` endpoint with the specified filter, sort, and pagination parameters. It displays each dataset with its title, description, status, and other key information, and provides action buttons for common operations such as viewing, editing, and publishing datasets.

## StatusFilter Component

The `StatusFilter` component provides filters for dataset status.

### Usage

```tsx
import { StatusFilter } from '@/components/dashboard/StatusFilter';

const MyComponent = () => {
  const [status, setStatus] = useState(null);

  return (
    <StatusFilter 
      value={status}
      onChange={setStatus}
      counts={{
        draft: 5,
        pending_review: 2,
        published: 10,
        rejected: 1
      }}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| null` | Required | Currently selected status filter |
| `onChange` | `(status: string \| null) => void` | Required | Callback function called when the status filter changes |
| `counts` | `Record<string, number>` | `{}` | Count of datasets for each status |
| `showCounts` | `boolean` | `true` | Whether to show dataset counts for each status |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- Filter options for different dataset statuses
- Count indicators for each status
- Clear filter option
- Visual indication of selected filter
- Responsive design with horizontal or vertical layout

### Implementation Details

The `StatusFilter` component provides buttons for filtering datasets by status. It displays the count of datasets for each status and allows the user to select a status filter or clear the filter. The component uses color coding to indicate different statuses and provides visual feedback for the selected filter.

## SearchBar Component

The `SearchBar` component provides a search input for filtering datasets.

### Usage

```tsx
import { SearchBar } from '@/components/dashboard/SearchBar';

const MyComponent = () => {
  const handleSearch = (query) => {
    console.log('Search query:', query);
  };

  return (
    <SearchBar 
      onSearch={handleSearch}
      placeholder="Search datasets..."
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSearch` | `(query: string) => void` | Required | Callback function called when the search query changes |
| `initialValue` | `string` | `''` | Initial search query |
| `placeholder` | `string` | `'Search...'` | Placeholder text for the search input |
| `debounceTime` | `number` | `300` | Debounce time in milliseconds for search input |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- Search input with debounce
- Clear button for search query
- Search history dropdown
- Keyboard shortcuts for search
- Responsive design

### Implementation Details

The `SearchBar` component provides a search input for filtering datasets by title, description, or other searchable fields. It includes a debounce mechanism to prevent excessive API calls during typing and provides a clear button for resetting the search query. The component also maintains a search history and provides keyboard shortcuts for common search operations.

## DatasetCard Component

The `DatasetCard` component displays a card with dataset information.

### Usage

```tsx
import { DatasetCard } from '@/components/dashboard/DatasetCard';

const MyComponent = () => {
  return (
    <DatasetCard 
      dataset={{
        id: '64f7e8a12b3c4d5e6f7a8b9c',
        title: 'US Population Demographics 2020',
        description: 'This dataset contains demographic information...',
        status: 'published',
        updatedAt: '2023-09-05T16:45:30Z',
        rowCount: 1500,
        fileSize: 1024567
      }}
      onClick={() => console.log('Card clicked')}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataset` | `Dataset` | Required | Dataset object to display |
| `onClick` | `() => void` | `undefined` | Callback function called when the card is clicked |
| `actions` | `React.ReactNode` | `undefined` | Custom action buttons to display |
| `showStatus` | `boolean` | `true` | Whether to show the dataset status |
| `showStats` | `boolean` | `true` | Whether to show dataset statistics |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- Card display with dataset information
- Status indicator with color coding
- Dataset statistics (row count, file size, etc.)
- Action buttons for common operations
- Truncated description with expand/collapse
- Responsive design with different layouts for different screen sizes

### Implementation Details

The `DatasetCard` component displays a card with dataset information, including title, description, status, and statistics. It provides action buttons for common operations such as viewing, editing, and publishing datasets, and includes a status indicator with color coding to indicate the dataset's current status. 