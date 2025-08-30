import React, { useState } from "react";
import '../assets/css/Layout.css';
import logo from '../assets/img/Logo.png';

import { FaHome, FaBars, FaUser } from "react-icons/fa";
import { MdFitnessCenter } from "react-icons/md";
import { TbRun } from "react-icons/tb";
import { LuSalad } from "react-icons/lu";
import { IoMdExit } from "react-icons/io";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
          <span><FaUser /></span>
        </div>
      </nav>

      <div className="main-content">
        <aside className={`sidebar ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
          <ul className="sidebar-menu">
            <li><a href="#"><FaHome /><span className="link-text">Home</span></a></li>
            <li><a href="/treino"><MdFitnessCenter /><span className="link-text">Treino</span></a></li>
            <li><a href="#"><TbRun /><span className="link-text">Corrida</span></a></li>
            <li><a href="#"><LuSalad /><span className="link-text">Nutrição</span></a></li>
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
