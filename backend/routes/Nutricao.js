const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');

router.post('/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  const {
    id_formulario,
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
    // Inserir dados de nutrição
    const insertQuery = `
      INSERT INTO nutricao (
        id_formulario, nivel_atividade, preferencias_alimentares, alergia, utiliza_suplemento, uso_medicacao, objetivo, frequencia_atividade, qualidade_sono
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
    `;
    const values = [
      id_formulario,
      nivel_atividade,
      preferencias_alimentares,
      alergia,
      utiliza_suplemento,
      uso_medicacao,
      objetivo,
      frequencia_atividade,
      qualidade_sono,
    ];
    const insertResult = await pool.query(insertQuery, values);
    const nutricaoSalva = insertResult.rows[0];

    // Buscar dados do formulário do usuário
    const formularioQuery = `
      SELECT 
        f.id, f.nome, f.data_nascimento, f.objetivo, f.experiencia, f.dias_treino, f.duracao,
        f.alguma_lesao, f.altura, f.peso, f.id_usuario, f.data_criacao, f.sexo
      FROM formulario_usuario f
      JOIN usuarios u ON u.id = f.id_usuario
      WHERE f.id = $1 AND f.id_usuario = $2
      LIMIT 1;
    `;
    const formularioResult = await pool.query(formularioQuery, [id_formulario, id_usuario]);
    if (formularioResult.rowCount === 0) {
      return res.status(404).json({ message: 'Formulário de usuário não encontrado' });
    }
    const formulario = formularioResult.rows[0];

    // Buscar treinos e exercícios relacionados ao formulário
    const treinoQuery = `
      SELECT
        t.id AS treino_id,
        t.dia AS nome_treino,
        t.grupo_muscular AS descricao_treino,
        e.id AS exercicio_id,
        e.nome AS nome_exercicio,
        e.series,
        e.repeticoes
      FROM treino t
      LEFT JOIN exercicio e ON e.id_treino = t.id
      WHERE t.id_formulario = $1
      ORDER BY t.id, e.id;
    `;
    const treinoResult = await pool.query(treinoQuery, [id_formulario]);
    const rows = treinoResult.rows;

    // Agrupar treinos com exercícios
    const treinos = [];
    rows.forEach(row => {
      let treino = treinos.find(t => t.treino_id === row.treino_id);
      if (!treino) {
        treino = {
          treino_id: row.treino_id,
          nome_treino: row.nome_treino,
          descricao_treino: row.descricao_treino,
          exercicios: []
        };
        treinos.push(treino);
      }
      if (row.exercicio_id) {
        treino.exercicios.push({
          exercicio_id: row.exercicio_id,
          nome_exercicio: row.nome_exercicio,
          series: row.series,
          repeticoes: row.repeticoes,
        });
      }
    });

    // Montar objeto completo para enviar ao webhook
    const dadosParaWebhook = {
      formulario_usuario: {
        id: formulario.id,
        nome: formulario.nome,
        data_nascimento: formulario.data_nascimento,
        objetivo: formulario.objetivo,
        experiencia: formulario.experiencia,
        dias_treino: formulario.dias_treino,
        duracao: formulario.duracao,
        alguma_lesao: formulario.alguma_lesao,
        altura: formulario.altura,
        peso: formulario.peso,
        id_usuario: formulario.id_usuario,
        data_criacao: formulario.data_criacao,
        sexo: formulario.sexo,
      },
      nutricao: nutricaoSalva,
      treinos: treinos
    };

    // Enviar para webhook
    const webhookURL = 'http://localhost:5678/webhook-test/dieta';
    try {
      await axios.post(webhookURL, dadosParaWebhook);
      console.log('Dados enviados com sucesso para o webhook');
    } catch (postErr) {
      console.error('Erro ao enviar dados para o webhook:', postErr.message);
    }

    res.status(201).json({
      message: 'Dados inseridos e enviados ao webhook com sucesso',
      dadosEnviados: dadosParaWebhook
    });
  } catch (error) {
    console.error('Erro no processo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
