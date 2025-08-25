import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import axios from 'axios';

function FixaTreino() {
    const [treino, setTreino] = useState(null);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        // Exibe o modal de carregamento
        Swal.fire({
            html: '<h2 style="font-size:40px; margin: 0 0 50px; color: #ffb700;">Aguardando geração do treino...</h2>',
            width: '900px',
            padding: '3em',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Faz a requisição uma única vez
        const fetchTreino = async () => {
            try {
                // A requisição será segurada pelo backend.
                const response = await axios.get('http://localhost:5000/api/treino');
                
                // O modal só é fechado quando a resposta chega.
                Swal.close();

                const treinoData = response.data.treino?.Treino || response.data.treino;
                if (treinoData) {
                    setTreino(treinoData);
                } else {
                    // Trata o caso de não haver dados, embora o backend já faça isso
                    setErro('Resposta inválida do servidor.');
                }
            } catch (error) {
                // Se a resposta for 204, significa que o tempo limite foi atingido.
                // Outros erros são tratados aqui também.
                Swal.close();
                if (error.response?.status === 204) {
                    setErro('Tempo limite atingido. Treino não disponível.');
                } else {
                    console.error("Erro na requisição:", error);
                    setErro('Ocorreu um erro ao buscar o treino.');
                }
            }
        };

        fetchTreino();
    }, []);

    if (erro) {
        return <div className="erro">{erro}</div>;
    }

    return (
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
    );
}

export default FixaTreino;