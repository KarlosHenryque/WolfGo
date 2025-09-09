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

function calcularDistanciaTotal(pontos) {
  let distanciaTotal = 0;
  for (let i = 1; i < pontos.length; i++) {
    distanciaTotal += haversineDistance(pontos[i - 1], pontos[i]);
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
      INSERT INTO rotas (create_data, pontos, distancia_km, id_usuario)
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
      'SELECT create_data, distancia_km FROM rotas WHERE id_usuario = $1 ORDER BY create_data DESC',
      [id_usuario]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar corridas:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
});

module.exports = router;