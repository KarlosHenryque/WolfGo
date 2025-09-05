import React, { useEffect, useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { VscListFlat } from "react-icons/vsc";
import { IoIosStar } from "react-icons/io";
import { FaPlay, FaStop } from "react-icons/fa";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../assets/css/Corrida.css';
import Layout from '../components/Layout';
import localizadorIcon from '../assets/img/localizador.png';
import AuthContext from '../components/AuthContext';

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
            confirmButtonColor: '#ffb700',
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
        confirmButtonColor: '#ffb700',
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
        confirmButtonColor: '#ffb700'
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
          confirmButtonColor: '#ffb700'
        });
        setRota([]);
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao salvar corrida',
          text: 'Tente novamente mais tarde.',
          confirmButtonColor: '#ffb700'
        });
      });
  };

  const abrirHistoricoCorridas = async () => {
    if (!usuarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Usuário não autenticado',
        text: 'Faça login para ver suas corridas.',
        confirmButtonColor: '#ffb700'
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
          confirmButtonColor: '#ffb700'
        });
      }

      const lista = corridas.map(( c ) => {
        const dataObj = new Date(c.create_data);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const km = parseFloat(c.distancia_km).toFixed(2);

        return `<tr><td>${dataFormatada} às ${horaFormatada}</td><td>${km} km</td></tr>`;
      }).join('');


      Swal.fire({
        title: 'Histórico de Corridas',
        html: `
          <table style="width:100%;text-align:left;border-collapse:collapse;">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Distância</th>
              </tr>
            </thead>
            <tbody>${lista}</tbody>
          </table>
        `,
        width: '400px',
        padding: '2em',
        confirmButtonText: 'Fechar',
        confirmButtonColor: '#ffb700',
        customClass: {
          popup: 'swal2-border-radius'
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
