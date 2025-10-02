import React, { useState } from "react";
import Swal from "sweetalert2"; 
import './assets/css/Layout.css';
import logo from '../assets/img/Logo.png';

import { FaHome, FaBars, FaUser } from "react-icons/fa";
import { MdFitnessCenter } from "react-icons/md";
import { TbRun } from "react-icons/tb";
import { LuSalad } from "react-icons/lu";
import { IoMdExit } from "react-icons/io";
import { GiWeightLiftingUp } from "react-icons/gi";

import { ConfigPerfilUsuario } from '../components/PerfilUsuario';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const idUser = localStorage.getItem("usuarioId");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const abrirConfigPerfil = () => {
    if (!idUser) {
      Swal.fire('Erro', 'Usuário não autenticado', 'error');
      return;
    }
    ConfigPerfilUsuario(idUser); 
    setUserMenuOpen(false);
  };

  return (
    <div className="layout-container">
      <nav className="top-navbar">
        <div className="menu-icon" onClick={toggleSidebar}>
          <FaBars />
        </div>
        <div className="logo">
          <img className="layout-lobo-img" src={logo} alt="Lobo" /> WolfGO
        </div>
        <div className="top-navbar-right">
          <span className="user-icon" onClick={toggleUserMenu}>
            <FaUser />
          </span>

          {userMenuOpen && (
            <div className="user-dropdown">
              <ul>
                <li><a onClick={abrirConfigPerfil}>Perfil</a></li>
                <li><a href="/">Sair</a></li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      <div className="main-content">
        <aside className={`sidebar ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
          <ul className="sidebar-menu">
            <li><a href="/home"><FaHome /><span className="link-text">Home</span></a></li>
            <li><a href="/exercicios"><GiWeightLiftingUp /><span className="link-text">Exercício</span></a></li>
            <li><a href="/treino"><MdFitnessCenter /><span className="link-text">Treino</span></a></li>
            <li><a href="/corrida"><TbRun /><span className="link-text">Corrida</span></a></li>
            <li><a href="nutricao"><LuSalad /><span className="link-text">Nutrição</span></a></li>
            <li><a href="/"><IoMdExit /><span className="link-text">Sair</span></a></li>
          </ul>
        </aside>

        <section className="content-area">
          {children}
        </section>
      </div>
    </div>
  );
}

export default Layout;
