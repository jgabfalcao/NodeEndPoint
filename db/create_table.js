const sqlite3 = require("sqlite3").verbose();
const XLSX = require("xlsx");

// Caminho do arquivo Excel e do banco de dados
const filePath = "../xlsx/dados_filtrados_por_trimestre_PIB_ED.xlsx";
const dbPath = "./db/database.db";

// Carregar os dados do Excel
const workbook = XLSX.readFile(filePath);
const sheetName = "dados_filtrados_por_trimestre_P";
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database(dbPath);

// Criar tabelas PIB e Investimento
db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS PIB (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            periodo TEXT UNIQUE NOT NULL,
            valor REAL NOT NULL
        );
    `);

  db.run(`
        CREATE TABLE IF NOT EXISTS Investimento (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            periodo TEXT NOT NULL,
            valor REAL NOT NULL,
            subcategoria TEXT NOT NULL,
            FOREIGN KEY (periodo) REFERENCES PIB(periodo)
        );
    `);

  console.log("Tables created successfully.");

  // Inserir dados na tabela PIB
  const pibData = data
    .map((row) => ({ periodo: row["Periodo"], valor: row["Valor"] }))
    .filter((row) => row.periodo && row.valor); // Remover duplicados e nulos

  const insertPibStmt = db.prepare(
    "INSERT OR IGNORE INTO PIB (periodo, valor) VALUES (?, ?)",
  );
  pibData.forEach((row) => {
    insertPibStmt.run(row.periodo, row.valor);
  });
  insertPibStmt.finalize();

  // Inserir dados na tabela Investimento
  const investimentoData = data
    .map((row) => ({
      periodo: row["Período"],
      valor: row["Valor Pago"],
      subcategoria: row["Subfunção"],
    }))
    .filter((row) => row.periodo && row.valor && row.subcategoria);

  const insertInvestimentoStmt = db.prepare(
    "INSERT INTO Investimento (periodo, valor, subcategoria) VALUES (?, ?, ?)",
  );
  investimentoData.forEach((row) => {
    insertInvestimentoStmt.run(row.periodo, row.valor, row.subcategoria);
  });
  insertInvestimentoStmt.finalize();

  console.log("Data inserted successfully.");
});

// Fechar a conexão
db.close();
