import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDateShort, formatPercentage } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

export const DashboardView: React.FC = () => {
  const {
    totalBalance,
    monthIncome,
    monthExpenses,
    monthNet,
    pendingIncome,
    pendingExpenses,
    totalCreditLimit,
    usedCreditLimit,
    availableCreditLimit,
    transactions,
    accounts,
    cards,
    categories,
    selectedMonth,
    isPrivacyMode,
    openNewTransactionModal,
    toggleTransactionStatus,
    setActiveTab,
  } = useFinance();

  // Contas pendentes a pagar nos próximos dias
  const upcomingBills = transactions
    .filter((t) => t.status === 'pending' && t.type === 'expense')
    .sort((a, b) => (a.dueDate || a.date).localeCompare(b.dueDate || b.date))
    .slice(0, 5);

  // Despesas agrupadas por categoria
  const categoryExpensesMap: { [catId: string]: number } = {};
  transactions
    .filter((t) => t.date.startsWith(selectedMonth) && t.type === 'expense' && t.status === 'completed')
    .forEach((t) => {
      categoryExpensesMap[t.categoryId] = (categoryExpensesMap[t.categoryId] || 0) + t.amount;
    });

  const categoryExpensesList = Object.entries(categoryExpensesMap)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        id: catId,
        name: cat?.name || 'Outros',
        color: cat?.color || '#94a3b8',
        icon: cat?.icon || 'Tag',
        amount,
        percentage: monthExpenses > 0 ? (amount / monthExpenses) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Evolução mensal dos últimos 6 meses
  const monthlyFlowData = React.useMemo(() => {
    const list: { month: string; label: string; income: number; expense: number }[] = [];
    const [currY, currM] = selectedMonth.split('-').map(Number);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currY, currM - 1 - i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yyyy}-${mm}`;
      const monthsAbbr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const label = `${monthsAbbr[d.getMonth()]}/${String(yyyy).slice(2)}`;

      const inc = transactions
        .filter((t) => t.date.startsWith(key) && t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const exp = transactions
        .filter((t) => t.date.startsWith(key) && t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      list.push({ month: key, label, income: inc, expense: exp });
    }
    return list;
  }, [transactions, selectedMonth]);

  const maxFlowValue = Math.max(
    ...monthlyFlowData.flatMap((d) => [d.income, d.expense]),
    1000
  );

  const projectedBalance = totalBalance + pendingIncome - pendingExpenses;
  const creditUsagePercentage = totalCreditLimit > 0 ? (usedCreditLimit / totalCreditLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Indicadores Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Saldo Geral */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Saldo Geral Consolidado
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight ${isPrivacyMode ? 'blur-privacy' : ''}`}>
              {formatCurrency(totalBalance, isPrivacyMode)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{accounts.length} contas ativas</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Previsto: {formatCurrency(projectedBalance, isPrivacyMode)}
              </span>
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80" />
        </div>

        {/* KPI 2: Receitas do Mês */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Receitas Realizadas
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight ${isPrivacyMode ? 'blur-privacy' : ''}`}>
              +{formatCurrency(monthIncome, isPrivacyMode)}
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>A receber: {formatCurrency(pendingIncome, isPrivacyMode)}</span>
              <span className="inline-flex items-center text-teal-600 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Recebido
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 opacity-80" />
        </div>

        {/* KPI 3: Despesas do Mês */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Despesas Realizadas
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight ${isPrivacyMode ? 'blur-privacy' : ''}`}>
              -{formatCurrency(monthExpenses, isPrivacyMode)}
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>A pagar: {formatCurrency(pendingExpenses, isPrivacyMode)}</span>
              <span className="inline-flex items-center text-rose-600 font-medium">
                <ArrowDownRight className="w-3.5 h-3.5" />
                Pago
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 opacity-80" />
        </div>

        {/* KPI 4: Resultado Líquido & Economia */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Resultado Líquido
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3
              className={`text-2xl font-extrabold tracking-tight ${
                monthNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              } ${isPrivacyMode ? 'blur-privacy' : ''}`}
            >
              {monthNet >= 0 ? '+' : ''}
              {formatCurrency(monthNet, isPrivacyMode)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Taxa de Poupança:{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {monthIncome > 0 ? formatPercentage(Math.max(0, (monthNet / monthIncome) * 100)) : '0%'}
              </span>
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 opacity-80" />
        </div>

      </div>

      {/* Gráficos: Fluxo Semestral e Donut de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Barras SVG */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Fluxo Financeiro Semestral
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparativo de Receitas vs Despesas realizadas
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                <span className="w-3 h-3 rounded-sm bg-teal-500"></span> Receitas
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span className="w-3 h-3 rounded-sm bg-rose-500"></span> Despesas
              </span>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            {monthlyFlowData.map((d, idx) => {
              const incomeHeight = Math.max(8, (d.income / maxFlowValue) * 100);
              const expenseHeight = Math.max(8, (d.expense / maxFlowValue) * 100);
              const isCurrent = d.month === selectedMonth;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] p-2 rounded-lg pointer-events-none shadow-xl z-20 whitespace-nowrap">
                    <div>Receitas: {formatCurrency(d.income, isPrivacyMode)}</div>
                    <div>Despesas: {formatCurrency(d.expense, isPrivacyMode)}</div>
                  </div>

                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    <div
                      style={{ height: `${incomeHeight}%` }}
                      className={`w-1/2 max-w-[28px] rounded-t-lg transition-all duration-500 bg-teal-500 hover:brightness-110 ${
                        isCurrent ? 'ring-2 ring-teal-400/50' : 'opacity-90'
                      }`}
                    />
                    <div
                      style={{ height: `${expenseHeight}%` }}
                      className={`w-1/2 max-w-[28px] rounded-t-lg transition-all duration-500 bg-rose-500 hover:brightness-110 ${
                        isCurrent ? 'ring-2 ring-rose-400/50' : 'opacity-90'
                      }`}
                    />
                  </div>

                  <span className={`text-[11px] mt-2 font-medium ${isCurrent ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Cálculos realizados em tempo real a partir dos lançamentos.</span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              Ver DRE Completo <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Despesas por Categoria */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Despesas por Categoria
              </h4>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                Orçamentos
              </button>
            </div>

            {categoryExpensesList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Nenhuma despesa registrada para o mês selecionado.
              </div>
            ) : (
              <div className="space-y-3.5 mt-2">
                {categoryExpensesList.slice(0, 5).map((cat) => (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                          {cat.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`font-semibold text-slate-900 dark:text-slate-100 ${isPrivacyMode ? 'blur-privacy' : ''}`}>
                          {formatCurrency(cat.amount, isPrivacyMode)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1.5">
                          ({formatPercentage(cat.percentage)})
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total de Categorias:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {categoryExpensesList.length} ativas
            </span>
          </div>
        </div>

      </div>

      {/* Grid Secundário: Contas a Pagar e Resumo dos Cartões */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contas a Pagar */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Contas a Pagar & Próximos Vencimentos
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lançamentos pendentes previstos para este período
              </p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              Ver Extrato <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingBills.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              Tudo em dia! Nenhuma conta pendente para este período.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {upcomingBills.map((bill) => {
                const cat = categories.find((c) => c.id === bill.categoryId);
                const acc = accounts.find((a) => a.id === bill.accountId);

                return (
                  <div
                    key={bill.id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat?.color || '#ef4444'}15` }}
                      >
                        <CategoryIcon iconName={cat?.icon || 'Tag'} color={cat?.color || '#ef4444'} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {bill.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>{acc?.name || 'Conta Corrente'}</span>
                          <span>•</span>
                          <span>Vence em {formatDateShort(bill.dueDate || bill.date)}</span>
                          {bill.isRecurring && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                              Fixa
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold text-rose-600 dark:text-rose-400 ${isPrivacyMode ? 'blur-privacy' : ''}`}>
                        {formatCurrency(bill.amount, isPrivacyMode)}
                      </span>
                      <button
                        onClick={() => toggleTransactionStatus(bill.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors"
                        title="Marcar como Pago"
                      >
                        Pagar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resumo dos Cartões */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-500" />
                Cartões de Crédito
              </h4>
              <button
                onClick={() => setActiveTab('cards')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Gerenciar
              </button>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-lg space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Limite Total Comprometido</span>
                <span className="font-mono text-indigo-300">
                  {formatPercentage(creditUsagePercentage)} usado
                </span>
              </div>
              <div className={`text-xl font-black ${isPrivacyMode ? 'blur-privacy' : ''}`}>
                {formatCurrency(usedCreditLimit, isPrivacyMode)}
                <span className="text-xs font-normal text-slate-400 ml-1">
                  / {formatCurrency(totalCreditLimit, isPrivacyMode)}
                </span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-rose-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, creditUsagePercentage)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                <span>Disponível para compras:</span>
                <span className="font-bold text-emerald-400">
                  {formatCurrency(availableCreditLimit, isPrivacyMode)}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {cards.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">•••• {c.lastDigits}</span>
                  </div>
                  <span className="text-slate-500">Fecha dia {c.closingDay}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={() => openNewTransactionModal('expense')}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              + Adicionar Despesa no Cartão
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
