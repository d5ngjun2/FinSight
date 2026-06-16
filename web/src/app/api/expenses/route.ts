import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  try {
    let expenses;
    if (year && month) {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
      const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-31`; // simplified

      expenses = await prisma.expense.findMany({
        where: {
          transactionDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { transactionDate: 'desc' },
      });
    } else {
      expenses = await prisma.expense.findMany({
        orderBy: { transactionDate: 'desc' },
      });
    }
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const expense = await prisma.expense.create({
      data: {
        title: data.title,
        amount: data.amount,
        category: data.category,
        type: data.type,
        description: data.description || null,
        transactionDate: data.transactionDate,
      },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
