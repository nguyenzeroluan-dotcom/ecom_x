
import React from 'react';
import { DataViewContainerProps } from './types';
import GridView from './GridView';
import ListView from './ListView';
import TableView from './TableView';

const DataViewContainer = <T,>({ 
  data, 
  isLoading, 
  emptyMessage, 
  mode, 
  gridView, 
  listView, 
  tableView,
  onItemClick
}: DataViewContainerProps<T>) => {

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
          <p className="text-slate-500 text-sm font-medium">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px] bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
        {typeof emptyMessage === 'string' ? (
          <>
            <i className="fas fa-box-open text-4xl text-slate-300 mb-3"></i>
            <p className="text-slate-500 text-lg">{emptyMessage}</p>
          </>
        ) : (
          emptyMessage || <p className="text-slate-500">No data available.</p>
        )}
      </div>
    );
  }

  switch (mode) {
    case 'grid':
      if (!gridView) return null;
      return <GridView data={data} onItemClick={onItemClick} {...gridView} />;
    case 'list':
      if (!listView) return null;
      return <ListView data={data} onItemClick={onItemClick} {...listView} />;
    case 'table':
      if (!tableView) return null;
      return <TableView data={data} onItemClick={onItemClick} {...tableView} />;
    default:
      return null;
  }
};

export default DataViewContainer;
