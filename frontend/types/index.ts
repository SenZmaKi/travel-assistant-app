export interface Query {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
  processing_time?: number;
}

export interface QueryHistoryResponse {
  queries: Query[];
  total_count: number;
}