import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import { ModalFormularioTreino } from "../components/ModalFormularioTreino";
import "../assets/css/Treinos.css";

function Treino() {
  const [treinos, setTreinos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("ativo"); 
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
            status: formulario.status, 
            sexo: formulario.sexo || "",
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

  const handleFiltroChange = (e) => {
    setFiltroStatus(e.target.value);
  };

  const treinosFiltrados = treinos.filter((treino) => {
    if (filtroStatus === "ativo") return treino.status === true;
    if (filtroStatus === "desativado") return treino.status === false;
    return true; 
  });

  const modalFormulario = () => {
    Swal.fire({
      title: "Formulário Treino",
      html: ModalFormularioTreino(),
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Salvar",
      confirmButtonColor: "#0067A3",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#ff0000ff",
      reverseButtons: true,
      preConfirm: () => {
        const nomeTreino = Swal.getPopup().querySelector("#nomeTreino").value;
        const dataNascimento = Swal.getPopup().querySelector("#dataNascimento").value;
        const objetivo = Swal.getPopup().querySelector("#objetivo").value;
        const experiencia = Swal.getPopup().querySelector("#experiencia").value;
        const diasTreino = Swal.getPopup().querySelector("#diasTreino").value;
        const sexo = Swal.getPopup().querySelector("#sexo").value;
        const duracao = Swal.getPopup().querySelector("#duracaoTreino").value;
        const algumaLesao = Swal.getPopup().querySelector("#algumaLesao").value;
        const altura = Swal.getPopup().querySelector("#altura").value;
        const peso = Swal.getPopup().querySelector("#peso").value;

        if (
          !nomeTreino ||
          !dataNascimento ||
          !objetivo ||
          !experiencia ||
          !diasTreino ||
          !sexo ||
          !duracao ||
          !altura ||
          !peso
        ) {
          Swal.showValidationMessage("Por favor, preencha todos os campos obrigatórios.");
          return false;
        }

        const dataRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!dataRegex.test(dataNascimento)) {
          Swal.showValidationMessage("Data inválida. Use o formato DD/MM/AAAA.");
          return false;
        }

        if (!idUser) {
          Swal.showValidationMessage("Usuário não autenticado. Por favor, faça login.");
          return false;
        }

        return {
          nomeTreino,
          dataNascimento,
          objetivo,
          experiencia,
          diasTreino,
          sexo,
          duracao,
          algumaLesao,
          altura,
          peso,
          id_usuario: idUser,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        fetch("http://localhost:5000/api/formulario/formularioUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(result.value),
        })
          .then(async (response) => {
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(errorText || "Erro ao enviar dados");
            }
            return response.json();
          })
          .then((data) => {
            Swal.fire("Sucesso!", "Formulario salvo com sucesso.", "success").then(() => {
              setTreinos((oldTreinos) => [
                ...oldTreinos,
                {
                  id: data.id || Date.now(),
                  nome: data.nomeTreino || result.value.nomeTreino,
                  data: new Date(data.data_criacao || Date.now()).toLocaleDateString('pt-BR'),
                  objetivo: data.objetivo || result.value.objetivo,
                  sexo: data.sexo || result.value.sexo,
                  status: true, 
                },
              ]);
              Swal.close();
            });
          })
          .catch(() => {
            Swal.fire("Erro", `Não foi possível salvar`, "error");
          });
      }
    });
  };

  return (
    <Layout>
      <div className="container-treino">
        <select
          id="filtroStatusTreino"
          value={filtroStatus}
          onChange={handleFiltroChange}
          className="filtroStatus"
        >
          <option className="filtroStatusTreinoOptions" value="todos">Todos</option>
          <option className="filtroStatusTreinoOptions" value="ativo">Ativo</option>
          <option className="filtroStatusTreinoOptions" value="desativado">Desativado</option>
        </select>

        <div className="input-buscar-treino">
          <input type="text" placeholder="Buscar treino" />
          <button onClick={modalFormulario}>+</button>
        </div>

        <div className="lista-treinos">
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
