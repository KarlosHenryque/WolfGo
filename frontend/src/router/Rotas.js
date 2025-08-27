import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/Login';
import Treino from '../pages/Treinos';
import FixaTreino from '../pages/FixaTreino';

function Rotas() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/treino" element={<Treino />} />
        <Route path="/FixaTreino" element={<FixaTreino />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Rotas;
