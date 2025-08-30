import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'

import Layout from "../components/Layout";

function FixaTreino() {
    const [treino, setTreino] = useState(null);
    const [erro, setErro] = useState(null);
   const navigate = useNavigate();

    useEffect(() => {
        Swal.fire({
            html: '<h2 style="font-size:40px; margin: 0 0 50px; color: #ffb700;">Aguardando geração do treino...</h2>',
            width: '900px',
            padding: '3em',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const fetchTreino = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/treino/');
                
                Swal.close();

                const treinoData = response.data.treino?.Treino || response.data.treino;
                if (treinoData) {
                    setTreino(treinoData);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Ops...',
                        text: 'Tente novamente mais tarde',
                        confirmButtonText: 'OK'
                    }).then((result) => {
                        navigate('/treino')
                    })
                }
            } catch (error) {
                Swal.close();
            }
        };
        fetchTreino();
    }, [navigate]);

    if (erro) {
        return <div className="erro">{erro}</div>;
    }

    return (
        <Layout>
            <div className="treino-container">
                <h1>Seu Treino</h1>
                {treino ? (
                    <div>
                        {Array.isArray(treino) ? (
                            treino.map((item, index) => (
                                <div key={index} className="treino-item">
                                    <h3>{item.dia}</h3>
                                    <ul>
                                        {item.exercicios.map((exercicio, i) => (
                                            <li key={i}>
                                                {exercicio.nome} - {exercicio.series}x{exercicio.repeticoes}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <pre>{JSON.stringify(treino, null, 2)}</pre>
                        )}
                    </div>
                ) : (
                    <p>Nenhum treino disponível.</p>
                )}
            </div>
        </Layout>
    );
}

export default FixaTreino;