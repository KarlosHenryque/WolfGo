require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const Login = require('./routes/Login');
const Register = require('./routes/Register');
const ExerciciosApi = require('./routes/ExerciciosApi');
const FormularioUser = require('./routes/Formulario');
const TreinoIa = require('./routes/Treino');

app.use('/api/login', Login);
app.use('/api/register', Register);
app.use('/api/exercicios', ExerciciosApi);
app.use('/api/formulario', FormularioUser);
app.use('/api/treino', TreinoIa);


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
