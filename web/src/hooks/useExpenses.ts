'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '@/api/expenseApi';
import type { ExpenseRequest } from '@/types';

export const useExpensesByMonth = (year: number, month: number) =>
  useQuery({
    queryKey: ['expenses', 'month', year, month],
    queryFn: () => expenseApi.getByMonth(year, month),
    staleTime: 1000 * 60,
  });

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ExpenseRequest) => expenseApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
};

export const useUpdateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExpenseRequest }) => expenseApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => expenseApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
};
