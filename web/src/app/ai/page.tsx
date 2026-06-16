'use client';

import { useAiAnalysis } from '@/hooks/useStatistics';
import { AlertTriangle, Info, CheckCircle, TrendingDown, Lightbulb, RefreshCw } from 'lucide-react';
import { formatAmount } from '@/utils/formatters';
import type { Insight } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

const INSIGHT_STYLE: Record<Insight['type'], { bg: string; border: string; iconColor: string }> = {
  WARNING: { bg: '#FFF5E5', border: '#FFE0B2', iconColor: '#FF8A00' },
  SUCCESS: { bg: '#E8FFF4', border: '#B2F5D8', iconColor: '#05C072' },
  INFO:    { bg: '#EBF2FF', border: '#BFDBFE', iconColor: '#3182F6' },
};

const InsightIcon = ({ type }: { type: Insight['type'] }) => {
  const color = INSIGHT_STYLE[type].iconColor;
  if (type === 'WARNING') return <AlertTriangle size={16} color={color} />;
  if (type === 'SUCCESS') return <CheckCircle  size={16} color={color} />;
  return <Info size={16} color={color} />;
};

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E8EB', padding: 20, ...style }}>
    {children}
  </div>
);

const SkeletonCard = () => (
  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E8EB', padding: 20 }} className="skeleton">
    <div style={{ height: 14, background: '#F2F4F6', borderRadius: 8, width: '40%', marginBottom: 12 }} />
    <div style={{ height: 12, background: '#F2F4F6', borderRadius: 8, width: '100%', marginBottom: 8 }} />
    <div style={{ height: 12, background: '#F2F4F6', borderRadius: 8, width: '70%' }} />
  </div>
);

export default function AiAnalysisPage() {
  const { data, isLoading, isError } = useAiAnalysis();
  const qc = useQueryClient();

  if (isLoading) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeIn 0.25s ease-out' }}>
        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#191F28' }}>AI 절약 분석</h1>
          <p style={{ fontSize: 14, color: '#8B95A1', marginTop: 2 }}>분석 중...</p>
        </div>
        {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px', textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <p style={{ color: '#8B95A1', fontSize: 14, marginBottom: 16 }}>분석 데이터를 불러오지 못했습니다.</p>
        <button onClick={() => qc.invalidateQueries({ queryKey: ['ai'] })} style={{ padding: '10px 20px', background: '#3182F6', color: '#fff', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.25s ease-out' }}>

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#191F28' }}>AI 절약 분석</h1>
          <p style={{ fontSize: 14, color: '#8B95A1', marginTop: 2 }}>규칙 기반 소비 패턴 분석</p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['ai', 'analysis'] })}
          style={{ width: 36, height: 36, borderRadius: 10, background: '#F8F9FA', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <RefreshCw size={16} color="#8B95A1" />
        </button>
      </div>

      {/* 요약 배너 */}
      <div style={{ background: 'linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)', borderRadius: 20, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>AI 분석 요약</span>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 1.6 }}>{data?.summary}</p>
        {data && data.totalSavingPotential > 0 && (
          <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>절약 가능 금액</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
              {formatAmount(data.totalSavingPotential)}
              <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.65)', marginLeft: 4 }}>/월</span>
            </span>
          </div>
        )}
      </div>

      {/* 인사이트 카드 */}
      {data && data.insights.length > 0 && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>💡 소비 인사이트</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.insights.map((insight, idx) => {
              const st = INSIGHT_STYLE[insight.type];
              return (
                <div
                  key={idx}
                  style={{ background: st.bg, border: `1px solid ${st.border}`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}
                >
                  <div style={{ marginTop: 1, flexShrink: 0 }}><InsightIcon type={insight.type} /></div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#191F28', marginBottom: 4 }}>{insight.title}</p>
                    <p style={{ fontSize: 13, color: '#8B95A1', lineHeight: 1.55 }}>{insight.message}</p>
                    {insight.amount > 0 && (
                      <span style={{ display: 'inline-block', marginTop: 8, padding: '4px 10px', background: 'rgba(255,255,255,0.6)', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#191F28' }}>
                        {formatAmount(insight.amount)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 절약 팁 */}
      {data && data.savingTips.length > 0 && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>
            <TrendingDown size={15} color="#05C072" style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            절약 가능 영역
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.savingTips.map((tip, idx) => (
              <Card key={idx}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ padding: '4px 10px', background: '#E8FFF4', color: '#05C072', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{tip.category}</span>
                  {tip.changeRate > 0 && (
                    <span style={{ fontSize: 12, color: '#F04452', fontWeight: 500 }}>+{tip.changeRate.toFixed(0)}%</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#8B95A1', lineHeight: 1.55, marginBottom: tip.savingAmount > 0 ? 12 : 0 }}>{tip.message}</p>
                {tip.savingAmount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#E8FFF4', borderRadius: 12, padding: '10px 14px' }}>
                    <Lightbulb size={15} color="#05C072" />
                    <span style={{ fontSize: 13, color: '#05C072', fontWeight: 600 }}>월 {formatAmount(tip.savingAmount)} 절약 가능</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 반복 패턴 */}
      {data && data.patternAlerts.length > 0 && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>🔄 반복 소비 패턴</h2>
          <Card style={{ padding: 0 }}>
            {data.patternAlerts.map((alert, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: idx < data.patternAlerts.length - 1 ? '1px solid #E5E8EB' : 'none',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#191F28' }}>{alert.title}</p>
                  <p style={{ fontSize: 12, color: '#B0B8C1', marginTop: 2 }}>{alert.message}</p>
                </div>
                <span style={{ marginLeft: 12, padding: '6px 12px', background: '#F2F4F6', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#191F28', flexShrink: 0 }}>
                  {alert.count}회
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* 데이터 없는 경우 */}
      {data && data.insights.length === 0 && data.savingTips.length === 0 && data.patternAlerts.length === 0 && (
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <p style={{ fontWeight: 600, color: '#191F28', marginBottom: 6 }}>훌륭한 소비 패턴입니다!</p>
          <p style={{ fontSize: 13, color: '#8B95A1' }}>특별히 경고할 소비 패턴이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
