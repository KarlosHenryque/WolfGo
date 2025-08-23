import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import axios from 'axios';

function FixaTreino() {
  const [treino, setTreino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchTreino = async () => {
      const startTime = Date.now();

      Swal.fire({
        html: '<h2 style="font-size:40px; margin: 0 0 50px; color: #ffb700;">Carregando treino...</h2>',
        width: '900px',
        padding: '3em',
        customClass: {
          popup: 'my-swal-popup'
        },
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await axios.get('http://localhost:5000/api/treino');
        
        const treinoData = response.data.treino || response.data.treinos;

        if (!treinoData) {
          setErro('Nenhum treino encontrado.');
        } else {
          if (treinoData.Treino) {
            setTreino(treinoData.Treino);
          }
        }
      } catch (error) {
        console.error(error);
        setErro('Erro ao carregar o treino.');
      } finally {
        const elapsed = Date.now() - startTime;
        const remainingTime = 5000 - elapsed;

        if (remainingTime > 0) {
          setTimeout(() => {
            Swal.close();
            setLoading(false);
          }, remainingTime);
        } else {
          Swal.close();
          setLoading(false);
        }
      }
    };

    fetchTreino();
  }, []);

  if (loading) {
    return null; // Ou um spinner, se quiser
  }

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
