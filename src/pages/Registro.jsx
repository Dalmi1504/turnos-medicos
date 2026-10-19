
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/registro.css";

const formularioInicial = {
  nombre: "",
  apellido: "",
  tipo_documento: "DNI argentino",
  dni: "",
  telefono: "",
  email: "",
  password: "",
  confirmarPassword: ""
};

function Registro() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState(formularioInicial);
  const [errores, setErrores] = useState({});
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");

  // =====================================================
  // VALIDAR TODOS LOS CAMPOS
  // =====================================================

  const validarCampos = (datos) => {
    const nuevosErrores = {};

    const nombre = datos.nombre.trim();
    const apellido = datos.apellido.trim();
    const dni = datos.dni.trim().toUpperCase();
    const email = datos.email.trim().toLowerCase();
    const telefono = datos.telefono.trim();

    const expresionNombre = /^[\p{L} '-]+$/u;
    const expresionEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // NOMBRE

    if (!nombre) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (nombre.length < 2 || nombre.length > 30) {
      nuevosErrores.nombre =
        "El nombre debe tener entre 2 y 30 caracteres.";
    } else if (!expresionNombre.test(nombre)) {
      nuevosErrores.nombre =
        "El nombre solo puede contener letras.";
    }

    // APELLIDO

    if (!apellido) {
      nuevosErrores.apellido = "El apellido es obligatorio.";
    } else if (apellido.length < 2 || apellido.length > 30) {
      nuevosErrores.apellido =
        "El apellido debe tener entre 2 y 30 caracteres.";
    } else if (!expresionNombre.test(apellido)) {
      nuevosErrores.apellido =
        "El apellido solo puede contener letras.";
    }

    // TIPO DE DOCUMENTO

    const tiposValidos = [
      "DNI argentino",
      "Documento extranjero",
      "Pasaporte"
    ];

    if (!tiposValidos.includes(datos.tipo_documento)) {
      nuevosErrores.tipo_documento =
        "Seleccioná un tipo de documento válido.";
    }

    // DOCUMENTO

    if (!dni) {
      nuevosErrores.dni =
        "El número de documento es obligatorio.";
    } else if (datos.tipo_documento === "DNI argentino") {
      if (!/^\d{7,8}$/.test(dni)) {
        nuevosErrores.dni =
          "El DNI argentino debe tener 7 u 8 números.";
      }
    } else if (!/^[A-Z0-9]{4,20}$/.test(dni)) {
      nuevosErrores.dni =
        "El documento debe tener entre 4 y 20 letras o números.";
    }

    // TELÉFONO OPCIONAL

    if (telefono) {
      const numeros = telefono.replace(/[\s()+-]/g, "");

      if (!/^\d{7,15}$/.test(numeros)) {
        nuevosErrores.telefono =
          "Ingresá un teléfono válido.";
      }
    }

    // CORREO

    if (!email) {
      nuevosErrores.email =
        "El correo electrónico es obligatorio.";
    } else if (!expresionEmail.test(email)) {
      nuevosErrores.email =
        "Ingresá un correo electrónico válido.";
    } else if (email.length > 50) {
      nuevosErrores.email =
        "El correo no puede superar los 50 caracteres.";
    }

    // CONTRASEÑA

    if (!datos.password) {
      nuevosErrores.password =
        "La contraseña es obligatoria.";
    } else if (datos.password.length < 8) {
      nuevosErrores.password =
        "La contraseña debe tener al menos 8 caracteres.";
    } else if (datos.password.length > 128) {
      nuevosErrores.password =
        "La contraseña no puede superar los 128 caracteres.";
    } else if (!/[A-Z]/.test(datos.password)) {
      nuevosErrores.password =
        "La contraseña debe contener una mayúscula.";
    } else if (!/[a-z]/.test(datos.password)) {
      nuevosErrores.password =
        "La contraseña debe contener una minúscula.";
    } else if (!/\d/.test(datos.password)) {
      nuevosErrores.password =
        "La contraseña debe contener un número.";
    } else if (
      new TextEncoder().encode(datos.password).length > 72
    ) {
      nuevosErrores.password =
        "La contraseña es demasiado larga.";
    }

    // CONFIRMACIÓN DE CONTRASEÑA

    if (!datos.confirmarPassword) {
      nuevosErrores.confirmarPassword =
        "Confirmá tu contraseña.";
    } else if (
      datos.password !== datos.confirmarPassword
    ) {
      nuevosErrores.confirmarPassword =
        "Las contraseñas no coinciden.";
    }

    return nuevosErrores;
  };

  // =====================================================
  // ACTUALIZAR FORMULARIO
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    const nuevosDatos = {
      ...formulario,
      [name]: name === "dni" ? value.toUpperCase() : value
    };

    setFormulario(nuevosDatos);
    setErrorGeneral("");
    setMensaje("");

    if (intentoEnviar) {
      setErrores(validarCampos(nuevosDatos));
    }
  };

  // =====================================================
  // ENVIAR REGISTRO
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIntentoEnviar(true);
    setErrorGeneral("");
    setMensaje("");

    const nuevosErrores = validarCampos(formulario);
    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/api/registro",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            nombre: formulario.nombre.trim(),
            apellido: formulario.apellido.trim(),
            tipo_documento: formulario.tipo_documento,
            dni: formulario.dni.trim().toUpperCase(),
            telefono: formulario.telefono.trim(),
            email: formulario.email.trim().toLowerCase(),
            password: formulario.password
          })
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        const detalle = data.detail;

        throw new Error(
          typeof detalle === "string"
            ? detalle
            : "No se pudo completar el registro."
        );
      }

      setMensaje(
        "¡Registro exitoso! Ya podés iniciar sesión."
      );

      setFormulario({ ...formularioInicial });
      setErrores({});
      setIntentoEnviar(false);

    } catch (error) {
      setErrorGeneral(
        error.message || "Ocurrió un error al registrarte."
      );
    } finally {
      setCargando(false);
    }
  };

  // =====================================================
  // MOSTRAR CAMPO CON ERROR
  // =====================================================

  const mostrarError = (campo) => {
    return errores[campo] ? (
      <span className="registro-campo-error" role="alert">
        {errores[campo]}
      </span>
    ) : null;
  };

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <div className="registro-contenedor">
      <div className="registro-card">

        <h2>Crear cuenta de paciente</h2>

        <p>
          Completá tus datos para registrarte y
          solicitar turnos médicos.
        </p>

        <form onSubmit={handleSubmit} noValidate>

          {/* NOMBRE */}

          <div className="registro-campo">
            <label htmlFor="nombre">Nombre</label>

            <input
              id="nombre"
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={handleChange}
              className={errores.nombre ? "registro-input-error" : ""}
              aria-invalid={Boolean(errores.nombre)}
              placeholder="Ingresá tu nombre"
              maxLength={30}
              autoComplete="given-name"
            />

            {mostrarError("nombre")}
          </div>

          {/* APELLIDO */}

          <div className="registro-campo">
            <label htmlFor="apellido">Apellido</label>

            <input
              id="apellido"
              type="text"
              name="apellido"
              value={formulario.apellido}
              onChange={handleChange}
              className={errores.apellido ? "registro-input-error" : ""}
              aria-invalid={Boolean(errores.apellido)}
              placeholder="Ingresá tu apellido"
              maxLength={30}
              autoComplete="family-name"
            />

            {mostrarError("apellido")}
          </div>

          {/* TIPO DE DOCUMENTO */}

          <div className="registro-campo">
            <label htmlFor="tipo_documento">
              Tipo de documento
            </label>

            <select
              id="tipo_documento"
              name="tipo_documento"
              value={formulario.tipo_documento}
              onChange={handleChange}
              className={
                errores.tipo_documento
                  ? "registro-input-error"
                  : ""
              }
              aria-invalid={Boolean(errores.tipo_documento)}
            >
              <option value="DNI argentino">
                DNI argentino
              </option>
              <option value="Documento extranjero">
                Documento extranjero
              </option>
              <option value="Pasaporte">
                Pasaporte
              </option>
            </select>

            {mostrarError("tipo_documento")}
          </div>

          {/* DOCUMENTO */}

          <div className="registro-campo">
            <label htmlFor="dni">
              Número de documento
            </label>

            <input
              id="dni"
              type="text"
              name="dni"
              value={formulario.dni}
              onChange={handleChange}
              className={errores.dni ? "registro-input-error" : ""}
              aria-invalid={Boolean(errores.dni)}
              placeholder={
                formulario.tipo_documento === "DNI argentino"
                  ? "Ej: 12345678"
                  : "Ej: AB123456"
              }
              maxLength={
                formulario.tipo_documento === "DNI argentino"
                  ? 8
                  : 20
              }
              inputMode={
                formulario.tipo_documento === "DNI argentino"
                  ? "numeric"
                  : "text"
              }
            />

            {mostrarError("dni")}
          </div>

          {/* TELÉFONO */}

          <div className="registro-campo">
            <label htmlFor="telefono">
              Teléfono (opcional)
            </label>

            <input
              id="telefono"
              type="tel"
              name="telefono"
              value={formulario.telefono}
              onChange={handleChange}
              className={
                errores.telefono ? "registro-input-error" : ""
              }
              aria-invalid={Boolean(errores.telefono)}
              placeholder="Ej: 1123456789"
              maxLength={50}
              autoComplete="tel"
            />

            {mostrarError("telefono")}
          </div>

          {/* CORREO */}

          <div className="registro-campo">
            <label htmlFor="email">
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formulario.email}
              onChange={handleChange}
              className={
                errores.email ? "registro-input-error" : ""
              }
              aria-invalid={Boolean(errores.email)}
              placeholder="ejemplo@correo.com"
              maxLength={50}
              autoComplete="email"
            />

            {mostrarError("email")}
          </div>

          {/* CONTRASEÑA */}

          <div className="registro-campo">
            <label htmlFor="password">
              Contraseña
            </label>

            <div className="registro-password">
              <input
                id="password"
                type={mostrarPassword ? "text" : "password"}
                name="password"
                value={formulario.password}
                onChange={handleChange}
                className={
                  errores.password ? "registro-input-error" : ""
                }
                aria-invalid={Boolean(errores.password)}
                placeholder="Ingresá una contraseña"
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarPassword(!mostrarPassword)
                }
              >
                {mostrarPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            <small>
              Mínimo 8 caracteres, una mayúscula,
              una minúscula y un número.
            </small>

            {mostrarError("password")}
          </div>

          {/* CONFIRMAR CONTRASEÑA */}

          <div className="registro-campo">
            <label htmlFor="confirmarPassword">
              Confirmar contraseña
            </label>

            <div className="registro-password">
              <input
                id="confirmarPassword"
                type={
                  mostrarConfirmacion ? "text" : "password"
                }
                name="confirmarPassword"
                value={formulario.confirmarPassword}
                onChange={handleChange}
                className={
                  errores.confirmarPassword
                    ? "registro-input-error"
                    : ""
                }
                aria-invalid={Boolean(errores.confirmarPassword)}
                placeholder="Repetí tu contraseña"
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarConfirmacion(
                    !mostrarConfirmacion
                  )
                }
              >
                {mostrarConfirmacion ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            {mostrarError("confirmarPassword")}
          </div>

          {/* ERROR DEL SERVIDOR */}

          {errorGeneral && (
            <p className="registro-error" role="alert">
              {errorGeneral}
            </p>
          )}

          {/* REGISTRO EXITOSO */}

          {mensaje && (
            <p className="registro-exito" role="status">
              {mensaje}
            </p>
          )}

          {/* BOTÓN */}

          <button
            type="submit"
            className="registro-boton"
            disabled={cargando}
          >
            {cargando ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="registro-login">
          ¿Ya tenés una cuenta?
          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Iniciar sesión
          </button>
        </p>

      </div>
    </div>
  );
}

export default Registro;
