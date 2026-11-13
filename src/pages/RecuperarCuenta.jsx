
import React from "react";
import { Link } from "react-router-dom";

function RecuperarCuenta() {
  return (
    <div style={estilos.contenedor}>
      <div style={estilos.tarjeta}>
        <h1 style={estilos.titulo}>UCBA</h1>

        <p style={estilos.subtitulo}>
          Sistema de Gestión Médica
        </p>

        <div style={estilos.icono}>🔐</div>

        <h2 style={estilos.encabezado}>
          Recuperar mi cuenta
        </h2>

        <p style={estilos.descripcion}>
          Seleccioná qué dato necesitás recuperar
          para volver a ingresar a tu cuenta.
        </p>

        <Link
          to="/recuperar-password"
          style={estilos.boton}
        >
          Olvidé mi contraseña
        </Link>

        <Link
          to="/recuperar-correo"
          style={estilos.boton}
        >
          Olvidé mi correo electrónico
        </Link>

        <Link to="/login" style={estilos.volver}>
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
    marginBottom: "28px",
  },

  icono: {
    fontSize: "44px",
    marginBottom: "15px",
  },

  encabezado: {
    color: "#17233b",
    fontSize: "23px",
  },

  descripcion: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "28px",
  },

  boton: {
    display: "block",
    padding: "14px",
    backgroundColor: "#16a6bf",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "14px",
    textAlign: "center",
    cursor: "pointer",
  },

  volver: {
    display: "inline-block",
    marginTop: "24px",
    color: "#0891b2",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default RecuperarCuenta;
