'use client';

import ReactMarkdown from 'react-markdown';
import { Clock, MapPin, Sparkles, Zap, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StreamingQueryResponseProps {
  question: string;
  streamingAnswer: string;
  isStreaming: boolean;
  timestamp: string;
  processingTime?: number;
}

export default function StreamingQueryResponse({ 
  question, 
  streamingAnswer, 
  isStreaming, 
  timestamp,
  processingTime 
}: StreamingQueryResponseProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setDisplayedText(streamingAnswer);
  }, [streamingAnswer]);

  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setShowCursor(false);
    }
  }, [isStreaming]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`group relative overflow-hidden rounded-2xl transition-all duration-500 ${
      isStreaming ? 'scale-[1.02]' : ''
    }`}>
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300 animate-gradient"></div>
      
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 card-hover">
        <div className="absolute top-4 right-4">
          <span className="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            {isStreaming ? 'Streaming...' : 'Latest'}
          </span>
        </div>
        
        <div className="mb-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 leading-tight flex-1">{question}</h3>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {formatDate(timestamp)}
            </span>
            {processingTime && !isStreaming && (
              <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-1 rounded-lg">
                <Zap className="w-3.5 h-3.5" />
                {processingTime.toFixed(2)}s
              </span>
            )}
            {isStreaming && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </span>
            )}
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full opacity-50"></div>
          <div className="prose prose-sm max-w-none text-gray-700 pl-4">
            <div className="markdown-content [&>ul]:space-y-2 [&>ol]:space-y-2 [&>p]:leading-relaxed min-h-[50px]">
              {displayedText ? (
                <>
                  <ReactMarkdown>{displayedText}</ReactMarkdown>
                  {isStreaming && showCursor && (
                    <span className="inline-block w-0.5 h-5 bg-purple-600 animate-pulse ml-1"></span>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-gray-400 italic">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Preparing response...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}