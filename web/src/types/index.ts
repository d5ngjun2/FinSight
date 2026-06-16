export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: TransactionType;
  description?: string;
  transactionDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface ExpenseRequest {
  title: string;
  amount: number;
  category: string;
  type: TransactionType;
  description?: string;
  transactionDate: string;
}

export interface MonthlyStatistics {
  year: number;
  months: MonthData[];
}

export interface MonthData {
  month: number;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryStatistics {
  year: number;
  month: number;
  totalExpense: number;
  categories: CategoryData[];
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

export interface AiAnalysis {
  summary: string;
  insights: Insight[];
  savingTips: SavingTip[];
  patternAlerts: PatternAlert[];
  totalSavingPotential: number;
}

export interface Insight {
  type: 'INFO' | 'WARNING' | 'SUCCESS';
  title: string;
  message: string;
  amount: number;
}

export interface SavingTip {
  category: string;
  message: string;
  savingAmount: number;
  changeRate: number;
}

export interface PatternAlert {
  title: string;
  count: number;
  totalAmount: number;
  message: string;
}

export const CATEGORIES = [
  '식비', '카페', '교통', '쇼핑', '생활', '취미', '여행', '통신', '의료', '기타'
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, string> = {
  '식비': '#FF6B6B',
  '카페': '#FF8C42',
  '교통': '#4ECDC4',
  '쇼핑': '#A78BFA',
  '생활': '#60A5FA',
  '취미': '#34D399',
  '여행': '#F59E0B',
  '통신': '#6B7280',
  '의료': '#EC4899',
  '기타': '#94A3B8',
};

export const CATEGORY_EMOJI: Record<string, string> = {
  '식비': '🍽️',
  '카페': '☕',
  '교통': '🚌',
  '쇼핑': '🛍️',
  '생활': '🏠',
  '취미': '🎮',
  '여행': '✈️',
  '통신': '📱',
  '의료': '🏥',
  '기타': '💼',
};
