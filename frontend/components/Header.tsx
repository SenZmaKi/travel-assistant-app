"use client";

import { Compass, Globe, Info, Sparkles, MapPin, Plane } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient"></div>
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
              <Link href="/">
                <div className="relative flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                  <Compass className="w-8 h-8 text-white animate-pulse" />
                  <Globe className="w-6 h-6 text-white/90 animate-float" />
                </div>
              </Link>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Travel Assistant
                </h1>
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-sm text-white/80 font-medium">
                Your AI-Powered Travel Companion
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="group p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl transition-all duration-300 border border-white/20"
          >
            <Info className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          </button>
        </div>

        {showInfo && (
          <div className="mt-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2 mb-3">
              <Plane className="w-5 h-5 text-white" />
              <h3 className="font-semibold text-white text-lg">
                How to use Travel Assistant
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-yellow-300 mt-1 flex-shrink-0" />
                <p className="text-sm text-white/90">
                  Ask any travel-related question
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-yellow-300 mt-1 flex-shrink-0" />
                <p className="text-sm text-white/90">
                  Get instant AI-powered answers
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-yellow-300 mt-1 flex-shrink-0" />
                <p className="text-sm text-white/90">View your query history</p>
              </div>
              <div className="flex items-start gap-2">
                <Compass className="w-4 h-4 text-yellow-300 mt-1 flex-shrink-0" />
                <p className="text-sm text-white/90">Clear history anytime</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
