import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/Login.css';

import img_corredor from '../assets/img/Corredor_login.png';
import { FaEnvelope, FaLock } from 'react-icons/fa'; // usando react-icons

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const resposta = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.messagem || 'Erro no Login');
        return;
      }

      localStorage.setItem('usuario', JSON.stringify(dados.usuario));
      navigate('/treino');
    } catch (error) {
      setErro('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="container-login">
      <div className="login-left">
        <img src={img_corredor} alt="Homem correndo" />
      </div>

      <div className="login-right">
        <div className="login-header">
          <h2 className="logo">WolfGO</h2>
          <span className="lang-switch">🇧🇷 BR</span>
        </div>

        <h1 className="titulo">Olá Atleta</h1>
        <h3 className="sub-titulo">Sejá bem vindo ao WolfGO</h3>

        <form onSubmit={handleLogin} className="form-login">
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

          <div className="form-options">
            <label>
              <input type="checkbox" /> Lembre-me
            </label>
            <a href="#" className="link-senha">Esqueceu a senha?</a>
          </div>

          {erro && <p className="erro-msg">{erro}</p>}

          <button type="button" className="btn btn-secondary">Cadastre-se</button>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
