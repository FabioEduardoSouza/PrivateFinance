import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { Budget } from '../types/finance';

export const BudgetsView: React.FC = () => {
  const {
    budgets,
    categories,
    transactions,
    selectedMonth,
    isPrivacyMode,
    updateBudget,
    addBudget,
  } = useFinance();

  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState('');
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [newCatId, setNewCatId] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const categorySpentMap: { [catId: string]: number } = {};
  transactions
    .filter((t) => t.date.startsWith(selectedMonth) && t.type === 'expense')
    .forEach((t) => {
      categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] || 0) + t.amount;
    });

  const handleStartEdit = (b: Budget) => {
    setEditingBudgetId(b.id);
    setEditLimit(b.monthlyLimit.toString());
  };

  const handleSaveEdit = (b: Budget) => {
    updateBudget({
      ...b,
      monthlyLimit: parseFloat(editLimit) || b.monthlyLimit,
    });
    setEditingBudgetId(null);
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId || !newLimit) return;

    addBudget({
      categoryId: newCatId,
      monthlyLimit: parseFloat(newLimit) || 1000,
      alertThreshold: 85,
    });

    setIsAddingBudget(false);
    setNewCatId('');
    setNewLimit('');
  };

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpentInBudgets = budgets.reduce((sum, b) => sum + (categorySpentMap[b.categoryId] || 0), 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpentInBudgets);

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Planejamento Orçamentário
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Defina tetos de gastos mensais por categoria e evite surpresas na fatura
          </p>
        </div>

        <button
          onClick={() => setIsAddingBudget(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Definir Novo Teto</span>
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            Orçamento Total do Mês
          </span>
          <p className={`text-xl font-bold text-slate-900 dark:text-white mt-1 ${isPrivacyMode ? 'blur-privacy' : ''}`}>
            {formatCurrency(totalBudgeted, isPrivacyMode)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            Total Gasto nas Categorias
          </span>
          <p className={`text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 ${isPrivacyMode ? 'blur-privacy' : ''}`}>
            {formatCurrency(totalSpentInBudgets, isPrivacyMode)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            Saldo Restante do Teto
          </span>
          <p className={`text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 ${isPrivacyMode ? 'blur-privacy' : ''}`}>
            {formatCurrency(totalRemaining, isPrivacyMode)}
          </p>
        </div>
      </div>

      {/* Formulário de Novo Orçamento */}
      {isAddingBudget && (
        <form
          onSubmit={handleCreateBudget}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Novo Teto de Categoria
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingBudget(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1">Categoria de Despesa</label>
              <select
                value={newCatId}
                onChange={(e) => setNewCatId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="">Selecione uma categoria...</option>
                {categories
                  .filter((c) => c.type === 'expense')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Limite Mensal Máximo (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="1500.00"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingBudget(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Salvar Teto
            </button>
          </div>
        </form>
      )}

      {/* Lista de Orçamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const cat = categories.find((c) => c.id === b.categoryId);
          const spent = categorySpentMap[b.categoryId] || 0;
          const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
          const isOver = spent > b.monthlyLimit;
          const isWarning = percentage >= b.alertThreshold && !isOver;
          const isEditing = editingBudgetId === b.id;

          return (
            <div
              key={b.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                isOver
                  ? 'border-rose-300 dark:border-rose-900/60 shadow-sm shadow-rose-500/10'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat?.color || '#ef4444'}20` }}
                  >
                    <CategoryIcon iconName={cat?.icon || 'Tag'} color={cat?.color || '#ef4444'} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {cat?.name || 'Categoria'}
                    </h4>
                    <span className="text-xs text-slate-400">
                      Teto planejado para {selectedMonth}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <button
                      onClick={() => handleSaveEdit(b)}
                      className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(b)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Editar limite"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Gasto: </span>
                    <span className={`font-bold text-slate-900 dark:text-white ${isPrivacyMode ? 'blur-privacy' : ''}`}>
                      {formatCurrency(spent, isPrivacyMode)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Teto: </span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editLimit}
                        onChange={(e) => setEditLimit(e.target.value)}
                        className="w-24 px-1.5 py-0.5 rounded text-right bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                      />
                    ) : (
                      <span className={`font-semibold text-slate-600 dark:text-slate-300 ${isPrivacyMode ? 'blur-privacy' : ''}`}>
                        {formatCurrency(b.monthlyLimit, isPrivacyMode)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span
                    className={`font-semibold ${
                      isOver
                        ? 'text-rose-600'
                        : isWarning
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {isOver ? (
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Teto Estourado (+{formatCurrency(spent - b.monthlyLimit)})
                      </span>
                    ) : (
                      `${percentage.toFixed(0)}% do limite planejado`
                    )}
                  </span>
                  <span className="text-slate-400">
                    {isOver
                      ? 'Excedido'
                      : `Restam ${formatCurrency(b.monthlyLimit - spent, isPrivacyMode)}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
