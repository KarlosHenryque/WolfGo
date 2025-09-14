import React, { useEffect, useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { VscListFlat } from "react-icons/vsc";
import { FaPlay, FaStop } from "react-icons/fa";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../assets/css/Corrida.css';
import Layout from '../components/Layout';
import localizadorIcon from '../assets/img/localizador.png';
import AuthContext from '../components/AuthContext ';

const localizacaoIcon = L.icon({
  iconUrl: localizadorIcon,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -32]
});

function Corrida() {
  const navigate = useNavigate();
  const { usuarioId } = useContext(AuthContext);
  const [posicao, setPosicao] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [rota, setRota] = useState([]);
  const watchIdRef = useRef(null);

  useEffect(() => {
    Swal.fire({
      html: '<h2 style="font-size:40px; margin: 0 0 50px; color: #ffb700;">Carregando localização...</h2>',
      width: "900px",
      padding: "3em",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setTimeout(() => {
      Swal.close();
    }, 3000);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setPosicao(coords);
        },
        () => {
          Swal.fire({
            icon: 'error',
            title: 'Não foi possível obter sua localização',
            html: '<p style="font-size: 18px;">Verifique se o GPS está ativado ou se o navegador tem permissão para acessar a localização.</p>',
            confirmButtonText: 'Voltar para o início',
            confirmButtonColor: '#ff0000ff',
            width: '600px',
            padding: '2em',
            allowOutsideClick: false,
            customClass: {
              popup: 'swal2-border-radius'
            }
          }).then(() => {
            navigate('/home');
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Geolocalização não suportada',
        html: '<p style="font-size: 18px;">Seu navegador não suporta geolocalização.</p>',
        confirmButtonText: 'Voltar para o início',
        confirmButtonColor: '#ff0000ff',
        width: '600px',
        padding: '2em',
        allowOutsideClick: false
      }).then(() => {
        navigate('/home');
      });
    }
  }, [navigate]);

  const iniciarCorrida = () => {
    setTracking(true);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosicao(coords);
        setRota(prev => [...prev, coords]);
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
    watchIdRef.current = watchId;
  };

  const pararCorrida = () => {
    setTracking(false);
    navigator.geolocation.clearWatch(watchIdRef.current);

    if (!usuarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Usuário não autenticado',
        text: 'Faça login para salvar a corrida.',
        confirmButtonColor: '#ff0000ff'
      });
      return navigate('/login');
    }

    fetch('http://localhost:5000/api/corrida', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rota, id_usuario: usuarioId })
    })
      .then(res => res.json())
      .then(data => {
        Swal.fire({
          icon: 'success',
          title: 'Corrida salva!',
          text: data.mensagem || 'Seu trajeto foi registrado com sucesso!',
          confirmButtonColor: '#ff0000ff'
        });
        setRota([]);
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao salvar corrida',
          text: 'Tente novamente mais tarde.',
          confirmButtonColor: '#ff0000ff'
        });
      });
  };

  const abrirHistoricoCorridas = async () => {
    if (!usuarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Usuário não autenticado',
        text: 'Faça login para ver suas corridas.',
        confirmButtonColor: '#ff0000ff'
      });
      return navigate('/login');
    }

    try {
      const response = await fetch(`http://localhost:5000/api/corrida/${usuarioId}`);
      const corridas = await response.json();

      if (!corridas.length) {
        return Swal.fire({
          icon: 'info',
          title: 'Nenhuma corrida encontrada',
          text: 'Você ainda não registrou nenhuma corrida.',
          confirmButtonColor: '#ff0000ff'
        });
      }

      const lista = corridas.map((c, index) => {
        const dataObj = new Date(c.data_criacao);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const km = parseFloat(c.distancia_km).toFixed(2);

        return `
          <tr class="linha-corrida" data-index="${index}" style="cursor:pointer;">
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">${dataFormatada} às ${horaFormatada}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${km} km</td>
          </tr>`;
      }).join('');

      Swal.fire({
        title: 'Histórico de Corridas',
        html: `
          <table style="width: 100%; border-collapse: collapse; margin: 0 auto;">
            <thead>
              <tr>
                <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">Data/Hora</th>
                <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Distância</th>
              </tr>
            </thead>
            <tbody class="listaCorrida">${lista}</tbody>
          </table>
        `,
        width: '500px',
        padding: '2em',
        confirmButtonText: 'Fechar',
        confirmButtonColor: '#ff0000ff',
        didRender: () => {
          document.querySelectorAll('.linha-corrida').forEach((linha) => {
            linha.addEventListener('click', () => {
              const index = linha.getAttribute('data-index');
              const corrida = corridas[index];

              try {
                const rotaSelecionada = typeof corrida.rota === 'string' ? JSON.parse(corrida.rota) : corrida.rota;

                if (!Array.isArray(rotaSelecionada) || rotaSelecionada.length === 0) {
                  throw new Error('Rota inválida.');
                }

                abrirModalMapaComRota(rotaSelecionada);
              } catch (err) {
                Swal.fire({
                  icon: 'error',
                  title: 'Erro ao carregar rota',
                  text: 'Não foi possível exibir a rota desta corrida.',
                  confirmButtonColor: '#ff0000ff'
                });
              }
            });
          });
        }
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao buscar corridas',
        text: 'Tente novamente mais tarde.',
        confirmButtonColor: '#ffb700'
      });
    }
  };

  const abrirModalMapaComRota = (rotaSelecionada) => {
    Swal.fire({
      title: 'Percurso',
      html: `
        <div style="text-align:center;">
          <div id="mapa-rota" style="width: 100%; height: 400px;"></div>
        </div>
      `,
      width: '800px',
      padding: '1em',
      showCloseButton: true,
      showConfirmButton: false,
      didOpen: () => {
        const mapa = L.map('mapa-rota').setView(rotaSelecionada[0], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapa);

        L.polyline(rotaSelecionada, { color: 'blue' }).addTo(mapa);

        L.marker(rotaSelecionada[0], { icon: localizacaoIcon }).addTo(mapa).openPopup();
        L.marker(rotaSelecionada[rotaSelecionada.length - 1], { icon: localizacaoIcon }).addTo(mapa);

        mapa.fitBounds(rotaSelecionada);
      }
    });
  };

  if (!posicao) return null;

  return (
    <Layout>
      <div className="corrida-container">
        <MapContainer center={posicao} zoom={17} className="mapa">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> colaboradores'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={posicao}
            icon={localizacaoIcon}
            draggable={tracking}
            eventHandlers={{
              drag: (e) => {
                const novaPosicao = [e.latlng.lat, e.latlng.lng];
                setPosicao(novaPosicao);
                setRota((prev) => {
                  const ultima = prev[prev.length - 1];
                  if (!ultima || ultima[0] !== novaPosicao[0] || ultima[1] !== novaPosicao[1]) {
                    return [...prev, novaPosicao];
                  }
                  return prev;
                });
              }
            }}
          >
            <Popup>Sua localização atual</Popup>
          </Marker>

          {rota.length > 1 && <Polyline positions={rota} color="blue" />}
        </MapContainer>

        <div className="botoes-corrida">
          <button className="botao-icone" onClick={ abrirHistoricoCorridas }>
            <VscListFlat size={24} />
          </button>

          {!tracking ? (
            <button onClick={iniciarCorrida} className="botao-corrida iniciar">
              <FaPlay style={{ marginRight: 8 }} />
              Iniciar Corrida
            </button>
          ) : (
            <button onClick={pararCorrida} className="botao-corrida parar">
              <FaStop style={{ marginRight: 8 }} />
              Parar Corrida
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Corrida;