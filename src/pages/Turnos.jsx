import { useState } from "react";
import "../styles/turnos.css";

function Turnos() {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errores, setErrores] = useState({});
  const [idEditando, setIdEditando] = useState(null);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [observacionTemporal, setObservacionTemporal] = useState("");

  const [turnos, setTurnos] = useState([
    {
      id: 1,
      paciente: "María González",
      medico: "Dr. Juan Pérez",
      tipoTurno: "Primera consulta",
      fecha: "2026-08-12",
      hora: "09:00",
      consultorio: "Consultorio 1",
      estado: "Asignado",
      observaciones: "Recordar pedir estudios anteriores.",
    },
    {
      id: 2,
      paciente: "Carlos Pérez",
      medico: "Dra. Laura Gómez",
      tipoTurno: "Postoperatorio",
      fecha: "2026-08-12",
      hora: "10:30",
      consultorio: "Consultorio 2",
      estado: "Asignado",
      observaciones: "",
    },
    {
      id: 3,
      paciente: "Lucía Fernández",
      medico: "Dr. Juan Pérez",
      tipoTurno: "Consulta",
      fecha: "2026-08-13",
      hora: "11:00",
      consultorio: "Consultorio 1",
      estado: "Cancelado",
      observaciones: "",
    },
  ]);

  const [nuevoTurno, setNuevoTurno] = useState({
    paciente: "",
    medico: "",
    tipoTurno: "",
    fecha: "",
    hora: "",
    consultorio: "",
    estado: "Asignado",
    observaciones: "",
  });

  const pacientes = [
    "María González",
    "Carlos Pérez",
    "Lucía Fernández",
  ];

  const medicos = [
    "Dr. Juan Pérez",
    "Dra. Laura Gómez",
    "Dr. Martín Rodríguez",
  ];

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
      normalizarTexto(turno.estado).includes(textoBusqueda)
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

    if (!nuevoTurno.paciente) {
      nuevosErrores.paciente = "Seleccioná un paciente.";
    }

    if (!nuevoTurno.medico) {
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

    const medicoOcupado = turnos.some(
      (turno) =>
        turno.id !== idEditando &&
        turno.medico === nuevoTurno.medico &&
        turno.fecha === nuevoTurno.fecha &&
        turno.hora === nuevoTurno.hora &&
        turno.estado !== "Cancelado"
    );

    if (medicoOcupado) {
      nuevosErrores.turno =
        "El médico ya tiene un turno asignado en esa fecha y hora.";
    }

    const consultorioOcupado = turnos.some(
      (turno) =>
        turno.id !== idEditando &&
        turno.consultorio === nuevoTurno.consultorio &&
        turno.fecha === nuevoTurno.fecha &&
        turno.hora === nuevoTurno.hora &&
        turno.estado !== "Cancelado"
    );

    if (consultorioOcupado) {
      nuevosErrores.consultorio =
        "El consultorio ya está ocupado en esa fecha y hora.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const abrirNuevoTurno = () => {
    setIdEditando(null);

    setNuevoTurno({
      paciente: "",
      medico: "",
      tipoTurno: "",
      fecha: "",
      hora: "",
      consultorio: "",
      estado: "Asignado",
      observaciones: "",
    });

    setErrores({});
    setMostrarFormulario(true);
  };

  const editarTurno = (turno) => {
    setIdEditando(turno.id);

    setNuevoTurno({
      paciente: turno.paciente,
      medico: turno.medico,
      tipoTurno: turno.tipoTurno,
      fecha: turno.fecha,
      hora: turno.hora,
      consultorio: turno.consultorio,
      estado: turno.estado,
      observaciones: turno.observaciones || "",
    });

    setErrores({});
    setMostrarFormulario(true);
  };

  const guardarTurno = (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    if (idEditando) {
      setTurnos(
        turnos.map((turno) =>
          turno.id === idEditando
            ? { ...turno, ...nuevoTurno }
            : turno
        )
      );
    } else {
      const turnoCreado = {
        id: Date.now(),
        ...nuevoTurno,
      };

      setTurnos([...turnos, turnoCreado]);
    }

    cerrarFormulario();
  };

  const cancelarTurno = (id) => {
    const confirmar = window.confirm(
      "¿Querés cancelar este turno?"
    );

    if (!confirmar) {
      return;
    }

    setTurnos(
      turnos.map((turno) =>
        turno.id === id
          ? { ...turno, estado: "Cancelado" }
          : turno
      )
    );
  };

  const verTurno = (turno) => {
    setTurnoSeleccionado(turno);
    setObservacionTemporal(turno.observaciones || "");
  };

  const guardarObservacion = () => {
    if (!turnoSeleccionado) {
      return;
    }

    const turnosActualizados = turnos.map((turno) =>
      turno.id === turnoSeleccionado.id
        ? { ...turno, observaciones: observacionTemporal }
        : turno
    );

    setTurnos(turnosActualizados);

    setTurnoSeleccionado({
      ...turnoSeleccionado,
      observaciones: observacionTemporal,
    });
  };

  const cerrarDetalle = () => {
    setTurnoSeleccionado(null);
    setObservacionTemporal("");
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setIdEditando(null);

    setNuevoTurno({
      paciente: "",
      medico: "",
      tipoTurno: "",
      fecha: "",
      hora: "",
      consultorio: "",
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
            <h2>
              {idEditando ? "Editar turno" : "Nuevo turno"}
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
            <div className="turno-form-group">
              <label htmlFor="paciente">Paciente</label>

              <select
                id="paciente"
                name="paciente"
                value={nuevoTurno.paciente}
                onChange={manejarCambio}
              >
                <option value="">Seleccionar paciente</option>

                {pacientes.map((paciente) => (
                  <option key={paciente} value={paciente}>
                    {paciente}
                  </option>
                ))}
              </select>

              {errores.paciente && (
                <span className="turno-error">
                  {errores.paciente}
                </span>
              )}
            </div>

            <div className="turno-form-group">
              <label htmlFor="medico">Médico</label>

              <select
                id="medico"
                name="medico"
                value={nuevoTurno.medico}
                onChange={manejarCambio}
              >
                <option value="">Seleccionar médico</option>

                {medicos.map((medico) => (
                  <option key={medico} value={medico}>
                    {medico}
                  </option>
                ))}
              </select>

              {errores.medico && (
                <span className="turno-error">
                  {errores.medico}
                </span>
              )}
            </div>

            <div className="turno-form-group">
              <label htmlFor="tipoTurno">Tipo de turno</label>

              <select
                id="tipoTurno"
                name="tipoTurno"
                value={nuevoTurno.tipoTurno}
                onChange={manejarCambio}
              >
                <option value="">Seleccionar tipo</option>

                {tiposTurno.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>

              {errores.tipoTurno && (
                <span className="turno-error">
                  {errores.tipoTurno}
                </span>
              )}
            </div>

            <div className="turno-form-group">
              <label htmlFor="consultorio">Consultorio</label>

              <select
                id="consultorio"
                name="consultorio"
                value={nuevoTurno.consultorio}
                onChange={manejarCambio}
              >
                <option value="">Seleccionar consultorio</option>

                {consultorios.map((consultorio) => (
                  <option key={consultorio} value={consultorio}>
                    {consultorio}
                  </option>
                ))}
              </select>

              {errores.consultorio && (
                <span className="turno-error">
                  {errores.consultorio}
                </span>
              )}
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

              {errores.fecha && (
                <span className="turno-error">
                  {errores.fecha}
                </span>
              )}
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

              {errores.hora && (
                <span className="turno-error">
                  {errores.hora}
                </span>
              )}
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
            >
              {idEditando
                ? "Guardar cambios"
                : "Guardar turno"}
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
          onChange={(evento) =>
            setBusqueda(evento.target.value)
          }
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
            {turnosFiltrados.map((turno) => (
              <tr key={turno.id}>
                <td>{turno.paciente}</td>
                <td>{turno.medico}</td>
                <td>{turno.tipoTurno}</td>
                <td>{turno.fecha}</td>
                <td>{turno.hora}</td>
                <td>{turno.consultorio}</td>
                <td>{turno.estado}</td>

                <td>
                  <button
                    type="button"
                    className="turno-btn-action"
                    onClick={() => verTurno(turno)}
                  >
                    Ver
                  </button>

                  <button
                    type="button"
                    className="turno-btn-action"
                    onClick={() => editarTurno(turno)}
                  >
                    Editar
                  </button>

                  {turno.estado !== "Cancelado" && (
                    <button
                      type="button"
                      className="turno-btn-action"
                      onClick={() => cancelarTurno(turno.id)}
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {turnosFiltrados.length === 0 && (
              <tr>
                <td colSpan="8">
                  No se encontraron turnos.
                </td>
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
                <p>{turnoSeleccionado.paciente}</p>
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
                <span>Paciente</span>
                <strong>{turnoSeleccionado.paciente}</strong>
              </div>

              <div className="turno-detalle-item">
                <span>Médico</span>
                <strong>{turnoSeleccionado.medico}</strong>
              </div>

              <div className="turno-detalle-item">
                <span>Tipo de turno</span>
                <strong>{turnoSeleccionado.tipoTurno}</strong>
              </div>

              <div className="turno-detalle-item">
                <span>Fecha</span>
                <strong>{turnoSeleccionado.fecha}</strong>
              </div>

              <div className="turno-detalle-item">
                <span>Hora</span>
                <strong>{turnoSeleccionado.hora}</strong>
              </div>

              <div className="turno-detalle-item">
                <span>Consultorio</span>
                <strong>{turnoSeleccionado.consultorio}</strong>
              </div>

              <div className="turno-detalle-item">
                <span>Estado</span>
                <strong>{turnoSeleccionado.estado}</strong>
              </div>
            </div>

            <div className="turno-observaciones">
              <label htmlFor="observaciones">
                Observaciones del turno
              </label>

              <textarea
                id="observaciones"
                rows="4"
                value={observacionTemporal}
                onChange={(evento) =>
                  setObservacionTemporal(evento.target.value)
                }
                placeholder="Ej: Recordar solicitar estudios anteriores..."
              />

              <p className="turno-observaciones-ayuda">
                Usar para notas administrativas del turno.
              </p>

              <div className="turno-observaciones-actions">
                <button
                  type="button"
                  className="turnos-btn-primary"
                  onClick={guardarObservacion}
                >
                  Guardar observación
                </button>
              </div>
            </div>

            <div className="turno-modal-actions">
              <button
                type="button"
                className="turnos-btn-secondary"
                onClick={cerrarDetalle}
              >
                Cerrar
              </button>

              <button
                type="button"
                className="turnos-btn-primary"
                onClick={() => {
                  cerrarDetalle();
                  editarTurno(turnoSeleccionado);
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