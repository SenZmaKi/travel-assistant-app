'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {apiStatus !== 'checking' && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            apiStatus === 'online' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {apiStatus === 'online' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>API is online and ready</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                <span>API is offline. Please ensure the backend server is running on port 8000</span>
              </>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Ask Your Travel Question
          </h2>
          <QueryInput onSubmit={handleSubmit} isLoading={isLoading} />
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {isLoading && <LoadingAnimation />}
        
        {currentQuery && !isLoading && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Response</h2>
            <QueryResponse query={currentQuery} />
          </div>
        )}

        <QueryHistory queries={queries} onClearHistory={handleClearHistory} />
      </main>
      
      <Footer />
    </div>
  );
}