import React, { useState } from 'react';
import {
  Database,
  Terminal,
  Download,
  Copy,
  Check,
  FolderOpen,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  generatePostgresSchemaSQL,
  generateDataDumpSQL,
  generatePsqlCommand,
  generateConnectionURI,
} from '../utils/postgresSqlGenerator';

export const PostgresIntegrationView: React.FC = () => {
  const {
    postgresConfig,
    updatePostgresConfig,
    accounts,
    categories,
    cards,
    budgets,
    goals,
    transactions,
  } = useFinance();

  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedDump, setCopiedDump] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'schema' | 'dump' | 'instructions' | 'adapter'>('instructions');

  const [host, setHost] = useState(postgresConfig.host);
  const [port, setPort] = useState(postgresConfig.port);
  const [database, setDatabase] = useState(postgresConfig.database);
  const [username, setUsername] = useState(postgresConfig.username);
  const [password, setPassword] = useState(postgresConfig.password || 'postgres');
  const [projectPath, setProjectPath] = useState(postgresConfig.projectPath);
  const [isSaved, setIsSaved] = useState(false);

  const schemaSQL = generatePostgresSchemaSQL();
  const dumpSQL = generateDataDumpSQL(accounts, categories, cards, budgets, goals, transactions);
  const psqlCommand = generatePsqlCommand({
    host,
    port,
    database,
    username,
    password,
    ssl: false,
    projectPath,
    status: 'configured',
  });
  const connectionURI = generateConnectionURI({
    host,
    port,
    database,
    username,
    password,
    ssl: false,
    projectPath,
    status: 'configured',
  });

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updatePostgresConfig({
      host,
      port: Number(port),
      database,
      username,
      password,
      projectPath,
      lastSync: new Date().toLocaleTimeString('pt-BR'),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCopy = (text: string, type: 'schema' | 'dump' | 'command' | 'uri') => {
    navigator.clipboard.writeText(text);
    if (type === 'schema') {
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    } else if (type === 'dump') {
      setCopiedDump(true);
      setTimeout(() => setCopiedDump(false), 2000);
    } else if (type === 'command') {
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    } else if (type === 'uri') {
      setCopiedUri(true);
      setTimeout(() => setCopiedUri(false), 2000);
    }
  };

  const handleDownloadFile = (content: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Integração com PostgreSQL & Sistema Legado
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              C:\ControleFinanceiro
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ponte de modernização, exportação de schema DDL otimizado e carga direta no PostgreSQL local
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const backupData = {
                accounts,
                categories,
                cards,
                budgets,
                goals,
                transactions,
                postgresConfig,
                backupDate: new Date().toISOString(),
              };
              handleDownloadFile(JSON.stringify(backupData, null, 2), `backup_finanpro_${new Date().toISOString().slice(0, 10)}.json`);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors shadow-sm"
            title="Salva todos os dados do sistema em um arquivo JSON"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Salvar Backup (JSON)</span>
          </button>
          <button
            onClick={() => handleDownloadFile(schemaSQL, 'schema_finanpro.sql')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Baixar Schema SQL</span>
          </button>
          <button
            onClick={() => handleDownloadFile(dumpSQL, 'carga_dados_finanpro.sql')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Carga (INSERTS)</span>
          </button>
        </div>
      </div>

      {/* Grid de Configurações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulário de Configuração */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Parâmetros do Banco de Dados
              </h3>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Configurado
            </span>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">
                Diretório do Projeto Local
              </label>
              <div className="relative">
                <FolderOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-slate-500 font-medium mb-1">Servidor (Host)</label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Porta</label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Nome do Banco</label>
              <input
                type="text"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Usuário</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
              >
                {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <RefreshCw className="w-4 h-4" />}
                <span>{isSaved ? 'Configurações Salvas!' : 'Atualizar Conexão'}</span>
              </button>
            </div>
          </form>

          {/* URI de Conexão */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block mb-1">
              URI de Conexão PostgreSQL:
            </span>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              <span className="truncate max-w-[200px]">{connectionURI}</span>
              <button
                onClick={() => handleCopy(connectionURI, 'uri')}
                className="p-1 hover:text-slate-900 dark:hover:text-white"
                title="Copiar URI"
              >
                {copiedUri ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Linha de Comando e Abas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm font-mono text-emerald-400">
                  Terminal Windows / Prompt de Comando
                </span>
              </div>
              <button
                onClick={() => handleCopy(psqlCommand, 'command')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors"
              >
                {copiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCommand ? 'Copiado!' : 'Copiar Comando'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Para executar o schema diretamente no seu PostgreSQL local em{' '}
              <code className="text-emerald-400 font-mono font-bold">{projectPath}</code>, execute:
            </p>

            <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto select-all">
              {`cd ${projectPath}\n${psqlCommand}`}
            </div>

            {/* Aviso e Solução para o erro 'psql não é reconhecido' e 'arquivo não encontrado' */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <span>⚠️ Erro "Não acha o arquivo schema_finanpro.sql" ou "psql não reconhecido"?</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Quando você clica em <strong>"Baixar Schema SQL"</strong> no botão verde acima, o arquivo vai para a sua pasta de <strong>Downloads</strong> do Windows. Para rodar diretamente em <code>C:\ControleFinanceiro</code>, você pode copiar o arquivo para lá ou usar um dos métodos abaixo:
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">Opção Recomendada (1 Comando no PowerShell):</span>
                    <span className="text-[10px] text-slate-400">Copia da pasta Downloads e executa</span>
                  </div>
                  <code className="block p-2 rounded bg-black text-[11px] text-teal-300 font-mono overflow-x-auto select-all">
                    Copy-Item "$HOME\Downloads\schema_finanpro.sql" "C:\ControleFinanceiro\" -Force -ErrorAction SilentlyContinue; cd C:\ControleFinanceiro; $p = (Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" | Select-Object -Last 1).FullName; & $p -h localhost -p 5432 -U postgres -d controle_financeiro -f schema_finanpro.sql
                  </code>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                  <span className="font-bold text-indigo-400">Opção 2 (Sem terminal - Direto no pgAdmin 4):</span>
                  <p className="text-[11px] text-slate-300">
                    Você nem precisa de arquivo! Clique na aba <strong>"Schema DDL"</strong> logo abaixo, clique no botão <strong>"Copiar Código"</strong>, abra a <strong>Query Tool</strong> do pgAdmin 4 e aperte <strong>F5</strong> para rodar!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Senha informada: <strong className="text-white">postgres</strong>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Atualização de saldos via Triggers
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Índices de alta performance
              </span>
            </div>
          </div>

          {/* Sub-abas de Visualização de Código */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-x-auto">
              <button
                onClick={() => setActiveSubTab('instructions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSubTab === 'instructions'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Guia de Migração Passo a Passo
              </button>
              <button
                onClick={() => setActiveSubTab('schema')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSubTab === 'schema'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Schema DDL (schema_finanpro.sql)
              </button>
              <button
                onClick={() => setActiveSubTab('dump')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSubTab === 'dump'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Carga de Dados (INSERTS SQL)
              </button>
              <button
                onClick={() => setActiveSubTab('adapter')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSubTab === 'adapter'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Script de API Node.js / Express
              </button>
            </div>

            <div className="p-6">
              {activeSubTab === 'instructions' && (
                <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Como modernizar seu sistema legado em C:\ControleFinanceiro:
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                        1
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          Criação do Banco de Dados no PostgreSQL
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                          Abra o pgAdmin ou o prompt de comando do PostgreSQL e crie a base:
                        </p>
                        <code className="block mt-1 p-2 rounded bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono">
                          CREATE DATABASE controle_financeiro;
                        </code>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                        2
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          Aplicação do Schema DDL Otimizado
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                          Baixe o arquivo SQL e execute no terminal do Windows:
                        </p>
                        <code className="block mt-1 p-2 rounded bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono">
                          psql -U postgres -d controle_financeiro -f schema_finanpro.sql
                        </code>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                        3
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          Carga Inicial de Dados e Migração
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                          Baixe o arquivo de Dump SQL com todos os dados atuais prontos para inserção ou use o Importador para trazer lançamentos antigos em CSV.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                        4
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          Recursos Modernos Adicionados vs Sistema Antigo
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-slate-500 dark:text-slate-400">
                          <li>Visual moderno fintech responsivo com modo claro e escuro</li>
                          <li>Suporte a múltiplos cartões com controle de fechamento e melhor dia</li>
                          <li>Gestão de parcelamentos automáticos (1/12x)</li>
                          <li>Orçamentos com alertas visuais de teto</li>
                          <li>Metas / Cofres financeiros com cálculo de projeção</li>
                          <li>Demonstrativo DRE automático por competência</li>
                          <li>Modo privacidade para segurança visual em locais públicos</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'schema' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">schema_finanpro.sql</span>
                    <button
                      onClick={() => handleCopy(schemaSQL, 'schema')}
                      className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSchema ? 'Copiado!' : 'Copiar Código'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                    {schemaSQL}
                  </pre>
                </div>
              )}

              {activeSubTab === 'dump' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">carga_dados_finanpro.sql ({transactions.length} transações)</span>
                    <button
                      onClick={() => handleCopy(dumpSQL, 'dump')}
                      className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      {copiedDump ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDump ? 'Copiado!' : 'Copiar INSERTS'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                    {dumpSQL}
                  </pre>
                </div>
              )}

              {activeSubTab === 'adapter' && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-600 dark:text-slate-400">
                    Script pronto de API Node.js para rodar localmente no seu computador e se conectar ao PostgreSQL:
                  </p>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-80 leading-relaxed border border-slate-800">
{`// server-postgres.js (Node.js)
const { Client } = require('pg');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
  host: '${host}',
  port: ${port},
  user: '${username}',
  password: '${password}',
  database: '${database}',
});

client.connect().then(() => console.log('PostgreSQL Conectado com sucesso!'));

app.get('/api/transacoes', async (req, res) => {
  const result = await client.query('SELECT * FROM transacoes ORDER BY data_transacao DESC');
  res.json(result.rows);
});

app.listen(4000, () => console.log('API FinanPro rodando em http://localhost:4000'));`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
