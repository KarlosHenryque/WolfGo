const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.RAPIDAPI_KEY;

router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://exercisedb.p.rapidapi.com/exercises', {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    });

    const exercises = response.data.map(ex => ({
      id: ex.id,
      name: ex.name,
      bodyPart: ex.bodyPart,
      equipment: ex.equipment,
      target: ex.target,
      gifUrl: ex.gifUrl, 
    }));

    res.json(exercises);
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error);
    res.status(500).json({ error: 'Erro ao buscar exercícios' });
  }
});

module.exports = router;
