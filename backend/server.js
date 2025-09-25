require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

    const Calendar = require('./routes/Calendar');
    const Login = require('./routes/Login');
    const Register = require('./routes/Register');
    const FormularioTreino = require('./routes/FormularioTreino');
    const TreinoIa = require('./routes/Treino');
    const ExerciciosApi = require('./routes/ExerciciosApi');
    const Corrida = require('./routes/Corrida');
    const Nutricao = require('./routes/Nutricao');
    const Dieta = require('./routes/Dieta')

    app.use('/api/calendar', Calendar);
    app.use('/api/login', Login);
    app.use('/api/register', Register);
    app.use('/api/formulario', FormularioTreino);
    app.use('/api/treino', TreinoIa);
    app.use('/api/exercicios', ExerciciosApi);
    app.use('/api/corrida', Corrida);
    app.use('/api/nutricao', Nutricao);
    app.use('/api/dieta', Dieta);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
