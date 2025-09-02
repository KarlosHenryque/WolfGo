import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import "../assets/css/Treinos.css";
import "../assets/css/SwalFire.css";

function Treino() {
  const [treinos, setTreinos] = useState([]);
  const navigate = useNavigate();

  const idUser = localStorage.getItem("usuarioId");
  console.log("ID usuário:", idUser);

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
              nome: formulario.nome || "Treino",
              data: new Date(formulario.data_criacao).toLocaleDateString('pt-BR'),
              objetivo: formulario.objetivo || "",
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

  const modalFormulario = () => {
    Swal.fire({
      title: "Formulário",
      html: `
        <div class="modal-formulario-user">
          <input type="text" id="nomeTreino" class="input" placeholder="Nome do treino" />
          <input type="text" id="dataNascimento" class="input" placeholder="DD/MM/AAAA" maxlength="10" />
          <input type="text" id="objetivo" class="input" placeholder="Objetivo" />
          <select id="experiencia" class="input select-custom">
            <option value="" disabled selected>Selecione o seu nível</option>
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
          <select id="diasTreino" class="input select-custom">
            <option value="" disabled selected>Selecione a quantidade de dias</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
          </select>
          <input type="text" id="duracaoTreino" class="input" placeholder="Duração (minutos)" />
          <input type="text" id="algumaLesao" class="input" placeholder="Alguma Lesão" />
          <input type="text" id="altura" class="input" placeholder="Altura (m)" />
          <input type="text" id="peso" class="input" placeholder="Peso (kg)" />
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Salvar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      preConfirm: () => {
        const nome = Swal.getPopup().querySelector("#nomeTreino").value;
        const dataNascimento = Swal.getPopup().querySelector("#dataNascimento").value;
        const objetivo = Swal.getPopup().querySelector("#objetivo").value;
        const experiencia = Swal.getPopup().querySelector("#experiencia").value;
        const diasTreino = Swal.getPopup().querySelector("#diasTreino").value;
        const duracao = Swal.getPopup().querySelector("#duracaoTreino").value;
        const algumaLesao = Swal.getPopup().querySelector("#algumaLesao").value;
        const altura = Swal.getPopup().querySelector("#altura").value;
        const peso = Swal.getPopup().querySelector("#peso").value;

        if (
          !nome ||
          !dataNascimento ||
          !objetivo ||
          !experiencia ||
          !diasTreino ||
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
          nome,
          dataNascimento,
          objetivo,
          experiencia,
          diasTreino,
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
                  nome: data.nome || result.value.nome,
                  data: new Date(data.data_criacao || Date.now()).toLocaleDateString('pt-BR'),  
                  objetivo: data.objetivo || result.value.objetivo,
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
        <div className="input-buscar-treino">
          <input type="text" placeholder="Buscar treino" />
          <button onClick={modalFormulario}>+</button>
        </div>

        <div className="lista-treinos">
          {treinos.map((treino) => (
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
