import { useEffect, useState } from "react";
import "../styles/recepcion.css";

function Recepcion() {
  const [busqueda, setBusqueda] = useState("");
  const [, setActualizacion] = useState(0);

  const [turnos, setTurnos] = useState([
    {
      id: 1,
      hora: "09:00",
      paciente: "María González",
      medico: "Dr. Juan Pérez",
      tipoTurno: "Primera consulta",
      consultorio: "Consultorio 1",
      estadoRecepcion: "Pendiente",
      inicioEspera: null,
      tiempoEsperaFinal: null,
    },
    {
      id: 2,
      hora: "10:30",
      paciente: "Carlos Pérez",
      medico: "Dra. Laura Gómez",
      tipoTurno: "Postoperatorio",
      consultorio: "Consultorio 2",
      estadoRecepcion: "Pendiente",
      inicioEspera: null,
      tiempoEsperaFinal: null,
    },
    {
      id: 3,
      hora: "11:00",
      paciente: "Lucía Fernández",
      medico: "Dr. Juan Pérez",
      tipoTurno: "Consulta",
      consultorio: "Consultorio 1",
      estadoRecepcion: "Pendiente",
      inicioEspera: null,
      tiempoEsperaFinal: null,
    },
  ]);

  // Actualiza los relojes una vez por segundo.
  useEffect(() => {
    const intervalo = setInterval(() => {
      setActualizacion((valor) => valor + 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const normalizarTexto = (texto) => {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const turnosFiltrados = turnos.filter((turno) => {
    const textoBusqueda = normalizarTexto(busqueda);

    return (
      normalizarTexto(turno.paciente).includes(textoBusqueda) ||
      normalizarTexto(turno.medico).includes(textoBusqueda) ||
      normalizarTexto(turno.tipoTurno).includes(textoBusqueda) ||
      normalizarTexto(turno.estadoRecepcion).includes(textoBusqueda)
    );
  });

  const calcularTiempo = (inicio) => {
    if (!inicio) {
      return "--:--:--";
    }

    const diferencia = Math.max(
      0,
      Math.floor((Date.now() - inicio) / 1000)
    );

    const horas = Math.floor(diferencia / 3600);
    const minutos = Math.floor((diferencia % 3600) / 60);
    const segundos = diferencia % 60;

    return `${String(horas).padStart(2, "0")}:${String(
      minutos
    ).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
  };

  const marcarLlegada = (id) => {
    setTurnos(
      turnos.map((turno) =>
        turno.id === id
          ? {
              ...turno,
              estadoRecepcion: "En espera",
              inicioEspera: Date.now(),
              tiempoEsperaFinal: null,
            }
          : turno
      )
    );
  };

  const iniciarConsulta = (id) => {
    setTurnos(
      turnos.map((turno) => {
        if (turno.id !== id) {
          return turno;
        }

        return {
          ...turno,
          estadoRecepcion: "En consulta",
          tiempoEsperaFinal: calcularTiempo(turno.inicioEspera),
        };
      })
    );
  };

  const finalizarAtencion = (id) => {
    setTurnos(
      turnos.map((turno) =>
        turno.id === id
          ? {
              ...turno,
              estadoRecepcion: "Finalizado",
            }
          : turno
      )
    );
  };

  const marcarAusente = (id) => {
    const confirmar = window.confirm(
      "¿Querés marcar al paciente como ausente?"
    );

    if (!confirmar) {
      return;
    }

    setTurnos(
      turnos.map((turno) =>
        turno.id === id
          ? {
              ...turno,
              estadoRecepcion: "Ausente",
            }
          : turno
      )
    );
  };

  const obtenerTiempoEspera = (turno) => {
    if (turno.estadoRecepcion === "En espera") {
      return calcularTiempo(turno.inicioEspera);
    }

    if (turno.tiempoEsperaFinal) {
      return turno.tiempoEsperaFinal;
    }

    return "--:--:--";
  };

  const obtenerClaseEstado = (estado) => {
    return `recepcion-estado recepcion-estado-${estado
      .toLowerCase()
      .replace(" ", "-")}`;
  };

  return (
    <section className="recepcion-page">
      <div className="recepcion-header">
        <div>
          <h1>Recepción</h1>
          <p>Seguimiento de pacientes y turnos del día.</p>
        </div>
      </div>

      <div className="recepcion-resumen">
        <div className="recepcion-resumen-card">
          <span>En espera</span>
          <strong>
            {
              turnos.filter(
                (turno) => turno.estadoRecepcion === "En espera"
              ).length
            }
          </strong>
        </div>

        <div className="recepcion-resumen-card">
          <span>En consulta</span>
          <strong>
            {
              turnos.filter(
                (turno) => turno.estadoRecepcion === "En consulta"
              ).length
            }
          </strong>
        </div>

        <div className="recepcion-resumen-card">
          <span>Finalizados</span>
          <strong>
            {
              turnos.filter(
                (turno) => turno.estadoRecepcion === "Finalizado"
              ).length
            }
          </strong>
        </div>

        <div className="recepcion-resumen-card">
          <span>Ausentes</span>
          <strong>
            {
              turnos.filter(
                (turno) => turno.estadoRecepcion === "Ausente"
              ).length
            }
          </strong>
        </div>
      </div>

      <div className="recepcion-search-container">
        <input
          type="text"
          className="recepcion-search"
          placeholder="Buscar paciente, médico, tipo o estado..."
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </div>

      <div className="recepcion-table-container">
        <table className="recepcion-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Tipo</th>
              <th>Consultorio</th>
              <th>Estado</th>
              <th>Tiempo en espera</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {turnosFiltrados.map((turno) => (
              <tr key={turno.id}>
                <td>
                  <strong>{turno.hora}</strong>
                </td>

                <td>{turno.paciente}</td>
                <td>{turno.medico}</td>
                <td>{turno.tipoTurno}</td>
                <td>{turno.consultorio}</td>

                <td>
                  <span
                    className={obtenerClaseEstado(
                      turno.estadoRecepcion
                    )}
                  >
                    {turno.estadoRecepcion}
                  </span>
                </td>

                <td>
                  <span
                    className={
                      turno.estadoRecepcion === "En espera"
                        ? "recepcion-reloj activo"
                        : "recepcion-reloj"
                    }
                  >
                    {turno.estadoRecepcion === "En espera" && "⏱ "}
                    {obtenerTiempoEspera(turno)}
                  </span>
                </td>

                <td>
                  <div className="recepcion-acciones">
                    {turno.estadoRecepcion === "Pendiente" && (
                      <>
                        <button
                          type="button"
                          className="recepcion-btn-primary"
                          onClick={() => marcarLlegada(turno.id)}
                        >
                          Llegó
                        </button>

                        <button
                          type="button"
                          className="recepcion-btn-secondary"
                          onClick={() => marcarAusente(turno.id)}
                        >
                          Ausente
                        </button>
                      </>
                    )}

                    {turno.estadoRecepcion === "En espera" && (
                      <button
                        type="button"
                        className="recepcion-btn-primary"
                        onClick={() => iniciarConsulta(turno.id)}
                      >
                        Iniciar consulta
                      </button>
                    )}

                    {turno.estadoRecepcion === "En consulta" && (
                      <button
                        type="button"
                        className="recepcion-btn-primary"
                        onClick={() => finalizarAtencion(turno.id)}
                      >
                        Finalizar
                      </button>
                    )}

                    {turno.estadoRecepcion === "Finalizado" && (
                      <span className="recepcion-sin-acciones">
                        Atención finalizada
                      </span>
                    )}

                    {turno.estadoRecepcion === "Ausente" && (
                      <span className="recepcion-sin-acciones">
                        Paciente ausente
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {turnosFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="recepcion-sin-resultados"
                >
                  No se encontraron turnos.
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