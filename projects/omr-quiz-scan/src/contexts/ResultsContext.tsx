
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TestResult, Test } from '@/types/results';

interface ResultsContextType {
  results: TestResult[];
  setResults: React.Dispatch<React.SetStateAction<TestResult[]>>;
  tests: Test[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  expandedRows: Set<string>;
  setExpandedRows: React.Dispatch<React.SetStateAction<Set<string>>>;
  expandedTests: Set<string>;
  setExpandedTests: React.Dispatch<React.SetStateAction<Set<string>>>;
  sortOrder: 'none' | 'desc';
  setSortOrder: React.Dispatch<React.SetStateAction<'none' | 'desc'>>;
  reportRefs: React.MutableRefObject<{
    [key: string]: HTMLDivElement | null;
  }>;
  isDeleting: boolean;
  setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
  forceUpdate: number;
  setForceUpdate: React.Dispatch<React.SetStateAction<number>>;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

export const ResultsProvider = ({ children }: { children: ReactNode }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortOrder, setSortOrder] = useState<'none' | 'desc'>('desc');
  const [forceUpdate, setForceUpdate] = useState(0);
  const reportRefs = React.useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});

  return (
    <ResultsContext.Provider
      value={{
        results,
        setResults,
        tests,
        setTests,
        expandedRows,
        setExpandedRows,
        expandedTests,
        setExpandedTests,
        isDeleting,
        setIsDeleting,
        sortOrder,
        setSortOrder,
        reportRefs,
        forceUpdate,
        setForceUpdate,
      }}
    >
      {children}
    </ResultsContext.Provider>
  );
};

export const useResultsContext = () => {
  const context = useContext(ResultsContext);
  if (context === undefined) {
    throw new Error('useResultsContext must be used within a ResultsProvider');
  }
  return context;
};
