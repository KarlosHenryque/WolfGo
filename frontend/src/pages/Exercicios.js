import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import '../assets/css/Exercicios.css';
import { FaSearch } from 'react-icons/fa';

const bodyPartsList = [
  { name: "neck" },
  { name: "lower arms" },
  { name: "shoulders" },
  { name: "cardio" },
  { name: "upper arms" },
  { name: "chest" },
  { name: "lower legs" },
  { name: "back" },
  { name: "upper legs" },
  { name: "waist" }
];

function Exercicios() {
  const [exercises, setExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/exercicios')
      .then(res => res.json())
      .then(data => setExercises(data))
      .catch(err => console.error('Erro ao buscar exercícios:', err));
  }, []);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBodyPart = selectedBodyPart === '' || 
      exercise.bodyParts.some(part => part.toLowerCase() === selectedBodyPart.toLowerCase());
    return matchesSearch && matchesBodyPart;
  });

  return (
    <Layout>
      <div className="container-exercicios">
        <h1 className='exercicio-titulo'>Exercícios</h1>

        <div className='input-buscar-treino'>
          <input
            placeholder='Buscar exercício'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className='exercicio-lupa'>
            <FaSearch />
          </button>
        </div>

        <div className='btn-selecionar-exercicios'>
          <button 
            className={selectedBodyPart === '' ? 'active' : ''}
            onClick={() => setSelectedBodyPart('')}
          >
            Todos
          </button>
          {bodyPartsList.map(part => (
            <button
              key={part.name}
              className={selectedBodyPart === part.name ? 'active' : ''}
              onClick={() => setSelectedBodyPart(part.name)}
            >
              {part.name}
            </button>
          ))}
        </div>

        <div className='cards-container'>
          {filteredExercises.length > 0 ? (
            filteredExercises.map(exercise => (
              <div className='card-exercicio' key={exercise.exerciseId}>
                <img src={exercise.gifUrl} alt={exercise.name} width="150" />
                <h3>{exercise.name}</h3>
                <p><strong>Equipamento:</strong> {exercise.equipments.join(', ')}</p>
                <p><strong>Alvo:</strong> {exercise.targetMuscles.join(', ')}</p>
                <p><strong>Parte do corpo:</strong> {exercise.bodyParts.join(', ')}</p>
              </div>
            ))
          ) : (
            <p>Nenhum exercício encontrado.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Exercicios;
