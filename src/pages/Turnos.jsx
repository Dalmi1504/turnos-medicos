import { useState } from "react";
import "../styles/turnos.css";

function Turnos() {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errores, setErrores] = useState({});

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
      nuevosErrores.tipoTurno =
        "Seleccioná un tipo de turno.";
    }

    if (!nuevoTurno.fecha) {
      nuevosErrores.fecha = "Seleccioná una fecha.";
    }

    if (!nuevoTurno.hora) {
      nuevosErrores.hora = "Seleccioná un horario.";
    }

    if (!nuevoTurno.consultorio) {
      nuevosErrores.consultorio =
        "Seleccioná un consultorio.";
    }

    const medicoOcupado = turnos.some(
      (turno) =>
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

  const guardarTurno = (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const turnoCreado = {
      id: Date.now(),
      ...nuevoTurno,
    };

    setTurnos([...turnos, turnoCreado]);

    cerrarFormulario();
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);

    setNuevoTurno({
      paciente: "",
      medico: "",
      tipoTurno: "",
      fecha: "",
      hora: "",
      consultorio: "",
      estado: "Asignado",
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
          onClick={() => setMostrarFormulario(true)}
        >
          + Nuevo turno
        </button>
      </div>

      {mostrarFormulario && (
        <form className="turno-form" onSubmit={guardarTurno}>
          <div className="turno-form-header">
            <h2>Nuevo turno</h2>

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
                <option value="">
                  Seleccionar consultorio
                </option>

                {consultorios.map((consultorio) => (
                  <option
                    key={consultorio}
                    value={consultorio}
                  >
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
              Guardar turno
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
                  >
                    Ver
                  </button>

                  <button
                    type="button"
                    className="turno-btn-action"
                  >
                    Editar
                  </button>
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
    </section>
  );
}

export default Turnos;