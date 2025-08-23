const express = require('express');
const router = express.Router();

let treinoSalvo = null;

// Rota POST para receber treino do n8n
router.post('/', (req, res) => {
  let treino = req.body;

  if (!treino || typeof treino !== 'object') {
    return res.status(400).json({ error: 'Treino inválido.' });
  }

  // Se o campo Treino vier como string JSON, faz o parse
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
  }

  // ✅ Removido o .some(), agora sempre sobrescreve
  treinoSalvo = treino;

  res.json({ message: 'Treino salvo com sucesso!' });
});

// GET retorna o treino mais recente
router.get('/', (req, res) => {
  if (!treinoSalvo) {
    return res.status(404).json({ error: 'Nenhum treino salvo ainda.' });
  }

  res.json({ treino: treinoSalvo });
});

module.exports = router;
