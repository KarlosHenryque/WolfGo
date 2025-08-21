import React, { useState } from "react";
import '../assets/css/Formulario.css';
import Swal from "sweetalert2";


function Formulario() {
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    objetivo: '',
    experiencia: '',
    diasTreino: '',
    duracaoTreino: '',
    algumaLesao: '',
    altura: '',
    peso: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('http://localhost:5000/api/formulario/formularioUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Erro na requisição');
    }

    const data = await response.json();

    Swal.fire({
        icon: 'sucess',
        title: 'Formulário enviado com sucesso!',
    });

  } catch (error) {

    Swal.fire({
        icon: 'error',
        title: 'Erro ao enviar',
        text: 'Não foi possível enviar os dados. Tente novamente.',
    });

    console.error('Erro ao enviar dados', error);
  }
};

  return (
    <form className="formulario" onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Formulário de Avaliação</h2>

      <label>Nome:</label>
      <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome" />

      <label>Data de Nascimento:</label>
      <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} />

      <label>Objetivo:</label>
      <input type="text" name="objetivo" value={formData.objetivo} onChange={handleChange} placeholder="Emagrecer" />

      <label>Experiência:</label>
      <select name="experiencia" value={formData.experiencia} onChange={handleChange}>
        <option value="">Selecione...</option>
        <option value="iniciante">Iniciante</option>
        <option value="intermediario">Intermediário</option>
        <option value="avancado">Avançado</option>
      </select>

      <label>Dias de Treino por Semana:</label>
      <select name="diasTreino" value={formData.diasTreino} onChange={handleChange}>
        <option value="">Selecione...</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
      </select>

      <label>Duração do Treino (min):</label>
      <input
        type="number"
        name="duracaoTreino"
        value={formData.duracaoTreino}
        onChange={handleChange}
        min="0"
        placeholder="Ex: 45"
      />

      <label>Alguma Lesão?</label>
      <input
        type="text"
        name="algumaLesao"
        value={formData.algumaLesao}
        onChange={handleChange}
        placeholder="Nenhuma"
      />

      <label>Altura (m):</label>
      <input
        type="text"
        name="altura"
        value={formData.altura}
        onChange={handleChange}
        placeholder="Ex: 1.75"
      />

      <label>Peso (kg):</label>
      <input
        type="number"
        name="peso"
        value={formData.peso}
        onChange={handleChange}
        placeholder="Ex: 70"
      />

      <button type="submit" style={{ marginTop: '20px' }}>Enviar</button>
    </form>
  );
}

export default Formulario;
