
import { useEffect, useMemo, useState } from "react";
import "../../styles/agenda.css";

const API = "http://127.0.0.1:8000";
const CLAVE_TAREAS = "tareas-dashboard";

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

function fechaLocal(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function leerTareas() {
  try {
    const datos = JSON.parse(
      localStorage.getItem(CLAVE_TAREAS) || "[]"
    );

    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "";
  }

  return fecha.split("-").reverse().join("/");
}

function obtenerClaseEstado(estado) {
  const estadoNormalizado = String(estado || "")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return `agenda-estado agenda-estado-${estadoNormalizado}`;
}

// =========================================================
// COMPONENTE AGENDA
// =========================================================

function Agenda() {
  // =======================================================
  // ESTADOS
  // =======================================================

  const [mesVisible, setMesVisible] = useState(() => {
    const hoy = new Date();

    return new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      1
    );
  });

  const [fechaSeleccionada, setFechaSeleccionada] =
    useState(fechaLocal);

  const [medicoSeleccionado, setMedicoSeleccionado] =
    useState("Todos");

  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [tareas, setTareas] = useState(leerTareas);
  const [nuevaTarea, setNuevaTarea] = useState("");

  // =======================================================
  // CARGAR TURNOS DESDE FASTAPI
  // =======================================================

  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const respuesta = await fetch(`${API}/turnos`);

        if (!respuesta.ok) {
          throw new Error(
            "No se pudieron obtener los turnos."
          );
        }

        const datos = await respuesta.json();

        setTurnos(
          Array.isArray(datos) ? datos : []
        );
      } catch (err) {
        setError(
          err.message || "Error al cargar los turnos."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarTurnos();
  }, []);

  // =======================================================
  // GUARDAR TAREAS EN LOCALSTORAGE
  // =======================================================

  useEffect(() => {
    localStorage.setItem(
      CLAVE_TAREAS,
      JSON.stringify(tareas)
    );
  }, [tareas]);

  // =======================================================
  // SINCRONIZAR TAREAS ENTRE PESTAÑAS
  // =======================================================

  useEffect(() => {
    const actualizarTareas = (evento) => {
      if (evento.key === CLAVE_TAREAS) {
        setTareas(leerTareas());
      }
    };

    window.addEventListener(
      "storage",
      actualizarTareas
    );

    return () => {
      window.removeEventListener(
        "storage",
        actualizarTareas
      );
    };
  }, []);

  // =======================================================
  // DATOS DEL CALENDARIO
  // =======================================================

  const anio = mesVisible.getFullYear();
  const mes = mesVisible.getMonth();

  const diasDelMes = new Date(
    anio,
    mes + 1,
    0
  ).getDate();

  const huecosIniciales =
    (new Date(anio, mes, 1).getDay() + 6) % 7;

  const nombreMes = mesVisible.toLocaleDateString(
    "es-AR",
    {
      month: "long",
      year: "numeric"
    }
  );

  // =======================================================
  // MÉDICOS DISPONIBLES
  // =======================================================

  const medicos = useMemo(() => {
    return [
      ...new Set(
        turnos
          .map((turno) => turno.medico)
          .filter(Boolean)
      )
    ].sort((a, b) => a.localeCompare(b, "es"));
  }, [turnos]);

  // =======================================================
  // FILTRAR TURNOS POR MÉDICO
  // =======================================================

  const turnosFiltrados = useMemo(() => {
    return turnos.filter((turno) => {
      return (
        medicoSeleccionado === "Todos" ||
        turno.medico === medicoSeleccionado
      );
    });
  }, [turnos, medicoSeleccionado]);

  // =======================================================
  // CONTAR TURNOS POR FECHA
  // =======================================================

  const cantidadPorFecha = useMemo(() => {
    const cantidades = {};

    turnosFiltrados.forEach((turno) => {
      const fecha = String(
        turno.fecha || ""
      ).slice(0, 10);

      if (fecha) {
        cantidades[fecha] =
          (cantidades[fecha] || 0) + 1;
      }
    });

    return cantidades;
  }, [turnosFiltrados]);

  // =======================================================
  // TURNOS DEL DÍA SELECCIONADO
  // =======================================================

  const turnosDelDia = useMemo(() => {
    return turnosFiltrados
      .filter((turno) => {
        const fechaTurno = String(
          turno.fecha || ""
        ).slice(0, 10);

        return fechaTurno === fechaSeleccionada;
      })
      .sort((a, b) => {
        return String(a.hora || "").localeCompare(
          String(b.hora || "")
        );
      });
  }, [turnosFiltrados, fechaSeleccionada]);

  const medicosConTurnos = [
    ...new Set(
      turnosDelDia
        .map((turno) => turno.medico)
        .filter(Boolean)
    )
  ];

  // =======================================================
  // TAREAS DEL DÍA
  // =======================================================

  const tareasDelDia = tareas.filter((tarea) => {
    return tarea.fecha === fechaSeleccionada;
  });

  // =======================================================
  // CAMBIAR MES
  // =======================================================

  const cambiarMes = (incremento) => {
    const siguiente = new Date(
      anio,
      mes + incremento,
      1
    );

    setMesVisible(siguiente);
    setFechaSeleccionada(fechaLocal(siguiente));
  };

  // =======================================================
  // VOLVER A HOY
  // =======================================================

  const irAHoy = () => {
    const hoy = new Date();

    setMesVisible(
      new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        1
      )
    );

    setFechaSeleccionada(fechaLocal(hoy));
  };

  // =======================================================
  // AGREGAR TAREA
  // =======================================================

  const agregarTarea = (evento) => {
    evento.preventDefault();

    const texto = nuevaTarea.trim();

    if (!texto) {
      return;
    }

    const tarea = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      texto,
      fecha: fechaSeleccionada,
      completada: false
    };

    setTareas((actuales) => [
      ...actuales,
      tarea
    ]);

    setNuevaTarea("");
  };

  // =======================================================
  // COMPLETAR TAREA
  // =======================================================

  const cambiarEstadoTarea = (id) => {
    setTareas((actuales) =>
      actuales.map((tarea) =>
        tarea.id === id
          ? {
              ...tarea,
              completada: !tarea.completada
            }
          : tarea
      )
    );
  };

  // =======================================================
  // ELIMINAR TAREA
  // =======================================================

  const eliminarTarea = (id) => {
    setTareas((actuales) =>
      actuales.filter((tarea) => tarea.id !== id)
    );
  };

  // =======================================================
  // PANTALLA
  // =======================================================

  return (
    <section className="agenda-page">

      {/* ENCABEZADO */}

      <div className="agenda-header">
        <div>
          <h1>Agenda mensual</h1>

          <p>
            Consultá los turnos del mes y organizá
            tus tareas por fecha.
          </p>
        </div>
      </div>

      {/* FILTROS */}

      <div
        className="agenda-filtros"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "end"
        }}
      >
        <div
          className="agenda-filtro"
          style={{
            minWidth: "230px"
          }}
        >
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

        <button
          type="button"
          onClick={irAHoy}
          style={{
            padding: "11px 16px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            background: "white",
            cursor: "pointer"
          }}
        >
          Ir a hoy
        </button>
      </div>

      {/* CALENDARIO MENSUAL */}

      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "18px",
          marginTop: "18px",
          marginBottom: "22px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "18px"
          }}
        >
          <button
            type="button"
            onClick={() => cambiarMes(-1)}
            aria-label="Mes anterior"
            style={{
              padding: "8px 13px",
              cursor: "pointer",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              background: "white"
            }}
          >
            ◀
          </button>

          <h2
            style={{
              margin: 0,
              textTransform: "capitalize",
              color: "#243447"
            }}
          >
            {nombreMes}
          </h2>

          <button
            type="button"
            onClick={() => cambiarMes(1)}
            aria-label="Mes siguiente"
            style={{
              padding: "8px 13px",
              cursor: "pointer",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              background: "white"
            }}
          >
            ▶
          </button>
        </div>

        {/* DÍAS DEL CALENDARIO */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(7, minmax(0, 1fr))",
            gap: "6px"
          }}
        >
          {[
            "L",
            "M",
            "M",
            "J",
            "V",
            "S",
            "D"
          ].map((dia, indice) => (
            <strong
              key={indice}
              style={{
                textAlign: "center",
                color: "#64748b",
                padding: "8px 0"
              }}
            >
              {dia}
            </strong>
          ))}

          {/* ESPACIOS ANTES DEL PRIMER DÍA */}

          {Array.from(
            { length: huecosIniciales },
            (_, indice) => (
              <div key={`hueco-${indice}`} />
            )
          )}

          {/* CASILLEROS DEL MES */}

          {Array.from(
            { length: diasDelMes },
            (_, indice) => {
              const dia = indice + 1;

              const fecha =
                `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

              const seleccionado =
                fecha === fechaSeleccionada;

              const esHoy =
                fecha === fechaLocal();

              const cantidad =
                cantidadPorFecha[fecha] || 0;

              const cantidadTareas = tareas.filter(
                (tarea) => tarea.fecha === fecha
              ).length;

              return (
                <button
                  key={fecha}
                  type="button"
                  onClick={() =>
                    setFechaSeleccionada(fecha)
                  }
                  aria-pressed={seleccionado}
                  style={{
                    minHeight: "82px",
                    minWidth: 0,
                    padding: "7px 4px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: "5px",
                    borderRadius: "8px",
                    border: esHoy
                      ? "2px solid #0ea5e9"
                      : seleccionado
                        ? "2px solid #2563eb"
                        : "1px solid #e2e8f0",
                    background: seleccionado
                      ? "#e0f2fe"
                      : "#fff",
                    color: "#243447",
                    cursor: "pointer"
                  }}
                >
                  <strong>{dia}</strong>

                  {cantidad > 0 && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#0369a1",
                        background: "#e0f2fe",
                        borderRadius: "8px",
                        padding: "2px 5px",
                        textAlign: "center"
                      }}
                    >
                      {cantidad}{" "}
                      {cantidad === 1
                        ? "turno"
                        : "turnos"}
                    </span>
                  )}

                  {cantidadTareas > 0 && (
                    <span
                      title={`${cantidadTareas} tareas`}
                      style={{
                        fontSize: "13px"
                      }}
                    >
                      📝 {cantidadTareas}
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* RESUMEN DEL DÍA SELECCIONADO */}

      <div className="agenda-fecha-actual">
        <span>Día seleccionado</span>

        <strong>
          {formatearFecha(fechaSeleccionada)}
        </strong>

        <small>
          {turnosDelDia.length}{" "}
          {turnosDelDia.length === 1
            ? "turno"
            : "turnos"}
        </small>
      </div>

      {/* TAREAS DEL DÍA */}

      <div
        style={{
          background: "white",
          padding: "20px",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          margin: "18px 0 24px"
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: "#243447"
          }}
        >
           Mis tareas del día 📝
        </h2>

        <form
          onSubmit={agregarTarea}
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >
          <input
            aria-label="Nueva tarea"
            type="text"
            value={nuevaTarea}
            onChange={(evento) =>
              setNuevaTarea(evento.target.value)
            }
            placeholder="Escribir un recordatorio..."
            style={{
              flex: "1 1 250px",
              padding: "11px",
              border: "1px solid #cbd5e1",
              borderRadius: "7px"
            }}
          />

          <button
            type="submit"
            style={{
              background: "#0ea5e9",
              color: "white",
              border: 0,
              borderRadius: "7px",
              padding: "10px 18px",
              cursor: "pointer"
            }}
          >
            Agregar tarea
          </button>
        </form>

        {/* MENSAJE SIN TAREAS - ESPACIADO CORREGIDO */}

        {tareasDelDia.length === 0 ? (
          <p
            style={{
              marginTop: "20px",
              marginBottom: "8px",
              color: "#64748b",
              fontSize: "14px"
            }}
          >
            No hay tareas anotadas para este día.
          </p>
        ) : (
          <div
            style={{
              marginTop: "15px",
              display: "grid",
              gap: "10px"
            }}
          >
            {tareasDelDia.map((tarea) => (
              <div
                key={tarea.id}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  padding: "10px",
                  background: "#f8fafc",
                  borderRadius: "8px"
                }}
              >
                <label
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flex: 1
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(tarea.completada)}
                    onChange={() =>
                      cambiarEstadoTarea(tarea.id)
                    }
                  />

                  <span
                    style={{
                      textDecoration: tarea.completada
                        ? "line-through"
                        : "none",
                      color: tarea.completada
                        ? "#64748b"
                        : "#243447"
                    }}
                  >
                    {tarea.texto}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    eliminarTarea(tarea.id)
                  }
                  aria-label={`Eliminar tarea ${tarea.texto}`}
                  style={{
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    color: "#64748b",
                    fontSize: "20px"
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MENSAJE DE ERROR */}

      {error && (
        <p
          role="alert"
          style={{
            color: "#b91c1c"
          }}
        >
          {error}
        </p>
      )}

      {/* TURNOS AGRUPADOS POR MÉDICO */}

      {cargando ? (
        <p>Cargando turnos...</p>
      ) : medicosConTurnos.length > 0 ? (
        <div className="agenda-medicos">
          {medicosConTurnos.map((medico) => {
            const turnosMedico = turnosDelDia.filter(
              (turno) => turno.medico === medico
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
                        <th>Estado</th>
                      </tr>
                    </thead>

                    <tbody>
                      {turnosMedico.map((turno) => (
                        <tr key={turno.id_turno}>
                          <td>
                            <strong className="agenda-hora">
                              {String(turno.hora || "").slice(0, 5)}
                            </strong>
                          </td>

                          <td>
                            {turno.paciente}
                          </td>

                          <td>
                            {turno.motivo_consulta}
                          </td>

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
         

          <h2>
            No hay turnos programados
          </h2>
          <div className="agenda-vacia-icono">
            📅
          </div>
          <p>
            No se encontraron turnos para la fecha
            y el médico seleccionados.
          </p>
        </div>
      )}
    </section>
  );
}

export default Agenda;
