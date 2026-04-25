const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const raw = new sqlite3.Database(path.join(__dirname, '../../motorhub.db'));

// Promise wrapper
const db = {
  run: (sql, params = []) => new Promise((res, rej) =>
    raw.run(sql, params, function(err) { err ? rej(err) : res({ lastID: this.lastID, changes: this.changes }); })
  ),
  get: (sql, params = []) => new Promise((res, rej) =>
    raw.get(sql, params, (err, row) => err ? rej(err) : res(row))
  ),
  all: (sql, params = []) => new Promise((res, rej) =>
    raw.all(sql, params, (err, rows) => err ? rej(err) : res(rows))
  ),
  exec: (sql) => new Promise((res, rej) =>
    raw.exec(sql, (err) => err ? rej(err) : res())
  ),
};

const init = async () => {
  await db.run('PRAGMA journal_mode = WAL');
  await db.run('PRAGMA foreign_keys = ON');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS oficinas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telefone TEXT,
      endereco TEXT,
      cidade TEXT,
      uf TEXT,
      cep TEXT,
      cnpj TEXT,
      inscricao_estadual TEXT,
      horario_abertura TEXT,
      horario_fechamento TEXT,
      plano TEXT NOT NULL DEFAULT 'acelera',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oficina_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'funcionario',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oficina_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      cpf_cnpj TEXT,
      telefone TEXT,
      email TEXT,
      endereco TEXT,
      data_nascimento DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );

    CREATE TABLE IF NOT EXISTS veiculos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oficina_id INTEGER NOT NULL,
      cliente_id INTEGER,
      placa TEXT NOT NULL,
      modelo TEXT,
      marca TEXT,
      ano INTEGER,
      cor TEXT,
      km_atual INTEGER DEFAULT 0,
      ativo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id),
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );

    CREATE TABLE IF NOT EXISTS ordens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oficina_id INTEGER NOT NULL,
      numero TEXT NOT NULL,
      cliente_id INTEGER,
      veiculo_id INTEGER,
      km INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'orcamento',
      tipo TEXT NOT NULL DEFAULT 'oficina',
      valor_total REAL DEFAULT 0,
      observacoes TEXT,
      notas TEXT,
      data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_finalizacao DATETIME,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id),
      FOREIGN KEY (cliente_id) REFERENCES clientes(id),
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(id)
    );

    CREATE TABLE IF NOT EXISTS ordem_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ordem_id INTEGER NOT NULL,
      descricao TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'servico',
      quantidade REAL DEFAULT 1,
      valor_unitario REAL DEFAULT 0,
      valor_total REAL DEFAULT 0,
      FOREIGN KEY (ordem_id) REFERENCES ordens(id)
    );

    CREATE TABLE IF NOT EXISTS caixas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oficina_id INTEGER NOT NULL,
      data DATE NOT NULL,
      saldo_inicial REAL DEFAULT 0,
      saldo_final REAL,
      status TEXT NOT NULL DEFAULT 'aberto',
      observacoes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );

    CREATE TABLE IF NOT EXISTS caixa_movimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caixa_id INTEGER NOT NULL,
      oficina_id INTEGER NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'entrada',
      descricao TEXT NOT NULL,
      valor REAL NOT NULL DEFAULT 0,
      forma_pagamento TEXT DEFAULT 'dinheiro',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (caixa_id) REFERENCES caixas(id),
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );

    CREATE TABLE IF NOT EXISTS transferencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oficina_id INTEGER NOT NULL,
      descricao TEXT NOT NULL,
      valor REAL NOT NULL DEFAULT 0,
      conta_origem TEXT DEFAULT '',
      conta_destino TEXT DEFAULT '',
      data DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );

    CREATE TABLE IF NOT EXISTS lancamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oficina_id INTEGER NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'receita',
      descricao TEXT NOT NULL,
      categoria TEXT DEFAULT '',
      valor REAL NOT NULL DEFAULT 0,
      data_vencimento DATE,
      data_pagamento DATE,
      status TEXT NOT NULL DEFAULT 'pendente',
      ordem_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id),
      FOREIGN KEY (ordem_id) REFERENCES ordens(id)
    );

    CREATE TABLE IF NOT EXISTS manutencoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oficina_id INTEGER NOT NULL,
      veiculo_id INTEGER NOT NULL,
      cliente_id INTEGER,
      tipo_servico TEXT NOT NULL,
      km_atual INTEGER DEFAULT 0,
      km_proximo INTEGER DEFAULT 0,
      data_ultimo DATE,
      data_proximo DATE,
      status TEXT NOT NULL DEFAULT 'ativo',
      observacoes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id),
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(id),
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );

    CREATE TABLE IF NOT EXISTS pecas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oficina_id INTEGER NOT NULL,
      codigo TEXT,
      nome TEXT NOT NULL,
      descricao TEXT,
      categoria TEXT,
      fabricante TEXT,
      unidade TEXT DEFAULT 'un',
      estoque_atual REAL DEFAULT 0,
      estoque_minimo REAL DEFAULT 0,
      valor_custo REAL DEFAULT 0,
      valor_venda REAL DEFAULT 0,
      ativo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );

    CREATE TABLE IF NOT EXISTS modelos_servicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oficina_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      descricao TEXT,
      valor_padrao REAL DEFAULT 0,
      categoria TEXT DEFAULT 'servico',
      ativo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );

    CREATE TABLE IF NOT EXISTS integracao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oficina_id INTEGER NOT NULL UNIQUE,
      whatsapp_ativo INTEGER DEFAULT 0,
      whatsapp_numero TEXT,
      whatsapp_token TEXT,
      smtp_ativo INTEGER DEFAULT 0,
      smtp_host TEXT,
      smtp_usuario TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );

    CREATE TABLE IF NOT EXISTS lancamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oficina_id INTEGER NOT NULL,
      tipo TEXT DEFAULT 'receita',
      descricao TEXT NOT NULL,
      categoria TEXT DEFAULT 'servico',
      valor REAL NOT NULL,
      status TEXT DEFAULT 'pendente',
      data_vencimento DATE,
      data_pagamento DATE,
      ordem_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id),
      FOREIGN KEY (ordem_id) REFERENCES ordens(id)
    );
  `);

  // Migrations para colunas faltantes na tabela oficinas
  try {
    const oficinas = await db.get("PRAGMA table_info(oficinas)");
    if (oficinas) {
      const cols = await db.all("PRAGMA table_info(oficinas)");
      const colNames = cols.map(c => c.name);

      const camposFaltantes = [
        { nome: 'endereco', tipo: 'TEXT' },
        { nome: 'cidade', tipo: 'TEXT' },
        { nome: 'uf', tipo: 'TEXT' },
        { nome: 'cep', tipo: 'TEXT' },
        { nome: 'cnpj', tipo: 'TEXT' },
        { nome: 'inscricao_estadual', tipo: 'TEXT' },
        { nome: 'horario_abertura', tipo: 'TEXT' },
        { nome: 'horario_fechamento', tipo: 'TEXT' },
      ];

      for (const campo of camposFaltantes) {
        if (!colNames.includes(campo.nome)) {
          await db.run(`ALTER TABLE oficinas ADD COLUMN ${campo.nome} ${campo.tipo}`);
        }
      }
    }
  } catch (err) {
    // Tabela pode não existir ainda
  }

  // Migrations para clientes - adicionar data_nascimento
  try {
    const cols = await db.all("PRAGMA table_info(clientes)");
    const colNames = cols.map(c => c.name);
    if (!colNames.includes('data_nascimento')) {
      await db.run(`ALTER TABLE clientes ADD COLUMN data_nascimento DATE`);
    }
  } catch (err) {
    // Tabela pode não existir ainda
  }
};

init().catch(console.error);

module.exports = db;
