import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../components/AuthContext ';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home'
import Treino from '../pages/Treinos';
import FixaTreino from '../pages/FixaTreino';

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
        </Routes> 
      </BrowserRouter>
    </AuthProvider>
  );
}

export default Rotas;
