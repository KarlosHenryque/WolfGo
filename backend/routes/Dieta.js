const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const dieta = req.body; 

  if (!dieta) {
    return res.status(400).json({ error: 'Nenhum dado recebido' });
  }

  console.log('Dieta recebida:', dieta);

  // Aqui você pode fazer o que quiser com os dados, por exemplo, salvar no DB

  return res.status(200).json({ message: 'Dieta recebida com sucesso', data: dieta });
});

module.exports = router;
