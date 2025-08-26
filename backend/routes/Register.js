const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db'); 

router.post('/', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ messagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (resultado.rows.length > 0) {
            return res.status(400).json({ messagem: 'Email já cadastrado.' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)',
            [nome, email, senhaHash]
        );

        res.status(201).json({ messagem: 'Usuário cadastrado com sucesso.' });

    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ messagem: 'Erro interno do servidor.' });
    }
});

module.exports = router;
