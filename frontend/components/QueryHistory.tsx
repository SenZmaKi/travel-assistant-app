'use client';

import { useState, useEffect } from 'react';
import { History, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Query } from '@/types';
import QueryResponse from './QueryResponse';

interface QueryHistoryProps {
  queries: Query[];
  onClearHistory: () => void;
}

export default function QueryHistory({ queries, onClearHistory }: QueryHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayedQueries, setDisplayedQueries] = useState<Query[]>([]);

  useEffect(() => {
    setDisplayedQueries(queries.slice(0, isExpanded ? queries.length : 3));
  }, [queries, isExpanded]);

  if (queries.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary-500" />
          <h2 className="text-xl font-semibold text-gray-800">Recent Queries</h2>
          <span className="text-sm text-gray-500">({queries.length})</span>
        </div>
        <div className="flex gap-2">
          {queries.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show All <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
          <button
            onClick={onClearHistory}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {displayedQueries.map((query) => (
          <QueryResponse key={query.id} query={query} />
        ))}
      </div>
    </div>
  );
}