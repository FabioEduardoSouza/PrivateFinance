import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Account,
  Category,
  CreditCard,
  Budget,
  Goal,
  Transaction,
  PostgresConfig,
  FinancialAlert,
  TransactionType,
  TransactionStatus,
} from '../types/finance';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_CARDS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_TRANSACTIONS,
  INITIAL_POSTGRES_CONFIG,
  INITIAL_ALERTS,
} from '../data/initialData';
import { getCurrentYearMonth, getTodayDateString } from '../utils/formatters';

interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  cards: CreditCard[];
  budgets: Budget[];
  goals: Goal[];
  alerts: FinancialAlert[];
  postgresConfig: PostgresConfig;
  isPrivacyMode: boolean;
  isDarkMode: boolean;
  activeTab: string;
  selectedMonth: string; // YYYY-MM
  isTransactionModalOpen: boolean;
  isTransferModalOpen: boolean;
  isImportModalOpen: boolean;
  editingTransaction: Transaction | null;
  transactionModalInitialType: TransactionType;

  // Métricas calculadas
  totalBalance: number;
  monthIncome: number;
  monthExpenses: number;
  monthNet: number;
  pendingIncome: number;
  pendingExpenses: number;
  totalCreditLimit: number;
  usedCreditLimit: number;
  availableCreditLimit: number;
  unreadAlertsCount: number;

  // Ações
  setActiveTab: (tab: string) => void;
  setSelectedMonth: (month: string) => void;
  togglePrivacyMode: () => void;
  toggleDarkMode: () => void;
  
  // Modais
  openNewTransactionModal: (type?: TransactionType) => void;
  openEditTransactionModal: (transaction: Transaction) => void;
  closeTransactionModal: () => void;
  openTransferModal: () => void;
  closeTransferModal: () => void;
  openImportModal: () => void;
  closeImportModal: () => void;

  // Operações CRUD
  addTransaction: (data: Omit<Transaction, 'id'>, installmentCount?: number) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  toggleTransactionStatus: (id: string) => void;
  addTransfer: (fromAccountId: string, toAccountId: string, amount: number, date: string, description: string) => void;
  
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;

  addCreditCard: (card: Omit<CreditCard, 'id'>) => void;
  updateCreditCard: (card: CreditCard) => void;
  deleteCreditCard: (id: string) => void;
  payCardInvoice: (cardId: string, amount: number, accountId: string) => void;

  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, accountId: string) => void;

  updateBudget: (budget: Budget) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  
  updatePostgresConfig: (config: Partial<PostgresConfig>) => void;
  markAlertAsRead: (id: string) => void;
  markAllAlertsAsRead: () => void;
  resetToDefaults: () => void;
  importTransactions: (transactions: Transaction[]) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`finanpro_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [accounts, setAccounts] = useState<Account[]>(() => loadStored('accounts', INITIAL_ACCOUNTS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStored('transactions', INITIAL_TRANSACTIONS));
  const [categories, setCategories] = useState<Category[]>(() => loadStored('categories', INITIAL_CATEGORIES));
  const [cards, setCards] = useState<CreditCard[]>(() => loadStored('cards', INITIAL_CARDS));
  const [budgets, setBudgets] = useState<Budget[]>(() => loadStored('budgets', INITIAL_BUDGETS));
  const [goals, setGoals] = useState<Goal[]>(() => loadStored('goals', INITIAL_GOALS));
  const [alerts, setAlerts] = useState<FinancialAlert[]>(() => loadStored('alerts', INITIAL_ALERTS));
  const [postgresConfig, setPostgresConfig] = useState<PostgresConfig>(() => loadStored('postgres_config', INITIAL_POSTGRES_CONFIG));
  
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => loadStored('privacy_mode', false));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('finanpro_dark_mode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth());

  // Estado dos Modais
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalInitialType, setTransactionModalInitialType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Sincronização com o localStorage
  useEffect(() => {
    localStorage.setItem('finanpro_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('finanpro_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finanpro_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('finanpro_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('finanpro_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finanpro_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finanpro_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('finanpro_postgres_config', JSON.stringify(postgresConfig));
  }, [postgresConfig]);

  useEffect(() => {
    localStorage.setItem('finanpro_privacy_mode', JSON.stringify(isPrivacyMode));
  }, [isPrivacyMode]);

  useEffect(() => {
    localStorage.setItem('finanpro_dark_mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Controles de Modais
  const openNewTransactionModal = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setTransactionModalInitialType(type);
    setIsTransactionModalOpen(true);
  };

  const openEditTransactionModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTransactionModalInitialType(tx.type);
    setIsTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const openTransferModal = () => setIsTransferModalOpen(true);
  const closeTransferModal = () => setIsTransferModalOpen(false);
  const openImportModal = () => setIsImportModalOpen(true);
  const closeImportModal = () => setIsImportModalOpen(false);

  const togglePrivacyMode = () => setIsPrivacyMode((prev) => !prev);
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Recálculo automático dos saldos bancários
  const recalculateAccountBalances = (allTxs: Transaction[], baseAccounts: Account[]) => {
    return baseAccounts.map((acc) => {
      let current = acc.initialBalance;
      allTxs.forEach((t) => {
        if (t.status === 'completed') {
          if (t.accountId === acc.id && !t.creditCardId) {
            if (t.type === 'income') {
              current += t.amount;
            } else if (t.type === 'expense') {
              current -= t.amount;
            } else if (t.type === 'transfer') {
              current -= t.amount;
            }
          }
          if (t.destinationAccountId === acc.id && t.type === 'transfer') {
            current += t.amount;
          }
        }
      });
      return { ...acc, balance: Math.round(current * 100) / 100 };
    });
  };

  // Inserção de lançamentos (com suporte a parcelamento automático)
  const addTransaction = (data: Omit<Transaction, 'id'>, installmentCount: number = 1) => {
    const newTransactions: Transaction[] = [];
    const parentId = `tx-${Date.now()}`;

    if (installmentCount <= 1) {
      newTransactions.push({
        ...data,
        id: parentId,
      });
    } else {
      const perInstallmentAmount = Math.round((data.amount / installmentCount) * 100) / 100;
      const baseDate = new Date(data.date + 'T00:00:00');

      for (let i = 1; i <= installmentCount; i++) {
        const nextDate = new Date(baseDate);
        nextDate.setMonth(baseDate.getMonth() + (i - 1));
        const yyyy = nextDate.getFullYear();
        const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
        const dd = String(nextDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        newTransactions.push({
          ...data,
          id: `${parentId}-${i}`,
          amount: perInstallmentAmount,
          description: `${data.description} (${i}/${installmentCount})`,
          date: dateStr,
          dueDate: dateStr,
          installments: {
            current: i,
            total: installmentCount,
            parentId,
          },
          status: i === 1 ? data.status : 'pending',
        });
      }
    }

    setTransactions((prev) => {
      const updated = [...newTransactions, ...prev];
      setAccounts((prevAccs) => recalculateAccountBalances(updated, prevAccs));
      return updated;
    });

    closeTransactionModal();
  };

  const updateTransaction = (tx: Transaction) => {
    setTransactions((prev) => {
      const updated = prev.map((item) => (item.id === tx.id ? tx : item));
      setAccounts((prevAccs) => recalculateAccountBalances(updated, prevAccs));
      return updated;
    });
    closeTransactionModal();
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      setAccounts((prevAccs) => recalculateAccountBalances(updated, prevAccs));
      return updated;
    });
  };

  const toggleTransactionStatus = (id: string) => {
    setTransactions((prev) => {
      const updated: Transaction[] = prev.map((item) => {
        if (item.id === id) {
          const nextStatus: TransactionStatus = item.status === 'completed' ? 'pending' : 'completed';
          return { ...item, status: nextStatus };
        }
        return item;
      });
      setAccounts((prevAccs) => recalculateAccountBalances(updated, prevAccs));
      return updated;
    });
  };

  const addTransfer = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: string,
    description: string
  ) => {
    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);
    const transferTx: Transaction = {
      id: `tx-trf-${Date.now()}`,
      description: description || `Transferência: ${fromAcc?.name} -> ${toAcc?.name}`,
      amount,
      type: 'transfer',
      categoryId: 'cat-inc-5',
      accountId: fromAccountId,
      destinationAccountId: toAccountId,
      date,
      dueDate: date,
      status: 'completed',
      paymentMethod: 'transfer',
      notes: `Transferência bancária interna entre ${fromAcc?.bank} e ${toAcc?.bank}`,
    };

    setTransactions((prev) => {
      const updated = [transferTx, ...prev];
      setAccounts((prevAccs) => recalculateAccountBalances(updated, prevAccs));
      return updated;
    });

    closeTransferModal();
  };

  const addAccount = (acc: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...acc,
      id: `acc-${Date.now()}`,
      balance: acc.initialBalance,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const updateAccount = (updatedAcc: Account) => {
    setAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const addCreditCard = (card: Omit<CreditCard, 'id'>) => {
    const newCard: CreditCard = {
      ...card,
      id: `card-${Date.now()}`,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const updateCreditCard = (card: CreditCard) => {
    setCards((prev) => prev.map((c) => (c.id === card.id ? card : c)));
  };

  const deleteCreditCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const payCardInvoice = (cardId: string, amount: number, accountId: string) => {
    const card = cards.find((c) => c.id === cardId);
    const payTx: Transaction = {
      id: `tx-fatura-${Date.now()}`,
      description: `Pagamento Fatura ${card?.name || 'Cartão'}`,
      amount,
      type: 'expense',
      categoryId: 'cat-exp-10',
      accountId,
      date: getTodayDateString(),
      dueDate: getTodayDateString(),
      status: 'completed',
      paymentMethod: 'pix',
      notes: `Quitação total da fatura mensal do cartão ${card?.name}`,
    };

    setTransactions((prev) => {
      const updated = [payTx, ...prev];
      setAccounts((prevAccs) => recalculateAccountBalances(updated, prevAccs));
      return updated;
    });
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (goal: Goal) => {
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const contributeToGoal = (goalId: string, amount: number, accountId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedGoals = goals.map((g) => {
      if (g.id === goalId) {
        return { ...g, currentAmount: g.currentAmount + amount };
      }
      return g;
    });
    setGoals(updatedGoals);

    const tx: Transaction = {
      id: `tx-goal-${Date.now()}`,
      description: `Aporte na Meta: ${goal.title}`,
      amount,
      type: 'expense',
      categoryId: 'cat-exp-10',
      accountId,
      date: getTodayDateString(),
      dueDate: getTodayDateString(),
      status: 'completed',
      paymentMethod: 'transfer',
      notes: `Investimento acumulado para objetivo "${goal.title}"`,
    };

    setTransactions((prev) => {
      const updated = [tx, ...prev];
      setAccounts((prevAccs) => recalculateAccountBalances(updated, prevAccs));
      return updated;
    });
  };

  const updateBudget = (b: Budget) => {
    setBudgets((prev) => prev.map((item) => (item.id === b.id ? b : item)));
  };

  const addBudget = (b: Omit<Budget, 'id'>) => {
    setBudgets((prev) => [...prev, { ...b, id: `bud-${Date.now()}` }]);
  };

  const updatePostgresConfig = (cfg: Partial<PostgresConfig>) => {
    setPostgresConfig((prev) => ({ ...prev, ...cfg }));
  };

  const markAlertAsRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  };

  const markAllAlertsAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const resetToDefaults = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCategories(INITIAL_CATEGORIES);
    setCards(INITIAL_CARDS);
    setBudgets(INITIAL_BUDGETS);
    setGoals(INITIAL_GOALS);
    setAlerts(INITIAL_ALERTS);
    setPostgresConfig(INITIAL_POSTGRES_CONFIG);
    localStorage.clear();
  };

  const importTransactions = (newTxs: Transaction[]) => {
    setTransactions((prev) => {
      const updated = [...newTxs, ...prev];
      setAccounts((prevAccs) => recalculateAccountBalances(updated, prevAccs));
      return updated;
    });
  };

  // Métricas Computadas
  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, a) => acc + a.balance, 0);
  }, [accounts]);

  const monthIncome = useMemo(() => {
    return transactions
      .filter((t) => t.date.startsWith(selectedMonth) && t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedMonth]);

  const monthExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.date.startsWith(selectedMonth) && t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedMonth]);

  const monthNet = monthIncome - monthExpenses;

  const pendingIncome = useMemo(() => {
    return transactions
      .filter((t) => t.date.startsWith(selectedMonth) && t.type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedMonth]);

  const pendingExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.date.startsWith(selectedMonth) && t.type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedMonth]);

  const totalCreditLimit = useMemo(() => {
    return cards.reduce((sum, c) => sum + c.totalLimit, 0);
  }, [cards]);

  const usedCreditLimit = useMemo(() => {
    return transactions
      .filter((t) => !!t.creditCardId && t.type === 'expense' && t.date.startsWith(selectedMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedMonth]);

  const availableCreditLimit = Math.max(0, totalCreditLimit - usedCreditLimit);

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        categories,
        cards,
        budgets,
        goals,
        alerts,
        postgresConfig,
        isPrivacyMode,
        isDarkMode,
        activeTab,
        selectedMonth,
        isTransactionModalOpen,
        isTransferModalOpen,
        isImportModalOpen,
        editingTransaction,
        transactionModalInitialType,
        totalBalance,
        monthIncome,
        monthExpenses,
        monthNet,
        pendingIncome,
        pendingExpenses,
        totalCreditLimit,
        usedCreditLimit,
        availableCreditLimit,
        unreadAlertsCount,
        setActiveTab,
        setSelectedMonth,
        togglePrivacyMode,
        toggleDarkMode,
        openNewTransactionModal,
        openEditTransactionModal,
        closeTransactionModal,
        openTransferModal,
        closeTransferModal,
        openImportModal,
        closeImportModal,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        toggleTransactionStatus,
        addTransfer,
        addAccount,
        updateAccount,
        deleteAccount,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        payCardInvoice,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        updateBudget,
        addBudget,
        updatePostgresConfig,
        markAlertAsRead,
        markAllAlertsAsRead,
        resetToDefaults,
        importTransactions,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
};
