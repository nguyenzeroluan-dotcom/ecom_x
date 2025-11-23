
import React from 'react';
import { GridViewProps } from './types';

const GridView = <T,>({ data, renderItem, gridClassName }: GridViewProps<T>) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${gridClassName || ''}`}>
      {data.map((item, index) => (
        <React.Fragment key={(item as any).id || index}>
          {renderItem(item)}
        </React.Fragment>
      ))}
    </div>
  );
};

export default GridView;
