
import React, { useState } from "react";
import { Link } from "react-router-dom";

function RecuperarCorreo() {
  const [dni, setDni] = useState("");
  const [emailRespaldo, setEmailRespaldo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // SOLICITAR RECUPERACIÓN DE CORREO
  // ==========================================

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
            dni: dni.trim(),
            email_respaldo: emailRespaldo.trim(),
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          typeof datos.detail === "string"
            ? datos.detail
            : "No se pudo procesar la solicitud."
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

        <div style={estilos.icono}>✉️</div>

        <h2 style={estilos.encabezado}>
          Recuperar mi correo electrónico
        </h2>

        <p style={estilos.descripcion}>
          Ingresá tu DNI y el correo de respaldo que
          verificaste anteriormente para recuperar
          tu correo electrónico principal.
        </p>

        <form onSubmit={solicitarRecuperacion}>

          {/* DNI */}

          <label htmlFor="dni-recuperacion" style={estilos.label}>
            DNI
          </label>

          <input
            id="dni-recuperacion"
            type="text"
            inputMode="numeric"
            value={dni}
            onChange={(e) => {
              setDni(e.target.value.replace(/\D/g, ""));
            }}
            placeholder="Ingresá tu DNI sin puntos"
            autoComplete="off"
            required
            maxLength={20}
            style={estilos.input}
            disabled={cargando}
          />

          {/* CORREO DE RESPALDO */}

          <label htmlFor="email-respaldo" style={estilos.label}>
            Correo de respaldo
          </label>

          <input
            id="email-respaldo"
            type="email"
            value={emailRespaldo}
            onChange={(e) => setEmailRespaldo(e.target.value)}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            required
            maxLength={100}
            style={estilos.input}
            disabled={cargando}
          />

          {/* MENSAJES */}

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

          {/* BOTÓN */}

          <button
            type="submit"
            disabled={cargando}
            style={{
              ...estilos.boton,
              opacity: cargando ? 0.7 : 1,
              cursor: cargando ? "not-allowed" : "pointer",
            }}
          >
            {cargando
              ? "Enviando solicitud..."
              : "Enviar enlace de recuperación"}
          </button>

        </form>

        {/* NAVEGACIÓN */}

        <nav style={estilos.navegacion}>
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
// ESTILOS
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
    padding: "36px",
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
    marginBottom: "24px",
  },

  icono: {
    fontSize: "42px",
    marginBottom: "12px",
  },

  encabezado: {
    color: "#17233b",
    fontSize: "23px",
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
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    fontWeight: "bold",
    fontSize: "14px",
  },

  exito: {
    color: "#166534",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "18px",
  },

  error: {
    color: "#b91c1c",
    fontSize: "14px",
    marginBottom: "18px",
  },

  navegacion: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    marginTop: "24px",
  },

  enlace: {
    color: "#0891b2",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "14px",
  },
};

export default RecuperarCorreo;
