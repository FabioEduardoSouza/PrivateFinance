import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  CreditCard,
  PieChart,
  Target,
  BarChart3,
  Database,
  ArrowRightLeft,
  UploadCloud,
  RotateCcw,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, openTransferModal, openImportModal, resetToDefaults } = useFinance();

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'transactions', label: 'Lançamentos', icon: ReceiptText },
    { id: 'accounts', label: 'Contas & Carteiras', icon: Wallet },
    { id: 'cards', label: 'Cartões de Crédito', icon: CreditCard },
    { id: 'budgets', label: 'Orçamentos', icon: PieChart },
    { id: 'goals', label: 'Metas & Cofres', icon: Target },
    { id: 'reports', label: 'Relatórios & DRE', icon: BarChart3 },
    { id: 'postgres', label: 'Integração PostgreSQL', icon: Database, badge: 'C:\\' },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm lg:min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        
        {/* Lista de Navegação */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Módulos Principais
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Atalhos Rápidos */}
        <div className="space-y-1 pt-4 border-t border-slate-200/60 dark:border-slate-800">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Ações Rápidas
          </p>
          <button
            onClick={openTransferModal}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
            <span>Transferir entre Contas</span>
          </button>
          <button
            onClick={openImportModal}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-teal-500" />
            <span>Importar Extrato (CSV/OFX)</span>
          </button>
        </div>

      </div>

      {/* Informações do Rodapé e Reset */}
      <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 space-y-3">
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              PostgreSQL Local
            </span>
            <span className="text-[10px] text-slate-400 font-mono">:5432</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate font-mono">
            C:\ControleFinanceiro
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Deseja restaurar os dados de demonstração originais?')) {
              resetToDefaults();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Recarregar dados de exemplo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar dados de teste</span>
        </button>
      </div>
    </aside>
  );
};
