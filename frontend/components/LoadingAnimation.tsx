'use client';

import { Plane } from 'lucide-react';

export default function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-primary-200 rounded-full animate-pulse"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center w-20 h-20">
          <Plane className="w-10 h-10 text-primary-500 animate-pulse-slow" />
        </div>
      </div>
      <p className="mt-4 text-gray-600 animate-pulse">Thinking about your travel query...</p>
    </div>
  );
}