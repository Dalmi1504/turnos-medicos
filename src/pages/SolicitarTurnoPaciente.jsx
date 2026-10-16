
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

  const hoy = new Date();
  const fechaMinima = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, "0"),
    String(hoy.getDate()).padStart(2, "0"),
  ].join("-");

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

  // Consultar horarios reales cuando cambia el médico o la fecha
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
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="medico">
            Seleccionar médico
          </label>

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

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="fecha">
            Fecha del turno
          </label>

          <input
            id="fecha"
            type="date"
            min={fechaMinima}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            style={estiloCampo}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
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

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="motivo">
            Motivo de consulta
          </label>

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

        {error && (
          <p style={{ color: "red" }}>{error}</p>
        )}

        {mensaje && (
          <p style={{ color: "green" }}>{mensaje}</p>
        )}

        <button
          type="submit"
          disabled={
            guardando ||
            cargandoHorarios ||
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
          {guardando
            ? "Reservando..."
            : "Confirmar Reserva"}
        </button>
      </form>
    </main>
  );
}

export default SolicitarTurnoPaciente;
