import { useEffect, useState } from "react";

import "../../styles/turnos.css";

function Turnos() {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errores, setErrores] = useState({});
  const [idEditando, setIdEditando] = useState(null);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [observacionTemporal, setObservacionTemporal] = useState("");

  const [turnos, setTurnos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [estados, setEstados] = useState([]);

  // Horarios calculados según agenda, bloqueos y turnos ocupados
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  const [nuevoTurno, setNuevoTurno] = useState({
    id_paciente: "",
    id_medico: "",
    motivo_consulta: "",
    fecha: "",
    hora: "",
    estado: "",
    observaciones: "",
  });

  const tiposTurno = [
    "Primera consulta",
    "Consulta",
    "Preoperatorio",
    "Postoperatorio",
  ];

  // =========================================================
  // CARGAR TURNOS
  // =========================================================

  const cargarTurnos = async () => {
    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/turnos"
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron obtener los turnos.");
      }

      const datos = await respuesta.json();
      setTurnos(datos);
    } catch (error) {
      console.error("Error al obtener turnos:", error);
    }
  };

  // =========================================================
  // CARGAR PACIENTES
  // =========================================================

  const cargarPacientes = async () => {
    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/pacientes"
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron obtener los pacientes.");
      }

      const datos = await respuesta.json();

      const pacientesActivos = datos.filter(
        (paciente) => paciente.activo
      );

      setPacientes(pacientesActivos);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
    }
  };

  // =========================================================
  // CARGAR MÉDICOS
  // =========================================================

  const cargarMedicos = async () => {
    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/medicos"
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron obtener los médicos.");
      }

      const datos = await respuesta.json();
      setMedicos(datos);
    } catch (error) {
      console.error("Error al obtener médicos:", error);
    }
  };

  // =========================================================
  // CARGAR ESTADOS
  // =========================================================

  const cargarEstados = async () => {
    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/estados-turno"
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron obtener los estados de turno."
        );
      }

      const datos = await respuesta.json();
      setEstados(datos);
    } catch (error) {
      console.error("Error al obtener estados:", error);
    }
  };

  // =========================================================
  // CARGAR HORARIOS DISPONIBLES
  // =========================================================

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
      const respuesta = await fetch(
        `http://127.0.0.1:8000/horarios-disponibles?id_medico=${idMedico}&fecha=${fecha}`
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron obtener los horarios disponibles."
        );
      }

      const datos = await respuesta.json();

      setHorariosDisponibles(datos.horarios || []);
    } catch (error) {
      console.error(
        "Error al obtener horarios disponibles:",
        error
      );

      setHorariosDisponibles([]);
    } finally {
      setCargandoHorarios(false);
    }
  };

  // =========================================================
  // CARGA INICIAL
  // =========================================================

  useEffect(() => {
    cargarTurnos();
    cargarPacientes();
    cargarMedicos();
    cargarEstados();
  }, []);

  // =========================================================
  // ACTUALIZAR HORARIOS AL CAMBIAR MÉDICO O FECHA
  // =========================================================

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
    nuevoTurno.fecha,
  ]);

  // =========================================================
  // BÚSQUEDA
  // =========================================================

  const normalizarTexto = (texto) => {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const turnosFiltrados = turnos.filter((turno) => {
    const textoBusqueda = normalizarTexto(busqueda);

    return (
      normalizarTexto(turno.paciente).includes(textoBusqueda) ||
      normalizarTexto(turno.medico).includes(textoBusqueda) ||
      normalizarTexto(turno.motivo_consulta).includes(textoBusqueda) ||
      normalizarTexto(turno.estado).includes(textoBusqueda)
    );
  });

  // =========================================================
  // CAMBIOS DEL FORMULARIO
  // =========================================================

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setNuevoTurno((turnoActual) => ({
      ...turnoActual,
      [name]: value,

      // Si cambia médico o fecha, borramos la hora anterior
      ...(name === "id_medico" || name === "fecha"
        ? { hora: "" }
        : {}),
    }));

    setErrores((erroresActuales) => ({
      ...erroresActuales,
      [name]: "",
      turno: "",
    }));
  };

  // =========================================================
  // VALIDACIONES
  // =========================================================

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!nuevoTurno.id_paciente) {
      nuevosErrores.id_paciente = "Seleccioná un paciente.";
    }

    if (!nuevoTurno.id_medico) {
      nuevosErrores.id_medico = "Seleccioná un médico.";
    }

    if (!nuevoTurno.motivo_consulta) {
      nuevosErrores.motivo_consulta =
        "Seleccioná un tipo de turno.";
    }

    if (!nuevoTurno.fecha) {
      nuevosErrores.fecha = "Seleccioná una fecha.";
    }

    if (!nuevoTurno.hora) {
      nuevosErrores.hora = "Seleccioná un horario disponible.";
    }

    if (!nuevoTurno.estado) {
      nuevosErrores.estado = "Seleccioná un estado.";
    }

    const medicoOcupado = turnos.some(
      (turno) =>
        turno.id_turno !== idEditando &&
        Number(turno.id_medico) === Number(nuevoTurno.id_medico) &&
        turno.fecha === nuevoTurno.fecha &&
        String(turno.hora).slice(0, 5) === nuevoTurno.hora &&
        turno.estado !== "Cancelado"
    );

    if (medicoOcupado) {
      nuevosErrores.turno =
        "El médico ya tiene un turno asignado en esa fecha y hora.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  // =========================================================
  // NUEVO TURNO
  // =========================================================

  const abrirNuevoTurno = () => {
    setIdEditando(null);

    setNuevoTurno({
      id_paciente: "",
      id_medico: "",
      motivo_consulta: "",
      fecha: "",
      hora: "",
      estado:
        estados.length > 0
          ? estados[0].descripcion
          : "",
      observaciones: "",
    });

    setHorariosDisponibles([]);
    setErrores({});
    setMostrarFormulario(true);
  };

  // =========================================================
  // EDITAR TURNO
  // =========================================================

  const editarTurno = (turno) => {
    setIdEditando(turno.id_turno);

    const horaActual = String(turno.hora || "").slice(0, 5);

    setNuevoTurno({
      id_paciente: String(turno.id_paciente),
      id_medico: String(turno.id_medico),
      motivo_consulta: turno.motivo_consulta || "",
      fecha: turno.fecha || "",
      hora: horaActual,
      estado: turno.estado || "",
      observaciones: turno.observaciones || "",
    });

    setErrores({});
    setMostrarFormulario(true);
  };

  // =========================================================
  // CERRAR FORMULARIO
  // =========================================================

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
      observaciones: "",
    });

    setHorariosDisponibles([]);
    setErrores({});
  };

  // =========================================================
  // GUARDAR TURNO
  // =========================================================

  const guardarTurno = async (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const turnoParaEnviar = {
      fecha: nuevoTurno.fecha,
      hora: nuevoTurno.hora,
      motivo_consulta: nuevoTurno.motivo_consulta,
      id_paciente: Number(nuevoTurno.id_paciente),
      id_medico: Number(nuevoTurno.id_medico),
      estado: nuevoTurno.estado,
      observaciones:
        nuevoTurno.observaciones || null,
    };

    try {
      let respuesta;

      if (idEditando) {
        respuesta = await fetch(
          `http://127.0.0.1:8000/turnos/${idEditando}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(turnoParaEnviar),
          }
        );
      } else {
        respuesta = await fetch(
          "http://127.0.0.1:8000/turnos",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(turnoParaEnviar),
          }
        );
      }

      if (!respuesta.ok) {
        const error = await respuesta.json();

        throw new Error(
          error.detail ||
            "No se pudo guardar el turno."
        );
      }

      await cargarTurnos();
      cerrarFormulario();
    } catch (error) {
      console.error("Error al guardar turno:", error);

      setErrores((erroresActuales) => ({
        ...erroresActuales,
        turno: error.message,
      }));
    }
  };

  // =========================================================
  // CANCELAR TURNO
  // =========================================================

  const cancelarTurno = async (turno) => {
    const confirmar = window.confirm(
      "¿Querés cancelar este turno?"
    );

    if (!confirmar) {
      return;
    }

    const turnoParaEnviar = {
      fecha: turno.fecha,
      hora: String(turno.hora).slice(0, 5),
      motivo_consulta: turno.motivo_consulta,
      id_paciente: Number(turno.id_paciente),
      id_medico: Number(turno.id_medico),
      estado: "Cancelado",
      observaciones: turno.observaciones || null,
    };

    try {
      const respuesta = await fetch(
        `http://127.0.0.1:8000/turnos/${turno.id_turno}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(turnoParaEnviar),
        }
      );

      if (!respuesta.ok) {
        const error = await respuesta.json();

        throw new Error(
          error.detail ||
            "No se pudo cancelar el turno."
        );
      }

      await cargarTurnos();
    } catch (error) {
      console.error("Error al cancelar turno:", error);
      alert(error.message);
    }
  };

  // =========================================================
  // VER TURNO
  // =========================================================

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

  // =========================================================
  // GUARDAR OBSERVACIÓN
  // =========================================================

  const guardarObservacion = async () => {
    if (!turnoSeleccionado) {
      return;
    }

    const turnoParaEnviar = {
      fecha: turnoSeleccionado.fecha,
      hora: String(
        turnoSeleccionado.hora
      ).slice(0, 5),
      motivo_consulta:
        turnoSeleccionado.motivo_consulta,
      id_paciente: Number(
        turnoSeleccionado.id_paciente
      ),
      id_medico: Number(
        turnoSeleccionado.id_medico
      ),
      estado: turnoSeleccionado.estado,
      observaciones:
        observacionTemporal || null,
    };

    try {
      const respuesta = await fetch(
        `http://127.0.0.1:8000/turnos/${turnoSeleccionado.id_turno}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(turnoParaEnviar),
        }
      );

      if (!respuesta.ok) {
        const error = await respuesta.json();

        throw new Error(
          error.detail ||
            "No se pudo guardar la observación."
        );
      }

      await cargarTurnos();

      setTurnoSeleccionado({
        ...turnoSeleccionado,
        observaciones: observacionTemporal,
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
                value={nuevoTurno.id_paciente}
                onChange={manejarCambio}
              >
                <option value="">
                  Seleccionar paciente
                </option>

                {pacientes.map((paciente) => (
                  <option
                    key={paciente.id_paciente}
                    value={paciente.id_paciente}
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
                value={nuevoTurno.id_medico}
                onChange={manejarCambio}
              >
                <option value="">
                  Seleccionar médico
                </option>

                {medicos.map((medico) => (
                  <option
                    key={medico.id_medico}
                    value={medico.id_medico}
                  >
                    {medico.nombre}{" "}
                    {medico.apellido}
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
                value={nuevoTurno.motivo_consulta}
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

            {/* HORARIO DISPONIBLE */}

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

                {horariosDisponibles.map((hora) => (
                  <option
                    key={hora}
                    value={hora}
                  >
                    {hora}
                  </option>
                ))}
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
                    key={estado.id_estado}
                    value={estado.descripcion}
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
              value={nuevoTurno.observaciones}
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
            >
              {idEditando
                ? "Guardar cambios"
                : "Guardar turno"}
            </button>
          </div>
        </form>
      )}

      {/* BUSCADOR */}

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

      {/* TABLA */}

      <div className="turnos-table-container">
        <table className="turnos-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {turnosFiltrados.map((turno) => (
              <tr key={turno.id_turno}>
                <td>{turno.paciente}</td>
                <td>{turno.medico}</td>
                <td>{turno.motivo_consulta}</td>
                <td>{turno.fecha}</td>

                <td>
                  {String(turno.hora).slice(0, 5)}
                </td>

                <td>{turno.estado}</td>

                <td>
                  <button
                    type="button"
                    className="turno-btn-action"
                    onClick={() =>
                      verTurno(turno)
                    }
                  >
                    Ver
                  </button>

                  <button
                    type="button"
                    className="turno-btn-action"
                    onClick={() =>
                      editarTurno(turno)
                    }
                  >
                    Editar
                  </button>

                  {turno.estado !== "Cancelado" && (
                    <button
                      type="button"
                      className="turno-btn-action"
                      onClick={() =>
                        cancelarTurno(turno)
                      }
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {turnosFiltrados.length === 0 && (
              <tr>
                <td colSpan="7">
                  No se encontraron turnos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETALLE */}

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
                <strong>
                  {turnoSeleccionado.paciente}
                </strong>
              </div>

              <div className="turno-detalle-item">
                <span>Médico</span>
                <strong>
                  {turnoSeleccionado.medico}
                </strong>
              </div>

              <div className="turno-detalle-item">
                <span>Tipo de turno</span>
                <strong>
                  {turnoSeleccionado.motivo_consulta}
                </strong>
              </div>

              <div className="turno-detalle-item">
                <span>Fecha</span>
                <strong>
                  {turnoSeleccionado.fecha}
                </strong>
              </div>

              <div className="turno-detalle-item">
                <span>Hora</span>
                <strong>
                  {String(
                    turnoSeleccionado.hora
                  ).slice(0, 5)}
                </strong>
              </div>

              <div className="turno-detalle-item">
                <span>Estado</span>
                <strong>
                  {turnoSeleccionado.estado}
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
                value={observacionTemporal}
                onChange={(evento) =>
                  setObservacionTemporal(
                    evento.target.value
                  )
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