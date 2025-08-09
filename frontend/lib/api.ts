import axios from 'axios';
import { Query, QueryHistoryResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const travelAPI = {
  async askQuestion(question: string): Promise<Query> {
    const response = await api.post<Query>('/api/query', { question });
    return response.data;
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