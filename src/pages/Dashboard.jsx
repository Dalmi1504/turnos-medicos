import { useEffect, useMemo, useState } from "react";
import "../styles/dashboard.css";

function Dashboard() {
  const [turnos, setTurnos] = useState([]);

  const [tareas, setTareas] = useState(() => {
    const guardadas = localStorage.getItem("tareas-dashboard");
    return guardadas ? JSON.parse(guardadas) : [];
  });

  const [nuevaTarea, setNuevaTarea] = useState("");

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
  // GUARDAR TAREAS
  // =========================
  useEffect(() => {
    localStorage.setItem("tareas-dashboard", JSON.stringify(tareas));
  }, [tareas]);

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
  // TURNOS DE HOY
  // =========================
  const turnosHoy = useMemo(() => {
    return turnos
      .filter((turno) => turno.fecha === fechaHoyFormato)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [turnos, fechaHoyFormato]);

  // =========================
  // PRÓXIMOS TURNOS
  // =========================
  const proximosTurnos = turnosHoy.filter(
    (turno) =>
      turno.estado_recepcion !== "Finalizado" &&
      turno.estado_recepcion !== "Ausente" &&
      turno.estado !== "Cancelado"
  );

  // =========================
  // RESUMEN DEL DÍA
  // =========================
  const cantidadEnEspera = turnosHoy.filter(
    (turno) => turno.estado_recepcion === "En espera"
  ).length;

  const cantidadAtendidos = turnosHoy.filter(
    (turno) =>
      turno.estado_recepcion === "Finalizado" ||
      turno.estado === "Atendido"
  ).length;

  const cantidadPendientes = turnosHoy.filter(
    (turno) =>
      turno.estado_recepcion === "Pendiente" &&
      turno.estado !== "Cancelado"
  ).length;

  // =========================
  // TAREAS
  // =========================
  const agregarTarea = (e) => {
    e.preventDefault();

    const texto = nuevaTarea.trim();

    if (!texto) {
      return;
    }

    const tarea = {
      id: Date.now(),
      texto,
      completada: false,
    };

    setTareas((tareasAnteriores) => [...tareasAnteriores, tarea]);
    setNuevaTarea("");
  };

  const cambiarEstadoTarea = (id) => {
    setTareas((tareasAnteriores) =>
      tareasAnteriores.map((tarea) =>
        tarea.id === id
          ? { ...tarea, completada: !tarea.completada }
          : tarea
      )
    );
  };

  const eliminarTarea = (id) => {
    setTareas((tareasAnteriores) =>
      tareasAnteriores.filter((tarea) => tarea.id !== id)
    );
  };

  // =========================
  // CLASE PARA LOS ESTADOS
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
          <h1>¡{saludo}, Dalma!</h1>

          <p className="dashboard-subtitulo">
            Este es el resumen de tu jornada.
          </p>

          <p className="dashboard-fecha">{fechaVisible}</p>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN */}
      <div className="dashboard-resumen">
        <article className="dashboard-card">
          <span>Turnos de hoy</span>
          <strong>{turnosHoy.length}</strong>
        </article>

        <article className="dashboard-card">
          <span>En espera</span>
          <strong>{cantidadEnEspera}</strong>
        </article>

        <article className="dashboard-card">
          <span>Atendidos</span>
          <strong>{cantidadAtendidos}</strong>
        </article>

        <article className="dashboard-card">
          <span>Pendientes</span>
          <strong>{cantidadPendientes}</strong>
        </article>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="dashboard-contenido">
        {/* PRÓXIMOS TURNOS */}
        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Próximos turnos</h2>
              <p>Agenda del día</p>
            </div>
          </div>

          {proximosTurnos.length === 0 ? (
            <div className="dashboard-vacio">
              ✓ No quedan turnos pendientes para hoy.
            </div>
          ) : (
            <div className="dashboard-turnos">
              {proximosTurnos.slice(0, 6).map((turno) => (
                <div
                  className="dashboard-turno"
                  key={turno.id_turno}
                >
                  <div className="dashboard-turno-hora">
                    {turno.hora}
                  </div>

                  <div className="dashboard-turno-info">
                    <strong>{turno.paciente}</strong>
                    <span>{turno.medico}</span>
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

        {/* TAREAS */}
        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Mis tareas</h2>
              <p>Tareas pendientes de la jornada</p>
            </div>
          </div>

          <form
            className="dashboard-tarea-form"
            onSubmit={agregarTarea}
          >
            <input
              type="text"
              placeholder="Escribir una nueva tarea..."
              value={nuevaTarea}
              onChange={(e) => setNuevaTarea(e.target.value)}
            />

            <button type="submit">
              Agregar
            </button>
          </form>

          <div className="dashboard-tareas">
            {tareas.length === 0 ? (
              <div className="dashboard-vacio">
                No tenés tareas pendientes.
              </div>
            ) : (
              tareas.map((tarea) => (
                <div
                  className={`dashboard-tarea ${
                    tarea.completada ? "completada" : ""
                  }`}
                  key={tarea.id}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={tarea.completada}
                      onChange={() =>
                        cambiarEstadoTarea(tarea.id)
                      }
                    />

                    <span>{tarea.texto}</span>
                  </label>

                  <button
                    type="button"
                    className="dashboard-eliminar"
                    onClick={() =>
                      eliminarTarea(tarea.id)
                    }
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;