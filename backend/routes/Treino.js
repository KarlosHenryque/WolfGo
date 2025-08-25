const express = require('express');
const router = express.Router();

let treinoSalvo = null;

// Rota POST para receber treino do n8n
router.post('/', (req, res) => {
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
  }

  treinoSalvo = treino;

  res.json({ message: 'Treino salvo com sucesso!' });
});

// GET retorna o treino mais recente
// GET retorna o treino mais recente
router.get('/', async (req, res) => {
  const maxEsperar = 30000;
  const intervalo = 1000;
  const inicio = Date.now();

  const esperarTreino = () => {
    return new Promise((resolve) => {
      const checar = () => {
        if (treinoSalvo) {
          // Aqui a mágica acontece.
          // Quando o treino é recebido, retornamos o valor e o resetamos.
          const treinoParaEnviar = treinoSalvo;
          treinoSalvo = null; // Resetamos a variável para esperar pelo próximo treino.
          return resolve(treinoParaEnviar);
        }

        if (Date.now() - inicio >= maxEsperar) {
          return resolve(null);
        }

        setTimeout(checar, intervalo);
      };

      checar();
    });
  };

  const treino = await esperarTreino();

  if (treino) {
    res.json({ treino });
  } else {
    res.status(204).json({ message: 'Treino ainda não disponível.' });
  }
});

module.exports = router;
