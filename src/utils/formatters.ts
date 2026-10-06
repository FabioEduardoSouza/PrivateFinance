export function formatCurrency(value: number, isPrivacyMode: boolean = false): string {
  if (isPrivacyMode) {
    return '••••••';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

export function formatDateShort(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthIndex = parseInt(parts[1], 10) - 1;
    return `${parts[2]} ${months[monthIndex] || ''}`;
  }
  return dateString;
}

export function formatMonthYear(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const idx = parseInt(month, 10) - 1;
  return `${monthNames[idx] || month} de ${year}`;
}

export function formatPercentage(val: number): string {
  return `${val.toFixed(1).replace('.', ',')}%`;
}

export function getDaysDifference(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate + 'T00:00:00');
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDueStatusBadge(dueDate: string, status: string): { label: string; color: string } {
  if (status === 'completed') {
    return { 
      label: 'Concluído', 
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
    };
  }

  const diff = getDaysDifference(dueDate);
  if (diff < 0) {
    return { 
      label: `Atrasado (${Math.abs(diff)}d)`, 
      color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800' 
    };
  }
  if (diff === 0) {
    return { 
      label: 'Vence Hoje', 
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800' 
    };
  }
  if (diff === 1) {
    return { 
      label: 'Vence Amanhã', 
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800' 
    };
  }
  return { 
    label: `Vence em ${diff}d`, 
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' 
  };
}

export function getCurrentYearMonth(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
