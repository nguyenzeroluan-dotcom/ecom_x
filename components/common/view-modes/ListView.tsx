
import React from 'react';
import { ListViewProps } from './types';

const ListView = <T,>({ data, renderItem, listClassName }: ListViewProps<T>) => {
  return (
    <div className={`space-y-4 ${listClassName || ''}`}>
      {data.map((item, index) => (
        <React.Fragment key={(item as any).id || index}>
          {renderItem(item)}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ListView;
