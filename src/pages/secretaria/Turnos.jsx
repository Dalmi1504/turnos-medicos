
import { useEffect, useRef, useState } from "react";
import "../../styles/turnos.css";

const API = "http://127.0.0.1:8000";

function obtenerFechaLocal() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function normalizarTexto(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizarHora(hora) {
  return String(hora || "").slice(0, 5);
}

function obtenerNombreMedico(medico) {
  return `${medico?.nombre || ""} ${medico?.apellido || ""}`.trim();
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin seleccionar";

  return String(fecha)
    .slice(0, 10)
    .split("-")
    .reverse()
    .join("/");
}

function CalendarioDesplegable({ fecha, onChange }) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);

  const [mesVisible, setMesVisible] = useState(() => {
    const [anio, mes] = fecha.split("-").map(Number);
    return new Date(anio, mes - 1, 1);
  });

  useEffect(() => {
    if (!fecha) return;

    const [anio, mes] = fecha.split("-").map(Number);
    setMesVisible(new Date(anio, mes - 1, 1));
  }, [fecha]);

  useEffect(() => {
    if (!abierto) return;

    const cerrarAlHacerClicAfuera = (evento) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target)
      ) {
        setAbierto(false);
      }
    };

    const cerrarConEscape = (evento) => {
      if (evento.key === "Escape") {
        setAbierto(false);
      }
    };

    document.addEventListener(
      "mousedown",
      cerrarAlHacerClicAfuera
    );

    document.addEventListener(
      "keydown",
      cerrarConEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        cerrarAlHacerClicAfuera
      );

      document.removeEventListener(
        "keydown",
        cerrarConEscape
      );
    };
  }, [abierto]);

  const anio = mesVisible.getFullYear();
  const mes = mesVisible.getMonth();

  const cantidadDias = new Date(
    anio,
    mes + 1,
    0
  ).getDate();

  const primerDia =
    (new Date(anio, mes, 1).getDay() + 6) % 7;

  const dias = [
    ...Array(primerDia).fill(null),
    ...Array.from(
      { length: cantidadDias },
      (_, indice) => indice + 1
    )
  ];

  const cambiarMes = (cantidad) => {
    setMesVisible(
      new Date(anio, mes + cantidad, 1)
    );
  };

  const seleccionarDia = (dia) => {
    const fechaElegida =
      `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

    onChange(fechaElegida);
    setAbierto(false);
  };

  const estiloNavegacion = {
    padding: "9px 13px",
    border: "1px solid #dbe3ed",
    borderRadius: "8px",
    background: "#f8fafc",
    cursor: "pointer",
    color: "#243447",
    fontSize: "14px"
  };

  return (
    <div
      ref={contenedorRef}
      style={{
        position: "relative",
        width: "100%"
      }}
    >
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-expanded={abierto}
        aria-label="Seleccionar fecha de turnos"
        style={{
          width: "100%",
          height: "42px",
          padding: "10px 14px",
          border: "1px solid #cbd5e1",
          borderRadius: "7px",
          background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
          cursor: "pointer",
          color: "#243447",
          fontSize: "15px"
        }}
      >
        <span>{formatearFecha(fecha)}</span>
        <span>📅</span>
      </button>

      {abierto && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: "350px",
            maxWidth: "calc(100vw - 40px)",
            padding: "18px",
            borderRadius: "12px",
            background: "#fff",
            border: "1px solid #dbe3ed",
            boxShadow:
              "0 12px 32px rgba(0,0,0,0.16)",
            zIndex: 1000,
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
              marginBottom: "18px"
            }}
          >
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
              style={estiloNavegacion}
              aria-label="Mes anterior"
            >
              ◀
            </button>

            <strong
              style={{
                textTransform: "capitalize",
                fontSize: "16px",
                color: "#243447"
              }}
            >
              {mesVisible.toLocaleDateString("es-AR", {
                month: "long",
                year: "numeric"
              })}
            </strong>

            <button
              type="button"
              onClick={() => cambiarMes(1)}
              style={estiloNavegacion}
              aria-label="Mes siguiente"
            >
              ▶
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(7, minmax(0, 1fr))",
              gap: "5px",
              textAlign: "center"
            }}
          >
            {["L", "M", "M", "J", "V", "S", "D"].map(
              (nombre, indice) => (
                <strong
                  key={`semana-${indice}`}
                  style={{
                    padding: "8px 0",
                    color: "#64748b",
                    fontSize: "13px"
                  }}
                >
                  {nombre}
                </strong>
              )
            )}

            {dias.map((dia, indice) => {
              if (dia === null) {
                return (
                  <span key={`vacio-${indice}`} />
                );
              }

              const fechaDia =
                `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

              const seleccionado =
                fechaDia === fecha;

              const esHoy =
                fechaDia === obtenerFechaLocal();

              return (
                <button
                  key={fechaDia}
                  type="button"
                  onClick={() => seleccionarDia(dia)}
                  aria-label={`Seleccionar ${dia} de ${mes + 1} de ${anio}`}
                  style={{
                    height: "40px",
                    borderRadius: "8px",
                    border: esHoy
                      ? "2px solid #0ea5e9"
                      : "1px solid transparent",
                    background: seleccionado
                      ? "#0ea5e9"
                      : "#f1f5f9",
                    color: seleccionado
                      ? "#fff"
                      : "#243447",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  {dia}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              onChange(obtenerFechaLocal());
              setAbierto(false);
            }}
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "11px",
              background: "#e0f2fe",
              border: "none",
              borderRadius: "7px",
              color: "#0369a1",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Ir a hoy
          </button>
        </div>
      )}
    </div>
  );
}

function Turnos() {
  const [fechaSeleccionada, setFechaSeleccionada] =
    useState(obtenerFechaLocal);

  const [modoVista, setModoVista] = useState("agenda");
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [idPacienteSeleccionado, setIdPacienteSeleccionado] = useState("");
  const [medicoFiltro, setMedicoFiltro] = useState("");
  const [especialidadFiltro, setEspecialidadFiltro] =
    useState("");

  const [turnos, setTurnos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [estados, setEstados] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [errores, setErrores] = useState({});
  const [idEditando, setIdEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [turnoSeleccionado, setTurnoSeleccionado] =
    useState(null);

  const [
    observacionTemporal,
    setObservacionTemporal
  ] = useState("");

  const [
    horariosDisponibles,
    setHorariosDisponibles
  ] = useState([]);

  const [
    cargandoHorarios,
    setCargandoHorarios
  ] = useState(false);

  const [nuevoTurno, setNuevoTurno] = useState({
    id_paciente: "",
    id_medico: "",
    motivo_consulta: "",
    fecha: "",
    hora: "",
    estado: "",
    observaciones: ""
  });

  const tiposTurno = [
    "Primera consulta",
    "Consulta",
    "Preoperatorio",
    "Postoperatorio"
  ];

  // ==========================================
  // CARGA DE DATOS
  // ==========================================

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
    } catch (error) {
      console.error(
        "Error al obtener turnos:",
        error
      );
    }
  };

  const cargarPacientes = async () => {
    try {
      const respuesta = await fetch(`${API}/pacientes`);

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron obtener los pacientes."
        );
      }

      const datos = await respuesta.json();

      // Conservar también pacientes inactivos para consultar turnos históricos.
      setPacientes(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error(
        "Error al obtener pacientes:",
        error
      );
    }
  };

  const cargarMedicos = async () => {
    try {
      const respuesta = await fetch(`${API}/medicos`);

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron obtener los médicos."
        );
      }

      const datos = await respuesta.json();

      setMedicos(
        Array.isArray(datos) ? datos : []
      );
    } catch (error) {
      console.error(
        "Error al obtener médicos:",
        error
      );
    }
  };

  const cargarEstados = async () => {
    try {
      const respuesta = await fetch(
        `${API}/estados-turno`
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron obtener los estados."
        );
      }

      const datos = await respuesta.json();

      setEstados(
        Array.isArray(datos) ? datos : []
      );
    } catch (error) {
      console.error(
        "Error al obtener estados:",
        error
      );
    }
  };

  const cargarHorariosDisponibles = async (
    idMedico,
    fecha
  ) => {
    if (!idMedico || !fecha) {
      setHorariosDisponibles([]);
      return;
    }

    setCargandoHorarios(true);

    try {
      const parametros = new URLSearchParams({
        id_medico: String(idMedico),
        fecha
      });

      const respuesta = await fetch(
        `${API}/horarios-disponibles?${parametros}`
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron obtener los horarios."
        );
      }

      const datos = await respuesta.json();

      setHorariosDisponibles(
        Array.isArray(datos.horarios)
          ? datos.horarios
          : []
      );
    } catch (error) {
      console.error(
        "Error al obtener horarios:",
        error
      );

      setHorariosDisponibles([]);
    } finally {
      setCargandoHorarios(false);
    }
  };

  useEffect(() => {
    cargarTurnos();
    cargarPacientes();
    cargarMedicos();
    cargarEstados();
  }, []);

  useEffect(() => {
    if (
      nuevoTurno.id_medico &&
      nuevoTurno.fecha
    ) {
      cargarHorariosDisponibles(
        nuevoTurno.id_medico,
        nuevoTurno.fecha
      );
    } else {
      setHorariosDisponibles([]);
    }
  }, [
    nuevoTurno.id_medico,
    nuevoTurno.fecha
  ]);

  // ==========================================
  // FILTROS
  // ==========================================

  const especialidadesDisponibles = [
    ...new Set(
      medicos
        .map((medico) => medico.especialidad)
        .filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b, "es"));

  const turnosFiltrados = turnos
    .filter((turno) => {
      const coincideFecha =
        String(turno.fecha || "").slice(0, 10) ===
        fechaSeleccionada;

      // Buscamos los datos completos del médico
      // para poder acceder a su especialidad.

      const medicoDelTurno = medicos.find(
        (medico) =>
          Number(medico.id_medico) ===
          Number(turno.id_medico)
      );

      const nombreMedicoCompleto =
        obtenerNombreMedico(
          medicoDelTurno || {}
        );

      const especialidadDelTurno =
        medicoDelTurno?.especialidad || "";

      // Filtro desplegable de médico.

      const coincideMedico =
        !medicoFiltro ||
        Number(turno.id_medico) ===
          Number(medicoFiltro);

      // Filtro desplegable de especialidad.

      const coincideEspecialidad =
        !especialidadFiltro ||
        normalizarTexto(
          especialidadDelTurno
        ) ===
          normalizarTexto(
            especialidadFiltro
          );

      // Todos los filtros se combinan.

      return (
        coincideFecha &&
        coincideMedico &&
        coincideEspecialidad
      );
    })
    .sort((a, b) => {
      const comparacionHora =
        normalizarHora(a.hora).localeCompare(
          normalizarHora(b.hora)
        );

      if (comparacionHora !== 0) {
        return comparacionHora;
      }

      return String(
        a.medico || ""
      ).localeCompare(
        String(b.medico || ""),
        "es"
      );
    });

  // Búsqueda histórica: no depende de fecha, médico ni especialidad.
  const pacientesCoincidentes = busquedaPaciente.trim()
    ? pacientes.filter((paciente) => {
        const texto = normalizarTexto(busquedaPaciente);
        return (
          normalizarTexto(`${paciente.nombre} ${paciente.apellido}`).includes(texto) ||
          normalizarTexto(`${paciente.apellido} ${paciente.nombre}`).includes(texto) ||
          String(paciente.dni ?? "").includes(busquedaPaciente.trim())
        );
      }).sort((a, b) =>
        `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es")
      )
    : [];

  const pacienteSeleccionado = pacientes.find(
    (paciente) => String(paciente.id_paciente) === idPacienteSeleccionado
  );

  const turnosDelPaciente = idPacienteSeleccionado
    ? turnos.filter(
        (turno) => String(turno.id_paciente) === idPacienteSeleccionado
      ).sort((a, b) => {
        const fechaA = `${String(a.fecha || "").slice(0, 10)} ${normalizarHora(a.hora)}`;
        const fechaB = `${String(b.fecha || "").slice(0, 10)} ${normalizarHora(b.hora)}`;
        return fechaB.localeCompare(fechaA);
      })
    : [];

  const medicoSeleccionado = medicos.find(
    (medico) =>
      String(medico.id_medico) ===
      medicoFiltro
  );

  const nombreMedicoSeleccionado =
    medicoSeleccionado
      ? obtenerNombreMedico(
          medicoSeleccionado
        )
      : "Todos los médicos";

  // ==========================================
  // FORMULARIO
  // ==========================================

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setNuevoTurno((actual) => ({
      ...actual,
      [name]: value,
      ...(name === "id_medico" ||
      name === "fecha"
        ? { hora: "" }
        : {})
    }));

    setErrores((actual) => ({
      ...actual,
      [name]: "",
      turno: ""
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!nuevoTurno.id_paciente) {
      nuevosErrores.id_paciente =
        "Seleccioná un paciente.";
    }

    if (!nuevoTurno.id_medico) {
      nuevosErrores.id_medico =
        "Seleccioná un médico.";
    }

    if (!nuevoTurno.motivo_consulta) {
      nuevosErrores.motivo_consulta =
        "Seleccioná un tipo de turno.";
    }

    if (!nuevoTurno.fecha) {
      nuevosErrores.fecha =
        "Seleccioná una fecha.";
    }

    if (!nuevoTurno.hora) {
      nuevosErrores.hora =
        "Seleccioná un horario disponible.";
    }

    if (!nuevoTurno.estado) {
      nuevosErrores.estado =
        "Seleccioná un estado.";
    }

    const medicoOcupado = turnos.some(
      (turno) =>
        Number(turno.id_turno) !==
          Number(idEditando) &&
        Number(turno.id_medico) ===
          Number(nuevoTurno.id_medico) &&
        String(turno.fecha).slice(0, 10) ===
          nuevoTurno.fecha &&
        normalizarHora(turno.hora) ===
          nuevoTurno.hora &&
        turno.estado !== "Cancelado"
    );

    if (medicoOcupado) {
      nuevosErrores.turno =
        "El médico ya tiene un turno asignado en esa fecha y hora.";
    }

    setErrores(nuevosErrores);

    return (
      Object.keys(nuevosErrores).length === 0
    );
  };

  const abrirNuevoTurno = () => {
    setIdEditando(null);

    setNuevoTurno({
      id_paciente: "",
      id_medico: "",
      motivo_consulta: "",
      fecha: fechaSeleccionada,
      hora: "",
      estado:
        estados.length > 0
          ? estados[0].descripcion
          : "",
      observaciones: ""
    });

    setHorariosDisponibles([]);
    setErrores({});
    setMostrarFormulario(true);
  };

  const editarTurno = (turno) => {
    setIdEditando(turno.id_turno);

    setNuevoTurno({
      id_paciente: String(
        turno.id_paciente
      ),
      id_medico: String(
        turno.id_medico
      ),
      motivo_consulta:
        turno.motivo_consulta || "",
      fecha: String(
        turno.fecha || ""
      ).slice(0, 10),
      hora: normalizarHora(
        turno.hora
      ),
      estado: turno.estado || "",
      observaciones:
        turno.observaciones || ""
    });

    setErrores({});
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setIdEditando(null);

    setNuevoTurno({
      id_paciente: "",
      id_medico: "",
      motivo_consulta: "",
      fecha: "",
      hora: "",
      estado: "",
      observaciones: ""
    });

    setHorariosDisponibles([]);
    setErrores({});
  };

  // ==========================================
  // GUARDAR TURNO
  // ==========================================

  const guardarTurno = async (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) return;

    const turnoParaEnviar = {
      fecha: nuevoTurno.fecha,
      hora: nuevoTurno.hora,
      motivo_consulta:
        nuevoTurno.motivo_consulta,
      id_paciente: Number(
        nuevoTurno.id_paciente
      ),
      id_medico: Number(
        nuevoTurno.id_medico
      ),
      estado: nuevoTurno.estado,
      observaciones:
        nuevoTurno.observaciones || null
    };

    setGuardando(true);

    try {
      const respuesta = await fetch(
        idEditando
          ? `${API}/turnos/${idEditando}`
          : `${API}/turnos`,
        {
          method: idEditando
            ? "PUT"
            : "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(
            turnoParaEnviar
          )
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          typeof datos.detail === "string"
            ? datos.detail
            : "No se pudo guardar el turno."
        );
      }

      await cargarTurnos();

      setFechaSeleccionada(
        nuevoTurno.fecha
      );

      cerrarFormulario();
    } catch (error) {
      console.error(
        "Error al guardar turno:",
        error
      );

      setErrores((actual) => ({
        ...actual,
        turno: error.message
      }));
    } finally {
      setGuardando(false);
    }
  };

  // ==========================================
  // CANCELAR TURNO
  // ==========================================

  const cancelarTurno = async (turno) => {
    if (
      !window.confirm(
        "¿Querés cancelar este turno?"
      )
    ) {
      return;
    }

    const turnoParaEnviar = {
      fecha: turno.fecha,
      hora: normalizarHora(
        turno.hora
      ),
      motivo_consulta:
        turno.motivo_consulta,
      id_paciente: Number(
        turno.id_paciente
      ),
      id_medico: Number(
        turno.id_medico
      ),
      estado: "Cancelado",
      observaciones:
        turno.observaciones || null
    };

    try {
      const respuesta = await fetch(
        `${API}/turnos/${turno.id_turno}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(
            turnoParaEnviar
          )
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

      await cargarTurnos();
    } catch (error) {
      console.error(
        "Error al cancelar turno:",
        error
      );

      alert(error.message);
    }
  };

  // ==========================================
  // VER TURNO
  // ==========================================

  const verTurno = (turno) => {
    setTurnoSeleccionado(turno);

    setObservacionTemporal(
      turno.observaciones || ""
    );
  };

  const cerrarDetalle = () => {
    setTurnoSeleccionado(null);
    setObservacionTemporal("");
  };

  // ==========================================
  // GUARDAR OBSERVACIÓN
  // ==========================================

  const guardarObservacion = async () => {
    if (!turnoSeleccionado) return;

    const turnoParaEnviar = {
      fecha: turnoSeleccionado.fecha,
      hora: normalizarHora(
        turnoSeleccionado.hora
      ),
      motivo_consulta:
        turnoSeleccionado.motivo_consulta,
      id_paciente: Number(
        turnoSeleccionado.id_paciente
      ),
      id_medico: Number(
        turnoSeleccionado.id_medico
      ),
      estado:
        turnoSeleccionado.estado,
      observaciones:
        observacionTemporal || null
    };

    try {
      const respuesta = await fetch(
        `${API}/turnos/${turnoSeleccionado.id_turno}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(
            turnoParaEnviar
          )
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          typeof datos.detail === "string"
            ? datos.detail
            : "No se pudo guardar la observación."
        );
      }

      await cargarTurnos();

      setTurnoSeleccionado({
        ...turnoSeleccionado,
        observaciones:
          observacionTemporal
      });

      alert("Observación guardada.");
    } catch (error) {
      console.error(
        "Error al guardar observación:",
        error
      );

      alert(error.message);
    }
  };

  // ==========================================
  // ESTILOS
  // ==========================================

  const estiloFiltro = {
    width: "100%",
    height: "42px",
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    background: "#fff",
    boxSizing: "border-box"
  };

  const estiloEtiqueta = {
    display: "block",
    marginBottom: "7px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155"
  };

  // ==========================================
  // PANTALLA
  // ==========================================

  return (
    <section className="turnos-page">
      {/* ESTILOS PARA IMPRESIÓN */}

      <style>
        {`
          @media print {
            @page {
              size: A4 landscape;
              margin: 12mm;
            }

            body * {
              visibility: hidden !important;
            }

            .turnos-grilla-imprimible,
            .turnos-grilla-imprimible * {
              visibility: visible !important;
            }

            .turnos-grilla-imprimible {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              color: black !important;
            }

            .turnos-no-imprimir,
            .turnos-no-imprimir * {
              display: none !important;
              visibility: hidden !important;
            }

            .turnos-table-container {
              overflow: visible !important;
              width: 100% !important;
            }

            .turnos-table {
              width: 100% !important;
              border-collapse: collapse !important;
              font-size: 11px !important;
              color: black !important;
            }

            .turnos-table th,
            .turnos-table td {
              border: 1px solid #aaa !important;
              padding: 8px !important;
              background: white !important;
              color: black !important;
            }

            .turnos-table thead {
              display: table-header-group;
            }

            .turnos-table tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .turnos-grilla-encabezado {
              margin-bottom: 15px !important;
            }
          }
        `}
      </style>

      {/* ENCABEZADO */}

      <div className="turnos-header">
        <div>
          <h1>Turnos</h1>
          <p>
            Gestión de turnos médicos de UCBA.
          </p>
        </div>

        <button
          type="button"
          className="turnos-btn-primary"
          onClick={abrirNuevoTurno}
        >
          + Nuevo turno
        </button>
      </div>

      {/* ==================================
          FORMULARIO NUEVO / EDITAR
      ================================== */}

      {mostrarFormulario && (
        <form
          className="turno-form"
          onSubmit={guardarTurno}
        >
          <div className="turno-form-header">
            <h2>
              {idEditando
                ? "Editar turno"
                : "Nuevo turno"}
            </h2>

            <button
              type="button"
              className="turno-btn-cerrar"
              onClick={cerrarFormulario}
            >
              ×
            </button>
          </div>

          <div className="turno-form-grid">
            {/* PACIENTE */}

            <div className="turno-form-group">
              <label htmlFor="id_paciente">
                Paciente
              </label>

              <select
                id="id_paciente"
                name="id_paciente"
                value={
                  nuevoTurno.id_paciente
                }
                onChange={manejarCambio}
              >
                <option value="">
                  Seleccionar paciente
                </option>

                {pacientes.filter((paciente) =>
                  Boolean(paciente.activo) ||
                  (idEditando && String(paciente.id_paciente) === nuevoTurno.id_paciente)
                ).map((paciente) => (
                  <option
                    key={
                      paciente.id_paciente
                    }
                    value={
                      paciente.id_paciente
                    }
                  >
                    {paciente.nombre}{" "}
                    {paciente.apellido}
                  </option>
                ))}
              </select>

              {errores.id_paciente && (
                <span className="turno-error">
                  {errores.id_paciente}
                </span>
              )}
            </div>

            {/* MÉDICO */}

            <div className="turno-form-group">
              <label htmlFor="id_medico">
                Médico
              </label>

              <select
                id="id_medico"
                name="id_medico"
                value={
                  nuevoTurno.id_medico
                }
                onChange={manejarCambio}
              >
                <option value="">
                  Seleccionar médico
                </option>

                {medicos.map((medico) => (
                  <option
                    key={
                      medico.id_medico
                    }
                    value={
                      medico.id_medico
                    }
                  >
                    {obtenerNombreMedico(
                      medico
                    )}
                  </option>
                ))}
              </select>

              {errores.id_medico && (
                <span className="turno-error">
                  {errores.id_medico}
                </span>
              )}
            </div>

            {/* TIPO DE TURNO */}

            <div className="turno-form-group">
              <label htmlFor="motivo_consulta">
                Tipo de turno
              </label>

              <select
                id="motivo_consulta"
                name="motivo_consulta"
                value={
                  nuevoTurno.motivo_consulta
                }
                onChange={manejarCambio}
              >
                <option value="">
                  Seleccionar tipo
                </option>

                {tiposTurno.map((tipo) => (
                  <option
                    key={tipo}
                    value={tipo}
                  >
                    {tipo}
                  </option>
                ))}
              </select>

              {errores.motivo_consulta && (
                <span className="turno-error">
                  {errores.motivo_consulta}
                </span>
              )}
            </div>

            {/* FECHA */}

            <div className="turno-form-group">
              <label htmlFor="fecha">
                Fecha
              </label>

              <input
                id="fecha"
                name="fecha"
                type="date"
                value={nuevoTurno.fecha}
                onChange={manejarCambio}
              />

              {errores.fecha && (
                <span className="turno-error">
                  {errores.fecha}
                </span>
              )}
            </div>

            {/* HORARIO */}

            <div className="turno-form-group">
              <label htmlFor="hora">
                Hora disponible
              </label>

              <select
                id="hora"
                name="hora"
                value={nuevoTurno.hora}
                onChange={manejarCambio}
                disabled={
                  !nuevoTurno.id_medico ||
                  !nuevoTurno.fecha ||
                  cargandoHorarios
                }
              >
                <option value="">
                  {!nuevoTurno.id_medico
                    ? "Primero seleccioná un médico"
                    : !nuevoTurno.fecha
                      ? "Primero seleccioná una fecha"
                      : cargandoHorarios
                        ? "Buscando horarios..."
                        : horariosDisponibles.length === 0
                          ? "No hay horarios disponibles"
                          : "Seleccionar horario"}
                </option>

                {idEditando &&
                  nuevoTurno.hora &&
                  !horariosDisponibles.some(
                    (hora) =>
                      normalizarHora(
                        hora
                      ) === nuevoTurno.hora
                  ) && (
                    <option
                      value={
                        nuevoTurno.hora
                      }
                    >
                      {nuevoTurno.hora}{" "}
                      (horario actual)
                    </option>
                  )}

                {horariosDisponibles.map(
                  (hora) => (
                    <option
                      key={hora}
                      value={normalizarHora(
                        hora
                      )}
                    >
                      {normalizarHora(
                        hora
                      )}
                    </option>
                  )
                )}
              </select>

              {errores.hora && (
                <span className="turno-error">
                  {errores.hora}
                </span>
              )}
            </div>

            {/* ESTADO */}

            <div className="turno-form-group">
              <label htmlFor="estado">
                Estado
              </label>

              <select
                id="estado"
                name="estado"
                value={nuevoTurno.estado}
                onChange={manejarCambio}
              >
                <option value="">
                  Seleccionar estado
                </option>

                {estados.map((estado) => (
                  <option
                    key={
                      estado.id_estado
                    }
                    value={
                      estado.descripcion
                    }
                  >
                    {estado.descripcion}
                  </option>
                ))}
              </select>

              {errores.estado && (
                <span className="turno-error">
                  {errores.estado}
                </span>
              )}
            </div>
          </div>

          {/* OBSERVACIONES */}

          <div className="turno-form-group">
            <label htmlFor="observaciones-form">
              Observaciones
            </label>

            <textarea
              id="observaciones-form"
              name="observaciones"
              rows="3"
              value={
                nuevoTurno.observaciones
              }
              onChange={manejarCambio}
              placeholder="Ej: Recordar solicitar estudios anteriores..."
            />
          </div>

          {errores.turno && (
            <div className="turno-error-general">
              {errores.turno}
            </div>
          )}

          <div className="turno-form-actions">
            <button
              type="button"
              className="turnos-btn-secondary"
              onClick={cerrarFormulario}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="turnos-btn-primary"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : idEditando
                  ? "Guardar cambios"
                  : "Guardar turno"}
            </button>
          </div>
        </form>
      )}

      {/* PESTAÑAS INDEPENDIENTES */}
      <div className="turnos-no-imprimir" style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button type="button" onClick={() => setModoVista("agenda")}
          aria-pressed={modoVista === "agenda"}
          className={modoVista === "agenda" ? "turnos-btn-primary" : "turnos-btn-secondary"}>
          Agenda diaria
        </button>
        <button type="button" onClick={() => setModoVista("paciente")}
          aria-pressed={modoVista === "paciente"}
          className={modoVista === "paciente" ? "turnos-btn-primary" : "turnos-btn-secondary"}>
          Buscar paciente
        </button>
      </div>

      {modoVista === "agenda" && (
        <>
      {/* ==================================
          FILTROS DE LA GRILLA
      ================================== */}

      <div
        className="turnos-filtros"
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          marginBottom: "20px",
          overflow: "visible"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "15px",
            alignItems: "start"
          }}
        >
          {/* FECHA */}

          <div>
            <label style={estiloEtiqueta}>
              Fecha de los turnos
            </label>

            <CalendarioDesplegable
              fecha={fechaSeleccionada}
              onChange={
                setFechaSeleccionada
              }
            />


          </div>

          {/* FILTRO MÉDICO */}

          <div>
            <label
              htmlFor="medico-filtro"
              style={estiloEtiqueta}
            >
              Médico
            </label>

            <select
              id="medico-filtro"
              value={medicoFiltro}
              onChange={(evento) =>
                setMedicoFiltro(
                  evento.target.value
                )
              }
              style={estiloFiltro}
            >
              <option value="">
                Todos los médicos
              </option>

              {medicos.map((medico) => (
                <option
                  key={
                    medico.id_medico
                  }
                  value={
                    medico.id_medico
                  }
                >
                  {obtenerNombreMedico(
                    medico
                  )}
                </option>
              ))}
            </select>
          </div>

          {/* FILTRO ESPECIALIDAD */}

          <div>
            <label
              htmlFor="especialidad-filtro"
              style={estiloEtiqueta}
            >
              Especialidad
            </label>

            <select
              id="especialidad-filtro"
              value={
                especialidadFiltro
              }
              onChange={(evento) =>
                setEspecialidadFiltro(
                  evento.target.value
                )
              }
              style={estiloFiltro}
            >
              <option value="">
                Todas las especialidades
              </option>

              {especialidadesDisponibles.map(
                (especialidad) => (
                  <option
                    key={
                      especialidad
                    }
                    value={
                      especialidad
                    }
                  >
                    {especialidad}
                  </option>
                )
              )}
            </select>
          </div>

        </div>
      </div>

      {/* ==================================
          GRILLA DIARIA DE TURNOS
      ================================== */}

      <div className="turnos-grilla-imprimible">
        <div
          className="turnos-grilla-encabezado"
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "18px"
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 8px",
                color: "#243447"
              }}
            >
              Grilla diaria de turnos
            </h2>

            <p
              style={{
                margin: "0 0 5px",
                color: "#475569"
              }}
            >
              <strong>
                Fecha:
              </strong>{" "}
              {formatearFecha(
                fechaSeleccionada
              )}
            </p>

            <p
              style={{
                margin: "0 0 5px",
                color: "#475569",
                fontSize: "13px"
              }}
            >
              <strong>
                Médico:
              </strong>{" "}
              {nombreMedicoSeleccionado}
            </p>

            <p
              style={{
                margin: 0,
                color: "#475569",
                fontSize: "13px"
              }}
            >
              <strong>
                Especialidad:
              </strong>{" "}
              {especialidadFiltro ||
                "Todas"}

              {" | "}

              <strong>
                Total:
              </strong>{" "}
              {turnosFiltrados.length}{" "}
              turnos
            </p>


          </div>

          <button
            type="button"
            className="turnos-btn-primary turnos-no-imprimir"
            onClick={() =>
              window.print()
            }
          >
            🖨 Imprimir grilla
          </button>
        </div>

        <div className="turnos-table-container">
          <table className="turnos-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th className="turnos-no-imprimir">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {turnosFiltrados.map(
                (turno) => (
                  <tr
                    key={
                      turno.id_turno
                    }
                  >
                    <td>
                      <strong>
                        {normalizarHora(
                          turno.hora
                        )}
                      </strong>
                    </td>

                    <td>
                      {turno.paciente}
                    </td>

                    <td>
                      {turno.medico}
                    </td>

                    <td>
                      {
                        turno.motivo_consulta
                      }
                    </td>

                    <td>
                      {turno.estado}
                    </td>

                    <td className="turnos-no-imprimir">
                      <button
                        type="button"
                        className="turno-btn-action"
                        onClick={() =>
                          verTurno(
                            turno
                          )
                        }
                      >
                        Ver
                      </button>

                      <button
                        type="button"
                        className="turno-btn-action"
                        onClick={() =>
                          editarTurno(
                            turno
                          )
                        }
                      >
                        Editar
                      </button>

                      {turno.estado !==
                        "Cancelado" && (
                        <button
                          type="button"
                          className="turno-btn-action"
                          onClick={() =>
                            cancelarTurno(
                              turno
                            )
                          }
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              )}

              {turnosFiltrados.length ===
                0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign:
                        "center",
                      padding: "25px",
                      color: "#64748b"
                    }}
                  >
                    No hay turnos para
                    la fecha y los filtros
                    seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

        </>
      )}

      {modoVista === "paciente" && (
        <div>
          <div className="turnos-filtros" style={{ background: "#fff", padding: "20px", border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "20px" }}>
            <label htmlFor="buscar-paciente-historico" style={estiloEtiqueta}>
              Buscar paciente por nombre, apellido o DNI
            </label>
            <input id="buscar-paciente-historico" type="search"
              value={busquedaPaciente}
              onChange={(evento) => {
                setBusquedaPaciente(evento.target.value);
                setIdPacienteSeleccionado("");
              }}
              placeholder="Ej.: García, María o 30123456"
              style={{ ...estiloFiltro, maxWidth: "520px" }}
            />
            {!idPacienteSeleccionado && busquedaPaciente.trim() && (
              <div style={{ marginTop: "12px", maxWidth: "520px", maxHeight: "250px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                {pacientesCoincidentes.length ? pacientesCoincidentes.map((paciente) => (
                  <button key={paciente.id_paciente} type="button"
                    onClick={() => {
                      setIdPacienteSeleccionado(String(paciente.id_paciente));
                      setBusquedaPaciente(`${paciente.nombre} ${paciente.apellido}`);
                    }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "12px", border: "none", borderBottom: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#243447" }}>
                    <strong>{paciente.nombre} {paciente.apellido}</strong>
                    {paciente.dni ? ` — DNI: ${paciente.dni}` : ""}
                  </button>
                )) : <p style={{ padding: "12px", color: "#64748b" }}>No se encontraron pacientes.</p>}
              </div>
            )}
            {pacienteSeleccionado && (
              <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span><strong>Paciente seleccionado:</strong> {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido} {pacienteSeleccionado.dni ? `· DNI ${pacienteSeleccionado.dni}` : ""}</span>
                <button type="button" className="turnos-btn-secondary" onClick={() => {
                  setIdPacienteSeleccionado("");
                  setBusquedaPaciente("");
                }}>Limpiar búsqueda</button>
              </div>
            )}
          </div>

          <div className="turnos-grilla-imprimible">
            <div className="turnos-grilla-encabezado" style={{ marginBottom: "18px" }}>
              <h2 style={{ color: "#243447", marginBottom: "8px" }}>Historial de turnos por paciente</h2>
              {pacienteSeleccionado && (
                <p style={{ color: "#475569" }}>
                  {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido} · Total: {turnosDelPaciente.length} turnos
                </p>
              )}
            </div>
            <div className="turnos-table-container">
              <table className="turnos-table">
                <thead><tr>
                  <th>Fecha</th><th>Hora</th><th>Médico</th><th>Especialidad</th>
                  <th>Tipo</th><th>Estado</th><th className="turnos-no-imprimir">Acciones</th>
                </tr></thead>
                <tbody>
                  {turnosDelPaciente.map((turno) => {
                    const medico = medicos.find((item) => Number(item.id_medico) === Number(turno.id_medico));
                    return (
                      <tr key={turno.id_turno}>
                        <td>{formatearFecha(turno.fecha)}</td>
                        <td><strong>{normalizarHora(turno.hora)}</strong></td>
                        <td>{turno.medico || obtenerNombreMedico(medico)}</td>
                        <td>{medico?.especialidad || "—"}</td>
                        <td>{turno.motivo_consulta}</td>
                        <td>{turno.estado}</td>
                        <td className="turnos-no-imprimir">
                          <button type="button" className="turno-btn-action" onClick={() => verTurno(turno)}>Ver</button>
                          <button type="button" className="turno-btn-action" onClick={() => editarTurno(turno)}>Editar</button>
                          {turno.estado !== "Cancelado" && (
                            <button type="button" className="turno-btn-action" onClick={() => cancelarTurno(turno)}>Cancelar</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {turnosDelPaciente.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: "center", padding: "25px", color: "#64748b" }}>
                      {pacienteSeleccionado ? "Este paciente no tiene turnos registrados." : "Buscá y seleccioná un paciente para ver sus turnos."}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================
          MODAL DE DETALLE DEL TURNO
      ================================== */}

      {turnoSeleccionado && (
        <div className="turno-modal-overlay">
          <div className="turno-modal">
            <div className="turno-modal-header">
              <div>
                <h2>
                  Detalle del turno
                </h2>

                <p>
                  {
                    turnoSeleccionado.paciente
                  }
                </p>
              </div>

              <button
                type="button"
                className="turno-btn-cerrar"
                onClick={cerrarDetalle}
              >
                ×
              </button>
            </div>

            <div className="turno-detalle-grid">
              <div className="turno-detalle-item">
                <span>
                  Paciente
                </span>

                <strong>
                  {
                    turnoSeleccionado.paciente
                  }
                </strong>
              </div>

              <div className="turno-detalle-item">
                <span>
                  Médico
                </span>

                <strong>
                  {
                    turnoSeleccionado.medico
                  }
                </strong>
              </div>

              <div className="turno-detalle-item">
                <span>
                  Tipo de turno
                </span>

                <strong>
                  {
                    turnoSeleccionado.motivo_consulta
                  }
                </strong>
              </div>

              <div className="turno-detalle-item">
                <span>
                  Fecha
                </span>

                <strong>
                  {formatearFecha(
                    turnoSeleccionado.fecha
                  )}
                </strong>
              </div>

              <div className="turno-detalle-item">
                <span>
                  Hora
                </span>

                <strong>
                  {normalizarHora(
                    turnoSeleccionado.hora
                  )}
                </strong>
              </div>

              <div className="turno-detalle-item">
                <span>
                  Estado
                </span>

                <strong>
                  {
                    turnoSeleccionado.estado
                  }
                </strong>
              </div>
            </div>

            <div className="turno-observaciones">
              <label htmlFor="observaciones">
                Observaciones del turno
              </label>

              <textarea
                id="observaciones"
                rows="4"
                value={
                  observacionTemporal
                }
                onChange={(evento) =>
                  setObservacionTemporal(
                    evento.target.value
                  )
                }
                placeholder="Ej: Recordar solicitar estudios anteriores..."
              />

              <p className="turno-observaciones-ayuda">
                Usar para notas
                administrativas del turno.
              </p>

              <div className="turno-observaciones-actions">
                <button
                  type="button"
                  className="turnos-btn-primary"
                  onClick={
                    guardarObservacion
                  }
                >
                  Guardar observación
                </button>
              </div>
            </div>

            <div className="turno-modal-actions">
              <button
                type="button"
                className="turnos-btn-secondary"
                onClick={
                  cerrarDetalle
                }
              >
                Cerrar
              </button>

              <button
                type="button"
                className="turnos-btn-primary"
                onClick={() => {
                  const turno =
                    turnoSeleccionado;

                  cerrarDetalle();
                  editarTurno(turno);
                }}
              >
                Editar turno
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Turnos;
