import React, { useState } from 'react';
import {
  Bell,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatMonthYear } from '../utils/formatters';

export const Header: React.FC = () => {
  const {
    totalBalance,
    isPrivacyMode,
    togglePrivacyMode,
    isDarkMode,
    toggleDarkMode,
    selectedMonth,
    setSelectedMonth,
    alerts,
    unreadAlertsCount,
    markAlertAsRead,
    markAllAlertsAsRead,
    openNewTransactionModal,
    postgresConfig,
    setActiveTab,
  } = useFinance();

  const [showAlertsMenu, setShowAlertsMenu] = useState(false);

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${yyyy}-${mm}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${yyyy}-${mm}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo e Nome */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <span className="font-extrabold text-xl tracking-tight">FP</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  FinanPro
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  v2.5 Postgres
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Controle Financeiro Inteligente
              </p>
            </div>
          </div>

          {/* Navegação de Mês */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/70 dark:border-slate-700">
            <button
              onClick={handlePrevMonth}
              title="Mês Anterior"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-nowrap min-w-[130px] text-center">
              {formatMonthYear(selectedMonth)}
            </div>
            <button
              onClick={handleNextMonth}
              title="Próximo Mês"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Ações Rápidas, Privacidade, Notificações e Tema */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Saldo Consolidado com Olho de Privacidade */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">Saldo Geral:</span>
              <span className={`text-sm font-bold text-slate-900 dark:text-white ${isPrivacyMode ? 'blur-privacy' : ''}`}>
                {formatCurrency(totalBalance, isPrivacyMode)}
              </span>
              <button
                onClick={togglePrivacyMode}
                title={isPrivacyMode ? 'Exibir valores' : 'Ocultar valores (Modo Privacidade)'}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-1"
              >
                {isPrivacyMode ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Selo de Conexão com Postgres */}
            <button
              onClick={() => setActiveTab('postgres')}
              title={`Banco PostgreSQL: ${postgresConfig.database} em ${postgresConfig.host}:${postgresConfig.port}`}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <span>Postgres Ativo</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Menu de Notificações */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsMenu(!showAlertsMenu)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notificações e Avisos"
              >
                <Bell className="w-5 h-5" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {showAlertsMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">Notificações</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium">
                        {unreadAlertsCount} pendentes
                      </span>
                    </div>
                    {unreadAlertsCount > 0 && (
                      <button
                        onClick={markAllAlertsAsRead}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {alerts.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-6">Nenhuma notificação no momento.</p>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          onClick={() => markAlertAsRead(alert.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            alert.isRead
                              ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80 text-slate-500'
                              : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/50 text-slate-800 dark:text-slate-200 font-medium'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {alert.type === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            ) : alert.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 dark:text-slate-100">{alert.title}</p>
                              <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                                {alert.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">{alert.date}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Alternador Claro / Escuro */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Botões Rápidos de Ação */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => openNewTransactionModal('expense')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition-all active:scale-95"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span className="hidden sm:inline">Despesa</span>
              </button>

              <button
                onClick={() => openNewTransactionModal('income')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span className="hidden sm:inline">Receita</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
