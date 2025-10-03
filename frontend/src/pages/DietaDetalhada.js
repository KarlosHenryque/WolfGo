import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../assets/css/DietaDetalhada.css';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from 'sweetalert2';          
import axios from 'axios';               
import {
  FaArrowCircleLeft,
  FaRegFilePdf,
  FaClipboardList,
  FaTrashAlt,
  FaRegCheckCircle
} from "react-icons/fa";

function DietaDetalhada() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dias, setDias] = useState([]);
  const [nomeGrupoMuscular, setNomeGrupoMuscular] = useState('');
  const [ativo, setAtivo] = useState(false);  
  const [erro, setErro] = useState('');

  useEffect(() => {
  if (!id) {
    setErro("Dieta não especificada.");
    return;
  }

  Swal.fire({
      html: '<h2 style="font-size:40px; margin: 0 0 50px; color: #ffb700;">Aguardando geração da dieta...</h2>',
      width: "900px",
      padding: "3em",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const fetchDieta = axios.get(`http://localhost:5000/api/dieta/detalhada/${id}`);
    const delay = new Promise((resolve) => setTimeout(resolve, 1000));

    Promise.all([fetchDieta, delay])
      .then(([response]) => {
        Swal.close();

        if (!response.data || !response.data.dias || response.data.dias.length === 0) {
          Swal.fire({
            icon: "error",
            title: "Ops...",
            text: "Dieta não encontrada.",
            confirmButtonText: "OK",
          }).then(() => navigate("/nutricao"));
          return;
        }

        setDias(response.data.dias);
        setNomeGrupoMuscular(response.data.dieta?.nome || "");
        setAtivo(response.data.dieta?.ativo === true || response.data.dieta?.ativo === "true");
      })
      .catch(() => {
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Dieta ainda não criada",
          text: "Tente novamente mais tarde.",
          confirmButtonText: "OK",
        }).then(() => navigate("/nutricao"));
      });
  }, [id, navigate]);


  const handleKeyDown = (event, fn) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fn();
    }
  };

  const confirmarAtivacao = () => {
    Swal.fire({
      title: "Ativar Dieta?",
      text: "Deseja mesmo reativar essa dieta?",
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
        const response = await axios.put(`http://localhost:5000/api/dieta/ativar/${id}`);
        if (response.status === 200) {
          Swal.fire("Ativado!", "A dieta foi reativada com sucesso.", "success");
          setAtivo(true);
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
      text: "Deseja mesmo desativar a dieta?",
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
        const response = await axios.put(`http://localhost:5000/api/dieta/deletar/${id}`);
        if (response.status === 200) {
          Swal.fire("Desativado!", "A dieta foi desativada com sucesso.", "success").then(() => {
            navigate("/nutricao");
          });
        } else {
          Swal.fire("Erro", "Tente novamente mais tarde", "error");
        }
      } catch {
        Swal.fire("Erro", "Tente novamente mais tarde", "error");
      }
    });
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204);
    doc.text("Dieta Detalhada", 105, y, { align: "center" });
    y += 15;

    dias.forEach((dia, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      const titulo = `${dia.dia} ${nomeGrupoMuscular ? `- ${nomeGrupoMuscular}` : ''}`;
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text(titulo, 105, y, { align: "center" });
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [['Refeição', 'Alimentos']],
        body: dia.refeicoes.map(refeicao => [
          refeicao.refeicao,
          refeicao.itens.join(', ')
        ]),
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: {
          fillColor: [255, 183, 0],
          textColor: 0,
          halign: "center",
        },
        bodyStyles: {
          halign: "left",
        },
        margin: { left: 10, right: 10 },
        tableWidth: 'auto',
        didDrawPage: (data) => {
          y = data.cursor.y + 15; 
        }
      });
    });

    doc.save(`dieta_${id}.pdf`);
  };

  const abrirModalFormulario = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/nutricao/${id}`);
      const form = res.data;

      Swal.fire({
        title: "Formulário de Dieta",
        html: `
          <div class="modal-formulario" style="text-align: center">
            <p><strong>Nome da Dieta:</strong> ${form.nome}</p>
            <p><strong>Nível de Atividade:</strong> ${form.nivel_atividade}</p>
            <p><strong>Preferências Alimentares:</strong> ${form.preferencias_alimentares}</p>
            <p><strong>Alergias:</strong> ${form.alergia || "Nenhuma"}</p>
            <p><strong>Utiliza Suplemento:</strong> ${form.utiliza_suplemento ? "Sim" : "Não"}</p>
            <p><strong>Uso de Medicação:</strong> ${form.uso_medicacao || "Nenhuma"}</p>
            <p><strong>Objetivo:</strong> ${form.objetivo}</p>
            <p><strong>Frequência de Atividade:</strong> ${form.frequencia_atividade}</p>
            <p><strong>Qualidade do Sono:</strong> ${form.qualidade_sono}</p>
          </div>
        `,
        width: "500px",
        confirmButtonText: "Fechar",
        confirmButtonColor: "#ffb700",
        customClass: {
          popup: "swal2-border-radius",
        },
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível carregar os dados do formulário.",
      });
    }
  };

  return (
    <Layout>
        <div className="header-dieta-container">
          <div
            className="dieta-container-voltar"
            onClick={() => navigate("/nutricao")}
            onKeyDown={(e) => handleKeyDown(e, () => navigate("/nutricao"))}
            aria-label="Voltar para tela de treinos"
            role="button"
            tabIndex={0}
          >
            <FaArrowCircleLeft />
          </div>
  
          <div className="dieta-container-actions">
            <div
              className="dieta-container-pdf"
              onClick={exportarPDF}
              onKeyDown={(e) => handleKeyDown(e, exportarPDF)}
              aria-label="Gerar PDF do treino"
              role="button"
              tabIndex={0}
            >
              <FaRegFilePdf />
            </div>
  
            <div
              className="dieta-container-fixa"
              aria-label="Ver formulário"
              onClick={abrirModalFormulario}
              role="button"
              tabIndex={0}
            >
              <FaClipboardList />
            </div>
  
              <div
                className="dieta-container-lixeira"
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

        {dias.map((dia, index) => (
          <div key={index} className="dieta-dia-tabela">
            <h3 className="subtitulo-dia">
              {dia.dia} 
            </h3>

            <table className="tabela-refeicoes">
              <thead>
                <tr>
                  <th>Refeição</th>
                  <th>Alimentos</th>
                </tr>
              </thead>
              <tbody>
                {dia.refeicoes.map((refeicao, i) => (
                  <tr key={i}>
                    <td>{refeicao.refeicao}</td>
                    <td>{refeicao.itens.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </Layout>
  );
}

export default DietaDetalhada;
