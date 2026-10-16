
import { useEffect, useState } from "react";
import "../../styles/historiaClinica.css";

function HistoriaClinicaMedico() {
  const [historias, setHistorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [historiaSeleccionada, setHistoriaSeleccionada] = useState(null);
  const [evoluciones, setEvoluciones] = useState([]);
  const [pestana, setPestana] = useState("resumen");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  // =========================
  // MÉDICO QUE INICIÓ SESIÓN
  // =========================
  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem("usuario"));
  } catch {
    usuario = null;
  }

  const ID_MEDICO_ACTUAL = Number(usuario?.id_medico);

  const [formulario, setFormulario] = useState({
    descripcion: "",
    diagnostico: "",
    tratamiento: "",
    indicaciones: "",
  });

  // =========================
  // CARGAR HISTORIAS
  // =========================
  useEffect(() => {
    if (!ID_MEDICO_ACTUAL) {
      setError("No se encontró un médico asociado a tu usuario.");
      return;
    }

    const cargarHistorias = async () => {
      try {
        setError("");

        const respuesta = await fetch(
          "http://127.0.0.1:8000/historias-clinicas"
        );

        if (!respuesta.ok) {
          throw new Error("Error al obtener historias clínicas");
        }

        const datos = await respuesta.json();
        setHistorias(datos);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    cargarHistorias();
  }, [ID_MEDICO_ACTUAL]);

  // =========================
  // NORMALIZAR TEXTO
  // =========================
  const normalizar = (texto = "") =>
    texto
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const historiasFiltradas = historias.filter((historia) => {
    const texto = `${historia.nombre || ""} ${
      historia.apellido || ""
    } ${historia.dni || ""}`;

    return normalizar(texto).includes(normalizar(busqueda));
  });

  // =========================
  // ABRIR HISTORIA
  // =========================
  const verHistoria = async (idPaciente) => {
    try {
      setError("");

      const respuesta = await fetch(
        `http://127.0.0.1:8000/historias-clinicas/paciente/${idPaciente}`
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo obtener la historia clínica");
      }

      const datos = await respuesta.json();

      setHistoriaSeleccionada(datos);
      setPestana("resumen");
      setMensaje("");
      setEvoluciones([]);

      await cargarEvoluciones(datos.id_hc);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // =========================
  // CARGAR EVOLUCIONES
  // =========================
  const cargarEvoluciones = async (idHistoria) => {
    try {
      const respuesta = await fetch(
        `http://127.0.0.1:8000/historias-clinicas/${idHistoria}/evoluciones`
      );

      if (!respuesta.ok) {
        throw new Error("Error al obtener evoluciones");
      }

      const datos = await respuesta.json();
      setEvoluciones(datos);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // =========================
  // FORMULARIO
  // =========================
  const cambiarFormulario = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  // =========================
  // GUARDAR EVOLUCIÓN
  // =========================
  const guardarEvolucion = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!ID_MEDICO_ACTUAL) {
      setMensaje("No se encontró un médico asociado a tu usuario.");
      return;
    }

    if (!historiaSeleccionada?.id_hc) {
      setMensaje("Seleccioná una historia clínica válida.");
      return;
    }

    if (!formulario.descripcion.trim()) {
      setMensaje("La descripción de la evolución es obligatoria.");
      return;
    }

    try {
      setGuardando(true);

      const respuesta = await fetch(
        "http://127.0.0.1:8000/evoluciones",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_hc: historiaSeleccionada.id_hc,
            id_medico: ID_MEDICO_ACTUAL,
            id_turno: null,
            descripcion: formulario.descripcion,
            diagnostico: formulario.diagnostico || null,
            tratamiento: formulario.tratamiento || null,
            indicaciones: formulario.indicaciones || null,
            ruta_archivo: null,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudo registrar la evolución"
        );
      }

      setMensaje("Evolución registrada correctamente.");

      setFormulario({
        descripcion: "",
        diagnostico: "",
        tratamiento: "",
        indicaciones: "",
      });

      await cargarEvoluciones(historiaSeleccionada.id_hc);
      setPestana("evoluciones");
    } catch (err) {
      console.error(err);
      setMensaje(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="historia-page">
      {/* ENCABEZADO */}
      <div className="historia-header">
        <h1>Historia clínica</h1>
        <p>Consulta y registro de evoluciones de pacientes.</p>
      </div>

      {error && (
        <div className="historia-mensaje">{error}</div>
      )}

      {!historiaSeleccionada ? (
        <>
          {/* BUSCADOR */}
          <div className="historia-search-container">
            <input
              className="historia-search"
              type="text"
              placeholder="Buscar paciente por nombre, apellido o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* LISTADO */}
          <div className="historia-table-container">
            <table className="historia-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>DNI</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {historiasFiltradas.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="historia-sin-resultados"
                    >
                      No se encontraron historias clínicas.
                    </td>
                  </tr>
                ) : (
                  historiasFiltradas.map((historia) => (
                    <tr key={historia.id_hc}>
                      <td>
                        {historia.nombre} {historia.apellido}
                      </td>

                      <td>{historia.dni || "-"}</td>

                      <td>
                        <button
                          className="historia-btn-primary"
                          type="button"
                          onClick={() =>
                            verHistoria(historia.id_paciente)
                          }
                        >
                          Ver historia
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* VOLVER */}
          <button
            className="historia-btn-volver"
            type="button"
            onClick={() => {
              setHistoriaSeleccionada(null);
              setEvoluciones([]);
              setMensaje("");
              setError("");
            }}
          >
            ← Volver a pacientes
          </button>

          {/* DATOS DEL PACIENTE */}
          <div className="historia-card">
            <h3>Paciente</h3>

            <div className="historia-dato">
              <span>Nombre</span>
              <strong>
                {historiaSeleccionada.nombre}{" "}
                {historiaSeleccionada.apellido}
              </strong>
            </div>

            <div className="historia-dato">
              <span>DNI</span>
              <strong>
                {historiaSeleccionada.dni || "-"}
              </strong>
            </div>
          </div>

          {/* PESTAÑAS */}
          <div className="historia-tabs">
            <button
              className={`historia-tab ${
                pestana === "resumen" ? "activo" : ""
              }`}
              type="button"
              onClick={() => setPestana("resumen")}
            >
              Resumen
            </button>

            <button
              className={`historia-tab ${
                pestana === "evoluciones" ? "activo" : ""
              }`}
              type="button"
              onClick={() => setPestana("evoluciones")}
            >
              Evoluciones
            </button>

            <button
              className={`historia-tab ${
                pestana === "nueva" ? "activo" : ""
              }`}
              type="button"
              onClick={() => {
                setPestana("nueva");
                setMensaje("");
              }}
            >
              Nueva evolución
            </button>
          </div>

          {/* RESUMEN */}
          {pestana === "resumen" && (
            <div className="historia-resumen-grid">
              <div className="historia-card">
                <h3>Información clínica</h3>

                <div className="historia-bloque">
                  <span>Antecedentes</span>
                  <p>
                    {historiaSeleccionada.antecedentes ||
                      "Sin antecedentes registrados."}
                  </p>
                </div>

                <div className="historia-bloque">
                  <span>Alergias</span>
                  <p>
                    {historiaSeleccionada.alergias ||
                      "Sin alergias registradas."}
                  </p>
                </div>
              </div>

              <div className="historia-card historia-card-observaciones">
                <h3>Observaciones generales</h3>
                <p>
                  {historiaSeleccionada.observaciones_generales ||
                    "Sin observaciones registradas."}
                </p>
              </div>
            </div>
          )}

          {/* EVOLUCIONES */}
          {pestana === "evoluciones" && (
            <>
              {evoluciones.length === 0 ? (
                <div className="historia-mensaje">
                  No hay evoluciones registradas.
                </div>
              ) : (
                <div className="historia-evoluciones">
                  {evoluciones.map((evolucion) => (
                    <article
                      className="historia-evolucion-card"
                      key={evolucion.id_evolucion}
                    >
                      <div className="historia-evolucion-header">
                        <div>
                          <strong>Evolución médica</strong>
                          <span>
                            {evolucion.fecha_hora || "Sin fecha"}
                          </span>
                        </div>
                      </div>

                      <div className="historia-bloque">
                        <span>Evolución</span>
                        <p>{evolucion.descripcion}</p>
                      </div>

                      <div className="historia-evolucion-grid">
                        <div>
                          <span>Diagnóstico</span>
                          <p>
                            {evolucion.diagnostico ||
                              "Sin diagnóstico registrado."}
                          </p>
                        </div>

                        <div>
                          <span>Tratamiento</span>
                          <p>
                            {evolucion.tratamiento ||
                              "Sin tratamiento registrado."}
                          </p>
                        </div>

                        <div>
                          <span>Indicaciones</span>
                          <p>
                            {evolucion.indicaciones ||
                              "Sin indicaciones registradas."}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* NUEVA EVOLUCIÓN */}
          {pestana === "nueva" && (
            <div className="historia-card">
              <h3>Nueva evolución</h3>

              <form onSubmit={guardarEvolucion}>
                <div className="historia-bloque">
                  <span>Evolución *</span>
                  <textarea
                    className="historia-search"
                    name="descripcion"
                    value={formulario.descripcion}
                    onChange={cambiarFormulario}
                    placeholder="Descripción de la evolución del paciente..."
                    rows="4"
                    required
                  />
                </div>

                <div className="historia-bloque">
                  <span>Diagnóstico</span>
                  <textarea
                    className="historia-search"
                    name="diagnostico"
                    value={formulario.diagnostico}
                    onChange={cambiarFormulario}
                    rows="3"
                  />
                </div>

                <div className="historia-bloque">
                  <span>Tratamiento</span>
                  <textarea
                    className="historia-search"
                    name="tratamiento"
                    value={formulario.tratamiento}
                    onChange={cambiarFormulario}
                    rows="3"
                  />
                </div>

                <div className="historia-bloque">
                  <span>Indicaciones</span>
                  <textarea
                    className="historia-search"
                    name="indicaciones"
                    value={formulario.indicaciones}
                    onChange={cambiarFormulario}
                    rows="3"
                  />
                </div>

                <button
                  className="historia-btn-primary"
                  type="submit"
                  disabled={guardando || !ID_MEDICO_ACTUAL}
                >
                  {guardando
                    ? "Guardando..."
                    : "Guardar evolución"}
                </button>

                {mensaje && (
                  <p className="historia-fecha-creacion">
                    {mensaje}
                  </p>
                )}
              </form>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default HistoriaClinicaMedico;
