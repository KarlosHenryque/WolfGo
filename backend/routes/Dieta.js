const express = require('express');
const router = express.Router();
const pool = require('../db'); 

router.post('/', async (req, res) => {
  console.log(req.body); 
  const { id_usuario, id_formulario_usuario, id_formulario_dieta, dieta: dietaRaw } = req.body;

  if (!id_usuario || !id_formulario_usuario || !id_formulario_dieta) {
    return res.status(400).json({ error: 'id_usuario, id_formulario_usuario e id_formulario_dieta são obrigatórios.' });
  }

  if (!dietaRaw || typeof dietaRaw !== 'string') {
    return res.status(400).json({ error: 'Campo dieta inválido ou ausente.' });
  }

  try {
    const cleaned = dietaRaw.replace(/```json/g, '').replace(/```/g, '').trim();
    const dieta = JSON.parse(cleaned);

    if (!Array.isArray(dieta)) {
      return res.status(400).json({ error: 'Formato da dieta inválido. Deve ser um array.' });
    }
    
    return res.json({ message: 'Dieta processada com sucesso (sem salvar em tabela dieta)', dieta });

  } catch (error) {
    return res.status(400).json({ error: 'Formato JSON inválido no campo dieta.', details: error.message });
  }
});



module.exports = router;
