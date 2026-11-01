
import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function VerificarCorreoRespaldo() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [estado, setEstado] = useState("pendiente");
  const [mensaje, setMensaje] = useState(
    "Confirmá que querés utilizar esta dirección como correo de respaldo de tu cuenta UCBA."
  );

  const verificarCorreo = async () => {
    if (estado !== "pendiente") return;

    if (!token) {
      setEstado("error");
      setMensaje("El enlace de verificación no es válido.");
      return;
    }

    setEstado("cargando");
    setMensaje("Estamos verificando tu correo de respaldo...");

    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/api/verificar-correo-respaldo",
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
            "No se pudo verificar el correo de respaldo."
        );
      }

      setEstado("exito");
      setMensaje(
        datos.mensaje ||
          "Tu correo de respaldo fue verificado correctamente."
      );
    } catch (error) {
      setEstado("error");
      setMensaje(
        error.message ||
          "Ocurrió un error al verificar el correo."
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
            <h2>Verificar correo de respaldo</h2>
          </>
        )}

        {estado === "cargando" && (
          <>
            <div style={estilos.icono}>⏳</div>
            <h2>Verificando correo...</h2>
          </>
        )}

        {estado === "exito" && (
          <>
            <div style={estilos.icono}>✅</div>
            <h2>¡Correo verificado!</h2>
          </>
        )}

        {estado === "error" && (
          <>
            <div style={estilos.icono}>⚠️</div>
            <h2>No pudimos verificar el correo</h2>
          </>
        )}

        <p style={estilos.mensaje}>{mensaje}</p>

        {estado === "pendiente" && (
          <button
            type="button"
            onClick={verificarCorreo}
            style={{ ...estilos.boton, border: "none", cursor: "pointer" }}
          >
            Confirmar correo de respaldo
          </button>
        )}

        {estado !== "pendiente" && estado !== "cargando" && (
          <Link to="/login" style={estilos.boton}>
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
    display: "inline-block",
    backgroundColor: "#16a6bf",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default VerificarCorreoRespaldo;
