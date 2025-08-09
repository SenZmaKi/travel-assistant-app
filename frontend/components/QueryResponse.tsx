'use client';

import ReactMarkdown from 'react-markdown';
import { Clock, MapPin } from 'lucide-react';
import { Query } from '@/types';

interface QueryResponseProps {
  query: Query;
}

export default function QueryResponse({ query }: QueryResponseProps) {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
          <h3 className="text-lg font-semibold text-gray-800">{query.question}</h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDate(query.timestamp)}
          </span>
          {query.processing_time && (
            <span>Response time: {query.processing_time.toFixed(2)}s</span>
          )}
        </div>
      </div>
      
      <div className="prose prose-sm max-w-none text-gray-700">
        <div className="markdown-content">
          <ReactMarkdown>{query.answer}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}