'use client';

import { Heart, Code2, Sparkles, Github, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-purple-50 to-blue-50"></div>
      <div className="relative border-t border-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
                <Code2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Built with</span>
                <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-purple-200/50">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Powered by AI</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Next.js 14
              </span>
              <span className="text-gray-400">•</span>
              <span>FastAPI</span>
              <span className="text-gray-400">•</span>
              <span>Gemini AI</span>
              <span className="text-gray-400">•</span>
              <span>TailwindCSS</span>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                © 2025 Travel Assistant - Your journey starts here
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}