import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../assets/css/Login.css';
import img_corredor from '../assets/img/Corredor_login.png';
import logo from '../assets/img/Logo.png';
import bandeira_brasil from '../assets/img/bandeira_brasil.png';

import { FaUser, FaEnvelope, FaLock, FaArrowCircleLeft } from 'react-icons/fa'; 

function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleBack = () => {
    navigate('/'); 
  };
  
  const handleCadastro = async (e) => {
    e.preventDefault();

    if (!nome || !email || !senha) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, preencha todos os campos.'
        });
        return;
    }

    if (senha !== confirmarSenha) {
        Swal.fire({
            icon: 'error',
            title: 'Senhas não coincidem',
            text: 'A senha e a confirmação devem ser iguais.'
        });
        return;
    }

    try {
     const resposta = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Erro no cadastro',
          text: dados.messagem || 'Não foi possível cadastrar o usuário.',
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Cadastro realizado',
        text: dados.messagem,
      });

      navigate('/'); 

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro no cadastro',
        text: 'Não foi possível cadastrar o usuário.',
      });
    }
  };

  return (
      <div className="container-register">
      <button className="btn-back" onClick={handleBack} aria-label="Voltar">
        <FaArrowCircleLeft />
      </button>

      <div className="container-login">
          <div className="login-left">
            <img src={img_corredor} alt="Homem correndo" />
          </div>

          <div className="login-right">
            <div className="login-header">
              <h2 className="logo"><img className="lobo-img" src={logo} alt="Lobo" /> WolfGO</h2>
              <span className="lang-switch"><img src={bandeira_brasil} alt="Bandeira do Brasil" /> BR</span>
            </div>

            <div className="boa-vinda">
              <h1 className="titulo">Cadastre-se</h1>
              <h3 className="sub-titulo">Crie sua conta para começar</h3>
            </div>

            <form onSubmit={handleCadastro} className="form-login">

              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                />
              </div>

              <div className='btn-acesso'>
                <button type="submit" className="btn btn-primary">Cadastrar</button>
              </div>

            </form>
          </div>
        </div>
      </div>
  );
}

export default Cadastro;
