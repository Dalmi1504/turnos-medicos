import { useEffect, useState } from "react";
import "../styles/medicos.css";

function Medicos() {
  const [medicos, setMedicos] = useState([]);

  const [nuevoMedico, setNuevoMedico] = useState({
    nombre: "",
    apellido: "",
    especialidad: "",
    matricula: "",
    telefono: "",
    email: "",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const obtenerMedicos = async () => {
    try {
      const respuesta = await fetch("http://127.0.0.1:8000/medicos");

      if (!respuesta.ok) {
        throw new Error("Error al obtener los médicos");
      }

      const datos = await respuesta.json();

      const medicosActivos = datos.filter(
        (medico) => medico.activo !== false && medico.activo !== 0
      );

      setMedicos(medicosActivos);
    } catch (error) {
      console.error("Error al cargar los médicos:", error);
      setMensaje("No se pudieron cargar los médicos.");
    }
  };

  useEffect(() => {
    obtenerMedicos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNuevoMedico((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const limpiarFormulario = () => {
    setNuevoMedico({
      nombre: "",
      apellido: "",
      especialidad: "",
      matricula: "",
      telefono: "",
      email: "",
    });

    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    const url = editandoId
      ? `http://127.0.0.1:8000/medicos/${editandoId}`
      : "http://127.0.0.1:8000/medicos";

    const metodo = editandoId ? "PUT" : "POST";

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nuevoMedico.nombre,
          apellido: nuevoMedico.apellido,
          especialidad: nuevoMedico.especialidad,
          matricula: nuevoMedico.matricula,
          telefono: nuevoMedico.telefono || null,
          email: nuevoMedico.email || null,
          activo: true,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.detail || "Error al guardar el médico");
      }

      setMensaje(
        editandoId
          ? "Médico actualizado correctamente."
          : "Médico registrado correctamente."
      );

      limpiarFormulario();
      obtenerMedicos();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const iniciarEdicion = (medico) => {
    setEditandoId(medico.id_medico);

    setNuevoMedico({
      nombre: medico.nombre || "",
      apellido: medico.apellido || "",
      especialidad: medico.especialidad || "",
      matricula: medico.matricula || "",
      telefono: medico.telefono || "",
      email: medico.email || "",
    });

    setMensaje("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelarEdicion = () => {
    limpiarFormulario();
    setMensaje("");
  };

  const eliminarMedico = async (idMedico) => {
    const confirmar = window.confirm(
      "¿Estás segura de que querés dar de baja a este médico?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await fetch(
        `http://127.0.0.1:8000/medicos/${idMedico}`,
        {
          method: "DELETE",
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.detail || "Error al eliminar el médico");
      }

      setMensaje("Médico dado de baja correctamente.");
      obtenerMedicos();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  return (
    <section className="medicos-page">
      <div className="medicos-header">
        <h1>Médicos</h1>
        <p>Gestión de profesionales médicos de la clínica.</p>
      </div>

      <div className="medicos-card">
        <h2>{editandoId ? "Editar médico" : "Registrar nuevo médico"}</h2>

        <form onSubmit={handleSubmit} className="medicos-form">
          <div className="medicos-form-grid">
            <div className="medicos-field">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={nuevoMedico.nombre}
                onChange={handleChange}
                placeholder="Ej: Juan"
                required
              />
            </div>

            <div className="medicos-field">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={nuevoMedico.apellido}
                onChange={handleChange}
                placeholder="Ej: Pérez"
                required
              />
            </div>

            <div className="medicos-field">
              <label>Especialidad</label>
              <input
                type="text"
                name="especialidad"
                value={nuevoMedico.especialidad}
                onChange={handleChange}
                placeholder="Ej: Cardiología"
                required
              />
            </div>

            <div className="medicos-field">
              <label>Matrícula</label>
              <input
                type="text"
                name="matricula"
                value={nuevoMedico.matricula}
                onChange={handleChange}
                placeholder="Ej: MP1001"
                required
              />
            </div>

            <div className="medicos-field">
              <label>Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={nuevoMedico.telefono}
                onChange={handleChange}
                placeholder="Ej: 1122334455"
              />
            </div>

            <div className="medicos-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={nuevoMedico.email}
                onChange={handleChange}
                placeholder="Ej: medico@clinica.com"
              />
            </div>
          </div>

          <div className="medicos-form-actions">
            <button type="submit" className="medicos-btn-primary">
              {editandoId ? "Guardar cambios" : "Guardar médico"}
            </button>

            {editandoId && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="medicos-btn-secondary"
              >
                Cancelar
              </button>
            )}
          </div>

          {mensaje && <p className="medicos-mensaje">{mensaje}</p>}
        </form>
      </div>

      <div className="medicos-card">
        <div className="medicos-list-header">
          <h2>Listado de médicos</h2>
          <span>{medicos.length} profesionales activos</span>
        </div>

        <div className="medicos-table-container">
          <table className="medicos-table">
            <thead>
              <tr>
                <th>Nombre y apellido</th>
                <th>Especialidad</th>
                <th>Matrícula</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {medicos.length > 0 ? (
                medicos.map((medico) => (
                  <tr key={medico.id_medico}>
                    <td>
                      {medico.nombre} {medico.apellido}
                    </td>

                    <td>{medico.especialidad}</td>

                    <td>{medico.matricula}</td>

                    <td>{medico.telefono || "-"}</td>

                    <td>{medico.email || "-"}</td>

                    <td>
                      <div className="medicos-actions">
                        <button
                          type="button"
                          onClick={() => iniciarEdicion(medico)}
                          className="medicos-btn-edit"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => eliminarMedico(medico.id_medico)}
                          className="medicos-btn-delete"
                        >
                          Dar de baja
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="medicos-empty">
                    No hay médicos activos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Medicos;