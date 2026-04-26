const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/motorhub',
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false
});

// Convert ? placeholders to $1, $2, etc for PostgreSQL
const convertSQL = (sql) => {
  let counter = 1;
  return sql.replace(/\?/g, () => `$${counter++}`);
};

// Promise wrapper
const db = {
  run: (sql, params = []) => new Promise((res, rej) => {
    let converted = convertSQL(sql);
    // Add RETURNING id for INSERT statements
    if (converted.toLowerCase().includes('insert') && !converted.includes('returning')) {
      converted += ' RETURNING id';
    }
    pool.query(converted, params, (err, result) => {
      if (err) rej(err);
      else res({ lastID: result.rows[0]?.id, changes: result.rowCount });
    });
  }),
  get: (sql, params = []) => new Promise((res, rej) => {
    const converted = convertSQL(sql);
    pool.query(converted, params, (err, result) => {
      if (err) rej(err);
      else res(result.rows[0]);
    });
  }),
  all: (sql, params = []) => new Promise((res, rej) => {
    const converted = convertSQL(sql);
    pool.query(converted, params, (err, result) => {
      if (err) rej(err);
      else res(result.rows);
    });
  }),
};

const init = async () => {
  await db.run(`
    CREATE TABLE IF NOT EXISTS oficinas (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      oficina_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'funcionario',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id SERIAL PRIMARY KEY,
      oficina_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      cpf_cnpj TEXT,
      telefone TEXT,
      email TEXT,
      endereco TEXT,
      data_nascimento DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS veiculos (
      id SERIAL PRIMARY KEY,
      oficina_id INTEGER NOT NULL,
      cliente_id INTEGER,
      placa TEXT NOT NULL,
      modelo TEXT,
      marca TEXT,
      ano INTEGER,
      cor TEXT,
      km_atual INTEGER DEFAULT 0,
      ativo INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id),
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS ordens (
      id SERIAL PRIMARY KEY,
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
      data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_finalizacao TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id),
      FOREIGN KEY (cliente_id) REFERENCES clientes(id),
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS ordem_itens (
      id SERIAL PRIMARY KEY,
      ordem_id INTEGER NOT NULL,
      descricao TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'servico',
      quantidade REAL DEFAULT 1,
      valor_unitario REAL DEFAULT 0,
      valor_total REAL DEFAULT 0,
      FOREIGN KEY (ordem_id) REFERENCES ordens(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS caixas (
      id SERIAL PRIMARY KEY,
      oficina_id INTEGER NOT NULL,
      data DATE NOT NULL,
      saldo_inicial REAL DEFAULT 0,
      saldo_final REAL,
      status TEXT NOT NULL DEFAULT 'aberto',
      observacoes TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS caixa_movimentos (
      id SERIAL PRIMARY KEY,
      caixa_id INTEGER NOT NULL,
      oficina_id INTEGER NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'entrada',
      descricao TEXT NOT NULL,
      valor REAL NOT NULL DEFAULT 0,
      forma_pagamento TEXT DEFAULT 'dinheiro',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (caixa_id) REFERENCES caixas(id),
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS lancamentos (
      id SERIAL PRIMARY KEY,
      oficina_id INTEGER NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'receita',
      descricao TEXT NOT NULL,
      categoria TEXT DEFAULT '',
      valor REAL NOT NULL DEFAULT 0,
      data_vencimento DATE,
      data_pagamento DATE,
      status TEXT NOT NULL DEFAULT 'pendente',
      ordem_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id),
      FOREIGN KEY (ordem_id) REFERENCES ordens(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS transferencias (
      id SERIAL PRIMARY KEY,
      oficina_id INTEGER NOT NULL,
      descricao TEXT NOT NULL,
      valor REAL NOT NULL DEFAULT 0,
      conta_origem TEXT DEFAULT '',
      conta_destino TEXT DEFAULT '',
      data DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS manutencoes (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id),
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(id),
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS pecas (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS modelos_servicos (
      id SERIAL PRIMARY KEY,
      oficina_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      descricao TEXT,
      valor_padrao REAL DEFAULT 0,
      categoria TEXT DEFAULT 'servico',
      ativo INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS integracao (
      id SERIAL PRIMARY KEY,
      oficina_id INTEGER NOT NULL UNIQUE,
      whatsapp_ativo INTEGER DEFAULT 0,
      whatsapp_numero TEXT,
      whatsapp_token TEXT,
      smtp_ativo INTEGER DEFAULT 0,
      smtp_host TEXT,
      smtp_usuario TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  await db.run(`
    CREATE TABLE IF NOT EXISTS unidades (
      id SERIAL PRIMARY KEY,
      oficina_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      endereco TEXT,
      cidade TEXT,
      uf TEXT,
      telefone TEXT,
      email TEXT,
      ativo INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    );
  `).catch(e => console.error("DB init:", e.message));

  // ALTER TABLE to add missing columns (idempotent)
  await db.run(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ativo INTEGER DEFAULT 1`).catch(e => console.error("Alter usuarios:", e.message));
};

init().catch(console.error);

module.exports = db;
