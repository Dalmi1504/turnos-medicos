
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

function CorreoRespaldo() {
  const navigate = useNavigate();

  const [informacion, setInformacion] = useState(null);
  const [emailRespaldo, setEmailRespaldo] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarCorreo() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Tu sesión venció. Iniciá sesión nuevamente.");
        setCargando(false);
        return;
      }

      try {
        const respuesta = await fetch(
          `${API}/api/mi-correo-respaldo`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controlador.signal,
          }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.detail || "No se pudo consultar el correo."
          );
        }

        setInformacion(datos);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Error de conexión.");
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarCorreo();

    return () => controlador.abort();
  }, []);

  async function solicitarVerificacion(evento) {
    evento.preventDefault();

    setMensaje("");
    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Tu sesión venció. Iniciá sesión nuevamente.");
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await fetch(
        `${API}/api/solicitar-correo-respaldo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email_respaldo: emailRespaldo.trim(),
            password_actual: passwordActual,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudo enviar la verificación."
        );
      }

      setMensaje(datos.mensaje);
      setPasswordActual("");
      setEmailRespaldo("");
    } catch (err) {
      setError(err.message || "Ocurrió un error.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div style={estilos.fondo}>
      <main style={estilos.tarjeta}>
        <h1 style={estilos.titulo}>Mi correo de respaldo</h1>

        <p style={estilos.descripcion}>
          Agregá un correo alternativo para proteger tu cuenta
          de UCBA. Puede ser tuyo o de un familiar de confianza.
        </p>

        {cargando ? (
          <p>Cargando información...</p>
        ) : (
          <>
            {informacion && (
              <section style={estilos.estado}>
                <h3>Correo registrado</h3>

                <p>
                  {informacion.email_respaldo ||
                    "Todavía no configuraste un correo de respaldo."}
                </p>

                <p>
                  <strong>Estado: </strong>
                  {informacion.email_respaldo_verificado
                    ? "Verificado"
                    : "Sin verificar"}
                </p>
              </section>
            )}

            <form onSubmit={solicitarVerificacion}>
              <label style={estilos.etiqueta}>
                Nuevo correo de respaldo
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

              <label style={estilos.etiqueta}>
                Contraseña actual de UCBA
              </label>

              <input
                type="password"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                placeholder="Ingresá tu contraseña"
                required
                style={estilos.input}
              />

              <p style={estilos.ayuda}>
                Enviaremos un enlace al correo indicado.
                El enlace vencerá en 15 minutos.
                Tu respaldo actual se conservará hasta
                que confirmes el nuevo.
              </p>

              <button
                type="submit"
                disabled={enviando || cargando || !informacion}
                style={estilos.boton}
              >
                {enviando
                  ? "Enviando..."
                  : "Enviar enlace de verificación"}
              </button>
            </form>

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
          </>
        )}

        <button
          type="button"
          onClick={() => navigate("/portal-paciente")}
          style={estilos.volver}
        >
          Volver al portal
        </button>
      </main>
    </div>
  );
}

const estilos = {
  fondo: {
    minHeight: "100vh",
    background: "#f2f5fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  tarjeta: {
    width: "100%",
    maxWidth: "480px",
    background: "#fff",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
  titulo: {
    color: "#17233b",
    marginBottom: "12px",
  },
  descripcion: {
    color: "#64748b",
    lineHeight: 1.6,
  },
  estado: {
    background: "#f2f5fb",
    padding: "16px",
    borderRadius: "8px",
    margin: "24px 0",
    overflowWrap: "anywhere",
  },
  etiqueta: {
    display: "block",
    fontWeight: "bold",
    marginTop: "18px",
    marginBottom: "8px",
    color: "#17233b",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
  },
  ayuda: {
    fontSize: "13px",
    lineHeight: 1.6,
    color: "#64748b",
    marginTop: "16px",
  },
  boton: {
    width: "100%",
    background: "#16a6bf",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "13px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "12px",
  },
  volver: {
    display: "block",
    margin: "22px auto 0",
    background: "none",
    border: "none",
    color: "#16a6bf",
    cursor: "pointer",
    fontWeight: "bold",
  },
  exito: {
    color: "#166534",
    marginTop: "18px",
  },
  error: {
    color: "#b91c1c",
    marginTop: "18px",
  },
};

export default CorreoRespaldo;
