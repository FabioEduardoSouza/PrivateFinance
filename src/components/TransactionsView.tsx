import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  X,
  CreditCard,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, getDueStatusBadge } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    accounts,
    categories,
    cards,
    selectedMonth,
    isPrivacyMode,
    openNewTransactionModal,
    openEditTransactionModal,
    deleteTransaction,
    toggleTransactionStatus,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [showOnlyThisMonth, setShowOnlyThisMonth] = useState(true);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (showOnlyThisMonth && !t.date.startsWith(selectedMonth)) {
        return false;
      }
      if (selectedType !== 'all' && t.type !== selectedType) {
        return false;
      }
      if (selectedStatus !== 'all' && t.status !== selectedStatus) {
        return false;
      }
      if (selectedCategoryId !== 'all' && t.categoryId !== selectedCategoryId) {
        return false;
      }
      if (selectedAccountId !== 'all' && t.accountId !== selectedAccountId && t.destinationAccountId !== selectedAccountId) {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const descMatch = t.description.toLowerCase().includes(query);
        const notesMatch = t.notes?.toLowerCase().includes(query);
        const benMatch = t.beneficiary?.toLowerCase().includes(query);
        return descMatch || notesMatch || benMatch;
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [
    transactions,
    showOnlyThisMonth,
    selectedMonth,
    selectedType,
    selectedStatus,
    selectedCategoryId,
    selectedAccountId,
    searchTerm,
  ]);

  const filteredSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expense += t.amount;
    });
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Conta', 'Valor', 'Status', 'Forma de Pagamento', 'Beneficiário'];
    const rows = filteredTransactions.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId)?.name || '';
      const acc = accounts.find((a) => a.id === t.accountId)?.name || '';
      return [
        t.date,
        t.type === 'income' ? 'Receita' : t.type === 'expense' ? 'Despesa' : 'Transferência',
        `"${t.description.replace(/"/g, '""')}"`,
        `"${cat}"`,
        `"${acc}"`,
        t.amount.toFixed(2),
        t.status === 'completed' ? 'Concluído' : 'Pendente',
        t.paymentMethod,
        `"${(t.beneficiary || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `extrato_finanpro_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Lançamentos & Extrato Financeiro
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe e controle todas as entradas, saídas e transferências
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Exportar para Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => openNewTransactionModal('expense')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Campo de Busca */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por descrição, favorecido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Tipo */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="income">Somente Receitas</option>
              <option value="expense">Somente Despesas</option>
              <option value="transfer">Somente Transferências</option>
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos os Status</option>
              <option value="completed">Concluídos / Pagos</option>
              <option value="pending">Pendentes / Agendados</option>
            </select>
          </div>

          {/* Filtro por Categoria */}
          <div>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.type === 'income' ? '🟢' : '🔴'} {c.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Segunda linha de filtros */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={showOnlyThisMonth}
                onChange={(e) => setShowOnlyThisMonth(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Filtrar apenas pelo mês ativo ({selectedMonth})</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Conta:</span>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-700 dark:text-slate-300"
              >
                <option value="all">Todas as Contas</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resumo Rápido da Lista */}
          <div className="flex items-center gap-3">
            <span className="text-teal-600 dark:text-teal-400 font-semibold">
              +{formatCurrency(filteredSummary.income, isPrivacyMode)}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              -{formatCurrency(filteredSummary.expense, isPrivacyMode)}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className={`font-bold ${filteredSummary.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              Saldo: {formatCurrency(filteredSummary.net, isPrivacyMode)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm font-medium">Nenhum lançamento encontrado para os filtros selecionados.</p>
            <button
              onClick={() => openNewTransactionModal('expense')}
              className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              + Criar primeiro lançamento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Data</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Descrição</th>
                  <th className="py-3.5 px-4">Conta / Cartão</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Valor</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredTransactions.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const acc = accounts.find((a) => a.id === tx.accountId);
                  const destAcc = tx.destinationAccountId ? accounts.find((a) => a.id === tx.destinationAccountId) : null;
                  const card = tx.creditCardId ? cards.find((c) => c.id === tx.creditCardId) : null;
                  const dueBadge = getDueStatusBadge(tx.dueDate || tx.date, tx.status);

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${cat?.color || '#94a3b8'}20` }}
                          >
                            <CategoryIcon
                              iconName={cat?.icon || 'Tag'}
                              className="w-4 h-4"
                              color={cat?.color || '#94a3b8'}
                            />
                          </div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {cat?.name || 'Geral'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {tx.description}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            {tx.beneficiary && <span>Favorecido: {tx.beneficiary}</span>}
                            {tx.installments && (
                              <span className="font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1 rounded">
                                Parcela {tx.installments.current}/{tx.installments.total}
                              </span>
                            )}
                            {tx.isRecurring && (
                              <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 px-1 rounded">
                                Recorrente
                              </span>
                            )}
                            {tx.notes && <span className="italic truncate max-w-[200px]">{tx.notes}</span>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {tx.type === 'transfer' ? (
                          <div className="text-slate-600 dark:text-slate-400">
                            <span>{acc?.name}</span>
                            <span className="mx-1">→</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {destAcc?.name}
                            </span>
                          </div>
                        ) : card ? (
                          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{card.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">{acc?.name || 'Conta'}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => toggleTransactionStatus(tx.id)}
                          title="Clique para alternar status (Pago / Pendente)"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${dueBadge.color}`}
                        >
                          {tx.status === 'completed' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{dueBadge.label}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-bold font-mono text-sm ${
                            tx.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : tx.type === 'expense'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-indigo-600 dark:text-indigo-400'
                          } ${isPrivacyMode ? 'blur-privacy' : ''}`}
                        >
                          {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                          {formatCurrency(tx.amount, isPrivacyMode)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditTransactionModal(tx)}
                            title="Editar lançamento"
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Excluir lançamento "${tx.description}"?`)) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            title="Excluir lançamento"
                            className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="py-3 px-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Exibindo <strong>{filteredTransactions.length}</strong> de {transactions.length} registros
          </span>
          <span>FinanPro • Extrato Atualizado</span>
        </div>
      </div>
    </div>
  );
};
