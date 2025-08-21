const express = require('express');
const axios = require('axios');
const router = express.Router();

// Salvar treino que o n8n enviou 
const treinosSalvo = [];

router.post('/', (req, res) => {
  const treino = req.body;

  if (!treino || typeof treino !== 'object') {
    return res.status(400).json({ error: 'Treino inválido.' });
  }

  const existe = treinosSalvo.some(t => JSON.stringify(t) === JSON.stringify(treino));
  if (existe) {
    return res.status(409).json({ error: 'Treino já existe.' });
  }

  treinosSalvo.push(treino);

  res.json({ message: 'Treino salvo com sucesso!' });
});

// GET retorna todos os treinos armazenados
router.get('/', (req, res) => {
  if (!treinosSalvo.length) {
    return res.status(404).json({ error: 'Nenhum treino salvo ainda.' });
  }
  res.json({ treinos: treinosSalvo });
});

module.exports = router;
