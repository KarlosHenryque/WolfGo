const express = require('express');
const axios = require('axios');
const pool = require('../db');
const router = express.Router();

router.post('/formularioUser', async (req, res) => {
  const {
    nomeTreino,
    dataNascimento,
    objetivo,
    experiencia,
    diasTreino,
    duracao,
    algumaLesao,
    altura,
    peso,
    id_usuario,
    sexo
  } = req.body;

  if (
    !nomeTreino || !dataNascimento || !objetivo || !experiencia || !diasTreino ||
    !duracao || !altura || !peso || !id_usuario || !sexo
  ) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  if (isNaN(parseFloat(altura)) || isNaN(parseFloat(peso))) {
    return res.status(400).json({ message: 'Altura e peso devem ser numéricos.' });
  }

  try {
    const [day, month, year] = dataNascimento.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    const query = `
      INSERT INTO formulario_treino 
      (nome_treino, data_nascimento, objetivo, experiencia, dias_treino, duracao, alguma_lesao, altura, peso, id_usuario, sexo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, data_criacao;
    `;

    const result = await pool.query(query, [
      nomeTreino,
      formattedDate,
      objetivo,
      experiencia,
      diasTreino,
      duracao,
      algumaLesao || null,
      altura,
      peso,
      id_usuario,
      sexo,
    ]);

    const { id: savedUserId, data_criacao } = result.rows[0];

    console.log('Dados salvos no banco com sucesso!');

    try {
      await axios.post('http://localhost:5678/webhook-test/formularioUser', {
        id_usuario,
        savedUserId,
        nomeTreino,
        dataNascimento: formattedDate,
        objetivo,
        experiencia,
        diasTreino,
        duracao,
        algumaLesao,
        altura,
        peso,
        sexo,
      });
      console.log('Dados enviados para o n8n com sucesso!');
    } catch (err) {
      console.error('Falha ao enviar dados para o n8n:', err.message);
    }

    res.status(201).json({
      message: 'Treino salvo no banco de dados com sucesso!',
      id: savedUserId,
      data_criacao,
      nomeTreino,
      objetivo,
      sexo,
    });
  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
    res.status(500).json({
      message: 'Erro ao salvar no banco de dados.',
      detalhes: error.message,
    });
  }
});

router.get('/usuario/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const query = `
      SELECT id, nome_treino AS "nomeTreino", data_nascimento, objetivo, experiencia, dias_treino, duracao, alguma_lesao, altura, peso, sexo, status, data_criacao
      FROM formulario_treino 
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
    res.status(500).json({ message: 'Erro ao buscar formulários.', detalhes: error.message });
  }
});


router.get('/:id_formulario', async (req, res) => {
  const { id_formulario } = req.params;

  try {
    const query = `
      SELECT id, nome_treino AS "nomeTreino", data_nascimento, objetivo, experiencia, dias_treino, duracao, alguma_lesao, altura, peso, sexo, data_criacao
      FROM formulario_treino
      WHERE id = $1      
    `;

    const result = await pool.query(query, [id_formulario]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Formulário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar formulário', error);
    res.status(500).json({ message: 'Erro ao buscar formulário', detalhes: error.message });
  }
});

module.exports = router;
