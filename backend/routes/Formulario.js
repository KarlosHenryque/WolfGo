const express = require('express');
const axios = require('axios');
const pool = require('../db');
const router = express.Router();

// Coletar dados do usuário, salvar no banco de dados e enviar para o n8n
router.post('/formularioUser', async (req, res) => {
    const { nome, dataNascimento, objetivo, experiencia, diasTreino, duracao, algumaLesao, altura, peso, id_usuario } = req.body;

    if (!nome || !dataNascimento || !objetivo || !experiencia || !diasTreino || !duracao || !altura || !peso || !id_usuario) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const [day, month, year] = dataNascimento.split('/');
        const formattedDate = `${year}-${month}-${day}`;

        const query = `
            INSERT INTO formulario_usuario (nome, data_nascimento, objetivo, experiencia, dias_treino, duracao, alguma_lesao, altura, peso, id_usuario)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;
        `;
        const result = await pool.query(query, [nome, formattedDate, objetivo, experiencia, diasTreino, duracao, algumaLesao || null, altura, peso, id_usuario]);
        const savedUserId = result.rows[0].id;

        console.log('Dados salvos no banco com sucesso!');

        const n8nWebhookUrl = 'http://localhost:5678/webhook/fomularioUser';
        await axios.post(n8nWebhookUrl, {
            nome,
            dataNascimento: formattedDate,
            objetivo,
            experiencia,
            diasTreino,
            duracao,
            algumaLesao,
            altura,
            peso
        });

        res.status(201).json({
            message: 'Treino salvo no banco de dados e enviado para o n8n com sucesso!',
            userId: savedUserId
        });

    } catch (error) {
        console.error('Erro ao salvar no banco ou enviar para o n8n:', error);

        res.status(500).json({
            message: 'Erro ao salvar no banco de dados ou enviar para o n8n.',
            detalhe: error.message
        });
    }
});

// Verificar dados do usuário
router.get('/formularioUser', (req, res) => {
    if (!dadosFormularioUser) {
        return res.status(404).json({ message: 'Nenhum dado encontrado' });
    }
    res.json(dadosFormularioUser);
});

module.exports = router;
