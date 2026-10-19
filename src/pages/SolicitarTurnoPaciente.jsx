
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

function SolicitarTurnoPaciente() {
  const navigate = useNavigate();

  const [medicos, setMedicos] = useState([]);
  const [idMedico, setIdMedico] = useState("");
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

  const formatearFecha = (fechaDate) => {
    const anio = fechaDate.getFullYear();
    const mes = String(fechaDate.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaDate.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
  };

  const fechaMinima = formatearFecha(new Date());

  const cambiarMes = (cantidad) => {
    setMesVisible(
      new Date(
        mesVisible.getFullYear(),
        mesVisible.getMonth() + cantidad,
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

    // Semana comenzando el lunes
    const espaciosIniciales = (primerDia.getDay() + 6) % 7;

    const dias = Array(espaciosIniciales).fill(null);

    for (let dia = 1; dia <= cantidadDias; dia++) {
      dias.push(new Date(anio, mes, dia));
    }

    return dias;
  };

  const nombreMes = mesVisible.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const fechaVisible = fecha
    ? fecha.split("-").reverse().join("/")
    : "Seleccioná una fecha";

  const mesAnteriorDeshabilitado =
    mesVisible.getFullYear() === new Date().getFullYear() &&
    mesVisible.getMonth() === new Date().getMonth();

  // Cargar médicos activos
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

  // Consultar horarios disponibles
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
          fecha,
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

  // Confirmar reserva
  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

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
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_medico: Number(idMedico),
            fecha,
            hora,
            motivo_consulta: motivo.trim(),
          }),
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

  const estiloCampo = {
    width: "100%",
    padding: "10px",
    boxSizing: "border-box",
    marginTop: "5px",
    border: "1px solid #d5dce5",
    borderRadius: "6px",
    fontSize: "15px",
  };

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <h2>Solicitar Nuevo Turno Médico</h2>

        <button
          type="button"
          onClick={() => navigate("/portal-paciente")}
        >
          ← Volver al Portal
        </button>
      </div>

      <form
        onSubmit={manejarSubmit}
        style={{
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#fff",
        }}
      >
        {/* MÉDICO */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="medico">Seleccionar médico</label>

          <select
            id="medico"
            value={idMedico}
            onChange={(e) => setIdMedico(e.target.value)}
            required
            style={estiloCampo}
          >
            <option value="">-- Seleccioná un médico --</option>

            {medicos.map((medico) => (
              <option
                key={medico.id_medico}
                value={medico.id_medico}
              >
                Dr./Dra. {medico.apellido}, {medico.nombre}
                {" - "}
                {medico.especialidad}
              </option>
            ))}
          </select>
        </div>

        {/* CALENDARIO GRANDE */}
        <div style={{ marginBottom: "20px" }}>
          <label>Fecha del turno</label>

          <button
            type="button"
            onClick={() => setCalendarioAbierto(!calendarioAbierto)}
            style={{
              ...estiloCampo,
              textAlign: "left",
              background: "#fff",
              cursor: "pointer",
              color: fecha ? "#24364b" : "#777",
            }}
          >
            📅 {fechaVisible}
            <span style={{ float: "right" }}>
              {calendarioAbierto ? "▲" : "▼"}
            </span>
          </button>

          {calendarioAbierto && (
            <div
              style={{
                marginTop: "10px",
                padding: "20px",
                border: "1px solid #dce3ec",
                borderRadius: "12px",
                backgroundColor: "#fff",
                boxShadow: "0 5px 18px rgba(0,0,0,0.08)",
                maxWidth: "440px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <button
                  type="button"
                  disabled={mesAnteriorDeshabilitado}
                  onClick={() => cambiarMes(-1)}
                  style={{
                    padding: "9px 14px",
                    cursor: mesAnteriorDeshabilitado
                      ? "not-allowed"
                      : "pointer",
                    border: "1px solid #ddd",
                    borderRadius: "7px",
                    background: "#f5f7fa",
                    opacity: mesAnteriorDeshabilitado ? 0.4 : 1,
                  }}
                >
                  ❮
                </button>

                <strong
                  style={{
                    textTransform: "capitalize",
                    fontSize: "19px",
                    color: "#24364b",
                  }}
                >
                  {nombreMes}
                </strong>

                <button
                  type="button"
                  onClick={() => cambiarMes(1)}
                  style={{
                    padding: "9px 14px",
                    cursor: "pointer",
                    border: "1px solid #ddd",
                    borderRadius: "7px",
                    background: "#f5f7fa",
                  }}
                >
                  ❯
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: "6px",
                }}
              >
                {["L", "M", "M", "J", "V", "S", "D"].map(
                  (dia, indice) => (
                    <div
                      key={indice}
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#68788c",
                        padding: "10px 0",
                      }}
                    >
                      {dia}
                    </div>
                  )
                )}

                {obtenerDiasCalendario().map((dia, indice) => {
                  if (!dia) {
                    return <div key={`vacio-${indice}`} />;
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
                      onClick={() => seleccionarFecha(fechaDia)}
                      style={{
                        minHeight: "48px",
                        borderRadius: "8px",
                        border: esHoy
                          ? "2px solid #2384e8"
                          : "1px solid transparent",
                        background: seleccionado
                          ? "#2384e8"
                          : "#f4f7fb",
                        color: seleccionado
                          ? "#fff"
                          : esPasado
                          ? "#bec6d0"
                          : "#24364b",
                        fontWeight: seleccionado ? "bold" : "normal",
                        fontSize: "15px",
                        cursor: esPasado
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
                      {dia.getDate()}
                    </button>
                  );
                })}
              </div>

              <p
                style={{
                  fontSize: "12px",
                  color: "#777",
                  marginTop: "15px",
                  marginBottom: 0,
                }}
              >
                Seleccioná una fecha para consultar los horarios.
              </p>
            </div>
          )}
        </div>

        {/* HORARIOS */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="hora">Horario disponible</label>

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
            style={estiloCampo}
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
              <p style={{ color: "#666" }}>
                No hay horarios disponibles para esa fecha.
                Probá con otro día.
              </p>
            )}
        </div>

        {/* MOTIVO */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="motivo">Motivo de consulta</label>

          <textarea
            id="motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Describí brevemente el motivo..."
            required
            style={{
              ...estiloCampo,
              minHeight: "90px",
            }}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

        <button
          type="submit"
          disabled={
            guardando ||
            cargandoHorarios ||
            !fecha ||
            !horarios.includes(hora)
          }
          style={{
            padding: "12px 18px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {guardando ? "Reservando..." : "Confirmar Reserva"}
        </button>
      </form>
    </main>
  );
}

export default SolicitarTurnoPaciente;
