import { useEffect, useState } from "react";
import "../../styles/bloqueosAgenda.css";

function BloqueosAgenda() {
  const [medicos, setMedicos] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);

  const [idMedico, setIdMedico] = useState("");
  const [fecha, setFecha] = useState("");
  const [diaCompleto, setDiaCompleto] = useState(false);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [motivo, setMotivo] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const API = "http://127.0.0.1:8000";

  // =====================================================
  // VALIDAR HORA EN FORMATO 24 HORAS
  // =====================================================

  const horaValida = (hora) => {
    const formato24Horas = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return formato24Horas.test(hora);
  };

  // =====================================================
  // CARGAR MÉDICOS
  // =====================================================

  const cargarMedicos = async () => {
    try {
      const respuesta = await fetch(`${API}/medicos`);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los médicos");
      }

      const datos = await respuesta.json();
      setMedicos(datos);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los médicos");
    }
  };

  // =====================================================
  // CARGAR BLOQUEOS
  // =====================================================

  const cargarBloqueos = async () => {
    try {
      const respuesta = await fetch(`${API}/bloqueos-agenda`);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los bloqueos");
      }

      const datos = await respuesta.json();
      setBloqueos(datos);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los bloqueos");
    }
  };

  useEffect(() => {
    cargarMedicos();
    cargarBloqueos();
  }, []);

  // =====================================================
  // CREAR BLOQUEO
  // =====================================================

  const crearBloqueo = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!idMedico || !fecha || !motivo.trim()) {
      setError("Completá médico, fecha y motivo");
      return;
    }

    if (!diaCompleto && (!horaInicio || !horaFin)) {
      setError("Indicá la hora de inicio y la hora de fin");
      return;
    }

    if (
      !diaCompleto &&
      (!horaValida(horaInicio) || !horaValida(horaFin))
    ) {
      setError("Ingresá las horas en formato 24 h. Ejemplo: 13:15");
      return;
    }

    if (!diaCompleto && horaInicio >= horaFin) {
      setError("La hora de inicio debe ser anterior a la hora de fin");
      return;
    }

    const nuevoBloqueo = {
      id_medico: Number(idMedico),
      fecha: fecha,
      hora_inicio: diaCompleto ? null : horaInicio,
      hora_fin: diaCompleto ? null : horaFin,
      motivo: motivo.trim(),
      dia_completo: diaCompleto,
    };

    try {
      const respuesta = await fetch(`${API}/bloqueos-agenda`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoBloqueo),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudo bloquear la agenda"
        );
      }

      setMensaje("Agenda bloqueada correctamente");

      setFecha("");
      setHoraInicio("");
      setHoraFin("");
      setMotivo("");
      setDiaCompleto(false);

      await cargarBloqueos();
    } catch (error) {
      setError(error.message);
    }
  };

  // =====================================================
  // DESBLOQUEAR
  // =====================================================

  const eliminarBloqueo = async (idBloqueo) => {
    const confirmar = window.confirm(
      "¿Seguro que querés desbloquear esta agenda?"
    );

    if (!confirmar) {
      return;
    }

    setMensaje("");
    setError("");

    try {
      const respuesta = await fetch(
        `${API}/bloqueos-agenda/${idBloqueo}`,
        {
          method: "DELETE",
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudo eliminar el bloqueo"
        );
      }

      setMensaje("Agenda desbloqueada correctamente");

      await cargarBloqueos();
    } catch (error) {
      setError(error.message);
    }
  };

  // =====================================================
  // PANTALLA
  // =====================================================

  return (
    <div className="bloqueos-page">

      <div className="bloqueos-header">
        <h1>Gestión de agenda</h1>

        <p>
          Bloqueá horarios específicos o días completos de los médicos.
        </p>
      </div>

      {/* NUEVO BLOQUEO */}

      <div className="bloqueos-card">
        <h2>Nuevo bloqueo</h2>

        <form
          className="bloqueos-form"
          onSubmit={crearBloqueo}
        >

          {/* MÉDICO */}

          <div className="bloqueos-campo">
            <label>Médico</label>

            <select
              value={idMedico}
              onChange={(e) => setIdMedico(e.target.value)}
            >
              <option value="">Seleccionar médico</option>

              {medicos.map((medico) => (
                <option
                  key={medico.id_medico}
                  value={medico.id_medico}
                >
                  {medico.nombre} {medico.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* FECHA + DÍA COMPLETO */}

          <div className="bloqueos-campo">
            <label>Fecha</label>

            <div className="fecha-con-dia-completo">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />

              <label className="dia-completo-inline">
                <input
                  type="checkbox"
                  checked={diaCompleto}
                  onChange={(e) => {
                    setDiaCompleto(e.target.checked);

                    if (e.target.checked) {
                      setHoraInicio("");
                      setHoraFin("");
                    }
                  }}
                />

                Día completo
              </label>
            </div>
          </div>

          {/* HORARIOS */}

          {!diaCompleto && (
            <>
              <div className="bloqueos-campo">
                <label>Hora de inicio</label>

                <input
                  type="text"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  placeholder="Ej: 13:15"
                  maxLength="5"
                />
              </div>

              <div className="bloqueos-campo">
                <label>Hora de fin</label>

                <input
                  type="text"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  placeholder="Ej: 13:30"
                  maxLength="5"
                />
              </div>
            </>
          )}

          {/* MOTIVO */}

          <div className="bloqueos-campo bloqueos-campo-completo">
            <label>Motivo</label>

            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Médico no disponible"
            />
          </div>

          {/* BOTÓN */}

          <div className="bloqueos-acciones">
            <button
              className="boton-bloquear"
              type="submit"
            >
              Bloquear agenda
            </button>
          </div>

        </form>

        {mensaje && (
          <p className="mensaje-exito">
            {mensaje}
          </p>
        )}

        {error && (
          <p className="mensaje-error">
            {error}
          </p>
        )}
      </div>

      {/* BLOQUEOS EXISTENTES */}

      <div className="bloqueos-card">
        <h2>Bloqueos existentes</h2>

        {bloqueos.length === 0 ? (
          <p>No hay agendas bloqueadas.</p>
        ) : (
          <div className="bloqueos-tabla-contenedor">

            <table className="bloqueos-tabla">

              <thead>
                <tr>
                  <th>Médico</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Motivo</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {bloqueos.map((bloqueo) => (
                  <tr key={bloqueo.id_bloqueo}>

                    <td>{bloqueo.medico}</td>

                    <td>{bloqueo.fecha}</td>

                    <td>
                      {bloqueo.dia_completo
                        ? "Día completo"
                        : `${bloqueo.hora_inicio} - ${bloqueo.hora_fin}`}
                    </td>

                    <td>{bloqueo.motivo}</td>

                    <td>
                      <button
                        className="boton-desbloquear"
                        type="button"
                        onClick={() =>
                          eliminarBloqueo(bloqueo.id_bloqueo)
                        }
                      >
                        Desbloquear
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}
      </div>

    </div>
  );
}

export default BloqueosAgenda;