import React, { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import "../assets/css/Home.css";

import Calendar from '../components/Calendar'

function TypeWriter({ text, typingSpeed = 150, pauseTime = 3000, className }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let timer;

    if (!isDeleting && index < text.length) {
      timer = setTimeout(() => {
        setDisplayedText(text.slice(0, index + 1));
        setIndex(index + 1);
      }, typingSpeed);
    } else if (!isDeleting && index === text.length) {
      timer = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && index > 0) {
      timer = setTimeout(() => {
        setDisplayedText(text.slice(0, index - 1));
        setIndex(index - 1);
      }, typingSpeed / 2);
    } else if (isDeleting && index === 0) {
      setIsDeleting(false);
    }

    return () => clearTimeout(timer);
  }, [text, index, isDeleting, typingSpeed, pauseTime]);

  return (
    <h1
      className={className}
      style={{
        borderRight: "3px solid var(--primary-color)",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {displayedText}
    </h1>
  );
}

function Home() {
  const [usuarioNome, setUsuarioNome] = useState(null);
  const carouselRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const nome = localStorage.getItem("usuarioNome");
    if (nome) {
      setUsuarioNome(nome);
    }
  }, []); 

  const scroll = (direction) => {
    if (carouselRef.current && cardRef.current) {
      const cardWidth = cardRef.current.offsetWidth + 20; 
      const scrollAmount = cardWidth * 4;

      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const textoCompleto = `Sejá Bem-Vindo ${usuarioNome ? usuarioNome : "Atleta"}`;

  return (
    <Layout>
      <div className="home-container">
        <TypeWriter
          className="welcome-title"
          text={textoCompleto}
          typingSpeed={150}
          pauseTime={3000}
        />

        <div className="calendar">
          < Calendar />
        </div>        
      </div>
    </Layout>
  );
}

export default Home;