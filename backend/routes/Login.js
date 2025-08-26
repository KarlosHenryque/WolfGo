const express = require('express')
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db');

router.post('/', async(req, res) => {
    const { email, senha } = req.body;

    if(!email || !senha) {
        return res.status(400).json({ messagem: 'Email e senha são obrigatório.' });
    }
    
    try {
        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if(resultado.rows.length === 0) {
            return res.status(401).json({ messagem: 'Email ou senha incorretos' });
        }

        const usuario = resultado.rows[0];

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if(!senhaValida) {
            return res.status(401).json({ messagem: 'Email ou senha incorretos' });
        }

        res.status(200).json({ messagem: 'Login realizado com sucesso', usuario: {id: usuario.id, nome: usuario.nome, email: usuario.email } });
    } catch(error) {
        console.error('Erro no login:', error);
        res.status(500).json({ messagem: 'Erro interno do servidor.' });
    }
});


module.exports = router;