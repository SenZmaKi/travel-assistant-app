'use client';

import { useState } from 'react';
import { Send, Loader2, Sparkles, MapPin } from 'lucide-react';

interface QueryInputProps {
  onSubmit: (question: string) => Promise<void>;
  isLoading: boolean;
}

const sampleQuestions = [
  "What documents do I need for a UK visa?",
  "Best time to visit Japan?",
  "Travel requirements from Kenya to Ireland",
  "How to apply for Schengen visa?"
];

export default function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [question, setQuestion] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      await onSubmit(question);
      setQuestion('');
    }
  };

  const handleSampleClick = (sample: string) => {
    setQuestion(sample);
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="w-full">
        <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 animate-gradient"></div>
          <div className="relative bg-white rounded-2xl shadow-xl">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask me anything about travel... ✈️"
              className="w-full p-6 pr-16 bg-transparent rounded-2xl focus:outline-none resize-none h-32 text-gray-800 placeholder-gray-400 font-medium"
              disabled={isLoading}
            />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className={`absolute bottom-4 right-4 p-3 rounded-xl transition-all duration-300 transform
                ${isLoading || !question.trim() 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-110 hover:shadow-lg active:scale-95'}`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Try asking:
        </span>
        {sampleQuestions.map((sample, index) => (
          <button
            key={index}
            onClick={() => handleSampleClick(sample)}
            className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 rounded-full hover:from-blue-100 hover:to-purple-100 transition-all duration-200 border border-purple-200/50 font-medium"
          >
            {sample}
          </button>
        ))}
      </div>
    </div>
  );
}