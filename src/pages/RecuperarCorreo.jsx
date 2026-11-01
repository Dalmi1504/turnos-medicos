
import React, { useState } from "react";
import { Link } from "react-router-dom";

function RecuperarCorreo() {
  const [username, setUsername] = useState("");
  const [emailRespaldo, setEmailRespaldo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const solicitarRecuperacion = async (e) => {
    e.preventDefault();

    if (cargando) return;

    setCargando(true);
    setMensaje("");
    setError("");

    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/api/recuperar-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            email_respaldo: emailRespaldo.trim(),
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudo procesar la solicitud."
        );
      }

      setMensaje(
        datos.mensaje ||
          "Si los datos son correctos, recibirás un enlace de recuperación."
      );
    } catch (err) {
      setError(
        err.message || "Ocurrió un error. Intentá nuevamente."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.tarjeta}>
        <h1 style={estilos.titulo}>UCBA</h1>
        <p style={estilos.subtitulo}>
          Sistema de Gestión Médica
        </p>

        <div style={estilos.icono}>✉️</div>
        <h2>Recuperar mi correo electrónico</h2>

        <p style={estilos.descripcion}>
          Ingresá tu nombre de usuario y el correo de
          respaldo que verificaste anteriormente.
        </p>

        <form onSubmit={solicitarRecuperacion}>
          <label style={estilos.label}>
            Nombre de usuario
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu nombre de usuario"
            required
            maxLength={100}
            style={estilos.input}
          />

          <label style={estilos.label}>
            Correo de respaldo
          </label>
          <input
            type="email"
            value={emailRespaldo}
            onChange={(e) => setEmailRespaldo(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
            maxLength={100}
            style={estilos.input}
          />

          {mensaje && (
            <p role="status" style={estilos.exito}>
              {mensaje}
            </p>
          )}

          {error && (
            <p role="alert" style={estilos.error}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={estilos.boton}
          >
            {cargando
              ? "Enviando solicitud..."
              : "Enviar enlace de recuperación"}
          </button>
        </form>

        <Link to="/login" style={estilos.enlace}>
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}

const estilos = {
  contenedor: {
    minHeight: "100vh",
    backgroundColor: "#f2f5fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  tarjeta: {
    backgroundColor: "#fff",
    padding: "36px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
  titulo: {
    color: "#17233b",
    fontSize: "32px",
    marginBottom: "8px",
  },
  subtitulo: {
    color: "#64748b",
    marginBottom: "24px",
  },
  icono: {
    fontSize: "42px",
    marginBottom: "12px",
  },
  descripcion: {
    color: "#475569",
    lineHeight: "1.6",
    fontSize: "14px",
    marginBottom: "24px",
  },
  label: {
    display: "block",
    textAlign: "left",
    color: "#17233b",
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "7px",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    marginBottom: "18px",
    boxSizing: "border-box",
    fontSize: "14px",
  },
  boton: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#16a6bf",
    color: "white",
    border: "none",
    borderRadius: "7px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  },
  exito: {
    color: "#166534",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  error: {
    color: "#b91c1c",
    fontSize: "14px",
  },
  enlace: {
    display: "inline-block",
    marginTop: "22px",
    color: "#0891b2",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default RecuperarCorreo;
