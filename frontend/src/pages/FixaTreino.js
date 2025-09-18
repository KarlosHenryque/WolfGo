import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowCircleLeft,
  FaRegFilePdf,
  FaClipboardList,
  FaTrashAlt,
  FaRegCheckCircle
} from "react-icons/fa";

import Layout from "../components/Layout";
import "../assets/css/FixaTreino.css";

function FixaTreino() {
  const [treino, setTreino] = useState([]);
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
      didOpen: () => Swal.showLoading(),
    });

    const fetchTreino = axios.get(`http://localhost:5000/api/treino/${id}`);
    const delay = new Promise((resolve) => setTimeout(resolve, 1000));

    Promise.all([fetchTreino, delay])
      .then(([response]) => {
        Swal.close();

        if (!response.data || !response.data.treinos || response.data.treinos.length === 0) {
          Swal.fire({
            icon: "error",
            title: "Ops...",
            text: "Treino não encontrado.",
            confirmButtonText: "OK",
          }).then(() => navigate("/treino"));
          return;
        }

        setTreino(response.data.treinos);
      })
      .catch(() => {
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Treino ainda não criado",
          text: "Tente novamente mais tarde.",
          confirmButtonText: "OK",
        }).then(() => navigate("/treino"));
      });
  }, [id, navigate]);

  if (erro) return <div className="erro">{erro}</div>;

  const confirmarAtivacao = () => {
    Swal.fire({
      title: "Ativar Treino?",
      text: "Deseja mesmo reativar esse treino?",
      icon: "question",
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonText: "Ativar",
      confirmButtonColor: "#0067A3",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#ff0000ff",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const response = await axios.put(`http://localhost:5000/api/treino/ativar/${id}`);
        if (response.status === 200) {
          Swal.fire("Ativado!", "O treino foi reativado com sucesso.", "success");
          setTreino((prev) =>
            prev.map(t => ({ ...t, ativo: true }))
          );
        } else {
          Swal.fire("Erro", "Tente novamente mais tarde", "error");
        }
      } catch {
        Swal.fire("Erro", "Tente novamente mais tarde", "error");
      }
    });
  };

  const confirmarDesativacao = () => {
    Swal.fire({
      title: "Tem certeza?",
      text: "Deseja mesmo desativar o formulário?",
      icon: "warning",
      showCancelButton: true,
      reverseButtons: true,
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#ff0000ff",
      confirmButtonText: "Desativar",
      confirmButtonColor: "#0067A3",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const response = await axios.put(`http://localhost:5000/api/treino/deletar/${id}`);
        if (response.status === 200) {
          Swal.fire("Desativado!", "O treino foi desativados com sucesso.", "success").then(() => {
            navigate("/treino");
          });
        } else {
          Swal.fire("Erro", "Tente novamente mais tarde", "error");
        }
      } catch {
        Swal.fire("Erro", "Tente novamente mais tarde", "error");
      }
    });
  };

  const gerarPDF = async () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204);
    doc.text("Ficha de Treino", 105, y, { align: "center" });
    y += 10;

    try {
      const res = await axios.get(`http://localhost:5000/api/formulario/${id}`);
      const form = res.data;

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Nome: ${form.nome}`, 10, y);
      doc.text(`Objetivo: ${form.objetivo}`, 10, y + 6);
      doc.text(`Experiência: ${form.experiencia}`, 10, y + 12);
      doc.text(`Lesão: ${form.alguma_lesao || "Nenhuma"}`, 10, y + 18);
      y += 30;
    } catch (err) {
      console.error("Erro ao buscar formulário:", err);
    }

    if (treino && treino.length > 0) {
      treino.forEach((item) => {
        if (y > 230) {
          doc.addPage();
          y = 20;
        }

        const startY = y;
        const boxX = 10;
        const boxWidth = 190;

        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204);
        doc.text(`${item.dia} - ${item.grupo_muscular}`, 105, y + 6, {
          align: "center",
        });
        y += 12;

        autoTable(doc, {
          startY: y,
          margin: { left: boxX },
          tableWidth: boxWidth,
          head: [["Exercício", "Séries", "Repetições"]],
          body: item.exercicios.map((ex) => [
            ex.nome,
            String(ex.series),
            String(ex.repeticoes),
          ]),
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [255, 183, 0],
            textColor: 0,
            halign: "center",
          },
          bodyStyles: {
            halign: "center",
          },
        });

        const endY = doc.lastAutoTable.finalY;
        doc.setDrawColor(0);
        doc.setLineWidth(0.4);
        doc.rect(boxX, startY, boxWidth, endY - startY + 5);

        y = endY + 15;
      });
    }

    doc.save("treino.pdf");
  };

  const abrirModalFormulario = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/formulario/${id}`);
      const form = res.data;

      Swal.fire({
        title: "Formulário do treino",
        html: `
          <div class="modal-formulario" style="text-align: center">
            <p><strong>Nome:</strong> ${form.nome}</p>
            <p><strong>Data de Nascimento:</strong> ${new Date(
              form.data_nascimento
            ).toLocaleDateString("pt-BR")}</p>
            <p><strong>Objetivo:</strong> ${form.objetivo}</p>
            <p><strong>Experiência:</strong> ${form.experiencia}</p>
            <p><strong>Dias de Treino:</strong> ${form.dias_treino}</p>
            <p><strong>Duração:</strong> ${form.duracao} minutos</p>
            <p><strong>Lesão:</strong> ${form.alguma_lesao || "Nenhuma"}</p>
            <p><strong>Altura:</strong> ${form.altura} m</p>
            <p><strong>Peso:</strong> ${form.peso} kg</p>
          </div>
        `,
        width: "400px",
        confirmButtonText: "Fechar",
        confirmButtonColor: "#ffb700",
        customClass: {
          popup: "swal2-border-radius",
        },
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível carregar os dados do formulário.",
      });
    }
  };

  const handleKeyDown = (event, fn) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fn();
    }
  };

  const ativo = treino.length > 0 ? (treino[0].ativo === true || treino[0].ativo === "true") : false;

  return (
    <Layout>
      <div className="header-treino-container">
        <div
          className="treino-container-voltar"
          onClick={() => navigate("/treino")}
          onKeyDown={(e) => handleKeyDown(e, () => navigate("/treino"))}
          aria-label="Voltar para tela de treinos"
          role="button"
          tabIndex={0}
        >
          <FaArrowCircleLeft />
        </div>

        <div className="treino-container-actions">
          <div
            className="treino-container-pdf"
            onClick={gerarPDF}
            onKeyDown={(e) => handleKeyDown(e, gerarPDF)}
            aria-label="Gerar PDF do treino"
            role="button"
            tabIndex={0}
          >
            <FaRegFilePdf />
          </div>

          <div
            className="treino-container-fixa"
            onClick={abrirModalFormulario}
            onKeyDown={(e) => handleKeyDown(e, abrirModalFormulario)}
            aria-label="Ver formulário"
            role="button"
            tabIndex={0}
          >
            <FaClipboardList />
          </div>

           <div
              className="treino-container-lixeira"
              onClick={ativo ? confirmarDesativacao : confirmarAtivacao}
              onKeyDown={(e) =>
                handleKeyDown(e, ativo ? confirmarDesativacao : confirmarAtivacao)
              }
              aria-label={ativo ? "Desativar treino" : "Ativar Treino"}
              role="button"
              tabIndex={0}
              title={ativo ? "Desativar treino" : "Ativar Treino"}
            >
              {ativo ? <FaTrashAlt /> : <FaRegCheckCircle />}
            </div>
          </div>
      </div>

      <div className="treino-container">
        {treino.length > 0 && treino.map((item, index) => (
          <div key={index} className="treino-item">
            <table
              className="tabela-treino"
              aria-label={`Treino para ${item.dia} - ${item.grupo_muscular}`}
            >
              <caption>
                {item.dia} - {item.grupo_muscular}
              </caption>
              <thead>
                <tr>
                  <th>Exercício</th>
                  <th>Séries</th>
                  <th>Repetições</th>
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
        ))}
      </div>
    </Layout>
  );
}

export default FixaTreino;
