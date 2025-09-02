const express = require('express');
const axios = require('axios');
const pool = require('../db');
const router = express.Router();

router.post('/formularioUser', async (req, res) => {
  const { nome, dataNascimento, objetivo, experiencia, diasTreino, duracao, algumaLesao, altura, peso, id_usuario } = req.body;

  if (!nome || !dataNascimento || !objetivo || !experiencia || !diasTreino || !duracao || !altura || !peso || !id_usuario) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const [day, month, year] = dataNascimento.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    const query = `
      INSERT INTO formulario_usuario 
      (nome, data_nascimento, objetivo, experiencia, dias_treino, duracao, alguma_lesao, altura, peso, id_usuario)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id;
    `;

    const result = await pool.query(query, [
      nome,
      formattedDate,
      objetivo,
      experiencia,
      diasTreino,
      duracao,
      algumaLesao || null,
      altura,
      peso,
      id_usuario,
    ]);

    const savedUserId = result.rows[0].id;

    console.log('Dados salvos no banco com sucesso!');

    try {
     await axios.post('http://localhost:5678/webhook/formularioUser', {
        id_usuario,
        savedUserId,
        nome,
        dataNascimento: formattedDate,
        objetivo,
        experiencia,
        diasTreino,
        duracao,
        algumaLesao,
        altura,
        peso,
      });
      console.log('Dados enviados para o n8n com sucesso!');
    } catch (err) {
      console.error('Falha ao enviar dados para o n8n:', err.message);
    }

    res.status(201).json({
      message: 'Treino salvo no banco de dados com sucesso! (envio para n8n pode ter falhado)',
      userId: savedUserId,
    });
  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
    res.status(500).json({
      message: 'Erro ao salvar no banco de dados.',
      detalhe: error.message,
    });
  }
});


// Verificar dados do usuário
router.get('/usuario/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const query = `
      SELECT id, nome, data_nascimento, objetivo, experiencia, dias_treino, duracao, alguma_lesao, altura, peso, data_criacao
      FROM formulario_usuario 
      WHERE id_usuario = $1
      ORDER BY id DESC;
    `;
    const result = await pool.query(query, [id_usuario]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum formulário encontrado para esse usuário.' });
    }

    res.json({ formularios: result.rows });
  } catch (error) {
    console.error('Erro ao buscar formulários:', error);
    res.status(500).json({ message: 'Erro ao buscar formulários.', detalhe: error.message });
  }
});

module.exports = router;
