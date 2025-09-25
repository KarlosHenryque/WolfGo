const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/cadastrarEvento', async (req, res) => {
  const { id_usuario, titulo, descricao, horario, data_evento } = req.body;

  if (!id_usuario || !titulo || !horario || !data_evento) {
    return res.status(400).json({ error: 'id_usuario, titulo, horario e data_evento são obrigatórios' });
  }

  const query = `
    INSERT INTO calendario_evento (id_usuario, titulo, descricao, horario, data_evento)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  try {
    const resultado = await pool.query(query, [id_usuario, titulo, descricao, horario, data_evento]);
    res.status(201).json({ evento: resultado.rows[0] });
  } catch (error) {
    console.error('Erro ao salvar evento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/eventoCadatrado/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const query = `
      SELECT id, titulo, descricao, horario, data_evento
      FROM calendario_evento
      WHERE id_usuario = $1
    `;
    const result = await pool.query(query, [id_usuario]);

    const eventos = result.rows.map(evento => {
      const dataISO = evento.data_evento.toISOString().slice(0, 10);
      const start = `${dataISO}T${evento.horario}`;

      return {
        id: evento.id,
        title: evento.titulo,
        description: evento.descricao,
        start: start,
      };
    });

    res.json(eventos);
  } catch (err) {
    console.error("Erro ao buscar eventos:", err);
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
});

router.put('/editarEvento/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, data_evento, horario } = req.body;

  if (!titulo || !data_evento || !horario) {
    return res.status(400).json({ error: 'Título, data e horário são obrigatórios' });
  }

  const query = `
    UPDATE calendario_evento
    SET titulo = $1, descricao = $2, data_evento = $3, horario = $4
    WHERE id = $5
    RETURNING *;
  `;

  try {
    const resultado = await pool.query(query, [titulo, descricao, data_evento, horario, id]);
    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    res.json({ evento: resultado.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



module.exports = router;
