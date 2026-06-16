import axios from 'axios';
import type { Expense, ExpenseRequest, MonthlyStatistics, CategoryStatistics, AiAnalysis } from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// 지출/수입 API
export const expenseApi = {
  getAll: () => api.get<Expense[]>('/expenses').then(r => r.data),
  getByMonth: (year: number, month: number) =>
    api.get<Expense[]>('/expenses', { params: { year, month } }).then(r => r.data),
  getById: (id: number) => api.get<Expense>(`/expenses/${id}`).then(r => r.data),
  create: (data: ExpenseRequest) => api.post<Expense>('/expenses', data).then(r => r.data),
  update: (id: number, data: ExpenseRequest) => api.put<Expense>(`/expenses/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/expenses/${id}`),
};

// 통계 API
export const statisticsApi = {
  getMonthly: (year: number) =>
    api.get<MonthlyStatistics>('/statistics/monthly', { params: { year } }).then(r => r.data),
  getCategory: (year: number, month: number) =>
    api.get<CategoryStatistics>('/statistics/category', { params: { year, month } }).then(r => r.data),
};

// AI 분석 API
export const aiApi = {
  getAnalysis: () => api.get<AiAnalysis>('/ai/analysis').then(r => r.data),
};
