import React from 'react';
import Layout from '../components/Layout';
import '../assets/css/Exercicios.css';

import { FaSearch } from 'react-icons/fa';

function Exercicios() {
  return (
    <Layout>
        <div className="container-exercicios">
            <h1 className='exercicio-titulo'>Exercícios</h1>

            <div className='input-buscar-treino'>
                <input placeholder='Buscar exercício' />
                <button className='exercicio-lupa'>< FaSearch /></button>
            </div>
        </div>
    </Layout>
  );
}

export default Exercicios;
