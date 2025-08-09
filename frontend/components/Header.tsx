'use client';

import { Compass, Globe, Info } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Compass className="w-8 h-8" />
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Travel Assistant</h1>
              <p className="text-sm text-primary-100">Your AI-Powered Travel Companion</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 hover:bg-primary-500 rounded-lg transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        
        {showInfo && (
          <div className="mt-4 p-4 bg-primary-500 rounded-lg">
            <h3 className="font-semibold mb-2">How to use Travel Assistant:</h3>
            <ul className="text-sm space-y-1 text-primary-100">
              <li>• Ask any travel-related question in the input box</li>
              <li>• Get instant, comprehensive answers powered by AI</li>
              <li>• View your query history below</li>
              <li>• Clear history anytime with the Clear History button</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}