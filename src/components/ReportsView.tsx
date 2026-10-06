import React from 'react';
import {
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatMonthYear, formatPercentage } from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const {
    transactions,
    categories,
    selectedMonth,
    isPrivacyMode,
    monthIncome,
    monthExpenses,
    monthNet,
  } = useFinance();

  const handlePrint = () => {
    window.print();
  };

  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(selectedMonth) && t.status === 'completed');
  const expenseTxs = currentMonthTxs.filter((t) => t.type === 'expense');
  const topExpenses = [...expenseTxs].sort((a, b) => b.amount - a.amount).slice(0, 5);

  const categorySummary = categories.map((cat) => {
    const total = currentMonthTxs
      .filter((t) => t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      id: cat.id,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      total,
      percentage:
        cat.type === 'income'
          ? monthIncome > 0 ? (total / monthIncome) * 100 : 0
          : monthExpenses > 0 ? (total / monthExpenses) * 100 : 0,
    };
  }).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Relatórios Financeiros & DRE
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Demonstrativo de Resultado do Exercício consolidado para {formatMonthYear(selectedMonth)}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Imprimir / Gerar PDF</span>
        </button>
      </div>

      {/* Demonstrativo DRE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                FinanPro • Contabilidade Gerencial
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                DRE - Demonstrativo de Resultado Mensal
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Competência: {selectedMonth}
              </span>
              <p className="text-[11px] text-slate-400">Regime de Caixa / Realizado</p>
            </div>
          </div>
        </div>

        {/* Linhas do DRE */}
        <div className="space-y-3 font-mono text-xs">
          
          {/* Receitas */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 text-teal-800 dark:text-teal-300 font-bold">
            <span className="flex items-center gap-2">
              <span className="text-teal-600">(+)</span> 1. RECEITAS TOTAIS REALIZADAS
            </span>
            <span className={`${isPrivacyMode ? 'blur-privacy' : ''}`}>
              +{formatCurrency(monthIncome, isPrivacyMode)}
            </span>
          </div>

          <div className="pl-6 pr-3 space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
            {categorySummary
              .filter((c) => c.type === 'income')
              .map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span>• {c.name}</span>
                  <span className={`${isPrivacyMode ? 'blur-privacy' : ''}`}>
                    {formatCurrency(c.total, isPrivacyMode)} ({formatPercentage(c.percentage)})
                  </span>
                </div>
              ))}
          </div>

          {/* Despesas */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 font-bold mt-4">
            <span className="flex items-center gap-2">
              <span className="text-rose-600">(-)</span> 2. DESPESAS TOTAIS OPERACIONAIS & PESSOAIS
            </span>
            <span className={`${isPrivacyMode ? 'blur-privacy' : ''}`}>
              -{formatCurrency(monthExpenses, isPrivacyMode)}
            </span>
          </div>

          <div className="pl-6 pr-3 space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
            {categorySummary
              .filter((c) => c.type === 'expense')
              .map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span>• {c.name}</span>
                  <span className={`${isPrivacyMode ? 'blur-privacy' : ''}`}>
                    -{formatCurrency(c.total, isPrivacyMode)} ({formatPercentage(c.percentage)})
                  </span>
                </div>
              ))}
          </div>

          {/* Resultado Final */}
          <div
            className={`flex items-center justify-between p-4 rounded-2xl text-sm font-extrabold mt-6 ${
              monthNet >= 0
                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
            }`}
          >
            <span className="flex items-center gap-2">
              (=) RESULTADO LÍQUIDO FINAL DO PERÍODO
            </span>
            <span className={`text-base ${isPrivacyMode ? 'blur-privacy' : ''}`}>
              {monthNet >= 0 ? '+' : ''}
              {formatCurrency(monthNet, isPrivacyMode)}
            </span>
          </div>
        </div>
      </div>

      {/* Top 5 e Diagnóstico */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top 5 Maiores Gastos */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
            Top 5 Maiores Gastos do Mês
          </h4>
          <div className="space-y-3">
            {topExpenses.map((t, idx) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{t.description}</p>
                    <span className="text-[10px] text-slate-400">{t.date}</span>
                  </div>
                </div>
                <span className={`font-bold text-rose-600 dark:text-rose-400 ${isPrivacyMode ? 'blur-privacy' : ''}`}>
                  -{formatCurrency(t.amount, isPrivacyMode)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnóstico de Saúde Financeira */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Diagnóstico de Saúde Financeira
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Avaliação de sustentabilidade financeira para o período ativo.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Comprometimento da Renda:
                </span>
                <p className="text-slate-500 mt-0.5">
                  Suas despesas representam{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {monthIncome > 0 ? formatPercentage((monthExpenses / monthIncome) * 100) : '0%'}
                  </strong>{' '}
                  do total recebido. Recomendado manter abaixo de 80%.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Capacidade de Poupança:
                </span>
                <p className="text-slate-500 mt-0.5">
                  Você está guardando{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {monthIncome > 0 ? formatPercentage(Math.max(0, (monthNet / monthIncome) * 100)) : '0%'}
                  </strong>{' '}
                  dos seus ganhos neste mês.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-[11px] text-slate-400">
            Relatório gerado em tempo real com base no plano de contas ativo.
          </div>
        </div>

      </div>
    </div>
  );
};
