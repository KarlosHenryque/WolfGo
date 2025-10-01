  import React, { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import '../assets/css/Login.css';
  import Swal from 'sweetalert2';
  import img_corredor from '../assets/img/Corredor_login.png';
  import logo from '../assets/img/Logo.png';
  import bandeira_brasil from '../assets/img/bandeira_brasil.png';
  import { ModalEsqueceuSenha } from '../components/ModalEsqueceuSenha';
  import { FaEnvelope, FaLock } from 'react-icons/fa';

  function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [lembrarMe, setLembrarMe] = useState(false);
    const [erro, setErro] = useState('');

    useEffect(() => {
      const savedEmail = localStorage.getItem('loginEmail');
      const savedSenha = localStorage.getItem('loginSenha');

      if (savedEmail && savedSenha) {
        setEmail(savedEmail);
        setSenha(savedSenha);
        setLembrarMe(true);
      }
    }, []);

    const handleEsqueceuSenha = async () => {
      const { value: emailRecuperacao } = await Swal.fire({
        title: 'Recuperar senha',
        input: 'email',
        inputLabel: 'Digite seu e-mail de recuperação',
        inputPlaceholder: 'exemplo@dominio.com',
        width: 500,
        reverseButtons: true,
        confirmButtonText: 'Enviar',
        confirmButtonColor: '#0067A3',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#ff0000ff',
        inputValidator: (value) => {
          if (!value) {
            return 'Você precisa inserir um e-mail válido!';
          }
        },
      });

      if (!emailRecuperacao) {
        return;
      }

      let response;
      try {
        response = await fetch('http://localhost:5000/api/recuperarSenha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailRecuperacao }),
        });
      } catch (err) {
        console.error('Erro enviando para recuperar senha:', err);
        return; 
      }

      const dados = await response.json();
      if (!response.ok) {
        Swal.fire('Erro', dados.mensagem || 'Não foi possível enviar código', 'error');
        return;
      }

      let tentativasRestantes = 5;
      let codigoValido = null;

      while (tentativasRestantes > 0) {
        const result = await Swal.fire({
          title: 'Código de Verificação',
          input: 'text',
          width: 400,
          inputLabel: `Digite o código enviado para seu e-mail`,
          inputPlaceholder: 'Código de 6 dígitos',
          inputAttributes: { maxlength: 6, autocapitalize: 'off', autocorrect: 'off' },
          confirmButtonText: 'Validar',
          confirmButtonColor: '#0067A3',
          showCancelButton: tentativasRestantes === 1,
          cancelButtonText: 'Cancelar',
          cancelButtonColor: '#ff0000ff',
          allowOutsideClick: false,
          allowEscapeKey: false,
          inputValidator: (value) => {
            if (!value || value.length !== 6) {
              return 'Informe um código válido de 6 dígitos!';
            }
          }
        });

        if (result.dismiss === Swal.DismissReason.cancel) {
          return;
        }

        const codigoDigitado = result.value;
        if (!codigoDigitado) {
          continue;
        }

        let validarResposta;
        try {
          validarResposta = await fetch('http://localhost:5000/api/recuperarSenha/validarCodigo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailRecuperacao, codigo: codigoDigitado }),
          });
        } catch (err) {
          console.error('Erro ao chamar validarCodigo:', err);
          tentativasRestantes--;
          continue;
        }

        const validarDados = await validarResposta.json();

        if (validarResposta.ok) {
          codigoValido = codigoDigitado;
          break;
        } else {
          tentativasRestantes--;
          if (tentativasRestantes > 0) {
            await Swal.fire('Código Inválido', `Código incorreto. Tentativas restantes: ${tentativasRestantes}`, 'warning');
          } else {
            Swal.fire('Erro', 'Você excedeu o número máximo de tentativas.', 'error');
            return;
          }
        }
      }

      if (!codigoValido) {
        return;
      }

      const { value: formValues } = await Swal.fire({
        title: 'Redefinir Senha',
        html: ModalEsqueceuSenha,
        focusConfirm: false,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#ff0000ff',
        confirmButtonText: 'Redefinir',
        confirmButtonColor: '#0067A3',
        preConfirm: () => {
          const novaSenha = Swal.getPopup().querySelector('#novaSenha').value;
          const confirmaSenha = Swal.getPopup().querySelector('#confirmaSenha').value;
          if (!novaSenha || !confirmaSenha) {
            Swal.showValidationMessage('Ambos os campos são obrigatórios');
            return false;
          }
          if (novaSenha.length < 6) {
            Swal.showValidationMessage('A senha deve ter pelo menos 6 caracteres');
            return false;
          }
          if (novaSenha !== confirmaSenha) {
            Swal.showValidationMessage('As senhas não coincidem');
            return false;
          }
          return { novaSenha };
        }
      });

      if (!formValues) {
        return;
      }

      try {
        const redefinirResposta = await fetch('http://localhost:5000/api/recuperarSenha/redefinirSenha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailRecuperacao,
            codigo: codigoValido,
            novaSenha: formValues.novaSenha,
          }),
        });
        const redefinirDados = await redefinirResposta.json();
        if (!redefinirResposta.ok) {
          Swal.fire('Erro', redefinirDados.mensagem || 'Não foi possível redefinir a senha', 'error');
          return;
        }
        Swal.fire('Sucesso', 'Senha redefinida com sucesso! Agora você pode fazer login.', 'success');
      } catch (err) {
        console.error('Erro ao redefinir:', err);
      }
    };  

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
          Swal.fire({
            icon: 'error',
            title: 'Erro no login',
            text: dados.messagem || 'Email ou senha inválidos',
          });
          return;
        }

        if (lembrarMe) {
          localStorage.setItem('loginEmail', email);
          localStorage.setItem('loginSenha', senha);
        } else {
          localStorage.removeItem('loginEmail');
          localStorage.removeItem('loginSenha');
        }

        localStorage.setItem('usuarioId', dados.usuario.id);
        localStorage.setItem('usuarioNome', dados.usuario.nome);
        localStorage.setItem('usuarioEmail', dados.usuario.email);
        localStorage.setItem('usuario', JSON.stringify(dados.usuario));

        navigate('/home');
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erro no login',
          text: 'Email ou senha inválidos',
        });
      }
    };

    return (
      <div className="container-login">
        <div className="login-left">
          <img src={img_corredor} alt="Homem correndo" />
        </div>

        <div className="login-right">
          <div className="login-header">
            <h2 className="logo">
              <img className="lobo-img" src={logo} alt="Lobo" /> WolfGO
            </h2>
            <span className="lang-switch">
              <img src={bandeira_brasil} alt="Bandeira do Brasil" /> BR
            </span>
          </div>

          <div className="boa-vinda">
            <h1 className="titulo">Olá, Atleta</h1>
            <h3 className="sub-titulo">Seja bem-vindo ao WolfGO</h3>
          </div>

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

            <div className="opcao">
              <div className="form-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={lembrarMe}
                    onChange={(e) => setLembrarMe(e.target.checked)}
                  />
                  Lembre-me
                </label>
                <a className="link-senha" onClick={handleEsqueceuSenha}>Esqueceu a senha?</a>
              </div>

              <div className="btn-acesso">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/register')}
                >
                  Cadastre-se
                </button>
                <button type="submit" className="btn btn-primary">
                  Login
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  export default Login;
