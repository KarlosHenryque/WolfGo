import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import { ModalFormularioDieta } from "../components/ModalFormularioDieta";

function Nutricao() {
  const navigate = useNavigate();
  const [formularios, setFormularios] = useState([]);
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
  }, [idUser]);

  const modalFormularioNutricao = () => {
    if (!idUser) {
      Swal.fire("Erro", "Usuário não autenticado.", "error");
      return;
    }

    const opcoesTreino = formularios
      .map(
        (f) =>
          `<option value="${f.id}">Formulário #${f.id} - ${
            f.nome ? f.nome : "Sem nome"
          } - ${new Date(f.data_criacao).toLocaleDateString("pt-BR")}</option>`
      )
      .join("");

    Swal.fire({
      title: "Formulário Nutricional",
      html: ModalFormularioDieta(opcoesTreino), 
      focusConfirm: false,
      showCancelButton: true,
      reverseButtons: true,
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

  return (
    <Layout>
      <div className="container-treino">
        <div className="input-buscar-treino">
          <input type="text" placeholder="Buscar dieta" disabled />
          <button onClick={modalFormularioNutricao}>+</button>
        </div>

        <div className="lista-treinos">
          <p>Lista de dietas removida, pois tabela foi excluída.</p>
        </div>
      </div>
    </Layout>
  );
}

export default Nutricao;
