'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface QueryInputProps {
  onSubmit: (question: string) => Promise<void>;
  isLoading: boolean;
}

export default function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      await onSubmit(question);
      setQuestion('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me anything about travel... (e.g., 'What documents do I need to travel from Kenya to Ireland?')"
          className="w-full p-4 pr-12 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none h-24 text-gray-800 placeholder-gray-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="absolute bottom-3 right-3 p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
}