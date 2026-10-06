import React, { useState } from 'react';
import { X, UploadCloud, Check, AlertCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Transaction } from '../types/finance';
import { getTodayDateString } from '../utils/formatters';

export const ImportModal: React.FC = () => {
  const {
    isImportModalOpen,
    closeImportModal,
    accounts,
    categories,
    importTransactions,
  } = useFinance();

  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [csvText, setCsvText] = useState('');
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isImportModalOpen) return null;

  const handleParseAndImport = () => {
    setErrorMsg('');
    if (!csvText.trim()) {
      setErrorMsg('Cole o conteúdo CSV para importar.');
      return;
    }

    try {
      const lines = csvText.trim().split('\n');
      const newTransactions: Transaction[] = [];

      lines.forEach((line, index) => {
        if (index === 0 && (line.toLowerCase().includes('data') || line.toLowerCase().includes('valor') || line.toLowerCase().includes('date'))) {
          return;
        }

        const parts = line.split(/[;,]/);
        if (parts.length >= 3) {
          const rawDate = parts[0]?.trim();
          const rawDesc = parts[1]?.trim().replace(/^"|"$/g, '');
          const rawAmount = parts[2]?.trim().replace('R$', '').replace(/\s/g, '').replace('.', '').replace(',', '.');

          const parsedAmount = parseFloat(rawAmount);
          if (!isNaN(parsedAmount) && rawDesc) {
            const isNegative = parsedAmount < 0;
            const absAmount = Math.abs(parsedAmount);

            let formattedDate = getTodayDateString();
            if (rawDate.includes('/')) {
              const [d, m, y] = rawDate.split('/');
              if (d && m && y) {
                formattedDate = `${y.length === 2 ? '20' + y : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
              }
            } else if (rawDate.includes('-')) {
              formattedDate = rawDate;
            }

            let matchedCat = categories.find((c) => c.type === (isNegative ? 'expense' : 'income'));

            newTransactions.push({
              id: `import-${Date.now()}-${index}`,
              description: rawDesc,
              amount: absAmount,
              type: isNegative ? 'expense' : 'income',
              categoryId: matchedCat?.id || (categories[0]?.id || ''),
              accountId,
              date: formattedDate,
              dueDate: formattedDate,
              status: 'completed',
              paymentMethod: 'pix',
              notes: 'Importado de extrato legado',
            });
          }
        }
      });

      if (newTransactions.length === 0) {
        setErrorMsg('Nenhuma linha válida encontrada no formato: Data; Descrição; Valor');
        return;
      }

      importTransactions(newTransactions);
      setImportedCount(newTransactions.length);
      setTimeout(() => {
        closeImportModal();
        setImportedCount(null);
        setCsvText('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg('Erro ao processar CSV. Verifique a formatação.');
    }
  };

  const sampleCsv = `2026-09-15;Pagamento Fornecedor Alpha;-450.00\n2026-09-18;Recebimento de Cliente;1200.00\n2026-09-22;Material de Escritório;-125.50`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-teal-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Importar Extrato / Dados Legados
            </h3>
          </div>
          <button
            onClick={closeImportModal}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Conta de Destino dos Lançamentos
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-600 dark:text-slate-400">
                Cole os dados do CSV (Data; Descrição; Valor)
              </label>
              <button
                onClick={() => setCsvText(sampleCsv)}
                className="text-[11px] text-teal-600 hover:underline"
              >
                Colar Exemplo
              </button>
            </div>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Exemplo:&#10;2026-09-15;Supermercado;-250.00&#10;2026-09-16;Salário;5000.00"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {importedCount !== null && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{importedCount} lançamentos importados com sucesso!</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={closeImportModal}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleParseAndImport}
              className="px-5 py-2 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all active:scale-95"
            >
              Processar e Importar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
