import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AccountsView } from './components/AccountsView';
import { CardsView } from './components/CardsView';
import { BudgetsView } from './components/BudgetsView';
import { GoalsView } from './components/GoalsView';
import { ReportsView } from './components/ReportsView';
import { PostgresIntegrationView } from './components/PostgresIntegrationView';
import { TransactionModal } from './components/TransactionModal';
import { TransferModal } from './components/TransferModal';
import { ImportModal } from './components/ImportModal';

const MainLayout: React.FC = () => {
  const { activeTab } = useFinance();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        {/* Barra Lateral de Navegação */}
        <Sidebar />

        {/* Área de Conteúdo Principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'transactions' && <TransactionsView />}
          {activeTab === 'accounts' && <AccountsView />}
          {activeTab === 'cards' && <CardsView />}
          {activeTab === 'budgets' && <BudgetsView />}
          {activeTab === 'goals' && <GoalsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'postgres' && <PostgresIntegrationView />}
        </main>
      </div>

      {/* Modais Globais */}
      <TransactionModal />
      <TransferModal />
      <ImportModal />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
}
