import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Swal from "sweetalert2";

function Nutricao() {
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
      html: `
        <div class="modal-formulario-user">
          <select id="idFormulario" class="input select-custom" required>
            <option value="" disabled selected>Selecione um treino</option>
            ${opcoesTreino}
          </select>

          <select id="nivelAtividade" class="input select-custom" required>
            <option value="" disabled selected>Selecione o seu nível de atividade</option>
            <option value="iniciante">Levemente ativo</option>
            <option value="intermediario">Ativo</option>
            <option value="avancado">Muito ativo</option>
          </select>

          <select id="preferenciasAlimentares" class="input select-custom" required>
            <option value="" disabled selected>Selecione suas preferências alimentares</option>
            <option value="vegetariano">Vegetariano</option>
            <option value="vegano">Vegano</option>
            <option value="onivoro">Onívoro</option>
            <option value="intolerancias">Intolerâncias</option>
            <option value="nenhuma">Nenhuma</option>
          </select>

          <input type="text" id="alergia" class="input" placeholder="Informe alergias (se houver)" />

          <select id="utilizaSuplemento" class="input select-custom" required>
            <option value="" disabled selected>Você utiliza suplemento?</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>

          <select id="usoMedicacao" class="input select-custom" required>
            <option value="" disabled selected>Você faz uso de medicação?</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>

          <select id="objetivo" class="input select-custom" required>
            <option value="" disabled selected>Qual seu objetivo principal?</option>
            <option value="emagrecimento">Emagrecimento</option>
            <option value="ganho-massa">Ganho de massa</option>
            <option value="manutencao">Manutenção</option>
            <option value="melhorar-saude">Melhorar saúde</option>
            <option value="outro">Outro</option>
          </select>

          <select id="frequenciaAtividade" class="input select-custom">
            <option value="" disabled selected>Frequência de atividade física (vezes/semana)</option>
            <option value="0">0</option>
            <option value="1-2">1 a 2 vezes</option>
            <option value="3-4">3 a 4 vezes</option>
            <option value="5-6">5 a 6 vezes</option>
            <option value="7+">7 ou mais</option>
          </select>

          <select id="qualidadeSono" class="input select-custom" required>
            <option value="" disabled selected>Você considera que dorme bem?</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>
      `,
      confirmButtonText: "Enviar",
      focusConfirm: false,
      preConfirm: () => {
        const idFormulario = document.getElementById("idFormulario").value;
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
          <input type="text" placeholder="Buscar treino" />
          <button onClick={modalFormularioNutricao}>+</button>
        </div>

        <div className="lista-treinos">
          <div>
            <span></span>
            <span className="linha-treino-data"></span>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Nutricao;
