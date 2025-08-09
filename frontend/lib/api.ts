import axios from 'axios';
import { Query, QueryHistoryResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface StreamCallbacks {
  onMetadata?: (data: { id: string; question: string; timestamp: string }) => void;
  onContent?: (content: string) => void;
  onDone?: (processingTime: number) => void;
  onError?: (error: string) => void;
}

export const travelAPI = {
  async askQuestion(question: string): Promise<Query> {
    const response = await api.post<Query>('/api/query', { question });
    return response.data;
  },

  async askQuestionStream(question: string, callbacks: StreamCallbacks): Promise<void> {
    const response = await fetch(`${API_URL}/api/query/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error('Stream request failed');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          if (jsonStr.trim()) {
            try {
              const data = JSON.parse(jsonStr);
              
              switch (data.type) {
                case 'metadata':
                  callbacks.onMetadata?.(data);
                  break;
                case 'content':
                  callbacks.onContent?.(data.content);
                  break;
                case 'done':
                  callbacks.onDone?.(data.processing_time);
                  break;
                case 'error':
                  callbacks.onError?.(data.error);
                  break;
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    }
  },

  async getHistory(limit: number = 10, offset: number = 0): Promise<QueryHistoryResponse> {
    const response = await api.get<QueryHistoryResponse>('/api/history', {
      params: { limit, offset }
    });
    return response.data;
  },

  async clearHistory(): Promise<void> {
    await api.delete('/api/history');
  },

  async checkHealth(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.data.status === 'healthy';
    } catch {
      return false;
    }
  }
};