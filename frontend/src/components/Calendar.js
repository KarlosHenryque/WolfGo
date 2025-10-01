import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBr from "@fullcalendar/core/locales/pt-br";
import Swal from "sweetalert2";
import { ModalAgendarEvento } from "../components/ModalAgendarEvento";
import "../assets/css/Calendar.css";

function Calendar() {
  const [eventos, setEventos] = useState([]);
  const usuarioId = localStorage.getItem("usuarioId");
  const calendarRef = useRef(null);

  const fetchEventos = () => {
    if (!usuarioId) return;
    fetch(`http://localhost:5000/api/calendar/eventoCadastrado/${usuarioId}`)
      .then((res) => res.json())
      .then((data) => setEventos(data))
      .catch((err) =>
        console.error("Erro ao buscar eventos:", err)
      );
  };

  useEffect(() => {
    fetchEventos();
  }, [usuarioId]);

  const handleDateClick = (arg) => {
    const dataSelecionada = arg.dateStr;

    Swal.fire({
      title: "Cadastrar novo evento",
      width: 400,
      html: ModalAgendarEvento(dataSelecionada),
      confirmButtonText: "Salvar",
      confirmButtonColor: "#00a323ff",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#ff0000ff",
      showCancelButton: true,
      reverseButtons: true,
      showCloseButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const title = document.getElementById("event-title").value;
        const desc = document.getElementById("event-desc").value;
        const time = document.getElementById("event-time").value;
        const date = document.getElementById("event-date").value;

        if (!title || !time || !date) {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title: "Por favor, preencha o título e o horário",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
          return Promise.reject("Campos obrigatórios não preenchidos");
        }

        return { title, desc, time, date };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const evento = {
          id_usuario: parseInt(usuarioId, 10),
          titulo: result.value.title,
          descricao: result.value.desc,
          horario: result.value.time,
          data_evento: result.value.date,
        };

        fetch("http://localhost:5000/api/calendar/cadastrarEvento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(evento),
        })
          .then(async (res) => {
            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || "Erro ao salvar evento");
            }
            return res.json();
          })
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Evento salvo com sucesso!",
              timer: 2000,
              showConfirmButton: true,
              confirmButtonText: "OK",
              confirmButtonColor: "#00a323ff",
            });

            fetchEventos();
          })
          .catch((err) => {
            Swal.fire({
              icon: "error",
              title: "Erro",
              text: err.message,
            });
          });
      }
    });
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div
        style={{
          backgroundColor: "#3788d8",
          color: "white",
          borderRadius: "4px",
          padding: "2px 4px",
          fontSize: "1rem",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          cursor: "pointer",
        }}
      >
        <strong>{eventInfo.event.title}</strong>
        <br />
        <small>{eventInfo.event.extendedProps.description}</small>
      </div>
    );
  };

  return (
    <div>
      <input
        type="date"
        id="data-filtro"
        style={{ position: "absolute", left: "-9999px" }}
        onChange={(e) => {
          const selectedDate = e.target.value;
          if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.gotoDate(selectedDate);
          }
        }}
      />

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        weekends={true}
        locale={ptBr}
        height="auto"
        dateClick={handleDateClick}
        events={eventos}
        eventContent={renderEventContent}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        eventClick={(info) => {
          const evento = info.event;
          const titulo = evento.title;
          const descricao = evento.extendedProps.description || "";
          const dataISO = evento.startStr.slice(0, 10);
          const horarioISO = evento.startStr.slice(11, 16);

          Swal.fire({
            title: "Editar Evento",
            width: 400,
            html: `
              <div class="containerModalAgendarEvento">
                <input id="event-title" class="swal2-input" placeholder="Título" value="${titulo}" />
                <input id="event-desc" class="swal2-input" placeholder="Descrição" value="${descricao}" />
                <input id="event-date" type="date" class="swal2-input" value="${dataISO}" />
                <input id="event-time" type="time" class="swal2-input" value="${horarioISO}" />
              </div>
            `,
            showCancelButton: true,
            reverseButtons: true,
            showCloseButton: true,
            showDenyButton: true,
            confirmButtonText: "Salvar",
            confirmButtonColor: "#00a323ff",
            cancelButtonText: "Cancelar",
            cancelButtonColor: "#0067A3",
            denyButtonText: "Excluir",
            denyButtonColor: "#ff0000ff",
            focusConfirm: false,
            preConfirm: () => {
              const newTitle = document.getElementById("event-title").value;
              const newDesc = document.getElementById("event-desc").value;
              const newDate = document.getElementById("event-date").value;
              const newTime = document.getElementById("event-time").value;

              if (!newTitle || !newDate || !newTime) {
                Swal.showValidationMessage(
                  "Título, data e hora são obrigatórios"
                );
                return false;
              }

              return { newTitle, newDesc, newDate, newTime };
            },
          }).then((result) => {
            if (result.isConfirmed) {
              fetch(
                `http://localhost:5000/api/calendar/editarEvento/${evento.id}`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    titulo: result.value.newTitle,
                    descricao: result.value.newDesc,
                    data_evento: result.value.newDate,
                    horario: result.value.newTime,
                  }),
                }
              )
                .then(async (res) => {
                  if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(
                      errorData.error || "Erro ao atualizar evento"
                    );
                  }
                  return res.json();
                })
                .then(() => {
                  Swal.fire({
                    icon: "success",
                    title: "Evento atualizado!",
                    timer: 2000,
                    showConfirmButton: false,
                  });
                  fetchEventos();
                })
                .catch((err) => {
                  Swal.fire({
                    icon: "error",
                    title: "Erro",
                    text: err.message,
                  });
                });
            } else if (result.isDenied) {
              Swal.fire({
                title: "Tem certeza?",
                text: "Você deseja excluir este evento?",
                icon: "warning",
                reverseButtons: true,
                showCancelButton: true,
                confirmButtonColor: "#00a323ff",
                cancelButtonColor: "#ff0000ff",
                confirmButtonText: "Sim, excluir",
                cancelButtonText: "Cancelar",
              }).then((confirmacao) => {
                if (confirmacao.isConfirmed) {
                  fetch(
                    `http://localhost:5000/api/calendar/desativarEvento/${evento.id}`,
                    {
                      method: "PUT",
                    }
                  )
                    .then(async (res) => {
                      if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(
                          errorData.error || "Erro ao desativar evento"
                        );
                      }
                      return res.json();
                    })
                    .then(() => {
                      Swal.fire({
                        icon: "success",
                        title: "Evento excluído com sucesso!",
                        timer: 2000,
                        showConfirmButton: false,
                      });
                      fetchEventos();
                    })
                    .catch((err) => {
                      Swal.fire({
                        icon: "error",
                        title: "Erro",
                        text: err.message,
                      });
                    });
                }
              });
            }
          });
        }}
      />
    </div>
  );
}

export default Calendar;
