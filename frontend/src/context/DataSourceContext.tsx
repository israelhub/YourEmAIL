import React, { createContext, useContext, useState } from 'react';

export type DataSource = 'google' | 'mock';

interface DataSourceContextValue {
  source: DataSource;
  setSource: (src: DataSource) => void;
}

const DataSourceContext = createContext<DataSourceContextValue | undefined>(undefined);

export const DataSourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [source, setSource] = useState<DataSource>('google');

  return (
    <DataSourceContext.Provider value={{ source, setSource }}>
      {children}
    </DataSourceContext.Provider>
  );
};

export const useDataSource = (): DataSourceContextValue => {
  const ctx = useContext(DataSourceContext);
  if (!ctx) throw new Error('useDataSource must be used within DataSourceProvider');
  return ctx;
};
