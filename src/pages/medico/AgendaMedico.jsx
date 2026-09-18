import { useEffect, useMemo, useState } from "react";
import "../../styles/dashboard.css";

function AgendaMedico() {
  const [turnos, setTurnos] = useState([]);

  // TEMPORAL:
  // Hasta tener login, simulamos al médico con ID 2.
  const ID_MEDICO_ACTUAL = 2;

  // =========================
  // FECHA SELECCIONADA
  // =========================
  const hoy = new Date().toLocaleDateString("en-CA");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy);

  // =========================
  // CARGAR TURNOS
  // =========================
  useEffect(() => {
    fetch("http://127.0.0.1:8000/turnos")
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("Error al obtener los turnos");
        }

        return respuesta.json();
      })
      .then((datos) => {
        setTurnos(datos);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // =========================
  // NOMBRE DEL MÉDICO
  // =========================
  const nombreMedico =
    turnos.find(
      (turno) => Number(turno.id_medico) === ID_MEDICO_ACTUAL
    )?.medico || "Médico";

  // =========================
  // TURNOS DEL MÉDICO
  // =========================
  const turnosFiltrados = useMemo(() => {
    return turnos
      .filter(
        (turno) =>
          Number(turno.id_medico) === ID_MEDICO_ACTUAL &&
          turno.fecha === fechaSeleccionada
      )
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [turnos, fechaSeleccionada]);

  // =========================
  // CLASE PARA ESTADOS
  // =========================
  const obtenerClaseEstado = (estado) => {
    if (!estado) return "";

    return estado.toLowerCase().replaceAll(" ", "-");
  };

  return (
    <section className="dashboard">
      {/* ENCABEZADO */}
      <div className="dashboard-header">
        <div>
          <h1>Mi agenda</h1>

          <p className="dashboard-subtitulo">
            Turnos asignados a {nombreMedico}.
          </p>
        </div>
      </div>

      {/* SELECCIONAR FECHA */}
      <article className="dashboard-panel">
        <div className="dashboard-panel-header">
          <div>
            <h2>Consultar agenda</h2>
            <p>Seleccioná una fecha para ver tus turnos.</p>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>
            <strong>Fecha: </strong>

            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) =>
                setFechaSeleccionada(e.target.value)
              }
            />
          </label>
        </div>

        {/* TURNOS */}
        {turnosFiltrados.length === 0 ? (
          <div className="dashboard-vacio">
            No tenés turnos asignados para esta fecha.
          </div>
        ) : (
          <div className="dashboard-turnos">
            {turnosFiltrados.map((turno) => (
              <div
                className="dashboard-turno"
                key={turno.id_turno}
              >
                <div className="dashboard-turno-hora">
                  {turno.hora}
                </div>

                <div className="dashboard-turno-info">
                  <strong>{turno.paciente}</strong>

                  <span>
                    {turno.motivo_consulta ||
                      "Sin motivo registrado"}
                  </span>

                  <span>
                    {turno.tipo_turno || "Turno programado"}
                  </span>
                </div>

                <span
                  className={`dashboard-estado ${obtenerClaseEstado(
                    turno.estado_recepcion
                  )}`}
                >
                  {turno.estado_recepcion || turno.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default AgendaMedico;