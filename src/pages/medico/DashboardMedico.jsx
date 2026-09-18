import { useEffect, useMemo, useState } from "react";
import "../../styles/dashboard.css";

function DashboardMedico() {
  const [turnos, setTurnos] = useState([]);

  // TEMPORAL:
  // Hasta que hagamos login, simulamos que inició sesión el médico con ID 2.
  const ID_MEDICO_ACTUAL = 2;

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
  // FECHA Y SALUDO
  // =========================
  const fechaHoy = new Date();

  const horaActual = fechaHoy.getHours();

  let saludo = "Buen día";

  if (horaActual >= 12 && horaActual < 20) {
    saludo = "Buenas tardes";
  } else if (horaActual >= 20 || horaActual < 6) {
    saludo = "Buenas noches";
  }

  const fechaHoyFormato = fechaHoy.toLocaleDateString("en-CA");

  const fechaVisible = fechaHoy.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // =========================
  // TURNOS DEL MÉDICO DE HOY
  // =========================
  const turnosHoyMedico = useMemo(() => {
    return turnos
      .filter(
        (turno) =>
          turno.fecha === fechaHoyFormato &&
          Number(turno.id_medico) === ID_MEDICO_ACTUAL
      )
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [turnos, fechaHoyFormato]);

  // =========================
  // NOMBRE DEL MÉDICO
  // =========================
  const nombreMedico =
    turnos.find(
      (turno) => Number(turno.id_medico) === ID_MEDICO_ACTUAL
    )?.medico || "Médico";

  // =========================
  // RESUMEN
  // =========================
  const cantidadPendientes = turnosHoyMedico.filter(
    (turno) =>
      turno.estado_recepcion !== "Finalizado" &&
      turno.estado_recepcion !== "Ausente" &&
      turno.estado !== "Cancelado"
  ).length;

  const cantidadEnEspera = turnosHoyMedico.filter(
    (turno) => turno.estado_recepcion === "En espera"
  ).length;

  const cantidadFinalizados = turnosHoyMedico.filter(
    (turno) => turno.estado_recepcion === "Finalizado"
  ).length;

  // =========================
  // CLASE PARA ESTADOS
  // =========================
  const obtenerClaseEstado = (estado) => {
    if (!estado) return "";

    return estado.toLowerCase().replaceAll(" ", "-");
  };

  return (
    <section className="dashboard">
      {/* BIENVENIDA */}
      <div className="dashboard-header">
        <div>
          <h1>
            ¡{saludo}, {nombreMedico}!
          </h1>

          <p className="dashboard-subtitulo">
            Este es el resumen de tu agenda médica.
          </p>

          <p className="dashboard-fecha">{fechaVisible}</p>
        </div>
      </div>

      {/* TARJETAS */}
      <div className="dashboard-resumen">
        <article className="dashboard-card">
          <span>Turnos de hoy</span>
          <strong>{turnosHoyMedico.length}</strong>
        </article>

        <article className="dashboard-card">
          <span>Pendientes</span>
          <strong>{cantidadPendientes}</strong>
        </article>

        <article className="dashboard-card">
          <span>En espera</span>
          <strong>{cantidadEnEspera}</strong>
        </article>

        <article className="dashboard-card">
          <span>Finalizados</span>
          <strong>{cantidadFinalizados}</strong>
        </article>
      </div>

      {/* AGENDA DEL DÍA */}
      <div className="dashboard-contenido">
        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Mi agenda de hoy</h2>
              <p>Turnos asignados para la jornada</p>
            </div>
          </div>

          {turnosHoyMedico.length === 0 ? (
            <div className="dashboard-vacio">
              No tenés turnos asignados para hoy.
            </div>
          ) : (
            <div className="dashboard-turnos">
              {turnosHoyMedico.map((turno) => (
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
                      {turno.motivo_consulta || "Sin motivo registrado"}
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
      </div>
    </section>
  );
}

export default DashboardMedico;