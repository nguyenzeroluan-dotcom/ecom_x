
import React from 'react';
import { TableViewProps } from './types';

const TableView = <T,>({ data, columns, onItemClick, rowClassName }: TableViewProps<T>) => {
  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={`px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.map((item, rowIdx) => (
            <tr 
              key={(item as any).id || rowIdx} 
              onClick={() => onItemClick && onItemClick(item)}
              className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${onItemClick ? 'cursor-pointer' : ''} ${rowClassName || ''}`}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`px-6 py-4 ${col.className || ''}`}>
                  {col.render 
                    ? col.render(item) 
                    : col.accessorKey 
                      ? String((item as any)[col.accessorKey]) 
                      : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;
