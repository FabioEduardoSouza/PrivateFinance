import React, { useState } from 'react';
import {
  Target,
  Plus,
  PiggyBank,
  X,
  Trash2,
  ArrowUpRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const GoalsView: React.FC = () => {
  const {
    goals,
    accounts,
    isPrivacyMode,
    addGoal,
    deleteGoal,
    contributeToGoal,
  } = useFinance();

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [contributingGoalId, setContributingGoalId] = useState<string | null>(null);
  const [aporteAmount, setAporteAmount] = useState('');
  const [aporteAccountId, setAporteAccountId] = useState(accounts[0]?.id || '');

  // Form states
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#10b981');
  const [notes, setNotes] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    addGoal({
      title,
      targetAmount: parseFloat(targetAmount) || 1000,
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: targetDate || '2026-12-31',
      color,
      notes,
    });

    setIsAddingGoal(false);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setNotes('');
  };

  const handleConfirmAporte = (goalId: string) => {
    const val = parseFloat(aporteAmount);
    if (!val || val <= 0) return;
    contributeToGoal(goalId, val, aporteAccountId);
    setContributingGoalId(null);
    setAporteAmount('');
  };

  const totalGoalsTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalGoalsAccumulated = goals.reduce((s, g) => s + g.currentAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Metas & Cofres Financeiros
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe o progresso de sua reserva de emergência, viagens, aquisições e projetos
          </p>
        </div>

        <button
          onClick={() => setIsAddingGoal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Banner de Resumo Geral */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
            Progresso Geral dos Objetivos
          </span>
          <h3 className={`text-3xl font-black mt-1 ${isPrivacyMode ? 'blur-privacy' : ''}`}>
            {formatCurrency(totalGoalsAccumulated, isPrivacyMode)}
            <span className="text-sm font-normal text-emerald-100 ml-2">
              de {formatCurrency(totalGoalsTarget, isPrivacyMode)} acumulados
            </span>
          </h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black">
            {totalGoalsTarget > 0
              ? `${((totalGoalsAccumulated / totalGoalsTarget) * 100).toFixed(0)}%`
              : '0%'}
          </span>
          <p className="text-xs text-emerald-100">{goals.length} metas cadastradas</p>
        </div>
      </div>

      {/* Formulário de Criação de Meta */}
      {isAddingGoal && (
        <form
          onSubmit={handleCreateGoal}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Criar Nova Meta</h4>
            <button
              type="button"
              onClick={() => setIsAddingGoal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1">Título da Meta</label>
              <input
                type="text"
                placeholder="Ex: Reforma do Apartamento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Valor Alvo (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="25000.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Valor Já Acumulado (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="5000.00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Data Estimada de Conquista</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-500 mb-1">Observações ou Estratégia</label>
              <input
                type="text"
                placeholder="Ex: Aportes mensais de R$ 500 no Tesouro Direto"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingGoal(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Criar Meta
            </button>
          </div>
        </form>
      )}

      {/* Cards de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((g) => {
          const percentage = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
          const isContributing = contributingGoalId === g.id;

          return (
            <div
              key={g.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: g.color }}
                    >
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{g.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        Previsão: {formatDate(g.targetDate)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Excluir a meta "${g.title}"?`)) {
                        deleteGoal(g.id);
                      }
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                    title="Excluir meta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className={`text-xl font-black text-slate-900 dark:text-white ${isPrivacyMode ? 'blur-privacy' : ''}`}>
                      {formatCurrency(g.currentAmount, isPrivacyMode)}
                    </span>
                    <span className={`text-xs text-slate-400 ${isPrivacyMode ? 'blur-privacy' : ''}`}>
                      de {formatCurrency(g.targetAmount, isPrivacyMode)}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, percentage)}%`,
                        backgroundColor: g.color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {percentage.toFixed(0)}% concluído
                    </span>
                    <span className="text-slate-400">
                      Faltam {formatCurrency(Math.max(0, g.targetAmount - g.currentAmount), isPrivacyMode)}
                    </span>
                  </div>
                </div>

                {g.notes && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                    {g.notes}
                  </p>
                )}
              </div>

              {/* Botão de Aporte */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                {isContributing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Valor (R$)"
                        value={aporteAmount}
                        onChange={(e) => setAporteAmount(e.target.value)}
                        className="w-1/2 px-2 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border-none font-mono"
                      />
                      <select
                        value={aporteAccountId}
                        onChange={(e) => setAporteAccountId(e.target.value)}
                        className="w-1/2 px-2 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border-none truncate"
                      >
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setContributingGoalId(null)}
                        className="px-2 py-1 text-[11px] text-slate-400"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleConfirmAporte(g.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Confirmar Aporte
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setContributingGoalId(g.id);
                      setAporteAmount('');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Fazer Aporte</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
