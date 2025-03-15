'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  Filter,
  Columns3,
  Plus,
  CircleX,
  ListFilter,
  Upload,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DatasetActions } from './DatasetActions';

type DatasetVersion = {
  _id?: string;
  id?: string;
  versionNumber: number;
  status: string;
  createdAt: string;
  _doc?: {
    status: string;
    versionNumber: number;
    createdAt: string;
    [key: string]: any;
  };
};

type Dataset = {
  _id?: string;
  id?: string;
  filename: string;
  rowCount: number;
  columns: string[];
  createdAt: string;
  versions: DatasetVersion[];
};

export const DatasetTable: React.FC = () => {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [activeStatus, setActiveStatus] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search input to avoid too many API calls - increased to 500ms for smoother experience
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Show the search loading indicator immediately when typing
    if (searchQuery !== debouncedSearchQuery) {
      setSearchLoading(true);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Increased debounce time for smoother experience
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, debouncedSearchQuery]);

  // Fetch datasets when search query or status changes
  useEffect(() => {
    fetchDatasets(activeStatus, debouncedSearchQuery);
  }, [debouncedSearchQuery, activeStatus]);

  // Client-side filtering for immediate feedback while waiting for API
  const getFilteredDatasets = useCallback(() => {
    if (!searchQuery || searchQuery === debouncedSearchQuery) {
      return datasets;
    }
    
    // Simple client-side filtering for immediate feedback
    return datasets.filter(dataset => 
      dataset.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [datasets, searchQuery, debouncedSearchQuery]);

  const fetchDatasets = useCallback(async (status?: string, search?: string) => {
    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // Only show full loading state on initial load, not during search
    if (!searchLoading) {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      // Build the URL with query parameters
      let url = '/api/datasets';
      const params = new URLSearchParams();
      
      if (status) {
        params.append('status', status);
      }
      
      if (search && search.trim() !== '') {
        params.append('search', search.trim());
      }
      
      // Add params to URL if any exist
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url, {
        signal: abortControllerRef.current.signal
      });
      
      // Transform the data to ensure status is accessible
      const transformedDatasets = response.data.datasets.map((dataset: any) => {
        if (dataset.versions && dataset.versions.length > 0) {
          // Extract status from _doc if available
          if (dataset.versions[0]._doc && dataset.versions[0]._doc.status) {
            dataset.versions[0].status = dataset.versions[0]._doc.status;
          }
        }
        return dataset;
      });
      
      setDatasets(transformedDatasets);
    } catch (error: any) {
      // Don't set error if it was just an abort
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        console.error('Error fetching datasets:', error);
        setError('Failed to load datasets. Please try again.');
      }
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [searchLoading]);

  // Function to filter datasets based on status
  const filterDatasetsByStatus = (status: string | undefined) => {
    setActiveStatus(status);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
    // Clear the table's column filter since we're using server-side search
    if (table.getColumn("filename")) {
      table.getColumn("filename")?.setFilterValue("");
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchLoading(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const columns: ColumnDef<Dataset>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "filename",
      header: "Filename",
      cell: ({ row }) => <div className="font-medium">{row.getValue("filename")}</div>,
    },
    {
      accessorKey: "rowCount",
      header: "Rows",
      cell: ({ row }) => <div>{row.getValue<number>("rowCount").toLocaleString()}</div>,
    },
    {
      accessorKey: "columns",
      header: "Columns",
      cell: ({ row }) => <div>{row.getValue<string[]>("columns").length}</div>,
    },
    {
      accessorKey: "versions",
      header: "Version",
      cell: ({ row }) => {
        const versions = row.getValue<DatasetVersion[]>("versions");
        return <div>{versions && versions.length > 0 ? versions[0]?.versionNumber || 1 : 1}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const dataset = row.original;
        
        // Extract status from versions
        let status = 'draft';
        if (dataset.versions && dataset.versions.length > 0) {
          const version = dataset.versions[0];
          
          // Try to get status directly
          if (version.status) {
            status = version.status;
          } 
          // Try to get status from _doc
          else if (version._doc && version._doc.status) {
            status = version._doc.status;
          }
        }
        
        return (
          <Badge className={getStatusBadgeClass(status)}>
            {getStatusLabel(status)}
          </Badge>
        );
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => <div>{formatDate(row.getValue("createdAt"))}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const dataset = row.original;
        const datasetId = (dataset._id || dataset.id || '').toString();
        
        // Extract status from versions
        let status = 'draft';
        if (dataset.versions && dataset.versions.length > 0) {
          const version = dataset.versions[0];
          
          // Try to get status directly
          if (version.status) {
            status = version.status;
          } 
          // Try to get status from _doc
          else if (version._doc && version._doc.status) {
            status = version._doc.status;
          }
        }
        
        return (
          <DatasetActions 
            datasetId={datasetId} 
            filename={dataset.filename}
            status={status}
            onDelete={() => fetchDatasets(activeStatus, debouncedSearchQuery)}
            variant="dropdown"
          />
        );
      },
    },
  ];

  // Get filtered datasets for display
  const displayDatasets = searchQuery !== debouncedSearchQuery 
    ? getFilteredDatasets() 
    : datasets;

  const table = useReactTable({
    data: displayDatasets,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Search filter */}
          <div className="relative">
            <Input
              ref={inputRef}
              placeholder="Search datasets..."
              className="min-w-60 ps-9"
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search datasets"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
              {searchLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </div>
            {Boolean(searchQuery) && (
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 hover:text-foreground"
                aria-label="Clear search"
                onClick={clearSearch}
              >
                <CircleX size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
          </div>
          
          {/* Toggle columns visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3
                  className="-ms-1 me-2 opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Upload dataset button */}
          <Button asChild>
            <Link href="/upload">
              <Upload className="-ms-1 me-2" size={16} strokeWidth={2} aria-hidden="true" />
              Upload Dataset
            </Link>
          </Button>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={activeStatus === undefined ? "default" : "outline"}
          size="sm" 
          className="h-7 text-xs"
          onClick={() => filterDatasetsByStatus(undefined)}
        >
          All
        </Button>
        <Button 
          variant={activeStatus === "draft" ? "default" : "outline"}
          size="sm" 
          className="h-7 text-xs"
          onClick={() => filterDatasetsByStatus("draft")}
        >
          Draft
        </Button>
        <Button 
          variant={activeStatus === "review" ? "default" : "outline"}
          size="sm" 
          className="h-7 text-xs"
          onClick={() => filterDatasetsByStatus("review")}
        >
          Under Review
        </Button>
        <Button 
          variant={activeStatus === "published" ? "default" : "outline"}
          size="sm" 
          className="h-7 text-xs"
          onClick={() => filterDatasetsByStatus("published")}
        >
          Published
        </Button>
        <Button 
          variant={activeStatus === "rejected" ? "default" : "outline"}
          size="sm" 
          className="h-7 text-xs"
          onClick={() => filterDatasetsByStatus("rejected")}
        >
          Rejected
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            "flex cursor-pointer select-none items-center justify-between gap-2"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: (
                            <ChevronUp
                              className="shrink-0 opacity-60"
                              size={16}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          ),
                          desc: (
                            <ChevronDown
                              className="shrink-0 opacity-60"
                              size={16}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading && !searchLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading datasets...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  data-state={row.getIsSelected() && "selected"}
                  className={searchLoading ? "opacity-60 transition-opacity" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {searchQuery ? (
                      <p className="text-muted-foreground">
                        No datasets found matching "{searchQuery}". Try a different search term.
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        No datasets found. Start by uploading a dataset.
                      </p>
                    )}
                    <Button asChild>
                      <Link href="/upload">
                        <Upload className="-ms-1 me-2" size={16} strokeWidth={2} aria-hidden="true" />
                        Upload Dataset
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getRowModel().rows?.length > 0 && (
        <div className="flex items-center justify-between gap-8">
          {/* Results per page */}
          <div className="flex items-center gap-3">
            <Label htmlFor="per-page" className="max-sm:sr-only">
              Rows per page
            </Label>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger id="per-page" className="w-fit whitespace-nowrap">
                <SelectValue placeholder="Select number of results" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Page number information */}
          <div className="flex grow justify-end whitespace-nowrap text-sm text-muted-foreground">
            <p className="whitespace-nowrap text-sm text-muted-foreground" aria-live="polite">
              <span className="text-foreground">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getRowCount()
                )}
              </span>{" "}
              of <span className="text-foreground">{table.getRowCount().toString()}</span>
            </p>
          </div>

          {/* Pagination buttons */}
          <div>
            <Pagination>
              <PaginationContent>
                {/* First page button */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to first page"
                  >
                    <ChevronFirst size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                {/* Previous page button */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to previous page"
                  >
                    <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                {/* Next page button */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to next page"
                  >
                    <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                {/* Last page button */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to last page"
                  >
                    <ChevronLast size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}; 