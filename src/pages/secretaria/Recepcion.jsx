
import { useEffect, useState } from "react";
import "../../styles/recepcion.css";

function Recepcion() {
  const [busqueda, setBusqueda] = useState("");
  const [turnos, setTurnos] = useState([]);
  const [, setActualizacion] = useState(0);

  // =========================================================
  // FECHA ACTUAL
  // =========================================================

  const obtenerFechaLocal = () => {
    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  };

  const fechaActual = obtenerFechaLocal();

  // =========================================================
  // CARGAR TURNOS DESDE FASTAPI
  // =========================================================

  const cargarTurnos = async () => {
    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/turnos"
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron obtener los turnos");
      }

      const datos = await respuesta.json();

      setTurnos(datos);
    } catch (error) {
      console.error("Error al cargar turnos:", error);
    }
  };

  useEffect(() => {
    cargarTurnos();
  }, []);

  // =========================================================
  // RELOJ
  // =========================================================

  useEffect(() => {
    const intervalo = setInterval(() => {
      setActualizacion((valor) => valor + 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  // =========================================================
  // FILTRAR TURNOS DE HOY Y ORDENAR POR HORA
  // =========================================================

  const turnosHoy = turnos
    .filter((turno) => {
      if (!turno.fecha) return false;

      const fechaTurno = String(turno.fecha).slice(0, 10);

      return fechaTurno === fechaActual;
    })
    .sort((a, b) =>
      String(a.hora || "").localeCompare(
        String(b.hora || "")
      )
    );

  // =========================================================
  // ACTUALIZAR ESTADO DE RECEPCIÓN
  // =========================================================

  const actualizarEstadoRecepcion = async (
    idTurno,
    nuevoEstado
  ) => {
    try {
      const respuesta = await fetch(
        `http://127.0.0.1:8000/turnos/${idTurno}/recepcion`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado_recepcion: nuevoEstado,
          }),
        }
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo actualizar el estado");
      }

      await cargarTurnos();
    } catch (error) {
      console.error(
        "Error al actualizar recepción:",
        error
      );

      alert(
        "No se pudo actualizar el estado del paciente."
      );
    }
  };

  // =========================================================
  // ACCIONES
  // =========================================================

  const marcarLlegada = (idTurno) => {
    actualizarEstadoRecepcion(idTurno, "En espera");
  };

  const iniciarConsulta = (idTurno) => {
    actualizarEstadoRecepcion(idTurno, "En consulta");
  };

  const finalizarAtencion = (idTurno) => {
    actualizarEstadoRecepcion(idTurno, "Finalizado");
  };

  const marcarAusente = (idTurno) => {
    const confirmar = window.confirm(
      "¿Querés marcar al paciente como ausente?"
    );

    if (!confirmar) {
      return;
    }

    actualizarEstadoRecepcion(idTurno, "Ausente");
  };

  // =========================================================
  // BUSCADOR
  // =========================================================

  const normalizarTexto = (texto) => {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const turnosFiltrados = turnosHoy.filter((turno) => {
    const textoBusqueda = normalizarTexto(busqueda);

    return (
      normalizarTexto(turno.paciente).includes(textoBusqueda) ||
      normalizarTexto(turno.medico).includes(textoBusqueda) ||
      normalizarTexto(turno.motivo_consulta).includes(
        textoBusqueda
      ) ||
      normalizarTexto(turno.estado_recepcion).includes(
        textoBusqueda
      )
    );
  });

  // =========================================================
  // CONTADORES DEL DÍA
  // =========================================================

  const cantidadEnEspera = turnosHoy.filter(
    (turno) => turno.estado_recepcion === "En espera"
  ).length;

  const cantidadEnConsulta = turnosHoy.filter(
    (turno) => turno.estado_recepcion === "En consulta"
  ).length;

  const cantidadFinalizados = turnosHoy.filter(
    (turno) => turno.estado_recepcion === "Finalizado"
  ).length;

  const cantidadAusentes = turnosHoy.filter(
    (turno) => turno.estado_recepcion === "Ausente"
  ).length;

  // =========================================================
  // TIEMPO DE ESPERA
  // =========================================================

  const calcularTiempo = (inicio, fin = null) => {
    if (!inicio) {
      return "--:--:--";
    }

    const tiempoInicio = new Date(inicio).getTime();

    const tiempoFin = fin
      ? new Date(fin).getTime()
      : Date.now();

    if (
      Number.isNaN(tiempoInicio) ||
      Number.isNaN(tiempoFin)
    ) {
      return "--:--:--";
    }

    const diferencia = Math.max(
      0,
      Math.floor((tiempoFin - tiempoInicio) / 1000)
    );

    const horas = Math.floor(diferencia / 3600);
    const minutos = Math.floor((diferencia % 3600) / 60);
    const segundos = diferencia % 60;

    return `${String(horas).padStart(2, "0")}:${String(
      minutos
    ).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
  };

  const obtenerTiempoEspera = (turno) => {
    if (!turno.hora_llegada) {
      return "--:--:--";
    }

    // Mientras espera, el reloj sigue corriendo.
    if (turno.estado_recepcion === "En espera") {
      return calcularTiempo(turno.hora_llegada);
    }

    // Cuando comienza la consulta, el reloj se detiene.
    if (turno.hora_inicio_consulta) {
      return calcularTiempo(
        turno.hora_llegada,
        turno.hora_inicio_consulta
      );
    }

    return "--:--:--";
  };

  // =========================================================
  // CLASE PARA LOS ESTADOS
  // =========================================================

  const obtenerClaseEstado = (estado) => {
    return `recepcion-estado recepcion-estado-${String(
      estado || "Pendiente"
    )
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <section className="recepcion-page">
      {/* ENCABEZADO */}
      <div className="recepcion-header">
        <div>
          <h1>Recepción</h1>

          <p>
            Seguimiento de pacientes y turnos del día.
          </p>
        </div>
      </div>

      {/* RESUMEN DEL DÍA */}
      <div className="recepcion-resumen">
        <div className="recepcion-resumen-card">
          <span>En espera</span>
          <strong>{cantidadEnEspera}</strong>
        </div>

        <div className="recepcion-resumen-card">
          <span>En consulta</span>
          <strong>{cantidadEnConsulta}</strong>
        </div>

        <div className="recepcion-resumen-card">
          <span>Finalizados</span>
          <strong>{cantidadFinalizados}</strong>
        </div>

        <div className="recepcion-resumen-card">
          <span>Ausentes</span>
          <strong>{cantidadAusentes}</strong>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="recepcion-search-container">
        <input
          type="text"
          className="recepcion-search"
          placeholder="Buscar paciente, médico, tipo o estado..."
          value={busqueda}
          onChange={(evento) =>
            setBusqueda(evento.target.value)
          }
        />
      </div>

      {/* TABLA DE TURNOS */}
      <div className="recepcion-table-container">
        <table className="recepcion-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Tiempo en espera</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {turnosFiltrados.map((turno) => {
              const estado =
                turno.estado_recepcion || "Pendiente";

              return (
                <tr key={turno.id_turno}>
                  <td>
                    <strong>{turno.hora}</strong>
                  </td>

                  <td>{turno.paciente}</td>

                  <td>{turno.medico}</td>

                  <td>{turno.motivo_consulta}</td>

                  <td>
                    <span
                      className={obtenerClaseEstado(estado)}
                    >
                      {estado}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        estado === "En espera"
                          ? "recepcion-reloj activo"
                          : "recepcion-reloj"
                      }
                    >
                      {estado === "En espera" && "⏱ "}

                      {obtenerTiempoEspera(turno)}
                    </span>
                  </td>

                  <td>
                    <div className="recepcion-acciones">
                      {estado === "Pendiente" && (
                        <>
                          <button
                            type="button"
                            className="recepcion-btn-primary"
                            onClick={() =>
                              marcarLlegada(turno.id_turno)
                            }
                          >
                            Llegó
                          </button>

                          <button
                            type="button"
                            className="recepcion-btn-secondary"
                            onClick={() =>
                              marcarAusente(turno.id_turno)
                            }
                          >
                            Ausente
                          </button>
                        </>
                      )}

                      {estado === "En espera" && (
                        <button
                          type="button"
                          className="recepcion-btn-primary"
                          onClick={() =>
                            iniciarConsulta(turno.id_turno)
                          }
                        >
                          Iniciar consulta
                        </button>
                      )}

                      {estado === "En consulta" && (
                        <button
                          type="button"
                          className="recepcion-btn-primary"
                          onClick={() =>
                            finalizarAtencion(turno.id_turno)
                          }
                        >
                          Finalizar
                        </button>
                      )}

                      {estado === "Finalizado" && (
                        <span className="recepcion-sin-acciones">
                          Atención finalizada
                        </span>
                      )}

                      {estado === "Ausente" && (
                        <span className="recepcion-sin-acciones">
                          Paciente ausente
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {turnosFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="recepcion-sin-resultados"
                >
                  No se encontraron turnos para hoy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Recepcion;
