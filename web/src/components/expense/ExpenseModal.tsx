'use client';

import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { CATEGORIES, CATEGORY_EMOJI, type Expense, type ExpenseRequest, type TransactionType } from '@/types';
import { useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/hooks/useExpenses';
import { formatAmount } from '@/utils/formatters';

interface Props {
  date: string;
  expenses: Expense[];
  onClose: () => void;
}

type TabType = 'list' | 'add';



export default function ExpenseModal({ date, expenses, onClose }: Props) {
  const [tab, setTab] = useState<TabType>(expenses.length > 0 ? 'list' : 'add');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('식비');
  const [description, setDescription] = useState('');

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const dateLabel = (() => {
    const d = new Date(date);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
  })();

  const resetForm = () => {
    setTitle(''); setAmount(''); setCategory('식비');
    setDescription(''); setType('EXPENSE'); setEditingId(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setTitle(expense.title);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setDescription(expense.description || '');
    setType(expense.type);
    setTab('add');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !amount) return;
    const data: ExpenseRequest = {
      title: title.trim(),
      amount: Number(amount.replace(/,/g, '')),
      category, type,
      description: description.trim() || undefined,
      transactionDate: date,
    };
    if (editingId) await updateMutation.mutateAsync({ id: editingId, data });
    else await createMutation.mutateAsync(data);
    resetForm();
    setTab('list');
  };

  const handleDelete = async (id: number) => {
    if (confirm('삭제하시겠습니까?')) await deleteMutation.mutateAsync(id);
  };

  const formatInput = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    return num ? Number(num).toLocaleString('ko-KR') : '';
  };

  const totalExpense = expenses.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0);
  const totalIncome  = expenses.filter(e => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);
  const isBusy = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sheet">

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid #E5E8EB' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 17, color: '#191F28' }}>{dateLabel}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              {totalIncome > 0 && <span style={{ fontSize: 12, color: '#05C072', fontWeight: 600 }}>+{formatAmount(totalIncome)}</span>}
              {totalExpense > 0 && <span style={{ fontSize: 12, color: '#F04452', fontWeight: 600 }}>-{formatAmount(totalExpense)}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA', cursor: 'pointer' }}>
            <X size={18} color="#8B95A1" />
          </button>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E8EB' }}>
          {([['list', `내역 (${expenses.length})`], ['add', editingId ? '수정' : '추가']] as [TabType, string][]).map(([id, lbl]) => (
            <button
              key={id}
              onClick={() => { setTab(id); if (id === 'list') resetForm(); }}
              style={{
                flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                color: tab === id ? '#3182F6' : '#8B95A1',
                borderBottom: tab === id ? '2px solid #3182F6' : '2px solid transparent',
                background: 'none', transition: 'all 0.15s',
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* 본문 */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tab === 'list' ? (
            <div style={{ padding: '12px 16px' }}>
              {expenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                  <p style={{ fontSize: 14, color: '#B0B8C1' }}>내역이 없습니다</p>
                  <button onClick={() => setTab('add')} style={{ marginTop: 12, fontSize: 13, color: '#3182F6', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none' }}>+ 추가하기</button>
                </div>
              ) : expenses.map(exp => (
                <div
                  key={exp.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', borderRadius: 12, cursor: 'pointer' }}
                  onClick={() => handleEdit(exp)}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#F8F9FA'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{CATEGORY_EMOJI[exp.category] || '💼'}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#191F28' }}>{exp.title}</p>
                      <p style={{ fontSize: 11, color: '#B0B8C1' }}>{exp.category}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: exp.type === 'INCOME' ? '#05C072' : '#191F28' }}>
                      {exp.type === 'INCOME' ? '+' : '-'}{formatAmount(exp.amount)}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(exp.id); }}
                      style={{ padding: 6, borderRadius: 8, background: 'none', cursor: 'pointer', border: 'none' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#FFF0F1'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                    >
                      <Trash2 size={14} color="#F04452" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* 수입/지출 토글 */}
              <div style={{ display: 'flex', background: '#F2F4F6', borderRadius: 12, padding: 4 }}>
                {(['EXPENSE', 'INCOME'] as TransactionType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      border: 'none',
                      background: type === t ? '#fff' : 'transparent',
                      color: type === t ? (t === 'EXPENSE' ? '#F04452' : '#05C072') : '#8B95A1',
                      boxShadow: type === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t === 'EXPENSE' ? '지출' : '수입'}
                  </button>
                ))}
              </div>

              {/* 금액 입력 */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#8B95A1', display: 'block', marginBottom: 6 }}>금액</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={e => setAmount(formatInput(e.target.value))}
                    placeholder="0"
                    style={{
                      width: '100%', padding: '14px 48px 14px 16px', borderRadius: 12,
                      border: '1.5px solid #E5E8EB', fontSize: 22, fontWeight: 700,
                      textAlign: 'right', outline: 'none', fontFamily: 'inherit',
                      color: '#191F28',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#3182F6')}
                    onBlur={e => (e.target.style.borderColor = '#E5E8EB')}
                  />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#8B95A1', fontWeight: 500 }}>원</span>
                </div>
              </div>

              {/* 내용 입력 */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#8B95A1', display: 'block', marginBottom: 6 }}>내용</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="어디서 사용하셨나요?"
                  style={{
                    width: '100%', padding: '13px 16px', borderRadius: 12,
                    border: '1.5px solid #E5E8EB', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                    color: '#191F28',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#3182F6')}
                  onBlur={e => (e.target.style.borderColor = '#E5E8EB')}
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#8B95A1', display: 'block', marginBottom: 8 }}>카테고리</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        padding: '10px 4px', borderRadius: 12, cursor: 'pointer',
                        background: category === cat ? '#EBF2FF' : '#F8F9FA',
                        border: category === cat ? '1.5px solid #3182F6' : '1.5px solid transparent',
                        color: category === cat ? '#3182F6' : '#8B95A1',
                        fontSize: 11, fontWeight: 500, transition: 'all 0.12s',
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{CATEGORY_EMOJI[cat]}</span>
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 메모 */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#8B95A1', display: 'block', marginBottom: 6 }}>메모 (선택)</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="메모를 입력하세요"
                  style={{
                    width: '100%', padding: '13px 16px', borderRadius: 12,
                    border: '1.5px solid #E5E8EB', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                    color: '#191F28',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#3182F6')}
                  onBlur={e => (e.target.style.borderColor = '#E5E8EB')}
                />
              </div>

              {/* 저장 버튼 */}
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || !amount || isBusy}
                style={{
                  width: '100%', padding: '16px 0', borderRadius: 14,
                  background: (!title.trim() || !amount || isBusy) ? '#B0B8C1' : '#3182F6',
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: (!title.trim() || !amount || isBusy) ? 'not-allowed' : 'pointer',
                  border: 'none', transition: 'background 0.15s',
                }}
              >
                {isBusy ? '저장 중...' : editingId ? '수정 완료' : '저장하기'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .modal-sheet-inner { border-radius: 20px !important; }
        }
      `}</style>
    </div>
  );
}
