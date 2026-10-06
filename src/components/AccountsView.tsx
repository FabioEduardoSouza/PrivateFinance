import React, { useState } from 'react';
import {
  Wallet,
  Building,
  Plus,
  ArrowRightLeft,
  TrendingUp,
  Coins,
  Edit2,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { Account, AccountType } from '../types/finance';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    isPrivacyMode,
    addAccount,
    updateAccount,
    deleteAccount,
    openTransferModal,
  } = useFinance();

  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Estados do formulário de nova conta
  const [newAccName, setNewAccName] = useState('');
  const [newAccBank, setNewAccBank] = useState('Nubank');
  const [newAccType, setNewAccType] = useState<AccountType>('checking');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccColor, setNewAccColor] = useState('#10b981');

  // Estados de edição
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editNumber, setEditNumber] = useState('');

  const handleStartEdit = (acc: Account) => {
    setEditingAccountId(acc.id);
    setEditName(acc.name);
    setEditBalance(acc.balance.toString());
    setEditNumber(acc.accountNumber || '');
  };

  const handleSaveEdit = (acc: Account) => {
    updateAccount({
      ...acc,
      name: editName,
      balance: parseFloat(editBalance) || 0,
      accountNumber: editNumber,
    });
    setEditingAccountId(null);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;

    const initialBal = parseFloat(newAccBalance) || 0;
    addAccount({
      name: newAccName,
      bank: newAccBank,
      type: newAccType,
      initialBalance: initialBal,
      balance: initialBal,
      color: newAccColor,
      accountNumber: newAccNumber,
    });

    setIsAddingAccount(false);
    setNewAccName('');
    setNewAccBalance('');
    setNewAccNumber('');
  };

  const checkingTotal = accounts.filter((a) => a.type === 'checking').reduce((s, a) => s + a.balance, 0);
  const investmentTotal = accounts.filter((a) => a.type === 'investment').reduce((s, a) => s + a.balance, 0);
  const cashTotal = accounts.filter((a) => a.type === 'cash').reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Contas Bancárias & Carteiras
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerencie saldos em conta corrente, aplicações, poupança e dinheiro físico
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openTransferModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
            <span>Transferência</span>
          </button>

          <button
            onClick={() => setIsAddingAccount(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Conta</span>
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Contas Correntes</span>
            <p className={`text-lg font-bold text-slate-900 dark:text-white ${isPrivacyMode ? 'blur-privacy' : ''}`}>
              {formatCurrency(checkingTotal, isPrivacyMode)}
            </p>
          </div>
          <Building className="w-8 h-8 text-indigo-500 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Investimentos & Renda Fixa</span>
            <p className={`text-lg font-bold text-slate-900 dark:text-white ${isPrivacyMode ? 'blur-privacy' : ''}`}>
              {formatCurrency(investmentTotal, isPrivacyMode)}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-teal-500 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Dinheiro em Espécie</span>
            <p className={`text-lg font-bold text-slate-900 dark:text-white ${isPrivacyMode ? 'blur-privacy' : ''}`}>
              {formatCurrency(cashTotal, isPrivacyMode)}
            </p>
          </div>
          <Coins className="w-8 h-8 text-amber-500 opacity-60" />
        </div>
      </div>

      {/* Formulário de Nova Conta */}
      {isAddingAccount && (
        <form
          onSubmit={handleCreateAccount}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cadastrar Nova Conta</h3>
            <button
              type="button"
              onClick={() => setIsAddingAccount(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Nome da Conta
              </label>
              <input
                type="text"
                placeholder="Ex: Santander Principal"
                value={newAccName}
                onChange={(e) => setNewAccName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Instituição / Banco
              </label>
              <select
                value={newAccBank}
                onChange={(e) => setNewAccBank(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Nubank">Nubank</option>
                <option value="Itaú">Itaú</option>
                <option value="Bradesco">Bradesco</option>
                <option value="Inter">Banco Inter</option>
                <option value="Santander">Santander</option>
                <option value="Caixa">Caixa Econômica</option>
                <option value="C6 Bank">C6 Bank</option>
                <option value="BTG Pactual">BTG Pactual</option>
                <option value="Dinheiro">Dinheiro Físico / Carteira</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Tipo da Conta
              </label>
              <select
                value={newAccType}
                onChange={(e) => setNewAccType(e.target.value as AccountType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="checking">Conta Corrente</option>
                <option value="investment">Investimento / CDB</option>
                <option value="savings">Poupança</option>
                <option value="cash">Dinheiro em Espécie</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Saldo Inicial (R$)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newAccBalance}
                onChange={(e) => setNewAccBalance(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingAccount(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Salvar Conta
            </button>
          </div>
        </form>
      )}

      {/* Grid de Contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const isEditing = editingAccountId === acc.id;

          return (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between group"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: acc.color }}
              />

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md"
                      style={{ backgroundColor: acc.color }}
                    >
                      {acc.bank.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="font-bold text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-900 dark:text-white"
                        />
                      ) : (
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {acc.name}
                        </h4>
                      )}
                      <p className="text-[11px] text-slate-400 capitalize">
                        {acc.type === 'checking'
                          ? 'Conta Corrente'
                          : acc.type === 'investment'
                          ? 'Investimento / Reserva'
                          : acc.type === 'savings'
                          ? 'Poupança'
                          : 'Dinheiro'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveEdit(acc)}
                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50"
                        title="Salvar alterações"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(acc)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Editar conta"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {accounts.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Excluir conta "${acc.name}"?`)) {
                            deleteAccount(acc.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                        title="Excluir conta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="Agência / Conta"
                      value={editNumber}
                      onChange={(e) => setEditNumber(e.target.value)}
                      className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-full"
                    />
                  ) : (
                    acc.accountNumber && (
                      <span className="text-xs font-mono text-slate-400 block truncate">
                        {acc.accountNumber}
                      </span>
                    )
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">
                    Saldo Disponível
                  </span>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="text-xl font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded w-full mt-1"
                    />
                  ) : (
                    <p
                      className={`text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1 ${
                        isPrivacyMode ? 'blur-privacy' : ''
                      }`}
                    >
                      {formatCurrency(acc.balance, isPrivacyMode)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={openTransferModal}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Transferir</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
