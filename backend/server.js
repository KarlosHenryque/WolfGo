require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const ExerciciosApi = require('./routes/ExerciciosApi');
const FormularioUser = require('./routes/Formulario');
const TreinoIa = require('./routes/Treino');

app.use('/api/exercicios', ExerciciosApi);
app.use('/api/formulario', FormularioUser);
app.use('/api/treino', TreinoIa);


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
