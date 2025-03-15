"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ListFilter } from "lucide-react";
import { nanoid } from "nanoid";
import * as React from "react";
import { AnimateChangeInHeight } from "@/components/ui/filters";
import Filters from "@/components/ui/filters";
import {
  DueDate,
  Filter,
  FilterOperator,
  FilterOption,
  FilterType,
  filterViewOptions,
  filterViewToFilterOptions,
  Status,
} from "@/components/ui/filters";

// Dataset-specific filter types
export enum DatasetFilterType {
  STATUS = "Status",
  CREATED_DATE = "Created date",
  ROW_COUNT = "Row count",
  COLUMN_COUNT = "Column count",
}

// Dataset-specific status options
export const datasetStatusOptions: FilterOption[] = [
  { name: Status.DRAFT, icon: undefined },
  { name: Status.SUBMITTED, icon: undefined },
  { name: Status.PENDING_REVIEW, icon: undefined },
  { name: Status.APPROVED, icon: undefined },
  { name: Status.PUBLISHED, icon: undefined },
  { name: Status.REJECTED, icon: undefined },
];

// Dataset-specific filter view options
export const datasetFilterViewOptions: FilterOption[][] = [
  [
    {
      name: DatasetFilterType.STATUS,
      icon: undefined,
    },
    {
      name: DatasetFilterType.CREATED_DATE,
      icon: undefined,
    },
    {
      name: DatasetFilterType.ROW_COUNT,
      icon: undefined,
    },
    {
      name: DatasetFilterType.COLUMN_COUNT,
      icon: undefined,
    },
  ],
];

// Map dataset filter types to options
export const datasetFilterViewToFilterOptions: Record<string, FilterOption[]> = {
  [DatasetFilterType.STATUS]: datasetStatusOptions,
  [DatasetFilterType.CREATED_DATE]: filterViewToFilterOptions[FilterType.CREATED_DATE],
  [DatasetFilterType.ROW_COUNT]: [],
  [DatasetFilterType.COLUMN_COUNT]: [],
};

export function FiltersDemo() {
  const [open, setOpen] = React.useState(false);
  const [selectedView, setSelectedView] = React.useState<string | null>(
    null
  );
  const [commandInput, setCommandInput] = React.useState("");
  const commandInputRef = React.useRef<HTMLInputElement>(null);
  const [filters, setFilters] = React.useState<Filter[]>([]);

  // Use dataset-specific filter options
  const filterOptions = datasetFilterViewOptions;
  const filterToOptions = datasetFilterViewToFilterOptions;

  return (
    <div className="flex gap-2 flex-wrap">
      <Filters filters={filters} setFilters={setFilters} />
      {filters.filter((filter) => filter.value?.length > 0).length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="transition group h-6 text-xs items-center rounded-sm"
          onClick={() => setFilters([])}
        >
          Clear
        </Button>
      )}
      <Popover
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setTimeout(() => {
              setSelectedView(null);
              setCommandInput("");
            }, 200);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            size="sm"
            className={cn(
              "transition group h-6 text-xs items-center rounded-sm flex gap-1.5 items-center",
              filters.length > 0 && "w-6"
            )}
          >
            <ListFilter className="size-3 shrink-0 transition-all text-muted-foreground group-hover:text-primary" />
            {!filters.length && "Advanced Filter"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <AnimateChangeInHeight>
            <Command>
              <CommandInput
                placeholder={selectedView ? selectedView : "Filter..."}
                className="h-9"
                value={commandInput}
                onInputCapture={(e) => {
                  setCommandInput(e.currentTarget.value);
                }}
                ref={commandInputRef}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {selectedView ? (
                  <CommandGroup>
                    {filterToOptions[selectedView]?.map(
                      (filter: FilterOption) => (
                        <CommandItem
                          className="group text-muted-foreground flex gap-2 items-center"
                          key={filter.name}
                          value={filter.name.toString()}
                          onSelect={(currentValue) => {
                            setFilters((prev) => [
                              ...prev,
                              {
                                id: nanoid(),
                                type: selectedView as FilterType,
                                operator:
                                  selectedView === FilterType.DUE_DATE &&
                                  currentValue !== DueDate.IN_THE_PAST
                                    ? FilterOperator.BEFORE
                                    : FilterOperator.IS,
                                value: [currentValue],
                              },
                            ]);
                            setTimeout(() => {
                              setSelectedView(null);
                              setCommandInput("");
                            }, 200);
                            setOpen(false);
                          }}
                        >
                          {filter.icon}
                          <span className="text-accent-foreground">
                            {filter.name}
                          </span>
                          {filter.label && (
                            <span className="text-muted-foreground text-xs ml-auto">
                              {filter.label}
                            </span>
                          )}
                        </CommandItem>
                      )
                    )}
                  </CommandGroup>
                ) : (
                  filterOptions.map(
                    (group: FilterOption[], index: number) => (
                      <React.Fragment key={index}>
                        <CommandGroup>
                          {group.map((filter: FilterOption) => (
                            <CommandItem
                              className="group text-muted-foreground flex gap-2 items-center"
                              key={filter.name}
                              value={filter.name.toString()}
                              onSelect={(currentValue) => {
                                setSelectedView(currentValue);
                                setCommandInput("");
                                commandInputRef.current?.focus();
                              }}
                            >
                              {filter.icon}
                              <span className="text-accent-foreground">
                                {filter.name}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {index < filterOptions.length - 1 && (
                          <CommandSeparator />
                        )}
                      </React.Fragment>
                    )
                  )
                )}
              </CommandList>
            </Command>
          </AnimateChangeInHeight>
        </PopoverContent>
      </Popover>
    </div>
  );
} 