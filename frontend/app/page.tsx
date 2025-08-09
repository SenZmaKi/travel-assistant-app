'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Plane, Sparkles, Globe, MapPin, Compass } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QueryInput from '@/components/QueryInput';
import QueryResponse from '@/components/QueryResponse';
import QueryHistory from '@/components/QueryHistory';
import LoadingAnimation from '@/components/LoadingAnimation';
import { travelAPI } from '@/lib/api';
import { Query } from '@/types';

export default function Home() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [currentQuery, setCurrentQuery] = useState<Query | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkAPIStatus();
    loadHistory();
  }, []);

  const checkAPIStatus = async () => {
    const isHealthy = await travelAPI.checkHealth();
    setApiStatus(isHealthy ? 'online' : 'offline');
  };

  const loadHistory = async () => {
    try {
      const history = await travelAPI.getHistory(10);
      setQueries(history.queries);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleSubmit = async (question: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuery(null);

    try {
      const response = await travelAPI.askQuestion(question);
      setCurrentQuery(response);
      setQueries(prev => [response, ...prev]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await travelAPI.clearHistory();
      setQueries([]);
      setCurrentQuery(null);
    } catch (err) {
      setError('Failed to clear history');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Globe className="w-96 h-96 text-blue-500 animate-float" />
          </div>
          <div className="relative z-10 py-12">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-3">
                <Plane className="w-10 h-10 text-blue-600 animate-pulse" />
                <Compass className="w-8 h-8 text-purple-600 animate-float" />
                <MapPin className="w-8 h-8 text-pink-600 animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Where will you explore today?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get instant, AI-powered answers to all your travel questions. From visa requirements to destination tips, I'm here to help!
            </p>
            
            {apiStatus !== 'checking' && (
              <div className="mt-6 inline-flex items-center gap-2">
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm ${
                  apiStatus === 'online' 
                    ? 'bg-green-500/10 text-green-700 border border-green-300' 
                    : 'bg-red-500/10 text-red-700 border border-red-300'
                }`}>
                  {apiStatus === 'online' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">System Online</span>
                      <Sparkles className="w-3 h-3 text-yellow-500" />
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Backend Offline - Start server on port 8000</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-20 animate-gradient"></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Ask Your Travel Question
              </h2>
            </div>
            <QueryInput onSubmit={handleSubmit} isLoading={isLoading} />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {isLoading && <LoadingAnimation />}
        
        {currentQuery && !isLoading && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Latest Response</h2>
            </div>
            <QueryResponse query={currentQuery} isLatest={true} />
          </div>
        )}

        <QueryHistory queries={queries} onClearHistory={handleClearHistory} />
      </main>
      
      <Footer />
    </div>
  );
}