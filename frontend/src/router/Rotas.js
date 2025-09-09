import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../components/AuthContext ';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home'
import Treino from '../pages/Treinos';
import FixaTreino from '../pages/FixaTreino';
import Exercicios from '../pages/Exercicios';
import Corrida from '../pages/Corrida';
import Nutricao from '../pages/Nutricao';

function Rotas() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/treino" element={<Treino />} />
          <Route path="/fixaTreino/:id" element={<FixaTreino />} />
          <Route path="/exercicios" element={<Exercicios />} />
          <Route path="/corrida" element={<Corrida />} />
          <Route path="/nutricao" element={<Nutricao />} />
        </Routes> 
      </BrowserRouter>
    </AuthProvider>
  );
}

export default Rotas;
