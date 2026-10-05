import { useEffect, useState } from "react";
import "../../styles/coberturas.css";

function Coberturas() {
  const [coberturas, setCoberturas] = useState([]);

  const [nuevaCobertura, setNuevaCobertura] = useState({
    nombre: "",
    tipo: "Prepaga",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const obtenerCoberturas = async () => {
    try {
      const respuesta = await fetch("http://127.0.0.1:8000/coberturas");

      if (!respuesta.ok) {
        throw new Error("Error al obtener las coberturas");
      }

      const datos = await respuesta.json();

      const activas = datos.filter(
        (cobertura) => cobertura.activo !== false && cobertura.activo !== 0
      );

      setCoberturas(activas);
    } catch (error) {
      console.error("Error al cargar las coberturas:", error);
      setMensaje("No se pudieron cargar las coberturas.");
    }
  };

  useEffect(() => {
    obtenerCoberturas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNuevaCobertura((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const limpiarFormulario = () => {
    setNuevaCobertura({
      nombre: "",
      tipo: "Prepaga",
    });

    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    const url = editandoId
      ? `http://127.0.0.1:8000/coberturas/${editandoId}`
      : "http://127.0.0.1:8000/coberturas";

    const metodo = editandoId ? "PUT" : "POST";

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nuevaCobertura.nombre,
          tipo: nuevaCobertura.tipo,
          activo: true,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.detail || "Error al guardar la cobertura"
        );
      }

      setMensaje(
        editandoId
          ? "Cobertura actualizada correctamente."
          : "Cobertura registrada correctamente."
      );

      limpiarFormulario();
      obtenerCoberturas();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const iniciarEdicion = (cobertura) => {
    setEditandoId(cobertura.id_cobertura);

    setNuevaCobertura({
      nombre: cobertura.nombre || "",
      tipo: cobertura.tipo || "Prepaga",
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

  const eliminarCobertura = async (idCobertura) => {
    const confirmar = window.confirm(
      "¿Estás segura de que querés dar de baja esta cobertura?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await fetch(
        `http://127.0.0.1:8000/coberturas/${idCobertura}`,
        {
          method: "DELETE",
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.detail || "Error al eliminar la cobertura"
        );
      }

      setMensaje("Cobertura dada de baja correctamente.");
      obtenerCoberturas();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  return (
    <section className="coberturas-page">
      <div className="coberturas-header">
        <h1>Coberturas médicas</h1>
        <p>Gestión de obras sociales, prepagas y coberturas particulares.</p>
      </div>

      <div className="coberturas-card">
        <h2>
          {editandoId ? "Editar cobertura" : "Registrar nueva cobertura"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="coberturas-form-grid">
            <div className="coberturas-field">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={nuevaCobertura.nombre}
                onChange={handleChange}
                placeholder="Ej: OSDE"
                required
              />
            </div>

            <div className="coberturas-field">
              <label>Tipo</label>
              <select
                name="tipo"
                value={nuevaCobertura.tipo}
                onChange={handleChange}
                required
              >
                <option value="Obra Social">Obra Social</option>
                <option value="Prepaga">Prepaga</option>
                <option value="Particular">Particular</option>
              </select>
            </div>
          </div>

          <div className="coberturas-form-actions">
            <button type="submit" className="coberturas-btn-primary">
              {editandoId ? "Guardar cambios" : "Guardar cobertura"}
            </button>

            {editandoId && (
              <button
                type="button"
                className="coberturas-btn-secondary"
                onClick={cancelarEdicion}
              >
                Cancelar
              </button>
            )}
          </div>

          {mensaje && <p className="coberturas-mensaje">{mensaje}</p>}
        </form>
      </div>

      <div className="coberturas-card">
        <div className="coberturas-list-header">
          <h2>Listado de coberturas</h2>
          <span>{coberturas.length} coberturas activas</span>
        </div>

        <div className="coberturas-table-container">
          <table className="coberturas-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {coberturas.length > 0 ? (
                coberturas.map((cobertura) => (
                  <tr key={cobertura.id_cobertura}>
                    <td>{cobertura.nombre}</td>
                    <td>{cobertura.tipo}</td>

                    <td>
                      <div className="coberturas-actions">
                        <button
                          type="button"
                          className="coberturas-btn-edit"
                          onClick={() => iniciarEdicion(cobertura)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="coberturas-btn-delete"
                          onClick={() =>
                            eliminarCobertura(cobertura.id_cobertura)
                          }
                        >
                          Dar de baja
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="coberturas-empty">
                    No hay coberturas activas registradas.
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

export default Coberturas;