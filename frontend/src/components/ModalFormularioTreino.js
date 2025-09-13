import "./assets/css/ModalFormularioTreino.css";

export const ModalFormularioTreino = () => `
  <div class="modal-formulario-treino">
    <input type="text" id="nomeTreino" class="input" placeholder="Nome do treino" />
    <input type="text" id="dataNascimento" class="input" placeholder="DD/MM/AAAA" maxlength="10" />
    <input type="text" id="objetivo" class="input" placeholder="Objetivo" />
    <select id="experiencia" class="input select-custom">
      <option value="" disabled selected>Selecione o seu nível</option>
      <option value="iniciante">Iniciante</option>
      <option value="intermediario">Intermediário</option>
      <option value="avancado">Avançado</option>
    </select>
    <select id="diasTreino" class="input select-custom">
      <option value="" disabled selected>Selecione a quantidade de dias</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
      <option value="6">6</option>
      <option value="7">7</option>
    </select>
    <select id="sexo" class="input select-custom">
      <option value="" disabled selected>Sexo</option>
      <option value="F">Feminino</option>
      <option value="M">Masculino</option>
    </select>
    <input type="text" id="duracaoTreino" class="input" placeholder="Duração (minutos)" />
    <input type="text" id="algumaLesao" class="input" placeholder="Alguma Lesão" />
    <input type="text" id="altura" class="input" placeholder="Altura (m)" />
    <input type="text" id="peso" class="input" placeholder="Peso (kg)" />
  </div>
`;
