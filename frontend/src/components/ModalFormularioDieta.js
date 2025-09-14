import "./assets/css/ModalFormularioDieta.css";

export const ModalFormularioDieta = (opcoesTreino) => `
    <input type="text" id="nomeDieta" class="input" placeholder="Nome da dieta:" />

    <div class="modal-formulario-user">
        <select id="idFormulario" class="input select-custom" required>
        <option value="" disabled selected>Selecione um treino</option>
        ${opcoesTreino}
        </select>

        <select id="nivelAtividade" class="input select-custom" required>
        <option value="" disabled selected>Selecione o seu nível de atividade</option>
        <option value="iniciante">Levemente ativo</option>
        <option value="intermediario">Ativo</option>
        <option value="avancado">Muito ativo</option>
        </select>

        <select id="preferenciasAlimentares" class="input select-custom" required>
        <option value="" disabled selected>Selecione suas preferências alimentares</option>
        <option value="vegetariano">Vegetariano</option>
        <option value="vegano">Vegano</option>
        <option value="onivoro">Onívoro</option>
        <option value="intolerancias">Intolerâncias</option>
        <option value="nenhuma">Nenhuma</option>
        </select>

        <input type="text" id="alergia" class="input" placeholder="Informe alergias (se houver)" />

        <select id="utilizaSuplemento" class="input select-custom" required>
        <option value="" disabled selected>Você utiliza suplemento?</option>
        <option value="sim">Sim</option>
        <option value="nao">Não</option>
        </select>

        <select id="usoMedicacao" class="input select-custom" required>
        <option value="" disabled selected>Você faz uso de medicação?</option>
        <option value="sim">Sim</option>
        <option value="nao">Não</option>
        </select>

        <select id="objetivo" class="input select-custom" required>
        <option value="" disabled selected>Qual seu objetivo principal?</option>
        <option value="emagrecimento">Emagrecimento</option>
        <option value="ganho-massa">Ganho de massa</option>
        <option value="manutencao">Manutenção</option>
        <option value="melhorar-saude">Melhorar saúde</option>
        <option value="outro">Outro</option>
        </select>

        <select id="frequenciaAtividade" class="input select-custom">
        <option value="" disabled selected>Frequência de atividade física (vezes/semana)</option>
        <option value="0">0</option>
        <option value="1-2">1 a 2 vezes</option>
        <option value="3-4">3 a 4 vezes</option>
        <option value="5-6">5 a 6 vezes</option>
        <option value="7+">7 ou mais</option>
        </select>

        <select id="qualidadeSono" class="input select-custom" required>
        <option value="" disabled selected>Você considera que dorme bem?</option>
        <option value="sim">Sim</option>
        <option value="nao">Não</option>
        </select>
    </div>
`;
