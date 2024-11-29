const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors"); // Importar o pacote cors
const app = express();
const PORT = 3000;

// Habilitar CORS para todas as origens
app.use(cors());

// Função para conectar ao banco de dados e buscar os dados de PIB
function obterPibDB(callback) {
  const db = new sqlite3.Database("./db/database.db");
  db.all("SELECT id, periodo, valor FROM PIB", [], (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      const pibBrasil = rows.map((row) => ({
        id: row.id,
        periodo: row.periodo,
        valor: row.valor,
      }));
      callback(null, pibBrasil);
    }
    db.close();
  });
}

// Endpoint para obter os dados de PIB
app.get("/pib", (req, res) => {
  obterPibDB((err, pib) => {
    if (err) {
      res.status(500).json({ error: "Erro ao buscar dados de PIB" });
    } else {
      res.json(pib);
    }
  });
});

// Função para conectar ao banco de dados e buscar os dados de Investimento
function obterInvestimentoDB(callback) {
  const db = new sqlite3.Database("./db/database.db");
  db.all(
    "SELECT id, periodo, valor, subcategoria FROM Investimento",
    [],
    (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        const investimento = rows.map((row) => ({
          id: row.id,
          periodo: row.periodo,
          valor: row.valor,
          subcategoria: row.subcategoria,
        }));
        callback(null, investimento);
      }
      db.close();
    },
  );
}

// Endpoint para obter os dados de Investimento
app.get("/investimento", (req, res) => {
  obterInvestimentoDB((err, investimento) => {
    if (err) {
      res.status(500).json({ error: "Erro ao buscar dados de Investimento" });
    } else {
      res.json(investimento);
    }
  });
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
