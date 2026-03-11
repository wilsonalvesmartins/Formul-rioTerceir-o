const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurações do Express
app.use(express.json());
// Serve a pasta "public" onde ficará o HTML (Frontend único)
app.use(express.static(path.join(__dirname, 'public')));

// Garantir que a pasta "data" exista para salvar o banco SQLite
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializar banco de dados SQLite
const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Erro ao conectar ao SQLite:', err.message);
    else console.log('Conectado ao banco de dados SQLite.');
});

// Criar tabela se não existir
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS formaturas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomeCompleto TEXT,
        endereco TEXT,
        dataNascimento TEXT,
        nomePais TEXT,
        qtdAcompanhantes INTEGER,
        qtdParcelas INTEGER,
        formaPagamento TEXT,
        dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Senha definida na solicitação
const ADMIN_PASSWORD = 'waliquel2026';

// Middleware de segurança para rotas de Admin
const requireAdmin = (req, res, next) => {
    const pass = req.headers['x-admin-password'];
    if (pass === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Acesso Negado ou Senha Incorreta' });
    }
};

// ================= ROTAS ================= //

// 1. Receber dados do Formulário (Público)
app.post('/api/formaturas', (req, res) => {
    const { nomeCompleto, endereco, dataNascimento, nomePais, qtdAcompanhantes, qtdParcelas, formaPagamento } = req.body;
    
    // Validação básica do servidor
    if (qtdParcelas < 1 || qtdParcelas > 6) {
        return res.status(400).json({ error: 'A quantidade de parcelas deve ser entre 1 e 6.' });
    }

    const query = `INSERT INTO formaturas (nomeCompleto, endereco, dataNascimento, nomePais, qtdAcompanhantes, qtdParcelas, formaPagamento) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [nomeCompleto, endereco, dataNascimento, nomePais, qtdAcompanhantes, qtdParcelas, formaPagamento];
    
    db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: 'Informações enviadas com sucesso!' });
    });
});

// 2. Listar todas as respostas (Requer Senha)
app.get('/api/formaturas', requireAdmin, (req, res) => {
    db.all(`SELECT * FROM formaturas ORDER BY dataCriacao DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. Atualizar uma resposta (Requer Senha)
app.put('/api/formaturas/:id', requireAdmin, (req, res) => {
    const { nomeCompleto, endereco, dataNascimento, nomePais, qtdAcompanhantes, qtdParcelas, formaPagamento } = req.body;
    const { id } = req.params;

    const query = `UPDATE formaturas SET nomeCompleto = ?, endereco = ?, dataNascimento = ?, nomePais = ?, qtdAcompanhantes = ?, qtdParcelas = ?, formaPagamento = ? WHERE id = ?`;
    const params = [nomeCompleto, endereco, dataNascimento, nomePais, qtdAcompanhantes, qtdParcelas, formaPagamento, id];
    
    db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Atualizado com sucesso!', changes: this.changes });
    });
});

// 4. Deletar uma resposta (Requer Senha)
app.delete('/api/formaturas/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM formaturas WHERE id = ?`, id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Apagado com sucesso!', changes: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor a correr perfeitamente na porta ${PORT}`);
});
