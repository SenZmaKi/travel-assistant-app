'use client';

import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <span>Built with</span>
          <Heart className="w-4 h-4 text-red-500 fill-current" />
          <span>using Next.js, FastAPI & Gemini AI</span>
        </div>
      </div>
    </footer>
  );
}