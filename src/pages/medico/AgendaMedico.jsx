import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/agendaMedico.css";

const API = "http://127.0.0.1:8000";
const fechaLocal = (f = new Date()) =>
  `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;

function AgendaMedico() {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState([]);
  const [historias, setHistorias] = useState([]);
  const [nombreMedico, setNombreMedico] = useState("Médico");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => fechaLocal());
  const [mesVisible, setMesVisible] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });

  let usuario = null;
  try { usuario = JSON.parse(localStorage.getItem("usuario")); } catch { usuario = null; }
  const idMedico = Number(usuario?.id_medico);

  useEffect(() => {
    if (!idMedico) {
      setError("No se encontró un médico asociado a tu usuario.");
      setCargando(false);
      return;
    }
    let activo = true;
    async function cargar() {
      setCargando(true);
      setError("");
      try {
        const [rTurnos, rMedicos, rHistorias] = await Promise.all([
          fetch(`${API}/turnos`),
          fetch(`${API}/medicos`),
          fetch(`${API}/historias-clinicas`)
        ]);
        if (!rTurnos.ok || !rMedicos.ok || !rHistorias.ok)
          throw new Error("No se pudieron cargar los datos de la agenda.");
        const [t, m, h] = await Promise.all([
          rTurnos.json(), rMedicos.json(), rHistorias.json()
        ]);
        if (!activo) return;
        setTurnos(Array.isArray(t) ? t : []);
        setHistorias(Array.isArray(h) ? h : []);
        const medico = m.find(x => Number(x.id_medico) === idMedico);
        if (medico) setNombreMedico(`${medico.nombre} ${medico.apellido}`);
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    }
    cargar();
    return () => { activo = false; };
  }, [idMedico]);

  const turnosMedico = useMemo(
    () => turnos.filter(t => Number(t.id_medico) === idMedico),
    [turnos, idMedico]
  );
  const turnosDia = useMemo(
    () => turnosMedico.filter(t => String(t.fecha).slice(0, 10) === fechaSeleccionada)
      .sort((a, b) => String(a.hora || "").localeCompare(String(b.hora || ""))),
    [turnosMedico, fechaSeleccionada]
  );
  const fechasOcupadas = useMemo(
    () => new Set(turnosMedico.map(t => String(t.fecha).slice(0, 10))),
    [turnosMedico]
  );
  const idsConHistoria = useMemo(
    () => new Set(historias.map(h => Number(h.id_paciente))),
    [historias]
  );
  const anio = mesVisible.getFullYear();
  const mes = mesVisible.getMonth();
  const inicio = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const cantidad = new Date(anio, mes + 1, 0).getDate();
  const dias = [...Array(inicio).fill(null), ...Array.from({ length: cantidad }, (_, i) => i + 1)];
  const tituloMes = mesVisible.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  const tituloDia = new Date(`${fechaSeleccionada}T12:00:00`).toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  function irHoy() {
    const hoy = new Date();
    setFechaSeleccionada(fechaLocal(hoy));
    setMesVisible(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  }

  return (
    <section className="agenda-medico">
      <div className="agenda-medico-encabezado">
        <div><h1>Mi agenda</h1><p>Consultá los turnos asignados a {nombreMedico}.</p></div>
        <button type="button" className="agenda-medico-hoy" onClick={irHoy}>Ir a hoy</button>
      </div>
      <div className="agenda-medico-contenido">
        <article className="agenda-medico-panel agenda-medico-calendario">
          <div className="agenda-medico-mes">
            <button type="button" onClick={() => setMesVisible(new Date(anio, mes - 1, 1))} aria-label="Mes anterior">‹</button>
            <h2>{tituloMes}</h2>
            <button type="button" onClick={() => setMesVisible(new Date(anio, mes + 1, 1))} aria-label="Mes siguiente">›</button>
          </div>
          <div className="agenda-medico-grilla">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) =>
              <div key={i} className="agenda-medico-dia-semana">{d}</div>
            )}
            {dias.map((dia, i) => {
              if (dia === null) return <div key={`vacio-${i}`} className="agenda-medico-espacio" />;
              const fecha = fechaLocal(new Date(anio, mes, dia));
              const seleccionado = fecha === fechaSeleccionada;
              return (
                <button key={fecha} type="button"
                  className={`agenda-medico-dia ${seleccionado ? "seleccionado" : ""} ${fecha === fechaLocal() ? "actual" : ""}`}
                  aria-pressed={seleccionado}
                  aria-label={`Seleccionar ${fecha}`}
                  onClick={() => setFechaSeleccionada(fecha)}>
                  <span>{dia}</span>
                  {fechasOcupadas.has(fecha) && <span className="agenda-medico-punto" />}
                </button>
              );
            })}
          </div>
          <div className="agenda-medico-leyenda"><span className="agenda-medico-punto" />Días con turnos asignados</div>
        </article>
        <article className="agenda-medico-panel agenda-medico-listado">
          <div className="agenda-medico-listado-header">
            <div><h2>Turnos del día</h2><p>{tituloDia}</p></div>
            <span className="agenda-medico-contador">{turnosDia.length} turnos</span>
          </div>
          {cargando ? <div className="agenda-medico-vacio">Cargando agenda...</div>
            : error ? <div className="agenda-medico-vacio" role="alert">{error}</div>
            : turnosDia.length === 0 ? <div className="agenda-medico-vacio">No tenés turnos asignados para esta fecha.</div>
            : <div className="agenda-medico-turnos">
                {turnosDia.map(turno => {
                  const tieneHistoria = idsConHistoria.has(Number(turno.id_paciente));
                  return (
                    <div key={turno.id_turno} className="agenda-medico-turno">
                      <div className="agenda-medico-turno-superior">
                        <strong className="agenda-medico-hora">{String(turno.hora || "").slice(0, 5)}</strong>
                        <span className="agenda-medico-estado">{turno.estado_recepcion || turno.estado || "Pendiente"}</span>
                      </div>
                      <h3>{turno.paciente || "Paciente"}</h3>
                      <p>{turno.motivo_consulta || "Sin motivo registrado"}</p>
                      <p>{turno.tipo_turno || "Turno programado"}</p>
                      <button type="button" className="agenda-medico-historia"
                        disabled={!turno.id_paciente}
                        onClick={() => navigate(`/medico/historia-clinica?paciente=${encodeURIComponent(turno.id_paciente)}`)}>
                        {tieneHistoria ? "Ver historia clínica" : "Crear historia clínica"}
                      </button>
                    </div>
                  );
                })}
              </div>}
        </article>
      </div>
    </section>
  );
}

export default AgendaMedico;
