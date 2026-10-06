import React, { useState } from 'react';
import {
  CreditCard as CardIcon,
  Plus,
  CheckCircle,
  X,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { CreditCard } from '../types/finance';

export const CardsView: React.FC = () => {
  const {
    cards,
    accounts,
    transactions,
    isPrivacyMode,
    selectedMonth,
    addCreditCard,
    deleteCreditCard,
    payCardInvoice,
    openNewTransactionModal,
  } = useFinance();

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [payingCardId, setPayingCardId] = useState<string | null>(null);
  const [payAccountId, setPayAccountId] = useState(accounts[0]?.id || '');

  // Form states
  const [name, setName] = useState('');
  const [bank, setBank] = useState('Nubank');
  const [brand, setBrand] = useState<'mastercard' | 'visa' | 'elo' | 'amex'>('mastercard');
  const [lastDigits, setLastDigits] = useState('1234');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState(25);
  const [dueDay, setDueDay] = useState(5);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [color, setColor] = useState('#820ad1');

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCreditCard({
      name,
      bank,
      brand,
      lastDigits: lastDigits.slice(-4),
      totalLimit: parseFloat(limit) || 5000,
      closingDay: Number(closingDay),
      dueDay: Number(dueDay),
      accountId,
      color,
    });

    setIsAddingCard(false);
    setName('');
    setLimit('');
  };

  const handleConfirmPayment = (card: CreditCard, amount: number) => {
    if (amount <= 0) return;
    payCardInvoice(card.id, amount, payAccountId);
    setPayingCardId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Cartões de Crédito & Faturas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controle faturas abertas, datas de fechamento, melhor dia de compra e limites
          </p>
        </div>

        <button
          onClick={() => setIsAddingCard(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cartão</span>
        </button>
      </div>

      {/* Formulário de Novo Cartão */}
      {isAddingCard && (
        <form
          onSubmit={handleCreateCard}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Adicionar Novo Cartão</h3>
            <button
              type="button"
              onClick={() => setIsAddingCard(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Nome do Cartão
              </label>
              <input
                type="text"
                placeholder="Ex: Nubank Ultravioleta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Bandeira
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="mastercard">Mastercard</option>
                <option value="visa">Visa</option>
                <option value="elo">Elo</option>
                <option value="amex">American Express</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Últimos 4 Dígitos
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="8914"
                value={lastDigits}
                onChange={(e) => setLastDigits(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Limite Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="10000.00"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Dia de Fechamento da Fatura
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={closingDay}
                onChange={(e) => setClosingDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Dia de Vencimento da Fatura
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={dueDay}
                onChange={(e) => setDueDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Conta para Débito
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Cor do Cartão
              </label>
              <div className="flex items-center gap-2 mt-1">
                {['#820ad1', '#0f172a', '#1e40af', '#047857', '#b91c1c', '#ea580c'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      color === c ? 'border-white ring-2 ring-emerald-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingCard(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Salvar Cartão
            </button>
          </div>
        </form>
      )}

      {/* Grid de Cartões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cards.map((card) => {
          const cardExpenses = transactions.filter(
            (t) => t.creditCardId === card.id && t.type === 'expense' && t.date.startsWith(selectedMonth)
          );
          const currentInvoice = cardExpenses.reduce((sum, t) => sum + t.amount, 0);
          const availableLimit = Math.max(0, card.totalLimit - currentInvoice);
          const percentUsed = card.totalLimit > 0 ? (currentInvoice / card.totalLimit) * 100 : 0;
          const isPayingThis = payingCardId === card.id;

          return (
            <div
              key={card.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5"
            >
              {/* Arte Visual do Cartão */}
              <div
                className="relative rounded-2xl p-6 text-white overflow-hidden shadow-xl aspect-[1.58/1] flex flex-col justify-between"
                style={{
                  background: `linear-gradient(135deg, ${card.color} 0%, #090d16 100%)`,
                }}
              >
                <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                      {card.bank}
                    </span>
                    <h4 className="text-base font-extrabold tracking-tight mt-0.5">{card.name}</h4>
                  </div>
                  <div className="w-10 h-7 rounded-md bg-amber-200/80 border border-amber-300 shadow-inner flex items-center justify-center">
                    <div className="w-6 h-4 border border-amber-400/60 rounded-[3px]" />
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-base tracking-widest text-white/90">
                  <span>••••</span>
                  <span>••••</span>
                  <span>••••</span>
                  <span className="font-bold text-white">{card.lastDigits}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-white/60 block uppercase font-medium">
                      Melhor Compra
                    </span>
                    <span className="font-semibold text-white">Dia {card.closingDay + 1}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/60 block uppercase font-medium">
                      Vencimento
                    </span>
                    <span className="font-semibold text-white">Dia {card.dueDay}</span>
                  </div>
                  <div className="uppercase font-black text-sm tracking-wider text-white/80">
                    {card.brand}
                  </div>
                </div>
              </div>

              {/* Detalhes da Fatura */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Fatura Atual ({selectedMonth})
                    </span>
                    <p
                      className={`text-2xl font-black text-slate-900 dark:text-white ${
                        isPrivacyMode ? 'blur-privacy' : ''
                      }`}
                    >
                      {formatCurrency(currentInvoice, isPrivacyMode)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Limite Livre</span>
                    <p
                      className={`text-sm font-bold text-emerald-600 dark:text-emerald-400 ${
                        isPrivacyMode ? 'blur-privacy' : ''
                      }`}
                    >
                      {formatCurrency(availableLimit, isPrivacyMode)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentUsed > 85 ? 'bg-rose-500' : percentUsed > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percentUsed)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{percentUsed.toFixed(1)}% utilizado</span>
                    <span>Limite Total: {formatCurrency(card.totalLimit, isPrivacyMode)}</span>
                  </div>
                </div>
              </div>

              {/* Pagamento de Fatura */}
              {isPayingThis ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Pagar fatura de {formatCurrency(currentInvoice)}
                    </span>
                    <button
                      onClick={() => setPayingCardId(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Debitar da conta:
                    </label>
                    <select
                      value={payAccountId}
                      onChange={(e) => setPayAccountId(e.target.value)}
                      className="w-full py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (Saldo: {formatCurrency(a.balance)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setPayingCardId(null)}
                      className="px-2.5 py-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleConfirmPayment(card, currentInvoice)}
                      className="px-3 py-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                    >
                      Confirmar Pagamento
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setPayingCardId(card.id)}
                    disabled={currentInvoice <= 0}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    Pagar Fatura
                  </button>
                  <button
                    onClick={() => openNewTransactionModal('expense')}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium"
                  >
                    + Despesa
                  </button>
                  {cards.length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Excluir o cartão ${card.name}?`)) {
                          deleteCreditCard(card.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Excluir Cartão"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
