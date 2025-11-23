
import React from 'react';

export type ViewMode = 'grid' | 'list' | 'table';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface BaseViewProps<T> {
  data: T[];
  isLoading?: boolean;
  emptyMessage?: React.ReactNode;
  onItemClick?: (item: T) => void;
}

export interface GridViewProps<T> extends BaseViewProps<T> {
  renderItem: (item: T) => React.ReactNode;
  gridClassName?: string; // Override default grid cols
}

export interface ListViewProps<T> extends BaseViewProps<T> {
  renderItem: (item: T) => React.ReactNode;
  listClassName?: string;
}

export interface TableViewProps<T> extends BaseViewProps<T> {
  columns: ColumnDef<T>[];
  rowClassName?: string;
}

export interface DataViewContainerProps<T> extends BaseViewProps<T> {
  mode: ViewMode;
  gridView?: Omit<GridViewProps<T>, 'data' | 'isLoading' | 'emptyMessage' | 'onItemClick' | 'mode'>;
  listView?: Omit<ListViewProps<T>, 'data' | 'isLoading' | 'emptyMessage' | 'onItemClick' | 'mode'>;
  tableView?: Omit<TableViewProps<T>, 'data' | 'isLoading' | 'emptyMessage' | 'onItemClick' | 'mode'>;
}
