# Component Documentation

This section provides documentation for the UI components used in the Dataset Publishing Platform.

## Component Categories

- [Upload Components](./upload.md) - Components for file upload and validation
- [Preview Components](./preview.md) - Components for displaying dataset previews
- [Metadata Components](./metadata.md) - Components for metadata generation and editing
- [Dashboard Components](./dashboard.md) - Components for the dataset dashboard and management

## Component Architecture

The component architecture follows a modular approach, with components organized by functionality. Each component is designed to be reusable and maintainable, with clear separation of concerns.

### Component Structure

Components are organized in the following structure:

```
src/components/
├── upload/
│   ├── FileUpload.tsx
│   ├── FileValidation.tsx
│   └── UploadProgress.tsx
├── preview/
│   ├── DatasetPreview.tsx
│   ├── ColumnList.tsx
│   └── StatsSummary.tsx
├── metadata/
│   ├── MetadataEditor.tsx
│   ├── TagInput.tsx
│   └── LanguageToggle.tsx
└── dashboard/
    ├── DatasetList.tsx
    ├── StatusFilter.tsx
    └── SearchBar.tsx
```

### Component Design Principles

1. **Reusability**: Components are designed to be reusable across different parts of the application.
2. **Composability**: Complex components are composed of smaller, simpler components.
3. **Accessibility**: All components include proper accessibility attributes and keyboard navigation.
4. **Responsiveness**: Components are designed to work well on different screen sizes.
5. **Performance**: Components are optimized for performance, with efficient rendering and state management.

### State Management

Components use a combination of local state (React's `useState` hook) and global state management (Context API or Zustand) depending on their needs:

- **Local State**: Used for component-specific state that doesn't need to be shared.
- **Context API**: Used for state that needs to be shared across multiple components in a specific feature.
- **Zustand**: Used for global application state that needs to be accessed across different features.

### Styling

Components are styled using Tailwind CSS, with additional custom styles when needed. The styling approach follows these principles:

1. Use Tailwind utility classes for most styling needs.
2. Use Shadcn UI components as a foundation for complex UI elements.
3. Create custom components when Shadcn UI doesn't provide the needed functionality.
4. Use CSS modules for complex custom styles that can't be easily achieved with Tailwind.

### Testing

Components are tested using Jest and React Testing Library, with a focus on testing behavior rather than implementation details. The testing approach includes:

1. Unit tests for individual components.
2. Integration tests for component interactions.
3. Snapshot tests for UI regression testing.
4. Accessibility tests to ensure components meet accessibility standards. 