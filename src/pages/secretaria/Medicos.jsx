
import { useEffect, useState } from "react";
import "../../styles/medicos.css";

// =====================================================
// CONFIGURACIÓN
// =====================================================

const API = "http://127.0.0.1:8000";

const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo"
];

// =====================================================
// COMPONENTE MÉDICOS - SECRETARIA
// =====================================================

function Medicos() {
  // ===================================================
  // ESTADOS
  // ===================================================

  const [medicos, setMedicos] = useState([]);
  const [agendas, setAgendas] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [
    especialidadSeleccionada,
    setEspecialidadSeleccionada
  ] = useState("Todas");

  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  // ===================================================
  // CARGAR MÉDICOS Y AGENDAS DESDE FASTAPI
  // ===================================================

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setMensaje("");

        const [respuestaMedicos, respuestaAgendas] =
          await Promise.all([
            fetch(`${API}/medicos`),
            fetch(`${API}/agendas-medicas`)
          ]);

        if (!respuestaMedicos.ok) {
          throw new Error(
            "No se pudieron cargar los médicos."
          );
        }

        if (!respuestaAgendas.ok) {
          throw new Error(
            "No se pudieron cargar las agendas médicas."
          );
        }

        const datosMedicos =
          await respuestaMedicos.json();

        const datosAgendas =
          await respuestaAgendas.json();

        const medicosActivos = datosMedicos.filter(
          (medico) =>
            medico.activo !== false &&
            medico.activo !== 0
        );

        setMedicos(medicosActivos);
        setAgendas(datosAgendas);

      } catch (error) {
        console.error(
          "Error al cargar los datos:",
          error
        );

        setMensaje(error.message);

      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // ===================================================
  // OBTENER ESPECIALIDADES
  // ===================================================

  const especialidades = [
    ...new Set(
      medicos
        .map((medico) => medico.especialidad)
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  // ===================================================
  // FILTRAR MÉDICOS
  // ===================================================

  const medicosFiltrados = medicos.filter((medico) => {
    const texto = busqueda
      .trim()
      .toLowerCase();

    const nombreCompleto =
      `${medico.nombre || ""} ${medico.apellido || ""}`
        .toLowerCase();

    const matricula = String(
      medico.matricula || ""
    ).toLowerCase();

    const coincideBusqueda =
      nombreCompleto.includes(texto) ||
      matricula.includes(texto);

    const coincideEspecialidad =
      especialidadSeleccionada === "Todas" ||
      medico.especialidad === especialidadSeleccionada;

    return (
      coincideBusqueda &&
      coincideEspecialidad
    );
  });

  // ===================================================
  // OBTENER AGENDA DE CADA MÉDICO
  // ===================================================

  const obtenerAgendaMedico = (idMedico) => {
    return agendas
      .filter(
        (agenda) =>
          Number(agenda.id_medico) === Number(idMedico)
      )
      .sort((a, b) => {
        const posicionA = DIAS_SEMANA.indexOf(
          a.dia_semana
        );

        const posicionB = DIAS_SEMANA.indexOf(
          b.dia_semana
        );

        return posicionA - posicionB;
      });
  };

  // ===================================================
  // LIMPIAR FILTROS
  // ===================================================

  const limpiarFiltros = () => {
    setBusqueda("");
    setEspecialidadSeleccionada("Todas");
  };

  // ===================================================
  // INTERFAZ
  // ===================================================

  return (
    <section className="medicos-page">

      {/* ENCABEZADO */}

      <div className="medicos-header">
        <h1>Médicos y disponibilidad</h1>

        <p>
          Consultá los profesionales de la clínica,
          sus especialidades y horarios habituales
          de atención.
        </p>
      </div>

      {/* BUSCADOR */}

      <div className="medicos-card">
        <h2>Buscar profesionales</h2>

        <div className="medicos-form-grid">

          {/* NOMBRE O MATRÍCULA */}

          <div className="medicos-field">
            <label htmlFor="buscarMedico">
              Nombre, apellido o matrícula
            </label>

            <input
              id="buscarMedico"
              type="text"
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              placeholder="Buscar médico..."
            />
          </div>

          {/* ESPECIALIDAD */}

          <div className="medicos-field">
            <label htmlFor="especialidadMedico">
              Especialidad
            </label>

            <select
              id="especialidadMedico"
              value={especialidadSeleccionada}
              onChange={(e) =>
                setEspecialidadSeleccionada(
                  e.target.value
                )
              }
            >
              <option value="Todas">
                Todas las especialidades
              </option>

              {especialidades.map((especialidad) => (
                <option
                  key={especialidad}
                  value={especialidad}
                >
                  {especialidad}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="medicos-form-actions"
          style={{
            marginTop: "18px"
          }}
        >
          <button
            type="button"
            className="medicos-btn-secondary"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* LISTADO DE PROFESIONALES */}

      <div className="medicos-card">

        <div className="medicos-list-header">
          <h2>Profesionales activos</h2>

          <span>
            {medicosFiltrados.length} de {medicos.length}{" "}
            profesionales
          </span>
        </div>

        {/* MENSAJES */}

        {mensaje && (
          <p className="medicos-mensaje">
            {mensaje}
          </p>
        )}

        {cargando ? (
          <p>Cargando profesionales y agendas...</p>
        ) : medicosFiltrados.length === 0 ? (
          <p className="medicos-empty">
            No se encontraron profesionales
            con los filtros seleccionados.
          </p>
        ) : (

          /* TABLA DE MÉDICOS */

          <div className="medicos-table-container">
            <table className="medicos-table">

              <thead>
                <tr>
                  <th>Profesional</th>
                  <th>Especialidad</th>
                  <th>Matrícula</th>
                  <th>Días y horarios de atención</th>
                  <th>Contacto</th>
                </tr>
              </thead>

              <tbody>
                {medicosFiltrados.map((medico) => {
                  const agendaMedico =
                    obtenerAgendaMedico(
                      medico.id_medico
                    );

                  return (
                    <tr key={medico.id_medico}>

                      {/* NOMBRE */}

                      <td>
                        <strong>
                          {medico.nombre}{" "}
                          {medico.apellido}
                        </strong>
                      </td>

                      {/* ESPECIALIDAD */}

                      <td>
                        {medico.especialidad || "-"}
                      </td>

                      {/* MATRÍCULA */}

                      <td>
                        {medico.matricula || "-"}
                      </td>

                      {/* DÍAS Y HORARIOS */}

                      <td>
                        {agendaMedico.length > 0 ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px"
                            }}
                          >
                            {agendaMedico.map((agenda) => (
                              <div
                                key={agenda.id_agenda}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "3px"
                                }}
                              >
                                <strong
                                  style={{
                                    color: "#243447"
                                  }}
                                >
                                  {agenda.dia_semana}
                                </strong>

                                <span
                                  style={{
                                    color: "#64748b",
                                    fontSize: "13px"
                                  }}
                                >
                                  {agenda.hora_inicio} a{" "}
                                  {agenda.hora_fin}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span
                            style={{
                              color: "#64748b"
                            }}
                          >
                            Sin agenda configurada
                          </span>
                        )}
                      </td>

                      {/* CONTACTO */}

                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px"
                          }}
                        >
                          <span>
                            {medico.telefono || "-"}
                          </span>

                          <span
                            style={{
                              color: "#64748b",
                              fontSize: "13px"
                            }}
                          >
                            {medico.email || "-"}
                          </span>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Medicos;
