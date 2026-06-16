import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearStr = searchParams.get('year');
  if (!yearStr) return NextResponse.json({ error: 'Year is required' }, { status: 400 });
  const year = parseInt(yearStr);

  try {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const expenses = await prisma.expense.findMany({
      where: {
        transactionDate: { gte: startDate, lte: endDate },
      },
    });

    const monthMap = new Map();
    for (let i = 1; i <= 12; i++) {
      monthMap.set(i, { month: i, expense: 0, income: 0 });
    }

    expenses.forEach((e) => {
      const m = parseInt(e.transactionDate.split('-')[1]);
      const data = monthMap.get(m);
      if (e.type === 'EXPENSE') data.expense += e.amount;
      else if (e.type === 'INCOME') data.income += e.amount;
    });

    const months = Array.from(monthMap.values()).sort((a, b) => a.month - b.month);
    
    return NextResponse.json({ year, months });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch monthly stats' }, { status: 500 });
  }
}
