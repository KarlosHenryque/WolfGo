import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '../components/Layout';
import localizadorIcon from '../assets/img/localizador.png';

const localizacaoIcon = L.icon({
  iconUrl: localizadorIcon,
  iconSize: [40, 40], 
  iconAnchor: [20, 40], 
  popupAnchor: [0, -32] 
});

function Corrida() {
  const navigate = useNavigate();
  const [posicao, setPosicao] = useState(null);
  const modalTimeout = useRef(null); 

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

    modalTimeout.current = setTimeout(() => {
      if (posicao) {
        Swal.close();
      }
    }, 3000);

    return () => {
      clearTimeout(modalTimeout.current);
      Swal.close();
    };
  }, []); 

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setPosicao(coords);
        },
        (err) => {
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
    }
  }, []);

  useEffect(() => {
    if (posicao && modalTimeout.current) {
      clearTimeout(modalTimeout.current);
      Swal.close();
    }
  }, [posicao]);

  if (!posicao) {
    return null;
  }

  return (
    <Layout>
      <MapContainer
        center={posicao}
        zoom={17}
        style={{ height: '100%', width: '100%', borderRadius: '10px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> colaboradores'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={posicao} icon={localizacaoIcon}>
          <Popup>Sua localização atual</Popup>
        </Marker>
      </MapContainer>
    </Layout>
  );
};

export default Corrida;
