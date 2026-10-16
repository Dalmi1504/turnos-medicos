
import { useEffect, useMemo, useState } from "react";
import "../../styles/dashboard.css";

function AgendaMedico() {
  const [turnos, setTurnos] = useState([]);
  const [nombreMedico, setNombreMedico] = useState("Médico");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // USUARIO QUE INICIÓ SESIÓN
  // =========================
  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem("usuario"));
  } catch {
    usuario = null;
  }

  const ID_MEDICO_ACTUAL = Number(usuario?.id_medico);

  // =========================
  // FECHA SELECCIONADA
  // =========================
  const fechaActual = new Date();

  const hoy = [
    fechaActual.getFullYear(),
    String(fechaActual.getMonth() + 1).padStart(2, "0"),
    String(fechaActual.getDate()).padStart(2, "0"),
  ].join("-");

  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy);

  // =========================
  // CARGAR TURNOS Y MÉDICOS
  // =========================
  useEffect(() => {
    if (!ID_MEDICO_ACTUAL) {
      setError("No se encontró un médico asociado a tu usuario.");
      setCargando(false);
      return;
    }

    let activo = true;

    const cargarDatos = async () => {
      setCargando(true);
      setError("");

      try {
        const [respuestaTurnos, respuestaMedicos] =
          await Promise.all([
            fetch("http://127.0.0.1:8000/turnos"),
            fetch("http://127.0.0.1:8000/medicos"),
          ]);

        if (!respuestaTurnos.ok || !respuestaMedicos.ok) {
          throw new Error("No se pudieron cargar los datos.");
        }

        const datosTurnos = await respuestaTurnos.json();
        const datosMedicos = await respuestaMedicos.json();

        if (!activo) return;

        setTurnos(datosTurnos);

        const medicoActual = datosMedicos.find(
          (medico) =>
            Number(medico.id_medico) === ID_MEDICO_ACTUAL
        );

        if (medicoActual) {
          setNombreMedico(
            `${medicoActual.nombre} ${medicoActual.apellido}`
          );
        }
      } catch (err) {
        if (activo) {
          setError(err.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, [ID_MEDICO_ACTUAL]);

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
  }, [turnos, fechaSeleccionada, ID_MEDICO_ACTUAL]);

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

        {/* MENSAJES */}
        {cargando ? (
          <div className="dashboard-vacio">
            Cargando agenda...
          </div>
        ) : error ? (
          <div className="dashboard-vacio">
            {error}
          </div>
        ) : turnosFiltrados.length === 0 ? (
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
