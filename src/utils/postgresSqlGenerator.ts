import { Account, Category, CreditCard, Budget, Goal, Transaction, PostgresConfig } from '../types/finance';

export function generatePostgresSchemaSQL(): string {
  return `-- ====================================================================
-- SCHEMA MODERNO POSTGRESQL - FINANPRO (SISTEMA DE CONTROLE FINANCEIRO)
-- Compatível com PostgreSQL 12, 13, 14, 15, 16 e 17
-- Diretório Local: C:\\ControleFinanceiro | Usuário: postgres
-- ====================================================================

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('income', 'expense')),
    icone VARCHAR(50) DEFAULT 'Tag',
    cor VARCHAR(20) DEFAULT '#6366f1',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Contas Bancárias
CREATE TABLE IF NOT EXISTS contas_bancarias (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    banco VARCHAR(50) NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('checking', 'savings', 'investment', 'cash')),
    saldo_inicial NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    saldo_atual NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    cor VARCHAR(20) DEFAULT '#10b981',
    numero_conta VARCHAR(50),
    ativo BOOLEAN DEFAULT TRUE,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Cartões de Crédito
CREATE TABLE IF NOT EXISTS cartoes_credito (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    banco VARCHAR(50) NOT NULL,
    bandeira VARCHAR(30) NOT NULL,
    ultimos_digitos VARCHAR(4) NOT NULL,
    limite_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    dia_fechamento INT NOT NULL CHECK (dia_fechamento BETWEEN 1 AND 31),
    dia_vencimento INT NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
    conta_id VARCHAR(50) REFERENCES contas_bancarias(id) ON DELETE SET NULL,
    cor VARCHAR(20) DEFAULT '#4c1d95',
    ativo BOOLEAN DEFAULT TRUE
);

-- 5. Tabela de Metas / Reservas Financeiras
CREATE TABLE IF NOT EXISTS metas_financeiras (
    id VARCHAR(50) PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    valor_alvo NUMERIC(15, 2) NOT NULL,
    valor_atual NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    data_limite DATE,
    cor VARCHAR(20) DEFAULT '#10b981',
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Orçamentos Mensais
CREATE TABLE IF NOT EXISTS orcamentos (
    id VARCHAR(50) PRIMARY KEY,
    categoria_id VARCHAR(50) REFERENCES categorias(id) ON DELETE CASCADE,
    limite_mensal NUMERIC(15, 2) NOT NULL,
    alerta_percentual INT DEFAULT 85,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Transações / Lançamentos
CREATE TABLE IF NOT EXISTS transacoes (
    id VARCHAR(50) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(15, 2) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('income', 'expense', 'transfer')),
    categoria_id VARCHAR(50) REFERENCES categorias(id) ON DELETE SET NULL,
    conta_id VARCHAR(50) REFERENCES contas_bancarias(id) ON DELETE CASCADE,
    conta_destino_id VARCHAR(50) REFERENCES contas_bancarias(id) ON DELETE SET NULL,
    cartao_credito_id VARCHAR(50) REFERENCES cartoes_credito(id) ON DELETE SET NULL,
    data_transacao DATE NOT NULL,
    data_vencimento DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'pending', 'overdue')),
    forma_pagamento VARCHAR(30) NOT NULL,
    parcela_atual INT DEFAULT NULL,
    parcela_total INT DEFAULT NULL,
    recorrente BOOLEAN DEFAULT FALSE,
    beneficiario VARCHAR(150),
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Índices de Otimização
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data_transacao);
CREATE INDEX IF NOT EXISTS idx_transacoes_status ON transacoes(status);
CREATE INDEX IF NOT EXISTS idx_transacoes_conta ON transacoes(conta_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON transacoes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_cartao ON transacoes(cartao_credito_id);

-- 9. Trigger para Atualização Automática de Saldos
CREATE OR REPLACE FUNCTION atualizar_saldo_conta_fn()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.status = 'completed') THEN
            IF (NEW.tipo = 'income') THEN
                UPDATE contas_bancarias SET saldo_atual = saldo_atual + NEW.valor WHERE id = NEW.conta_id;
            ELSIF (NEW.tipo = 'expense' AND NEW.cartao_credito_id IS NULL) THEN
                UPDATE contas_bancarias SET saldo_atual = saldo_atual - NEW.valor WHERE id = NEW.conta_id;
            ELSIF (NEW.tipo = 'transfer' AND NEW.conta_destino_id IS NOT NULL) THEN
                UPDATE contas_bancarias SET saldo_atual = saldo_atual - NEW.valor WHERE id = NEW.conta_id;
                UPDATE contas_bancarias SET saldo_atual = saldo_atual + NEW.valor WHERE id = NEW.conta_destino_id;
            END IF;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.status = 'completed') THEN
            IF (OLD.tipo = 'income') THEN
                UPDATE contas_bancarias SET saldo_atual = saldo_atual - OLD.valor WHERE id = OLD.conta_id;
            ELSIF (OLD.tipo = 'expense' AND OLD.cartao_credito_id IS NULL) THEN
                UPDATE contas_bancarias SET saldo_atual = saldo_atual + OLD.valor WHERE id = OLD.conta_id;
            ELSIF (OLD.tipo = 'transfer' AND OLD.conta_destino_id IS NOT NULL) THEN
                UPDATE contas_bancarias SET saldo_atual = saldo_atual + OLD.valor WHERE id = OLD.conta_id;
                UPDATE contas_bancarias SET saldo_atual = saldo_atual - OLD.valor WHERE id = OLD.conta_destino_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_atualizar_saldo_transacao ON transacoes;
CREATE TRIGGER trg_atualizar_saldo_transacao
AFTER INSERT OR DELETE ON transacoes
FOR EACH ROW EXECUTE FUNCTION atualizar_saldo_conta_fn();

-- 10. View Analítica de Resumo Mensal
CREATE OR REPLACE VIEW vw_resumo_mensal AS
SELECT 
    TO_CHAR(data_transacao, 'YYYY-MM') AS mes,
    SUM(CASE WHEN tipo = 'income' AND status = 'completed' THEN valor ELSE 0 END) AS total_receitas,
    SUM(CASE WHEN tipo = 'expense' AND status = 'completed' THEN valor ELSE 0 END) AS total_despesas,
    SUM(CASE WHEN tipo = 'income' AND status = 'completed' THEN valor ELSE 0 END) -
    SUM(CASE WHEN tipo = 'expense' AND status = 'completed' THEN valor ELSE 0 END) AS resultado_liquido
FROM transacoes
GROUP BY TO_CHAR(data_transacao, 'YYYY-MM')
ORDER BY mes DESC;
`;
}

export function generateDataDumpSQL(
  accounts: Account[],
  categories: Category[],
  cards: CreditCard[],
  budgets: Budget[],
  goals: Goal[],
  transactions: Transaction[]
): string {
  const lines: string[] = [
    '-- ====================================================================',
    '-- SCRIPT DE CARGA DE DADOS (INSERTS) - POSTGRESQL',
    `-- Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    '-- ====================================================================',
    'BEGIN;',
    '',
  ];

  lines.push('-- Categorias');
  for (const cat of categories) {
    const nome = cat.name.replace(/'/g, "''");
    lines.push(`INSERT INTO categorias (id, nome, tipo, icone, cor) VALUES ('${cat.id}', '${nome}', '${cat.type}', '${cat.icon}', '${cat.color}') ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;`);
  }
  lines.push('');

  lines.push('-- Contas Bancárias');
  for (const acc of accounts) {
    const nome = acc.name.replace(/'/g, "''");
    const banco = acc.bank.replace(/'/g, "''");
    const num = acc.accountNumber ? `'${acc.accountNumber.replace(/'/g, "''")}'` : 'NULL';
    lines.push(`INSERT INTO contas_bancarias (id, nome, banco, tipo, saldo_inicial, saldo_atual, cor, numero_conta) VALUES ('${acc.id}', '${nome}', '${banco}', '${acc.type}', ${acc.initialBalance.toFixed(2)}, ${acc.balance.toFixed(2)}, '${acc.color}', ${num}) ON CONFLICT (id) DO UPDATE SET saldo_atual = EXCLUDED.saldo_atual;`);
  }
  lines.push('');

  lines.push('-- Cartões de Crédito');
  for (const card of cards) {
    const nome = card.name.replace(/'/g, "''");
    const banco = card.bank.replace(/'/g, "''");
    lines.push(`INSERT INTO cartoes_credito (id, nome, banco, bandeira, ultimos_digitos, limite_total, dia_fechamento, dia_vencimento, conta_id, cor) VALUES ('${card.id}', '${nome}', '${banco}', '${card.brand}', '${card.lastDigits}', ${card.totalLimit.toFixed(2)}, ${card.closingDay}, ${card.dueDay}, '${card.accountId}', '${card.color}') ON CONFLICT (id) DO UPDATE SET limite_total = EXCLUDED.limite_total;`);
  }
  lines.push('');

  lines.push('-- Metas Financeiras');
  for (const g of goals) {
    const tit = g.title.replace(/'/g, "''");
    const obs = g.notes ? `'${g.notes.replace(/'/g, "''")}'` : 'NULL';
    lines.push(`INSERT INTO metas_financeiras (id, titulo, valor_alvo, valor_atual, data_limite, cor, observacoes) VALUES ('${g.id}', '${tit}', ${g.targetAmount.toFixed(2)}, ${g.currentAmount.toFixed(2)}, '${g.targetDate}', '${g.color}', ${obs}) ON CONFLICT (id) DO NOTHING;`);
  }
  lines.push('');

  lines.push('-- Orçamentos');
  for (const b of budgets) {
    lines.push(`INSERT INTO orcamentos (id, categoria_id, limite_mensal, alerta_percentual) VALUES ('${b.id}', '${b.categoryId}', ${b.monthlyLimit.toFixed(2)}, ${b.alertThreshold}) ON CONFLICT (id) DO UPDATE SET limite_mensal = EXCLUDED.limite_mensal;`);
  }
  lines.push('');

  lines.push('-- Transações');
  for (const t of transactions) {
    const desc = t.description.replace(/'/g, "''");
    const catId = t.categoryId ? `'${t.categoryId}'` : 'NULL';
    const accId = `'${t.accountId}'`;
    const destAccId = t.destinationAccountId ? `'${t.destinationAccountId}'` : 'NULL';
    const cardId = t.creditCardId ? `'${t.creditCardId}'` : 'NULL';
    const dueDate = t.dueDate ? `'${t.dueDate}'` : 'NULL';
    const pCurrent = t.installments ? t.installments.current : 'NULL';
    const pTotal = t.installments ? t.installments.total : 'NULL';
    const rec = t.isRecurring ? 'TRUE' : 'FALSE';
    const ben = t.beneficiary ? `'${t.beneficiary.replace(/'/g, "''")}'` : 'NULL';
    const obs = t.notes ? `'${t.notes.replace(/'/g, "''")}'` : 'NULL';

    lines.push(`INSERT INTO transacoes (id, descricao, valor, tipo, categoria_id, conta_id, conta_destino_id, cartao_credito_id, data_transacao, data_vencimento, status, forma_pagamento, parcela_atual, parcela_total, recorrente, beneficiario, observacoes) VALUES ('${t.id}', '${desc}', ${t.amount.toFixed(2)}, '${t.type}', ${catId}, ${accId}, ${destAccId}, ${cardId}, '${t.date}', ${dueDate}, '${t.status}', '${t.paymentMethod}', ${pCurrent}, ${pTotal}, ${rec}, ${ben}, ${obs}) ON CONFLICT (id) DO NOTHING;`);
  }

  lines.push('');
  lines.push('COMMIT;');
  return lines.join('\n');
}

export function generatePsqlCommand(config: PostgresConfig): string {
  return `psql -h ${config.host} -p ${config.port} -U ${config.username} -d ${config.database} -f schema_finanpro.sql`;
}

export function generateConnectionURI(config: PostgresConfig): string {
  const pwd = config.password || 'postgres';
  return `postgresql://${config.username}:${encodeURIComponent(pwd)}@${config.host}:${config.port}/${config.database}`;
}
