const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');

router.post('/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  const {
    id_formulario,
    nome,
    nivel_atividade,
    preferencias_alimentares,
    alergia,
    utiliza_suplemento,
    uso_medicacao,
    objetivo,
    frequencia_atividade,
    qualidade_sono,
  } = req.body;

  if (!id_formulario) {
    return res.status(400).json({ message: 'Campo id_formulario é obrigatório' });
  }

  try {
    const insertQuery = `
      INSERT INTO formulario_dieta (
        id_formulario_treino, nome_dieta, nivel_atividade, preferencias_alimentares, alergia, 
        utiliza_suplemento, uso_medicacao, objetivo, frequencia_atividade, 
        qualidade_sono, id_usuario
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const values = [
      id_formulario,
      nome,
      nivel_atividade,
      preferencias_alimentares,
      alergia,
      utiliza_suplemento,
      uso_medicacao,
      objetivo,
      frequencia_atividade,
      qualidade_sono,
      id_usuario,
    ];
    const insertResult = await pool.query(insertQuery, values);
    const dadosDieta = insertResult.rows[0];

    const formularioQuery = `
      SELECT 
        id, nome_treino, data_nascimento, objetivo, experiencia, dias_treino, duracao,
        alguma_lesao, altura, peso, id_usuario, data_criacao, sexo
      FROM formulario_treino
      WHERE id = $1 AND id_usuario = $2
      LIMIT 1;
    `;
    const formularioResult = await pool.query(formularioQuery, [id_formulario, id_usuario]);
    if (formularioResult.rowCount === 0) {
      return res.status(404).json({ message: 'Formulário de usuário não encontrado' });
    }
    const formulario = formularioResult.rows[0];

    const treinoQuery = `
      SELECT
        t.id AS treino_id,
        t.dia,
        t.grupo_muscular,
        e.id AS exercicio_id,
        e.nome AS nome_exercicio,
        e.series,
        e.repeticoes
      FROM treino t
      INNER JOIN exercicio e ON e.id_treino = t.id
      WHERE t.id_formulario = $1
      ORDER BY t.id, e.id;
    `;
    const treinoResult = await pool.query(treinoQuery, [id_formulario]);

    const treinos = [];
    treinoResult.rows.forEach(row => {
      let treino = treinos.find(t => t.treino_id === row.treino_id);
      if (!treino) {
        treino = {
          treino_id: row.treino_id,
          dia: row.dia,
          grupo_muscular: row.grupo_muscular,
          exercicios: []
        };
        treinos.push(treino);
      }
      treino.exercicios.push({
        exercicio_id: row.exercicio_id,
        nome_exercicio: row.nome_exercicio,
        series: row.series,
        repeticoes: row.repeticoes
      });
    });

    const dadosParaN8n = {
      formulario_treino: formulario,
      formulario_dieta: dadosDieta,
      treinos: treinos
    };

    const webhookURL = 'http://localhost:5678/webhook/dieta'; 
    try {
      await axios.post(webhookURL, dadosParaN8n);
      console.log('✅ Dados enviados com sucesso para o n8n');
    } catch (postErr) {
      console.error('Erro ao enviar para o n8n:', postErr.message);
    }

    res.status(201).json({
      message: 'Dados inseridos e enviados ao n8n com sucesso',
      dadosEnviados: dadosParaN8n,
    });
  } catch (error) {
    console.error('Erro geral:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
