const express = require('express');
const router = express.Router();
const pool = require('../db');

function haversineDistance(coord1, coord2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calcularDistanciaTotal(rota) {
  let distanciaTotal = 0;
  for (let i = 1; i < rota.length; i++) {
    distanciaTotal += haversineDistance(rota[i - 1], rota[i]);
  }
  return distanciaTotal;
}

router.post('/', async (req, res) => {
  try {
    const { rota, id_usuario } = req.body;

    if (!Array.isArray(rota) || rota.length === 0) {
      return res.status(400).json({ erro: 'Rota inválida.' });
    }

    if (!id_usuario) {
      return res.status(400).json({ erro: 'ID do usuário é obrigatório.' });
    }

    const userCheck = await pool.query('SELECT 1 FROM usuarios WHERE id = $1', [id_usuario]);
    if (userCheck.rowCount === 0) {
      return res.status(400).json({ erro: 'Usuário não encontrado.' });
    }

    const distancia = calcularDistanciaTotal(rota);

    const query = `
      INSERT INTO percurso (data_criacao, rota, distancia_km, id_usuario)
      VALUES (NOW(), $1, $2, $3)
      RETURNING *;
    `;
    const values = [JSON.stringify(rota), distancia.toFixed(2), id_usuario];

    const result = await pool.query(query, values);

    res.status(201).json({
      mensagem: 'Rota salva com sucesso!',
      rota: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao salvar rota:', error);
    res.status(500).json({ erro: 'Erro ao salvar a rota.' });
  }
});

router.get('/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, data_criacao, distancia_km, rota FROM percurso WHERE id_usuario = $1 AND status = true ORDER BY data_criacao DESC',
      [id_usuario]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar corridas:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
});

router.delete('/desativarPercurso/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `UPDATE percurso SET status = false WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    res.json({ mensagem: 'Evento desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar evento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/ativarPercurso/:id', async (req, res) => {
  const { id } = req.params;

  const query = `
    UPDATE percurso
    SET status = true
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const resultado = await pool.query(query, [id]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.status(200).json({ message: 'Evento ativado com sucesso', evento: resultado.rows[0] });
  } catch (error) {
    console.error('Erro ao ativar evento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;