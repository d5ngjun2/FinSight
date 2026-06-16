'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart2, BrainCircuit } from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: '홈' },
  { href: '/analytics', icon: BarChart2, label: '분석' },
  { href: '/ai', icon: BrainCircuit, label: 'AI 절약' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside className="sidebar-desktop">
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 16px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: '#3182F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>F</span>
          </div>
          <span className="lg-only" style={{ fontWeight: 700, fontSize: 17, color: '#191F28', letterSpacing: '-0.3px' }}>
            FinSight
          </span>
        </div>

        <nav style={{ flex: 1, padding: '0 8px' }}>
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px',
                  borderRadius: 12,
                  marginBottom: 4,
                  textDecoration: 'none',
                  color: active ? '#3182F6' : '#8B95A1',
                  background: active ? '#EBF2FF' : 'transparent',
                  fontWeight: 500,
                  fontSize: 14,
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                <span style={{ display: 'none' }} className="sidebar-label">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: 16 }}>
          <span style={{ fontSize: 11, color: '#B0B8C1' }}>FinSight v1.0</span>
        </div>
      </aside>

      {/* 모바일 하단 탭바 */}
      <nav className="bottom-nav">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '10px 0',
                textDecoration: 'none',
                color: active ? '#3182F6' : '#B0B8C1',
                transition: 'color 0.15s',
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 사이드바 내 레이블 (lg 이상) */}
      <style>{`
        @media (min-width: 1024px) {
          .sidebar-label { display: block !important; }
        }
      `}</style>
    </>
  );
}
