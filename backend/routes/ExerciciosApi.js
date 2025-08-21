const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.RAPIDAPI_KEY;

router.get('/', async (req, res) => {
    try {
        const opcao = {
            method: 'GET',
            url: 'https://exercisedb.p.rapidapi.com/exercises', 
            params: { limit: '1200', offset: '0' },
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        };

        const response = await axios.request(opcao);
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao conectar com a API:', error.response?.status, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Erro ao buscar exercícios.',
            error: error.response?.data || error.message
        });
    }
});

module.exports = router;
