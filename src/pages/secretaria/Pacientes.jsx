
import { useEffect, useState } from "react";
import "../../styles/pacientes.css";

const API = "http://127.0.0.1:8000";

const nombresCobertura = {
  1: "OSDE",
  2: "Swiss Medical",
  3: "Galeno",
  4: "PAMI",
  5: "Particular",
};

const idsCobertura = {
  OSDE: 1,
  "Swiss Medical": 2,
  Galeno: 3,
  PAMI: 4,
  Particular: 5,
};

const formularioVacio = {
  dni: "",
  nombre: "",
  apellido: "",
  telefono: "",
  cobertura: "",
  numeroAfiliado: "",
  estado: "Activo",
};

function Pacientes() {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errores, setErrores] = useState({});
  const [dniEditando, setDniEditando] = useState(null);
  const [idPacienteEditando, setIdPacienteEditando] = useState(null);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    ...formularioVacio,
  });

  // PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const pacientesPorPagina = 10;

  // -----------------------------------------
  // CARGAR PACIENTES DESDE FASTAPI
  // -----------------------------------------
  const cargarPacientes = async () => {
    try {
      const respuesta = await fetch(`${API}/pacientes`);

      if (!respuesta.ok) {
        throw new Error("No se pudieron obtener los pacientes.");
      }

      const datos = await respuesta.json();

      const pacientesAdaptados = datos.map((paciente) => ({
        ...paciente,
        cobertura:
          nombresCobertura[paciente.id_cobertura] || "Particular",
        numeroAfiliado: paciente.numero_credencial || "",
        estado: paciente.activo ? "Activo" : "Inactivo",
      }));

      setPacientes(pacientesAdaptados);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  // -----------------------------------------
  // NORMALIZAR TEXTO
  // -----------------------------------------
  const normalizarTexto = (texto) => {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // -----------------------------------------
  // BUSCADOR ORIGINAL
  // -----------------------------------------
  const pacientesFiltrados = pacientes.filter((paciente) => {
    const textoBusqueda = normalizarTexto(busqueda);

    const nombreCompleto =
      `${paciente.nombre} ${paciente.apellido}`;

    return (
      normalizarTexto(nombreCompleto).includes(textoBusqueda) ||
      String(paciente.dni || "").includes(textoBusqueda) ||
      normalizarTexto(paciente.cobertura).includes(textoBusqueda) ||
      normalizarTexto(paciente.numeroAfiliado).includes(textoBusqueda)
    );
  });

  // -----------------------------------------
  // PAGINACIÓN - NUEVA FUNCIONALIDAD
  // -----------------------------------------

  // Ordenar desde el último paciente registrado
  const pacientesOrdenados = [...pacientesFiltrados].sort(
    (a, b) => Number(b.id_paciente) - Number(a.id_paciente)
  );

  const totalPaginas = Math.ceil(
    pacientesOrdenados.length / pacientesPorPagina
  );

  const paginaVisible = Math.min(
    paginaActual,
    Math.max(1, totalPaginas)
  );

  const indiceInicio = (paginaVisible - 1) * pacientesPorPagina;

  const pacientesVisibles = pacientesOrdenados.slice(
    indiceInicio,
    indiceInicio + pacientesPorPagina
  );

  const cambiarBusqueda = (evento) => {
    setBusqueda(evento.target.value);
    setPaginaActual(1);
  };

  // -----------------------------------------
  // CAMBIOS DEL FORMULARIO
  // -----------------------------------------
  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    if (name === "dni" && !/^\d*$/.test(value)) {
      return;
    }

    if (
      (name === "nombre" || name === "apellido") &&
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)
    ) {
      return;
    }

    if (
      name === "telefono" &&
      !/^[0-9+\-\s()]*$/.test(value)
    ) {
      return;
    }

    if (
      name === "numeroAfiliado" &&
      !/^[a-zA-Z0-9\-\s]*$/.test(value)
    ) {
      return;
    }

    setNuevoPaciente((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setErrores((anterior) => ({
      ...anterior,
      [name]: "",
    }));
  };

  // -----------------------------------------
  // VALIDACIONES ORIGINALES
  // -----------------------------------------
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!nuevoPaciente.dni.trim()) {
      nuevosErrores.dni = "El DNI es obligatorio.";
    } else if (!/^\d{7,8}$/.test(nuevoPaciente.dni)) {
      nuevosErrores.dni = "El DNI debe tener 7 u 8 dígitos.";
    } else {
      const dniDuplicado = pacientes.some(
        (paciente) =>
          String(paciente.dni) === nuevoPaciente.dni &&
          String(paciente.dni) !== String(dniEditando)
      );

      if (dniDuplicado) {
        nuevosErrores.dni =
          "Ya existe un paciente con ese DNI.";
      }
    }

    if (!nuevoPaciente.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    }

    if (!nuevoPaciente.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es obligatorio.";
    }

    if (!nuevoPaciente.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio.";
    } else if (
      !/^[0-9+\-\s()]{8,20}$/.test(nuevoPaciente.telefono)
    ) {
      nuevosErrores.telefono = "Ingresá un teléfono válido.";
    }

    if (!nuevoPaciente.cobertura.trim()) {
      nuevosErrores.cobertura = "La cobertura es obligatoria.";
    }

    if (
      nuevoPaciente.cobertura !== "Particular" &&
      !nuevoPaciente.numeroAfiliado.trim()
    ) {
      nuevosErrores.numeroAfiliado =
        "El número de afiliado es obligatorio.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  // -----------------------------------------
  // ABRIR NUEVO PACIENTE
  // -----------------------------------------
  const abrirNuevoPaciente = () => {
    setDniEditando(null);
    setIdPacienteEditando(null);
    setNuevoPaciente({ ...formularioVacio });
    setErrores({});
    setMostrarFormulario(true);
  };

  // -----------------------------------------
  // EDITAR PACIENTE
  // -----------------------------------------
  const editarPaciente = (paciente) => {
    setDniEditando(String(paciente.dni));
    setIdPacienteEditando(paciente.id_paciente);

    setNuevoPaciente({
      dni: String(paciente.dni || ""),
      nombre: paciente.nombre || "",
      apellido: paciente.apellido || "",
      telefono: paciente.telefono || "",
      cobertura: paciente.cobertura || "",
      numeroAfiliado: paciente.numeroAfiliado || "",
      estado: paciente.estado || "Activo",
    });

    setErrores({});
    setMostrarFormulario(true);
  };

  // -----------------------------------------
  // CERRAR FORMULARIO
  // -----------------------------------------
  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setDniEditando(null);
    setIdPacienteEditando(null);
    setNuevoPaciente({ ...formularioVacio });
    setErrores({});
  };

  // -----------------------------------------
  // GUARDAR PACIENTE - POST / PUT
  // -----------------------------------------
  const guardarPaciente = async (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const pacienteParaEnviar = {
      dni: nuevoPaciente.dni,
      nombre: nuevoPaciente.nombre,
      apellido: nuevoPaciente.apellido,
      telefono: nuevoPaciente.telefono,
      id_cobertura:
        idsCobertura[nuevoPaciente.cobertura] || null,
      numero_credencial:
        nuevoPaciente.cobertura === "Particular"
          ? null
          : nuevoPaciente.numeroAfiliado || null,
      activo: nuevoPaciente.estado === "Activo",
    };

    try {
      const editando = idPacienteEditando !== null;

      const url = editando
        ? `${API}/pacientes/${idPacienteEditando}`
        : `${API}/pacientes`;

      const respuesta = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pacienteParaEnviar),
      });

      if (!respuesta.ok) {
        const error = await respuesta.json();

        throw new Error(
          error.detail ||
            (editando
              ? "Error al modificar el paciente."
              : "Error al guardar el paciente.")
        );
      }

      const resultado = await respuesta.json();
      console.log(
        editando ? "Paciente modificado:" : "Paciente creado:",
        resultado
      );

      await cargarPacientes();
      cerrarFormulario();

      if (!editando) {
        setBusqueda("");
        setPaginaActual(1);
      }
    } catch (error) {
      console.error("Error al guardar paciente:", error);
      alert(error.message);
    }
  };

  // -----------------------------------------
  // VER PACIENTE
  // -----------------------------------------
  const verPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
  };

  const cerrarDetalle = () => {
    setPacienteSeleccionado(null);
  };

  // -----------------------------------------
  // INACTIVAR PACIENTE
  // -----------------------------------------
  const inactivarPaciente = async (paciente) => {
    const confirmar = window.confirm(
      `¿Querés inactivar a ${paciente.nombre} ${paciente.apellido}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await fetch(
        `${API}/pacientes/${paciente.id_paciente}/inactivar`,
        {
          method: "PUT",
        }
      );

      if (!respuesta.ok) {
        const error = await respuesta.json();

        throw new Error(
          error.detail || "No se pudo inactivar el paciente."
        );
      }

      const resultado = await respuesta.json();
      console.log("Paciente inactivado:", resultado);

      await cargarPacientes();
    } catch (error) {
      console.error("Error al inactivar paciente:", error);
      alert(error.message);
    }
  };

  // =========================================
  // INTERFAZ
  // =========================================
  return (
    <section className="pacientes-page">

      {/* CABECERA */}
      <div className="page-header">
        <div>
          <h1>Pacientes</h1>
          <p>Gestión de pacientes de UCBA.</p>
        </div>

        <button
          className="btn-primary"
          type="button"
          onClick={abrirNuevoPaciente}
        >
          + Nuevo paciente
        </button>
      </div>

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <form
          className="paciente-form"
          onSubmit={guardarPaciente}
        >
          <div className="form-header">
            <h2>
              {idPacienteEditando !== null
                ? "Editar paciente"
                : "Nuevo paciente"}
            </h2>

            <button
              type="button"
              className="btn-cerrar"
              onClick={cerrarFormulario}
            >
              ×
            </button>
          </div>

          <div className="form-grid">

            {/* DNI */}
            <div className="form-group">
              <label htmlFor="dni">DNI</label>
              <input
                id="dni"
                name="dni"
                type="text"
                inputMode="numeric"
                maxLength="8"
                value={nuevoPaciente.dni}
                onChange={manejarCambio}
              />
              {errores.dni && (
                <span className="error-message">
                  {errores.dni}
                </span>
              )}
            </div>

            {/* NOMBRE */}
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={nuevoPaciente.nombre}
                onChange={manejarCambio}
              />
              {errores.nombre && (
                <span className="error-message">
                  {errores.nombre}
                </span>
              )}
            </div>

            {/* APELLIDO */}
            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                value={nuevoPaciente.apellido}
                onChange={manejarCambio}
              />
              {errores.apellido && (
                <span className="error-message">
                  {errores.apellido}
                </span>
              )}
            </div>

            {/* TELÉFONO */}
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                name="telefono"
                type="text"
                value={nuevoPaciente.telefono}
                onChange={manejarCambio}
              />
              {errores.telefono && (
                <span className="error-message">
                  {errores.telefono}
                </span>
              )}
            </div>

            {/* COBERTURA */}
            <div className="form-group">
              <label htmlFor="cobertura">Cobertura</label>
              <select
                id="cobertura"
                name="cobertura"
                value={nuevoPaciente.cobertura}
                onChange={manejarCambio}
              >
                <option value="">
                  Seleccionar cobertura
                </option>
                <option value="OSDE">OSDE</option>
                <option value="Swiss Medical">
                  Swiss Medical
                </option>
                <option value="Galeno">Galeno</option>
                <option value="PAMI">PAMI</option>
                <option value="Particular">
                  Particular
                </option>
              </select>
              {errores.cobertura && (
                <span className="error-message">
                  {errores.cobertura}
                </span>
              )}
            </div>

            {/* NÚMERO DE AFILIADO */}
            <div className="form-group">
              <label htmlFor="numeroAfiliado">
                Número de afiliado
              </label>
              <input
                id="numeroAfiliado"
                name="numeroAfiliado"
                type="text"
                value={nuevoPaciente.numeroAfiliado}
                onChange={manejarCambio}
                placeholder="Ej: 123456789"
                disabled={
                  nuevoPaciente.cobertura === "Particular"
                }
              />
              {errores.numeroAfiliado && (
                <span className="error-message">
                  {errores.numeroAfiliado}
                </span>
              )}
            </div>

            {/* ESTADO */}
            <div className="form-group">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                name="estado"
                value={nuevoPaciente.estado}
                onChange={manejarCambio}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {/* BOTONES FORMULARIO */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={cerrarFormulario}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-primary"
            >
              {idPacienteEditando !== null
                ? "Guardar cambios"
                : "Guardar paciente"}
            </button>
          </div>
        </form>
      )}

      {/* BUSCADOR ORIGINAL */}
      <div className="search-container">
        <input
          className="search-input"
          type="text"
          placeholder="Buscar por nombre, apellido, DNI, cobertura o afiliado..."
          value={busqueda}
          onChange={cambiarBusqueda}
        />
      </div>

      {/* TABLA CON PAGINACIÓN */}
      <div className="table-container">
        <table className="pacientes-table">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Paciente</th>
              <th>Teléfono</th>
              <th>Cobertura</th>
              <th>N.º afiliado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pacientesVisibles.map((paciente) => (
              <tr
                key={paciente.id_paciente || paciente.dni}
              >
                <td>{paciente.dni}</td>

                <td>
                  {paciente.nombre} {paciente.apellido}
                </td>

                <td>{paciente.telefono}</td>

                <td>{paciente.cobertura}</td>

                <td>
                  {paciente.numeroAfiliado || "-"}
                </td>

                <td>{paciente.estado}</td>

                <td>
                  <button
                    type="button"
                    className="btn-action"
                    onClick={() => verPaciente(paciente)}
                  >
                    Ver
                  </button>

                  <button
                    type="button"
                    className="btn-action"
                    onClick={() => editarPaciente(paciente)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="btn-action"
                    onClick={() => inactivarPaciente(paciente)}
                    disabled={paciente.estado === "Inactivo"}
                  >
                    Inactivar
                  </button>
                </td>
              </tr>
            ))}

            {pacientesFiltrados.length === 0 && (
              <tr>
                <td colSpan="7">
                  No se encontraron pacientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CONTROLES DE PAGINACIÓN */}
      {pacientesOrdenados.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
            marginBottom: "20px",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span>
            Mostrando {indiceInicio + 1} a{" "}
            {Math.min(
              indiceInicio + pacientesPorPagina,
              pacientesOrdenados.length
            )}{" "}
            de {pacientesOrdenados.length} pacientes
          </span>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              disabled={paginaVisible === 1}
              onClick={() =>
                setPaginaActual(paginaVisible - 1)
              }
            >
              Anterior
            </button>

            <span>
              Página {paginaVisible} de {totalPaginas}
            </span>

            <button
              type="button"
              className="btn-secondary"
              disabled={paginaVisible === totalPaginas}
              onClick={() =>
                setPaginaActual(paginaVisible + 1)
              }
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* MODAL VER PACIENTE */}
      {pacienteSeleccionado && (
        <div className="modal-overlay">
          <div className="paciente-modal">

            <div className="modal-header">
              <div>
                <h2>Datos del paciente</h2>
                <p>
                  {pacienteSeleccionado.nombre}{" "}
                  {pacienteSeleccionado.apellido}
                </p>
              </div>

              <button
                type="button"
                className="btn-cerrar"
                onClick={cerrarDetalle}
              >
                ×
              </button>
            </div>

            <div className="detalle-grid">
              <div className="detalle-item">
                <span>DNI</span>
                <strong>
                  {pacienteSeleccionado.dni}
                </strong>
              </div>

              <div className="detalle-item">
                <span>Nombre</span>
                <strong>
                  {pacienteSeleccionado.nombre}
                </strong>
              </div>

              <div className="detalle-item">
                <span>Apellido</span>
                <strong>
                  {pacienteSeleccionado.apellido}
                </strong>
              </div>

              <div className="detalle-item">
                <span>Teléfono</span>
                <strong>
                  {pacienteSeleccionado.telefono}
                </strong>
              </div>

              <div className="detalle-item">
                <span>Cobertura</span>
                <strong>
                  {pacienteSeleccionado.cobertura}
                </strong>
              </div>

              <div className="detalle-item">
                <span>Número de afiliado</span>
                <strong>
                  {pacienteSeleccionado.numeroAfiliado || "-"}
                </strong>
              </div>

              <div className="detalle-item">
                <span>Estado</span>
                <strong>
                  {pacienteSeleccionado.estado}
                </strong>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={cerrarDetalle}
              >
                Cerrar
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  cerrarDetalle();
                  editarPaciente(pacienteSeleccionado);
                }}
              >
                Editar paciente
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}

export default Pacientes;
