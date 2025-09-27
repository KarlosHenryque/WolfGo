const express = require('express');
const router = express.Router();
const pool = require('../db');

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



// Atualizar foto do usuário (com imagem em base64)
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
    console.error(error.stack);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

module.exports = router;
