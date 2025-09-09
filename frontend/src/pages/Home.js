import React, { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import "../assets/css/Home.css";

import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

import carrosel01 from '../assets/img/Carrosel01.png';
import carrosel02 from '../assets/img/Carrosel02.png';
import carrosel03 from '../assets/img/Carrosel03.png';
import carrosel04 from '../assets/img/Carrosel04.png';
import carrosel05 from '../assets/img/Carrosel05.png';
import carrosel06 from '../assets/img/Carrosel06.png';
import carrosel07 from '../assets/img/Carrosel07.png';
import carrosel08 from '../assets/img/Carrosel08.png';

const cards = [
  { img: carrosel01, title: "Musculação" },
  { img: carrosel02, title: "Alimentação" },
  { img: carrosel03, title: "Atletismo" },
  { img: carrosel04, title: "Bem estar" },
  { img: carrosel05, title: "Treino personalizado com IA" },
  { img: carrosel06, title: "Dieta personalizada com IA" },
  { img: carrosel07, title: "Mapeamento de crescimento" },
  { img: carrosel08, title: "Metas alcançadas" },
];

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

        <p className="subtitle">
          Sua jornada rumo às suas metas pessoais já começou. A cada dia, você está um passo mais perto de se tornar quem deseja ser!
        </p>

        <div className="carousel-wrapper">
          <button className="arrow left" onClick={() => scroll("left")}>
            <AiOutlineLeft />
          </button>

          <div className="cards-container-home" ref={carouselRef}>
            {cards.map((card, index) => (
              <div
                className="card"
                key={index}
                ref={index === 0 ? cardRef : null}
              >
                <img src={card.img} alt={card.title} />
                <div className="card-label">{card.title}</div>
              </div>
            ))}
          </div>

          <button className="arrow right" onClick={() => scroll("right")}>
            <AiOutlineRight />
          </button>
        </div>

        <p className="choose-text">
          Escolha sua modalidade e vá além dos seus limites!
        </p>
      </div>
    </Layout>
  );
}

export default Home;