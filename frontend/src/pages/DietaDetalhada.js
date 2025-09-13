import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../assets/css/DietaDetalhada.css';
import { FaArrowCircleLeft, FaRegFilePdf, FaClipboardList } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function DietaDetalhada() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dias, setDias] = useState([]);
  const [nomeGrupoMuscular, setNomeGrupoMuscular] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/dieta/detalhada/${id}`)
      .then(res => res.json())
      .then(data => {
        setDias(data.dias || []);
        setNomeGrupoMuscular(data.dieta?.nome || '');
      })
      .catch(err => {
        console.error('Erro ao buscar dieta detalhada:', err);
      });
  }, [id]);

  const handleVoltar = () => {
    navigate('/nutricao');
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
          y = data.cursor.y + 15; // Atualiza y para próximo conteúdo
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
          <h2 className="titulo-dia">Dieta #{id}</h2>
          <div className="dieta-icons-group">
            <FaClipboardList className="icon-lista" />
            <FaRegFilePdf className="icon-dieta" onClick={exportarPDF} title="Exportar PDF" />
          </div>
        </div>

        {dias.map((dia, index) => (
          <div key={index} className="dieta-dia-tabela">
            <h3 className="subtitulo-dia">
              {dia.dia} {nomeGrupoMuscular ? `- ${nomeGrupoMuscular}` : ''}
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
