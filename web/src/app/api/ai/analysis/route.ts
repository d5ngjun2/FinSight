import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const currStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const currEnd = `${year}-${String(month).padStart(2, '0')}-31`;
    const prevStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const prevEnd = `${prevYear}-${String(prevMonth).padStart(2, '0')}-31`;

    const [currExpenses, prevExpenses] = await Promise.all([
      prisma.expense.findMany({ where: { type: 'EXPENSE', transactionDate: { gte: currStart, lte: currEnd } } }),
      prisma.expense.findMany({ where: { type: 'EXPENSE', transactionDate: { gte: prevStart, lte: prevEnd } } })
    ]);

    const currTotal = currExpenses.reduce<number>((s, e) => s + e.amount, 0);
    const prevTotal = prevExpenses.reduce<number>((s, e) => s + e.amount, 0);

    const insights: { type: string; title: string; message: string; amount: number }[] = [];
    const savingTips: { category: string; changeRate: number; savingAmount: number; message: string }[] = [];
    const patternAlerts: { title: string; count: number; message: string }[] = [];
    let totalSavingPotential = 0;

    // 1. Overall comparison
    if (prevTotal > 0) {
      const increaseRate = ((currTotal - prevTotal) / prevTotal) * 100;
      if (increaseRate > 20) {
        insights.push({
          type: 'WARNING',
          title: '지출 급증 경고',
          message: `지난달 대비 지출이 ${increaseRate.toFixed(1)}% 증가했습니다. 예산 점검이 필요합니다.`,
          amount: currTotal - prevTotal
        });
      } else if (increaseRate < -10) {
        insights.push({
          type: 'SUCCESS',
          title: '지출 감소',
          message: `지난달 대비 지출이 ${Math.abs(increaseRate).toFixed(1)}% 감소했습니다. 훌륭합니다!`,
          amount: prevTotal - currTotal
        });
      }
    }

    // 2. Category Analysis
    const currCat = new Map();
    currExpenses.forEach(e => currCat.set(e.category, (currCat.get(e.category) || 0) + e.amount));
    
    const prevCat = new Map();
    prevExpenses.forEach(e => prevCat.set(e.category, (prevCat.get(e.category) || 0) + e.amount));

    currCat.forEach((currAmount, category) => {
      const prevAmount = prevCat.get(category) || 0;
      const portion = (currAmount / currTotal) * 100;

      if (portion > 40) {
        insights.push({
          type: 'WARNING',
          title: '특정 카테고리 편중',
          message: `이번 달 소비의 ${portion.toFixed(1)}%가 ${category}에 집중되어 있습니다.`,
          amount: currAmount
        });
      }

      if (prevAmount > 0) {
        const catIncrease = ((currAmount - prevAmount) / prevAmount) * 100;
        if (catIncrease > 30 && currAmount > 50000) {
          const potential = currAmount - prevAmount;
          savingTips.push({
            category,
            changeRate: catIncrease,
            savingAmount: potential,
            message: `${category} 지출이 전월 대비 크게 증가했습니다. 지난달 수준으로 줄이면 ${potential.toLocaleString()}원을 절약할 수 있습니다.`
          });
          totalSavingPotential += potential;
        }
      } else if (currAmount > 100000) {
        savingTips.push({
          category,
          changeRate: 100,
          savingAmount: currAmount * 0.2,
          message: `새로운 ${category} 지출이 발생했습니다. 20%만 줄여도 ${(currAmount * 0.2).toLocaleString()}원을 절약할 수 있습니다.`
        });
        totalSavingPotential += currAmount * 0.2;
      }
    });

    // 3. Pattern Alerts
    const titleCounts = new Map();
    currExpenses.forEach(e => {
      if (e.amount > 10000) {
        titleCounts.set(e.title, (titleCounts.get(e.title) || 0) + 1);
      }
    });
    
    titleCounts.forEach((count, title) => {
      if (count >= 3) {
        patternAlerts.push({
          title,
          count,
          message: `이번 달에 동일한 지출 내역이 ${count}회 발생했습니다. 정기 결제인지 확인해 보세요.`
        });
      }
    });

    // Summary logic
    let summary = '';
    if (insights.some(i => i.type === 'WARNING')) {
      summary = '전반적으로 지출이 증가하는 추세입니다. 불필요한 소비를 줄이고 예산을 재점검할 필요가 있습니다.';
    } else if (totalSavingPotential > 0) {
      summary = '몇 가지 소비 카테고리만 주의하면 목표 저축액을 달성할 수 있습니다.';
    } else {
      summary = '안정적인 소비 패턴을 유지하고 있습니다. 지금처럼 관리해 주세요!';
    }

    return NextResponse.json({
      summary,
      totalSavingPotential: Math.round(totalSavingPotential),
      insights,
      savingTips,
      patternAlerts
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate AI analysis' }, { status: 500 });
  }
}
