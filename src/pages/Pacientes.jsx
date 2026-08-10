import { useState } from "react";
import "../styles/pacientes.css";

function Pacientes() {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errores, setErrores] = useState({});
  const [dniEditando, setDniEditando] = useState(null);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  const [pacientes, setPacientes] = useState([
    {
      dni: "32145678",
      nombre: "María",
      apellido: "González",
      telefono: "11 4567-8910",
      cobertura: "OSDE",
      numeroAfiliado: "123456789",
      estado: "Activo",
    },
    {
      dni: "29874563",
      nombre: "Carlos",
      apellido: "Pérez",
      telefono: "11 4455-6677",
      cobertura: "Swiss Medical",
      numeroAfiliado: "SM-987654",
      estado: "Activo",
    },
    {
      dni: "35678901",
      nombre: "Lucía",
      apellido: "Fernández",
      telefono: "11 4123-4567",
      cobertura: "Particular",
      numeroAfiliado: "",
      estado: "Inactivo",
    },
  ]);

  const [nuevoPaciente, setNuevoPaciente] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    telefono: "",
    cobertura: "",
    numeroAfiliado: "",
    estado: "Activo",
  });

  const normalizarTexto = (texto) => {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const pacientesFiltrados = pacientes.filter((paciente) => {
    const textoBusqueda = normalizarTexto(busqueda);
    const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`;

    return (
      normalizarTexto(nombreCompleto).includes(textoBusqueda) ||
      paciente.dni.includes(textoBusqueda) ||
      normalizarTexto(paciente.cobertura).includes(textoBusqueda) ||
      normalizarTexto(paciente.numeroAfiliado).includes(textoBusqueda)
    );
  });

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

    setNuevoPaciente({
      ...nuevoPaciente,
      [name]: value,
    });

    setErrores({
      ...errores,
      [name]: "",
    });
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!nuevoPaciente.dni.trim()) {
      nuevosErrores.dni = "El DNI es obligatorio.";
    } else if (!/^\d{7,8}$/.test(nuevoPaciente.dni)) {
      nuevosErrores.dni = "El DNI debe tener 7 u 8 dígitos.";
    } else {
      const dniDuplicado = pacientes.some(
        (paciente) =>
          paciente.dni === nuevoPaciente.dni &&
          paciente.dni !== dniEditando
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
      nuevosErrores.telefono =
        "Ingresá un teléfono válido.";
    }

    if (!nuevoPaciente.cobertura.trim()) {
      nuevosErrores.cobertura =
        "La cobertura es obligatoria.";
    }

    if (
      nuevoPaciente.cobertura.toLowerCase() !== "particular" &&
      !nuevoPaciente.numeroAfiliado.trim()
    ) {
      nuevosErrores.numeroAfiliado =
        "El número de afiliado es obligatorio.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const abrirNuevoPaciente = () => {
    setDniEditando(null);

    setNuevoPaciente({
      dni: "",
      nombre: "",
      apellido: "",
      telefono: "",
      cobertura: "",
      numeroAfiliado: "",
      estado: "Activo",
    });

    setErrores({});
    setMostrarFormulario(true);
  };

  const editarPaciente = (paciente) => {
    setDniEditando(paciente.dni);

    setNuevoPaciente({
      dni: paciente.dni,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      telefono: paciente.telefono,
      cobertura: paciente.cobertura,
      numeroAfiliado: paciente.numeroAfiliado,
      estado: paciente.estado,
    });

    setErrores({});
    setMostrarFormulario(true);
  };

  const guardarPaciente = (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    if (dniEditando) {
      const pacientesActualizados = pacientes.map((paciente) =>
        paciente.dni === dniEditando
          ? nuevoPaciente
          : paciente
      );

      setPacientes(pacientesActualizados);
    } else {
      setPacientes([...pacientes, nuevoPaciente]);
    }

    cerrarFormulario();
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setDniEditando(null);

    setNuevoPaciente({
      dni: "",
      nombre: "",
      apellido: "",
      telefono: "",
      cobertura: "",
      numeroAfiliado: "",
      estado: "Activo",
    });

    setErrores({});
  };

  const verPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
  };

  const cerrarDetalle = () => {
    setPacienteSeleccionado(null);
  };

  return (
    <section className="pacientes-page">
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

      {mostrarFormulario && (
        <form className="paciente-form" onSubmit={guardarPaciente}>
          <div className="form-header">
            <h2>
              {dniEditando ? "Editar paciente" : "Nuevo paciente"}
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

            <div className="form-group">
              <label htmlFor="cobertura">Cobertura</label>

              <input
                id="cobertura"
                name="cobertura"
                type="text"
                value={nuevoPaciente.cobertura}
                onChange={manejarCambio}
              />

              {errores.cobertura && (
                <span className="error-message">
                  {errores.cobertura}
                </span>
              )}
            </div>

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
              />

              {errores.numeroAfiliado && (
                <span className="error-message">
                  {errores.numeroAfiliado}
                </span>
              )}
            </div>

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

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={cerrarFormulario}
            >
              Cancelar
            </button>

            <button type="submit" className="btn-primary">
              {dniEditando
                ? "Guardar cambios"
                : "Guardar paciente"}
            </button>
          </div>
        </form>
      )}

      <div className="search-container">
        <input
          className="search-input"
          type="text"
          placeholder="Buscar por nombre, apellido, DNI, cobertura o afiliado..."
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </div>

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
            {pacientesFiltrados.map((paciente) => (
              <tr key={paciente.dni}>
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
                <strong>{pacienteSeleccionado.dni}</strong>
              </div>

              <div className="detalle-item">
                <span>Nombre</span>
                <strong>{pacienteSeleccionado.nombre}</strong>
              </div>

              <div className="detalle-item">
                <span>Apellido</span>
                <strong>{pacienteSeleccionado.apellido}</strong>
              </div>

              <div className="detalle-item">
                <span>Teléfono</span>
                <strong>{pacienteSeleccionado.telefono}</strong>
              </div>

              <div className="detalle-item">
                <span>Cobertura</span>
                <strong>{pacienteSeleccionado.cobertura}</strong>
              </div>

              <div className="detalle-item">
                <span>Número de afiliado</span>
                <strong>
                  {pacienteSeleccionado.numeroAfiliado || "-"}
                </strong>
              </div>

              <div className="detalle-item">
                <span>Estado</span>
                <strong>{pacienteSeleccionado.estado}</strong>
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
