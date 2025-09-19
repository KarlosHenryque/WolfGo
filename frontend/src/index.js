import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Rotas from './router/Rotas';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Rotas />
  </React.StrictMode>
);

reportWebVitals();
