const express = require('express');
const router = express.Router();
const pool = require('../db');

let treinoSalvo = null;

// Rota POST para receber treino do n8n
router.post('/', async (req, res) => {
  let treino = req.body;

  if (!treino || typeof treino !== 'object') {
    return res.status(400).json({ error: 'Treino inválido.' });
  }

  if (typeof treino.Treino === 'string') {
    try {
      const cleaned = treino.Treino
        .replace(/```json/, '')
        .replace(/```/, '')
        .trim();

      treino.Treino = JSON.parse(cleaned);
    } catch (e) {
      return res.status(400).json({ error: 'Formato JSON inválido no campo Treino.' });
    }
  } else if (typeof treino.Treino !== 'object') {
    return res.status(400).json({ error: 'Campo Treino não é um objeto válido.' });
  }

  try {
    const { formulario_usuario_id, treino_nome, descricao, data_inicio, data_fim } = treino.Treino;

    const query = `
      INSERT INTO treinos_usuario (treino_nome, descricao, data_inicio, data_fim, formulario_usuario_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    
    const values = [
      treino_nome, 
      descricao, 
      data_inicio, 
      data_fim, 
      formulario_usuario_id
    ];

    const result = await pool.query(query, values);
    const treinoId = result.rows[0].id;

    res.json({ message: 'Treino salvo com sucesso!', treinoId });
  } catch (error) {
    console.error('Erro ao salvar treino no banco:', error);
    res.status(500).json({ error: 'Erro ao salvar treino no banco de dados.' });
  }
});

// GET retorna o treino mais recente
router.get('/', async (req, res) => {
  const maxEsperar = 30000;
  const intervalo = 1000;
  const inicio = Date.now();

  const esperarTreino = () => {
    return new Promise((resolve, reject) => {
      const checar = () => {
        if (treinoSalvo) {
          const treinoParaEnviar = treinoSalvo;
          treinoSalvo = null;
          return resolve(treinoParaEnviar);
        }

        if (Date.now() - inicio >= maxEsperar) {
          return resolve(null);
        }

        setTimeout(checar, intervalo);
      };

      try {
        checar();
      } catch (err) {
        reject(err);
      }
    });
  };

  try {
    const treino = await esperarTreino();

    if (treino) {
      res.json({ treino });
    } else {
      res.status(400).json({ error: 'Treino ainda não disponível.' });
    }
  } catch (error) {
    console.error('Erro ao esperar treino:', error);
    res.status(500).json({ error: 'Erro no servidor ao aguardar o treino.' });
  }
});

module.exports = router;
