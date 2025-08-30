import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import Layout from "../components/Layout";

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
      },
    });

    const fetchTreino = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/treino/${id}`);
        Swal.close();

        if (response.data.length === 0) {
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
      } catch (error) {
        Swal.close();
        setErro("Erro ao buscar o treino.");
      }
    };

    fetchTreino();
  }, [id, navigate]);

  if (erro) {
    return <div className="erro">{erro}</div>;
  }

  return (
    <Layout>
      <div className="treino-container">
        <h1>Seu Treino</h1>
        {treino ? (
          Array.isArray(treino) ? (
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
          )
        ) : (
          <p>Nenhum treino disponível.</p>
        )}
      </div>
    </Layout>
  );
}

export default FixaTreino;
