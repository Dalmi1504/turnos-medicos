import { useEffect, useState } from "react";
import "../../styles/gestionMedicos.css";

function GestionMedicos() {
  // =========================================================
  // ESTADOS - MÉDICOS
  // =========================================================

  const [medicos, setMedicos] = useState([]);

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    especialidad: "",
    matricula: "",
    telefono: "",
    email: "",
    username: "",
    password: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  // =========================================================
  // ESTADOS - AGENDA MÉDICA
  // =========================================================

  const [agendas, setAgendas] = useState([]);

  const [agendaFormulario, setAgendaFormulario] = useState({
    id_medico: "",
    dia_semana: "Lunes",
    hora_inicio: "",
    hora_fin: "",
    duracion_turno: "15",
  });

  const [idAgendaEditando, setIdAgendaEditando] = useState(null);

  const [mensajeAgenda, setMensajeAgenda] = useState("");
  const [tipoMensajeAgenda, setTipoMensajeAgenda] = useState("");

  // =========================================================
  // OBTENER MÉDICOS
  // =========================================================

  const obtenerMedicos = async () => {
    try {
      const respuesta = await fetch("http://127.0.0.1:8000/medicos");

      if (!respuesta.ok) {
        throw new Error("No se pudieron obtener los médicos");
      }

      const datos = await respuesta.json();

      const medicosActivos = datos.filter(
        (medico) => medico.activo !== false && medico.activo !== 0
      );

      setMedicos(medicosActivos);
    } catch (error) {
      console.error("Error al cargar médicos:", error);
      setMensaje("No se pudieron cargar los médicos.");
      setTipoMensaje("error");
    }
  };

  // =========================================================
  // OBTENER AGENDAS
  // =========================================================

  const obtenerAgendas = async () => {
    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/agendas-medicas"
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron obtener las agendas");
      }

      const datos = await respuesta.json();
      setAgendas(datos);
    } catch (error) {
      console.error("Error al cargar agendas:", error);
      setMensajeAgenda("No se pudieron cargar las agendas.");
      setTipoMensajeAgenda("error");
    }
  };

  // =========================================================
  // CARGA INICIAL
  // =========================================================

  useEffect(() => {
    obtenerMedicos();
    obtenerAgendas();
  }, []);

  // =========================================================
  // FORMULARIO MÉDICO
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    if (mensaje) {
      setMensaje("");
      setTipoMensaje("");
    }
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombre: "",
      apellido: "",
      especialidad: "",
      matricula: "",
      telefono: "",
      email: "",
      username: "",
      password: "",
    });
  };

  // =========================================================
  // VALIDACIONES MÉDICO
  // =========================================================

  const validarFormulario = () => {
    const nombre = formulario.nombre.trim();
    const apellido = formulario.apellido.trim();
    const especialidad = formulario.especialidad.trim();
    const matricula = formulario.matricula.trim();
    const telefono = formulario.telefono.trim();
    const email = formulario.email.trim();
    const username = formulario.username.trim();
    const password = formulario.password;

    if (nombre.length < 2) {
      return "El nombre debe tener al menos 2 caracteres.";
    }

    if (apellido.length < 2) {
      return "El apellido debe tener al menos 2 caracteres.";
    }

    if (especialidad.length < 2) {
      return "Ingresá una especialidad válida.";
    }

    if (matricula.length < 3) {
      return "Ingresá una matrícula válida.";
    }

    if (telefono) {
      const telefonoValido = /^[0-9+\-\s()]{8,20}$/;

      if (!telefonoValido.test(telefono)) {
        return "Ingresá un teléfono válido.";
      }
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(email)) {
      return "Ingresá un email válido.";
    }

    if (username.length < 4) {
      return "El usuario debe tener al menos 4 caracteres.";
    }

    if (/\s/.test(username)) {
      return "El usuario no puede contener espacios.";
    }

    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }

    return null;
  };

  // =========================================================
  // CREAR MÉDICO + USUARIO
  // =========================================================

  const crearMedico = async (e) => {
    e.preventDefault();

    setMensaje("");
    setTipoMensaje("");

    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setMensaje(errorValidacion);
      setTipoMensaje("error");
      return;
    }

    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/admin/medicos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: formulario.nombre.trim(),
            apellido: formulario.apellido.trim(),
            especialidad: formulario.especialidad.trim(),
            matricula: formulario.matricula.trim(),
            telefono: formulario.telefono.trim() || null,
            email: formulario.email.trim(),
            username: formulario.username.trim(),
            password: formulario.password,
            activo: true,
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.detail || "No se pudo registrar el médico"
        );
      }

      setMensaje("Usuario creado correctamente.");
      setTipoMensaje("exito");

      limpiarFormulario();
      obtenerMedicos();
    } catch (error) {
      setMensaje(error.message);
      setTipoMensaje("error");
    }
  };

  // =========================================================
  // FORMULARIO AGENDA
  // =========================================================

  const handleAgendaChange = (e) => {
    const { name, value } = e.target;

    setAgendaFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    if (mensajeAgenda) {
      setMensajeAgenda("");
      setTipoMensajeAgenda("");
    }
  };

  const limpiarAgendaFormulario = () => {
    setAgendaFormulario({
      id_medico: "",
      dia_semana: "Lunes",
      hora_inicio: "",
      hora_fin: "",
      duracion_turno: "15",
    });

    setIdAgendaEditando(null);
  };

  // =========================================================
  // VALIDACIONES AGENDA
  // =========================================================

  const horaValida = (hora) => {
    const formato24Horas = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return formato24Horas.test(hora);
  };

  const validarAgenda = () => {
    if (!agendaFormulario.id_medico) {
      return "Seleccioná un médico.";
    }

    if (!horaValida(agendaFormulario.hora_inicio)) {
      return "Ingresá una hora de inicio válida en formato HH:MM.";
    }

    if (!horaValida(agendaFormulario.hora_fin)) {
      return "Ingresá una hora de fin válida en formato HH:MM.";
    }

    if (agendaFormulario.hora_inicio >= agendaFormulario.hora_fin) {
      return "La hora de fin debe ser posterior a la hora de inicio.";
    }

    const duracion = Number(agendaFormulario.duracion_turno);

    if (!duracion || duracion <= 0) {
      return "Seleccioná una duración válida.";
    }

    return null;
  };

  // =========================================================
  // GUARDAR / EDITAR AGENDA
  // =========================================================

  const guardarAgenda = async (e) => {
    e.preventDefault();

    setMensajeAgenda("");
    setTipoMensajeAgenda("");

    const errorValidacion = validarAgenda();

    if (errorValidacion) {
      setMensajeAgenda(errorValidacion);
      setTipoMensajeAgenda("error");
      return;
    }

    const datosAgenda = {
      id_medico: Number(agendaFormulario.id_medico),
      dia_semana: agendaFormulario.dia_semana,
      hora_inicio: agendaFormulario.hora_inicio,
      hora_fin: agendaFormulario.hora_fin,
      duracion_turno: Number(agendaFormulario.duracion_turno),
      activo: true,
    };

    try {
      const url = idAgendaEditando
        ? `http://127.0.0.1:8000/agendas-medicas/${idAgendaEditando}`
        : "http://127.0.0.1:8000/agendas-medicas";

      const respuesta = await fetch(url, {
        method: idAgendaEditando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosAgenda),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.detail ||
            (idAgendaEditando
              ? "No se pudo actualizar la agenda"
              : "No se pudo guardar la agenda")
        );
      }

      setMensajeAgenda(
        idAgendaEditando
          ? "Agenda actualizada correctamente."
          : "Agenda configurada correctamente."
      );

      setTipoMensajeAgenda("exito");

      limpiarAgendaFormulario();
      obtenerAgendas();
    } catch (error) {
      setMensajeAgenda(error.message);
      setTipoMensajeAgenda("error");
    }
  };

  // =========================================================
  // PREPARAR EDICIÓN
  // =========================================================

  const editarAgenda = (agenda) => {
    setAgendaFormulario({
      id_medico: String(agenda.id_medico),
      dia_semana: agenda.dia_semana,
      hora_inicio: agenda.hora_inicio,
      hora_fin: agenda.hora_fin,
      duracion_turno: String(agenda.duracion_turno),
    });

    setIdAgendaEditando(agenda.id_agenda);

    setMensajeAgenda(
      "Modificá los datos y presioná Guardar cambios."
    );
    setTipoMensajeAgenda("exito");
  };

  // =========================================================
  // CANCELAR EDICIÓN
  // =========================================================

  const cancelarEdicion = () => {
    limpiarAgendaFormulario();
    setMensajeAgenda("");
    setTipoMensajeAgenda("");
  };

  // =========================================================
  // DESACTIVAR AGENDA
  // =========================================================

  const desactivarAgenda = async (idAgenda) => {
    const confirmar = window.confirm(
      "¿Querés desactivar esta agenda?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await fetch(
        `http://127.0.0.1:8000/agendas-medicas/${idAgenda}`,
        {
          method: "DELETE",
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.detail || "No se pudo desactivar la agenda"
        );
      }

      setMensajeAgenda("Agenda desactivada correctamente.");
      setTipoMensajeAgenda("exito");

      if (idAgendaEditando === idAgenda) {
        limpiarAgendaFormulario();
      }

      obtenerAgendas();
    } catch (error) {
      setMensajeAgenda(error.message);
      setTipoMensajeAgenda("error");
    }
  };

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <section className="gestion-medicos-page">
      {/* ENCABEZADO */}

      <div className="gestion-medicos-header">
        <h1>Gestión de médicos</h1>

        <p>
          Alta de profesionales, creación de cuentas de acceso y
          configuración de agenda médica.
        </p>
      </div>

      {/* =====================================================
          REGISTRAR MÉDICO
      ====================================================== */}

      <div className="gestion-medicos-card">
        <h2>Registrar nuevo médico</h2>

        <form
          onSubmit={crearMedico}
          className="gestion-medicos-form"
        >
          <h3 className="gestion-medicos-subtitulo">
            Datos profesionales
          </h3>

          <div className="gestion-medicos-campo">
            <label>Nombre</label>

            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={handleChange}
              placeholder="Ej: Juan"
              minLength="2"
              maxLength="100"
              required
            />
          </div>

          <div className="gestion-medicos-campo">
            <label>Apellido</label>

            <input
              type="text"
              name="apellido"
              value={formulario.apellido}
              onChange={handleChange}
              placeholder="Ej: Pérez"
              minLength="2"
              maxLength="100"
              required
            />
          </div>

       
          <div className="gestion-medicos-campo">
            <label>Especialidad</label>

            <select
              name="especialidad"
              value={formulario.especialidad}
              onChange={handleChange}
              required
            >
            <option value="">Seleccionar especialidad</option>
            <option value="Columna">Columna</option>
            <option value="Cardiología">Cardiología</option>
            </select>
          </div>


          <div className="gestion-medicos-campo">
            <label>Matrícula</label>

            <input
              type="text"
              name="matricula"
              value={formulario.matricula}
              onChange={handleChange}
              placeholder="Ej: MP12345"
              minLength="3"
              maxLength="50"
              required
            />
          </div>

          <div className="gestion-medicos-campo">
            <label>Teléfono</label>

            <input
              type="text"
              name="telefono"
              value={formulario.telefono}
              onChange={handleChange}
              placeholder="Ej: 1122334455"
              maxLength="20"
            />
          </div>

          <div className="gestion-medicos-campo">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formulario.email}
              onChange={handleChange}
              placeholder="Ej: medico@clinica.com"
              maxLength="100"
              required
            />
          </div>

          <h3 className="gestion-medicos-subtitulo">
            Cuenta de acceso
          </h3>

          <div className="gestion-medicos-campo">
            <label>Usuario</label>

            <input
              type="text"
              name="username"
              value={formulario.username}
              onChange={handleChange}
              placeholder="Ej: jperez"
              minLength="4"
              maxLength="50"
              autoComplete="username"
              required
            />
          </div>

          <div className="gestion-medicos-campo">
            <label>Contraseña</label>

            <input
              type="password"
              name="password"
              value={formulario.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              minLength="8"
              maxLength="72"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="gestion-medicos-acciones">
            <button
              type="submit"
              className="boton-crear-medico"
            >
              Crear usuario
            </button>
          </div>

          {mensaje && (
            <div
              className={
                tipoMensaje === "exito"
                  ? "gestion-medicos-mensaje-exito"
                  : "gestion-medicos-mensaje-error"
              }
            >
              {mensaje}
            </div>
          )}
        </form>
      </div>

      {/* =====================================================
          MÉDICOS ACTIVOS
      ====================================================== */}

      <div className="gestion-medicos-card">
        <div className="gestion-medicos-list-header">
          <h2>Médicos activos</h2>

          <span>
            {medicos.length} profesionales activos
          </span>
        </div>

        <div className="gestion-medicos-tabla-contenedor">
          <table className="gestion-medicos-tabla">
            <thead>
              <tr>
                <th>Médico</th>
                <th>Especialidad</th>
                <th>Matrícula</th>
                <th>Teléfono</th>
                <th>Email</th>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="gestion-medicos-vacio"
                  >
                    No hay médicos activos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          CONFIGURAR AGENDA
      ====================================================== */}

      <div className="gestion-medicos-card">
        <h2>
          {idAgendaEditando
            ? "Editar agenda médica"
            : "Configurar agenda médica"}
        </h2>

        <form
          onSubmit={guardarAgenda}
          className="gestion-medicos-form"
        >
          <div className="gestion-medicos-campo">
            <label>Médico</label>

            <select
              name="id_medico"
              value={agendaFormulario.id_medico}
              onChange={handleAgendaChange}
              required
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

          <div className="gestion-medicos-campo">
            <label>Día</label>

            <select
              name="dia_semana"
              value={agendaFormulario.dia_semana}
              onChange={handleAgendaChange}
            >
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
          </div>

          <div className="gestion-medicos-campo">
            <label>Hora de inicio</label>

            <input
              type="text"
              name="hora_inicio"
              value={agendaFormulario.hora_inicio}
              onChange={handleAgendaChange}
              placeholder="Ej: 08:00"
              maxLength="5"
              required
            />
          </div>

          <div className="gestion-medicos-campo">
            <label>Hora de fin</label>

            <input
              type="text"
              name="hora_fin"
              value={agendaFormulario.hora_fin}
              onChange={handleAgendaChange}
              placeholder="Ej: 16:00"
              maxLength="5"
              required
            />
          </div>

          <div className="gestion-medicos-campo">
            <label>Duración del turno</label>

            <select
              name="duracion_turno"
              value={agendaFormulario.duracion_turno}
              onChange={handleAgendaChange}
            >
              <option value="10">10 minutos</option>
              <option value="15">15 minutos</option>
              <option value="20">20 minutos</option>
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">60 minutos</option>
            </select>
          </div>

          <div className="gestion-medicos-acciones">
            {idAgendaEditando && (
              <button
                type="button"
                className="boton-cancelar-agenda"
                onClick={cancelarEdicion}
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              className="boton-crear-medico"
            >
              {idAgendaEditando
                ? "Guardar cambios"
                : "Guardar agenda"}
            </button>
          </div>

          {mensajeAgenda && (
            <div
              className={
                tipoMensajeAgenda === "exito"
                  ? "gestion-medicos-mensaje-exito"
                  : "gestion-medicos-mensaje-error"
              }
            >
              {mensajeAgenda}
            </div>
          )}
        </form>
      </div>

      {/* =====================================================
          AGENDAS CONFIGURADAS
      ====================================================== */}

      <div className="gestion-medicos-card">
        <div className="gestion-medicos-list-header">
          <h2>Agendas configuradas</h2>

          <span>{agendas.length} configuradas</span>
        </div>

        <div className="gestion-medicos-tabla-contenedor">
          <table className="gestion-medicos-tabla">
            <thead>
              <tr>
                <th>Médico</th>
                <th>Día</th>
                <th>Horario</th>
                <th>Duración</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {agendas.length > 0 ? (
                agendas.map((agenda) => (
                  <tr key={agenda.id_agenda}>
                    <td>
                      {agenda.medico ||
                        `${agenda.nombre || ""} ${
                          agenda.apellido || ""
                        }`}
                    </td>

                    <td>{agenda.dia_semana}</td>

                    <td>
                      {agenda.hora_inicio} - {agenda.hora_fin}
                    </td>

                    <td>{agenda.duracion_turno} min</td>

                    <td>
                      <div className="gestion-medicos-acciones-tabla">
                        <button
                          type="button"
                          className="boton-editar-agenda"
                          onClick={() => editarAgenda(agenda)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="boton-desactivar-agenda"
                          onClick={() =>
                            desactivarAgenda(agenda.id_agenda)
                          }
                        >
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="gestion-medicos-vacio"
                  >
                    No hay agendas configuradas.
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

export default GestionMedicos;