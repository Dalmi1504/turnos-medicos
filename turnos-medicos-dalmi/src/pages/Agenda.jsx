import { useState } from "react";
import "../styles/agenda.css";

function Agenda() {
  const [fechaSeleccionada, setFechaSeleccionada] =
    useState("2026-08-12");

  const [medicoSeleccionado, setMedicoSeleccionado] =
    useState("Todos");

  const turnos = [
    {
      id: 1,
      paciente: "María González",
      medico: "Dr. Juan Pérez",
      tipoTurno: "Primera consulta",
      fecha: "2026-08-12",
      hora: "09:00",
      consultorio: "Consultorio 1",
      estado: "Asignado",
    },
    {
      id: 2,
      paciente: "Carlos Pérez",
      medico: "Dra. Laura Gómez",
      tipoTurno: "Postoperatorio",
      fecha: "2026-08-12",
      hora: "10:30",
      consultorio: "Consultorio 2",
      estado: "Asignado",
    },
    {
      id: 3,
      paciente: "Ana Martínez",
      medico: "Dr. Juan Pérez",
      tipoTurno: "Consulta",
      fecha: "2026-08-12",
      hora: "11:00",
      consultorio: "Consultorio 1",
      estado: "Atendido",
    },
    {
      id: 4,
      paciente: "Pedro López",
      medico: "Dra. Laura Gómez",
      tipoTurno: "Preoperatorio",
      fecha: "2026-08-12",
      hora: "12:00",
      consultorio: "Consultorio 2",
      estado: "Cancelado",
    },
    {
      id: 5,
      paciente: "Lucía Fernández",
      medico: "Dr. Juan Pérez",
      tipoTurno: "Consulta",
      fecha: "2026-08-13",
      hora: "11:00",
      consultorio: "Consultorio 1",
      estado: "Asignado",
    },
  ];

  const medicos = [...new Set(turnos.map((turno) => turno.medico))];

  const turnosDelDia = turnos
    .filter((turno) => {
      const coincideFecha =
        turno.fecha === fechaSeleccionada;

      const coincideMedico =
        medicoSeleccionado === "Todos" ||
        turno.medico === medicoSeleccionado;

      return coincideFecha && coincideMedico;
    })
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const medicosConTurnos = [
    ...new Set(turnosDelDia.map((turno) => turno.medico)),
  ];

  const obtenerClaseEstado = (estado) => {
    return `agenda-estado agenda-estado-${estado.toLowerCase()}`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "";
    }

    const [anio, mes, dia] = fecha.split("-");

    return `${dia}/${mes}/${anio}`;
  };

  return (
    <section className="agenda-page">
      <div className="agenda-header">
        <div>
          <h1>Agenda</h1>
          <p>
            Consulta de turnos programados por fecha y médico.
          </p>
        </div>
      </div>

      <div className="agenda-filtros">
        <div className="agenda-filtro">
          <label htmlFor="fechaAgenda">Fecha</label>

          <input
            id="fechaAgenda"
            type="date"
            value={fechaSeleccionada}
            onChange={(evento) =>
              setFechaSeleccionada(evento.target.value)
            }
          />
        </div>

        <div className="agenda-filtro">
          <label htmlFor="medicoAgenda">Médico</label>

          <select
            id="medicoAgenda"
            value={medicoSeleccionado}
            onChange={(evento) =>
              setMedicoSeleccionado(evento.target.value)
            }
          >
            <option value="Todos">Todos los médicos</option>

            {medicos.map((medico) => (
              <option key={medico} value={medico}>
                {medico}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="agenda-fecha-actual">
        <span>Agenda del día</span>
        <strong>{formatearFecha(fechaSeleccionada)}</strong>

        <small>
          {turnosDelDia.length}{" "}
          {turnosDelDia.length === 1 ? "turno" : "turnos"}
        </small>
      </div>

      {medicosConTurnos.length > 0 ? (
        <div className="agenda-medicos">
          {medicosConTurnos.map((medico) => {
            const turnosMedico = turnosDelDia.filter(
              (turno) => turno.medico === medico
            );

            return (
              <div className="agenda-medico-card" key={medico}>
                <div className="agenda-medico-header">
                  <div>
                    <h2>{medico}</h2>

                    <span>
                      {turnosMedico.length}{" "}
                      {turnosMedico.length === 1
                        ? "turno programado"
                        : "turnos programados"}
                    </span>
                  </div>
                </div>

                <div className="agenda-table-container">
                  <table className="agenda-table">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Paciente</th>
                        <th>Tipo de turno</th>
                        <th>Consultorio</th>
                        <th>Estado</th>
                      </tr>
                    </thead>

                    <tbody>
                      {turnosMedico.map((turno) => (
                        <tr key={turno.id}>
                          <td>
                            <strong className="agenda-hora">
                              {turno.hora}
                            </strong>
                          </td>

                          <td>{turno.paciente}</td>

                          <td>{turno.tipoTurno}</td>

                          <td>{turno.consultorio}</td>

                          <td>
                            <span
                              className={obtenerClaseEstado(
                                turno.estado
                              )}
                            >
                              {turno.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="agenda-vacia">
          <div className="agenda-vacia-icono">📅</div>

          <h2>No hay turnos programados</h2>

          <p>
            No se encontraron turnos para la fecha y el médico
            seleccionados.
          </p>
        </div>
      )}
    </section>
  );
}

export default Agenda;