import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from '../components/PrivateRoute';
import { AuthProvider } from '../components/AuthProvider';

import Login from '../pages/Login';
import Register from '../pages/Register'
import Treino from '../pages/Treinos';
import FixaTreino from '../pages/FixaTreino';

function Rotas() {
  return (
    <BrowserRouter>
    <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/treino" element={ <PrivateRoute> <Treino /> </PrivateRoute> } />
          <Route path="/fixaTreino" element={ <PrivateRoute> <FixaTreino /> </PrivateRoute> } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default Rotas;
