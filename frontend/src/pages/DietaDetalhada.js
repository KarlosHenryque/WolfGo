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

  useEffect(() => {
    fetch(`http://localhost:5000/api/dieta/detalhada/${id}`)
      .then(res => res.json())
      .then(data => {
        setDias(data.dias || []);
        setNomeGrupoMuscular(data.dieta?.nome || '');
        setAtivo(data.dieta?.ativo === true || data.dieta?.ativo === "true");  
      })
      .catch(err => {
        console.error('Erro ao buscar dieta detalhada:', err);
      });
  }, [id]);

  const handleVoltar = () => {
    navigate('/nutricao');
  };

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

  return (
    <Layout>
      <div className="dieta-detalhada-container">
        <div className="dieta-header-icons">
          <FaArrowCircleLeft className="icon-dieta" onClick={handleVoltar} title="Voltar" />
            <div className="dieta-icons-group">
              <FaClipboardList className="icon-lista" />
              <FaRegFilePdf className="icon-dieta" onClick={exportarPDF} title="Exportar PDF" />
            <div
              className="treino-container-lixeira"
              onClick={ativo ? confirmarDesativacao : confirmarAtivacao}
              onKeyDown={(e) =>
                handleKeyDown(e, ativo ? confirmarDesativacao : confirmarAtivacao)
              }
              aria-label={ativo ? "Desativar dieta" : "Ativar dieta"}
              role="button"
              tabIndex={0}
              title={ativo ? "Desativar dieta" : "Ativar dieta"}
              style={{ cursor: 'pointer' }}
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
      </div>
    </Layout>
  );
}

export default DietaDetalhada;
