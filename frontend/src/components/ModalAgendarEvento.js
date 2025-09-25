import "./assets/css/ModalAgendarEvento.css";

export const ModalAgendarEvento = (dataSelecionada) => `
  <div class="containerModalAgendarEvento">
    <input type="text" id="event-title" class="swal2-input" placeholder="Título do evento" />
    <input type="text" id="event-desc" class="swal2-input" placeholder="Descrição" />
    <div class="row-time-date">
      <input type="time" id="event-time" class="swal2-input small-input" />
      <input type="date" id="event-date" class="swal2-input small-input" value="${dataSelecionada}" />
    </div>
  </div>
`;
