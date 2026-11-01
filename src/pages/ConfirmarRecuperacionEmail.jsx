
import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function ConfirmarRecuperacionEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [estado, setEstado] = useState("pendiente");
  const [mensaje, setMensaje] = useState("");
  const [emailPrincipal, setEmailPrincipal] = useState("");

  const confirmarRecuperacion = async () => {
    if (estado !== "pendiente") return;

    if (!token) {
      setEstado("error");
      setMensaje("El enlace de recuperación no es válido.");
      return;
    }

    setEstado("cargando");
    setMensaje("Estamos recuperando tu correo electrónico...");

    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/api/confirmar-recuperacion-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail ||
            "No se pudo recuperar el correo electrónico."
        );
      }

      setEmailPrincipal(datos.email);
      setMensaje(
        datos.mensaje ||
          "Recuperaste tu correo electrónico correctamente."
      );
      setEstado("exito");
    } catch (error) {
      setEstado("error");
      setMensaje(
        error.message ||
          "Ocurrió un error al recuperar el correo."
      );
    }
  };

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.tarjeta}>
        <h1 style={estilos.titulo}>UCBA</h1>

        <p style={estilos.subtitulo}>
          Sistema de Gestión Médica
        </p>

        {estado === "pendiente" && (
          <>
            <div style={estilos.icono}>✉️</div>
            <h2>Recuperar correo electrónico</h2>
            <p style={estilos.mensaje}>
              Confirmá la recuperación para consultar
              el correo principal de tu cuenta UCBA.
            </p>

            <button
              type="button"
              onClick={confirmarRecuperacion}
              style={estilos.boton}
            >
              Mostrar mi correo principal
            </button>
          </>
        )}

        {estado === "cargando" && (
          <>
            <div style={estilos.icono}>⏳</div>
            <h2>Recuperando correo...</h2>
            <p style={estilos.mensaje}>{mensaje}</p>
          </>
        )}

        {estado === "exito" && (
          <>
            <div style={estilos.icono}>✅</div>
            <h2>¡Correo recuperado!</h2>
            <p style={estilos.mensaje}>{mensaje}</p>

            <div style={estilos.resultado}>
              <p style={estilos.etiqueta}>
                Tu correo principal registrado es:
              </p>
              <p style={estilos.email}>
                {emailPrincipal}
              </p>
            </div>
          </>
        )}

        {estado === "error" && (
          <>
            <div style={estilos.icono}>⚠️</div>
            <h2>No pudimos recuperar el correo</h2>
            <p role="alert" style={estilos.mensaje}>
              {mensaje}
            </p>
            <p style={estilos.ayuda}>
              Si el enlace venció o ya fue utilizado,
              solicitá uno nuevo.
            </p>
            <Link to="/recuperar-correo" style={estilos.enlace}>
              Solicitar otro enlace
            </Link>
          </>
        )}

        {estado === "exito" && (
          <Link to="/login" style={estilos.enlace}>
            Ir al inicio de sesión
          </Link>
        )}
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
    backgroundColor: "#ffffff",
    padding: "40px",
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
    marginBottom: "30px",
  },
  icono: {
    fontSize: "45px",
    marginBottom: "15px",
  },
  mensaje: {
    color: "#475569",
    lineHeight: "1.6",
    marginTop: "15px",
    marginBottom: "25px",
  },
  boton: {
    backgroundColor: "#16a6bf",
    color: "#ffffff",
    padding: "13px 22px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  },
  resultado: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bae6fd",
    padding: "18px",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  etiqueta: {
    fontSize: "14px",
    color: "#475569",
    marginBottom: "8px",
  },
  email: {
    fontSize: "17px",
    fontWeight: "bold",
    color: "#17233b",
    overflowWrap: "anywhere",
  },
  ayuda: {
    color: "#64748b",
    fontSize: "13px",
  },
  enlace: {
    display: "inline-block",
    marginTop: "16px",
    color: "#0891b2",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default ConfirmarRecuperacionEmail;
