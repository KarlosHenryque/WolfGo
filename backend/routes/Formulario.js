const express = require('express');
const axios = require('axios');
const router = express.Router();

let dadosFormularioUser = null;

//Coletar dados do usuário e enviar para o n8n
router.post('/formularioUser', async (req, res) => {
    dadosFormularioUser = req.body;

    console.log('Dados Recebidos com sucesso', dadosFormularioUser);

    try {
        const n8nWebhookUrl = 'http://localhost:5678/webhook/fomularioUser';

        await axios.post(n8nWebhookUrl, dadosFormularioUser);

        res.status(201).json({
            message: 'Treino recebido e enviado para o n8n com sucesso!',
            dados: dadosFormularioUser
        });
    } catch (error) {
        console.error('Erro ao enviar para webhook n8n:', error.message);
        res.status(500).json({ error: 'Erro ao enviar para webhook n8n.', detalhe: error.message });
    }
});

//Verificar dados do usuário
router.get('/formularioUser', (req, res) => {

   if(!dadosFormularioUser) {
    return res.status(404).json({message: 'Nenhum dado encontrado' });
   }

   res.json(dadosFormularioUser);
});

module.exports = router