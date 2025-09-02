import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowCircleLeft, FaRegFilePdf } from "react-icons/fa";

import Layout from "../components/Layout";
import '../assets/css/FixaTreino.css'

function FixaTreino() {
  const [treino, setTreino] = useState(null);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!id) {
      setErro("Treino não especificado.");
      return;
    }

    Swal.fire({
      html: '<h2 style="font-size:40px; margin: 0 0 50px; color: #ffb700;">Aguardando geração do treino...</h2>',
      width: "900px",
      padding: "3em",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const fetchTreino = axios.get(`http://localhost:5000/api/treino/${id}`);
    const delay = new Promise(resolve => setTimeout(resolve, 1000));

    Promise.all([fetchTreino, delay])
      .then(([response]) => {
        Swal.close();

        if (!response.data || response.data.length === 0) {
          Swal.fire({
            icon: "error",
            title: "Ops...",
            text: "Treino não encontrado.",
            confirmButtonText: "OK",
          }).then(() => {
            navigate("/treino");
          });
          return;
        }

        setTreino(response.data);
      }).catch(() => {
        Swal.close();

        Swal.fire({
          icon: "error",
          title: "Treino ainda não criado",
          text: "Tente novamente mais tarde.",
          confirmButtonText: "OK"
        }).then(() => {
          navigate("/treino");
        });
      });
  }, [id, navigate]);

  if (erro) {
    return <div className="erro">{erro}</div>;
  }

  return (
    <Layout>
      <div className="header-treino-container">
        <div className="treino-container-voltar" onClick={() => navigate('/treino')} aria-label="Voltar para tela de treinos" role="button" tabIndex={0}>
          <FaArrowCircleLeft />
        </div>

        <div className="treino-container-pdf" aria-label="Gerar PDF do treino" role="button" tabIndex={0}>
          <FaRegFilePdf />
        </div>
      </div>

      <div className="treino-container">
        {treino ? (
          Array.isArray(treino) ? (
            treino.map((item, index) => (
              <div key={index} className="treino-item">
                <table className="tabela-treino" aria-label={`Treino para ${item.dia} - ${item.grupo_muscular}`}>
                  <caption>{item.dia} - {item.grupo_muscular}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Exercício</th>
                      <th scope="col">Séries</th>
                      <th scope="col">Repetições</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.exercicios.map((exercicio, i) => (
                      <tr key={i}>
                        <td>{exercicio.nome}</td>
                        <td>{exercicio.series}</td>
                        <td>{exercicio.repeticoes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <pre>{JSON.stringify(treino, null, 2)}</pre>
          )
        ) : null}
      </div>
    </Layout>
  );
}

export default FixaTreino;
