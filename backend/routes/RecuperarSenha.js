const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ mensagem: 'O e-mail é obrigatório.' });
  }

  try {
    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário com este e-mail não foi encontrado.' });
    }

    const usuario = resultado.rows[0];

    const codigo = gerarCodigo();
    const codigoExpiraEm = new Date(Date.now() + 15 * 60 * 1000); 

    await pool.query(`
      INSERT INTO tokens_recuperacao (usuario_id, token, expira_em)
      VALUES ($1, $2, $3)
    `, [usuario.id, codigo, codigoExpiraEm]);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Código de Recuperação de Senha - WolfGO',
      html: `
        <p>Olá, ${usuario.nome}</p>
        <p>Seu código para recuperação de senha é:</p>
        <h2>${codigo}</h2>
        <p>Esse código é válido por 15 minutos.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ mensagem: 'Código de recuperação enviado com sucesso!' });

  } catch (error) {
    console.error('Erro ao enviar código de recuperação:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

router.post('/validarCodigo', async (req, res) => {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ mensagem: 'Email e código são obrigatórios.' });
  }

  try {
    const resultadoUsuario = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);

    if (resultadoUsuario.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    const usuarioId = resultadoUsuario.rows[0].id;

    const resultadoCodigo = await pool.query(`
      SELECT * FROM tokens_recuperacao
      WHERE usuario_id = $1
      AND token = $2
      AND expira_em > NOW()
      ORDER BY expira_em DESC
      LIMIT 1
    `, [usuarioId, codigo]);

    if (resultadoCodigo.rows.length === 0) {
      return res.status(400).json({ mensagem: 'Código inválido ou expirado.' });
    }


    res.status(200).json({ mensagem: 'Código válido!' });

  } catch (error) {
    console.error('Erro ao validar código:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

router.post('/redefinirSenha', async (req, res) => {
  const { email, codigo, novaSenha } = req.body;

  if (!email || !codigo || !novaSenha) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }

  try {
    const resultadoUsuario = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);

    if (resultadoUsuario.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    const usuarioId = resultadoUsuario.rows[0].id;

    const resultadoCodigo = await pool.query(`
      SELECT * FROM tokens_recuperacao
      WHERE usuario_id = $1
      AND token = $2
      AND expira_em > NOW()
      LIMIT 1
    `, [usuarioId, codigo]);

    if (resultadoCodigo.rows.length === 0) {
      return res.status(400).json({ mensagem: 'Código inválido ou expirado.' });
    }

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(novaSenha, saltRounds);

    await pool.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [senhaHash, usuarioId]);

    await pool.query('DELETE FROM tokens_recuperacao WHERE usuario_id = $1 AND token = $2', [usuarioId, codigo]);

    res.status(200).json({ mensagem: 'Senha redefinida com sucesso!' });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});


module.exports = router;
