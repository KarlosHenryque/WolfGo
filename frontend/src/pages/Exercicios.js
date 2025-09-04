import React from 'react';
import Layout from '../components/Layout';

import { FaMagnifyingGlass } from "react-icons/fa6";

function Exercicios() { 
    return (
        <Layout>
        <div>
            <h1 className='exercicio-treino'>Exercicios</h1>

            <div className='exercicio-input-buscar-treino'>
                <input placeholder='Buscar exercício' />
                <button>< FaMagnifyingGlass /></button>
            </div>

            <div className='exercicio-btn-treino'>
                <button>Ombro</button>
                <button>Costa</button>
                <button>Peito</button>
            </div>

            <div className='exercicio-cards-exercicios'>
                <div className='card-exercicio'>

                </div>

                <div className='exercicio-card-exercicio'>

                </div>
            </div>
        </div>
        </Layout>
    )
}

export default Exercicios;