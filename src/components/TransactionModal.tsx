import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { TransactionType, PaymentMethod } from '../types/finance';
import { getTodayDateString } from '../utils/formatters';

export const TransactionModal: React.FC = () => {
  const {
    isTransactionModalOpen,
    closeTransactionModal,
    editingTransaction,
    transactionModalInitialType,
    accounts,
    categories,
    cards,
    addTransaction,
    updateTransaction,
  } = useFinance();

  const [type, setType] = useState<TransactionType>(transactionModalInitialType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [creditCardId, setCreditCardId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [status, setStatus] = useState<'completed' | 'pending'>('completed');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(2);
  const [isRecurring, setIsRecurring] = useState(false);
  const [beneficiary, setBeneficiary] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isTransactionModalOpen) return;

    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setDate(editingTransaction.date);
      setDueDate(editingTransaction.dueDate || editingTransaction.date);
      setCategoryId(editingTransaction.categoryId);
      setAccountId(editingTransaction.accountId);
      setIsCreditCard(!!editingTransaction.creditCardId);
      setCreditCardId(editingTransaction.creditCardId || '');
      setPaymentMethod(editingTransaction.paymentMethod);
      setStatus(editingTransaction.status === 'overdue' ? 'pending' : editingTransaction.status);
      setIsInstallment(!!editingTransaction.installments);
      setInstallmentCount(editingTransaction.installments?.total || 2);
      setIsRecurring(!!editingTransaction.isRecurring);
      setBeneficiary(editingTransaction.beneficiary || '');
      setNotes(editingTransaction.notes || '');
    } else {
      setType(transactionModalInitialType);
      setDescription('');
      setAmount('');
      setDate(getTodayDateString());
      setDueDate(getTodayDateString());
      const defCat = categories.find((c) => c.type === transactionModalInitialType);
      setCategoryId(defCat ? defCat.id : (categories[0]?.id || ''));
      setAccountId(accounts[0]?.id || '');
      setIsCreditCard(false);
      setCreditCardId(cards[0]?.id || '');
      setPaymentMethod('pix');
      setStatus('completed');
      setIsInstallment(false);
      setInstallmentCount(2);
      setIsRecurring(false);
      setBeneficiary('');
      setNotes('');
    }
  }, [isTransactionModalOpen, editingTransaction, transactionModalInitialType]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const defCat = categories.find((c) => c.type === newType);
    if (defCat) setCategoryId(defCat.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (editingTransaction) {
      updateTransaction({
        ...editingTransaction,
        description,
        amount: parsedAmount,
        type,
        categoryId,
        accountId: isCreditCard ? (cards.find((c) => c.id === creditCardId)?.accountId || accountId) : accountId,
        creditCardId: isCreditCard && type === 'expense' ? creditCardId : undefined,
        date,
        dueDate,
        status,
        paymentMethod: isCreditCard ? 'credit_card' : paymentMethod,
        isRecurring,
        beneficiary,
        notes,
      });
    } else {
      addTransaction(
        {
          description,
          amount: parsedAmount,
          type,
          categoryId,
          accountId: isCreditCard ? (cards.find((c) => c.id === creditCardId)?.accountId || accountId) : accountId,
          creditCardId: isCreditCard && type === 'expense' ? creditCardId : undefined,
          date,
          dueDate,
          status,
          paymentMethod: isCreditCard ? 'credit_card' : paymentMethod,
          isRecurring,
          beneficiary,
          notes,
        },
        isInstallment ? installmentCount : 1
      );
    }
  };

  if (!isTransactionModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h3>
          </div>
          <button
            onClick={closeTransactionModal}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Seletor de Tipo */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Despesa</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Receita</span>
            </button>
          </div>

          {/* Descrição e Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Descrição
              </label>
              <input
                type="text"
                placeholder="Ex: Supermercado Mensal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Categoria e Conta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                {categories
                  .filter((c) => c.type === type)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {type === 'expense' ? 'Forma de Saída' : 'Conta de Entrada'}
              </label>
              {type === 'expense' && cards.length > 0 && (
                <div className="flex items-center gap-2 mb-1.5 text-[11px] text-slate-500">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="accountMode"
                      checked={!isCreditCard}
                      onChange={() => setIsCreditCard(false)}
                      className="text-emerald-600"
                    />
                    <span>Conta Bancária</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="accountMode"
                      checked={isCreditCard}
                      onChange={() => setIsCreditCard(true)}
                      className="text-indigo-600"
                    />
                    <span>Cartão de Crédito</span>
                  </label>
                </div>
              )}

              {isCreditCard && type === 'expense' ? (
                <select
                  value={creditCardId}
                  onChange={(e) => setCreditCardId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (•••• {c.lastDigits})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Datas e Situação */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Data do Lançamento
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Data de Vencimento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Situação / Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="completed">Concluído (Pago/Recebido)</option>
                <option value="pending">Pendente (A Pagar/Receber)</option>
              </select>
            </div>
          </div>

          {/* Forma de Pagamento e Favorecido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="pix">PIX Instantâneo</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="boleto">Boleto Bancário</option>
                <option value="transfer">Transferência / TED</option>
                <option value="cash">Dinheiro em Espécie</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Favorecido / Fornecedor
              </label>
              <input
                type="text"
                placeholder="Ex: Companhia de Energia / Cliente"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Parcelamento e Recorrência */}
          {!editingTransaction && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isInstallment}
                    onChange={(e) => setIsInstallment(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <span>Compra Parcelada (Dividir valor em meses)</span>
                </label>
                {isInstallment && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Parcelas:</span>
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={installmentCount}
                      onChange={(e) => setInstallmentCount(Number(e.target.value))}
                      className="w-14 px-2 py-0.5 rounded bg-white dark:bg-slate-900 border text-center font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <span>Despesa / Receita Recorrente (Mensal)</span>
                </label>
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Observações
            </label>
            <input
              type="text"
              placeholder="Ex: Referente a Nota Fiscal #4812"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeTransactionModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              {editingTransaction ? 'Salvar Alterações' : 'Confirmar Lançamento'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
