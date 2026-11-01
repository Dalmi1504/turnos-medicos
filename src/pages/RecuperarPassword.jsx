
import React, { useState } from "react";
import { Link } from "react-router-dom";

function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // ==========================================
  // SOLICITAR RECUPERACIÓN DE CONTRASEÑA
  // ==========================================

  const manejarRecuperacion = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");
    setCargando(true);

    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/api/recuperar-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo procesar la solicitud.");
      }

      setMensaje(
        "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña. Revisá también la carpeta de spam."
      );

      setEmail("");
    } catch (err) {
      console.error("Error al solicitar recuperación:", err);

      setError(
        "No se pudo procesar la solicitud. Intentá nuevamente más tarde."
      );
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div style={estilos.contenedor}>
      <main style={estilos.tarjeta}>

        <h1 style={estilos.titulo}>UCBA</h1>

        <p style={estilos.subtitulo}>
          Sistema de Gestión Médica
        </p>

        <div style={estilos.icono}>🔐</div>

        <h2 style={estilos.encabezado}>
          Recuperar contraseña
        </h2>

        <p style={estilos.descripcion}>
          Ingresá el correo electrónico asociado a tu cuenta
          de UCBA. Si está registrado, te enviaremos un enlace
          para crear una contraseña nueva.
        </p>

        <form onSubmit={manejarRecuperacion}>

          {/* CORREO ELECTRÓNICO */}

          <label
            htmlFor="email-recuperacion"
            style={estilos.label}
          >
            Correo electrónico
          </label>

          <input
            id="email-recuperacion"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@correo.com"
            autoComplete="email"
            required
            disabled={cargando}
            style={estilos.input}
          />

          {/* MENSAJES */}

          {error && (
            <p style={estilos.error} role="alert">
              {error}
            </p>
          )}

          {mensaje && (
            <p style={estilos.exito} role="status">
              {mensaje}
            </p>
          )}

          {/* BOTÓN DE RECUPERACIÓN */}

          <button
            type="submit"
            disabled={cargando}
            style={{
              ...estilos.boton,
              cursor: cargando ? "not-allowed" : "pointer",
              opacity: cargando ? 0.7 : 1,
            }}
          >
            {cargando
              ? "Enviando solicitud..."
              : "Enviar enlace de recuperación"}
          </button>

        </form>

        {/* OPCIONES PARA VOLVER */}

        <nav
          style={estilos.navegacion}
          aria-label="Opciones de navegación"
        >
          <Link
            to="/recuperar-cuenta"
            style={estilos.enlace}
          >
            ← Volver a recuperación de cuenta
          </Link>

          <Link
            to="/login"
            style={estilos.enlace}
          >
            ← Volver al inicio de sesión
          </Link>
        </nav>

      </main>
    </div>
  );
}

// ==========================================
// ESTILOS DE LA PANTALLA
// ==========================================

const estilos = {
  contenedor: {
    minHeight: "100vh",
    backgroundColor: "#f2f5fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },

  tarjeta: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    boxSizing: "border-box",
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
    fontSize: "14px",
    marginBottom: "28px",
  },

  icono: {
    fontSize: "42px",
    marginBottom: "14px",
  },

  encabezado: {
    color: "#17233b",
    fontSize: "23px",
    marginBottom: "12px",
  },

  descripcion: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "26px",
  },

  label: {
    display: "block",
    textAlign: "left",
    color: "#17233b",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    marginBottom: "20px",
    boxSizing: "border-box",
    fontSize: "14px",
  },

  boton: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#16a6bf",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
  },

  error: {
    color: "#b91c1c",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "18px",
  },

  exito: {
    color: "#166534",
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "18px",
  },

  navegacion: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    marginTop: "26px",
  },

  enlace: {
    color: "#0891b2",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "bold",
  },
};

export default RecuperarPassword;
