
import { useEffect, useRef, useState } from "react";
import "../../styles/bloqueosAgenda.css";

const API = "http://127.0.0.1:8000";

// =====================================================
// CALENDARIO PERSONALIZADO
// =====================================================

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril",
  "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DIAS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

function formatearFechaISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function CalendarioFecha({ value, onChange }) {
  const [abierto, setAbierto] = useState(false);

  const [mesVisible, setMesVisible] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });

  const calendarioRef = useRef(null);

  // Cerrar al hacer clic fuera o presionar Escape
  useEffect(() => {
    const cerrarFuera = (evento) => {
      if (
        calendarioRef.current &&
        !calendarioRef.current.contains(evento.target)
      ) {
        setAbierto(false);
      }
    };

    const cerrarEscape = (evento) => {
      if (evento.key === "Escape") {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", cerrarFuera);
    document.addEventListener("keydown", cerrarEscape);

    return () => {
      document.removeEventListener("mousedown", cerrarFuera);
      document.removeEventListener("keydown", cerrarEscape);
    };
  }, []);

  const cambiarMes = (cantidad) => {
    setMesVisible((anterior) =>
      new Date(
        anterior.getFullYear(),
        anterior.getMonth() + cantidad,
        1
      )
    );
  };

  const seleccionarFecha = (dia) => {
    const seleccionada = new Date(
      mesVisible.getFullYear(),
      mesVisible.getMonth(),
      dia
    );

    onChange(formatearFechaISO(seleccionada));
    setAbierto(false);
  };

  const primerDia = new Date(
    mesVisible.getFullYear(),
    mesVisible.getMonth(),
    1
  );

  const diasEnMes = new Date(
    mesVisible.getFullYear(),
    mesVisible.getMonth() + 1,
    0
  ).getDate();

  const espaciosIniciales = (primerDia.getDay() + 6) % 7;

  const celdas = [
    ...Array(espaciosIniciales).fill(null),
    ...Array.from(
      { length: diasEnMes },
      (_, indice) => indice + 1
    )
  ];

  const hoy = formatearFechaISO(new Date());

  const fechaVisible = value
    ? value.split("-").reverse().join("/")
    : "";

  const abrirCalendario = () => {
    if (!abierto && value) {
      const [anio, mes] = value.split("-").map(Number);

      setMesVisible(new Date(anio, mes - 1, 1));
    }

    setAbierto(!abierto);
  };

  return (
    <div
      ref={calendarioRef}
      style={{
        position: "relative",
        flex: "1 1 0",
        minWidth: 0
      }}
    >
      {/* CAMPO DE FECHA */}

      <button
        type="button"
        onClick={abrirCalendario}
        aria-label="Seleccionar fecha"
        aria-expanded={abierto}
        style={{
          width: "100%",
          minHeight: "44px",
          padding: "10px 14px",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          backgroundColor: "#ffffff",
          color: value ? "#1e293b" : "#94a3b8",
          fontSize: "15px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box"
        }}
      >
        <span>{fechaVisible || "Seleccionar fecha"}</span>
        <span aria-hidden="true">▦</span>
      </button>

      {/* CALENDARIO DESPLEGABLE */}

      {abierto && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: "290px",
            maxWidth: "90vw",
            padding: "14px",
            backgroundColor: "#ffffff",
            border: "1px solid #dbe3ec",
            borderRadius: "12px",
            boxShadow: "0 8px 28px rgba(0,0,0,0.15)",
            zIndex: 1000,
            boxSizing: "border-box"
          }}
        >
          {/* MES Y AÑO */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px"
            }}
          >
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
              style={estilos.botonMes}
              aria-label="Mes anterior"
            >
              ‹
            </button>

            <strong
              style={{
                color: "#17233b",
                fontSize: "15px"
              }}
            >
              {MESES[mesVisible.getMonth()]}{" "}
              {mesVisible.getFullYear()}
            </strong>

            <button
              type="button"
              onClick={() => cambiarMes(1)}
              style={estilos.botonMes}
              aria-label="Mes siguiente"
            >
              ›
            </button>
          </div>

          {/* DÍAS DE LA SEMANA */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "3px"
            }}
          >
            {DIAS.map((dia) => (
              <div
                key={dia}
                style={{
                  textAlign: "center",
                  padding: "7px 0",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#64748b"
                }}
              >
                {dia}
              </div>
            ))}

            {/* DÍAS DEL MES */}

            {celdas.map((dia, indice) => {
              if (dia === null) {
                return <div key={`vacio-${indice}`} />;
              }

              const fechaDia = formatearFechaISO(
                new Date(
                  mesVisible.getFullYear(),
                  mesVisible.getMonth(),
                  dia
                )
              );

              const seleccionado = fechaDia === value;
              const esHoy = fechaDia === hoy;

              return (
                <button
                  key={`dia-${dia}`}
                  type="button"
                  onClick={() => seleccionarFecha(dia)}
                  style={{
                    width: "100%",
                    height: "34px",
                    border: esHoy
                      ? "1px solid #16a6bf"
                      : "1px solid transparent",
                    borderRadius: "7px",
                    backgroundColor: seleccionado
                      ? "#16a6bf"
                      : "#ffffff",
                    color: seleccionado
                      ? "#ffffff"
                      : "#1e293b",
                    fontWeight:
                      seleccionado || esHoy
                        ? "bold"
                        : "normal",
                    fontSize: "13px",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  {dia}
                </button>
              );
            })}
          </div>

          {/* BOTÓN HOY */}

          <button
            type="button"
            onClick={() => {
              const fechaActual = new Date();

              onChange(formatearFechaISO(fechaActual));

              setMesVisible(
                new Date(
                  fechaActual.getFullYear(),
                  fechaActual.getMonth(),
                  1
                )
              );

              setAbierto(false);
            }}
            style={{
              marginTop: "12px",
              width: "100%",
              padding: "10px",
              border: "1px solid #dbe3ec",
              borderRadius: "7px",
              backgroundColor: "#e0f2fe",
              color: "#087fa0",
              fontWeight: "bold",
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            Hoy
          </button>
        </div>
      )}
    </div>
  );
}

// =====================================================
// GESTIÓN DE BLOQUEOS DE AGENDA
// =====================================================

function BloqueosAgenda() {
  const [medicos, setMedicos] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);

  const [idMedico, setIdMedico] = useState("");
  const [fecha, setFecha] = useState("");
  const [diaCompleto, setDiaCompleto] = useState(false);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [motivo, setMotivo] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // VALIDAR HORA EN FORMATO 24 HORAS
  // =====================================================

  const horaValida = (hora) => {
    const formato24Horas = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return formato24Horas.test(hora);
  };

  // =====================================================
  // CARGAR MÉDICOS
  // =====================================================

  const cargarMedicos = async () => {
    try {
      const respuesta = await fetch(`${API}/medicos`);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los médicos");
      }

      const datos = await respuesta.json();
      setMedicos(datos);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los médicos");
    }
  };

  // =====================================================
  // CARGAR BLOQUEOS
  // =====================================================

  const cargarBloqueos = async () => {
    try {
      const respuesta = await fetch(`${API}/bloqueos-agenda`);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los bloqueos");
      }

      const datos = await respuesta.json();
      setBloqueos(datos);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los bloqueos");
    }
  };

  useEffect(() => {
    cargarMedicos();
    cargarBloqueos();
  }, []);

  // =====================================================
  // CREAR BLOQUEO
  // =====================================================

  const crearBloqueo = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!idMedico || !fecha || !motivo.trim()) {
      setError("Completá médico, fecha y motivo");
      return;
    }

    if (!diaCompleto && (!horaInicio || !horaFin)) {
      setError("Indicá la hora de inicio y la hora de fin");
      return;
    }

    if (
      !diaCompleto &&
      (!horaValida(horaInicio) || !horaValida(horaFin))
    ) {
      setError("Ingresá las horas en formato 24 h. Ejemplo: 13:15");
      return;
    }

    if (!diaCompleto && horaInicio >= horaFin) {
      setError("La hora de inicio debe ser anterior a la hora de fin");
      return;
    }

    const nuevoBloqueo = {
      id_medico: Number(idMedico),
      fecha: fecha,
      hora_inicio: diaCompleto ? null : horaInicio,
      hora_fin: diaCompleto ? null : horaFin,
      motivo: motivo.trim(),
      dia_completo: diaCompleto
    };

    try {
      const respuesta = await fetch(`${API}/bloqueos-agenda`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nuevoBloqueo)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudo bloquear la agenda"
        );
      }

      setMensaje("Agenda bloqueada correctamente");

      setFecha("");
      setHoraInicio("");
      setHoraFin("");
      setMotivo("");
      setDiaCompleto(false);

      await cargarBloqueos();
    } catch (error) {
      setError(error.message);
    }
  };

  // =====================================================
  // DESBLOQUEAR
  // =====================================================

  const eliminarBloqueo = async (idBloqueo) => {
    const confirmar = window.confirm(
      "¿Seguro que querés desbloquear esta agenda?"
    );

    if (!confirmar) return;

    setMensaje("");
    setError("");

    try {
      const respuesta = await fetch(
        `${API}/bloqueos-agenda/${idBloqueo}`,
        {
          method: "DELETE"
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudo eliminar el bloqueo"
        );
      }

      setMensaje("Agenda desbloqueada correctamente");

      await cargarBloqueos();
    } catch (error) {
      setError(error.message);
    }
  };

  // =====================================================
  // PANTALLA
  // =====================================================

  return (
    <div className="bloqueos-page">

      <div className="bloqueos-header">
        <h1>Gestión de agenda</h1>

        <p>
          Bloqueá horarios específicos o días completos de los médicos.
        </p>
      </div>

      {/* NUEVO BLOQUEO */}

      <div className="bloqueos-card">
        <h2>Nuevo bloqueo</h2>

        <form
          className="bloqueos-form"
          onSubmit={crearBloqueo}
        >

          {/* MÉDICO */}

          <div className="bloqueos-campo">
            <label>Médico</label>

            <select
              value={idMedico}
              onChange={(e) => setIdMedico(e.target.value)}
            >
              <option value="">Seleccionar médico</option>

              {medicos.map((medico) => (
                <option
                  key={medico.id_medico}
                  value={medico.id_medico}
                >
                  {medico.nombre} {medico.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* FECHA + DÍA COMPLETO */}

          <div className="bloqueos-campo">
            <label>Fecha</label>

            <div className="fecha-con-dia-completo">
              <CalendarioFecha
                value={fecha}
                onChange={setFecha}
              />

              <label className="dia-completo-inline">
                <input
                  type="checkbox"
                  checked={diaCompleto}
                  onChange={(e) => {
                    setDiaCompleto(e.target.checked);

                    if (e.target.checked) {
                      setHoraInicio("");
                      setHoraFin("");
                    }
                  }}
                />

                Día completo
              </label>
            </div>
          </div>

          {/* HORARIOS */}

          {!diaCompleto && (
            <>
              <div className="bloqueos-campo">
                <label>Hora de inicio</label>

                <input
                  type="text"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  placeholder="Ej: 13:15"
                  maxLength="5"
                />
              </div>

              <div className="bloqueos-campo">
                <label>Hora de fin</label>

                <input
                  type="text"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  placeholder="Ej: 13:30"
                  maxLength="5"
                />
              </div>
            </>
          )}

          {/* MOTIVO */}

          <div className="bloqueos-campo bloqueos-campo-completo">
            <label>Motivo</label>

            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Médico no disponible"
            />
          </div>

          {/* BOTÓN */}

          <div className="bloqueos-acciones">
            <button
              className="boton-bloquear"
              type="submit"
            >
              Bloquear agenda
            </button>
          </div>

        </form>

        {mensaje && (
          <p className="mensaje-exito">
            {mensaje}
          </p>
        )}

        {error && (
          <p className="mensaje-error">
            {error}
          </p>
        )}
      </div>

      {/* BLOQUEOS EXISTENTES */}

      <div className="bloqueos-card">
        <h2>Bloqueos existentes</h2>

        {bloqueos.length === 0 ? (
          <p>No hay agendas bloqueadas.</p>
        ) : (
          <div className="bloqueos-tabla-contenedor">
            <table className="bloqueos-tabla">
              <thead>
                <tr>
                  <th>Médico</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Motivo</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {bloqueos.map((bloqueo) => (
                  <tr key={bloqueo.id_bloqueo}>
                    <td>{bloqueo.medico}</td>

                    <td>{bloqueo.fecha}</td>

                    <td>
                      {bloqueo.dia_completo
                        ? "Día completo"
                        : `${bloqueo.hora_inicio} - ${bloqueo.hora_fin}`}
                    </td>

                    <td>{bloqueo.motivo}</td>

                    <td>
                      <button
                        className="boton-desbloquear"
                        type="button"
                        onClick={() =>
                          eliminarBloqueo(bloqueo.id_bloqueo)
                        }
                      >
                        Desbloquear
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// =====================================================
// ESTILOS DEL CALENDARIO
// =====================================================

const estilos = {
  botonMes: {
    width: "30px",
    height: "30px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#f1f5f9",
    color: "#17233b",
    cursor: "pointer",
    fontSize: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0
  }
};

export default BloqueosAgenda;
