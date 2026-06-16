'use client';

import { useMemo } from 'react';
import type { Expense } from '@/types';
import { formatAmountShort } from '@/utils/formatters';

interface Props {
  year: number;
  month: number;
  expenses: Expense[];
  onDayClick: (date: string) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarView({ year, month, expenses, onDayClick }: Props) {
  const today = new Date();

  const dailySummary = useMemo(() => {
    const map: Record<string, { expense: number; income: number; count: number }> = {};
    expenses.forEach(e => {
      const key = e.transactionDate;
      if (!map[key]) map[key] = { expense: 0, income: 0, count: 0 };
      if (e.type === 'EXPENSE') map[key].expense += e.amount;
      else map[key].income += e.amount;
      map[key].count++;
    });
    return map;
  }, [expenses]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [year, month]);

  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === day;

  const getDateStr = (day: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getDayColor = (colIdx: number) => {
    if (colIdx === 0) return '#F04452'; // 일요일 빨강
    if (colIdx === 6) return '#3182F6'; // 토요일 파랑
    return '#8B95A1';
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E8EB', overflow: 'hidden' }}>
      {/* 요일 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E5E8EB' }}>
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            style={{
              padding: '10px 0',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: getDayColor(i),
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {calendarDays.map((day, idx) => {
          const colIdx = idx % 7;
          const isLastCol = colIdx === 6;

          if (!day) {
            return (
              <div
                key={`empty-${idx}`}
                style={{
                  minHeight: 72,
                  borderBottom: '1px solid #E5E8EB',
                  borderRight: isLastCol ? 'none' : '1px solid #E5E8EB',
                  background: '#fafafa',
                }}
              />
            );
          }

          const dateStr = getDateStr(day);
          const summary = dailySummary[dateStr];
          const isTodayCell = isToday(day);

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              style={{
                minHeight: 72,
                padding: 6,
                borderBottom: '1px solid #E5E8EB',
                borderRight: isLastCol ? 'none' : '1px solid #E5E8EB',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                position: 'relative',
                background: isTodayCell ? '#EBF2FF' : '#fff',
                cursor: 'pointer',
                transition: 'background 0.1s',
                border: 'none',
                outline: 'none',
              }}
              onMouseEnter={e => {
                if (!isTodayCell) (e.currentTarget as HTMLButtonElement).style.background = '#F8F9FA';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = isTodayCell ? '#EBF2FF' : '#fff';
              }}
            >
              {/* 날짜 숫자 */}
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 4,
                  background: isTodayCell ? '#3182F6' : 'transparent',
                  color: isTodayCell ? '#fff' : getDayColor(colIdx),
                  flexShrink: 0,
                }}
              >
                {day}
              </span>

              {/* 지출/수입 금액 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                {summary?.expense > 0 && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#191F28',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    -{formatAmountShort(summary.expense)}
                  </span>
                )}
                {summary?.income > 0 && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#05C072',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    +{formatAmountShort(summary.income)}
                  </span>
                )}
              </div>

              {/* 건수 dot */}
              {summary && summary.count > 0 && (
                <div style={{ position: 'absolute', bottom: 5, right: 5, display: 'flex', gap: 2 }}>
                  {Array.from({ length: Math.min(summary.count, 3) }).map((_, i) => (
                    <div key={i} style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: '#3182F6', opacity: 0.5,
                    }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
