import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Treino from '../pages/Treinos';
import FixaTreino from '../pages/FixaTreino';

function Rotas() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Treino />} />
        <Route path="/FixaTreino" element={<FixaTreino />} />

      </Routes>
    </BrowserRouter>
  );
}

export default Rotas;
