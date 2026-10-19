
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/misturnospaciente.css";

const API = "http://127.0.0.1:8000";

function fechaLocal(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function horaNormalizada(hora) {
  return String(hora || "").slice(0, 5);
}

function MisTurnosPaciente() {
  const navigate = useNavigate();

  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);

  const [turnoEditando, setTurnoEditando] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  const [mesVisible, setMesVisible] = useState(() => {
    const hoy = new Date();

    return new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      1
    );
  });

  const [ahora, setAhora] = useState(() => new Date());

  // ==========================================
  // ACTUALIZAR HORA
  // ==========================================

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAhora(new Date());
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  const hoy = fechaLocal(ahora);

  const obtenerToken = () =>
    localStorage.getItem("access_token");

  // ==========================================
  // CARGAR TURNOS
  // ==========================================

  const cargarTurnos = async () => {
    const token = obtenerToken();

    if (!token) {
      setError(
        "No se encontró la sesión. Iniciá sesión nuevamente."
      );
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(
        `${API}/api/paciente/mis-turnos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron cargar tus turnos."
        );
      }

      const datos = await respuesta.json();

      setTurnos(
        Array.isArray(datos) ? datos : []
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTurnos();
  }, []);

  // ==========================================
  // VALIDAR SI EL TURNO ES MODIFICABLE
  // ==========================================

  const turnoPasado = (turno) => {
    const fechaHora = new Date(
      `${turno.fecha}T${horaNormalizada(turno.hora)}:00`
    );

    return fechaHora <= ahora;
  };

  const turnoModificable = (turno) => {
    const estado = String(
      turno.estado || ""
    ).toLowerCase();

    return (
      !turnoPasado(turno) &&
      !["cancelado", "atendido", "ausente"].includes(
        estado
      )
    );
  };

  // ==========================================
  // ABRIR REPROGRAMACIÓN
  // ==========================================

  const abrirReprogramacion = (turno) => {
    if (!turno.id_medico) {
      setError(
        "No se recibió el identificador del médico. Revisá el endpoint mis-turnos."
      );
      return;
    }

    setTurnoEditando(turno);
    setNuevaFecha("");
    setNuevaHora("");
    setHorarios([]);
    setError("");
    setMensaje("");

    const fecha = new Date();

    setMesVisible(
      new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        1
      )
    );
  };

  const cerrarReprogramacion = () => {
    setTurnoEditando(null);
    setNuevaFecha("");
    setNuevaHora("");
    setHorarios([]);
  };

  // ==========================================
  // CONSULTAR HORARIOS DISPONIBLES
  // ==========================================

  useEffect(() => {
    if (!turnoEditando || !nuevaFecha) {
      setHorarios([]);
      setNuevaHora("");
      return;
    }

    const controlador = new AbortController();

    const consultarHorarios = async () => {
      setCargandoHorarios(true);
      setNuevaHora("");
      setHorarios([]);
      setError("");

      try {
        const parametros = new URLSearchParams({
          id_medico: String(turnoEditando.id_medico),
          fecha: nuevaFecha
        });

        const respuesta = await fetch(
          `${API}/horarios-disponibles?${parametros}`,
          {
            signal: controlador.signal
          }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            typeof datos.detail === "string"
              ? datos.detail
              : "No se pudieron consultar los horarios."
          );
        }

        const lista = Array.isArray(datos.horarios)
          ? datos.horarios
          : [];

        const disponibles = lista
          .map(horaNormalizada)
          .filter((hora) => {
            const fechaHora = new Date(
              `${nuevaFecha}T${hora}:00`
            );

            return fechaHora > new Date();
          });

        if (!controlador.signal.aborted) {
          setHorarios(disponibles);
        }

      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargandoHorarios(false);
        }
      }
    };

    consultarHorarios();

    return () => controlador.abort();
  }, [turnoEditando, nuevaFecha]);

  // ==========================================
  // CANCELAR TURNO
  // ==========================================

  const cancelarTurno = async (turno) => {
    const confirmar = window.confirm(
      `¿Seguro que querés cancelar el turno del ${turno.fecha} a las ${turno.hora} hs?`
    );

    if (!confirmar) return;

    setProcesando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch(
        `${API}/api/paciente/turnos/${turno.id_turno}/cancelar`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${obtenerToken()}`
          }
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          typeof datos.detail === "string"
            ? datos.detail
            : "No se pudo cancelar el turno."
        );
      }

      cerrarReprogramacion();
      await cargarTurnos();

      setMensaje(
        "El turno fue cancelado correctamente."
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  // ==========================================
  // CONFIRMAR REPROGRAMACIÓN
  // ==========================================

  const confirmarReprogramacion = async () => {
    if (
      !turnoEditando ||
      !nuevaFecha ||
      !nuevaHora
    ) {
      setError(
        "Seleccioná una fecha y un horario."
      );
      return;
    }

    if (!horarios.includes(nuevaHora)) {
      setError(
        "Ese horario no está disponible."
      );
      return;
    }

    setProcesando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch(
        `${API}/api/paciente/turnos/${turnoEditando.id_turno}/reprogramar`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${obtenerToken()}`
          },
          body: JSON.stringify({
            fecha: nuevaFecha,
            hora: nuevaHora
          })
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          typeof datos.detail === "string"
            ? datos.detail
            : "No se pudo reprogramar el turno."
        );
      }

      cerrarReprogramacion();
      await cargarTurnos();

      setMensaje(
        "¡Turno reprogramado correctamente!"
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  // ==========================================
  // CALENDARIO
  // ==========================================

  const cambiarMes = (cantidad) => {
    setMesVisible(
      new Date(
        mesVisible.getFullYear(),
        mesVisible.getMonth() + cantidad,
        1
      )
    );
  };

  const generarDias = () => {
    const anio = mesVisible.getFullYear();
    const mes = mesVisible.getMonth();

    const primerDia = new Date(anio, mes, 1);

    const cantidadDias = new Date(
      anio,
      mes + 1,
      0
    ).getDate();

    const espacios =
      (primerDia.getDay() + 6) % 7;

    const resultado = Array(espacios).fill(null);

    for (
      let dia = 1;
      dia <= cantidadDias;
      dia++
    ) {
      resultado.push(
        new Date(anio, mes, dia)
      );
    }

    return resultado;
  };

  const primerDiaMesActual = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    1
  );

  const turnosOrdenados = [...turnos].sort(
    (a, b) =>
      `${b.fecha}T${horaNormalizada(b.hora)}`.localeCompare(
        `${a.fecha}T${horaNormalizada(a.hora)}`
      )
  );

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div className="mis-turnos-contenedor">

      <main className="mis-turnos-paciente">

        {/* ENCABEZADO */}

        <header className="mis-turnos-header">
          <div>
            <h1>Mis turnos reservados</h1>
            <p>
              Consultá y gestioná tus turnos médicos.
            </p>
          </div>

          <button
            type="button"
            className="mis-turnos-boton-volver"
            onClick={() =>
              navigate("/portal-paciente")
            }
          >
            ← Volver al portal
          </button>
        </header>

        {/* MENSAJES */}

        {error && (
          <p className="mis-turnos-error" role="alert">
            {error}
          </p>
        )}

        {mensaje && (
          <p className="mis-turnos-exito" role="status">
            {mensaje}
          </p>
        )}

        {/* LISTADO */}

        <section className="mis-turnos-panel">

          {cargando ? (
            <p className="mis-turnos-vacio">
              Cargando turnos...
            </p>
          ) : turnos.length === 0 ? (
            <p className="mis-turnos-vacio">
              No tenés turnos registrados en este momento.
            </p>
          ) : (
            <ul className="mis-turnos-lista">

              {turnosOrdenados.map((turno) => {
                const pasado = turnoPasado(turno);
                const modificable =
                  turnoModificable(turno);

                const cancelado =
                  String(
                    turno.estado || ""
                  ).toLowerCase() === "cancelado";

                const estadoVisual = cancelado
                  ? "Cancelado"
                  : pasado
                    ? "Fecha pasada"
                    : turno.estado;

                return (
                  <li
                    key={turno.id_turno}
                    className={[
                      "mis-turnos-item",
                      pasado || cancelado
                        ? "mis-turnos-item-inactivo"
                        : ""
                    ].join(" ")}
                  >

                    <div className="mis-turnos-item-contenido">

                      {/* DATOS DEL TURNO */}

                      <div className="mis-turnos-datos">

                        <p>
                          <strong>Fecha:</strong>{" "}
                          {turno.fecha}
                          {" | "}
                          <strong>Hora:</strong>{" "}
                          {horaNormalizada(turno.hora)} hs
                        </p>

                        <p>
                          <strong>Médico:</strong>{" "}
                          {turno.medico}
                        </p>

                        <p>
                          <strong>
                            Motivo de consulta:
                          </strong>{" "}
                          {turno.motivo_consulta ||
                            "Sin observaciones"}
                        </p>

                        <p>
                          <strong>Estado:</strong>{" "}
                          <span
                            className={
                              pasado || cancelado
                                ? "mis-turnos-estado-inactivo"
                                : "mis-turnos-estado-activo"
                            }
                          >
                            {estadoVisual}
                          </span>
                        </p>

                      </div>

                      {/* ACCIONES */}

                      {modificable && (
                        <div className="mis-turnos-acciones">

                          <button
                            type="button"
                            className="mis-turnos-boton-cambiar"
                            onClick={() =>
                              abrirReprogramacion(turno)
                            }
                            disabled={procesando}
                          >
                            📅 Cambiar fecha
                          </button>

                          <button
                            type="button"
                            className="mis-turnos-boton-cancelar"
                            onClick={() =>
                              cancelarTurno(turno)
                            }
                            disabled={procesando}
                          >
                            Cancelar turno
                          </button>

                        </div>
                      )}

                    </div>

                    {pasado && !cancelado && (
                      <p className="mis-turnos-aviso">
                        Este turno ya pasó y no puede
                        modificarse.
                      </p>
                    )}

                    {/* REPROGRAMACIÓN */}

                    {turnoEditando?.id_turno ===
                      turno.id_turno && (

                      <div className="mis-turnos-reprogramar">

                        <h3>Reprogramar turno</h3>

                        <p>
                          Seleccioná una nueva fecha y
                          después elegí un horario disponible.
                        </p>

                        {/* CALENDARIO */}

                        <div className="mis-turnos-calendario">

                          <div className="mis-turnos-calendario-header">

                            <button
                              type="button"
                              onClick={() =>
                                cambiarMes(-1)
                              }
                              disabled={
                                mesVisible <=
                                primerDiaMesActual
                              }
                              aria-label="Mes anterior"
                            >
                              ◀
                            </button>

                            <strong>
                              {mesVisible.toLocaleDateString(
                                "es-AR",
                                {
                                  month: "long",
                                  year: "numeric"
                                }
                              )}
                            </strong>

                            <button
                              type="button"
                              onClick={() =>
                                cambiarMes(1)
                              }
                              aria-label="Mes siguiente"
                            >
                              ▶
                            </button>

                          </div>

                          <div className="mis-turnos-calendario-dias">

                            {[
                              "L", "M", "M", "J",
                              "V", "S", "D"
                            ].map((dia, indice) => (
                              <strong key={indice}>
                                {dia}
                              </strong>
                            ))}

                            {generarDias().map(
                              (fecha, indice) => {
                                if (!fecha) {
                                  return (
                                    <span key={indice} />
                                  );
                                }

                                const valor =
                                  fechaLocal(fecha);

                                const esPasado =
                                  valor < hoy;

                                const seleccionado =
                                  nuevaFecha === valor;

                                return (
                                  <button
                                    key={valor}
                                    type="button"
                                    disabled={esPasado}
                                    className={[
                                      "mis-turnos-dia",
                                      esPasado
                                        ? "mis-turnos-dia-pasado"
                                        : "",
                                      seleccionado
                                        ? "mis-turnos-dia-seleccionado"
                                        : ""
                                    ].join(" ")}
                                    onClick={() => {
                                      setNuevaFecha(valor);
                                      setNuevaHora("");
                                    }}
                                    aria-pressed={seleccionado}
                                  >
                                    {fecha.getDate()}
                                  </button>
                                );
                              }
                            )}

                          </div>
                        </div>

                        {/* HORARIOS */}

                        {nuevaFecha && (
                          <div className="mis-turnos-horarios">

                            <p>
                              <strong>
                                Fecha seleccionada:
                              </strong>{" "}
                              {nuevaFecha}
                            </p>

                            {cargandoHorarios ? (
                              <p>
                                Consultando horarios...
                              </p>
                            ) : horarios.length === 0 ? (
                              <p>
                                No hay horarios disponibles
                                para esa fecha.
                              </p>
                            ) : (
                              <select
                                value={nuevaHora}
                                onChange={(e) =>
                                  setNuevaHora(e.target.value)
                                }
                                aria-label="Horario disponible"
                              >
                                <option value="">
                                  Seleccioná un horario
                                </option>

                                {horarios.map((hora) => (
                                  <option
                                    key={hora}
                                    value={hora}
                                  >
                                    {hora} hs
                                  </option>
                                ))}
                              </select>
                            )}

                          </div>
                        )}

                        {/* BOTONES REPROGRAMACIÓN */}

                        <div className="mis-turnos-reprogramar-acciones">

                          <button
                            type="button"
                            className="mis-turnos-boton-confirmar"
                            onClick={confirmarReprogramacion}
                            disabled={
                              procesando ||
                              cargandoHorarios ||
                              !nuevaFecha ||
                              !nuevaHora
                            }
                          >
                            {procesando
                              ? "Guardando..."
                              : "Confirmar cambio"}
                          </button>

                          <button
                            type="button"
                            className="mis-turnos-boton-volver"
                            onClick={cerrarReprogramacion}
                            disabled={procesando}
                          >
                            Volver
                          </button>

                        </div>

                      </div>
                    )}

                  </li>
                );
              })}

            </ul>
          )}

        </section>

      </main>

    </div>
  );
}

export default MisTurnosPaciente;
