export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'completed' | 'pending' | 'overdue';
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'boleto' | 'cash' | 'transfer';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  destinationAccountId?: string;
  creditCardId?: string;
  date: string; // YYYY-MM-DD
  dueDate?: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  installments?: {
    current: number;
    total: number;
    parentId?: string;
  };
  isRecurring?: boolean;
  notes?: string;
  tags?: string[];
  beneficiary?: string;
}

export type AccountType = 'checking' | 'savings' | 'investment' | 'cash';

export interface Account {
  id: string;
  name: string;
  bank: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  color: string;
  accountNumber?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  brand: 'mastercard' | 'visa' | 'elo' | 'amex';
  lastDigits: string;
  totalLimit: number;
  closingDay: number; // Dia de fechamento da fatura
  dueDay: number;     // Dia de vencimento da fatura
  accountId: string;  // Conta bancária vinculada para pagamento
  color: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  alertThreshold: number; // 85% padrão
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  color: string;
  notes?: string;
}

export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  ssl: boolean;
  projectPath: string;
  status: 'configured' | 'synced' | 'pending';
  lastSync?: string;
}

export interface FinancialAlert {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'danger' | 'success';
  date: string;
  isRead: boolean;
  actionUrl?: string;
}
