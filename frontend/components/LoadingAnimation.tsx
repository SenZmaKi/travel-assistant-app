'use client';

import { Plane, Globe, Compass, MapPin } from 'lucide-react';

export default function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-32 h-32">
        {/* Orbiting icons */}
        <div className="absolute inset-0 animate-spin-slow">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
            <Globe className="w-6 h-6 text-blue-500 animate-pulse" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2">
            <Compass className="w-6 h-6 text-purple-500 animate-pulse" />
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
            <MapPin className="w-6 h-6 text-pink-500 animate-pulse" />
          </div>
        </div>
        
        {/* Central plane */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-6 shadow-2xl">
              <Plane className="w-12 h-12 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text animate-float" 
                     style={{ fill: 'url(#gradient)' }} />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-2">
        <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
          Crafting your perfect answer...
        </p>
        <div className="flex items-center justify-center gap-1">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
}