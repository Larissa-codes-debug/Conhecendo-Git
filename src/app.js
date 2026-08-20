const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();

const PORT = 3000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = "desafio_db";

app.use(express.json());

let db;

// Conectar ao MongoDB
async function conectarMongoDB() {
    try {
        const client = new MongoClient(MONGO_URL);

        await client.connect();

        db = client.db(DB_NAME);

        console.log("MongoDB conectado com sucesso!");

    } catch (erro) {
        console.error("Erro ao conectar no MongoDB:", erro);
    }
}

// Rota principal
app.get("/", (req, res) => {
    res.json({
        mensagem: "Servidor Node.js funcionando!",
        status: "online",
        banco: "MongoDB"
    });
});

// Rota de teste
app.get("/api/status", (req, res) => {
    res.json({
        servidor: "online",
        mongodb: db ? "conectado" : "desconectado"
    });
});

// Criar usuário
app.post("/api/usuarios", async (req, res) => {
    try {
        const { nome, email } = req.body;

        if (!nome || !email) {
            return res.status(400).json({
                erro: "Nome e email são obrigatórios"
            });
        }

        const resultado = await db.collection("usuarios").insertOne({
            nome,
            email,
            criadoEm: new Date()
        });

        res.status(201).json({
            mensagem: "Usuário criado com sucesso!",
            id: resultado.insertedId
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao criar usuário"
        });
    }
});

// Listar usuários
app.get("/api/usuarios", async (req, res) => {
    try {
        const usuarios = await db
            .collection("usuarios")
            .find()
            .toArray();

        res.json(usuarios);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao buscar usuários"
        });
    }
});

// Iniciar servidor
async function iniciarServidor() {
    await conectarMongoDB();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`http://localhost:${PORT}`);
    });
}

iniciarServidor();
