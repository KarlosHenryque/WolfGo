import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import "../assets/css/Treinos.css";
import "../assets/css/SwalFire.css";

function Treino() {
  const [treinos, setTreinos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("ativo"); // padrão ao entrar na tela
  const navigate = useNavigate();

  const idUser = localStorage.getItem("usuarioId");

  useEffect(() => {
    if (!idUser) return;

    fetch(`http://localhost:5000/api/formulario/usuario/${idUser}`)
      .then((res) => {
        if (!res.ok) throw new Error("Não foi possível buscar os formulários");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.formularios)) {
          const treinosDoUsuario = data.formularios.map((formulario) => ({
            id: formulario.id,
            nome: formulario.nomeTreino || "Treino",
            data: new Date(formulario.data_criacao).toLocaleDateString('pt-BR'),
            objetivo: formulario.objetivo || "",
            status: formulario.status, // ASSUMINDO que o backend retorna isso
          }));
          setTreinos(treinosDoUsuario);
        } else {
          setTreinos([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar treinos:", err);
        setTreinos([]);
      });
  }, [idUser]);

  // Função para lidar com mudança no filtro
  const handleFiltroChange = (e) => {
    setFiltroStatus(e.target.value);
  };

  // Aplica filtro no array antes de renderizar
  const treinosFiltrados = treinos.filter((treino) => {
    if (filtroStatus === "ativo") return treino.status === true;
    if (filtroStatus === "desativado") return treino.status === false;
    return true; // "todos"
  });

  const modalFormulario = () => {
    // seu modal aqui, sem alterações necessárias para filtro
  };

  return (
    <Layout>
      <div className="container-treino">
        <select
          id="filtroStatusTreino"
          value={filtroStatus}
          onChange={handleFiltroChange}
        >
          <option value="todos">Todos</option>
          <option value="ativo">Ativo</option>
          <option value="desativado">Desativado</option>
        </select>
        <div className="input-buscar-treino">
          <input type="text" placeholder="Buscar treino" />
          <button onClick={modalFormulario}>+</button>
        </div>

        <div className="lista-treinos">
          {treinosFiltrados.length === 0 && (
            <p style={{ color: 'var(--cor-texto)' }}>Nenhum treino encontrado.</p>
          )}
          {treinosFiltrados.map((treino) => (
            <div
              key={treino.id}
              className="linha-treino"
              onClick={() => navigate(`/FixaTreino/${treino.id}`)}
            >
              <span>{treino.nome}</span>
              <span className="linha-treino-data">{treino.data}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Treino;
