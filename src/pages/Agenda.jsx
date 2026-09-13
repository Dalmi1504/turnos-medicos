import { useEffect, useState } from "react";
import "../styles/agenda.css";

function Agenda() {
  const [fechaSeleccionada, setFechaSeleccionada] =
    useState("");

  const [medicoSeleccionado, setMedicoSeleccionado] =
    useState("Todos");

  const [turnos, setTurnos] = useState([]);

  // =========================================================
  // CARGAR TURNOS DESDE FASTAPI
  // =========================================================

  const cargarTurnos = async () => {
    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/turnos"
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron obtener los turnos."
        );
      }

      const datos = await respuesta.json();

      setTurnos(datos);
    } catch (error) {
      console.error(
        "Error al obtener los turnos:",
        error
      );
    }
  };

  useEffect(() => {
    cargarTurnos();
  }, []);

  // =========================================================
  // MÉDICOS DISPONIBLES
  // =========================================================

  const medicos = [
    ...new Set(
      turnos.map((turno) => turno.medico)
    ),
  ];

  // =========================================================
  // FILTRAR TURNOS
  // =========================================================

  const turnosDelDia = turnos
    .filter((turno) => {
      const coincideFecha =
        !fechaSeleccionada ||
        turno.fecha === fechaSeleccionada;

      const coincideMedico =
        medicoSeleccionado === "Todos" ||
        turno.medico === medicoSeleccionado;

      return coincideFecha && coincideMedico;
    })
    .sort((a, b) =>
      String(a.hora).localeCompare(
        String(b.hora)
      )
    );

  // Médicos que tienen turnos según los filtros
  const medicosConTurnos = [
    ...new Set(
      turnosDelDia.map(
        (turno) => turno.medico
      )
    ),
  ];

  // =========================================================
  // CLASE PARA LOS ESTADOS
  // =========================================================

  const obtenerClaseEstado = (estado) => {
    const estadoNormalizado = String(
      estado || ""
    )
      .toLowerCase()
      .replace(/\s+/g, "-");

    return `agenda-estado agenda-estado-${estadoNormalizado}`;
  };

  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Todas";
    }

    const [anio, mes, dia] =
      fecha.split("-");

    return `${dia}/${mes}/${anio}`;
  };

  // =========================================================
  // HTML
  // =========================================================

  return (
    <section className="agenda-page">
      <div className="agenda-header">
        <div>
          <h1>Agenda</h1>

          <p>
            Consulta de turnos programados por
            fecha y médico.
          </p>
        </div>
      </div>

      <div className="agenda-filtros">
        <div className="agenda-filtro">
          <label htmlFor="fechaAgenda">
            Fecha
          </label>

          <input
            id="fechaAgenda"
            type="date"
            value={fechaSeleccionada}
            onChange={(evento) =>
              setFechaSeleccionada(
                evento.target.value
              )
            }
          />
        </div>

        <div className="agenda-filtro">
          <label htmlFor="medicoAgenda">
            Médico
          </label>

          <select
            id="medicoAgenda"
            value={medicoSeleccionado}
            onChange={(evento) =>
              setMedicoSeleccionado(
                evento.target.value
              )
            }
          >
            <option value="Todos">
              Todos los médicos
            </option>

            {medicos.map((medico) => (
              <option
                key={medico}
                value={medico}
              >
                {medico}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="agenda-fecha-actual">
        <span>Agenda del día</span>

        <strong>
          {formatearFecha(
            fechaSeleccionada
          )}
        </strong>

        <small>
          {turnosDelDia.length}{" "}
          {turnosDelDia.length === 1
            ? "turno"
            : "turnos"}
        </small>
      </div>

      {medicosConTurnos.length > 0 ? (
        <div className="agenda-medicos">
          {medicosConTurnos.map(
            (medico) => {
              const turnosMedico =
                turnosDelDia.filter(
                  (turno) =>
                    turno.medico === medico
                );

              return (
                <div
                  className="agenda-medico-card"
                  key={medico}
                >
                  <div className="agenda-medico-header">
                    <div>
                      <h2>{medico}</h2>

                      <span>
                        {turnosMedico.length}{" "}
                        {turnosMedico.length ===
                        1
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
                          <th>
                            Tipo de turno
                          </th>
                          <th>Estado</th>
                        </tr>
                      </thead>

                      <tbody>
                        {turnosMedico.map(
                          (turno) => (
                            <tr
                              key={
                                turno.id_turno
                              }
                            >
                              <td>
                                <strong className="agenda-hora">
                                  {
                                    turno.hora
                                  }
                                </strong>
                              </td>

                              <td>
                                {
                                  turno.paciente
                                }
                              </td>

                              <td>
                                {
                                  turno.motivo_consulta
                                }
                              </td>

                              <td>
                                <span
                                  className={obtenerClaseEstado(
                                    turno.estado
                                  )}
                                >
                                  {
                                    turno.estado
                                  }
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }
          )}
        </div>
      ) : (
        <div className="agenda-vacia">
          <div className="agenda-vacia-icono">
            📅
          </div>

          <h2>
            No hay turnos programados
          </h2>

          <p>
            No se encontraron turnos para
            la fecha y el médico
            seleccionados.
          </p>
        </div>
      )}
    </section>
  );
}

export default Agenda;