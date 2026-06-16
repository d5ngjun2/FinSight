'use client';

import { useQuery } from '@tanstack/react-query';
import { statisticsApi, aiApi } from '@/api/expenseApi';

export const useMonthlyStatistics = (year: number) =>
  useQuery({
    queryKey: ['statistics', 'monthly', year],
    queryFn: () => statisticsApi.getMonthly(year),
    staleTime: 1000 * 60 * 5,
  });

export const useCategoryStatistics = (year: number, month: number) =>
  useQuery({
    queryKey: ['statistics', 'category', year, month],
    queryFn: () => statisticsApi.getCategory(year, month),
    staleTime: 1000 * 60 * 5,
  });

export const useAiAnalysis = () =>
  useQuery({
    queryKey: ['ai', 'analysis'],
    queryFn: () => aiApi.getAnalysis(),
    staleTime: 1000 * 60 * 10,
  });
