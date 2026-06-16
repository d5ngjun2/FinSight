import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearStr = searchParams.get('year');
  const monthStr = searchParams.get('month');

  if (!yearStr || !monthStr) return NextResponse.json({ error: 'Year and month are required' }, { status: 400 });

  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`; // simplified logic

    const expenses = await prisma.expense.findMany({
      where: {
        type: 'EXPENSE',
        transactionDate: { gte: startDate, lte: endDate },
      },
    });

    const categoryMap = new Map();
    let totalExpense = 0;

    expenses.forEach((e) => {
      totalExpense += e.amount;
      categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
    });

    const categories = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return NextResponse.json({ year, month, totalExpense, categories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch category stats' }, { status: 500 });
  }
}
