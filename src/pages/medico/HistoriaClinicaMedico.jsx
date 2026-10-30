
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../../styles/historiaClinica.css";

const API = "http://127.0.0.1:8000";

const inicial = {
  antecedentes: "",
  alergias: "",
  observaciones_generales: ""
};

const evolucionInicial = {
  descripcion: "",
  diagnostico: "",
  tratamiento: "",
  indicaciones: ""
};

async function leerRespuesta(respuesta) {
  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const detalle = datos.detail;

    throw new Error(
      typeof detalle === "string"
        ? detalle
        : "No se pudo completar la operación."
    );
  }

  return datos;
}

function HistoriaClinicaMedico() {
  const [params, setParams] = useSearchParams();

  const pacienteRuta = params.get("paciente");

  const idRuta =
    pacienteRuta && /^[1-9]\d*$/.test(pacienteRuta)
      ? Number(pacienteRuta)
      : null;

  const [historias, setHistorias] = useState([]);
  const [paciente, setPaciente] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [historiaSeleccionada, setHistoriaSeleccionada] = useState(null);
  const [creando, setCreando] = useState(false);
  const [formHistoria, setFormHistoria] = useState(inicial);
  const [evoluciones, setEvoluciones] = useState([]);
  const [pestana, setPestana] = useState("resumen");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [formulario, setFormulario] = useState(evolucionInicial);

  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem("usuario"));
  } catch {
    usuario = null;
  }

  const idMedico = Number(usuario?.id_medico);

  const cargarHistorias = useCallback(async () => {
    const datos = await leerRespuesta(
      await fetch(`${API}/historias-clinicas`)
    );

    setHistorias(Array.isArray(datos) ? datos : []);

    return datos;
  }, []);

  const cargarEvoluciones = useCallback(async (idHC) => {
    const datos = await leerRespuesta(
      await fetch(`${API}/historias-clinicas/${idHC}/evoluciones`)
    );

    setEvoluciones(Array.isArray(datos) ? datos : []);
  }, []);

  const verHistoria = useCallback(
    async (idPaciente) => {
      const datos = await leerRespuesta(
        await fetch(`${API}/historias-clinicas/paciente/${idPaciente}`)
      );

      setHistoriaSeleccionada(datos);
      setCreando(false);
      setPestana("resumen");
      setMensaje("");
      setEvoluciones([]);

      await cargarEvoluciones(datos.id_hc);
    },
    [cargarEvoluciones]
  );

  useEffect(() => {
    let activo = true;

    async function iniciar() {
      setCargando(true);
      setError("");
      setMensaje("");
      setHistoriaSeleccionada(null);
      setCreando(false);
      setPaciente(null);

      try {
        if (!idMedico) {
          throw new Error(
            "No se encontró un médico asociado a tu usuario."
          );
        }

        await cargarHistorias();

        if (!activo) return;

        if (pacienteRuta && !idRuta) {
          throw new Error(
            "El identificador del paciente no es válido."
          );
        }

        if (idRuta) {
          const respuesta = await fetch(
            `${API}/historias-clinicas/paciente/${idRuta}`
          );

          if (!activo) return;

          if (respuesta.status === 404) {
            const pacientes = await leerRespuesta(
              await fetch(`${API}/pacientes`)
            );

            if (!activo) return;

            const encontrado = pacientes.find(
              (p) => Number(p.id_paciente) === idRuta
            );

            if (!encontrado) {
              throw new Error("No se encontró el paciente.");
            }

            setPaciente(encontrado);
            setFormHistoria(inicial);
            setCreando(true);
          } else {
            const datos = await leerRespuesta(respuesta);

            if (!activo) return;

            setHistoriaSeleccionada(datos);
            setPestana("resumen");

            const evol = await leerRespuesta(
              await fetch(
                `${API}/historias-clinicas/${datos.id_hc}/evoluciones`
              )
            );

            if (activo) {
              setEvoluciones(Array.isArray(evol) ? evol : []);
            }
          }
        }
      } catch (e) {
        if (activo) {
          setError(e.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    iniciar();

    return () => {
      activo = false;
    };
  }, [
    idMedico,
    idRuta,
    pacienteRuta,
    cargarHistorias
  ]);

  const normalizar = (texto) =>
    String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const historiasFiltradas = historias.filter((h) =>
    normalizar(`${h.nombre} ${h.apellido} ${h.dni}`).includes(
      normalizar(busqueda)
    )
  );

  function volver() {
    setParams({});
    setHistoriaSeleccionada(null);
    setCreando(false);
    setPaciente(null);
    setEvoluciones([]);
    setError("");
    setMensaje("");
  }

  async function guardarHistoria(e) {
    e.preventDefault();

    if (!paciente?.id_paciente) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      await leerRespuesta(
        await fetch(`${API}/historias-clinicas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id_paciente: paciente.id_paciente,
            antecedentes: formHistoria.antecedentes.trim() || null,
            alergias: formHistoria.alergias.trim() || null,
            observaciones_generales:
              formHistoria.observaciones_generales.trim() || null
          })
        })
      );

      await cargarHistorias();
      await verHistoria(paciente.id_paciente);

      setMensaje("Historia clínica creada correctamente.");
    } catch (err) {
      setError(err.message);

      if (err.message.includes("ya tiene una historia")) {
        try {
          await verHistoria(paciente.id_paciente);
        } catch {
          // Se conserva el mensaje de error original.
        }
      }
    } finally {
      setGuardando(false);
    }
  }

  async function guardarEvolucion(e) {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (
      !idMedico ||
      !historiaSeleccionada?.id_hc ||
      !formulario.descripcion.trim()
    ) {
      setError(
        "Completá la evolución y verificá la sesión del médico."
      );
      return;
    }

    setGuardando(true);

    try {
      await leerRespuesta(
        await fetch(`${API}/evoluciones`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id_hc: historiaSeleccionada.id_hc,
            id_medico: idMedico,
            id_turno: null,
            descripcion: formulario.descripcion.trim(),
            diagnostico: formulario.diagnostico.trim() || null,
            tratamiento: formulario.tratamiento.trim() || null,
            indicaciones: formulario.indicaciones.trim() || null,
            ruta_archivo: null
          })
        })
      );

      setFormulario(evolucionInicial);
      await cargarEvoluciones(historiaSeleccionada.id_hc);
      setPestana("evoluciones");

      setMensaje("Evolución registrada correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="historia-page">

      {/* ENCABEZADO GENERAL */}

      <div className="historia-header">
        <h1>Historia clínica</h1>
        <p>Consulta y registro de evoluciones de pacientes.</p>
      </div>

      {error && (
        <div className="historia-mensaje" role="alert">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="historia-mensaje" role="status">
          {mensaje}
        </div>
      )}

      {cargando ? (
        <div className="historia-card">
          Cargando información...
        </div>
      ) : creando && paciente ? (

        /* CREACIÓN DE HISTORIA CLÍNICA */

        <>
          <button
            className="historia-btn-volver"
            type="button"
            onClick={volver}
          >
            ← Volver a pacientes
          </button>

          <div className="historia-creacion-layout">

            <aside className="historia-creacion-paciente">
              <div className="historia-creacion-avatar">
                {paciente.nombre?.charAt(0)}
                {paciente.apellido?.charAt(0)}
              </div>

              <h3>
                {paciente.nombre} {paciente.apellido}
              </h3>

              <div className="historia-creacion-dato">
                <span>Documento</span>
                <strong>{paciente.dni || "-"}</strong>
              </div>

              <div className="historia-creacion-separador" />

              <div className="historia-creacion-estado">
                Historia clínica nueva
              </div>

              <p>
                Este paciente está registrado en el sistema,
                pero todavía no tiene una historia clínica.
              </p>
            </aside>

            <div className="historia-card historia-creacion-formulario">
              <h3>Crear historia clínica</h3>

              <p>
                Completá la información clínica inicial del paciente.
              </p>

              <form
                className="historia-creacion-form"
                onSubmit={guardarHistoria}
              >
                {[
                  ["antecedentes", "Antecedentes"],
                  ["alergias", "Alergias"],
                  [
                    "observaciones_generales",
                    "Observaciones generales"
                  ]
                ].map(([campo, titulo]) => (
                  <div className="historia-bloque" key={campo}>
                    <label htmlFor={`hc-${campo}`}>
                      {titulo}
                    </label>

                    <textarea
                      id={`hc-${campo}`}
                      className="historia-search"
                      rows={3}
                      value={formHistoria[campo]}
                      onChange={(e) =>
                        setFormHistoria((prev) => ({
                          ...prev,
                          [campo]: e.target.value
                        }))
                      }
                      placeholder={`Registrar ${titulo.toLowerCase()}...`}
                    />
                  </div>
                ))}

                <button
                  className="historia-btn-primary"
                  type="submit"
                  disabled={guardando}
                >
                  {guardando
                    ? "Guardando..."
                    : "Crear historia clínica"}
                </button>
              </form>
            </div>
          </div>
        </>

      ) : !historiaSeleccionada ? (

        /* LISTADO DE HISTORIAS CLÍNICAS */

        <>
          <div className="historia-search-container">
            <input
              className="historia-search"
              type="text"
              placeholder="Buscar paciente por nombre, apellido o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

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
                  historiasFiltradas.map((h) => (
                    <tr key={h.id_hc}>
                      <td>
                        {h.nombre} {h.apellido}
                      </td>

                      <td>{h.dni || "-"}</td>

                      <td>
                        <button
                          className="historia-btn-primary"
                          type="button"
                          onClick={() =>
                            setParams({
                              paciente: String(h.id_paciente)
                            })
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

        /* HISTORIA CLÍNICA EXISTENTE */

        <>
          <button
            className="historia-btn-volver"
            type="button"
            onClick={volver}
          >
            ← Volver a pacientes
          </button>

          {/* FICHA COMPACTA DEL PACIENTE */}

          <div className="historia-card historia-paciente-compacto">
            <div className="historia-paciente-identidad">
              <div className="historia-paciente-icono">
                {historiaSeleccionada.nombre?.charAt(0)}
                {historiaSeleccionada.apellido?.charAt(0)}
              </div>

              <div>
                <span className="historia-paciente-etiqueta">
                  Historia clínica del paciente
                </span>

                <h3>
                  {historiaSeleccionada.nombre}{" "}
                  {historiaSeleccionada.apellido}
                </h3>
              </div>
            </div>

            <div className="historia-paciente-documento">
              <span>Documento</span>
              <strong>
                {historiaSeleccionada.dni || "-"}
              </strong>
            </div>
          </div>

          {/* NAVEGACIÓN SUPERIOR CENTRADA */}

          <nav
            className="historia-navegacion"
            aria-label="Secciones de historia clínica"
          >
            <div className="historia-tabs">
              {[
                ["resumen", "Resumen"],
                ["evoluciones", "Evoluciones"],
                ["nueva", "Nueva evolución"]
              ].map(([id, nombre]) => (
                <button
                  key={id}
                  type="button"
                  className={`historia-tab ${
                    pestana === id ? "activo" : ""
                  }`}
                  aria-current={
                    pestana === id ? "page" : undefined
                  }
                  onClick={() => {
                    setPestana(id);
                    setMensaje("");
                  }}
                >
                  {nombre}
                </button>
              ))}
            </div>
          </nav>

          {/* PESTAÑA RESUMEN */}

          {pestana === "resumen" && (
            <div className="historia-seccion">
              <div className="historia-seccion-titulo">
                <h2>Resumen clínico</h2>
                <p>
                  Información general registrada del paciente.
                </p>
              </div>

              <div className="historia-resumen-grid">
                <div className="historia-card">
                  <h3>Antecedentes</h3>

                  <p className="historia-contenido-clinico">
                    {historiaSeleccionada.antecedentes ||
                      "Sin antecedentes registrados."}
                  </p>
                </div>

                <div className="historia-card">
                  <h3>Alergias</h3>

                  <p className="historia-contenido-clinico">
                    {historiaSeleccionada.alergias ||
                      "Sin alergias registradas."}
                  </p>
                </div>

                <div className="historia-card historia-card-observaciones">
                  <h3>Observaciones generales</h3>

                  <p className="historia-contenido-clinico">
                    {historiaSeleccionada.observaciones_generales ||
                      "Sin observaciones registradas."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA EVOLUCIONES */}

          {pestana === "evoluciones" && (
            <div className="historia-seccion">
              <div className="historia-seccion-titulo">
                <h2>Evoluciones médicas</h2>
                <p>
                  Historial de evoluciones registradas.
                </p>
              </div>

              {evoluciones.length === 0 ? (
                <div className="historia-mensaje">
                  No hay evoluciones registradas.
                </div>
              ) : (
                <div className="historia-evoluciones">
                  {evoluciones.map((ev) => (
                    <article
                      className="historia-evolucion-card"
                      key={ev.id_evolucion}
                    >
                      <div className="historia-evolucion-header">
                        <div>
                          <strong>Evolución médica</strong>
                          <span>
                            {ev.fecha_hora || "Sin fecha"}
                          </span>
                        </div>
                      </div>

                      <div className="historia-evolucion-descripcion">
                        <h3>Descripción de la evolución</h3>
                        <p>{ev.descripcion}</p>
                      </div>

                      <div className="historia-evolucion-grid">
                        <div>
                          <span>Diagnóstico</span>
                          <p>
                            {ev.diagnostico ||
                              "Sin diagnóstico registrado."}
                          </p>
                        </div>

                        <div>
                          <span>Tratamiento</span>
                          <p>
                            {ev.tratamiento ||
                              "Sin tratamiento registrado."}
                          </p>
                        </div>

                        <div>
                          <span>Indicaciones</span>
                          <p>
                            {ev.indicaciones ||
                              "Sin indicaciones registradas."}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA NUEVA EVOLUCIÓN */}

          {pestana === "nueva" && (
            <div className="historia-seccion">
              <div className="historia-seccion-titulo">
                <h2>Nueva evolución</h2>
                <p>
                  Registrá una nueva evolución médica
                  para este paciente.
                </p>
              </div>

              <div className="historia-card historia-nueva-evolucion">
                <form
                  className="historia-evolucion-form"
                  onSubmit={guardarEvolucion}
                >
                  {[
                    ["descripcion", "Evolución *"],
                    ["diagnostico", "Diagnóstico"],
                    ["tratamiento", "Tratamiento"],
                    ["indicaciones", "Indicaciones"]
                  ].map(([campo, titulo]) => (
                    <div
                      key={campo}
                      className={`historia-bloque ${
                        campo === "descripcion"
                          ? "historia-campo-descripcion"
                          : campo === "indicaciones"
                            ? "historia-campo-indicaciones"
                            : ""
                      }`}
                    >
                      <label htmlFor={`ev-${campo}`}>
                        {titulo}
                      </label>

                      <textarea
                        id={`ev-${campo}`}
                        className="historia-search"
                        name={campo}
                        rows={
                          campo === "descripcion" ? 5 : 3
                        }
                        required={campo === "descripcion"}
                        value={formulario[campo]}
                        onChange={(e) =>
                          setFormulario((prev) => ({
                            ...prev,
                            [campo]: e.target.value
                          }))
                        }
                      />
                    </div>
                  ))}

                  <button
                    className="historia-btn-primary"
                    type="submit"
                    disabled={guardando}
                  >
                    {guardando
                      ? "Guardando..."
                      : "Guardar evolución"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default HistoriaClinicaMedico;
