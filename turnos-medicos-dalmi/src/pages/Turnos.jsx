import { useState, useEffect } from "react";
import "../styles/turnos.css";

function Turnos() {
  const [turnos, setTurnos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errores, setErrores] = useState({});
  const [idEditando, setIdEditando] = useState(null);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [observacionTemporal, setObservacionTemporal] = useState("");

  const [nuevoTurno, setNuevoTurno] = useState({
    id_paciente: "",
    id_medico: "",
    tipoTurno: "Consulta",
    fecha: "",
    hora: "",
    consultorio: "Consultorio 1",
    estado: "Asignado",
    observaciones: "",
  });

  const tiposTurno = [
    "Primera consulta",
    "Consulta",
    "Preoperatorio",
    "Postoperatorio",
  ];

  const consultorios = [
    "Consultorio 1",
    "Consultorio 2",
    "Consultorio 3",
  ];

  // Cargar turnos, pacientes y médicos desde FastAPI al iniciar
  const obtenerDatos = async () => {
    try {
      const resTurnos = await fetch("http://127.0.0.1:8000/turnos");
      const dataTurnos = await resTurnos.json();
      if (resTurnos.ok) setTurnos(dataTurnos);

      const resPacientes = await fetch("http://127.0.0.1:8000/pacientes");
      const dataPacientes = await resPacientes.json();
      if (resPacientes.ok) setPacientes(dataPacientes);

      const resMedicos = await fetch("http://127.0.0.1:8000/medicos");
      const dataMedicos = await resMedicos.json();
      if (resMedicos.ok) setMedicos(dataMedicos);
    } catch (error) {
      console.error("Error al cargar los datos del servidor:", error);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const normalizarTexto = (texto) => {
    if (!texto) return "";
    return texto
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const turnosFiltrados = turnos.filter((turno) => {
    const textoBusqueda = normalizarTexto(busqueda);
    const nombrePaciente = normalizarTexto(`${turno.paciente_nombre || turno.paciente || ''} ${turno.paciente_apellido || ''}`);
    const nombreMedico = normalizarTexto(`${turno.medico_nombre || turno.medico || ''} ${turno.medico_apellido || ''}`);
    const tipo = normalizarTexto(turno.tipoTurno);
    const estado = normalizarTexto(turno.estado);

    return (
      nombrePaciente.includes(textoBusqueda) ||
      nombreMedico.includes(textoBusqueda) ||
      tipo.includes(textoBusqueda) ||
      estado.includes(textoBusqueda)
    );
  });

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setNuevoTurno({
      ...nuevoTurno,
      [name]: value,
    });

    setErrores({
      ...errores,
      [name]: "",
      turno: "",
    });
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!nuevoTurno.id_paciente) {
      nuevosErrores.paciente = "Seleccioná un paciente.";
    }

    if (!nuevoTurno.id_medico) {
      nuevosErrores.medico = "Seleccioná un médico.";
    }

    if (!nuevoTurno.tipoTurno) {
      nuevosErrores.tipoTurno = "Seleccioná un tipo de turno.";
    }

    if (!nuevoTurno.fecha) {
      nuevosErrores.fecha = "Seleccioná una fecha.";
    }

    if (!nuevoTurno.hora) {
      nuevosErrores.hora = "Seleccioná un horario.";
    }

    if (!nuevoTurno.consultorio) {
      nuevosErrores.consultorio = "Seleccioná un consultorio.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const abrirNuevoTurno = () => {
    setIdEditando(null);
    setNuevoTurno({
      id_paciente: "",
      id_medico: "",
      tipoTurno: "Consulta",
      fecha: "",
      hora: "",
      consultorio: "Consultorio 1",
      estado: "Asignado",
      observaciones: "",
    });
    setErrores({});
    setMostrarFormulario(true);
  };

  const editarTurno = (turno) => {
    setIdEditando(turno.id_turno || turno.id);
    setNuevoTurno({
      id_paciente: turno.id_paciente || "",
      id_medico: turno.id_medico || "",
      tipoTurno: turno.tipoTurno || "Consulta",
      fecha: turno.fecha || (turno.fecha_hora ? turno.fecha_hora.split("T")[0] : ""),
      hora: turno.hora || (turno.fecha_hora ? turno.fecha_hora.split("T")[1]?.substring(0, 5) : ""),
      consultorio: turno.consultorio || "Consultorio 1",
      estado: turno.estado || "Asignado",
      observaciones: turno.observaciones || "",
    });
    setErrores({});
    setMostrarFormulario(true);
  };

  const guardarTurno = async (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    // Combinar fecha y hora para formato DATETIME que espera FastAPI (ej: "2026-08-12T09:00:00")
    const fechaHoraFormateada = `${nuevoTurno.fecha}T${nuevoTurno.hora}:00`;

    const datosEnviar = {
      id_paciente: parseInt(nuevoTurno.id_paciente),
      id_medico: parseInt(nuevoTurno.id_medico),
      fecha_hora: fechaHoraFormateada,
      tipoTurno: nuevoTurno.tipoTurno,
      consultorio: nuevoTurno.consultorio,
      estado: nuevoTurno.estado,
      observaciones: nuevoTurno.observaciones
    };

    try {
      const url = idEditando 
        ? `http://127.0.0.1:8000/turnos/${idEditando}` 
        : "http://127.0.0.1:8000/turnos";
      
      const method = idEditando ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosEnviar),
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        obtenerDatos();
        cerrarFormulario();
      } else {
        setErrores({ turno: resultado.detail || "Error al guardar el turno." });
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setErrores({ turno: "Error de conexión con el servidor." });
    }
  };

  const cancelarTurno = async (id) => {
    const confirmar = window.confirm("¿Querés cancelar este turno?");
    if (!confirmar) return;

    try {
      const respuesta = await fetch(`http://127.0.0.1:8000/turnos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Cancelado" })
      });

      if (respuesta.ok) {
        obtenerDatos();
      } else {
        alert("No se pudo cancelar el turno.");
      }
    } catch (error) {
      console.error("Error al cancelar:", error);
    }
  };

  const verTurno = (turno) => {
    setTurnoSeleccionado(turno);
    setObservacionTemporal(turno.observaciones || "");
  };

  const guardarObservacion = async () => {
    if (!turnoSeleccionado) return;
    const id = turnoSeleccionado.id_turno || turnoSeleccionado.id;

    try {
      const respuesta = await fetch(`http://127.0.0.1:8000/turnos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observaciones: observacionTemporal })
      });

      if (respuesta.ok) {
        obtenerDatos();
        setTurnoSeleccionado({
          ...turnoSeleccionado,
          observaciones: observacionTemporal,
        });
      }
    } catch (error) {
      console.error("Error al guardar observaciones:", error);
    }
  };

  const cerrarDetalle = () => {
    setTurnoSeleccionado(null);
    setObservacionTemporal("");
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setIdEditando(null);
    setNuevoTurno({
      id_paciente: "",
      id_medico: "",
      tipoTurno: "Consulta",
      fecha: "",
      hora: "",
      consultorio: "Consultorio 1",
      estado: "Asignado",
      observaciones: "",
    });
    setErrores({});
  };

  return (
    <section className="turnos-page">
      <div className="turnos-header">
        <div>
          <h1>Turnos</h1>
          <p>Gestión de turnos médicos de UCBA.</p>
        </div>

        <button
          type="button"
          className="turnos-btn-primary"
          onClick={abrirNuevoTurno}
        >
          + Nuevo turno
        </button>
      </div>

      {mostrarFormulario && (
        <form className="turno-form" onSubmit={guardarTurno}>
          <div className="turno-form-header">
            <h2>{idEditando ? "Editar turno" : "Nuevo turno"}</h2>
            <button
              type="button"
              className="turno-btn-cerrar"
              onClick={cerrarFormulario}
            >
              ×
            </button>
          </div>

          <div className="turno-form-grid">
            <div className="turno-form-group">
              <label htmlFor="id_paciente">Paciente</label>
              <select
                id="id_paciente"
                name="id_paciente"
                value={nuevoTurno.id_paciente}
                onChange={manejarCambio}
              >
                <option value="">Seleccionar paciente</option>
                {pacientes.map((pac) => (
                  <option key={pac.id_paciente} value={pac.id_paciente}>
                    {pac.nombre} {pac.apellido} (DNI: {pac.dni})
                  </option>
                ))}
              </select>
              {errores.paciente && <span className="turno-error">{errores.paciente}</span>}
            </div>

            <div className="turno-form-group">
              <label htmlFor="id_medico">Médico</label>
              <select
                id="id_medico"
                name="id_medico"
                value={nuevoTurno.id_medico}
                onChange={manejarCambio}
              >
                <option value="">Seleccionar médico</option>
                {medicos.map((med) => (
                  <option key={med.id_medico} value={med.id_medico}>
                    Dr/Dra. {med.nombre} {med.apellido} - {med.especialidad}
                  </option>
                ))}
              </select>
              {errores.medico && <span className="turno-error">{errores.medico}</span>}
            </div>

            <div className="turno-form-group">
              <label htmlFor="tipoTurno">Tipo de turno</label>
              <select
                id="tipoTurno"
                name="tipoTurno"
                value={nuevoTurno.tipoTurno}
                onChange={manejarCambio}
              >
                {tiposTurno.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errores.tipoTurno && <span className="turno-error">{errores.tipoTurno}</span>}
            </div>

            <div className="turno-form-group">
              <label htmlFor="consultorio">Consultorio</label>
              <select
                id="consultorio"
                name="consultorio"
                value={nuevoTurno.consultorio}
                onChange={manejarCambio}
              >
                {consultorios.map((consultorio) => (
                  <option key={consultorio} value={consultorio}>{consultorio}</option>
                ))}
              </select>
              {errores.consultorio && <span className="turno-error">{errores.consultorio}</span>}
            </div>

            <div className="turno-form-group">
              <label htmlFor="fecha">Fecha</label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                value={nuevoTurno.fecha}
                onChange={manejarCambio}
              />
              {errores.fecha && <span className="turno-error">{errores.fecha}</span>}
            </div>

            <div className="turno-form-group">
              <label htmlFor="hora">Hora</label>
              <input
                id="hora"
                name="hora"
                type="time"
                value={nuevoTurno.hora}
                onChange={manejarCambio}
              />
              {errores.hora && <span className="turno-error">{errores.hora}</span>}
            </div>

            <div className="turno-form-group">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                name="estado"
                value={nuevoTurno.estado}
                onChange={manejarCambio}
              >
                <option value="Asignado">Asignado</option>
                <option value="Atendido">Atendido</option>
                <option value="Ausente">Ausente</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {errores.turno && <div className="turno-error-general">{errores.turno}</div>}

          <div className="turno-form-actions">
            <button type="button" className="turnos-btn-secondary" onClick={cerrarFormulario}>
              Cancelar
            </button>
            <button type="submit" className="turnos-btn-primary">
              {idEditando ? "Guardar cambios" : "Guardar turno"}
            </button>
          </div>
        </form>
      )}

      <div className="turnos-search-container">
        <input
          type="text"
          className="turnos-search"
          placeholder="Buscar por paciente, médico, tipo o estado..."
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </div>

      <div className="turnos-table-container">
        <table className="turnos-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Consultorio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnosFiltrados.map((turno) => {
              const fechaObj = turno.fecha_hora ? new Date(turno.fecha_hora) : null;
              const fechaStr = turno.fecha || (fechaObj ? fechaObj.toISOString().split("T")[0] : "");
              const horaStr = turno.hora || (fechaObj ? fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "");
              const pacienteNombre = turno.paciente_nombre ? `${turno.paciente_nombre} ${turno.paciente_apellido}` : turno.paciente;
              const medicoNombre = turno.medico_nombre ? `Dr/Dra. ${turno.medico_nombre} ${turno.medico_apellido}` : turno.medico;

              return (
                <tr key={turno.id_turno || turno.id}>
                  <td>{pacienteNombre}</td>
                  <td>{medicoNombre}</td>
                  <td>{turno.tipoTurno || "Consulta"}</td>
                  <td>{fechaStr}</td>
                  <td>{horaStr}</td>
                  <td>{turno.consultorio || "Consultorio 1"}</td>
                  <td>{turno.estado}</td>
                  <td>
                    <button type="button" className="turno-btn-action" onClick={() => verTurno(turno)}>
                      Ver
                    </button>
                    <button type="button" className="turno-btn-action" onClick={() => editarTurno(turno)}>
                      Editar
                    </button>
                    {turno.estado !== "Cancelado" && (
                      <button type="button" className="turno-btn-action" onClick={() => cancelarTurno(turno.id_turno || turno.id)}>
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {turnosFiltrados.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>No se encontraron turnos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {turnoSeleccionado && (
        <div className="turno-modal-overlay">
          <div className="turno-modal">
            <div className="turno-modal-header">
              <div>
                <h2>Detalle del turno</h2>
                <p>{turnoSeleccionado.paciente_nombre ? `${turnoSeleccionado.paciente_nombre} ${turnoSeleccionado.paciente_apellido}` : turnoSeleccionado.paciente}</p>
              </div>
              <button type="button" className="turno-btn-cerrar" onClick={cerrarDetalle}>×</button>
            </div>

            <div className="turno-detalle-grid">
              <div className="turno-detalle-item">
                <span>Paciente</span>
                <strong>{turnoSeleccionado.paciente_nombre ? `${turnoSeleccionado.paciente_nombre} ${turnoSeleccionado.paciente_apellido}` : turnoSeleccionado.paciente}</strong>
              </div>
              <div className="turno-detalle-item">
                <span>Médico</span>
                <strong>{turnoSeleccionado.medico_nombre ? `Dr/Dra. ${turnoSeleccionado.medico_nombre} ${turnoSeleccionado.medico_apellido}` : turnoSeleccionado.medico}</strong>
              </div>
              <div className="turno-detalle-item">
                <span>Tipo de turno</span>
                <strong>{turnoSeleccionado.tipoTurno || "Consulta"}</strong>
              </div>
              <div className="turno-detalle-item">
                <span>Fecha</span>
                <strong>{turnoSeleccionado.fecha || turno.fecha_hora?.split("T")[0]}</strong>
              </div>
              <div className="turno-detalle-item">
                <span>Hora</span>
                <strong>{turnoSeleccionado.hora || turno.fecha_hora?.split("T")[1]?.substring(0, 5)}</strong>
              </div>
              <div className="turno-detalle-item">
                <span>Consultorio</span>
                <strong>{turnoSeleccionado.consultorio || "Consultorio 1"}</strong>
              </div>
              <div className="turno-detalle-item">
                <span>Estado</span>
                <strong>{turnoSeleccionado.estado}</strong>
              </div>
            </div>

            <div className="turno-observaciones">
              <label htmlFor="observaciones">Observaciones del turno</label>
              <textarea
                id="observaciones"
                rows="4"
                value={observacionTemporal}
                onChange={(evento) => setObservacionTemporal(evento.target.value)}
                placeholder="Ej: Recordar solicitar estudios anteriores..."
              />
              <div className="turno-observaciones-actions">
                <button type="button" className="turnos-btn-primary" onClick={guardarObservacion}>
                  Guardar observación
                </button>
              </div>
            </div>

            <div className="turno-modal-actions">
              <button type="button" className="turnos-btn-secondary" onClick={cerrarDetalle}>
                Cerrar
              </button>
              <button type="button" className="turnos-btn-primary" onClick={() => { cerrarDetalle(); editarTurno(turnoSeleccionado); }}>
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