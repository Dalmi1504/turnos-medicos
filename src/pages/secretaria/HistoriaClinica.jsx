import { useEffect, useState } from "react";
import "../../styles/historiaClinica.css";


function HistoriaClinica() {
  const [historias, setHistorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [historiaSeleccionada, setHistoriaSeleccionada] = useState(null);
  const [evoluciones, setEvoluciones] = useState([]);
  const [pestanaActiva, setPestanaActiva] = useState("resumen");
  const [cargando, setCargando] = useState(false);

  // =========================================================
  // CARGAR LISTA DE HISTORIAS CLÍNICAS
  // =========================================================

  const cargarHistorias = async () => {
    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/historias-clinicas"
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron obtener las historias clínicas"
        );
      }

      const datos = await respuesta.json();

      setHistorias(datos);
    } catch (error) {
      console.error(
        "Error al cargar historias clínicas:",
        error
      );
    }
  };

  useEffect(() => {
    cargarHistorias();
  }, []);

  // =========================================================
  // BUSCADOR
  // =========================================================

  const normalizarTexto = (texto) => {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const historiasFiltradas = historias.filter(
    (historia) => {
      const textoBusqueda =
        normalizarTexto(busqueda);

      return (
        normalizarTexto(
          historia.nombre
        ).includes(textoBusqueda) ||
        normalizarTexto(
          historia.apellido
        ).includes(textoBusqueda) ||
        normalizarTexto(
          historia.dni
        ).includes(textoBusqueda)
      );
    }
  );

  // =========================================================
  // VER HISTORIA CLÍNICA
  // =========================================================

  const verHistoria = async (
    idPaciente
  ) => {
    try {
      setCargando(true);

      const respuesta = await fetch(
        `http://127.0.0.1:8000/historias-clinicas/paciente/${idPaciente}`
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudo obtener la historia clínica"
        );
      }

      const datos =
        await respuesta.json();

      setHistoriaSeleccionada(datos);
      setPestanaActiva("resumen");

      await cargarEvoluciones(
        datos.id_hc
      );
    } catch (error) {
      console.error(
        "Error al obtener historia clínica:",
        error
      );

      alert(
        "No se pudo cargar la historia clínica."
      );
    } finally {
      setCargando(false);
    }
  };

  // =========================================================
  // CARGAR EVOLUCIONES
  // =========================================================

  const cargarEvoluciones = async (
    idHistoria
  ) => {
    try {
      const respuesta = await fetch(
        `http://127.0.0.1:8000/historias-clinicas/${idHistoria}/evoluciones`
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron obtener las evoluciones"
        );
      }

      const datos =
        await respuesta.json();

      setEvoluciones(datos);
    } catch (error) {
      console.error(
        "Error al cargar evoluciones:",
        error
      );

      setEvoluciones([]);
    }
  };

  // =========================================================
  // VOLVER A LA LISTA
  // =========================================================

  const volverALista = () => {
    setHistoriaSeleccionada(null);
    setEvoluciones([]);
    setPestanaActiva("resumen");
  };

  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Sin fecha";
    }

    const fechaObjeto =
      new Date(fecha);

    if (
      Number.isNaN(
        fechaObjeto.getTime()
      )
    ) {
      return fecha;
    }

    return fechaObjeto.toLocaleDateString(
      "es-AR"
    );
  };

  const formatearFechaHora = (
    fecha
  ) => {
    if (!fecha) {
      return "Sin fecha";
    }

    const fechaObjeto =
      new Date(fecha);

    if (
      Number.isNaN(
        fechaObjeto.getTime()
      )
    ) {
      return fecha;
    }

    return fechaObjeto.toLocaleString(
      "es-AR"
    );
  };

  // =========================================================
  // LISTA DE HISTORIAS
  // =========================================================

  if (!historiaSeleccionada) {
    return (
      <section className="historia-page">
        <div className="historia-header">
          <div>
            <h1>
              Historia clínica
            </h1>

            <p>
              Consulta de antecedentes,
              datos clínicos y evoluciones.
            </p>
          </div>
        </div>

        <div className="historia-search-container">
          <input
            type="text"
            className="historia-search"
            placeholder="Buscar por paciente o DNI..."
            value={busqueda}
            onChange={(evento) =>
              setBusqueda(
                evento.target.value
              )
            }
          />
        </div>

        <div className="historia-table-container">
          <table className="historia-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>DNI</th>
                <th>Fecha de creación</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {historiasFiltradas.map(
                (historia) => (
                  <tr
                    key={
                      historia.id_hc
                    }
                  >
                    <td>
                      <strong>
                        {
                          historia.apellido
                        }
                        ,{" "}
                        {
                          historia.nombre
                        }
                      </strong>
                    </td>

                    <td>
                      {
                        historia.dni
                      }
                    </td>

                    <td>
                      {formatearFecha(
                        historia.fecha_creacion
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="historia-btn-primary"
                        onClick={() =>
                          verHistoria(
                            historia.id_paciente
                          )
                        }
                      >
                        Ver historia
                      </button>
                    </td>
                  </tr>
                )
              )}

              {historiasFiltradas.length ===
                0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="historia-sin-resultados"
                  >
                    No se encontraron
                    historias clínicas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  // =========================================================
  // DETALLE DE HISTORIA CLÍNICA
  // =========================================================

  return (
    <section className="historia-page">
      <div className="historia-header historia-header-detalle">
        <div>
          <button
            type="button"
            className="historia-btn-volver"
            onClick={volverALista}
          >
            ← Volver
          </button>

          <h1>
            {historiaSeleccionada.apellido},{" "}
            {historiaSeleccionada.nombre}
          </h1>

          <p>
            DNI:{" "}
            {
              historiaSeleccionada.dni
            }
          </p>
        </div>
      </div>

      <div className="historia-tabs">
        <button
          type="button"
          className={
            pestanaActiva ===
            "resumen"
              ? "historia-tab activo"
              : "historia-tab"
          }
          onClick={() =>
            setPestanaActiva(
              "resumen"
            )
          }
        >
          Resumen
        </button>

        <button
          type="button"
          className={
            pestanaActiva ===
            "evoluciones"
              ? "historia-tab activo"
              : "historia-tab"
          }
          onClick={() =>
            setPestanaActiva(
              "evoluciones"
            )
          }
        >
          Evoluciones
        </button>
      </div>

      {cargando ? (
        <div className="historia-mensaje">
          Cargando historia clínica...
        </div>
      ) : (
        <>
          {pestanaActiva ===
            "resumen" && (
            <div className="historia-resumen-grid">
              <div className="historia-card">
                <h3>
                  Datos personales
                </h3>

                <div className="historia-dato">
                  <span>
                    Nombre y apellido
                  </span>

                  <strong>
                    {
                      historiaSeleccionada.nombre
                    }{" "}
                    {
                      historiaSeleccionada.apellido
                    }
                  </strong>
                </div>

                <div className="historia-dato">
                  <span>DNI</span>

                  <strong>
                    {
                      historiaSeleccionada.dni
                    }
                  </strong>
                </div>

                <div className="historia-dato">
                  <span>
                    Fecha de nacimiento
                  </span>

                  <strong>
                    {formatearFecha(
                      historiaSeleccionada.fecha_nacimiento
                    )}
                  </strong>
                </div>

                <div className="historia-dato">
                  <span>
                    Teléfono
                  </span>

                  <strong>
                    {
                      historiaSeleccionada.telefono ||
                      "Sin datos"
                    }
                  </strong>
                </div>

                <div className="historia-dato">
                  <span>Email</span>

                  <strong>
                    {
                      historiaSeleccionada.email ||
                      "Sin datos"
                    }
                  </strong>
                </div>

                <div className="historia-dato">
                  <span>
                    N.º de credencial
                  </span>

                  <strong>
                    {
                      historiaSeleccionada.numero_credencial ||
                      "Sin datos"
                    }
                  </strong>
                </div>
              </div>

              <div className="historia-card">
                <h3>
                  Datos clínicos
                </h3>

                <div className="historia-bloque">
                  <span>
                    Alergias
                  </span>

                  <p>
                    {
                      historiaSeleccionada.alergias ||
                      "Sin alergias registradas."
                    }
                  </p>
                </div>

                <div className="historia-bloque">
                  <span>
                    Antecedentes
                  </span>

                  <p>
                    {
                      historiaSeleccionada.antecedentes ||
                      "Sin antecedentes registrados."
                    }
                  </p>
                </div>
              </div>

              <div className="historia-card historia-card-observaciones">
                <h3>
                  Observaciones generales
                </h3>

                <p>
                  {
                    historiaSeleccionada.observaciones_generales ||
                    "Sin observaciones generales."
                  }
                </p>

                <div className="historia-fecha-creacion">
                  Historia creada el{" "}
                  {formatearFecha(
                    historiaSeleccionada.fecha_creacion
                  )}
                </div>
              </div>
            </div>
          )}

          {pestanaActiva ===
            "evoluciones" && (
            <div className="historia-evoluciones">
              {evoluciones.length ===
              0 ? (
                <div className="historia-mensaje">
                  No hay evoluciones
                  registradas para este
                  paciente.
                </div>
              ) : (
                evoluciones.map(
                  (evolucion) => (
                    <div
                      className="historia-evolucion-card"
                      key={
                        evolucion.id_evolucion
                      }
                    >
                      <div className="historia-evolucion-header">
                        <div>
                          <strong>
                            {
                              evolucion.medico
                            }
                          </strong>

                          <span>
                            {formatearFechaHora(
                              evolucion.fecha_hora
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="historia-evolucion-grid">
                        <div>
                          <span>
                            Descripción
                          </span>

                          <p>
                            {
                              evolucion.descripcion ||
                              "Sin descripción."
                            }
                          </p>
                        </div>

                        <div>
                          <span>
                            Diagnóstico
                          </span>

                          <p>
                            {
                              evolucion.diagnostico ||
                              "Sin diagnóstico."
                            }
                          </p>
                        </div>

                        <div>
                          <span>
                            Tratamiento
                          </span>

                          <p>
                            {
                              evolucion.tratamiento ||
                              "Sin tratamiento."
                            }
                          </p>
                        </div>

                        <div>
                          <span>
                            Indicaciones
                          </span>

                          <p>
                            {
                              evolucion.indicaciones ||
                              "Sin indicaciones."
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default HistoriaClinica;