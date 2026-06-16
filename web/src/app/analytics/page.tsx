'use client';

import { useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, Legend
} from 'recharts';
import { useMonthlyStatistics, useCategoryStatistics } from '@/hooks/useStatistics';
import { CATEGORY_COLORS, CATEGORY_EMOJI } from '@/types';
import { formatAmount } from '@/utils/formatters';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Btn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} style={{ width: 28, height: 28, borderRadius: 8, background: '#F2F4F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {children}
  </button>
);

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E8EB', padding: 20, ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#191F28', marginBottom: 16 }}>{children}</h3>
);

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E8EB', borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      {payload.map((p: any) => (
        <p key={p.name} style={{ fontSize: 13, color: p.color, fontWeight: 500 }}>
          {p.name}: {formatAmount(Number(p.value))}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const { data: monthly, isLoading: monthlyLoading } = useMonthlyStatistics(year);
  const { data: category, isLoading: catLoading }    = useCategoryStatistics(year, month);

  const monthlyData = monthly?.months.map(m => ({
    name: `${m.month}월`, 지출: m.expense, 수입: m.income,
  })) || [];

  const pieData = category?.categories.map(c => ({
    name: c.category, value: c.amount, percentage: c.percentage,
  })) || [];

  const topCategory = category?.categories[0];
  const totalExpense = monthly?.months.reduce((s, m) => s + m.expense, 0) || 0;
  const validMonths = monthly?.months.filter(m => m.expense > 0).length || 1;
  const avgMonthExpense = Math.round(totalExpense / validMonths);

  const Loading = () => (
    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B0B8C1', fontSize: 13 }}>
      불러오는 중...
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.25s ease-out' }}>

      {/* 헤더 */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#191F28' }}>소비 분석</h1>
        <p style={{ fontSize: 14, color: '#8B95A1', marginTop: 2 }}>소비 패턴을 한눈에 확인하세요</p>
      </div>

      {/* 연도/월 선택 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #E5E8EB', borderRadius: 12, padding: '6px 10px' }}>
          <Btn onClick={() => setYear(y => y - 1)}><ChevronLeft size={14} color="#8B95A1" /></Btn>
          <span style={{ fontSize: 13, fontWeight: 600, width: 48, textAlign: 'center', color: '#191F28' }}>{year}년</span>
          <Btn onClick={() => setYear(y => y + 1)}><ChevronRight size={14} color="#8B95A1" /></Btn>
        </div>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', flex: 1 }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <button
              key={m}
              onClick={() => setMonth(m)}
              style={{
                padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                whiteSpace: 'nowrap', cursor: 'pointer', border: 'none',
                background: month === m ? '#3182F6' : 'transparent',
                color: month === m ? '#fff' : '#8B95A1',
                transition: 'all 0.12s',
              }}
            >
              {m}월
            </button>
          ))}
        </div>
      </div>

      {/* 요약 카드 2개 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { label: '이달 총 지출', value: catLoading ? '---' : formatAmount(category?.totalExpense || 0) },
          { label: '월 평균 지출', value: monthlyLoading ? '---' : formatAmount(avgMonthExpense) },
        ].map(({ label, value }) => (
          <Card key={label} style={{ padding: '16px' }}>
            <p style={{ fontSize: 11, color: '#8B95A1', fontWeight: 500, marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#191F28' }}>{value}</p>
          </Card>
        ))}
      </div>

      {/* 최다 소비 카테고리 배너 */}
      {topCategory && (
        <div style={{ background: 'linear-gradient(135deg, #3182F6, #1B64DA)', borderRadius: 16, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>{CATEGORY_EMOJI[topCategory.category]}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>이달 최다 지출</span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>
            이번 달 소비의 <span style={{ fontSize: 20 }}>{topCategory.percentage}%</span>는{' '}
            <span style={{ borderBottom: '2px solid rgba(255,255,255,0.5)' }}>{topCategory.category}</span>입니다.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{formatAmount(topCategory.amount)}</p>
        </div>
      )}

      {/* 파이 차트 */}
      <Card>
        <SectionTitle>카테고리별 지출</SectionTitle>
        {catLoading ? <Loading /> : pieData.length === 0 ? (
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B0B8C1', fontSize: 13 }}>이달 지출 내역이 없습니다</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatAmount(Number(val))} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginTop: 12 }}>
              {pieData.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: CATEGORY_COLORS[item.name], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#8B95A1', flex: 1 }}>{item.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#191F28' }}>{item.percentage}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* TOP 5 항목 */}
      {pieData.length > 0 && (
        <Card>
          <SectionTitle>TOP 지출 항목</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pieData.slice(0, 5).map((item, idx) => (
              <div key={item.name}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#B0B8C1', width: 16 }}>#{idx + 1}</span>
                    <span style={{ fontSize: 18 }}>{CATEGORY_EMOJI[item.name]}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#191F28' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#191F28' }}>{formatAmount(item.value)}</span>
                </div>
                <div style={{ background: '#F2F4F6', borderRadius: 999, height: 6 }}>
                  <div style={{ width: `${item.percentage}%`, height: 6, borderRadius: 999, background: CATEGORY_COLORS[item.name], transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 월별 바 차트 */}
      <Card>
        <SectionTitle>{year}년 월별 지출 추이</SectionTitle>
        {monthlyLoading ? <Loading /> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={10} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EB" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8B95A1' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="지출" fill="#3182F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="수입" fill="#05C072" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* 라인 차트 */}
      <Card>
        <SectionTitle>수입 vs 지출 트렌드</SectionTitle>
        {monthlyLoading ? <Loading /> : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EB" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8B95A1' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="수입" stroke="#05C072" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="지출" stroke="#3182F6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
