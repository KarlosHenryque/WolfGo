const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// Buscar dados do usuário
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      'SELECT nome, email, foto FROM usuarios WHERE id = $1',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    const usuario = resultado.rows[0];

    if (usuario.foto) {
      usuario.foto = usuario.foto.toString('base64');
    } else {
      usuario.foto = null;
    }

    res.json(usuario);

  } catch (error) {
    console.error('Erro ao buscar perfil:', error.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

// Atualizar nome e email
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ mensagem: 'Nome e email são obrigatórios.' });
  }

  try {
    const resultado = await pool.query(
      'UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3 RETURNING id, nome, email',
      [nome, email, id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    res.json({
      mensagem: 'Perfil atualizado com sucesso.',
      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

// Atualizar senha
router.post('/senha/:id', async (req, res) => {
  const { id } = req.params;
  const { senhaAtual, novaSenha } = req.body;

  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos.' });
  }

  try {
    // Busca a senha atual do banco
    const resultado = await pool.query(
      'SELECT senha FROM usuarios WHERE id = $1',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    const senhaHash = resultado.rows[0].senha;

    // Verifica se a senha atual está correta
    const senhaValida = await bcrypt.compare(senhaAtual, senhaHash);

    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Senha atual incorreta.' });
    }

    // Gera novo hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    await pool.query(
      'UPDATE usuarios SET senha = $1 WHERE id = $2',
      [novaSenhaHash, id]
    );

    res.json({ mensagem: 'Senha atualizada com sucesso.' });

  } catch (error) {
    console.error('Erro ao atualizar senha:', error.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

// Atualizar foto
router.post('/foto/:id', async (req, res) => {
  const { id } = req.params;
  const { fotoBase64 } = req.body;

  if (!fotoBase64) {
    return res.status(400).json({ mensagem: 'A foto em base64 é obrigatória.' });
  }

  try {
    const fotoBuffer = Buffer.from(fotoBase64, 'base64');

    const resultado = await pool.query(
      'UPDATE usuarios SET foto = $1 WHERE id = $2 RETURNING nome, email, foto',
      [fotoBuffer, id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    res.json({
      mensagem: 'Foto atualizada com sucesso.',
      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar foto:', error.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

module.exports = router;
