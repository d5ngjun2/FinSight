export const formatAmount = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};

export const formatAmountShort = (amount: number): string => {
  if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억`;
  if (amount >= 10000) return `${Math.floor(amount / 10000)}만${amount % 10000 > 0 ? (amount % 10000 / 1000 > 0 ? `${Math.floor(amount % 10000 / 1000)}천` : '') : ''}`;
  if (amount >= 1000) return `${Math.floor(amount / 1000)}천`;
  return `${amount}`;
};

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

export const getDayOfWeek = (dateStr: string): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[new Date(dateStr).getDay()];
};
