'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useExpensesByMonth } from '@/hooks/useExpenses';
import CalendarView from '@/components/calendar/CalendarView';
import ExpenseModal from '@/components/expense/ExpenseModal';
import { formatAmount } from '@/utils/formatters';
import { CATEGORY_EMOJI } from '@/types';
import type { Expense } from '@/types';

const SummaryCard = ({
  icon, label, value, iconBg, iconColor, valueColor,
}: {
  icon: React.ReactNode; label: string; value: string;
  iconBg: string; iconColor: string; valueColor: string;
}) => (
  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E8EB', padding: '14px 16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>
        {icon}
      </div>
      <span style={{ fontSize: 11, color: '#8B95A1', fontWeight: 500 }}>{label}</span>
    </div>
    <p style={{ fontSize: 16, fontWeight: 700, color: valueColor, lineHeight: 1 }}>{value}</p>
  </div>
);

export default function DashboardPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: expenses = [], isLoading } = useExpensesByMonth(year, month);

  const summary = useMemo(() => {
    const totalExpense = expenses.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0);
    const totalIncome  = expenses.filter(e => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayExpense = expenses
      .filter(e => e.type === 'EXPENSE' && e.transactionDate === todayStr)
      .reduce((s, e) => s + e.amount, 0);
    return { totalExpense, totalIncome, todayExpense };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses]);

  const selectedExpenses: Expense[] = useMemo(() => {
    if (!selectedDate) return [];
    return expenses.filter(e => e.transactionDate === selectedDate);
  }, [selectedDate, expenses]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const openToday = () => {
    const s = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDate(s);
  };

  const fmtAmt = (n: number) => n > 0 ? `${(n / 10000).toFixed(0)}만원` : '0원';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 24px', animation: 'fadeIn 0.25s ease-out' }}>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#191F28' }}>가계부</h1>
        <p style={{ fontSize: 14, color: '#8B95A1', marginTop: 2 }}>{year}년 {month}월 소비 현황</p>
      </div>

      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <SummaryCard
          icon={<TrendingDown size={14} />}
          label="오늘 지출" iconBg="#FFF0F1" iconColor="#F04452" valueColor="#191F28"
          value={isLoading ? '---' : summary.todayExpense > 0 ? `${(summary.todayExpense / 10000).toFixed(1)}만` : '0원'}
        />
        <SummaryCard
          icon={<Wallet size={14} />}
          label="이달 지출" iconBg="#EBF2FF" iconColor="#3182F6" valueColor="#191F28"
          value={isLoading ? '---' : fmtAmt(summary.totalExpense)}
        />
        <SummaryCard
          icon={<TrendingUp size={14} />}
          label="이달 수입" iconBg="#E8FFF4" iconColor="#05C072" valueColor="#05C072"
          value={isLoading ? '---' : fmtAmt(summary.totalIncome)}
        />
      </div>

      {/* 월 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={prevMonth}
            style={{ width: 34, height: 34, borderRadius: 10, background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
          >
            <ChevronLeft size={18} color="#8B95A1" />
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#191F28', padding: '0 8px', minWidth: 80, textAlign: 'center' }}>
            {year}년 {month}월
          </span>
          <button
            onClick={nextMonth}
            style={{ width: 34, height: 34, borderRadius: 10, background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
          >
            <ChevronRight size={18} color="#8B95A1" />
          </button>
        </div>
        <button
          onClick={openToday}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: 12, background: '#3182F6', color: '#fff',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
          }}
        >
          <Plus size={14} />
          추가
        </button>
      </div>

      {/* 캘린더 */}
      {isLoading ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E8EB', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
          <span style={{ fontSize: 13, color: '#B0B8C1' }}>불러오는 중...</span>
        </div>
      ) : (
        <CalendarView year={year} month={month} expenses={expenses} onDayClick={setSelectedDate} />
      )}

      {/* 최근 지출 목록 */}
      {!isLoading && expenses.filter(e => e.type === 'EXPENSE').length > 0 && (
        <div style={{ marginTop: 20, background: '#fff', borderRadius: 16, border: '1px solid #E5E8EB', padding: '16px 16px 8px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#191F28', marginBottom: 10 }}>최근 지출</h3>
          {[...expenses]
            .filter(e => e.type === 'EXPENSE')
            .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate))
            .slice(0, 5)
            .map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedDate(e.transactionDate)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 8px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer',
                  marginBottom: 4,
                }}
                onMouseEnter={ev => (ev.currentTarget as HTMLButtonElement).style.background = '#F8F9FA'}
                onMouseLeave={ev => (ev.currentTarget as HTMLButtonElement).style.background = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{CATEGORY_EMOJI[e.category] || '💼'}</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#191F28' }}>{e.title}</p>
                    <p style={{ fontSize: 11, color: '#B0B8C1' }}>{e.transactionDate.slice(5).replace('-', '/')} · {e.category}</p>
                  </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#191F28' }}>-{formatAmount(e.amount)}</span>
              </button>
            ))}
        </div>
      )}

      {selectedDate && (
        <ExpenseModal
          date={selectedDate}
          expenses={selectedExpenses}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
