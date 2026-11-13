
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SolicitarTurnoPaciente.css";

const API = "http://127.0.0.1:8000";

function SolicitarTurnoPaciente() {
  const navigate = useNavigate();

  const [medicos, setMedicos] = useState([]);
  const [idMedico, setIdMedico] = useState("");
  const [selectorAbierto, setSelectorAbierto] = useState(false);

  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [motivo, setMotivo] = useState("");

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [calendarioAbierto, setCalendarioAbierto] = useState(false);

  const [mesVisible, setMesVisible] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });

  const selectorRef = useRef(null);

  // ==========================================
  // FECHAS
  // ==========================================

  const formatearFecha = (fechaDate) => {
    const anio = fechaDate.getFullYear();
    const mes = String(fechaDate.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaDate.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  };

  const fechaMinima = formatearFecha(new Date());

  const cambiarMes = (cantidad) => {
    setMesVisible((anterior) =>
      new Date(
        anterior.getFullYear(),
        anterior.getMonth() + cantidad,
        1
      )
    );
  };

  const seleccionarFecha = (fechaElegida) => {
    setFecha(fechaElegida);
    setCalendarioAbierto(false);
    setMensaje("");
  };

  const obtenerDiasCalendario = () => {
    const anio = mesVisible.getFullYear();
    const mes = mesVisible.getMonth();

    const primerDia = new Date(anio, mes, 1);
    const cantidadDias = new Date(anio, mes + 1, 0).getDate();

    const espaciosIniciales = (primerDia.getDay() + 6) % 7;
    const dias = Array(espaciosIniciales).fill(null);

    for (let dia = 1; dia <= cantidadDias; dia++) {
      dias.push(new Date(anio, mes, dia));
    }

    return dias;
  };

  const nombreMes = mesVisible.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric"
  });

  const fechaVisible = fecha
    ? fecha.split("-").reverse().join("/")
    : "Seleccioná una fecha";

  const mesAnteriorDeshabilitado =
    mesVisible.getFullYear() === new Date().getFullYear() &&
    mesVisible.getMonth() === new Date().getMonth();

  // ==========================================
  // CERRAR SELECTOR DE MÉDICOS
  // ==========================================

  useEffect(() => {
    const cerrarSelector = (evento) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(evento.target)
      ) {
        setSelectorAbierto(false);
      }
    };

    const cerrarConEscape = (evento) => {
      if (evento.key === "Escape") {
        setSelectorAbierto(false);
      }
    };

    document.addEventListener("mousedown", cerrarSelector);
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener("mousedown", cerrarSelector);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, []);

  // ==========================================
  // CARGAR MÉDICOS ACTIVOS
  // ==========================================

  useEffect(() => {
    const cargarMedicos = async () => {
      try {
        const respuesta = await fetch(`${API}/medicos`);

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los médicos");
        }

        const datos = await respuesta.json();

        setMedicos(
          datos.filter((medico) => Boolean(medico.activo))
        );
      } catch (err) {
        setError(err.message);
      }
    };

    cargarMedicos();
  }, []);

  // ==========================================
  // CONSULTAR HORARIOS DISPONIBLES
  // ==========================================

  useEffect(() => {
    if (!idMedico || !fecha) {
      setHorarios([]);
      setHora("");
      return;
    }

    const controlador = new AbortController();

    const cargarHorarios = async () => {
      setCargandoHorarios(true);
      setHorarios([]);
      setHora("");
      setError("");

      try {
        const parametros = new URLSearchParams({
          id_medico: idMedico,
          fecha
        });

        const respuesta = await fetch(
          `${API}/horarios-disponibles?${parametros}`,
          { signal: controlador.signal }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            typeof datos.detail === "string"
              ? datos.detail
              : "No se pudieron consultar los horarios"
          );
        }

        setHorarios(datos.horarios || []);
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

    cargarHorarios();

    return () => controlador.abort();
  }, [idMedico, fecha]);

  // ==========================================
  // SELECCIONAR MÉDICO
  // ==========================================

  const seleccionarMedico = (medico) => {
    setIdMedico(String(medico.id_medico));
    setSelectorAbierto(false);
    setError("");
    setMensaje("");
  };

  const medicoSeleccionado = medicos.find(
    (medico) => String(medico.id_medico) === idMedico
  );

  // ==========================================
  // CONFIRMAR RESERVA
  // ==========================================

  const manejarSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!idMedico) {
      setError("Seleccioná un médico.");
      return;
    }

    if (!horarios.includes(hora)) {
      setError("Seleccioná un horario disponible.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Tu sesión venció. Volvé a iniciar sesión.");
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await fetch(
        `${API}/api/paciente/turnos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            id_medico: Number(idMedico),
            fecha,
            hora,
            motivo_consulta: motivo.trim()
          })
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          typeof datos.detail === "string"
            ? datos.detail
            : "No se pudo reservar el turno"
        );
      }

      setMensaje("¡Turno reservado correctamente!");
      navigate("/portal-paciente/mis-turnos");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <main className="solicitar-turno-page">

      {/* ENCABEZADO */}

      <div className="solicitar-turno-header">
        <h2>Solicitar Nuevo Turno Médico</h2>

        <button
          type="button"
          className="solicitar-turno-volver"
          onClick={() => navigate("/portal-paciente")}
        >
          ← Volver al Portal
        </button>
      </div>

      <form
        className="solicitar-turno-form"
        onSubmit={manejarSubmit}
      >

        {/* ==================================
            SELECTOR PERSONALIZADO DE MÉDICOS
        ================================== */}

        <div className="solicitar-turno-campo">
          <label id="etiqueta-medico">
            Seleccionar médico
          </label>

          <div
            className="solicitar-medico-selector"
            ref={selectorRef}
          >
            <button
              type="button"
              className="solicitar-medico-boton"
              aria-labelledby="etiqueta-medico"
              aria-expanded={selectorAbierto}
              aria-controls="lista-medicos-paciente"
              onClick={() =>
                setSelectorAbierto(!selectorAbierto)
              }
            >
              <span className="solicitar-medico-texto">
                {medicoSeleccionado ? (
                  <>
                    Dr./Dra. {medicoSeleccionado.apellido},{" "}
                    {medicoSeleccionado.nombre}
                    {" - "}
                    {medicoSeleccionado.especialidad}
                  </>
                ) : (
                  "-- Seleccioná un médico --"
                )}
              </span>

              <span aria-hidden="true">
                {selectorAbierto ? "▲" : "▼"}
              </span>
            </button>

            {selectorAbierto && (
              <div
                id="lista-medicos-paciente"
                className="solicitar-medico-lista"
                role="group"
                aria-label="Médicos disponibles"
              >
                {medicos.length === 0 ? (
                  <p className="solicitar-medico-vacio">
                    No hay médicos disponibles.
                  </p>
                ) : (
                  medicos.map((medico) => (
                    <button
                      key={medico.id_medico}
                      type="button"
                      className={
                        "solicitar-medico-opcion" +
                        (String(medico.id_medico) === idMedico
                          ? " seleccionado"
                          : "")
                      }
                      aria-pressed={
                        String(medico.id_medico) === idMedico
                      }
                      onClick={() => seleccionarMedico(medico)}
                    >
                      <span className="solicitar-medico-nombre">
                        Dr./Dra. {medico.apellido},{" "}
                        {medico.nombre}
                      </span>

                      <span className="solicitar-medico-especialidad">
                        {medico.especialidad}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==================================
            CALENDARIO
        ================================== */}

        <div className="solicitar-turno-campo">
          <label>Fecha del turno</label>

          <button
            type="button"
            className="solicitar-fecha-boton"
            aria-expanded={calendarioAbierto}
            onClick={() =>
              setCalendarioAbierto(!calendarioAbierto)
            }
          >
            <span>📅 {fechaVisible}</span>
            <span>
              {calendarioAbierto ? "▲" : "▼"}
            </span>
          </button>

          {calendarioAbierto && (
            <div className="solicitar-calendario">

              <div className="solicitar-calendario-header">
                <button
                  type="button"
                  disabled={mesAnteriorDeshabilitado}
                  onClick={() => cambiarMes(-1)}
                  aria-label="Mes anterior"
                >
                  ❮
                </button>

                <strong>{nombreMes}</strong>

                <button
                  type="button"
                  onClick={() => cambiarMes(1)}
                  aria-label="Mes siguiente"
                >
                  ❯
                </button>
              </div>

              <div className="solicitar-calendario-dias">
                {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map(
                  (dia) => (
                    <strong key={dia}>{dia}</strong>
                  )
                )}

                {obtenerDiasCalendario().map((dia, indice) => {
                  if (!dia) {
                    return (
                      <div key={`vacio-${indice}`} />
                    );
                  }

                  const fechaDia = formatearFecha(dia);
                  const esPasado = fechaDia < fechaMinima;
                  const seleccionado = fechaDia === fecha;
                  const esHoy = fechaDia === fechaMinima;

                  return (
                    <button
                      key={fechaDia}
                      type="button"
                      disabled={esPasado}
                      onClick={() =>
                        seleccionarFecha(fechaDia)
                      }
                      className={[
                        "solicitar-calendario-dia",
                        esPasado ? "pasado" : "",
                        seleccionado ? "seleccionado" : "",
                        esHoy ? "hoy" : ""
                      ].filter(Boolean).join(" ")}
                    >
                      {dia.getDate()}
                    </button>
                  );
                })}
              </div>

              <p className="solicitar-calendario-ayuda">
                Seleccioná una fecha para consultar los horarios.
              </p>
            </div>
          )}
        </div>

        {/* ==================================
            HORARIOS
        ================================== */}

        <div className="solicitar-turno-campo">
          <label htmlFor="hora">
            Horario disponible
          </label>

          <select
            id="hora"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
            disabled={
              !idMedico ||
              !fecha ||
              cargandoHorarios ||
              horarios.length === 0
            }
          >
            <option value="">
              {cargandoHorarios
                ? "Buscando horarios..."
                : "Seleccioná un horario"}
            </option>

            {horarios.map((horario) => (
              <option key={horario} value={horario}>
                {horario} hs
              </option>
            ))}
          </select>

          {idMedico &&
            fecha &&
            !cargandoHorarios &&
            horarios.length === 0 &&
            !error && (
              <p className="solicitar-turno-aviso">
                No hay horarios disponibles para esa fecha.
                Probá con otro día.
              </p>
            )}
        </div>

        {/* ==================================
            MOTIVO
        ================================== */}

        <div className="solicitar-turno-campo">
          <label htmlFor="motivo">
            Motivo de consulta
          </label>

          <textarea
            id="motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Describí brevemente el motivo..."
            required
          />
        </div>

        {/* MENSAJES */}

        {error && (
          <p className="solicitar-turno-error" role="alert">
            {error}
          </p>
        )}

        {mensaje && (
          <p className="solicitar-turno-exito" role="status">
            {mensaje}
          </p>
        )}

        {/* CONFIRMAR */}

        <button
          type="submit"
          className="solicitar-turno-confirmar"
          disabled={
            guardando ||
            cargandoHorarios ||
            !idMedico ||
            !fecha ||
            !horarios.includes(hora)
          }
        >
          {guardando
            ? "Reservando..."
            : "Confirmar Reserva"}
        </button>

      </form>
    </main>
  );
}

export default SolicitarTurnoPaciente;
