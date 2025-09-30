import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../assets/css/Treinos.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ModalFormularioDieta } from "../components/ModalFormularioDieta";

function Nutricao() {
  const navigate = useNavigate();
  const [formularios, setFormularios] = useState([]);
  const [dietas, setDietas] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("ativo"); 
  const [filtro, setFiltro] = useState("");
  const idUser = localStorage.getItem("usuarioId");

  useEffect(() => {
    if (!idUser) return;

    fetch(`http://localhost:5000/api/formulario/usuario/${idUser}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.formularios)) {
          setFormularios(data.formularios);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar formulários:", err);
      });

    fetch(`http://localhost:5000/api/dieta/usuario/${idUser}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.dietas)) {
          setDietas(data.dietas);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar dietas:", err);
      });
  }, [idUser]);

  const modalFormularioNutricao = () => {
    if (!idUser) {
      Swal.fire("Erro", "Usuário não autenticado.", "error");
      return;
    }

    const opcoesTreino = formularios
    .map(
      (f) =>
        `<option value="${f.id}">Treino: ${f.nomeTreino} - ${new Date(f.data_criacao).toLocaleDateString("pt-BR")}</option>`
    )
    .join("");

    Swal.fire({
      title: "Formulário Nutricional",
      html: ModalFormularioDieta(opcoesTreino),
      focusConfirm: false,
      showCancelButton: true,
      reverseButtons: true,
      showCloseButton: true,
      confirmButtonText: "Salvar",
      confirmButtonColor: "#0067A3",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#ff0000ff",
      preConfirm: () => {
        const idFormulario = document.getElementById("idFormulario").value;
        const nomeDieta = document.getElementById("nomeDieta").value.trim();
        const nivelAtividade = document.getElementById("nivelAtividade").value;
        const preferenciasAlimentares = document.getElementById("preferenciasAlimentares").value;
        const alergia = document.getElementById("alergia").value.trim();
        const utilizaSuplemento = document.getElementById("utilizaSuplemento").value;
        const usoMedicacao = document.getElementById("usoMedicacao").value;
        const objetivo = document.getElementById("objetivo").value;
        const frequenciaAtividade = document.getElementById("frequenciaAtividade").value;
        const qualidadeSono = document.getElementById("qualidadeSono").value;

        if (
          !idFormulario ||
          !nomeDieta ||
          !nivelAtividade ||
          !preferenciasAlimentares ||
          !utilizaSuplemento ||
          !usoMedicacao ||
          !objetivo ||
          !qualidadeSono
        ) {
          Swal.showValidationMessage("Preencha todos os campos obrigatórios.");
          return false;
        }

        return {
          id_formulario: parseInt(idFormulario, 10),
          nome: nomeDieta,
          nivel_atividade: nivelAtividade,
          preferencias_alimentares: preferenciasAlimentares,
          alergia: alergia || null,
          utiliza_suplemento: utilizaSuplemento,
          uso_medicacao: usoMedicacao,
          objetivo: objetivo,
          frequencia_atividade: frequenciaAtividade || null,
          qualidade_sono: qualidadeSono,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:5000/api/nutricao/${idUser}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(result.value),
        })
          .then((res) => res.json())
          .then((data) => {
            Swal.fire("Sucesso!", data.message || "Dados salvos com sucesso!", "success");
          })
          .catch(() => {
            Swal.fire("Erro", "Erro ao salvar os dados", "error");
          });
      }
    });
  };

  const handleFiltroChange = (event) => {
    setFiltroStatus(event.target.value);
  };

  const dietasFiltradas = dietas.filter((dieta) => {
    if (filtroStatus === "ativo" && dieta.status !== true) return false;
    if (filtroStatus === "desativado" && dieta.status !== false) return false;

    if (filtro.trim() !== "") {
      const termoBusca = filtro.toLowerCase();
      if (!dieta.nome_dieta.toLowerCase().includes(termoBusca)) {
        return false;
      }
    }

    return true;
  });

  return (
    <Layout>
      <div className="container-treino">
        <select
          id="filtroStatusDieta"
          value={filtroStatus}
          onChange={handleFiltroChange}
          className="filtroStatus"
        >
          <option value="todos">Todos</option>
          <option value="ativo">Ativo</option>
          <option value="desativado">Desativado</option>
        </select>

        <div className="input-buscar-treino">
          <input type="text" placeholder="Buscar dieta" value={filtro} onChange={(e) => setFiltro(e.target.value)}/>
          <button onClick={modalFormularioNutricao}>+</button>
        </div>

        <div className="treino-container-lixeira">
          {dietasFiltradas.length === 0 ? null : (
            dietasFiltradas.map((dieta) => (
              <div
                key={dieta.id_formulario_dieta}
                className="linha-treino"
                onClick={() => navigate(`/dieta/${dieta.id_formulario_dieta}`)}
              >
                <span>{dieta.nome_dieta}</span>
                <span className="linha-treino-data">
                  {new Date(dieta.data_criacao).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Nutricao;
