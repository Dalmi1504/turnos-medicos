
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/portalpaciente.css";

function PortalPaciente() {
  const navigate = useNavigate();

  // ==========================================
  // OBTENER USUARIO
  // ==========================================

  let usuarioGuardado = {};

  try {
    usuarioGuardado = JSON.parse(
      localStorage.getItem("usuario") || "{}"
    );
  } catch {
    usuarioGuardado = {};
  }

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("access_token");

    navigate("/login", { replace: true });
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div className="portal-paciente-contenedor">

      <main className="portal-paciente">

        {/* ENCABEZADO */}

        <header className="portal-paciente-header">

          <div className="portal-paciente-bienvenida">
            <h1>Portal del Paciente</h1>

            <p>
              Bienvenido/a,{" "}
              <strong>
                {usuarioGuardado.username || "Paciente"}
              </strong>
            </p>
          </div>

          <button
            type="button"
            className="portal-paciente-cerrar"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>

        </header>

        {/* INTRODUCCIÓN */}

        <section className="portal-paciente-intro">
          <h2>Gestioná tus turnos médicos</h2>

          <p>
            Desde este espacio podés consultar tus
            turnos programados y solicitar nuevas
            consultas médicas.
          </p>
        </section>

        {/* OPCIONES */}

        <section className="portal-paciente-opciones">

          {/* MIS TURNOS */}

          <article className="portal-paciente-card">

            <div className="portal-paciente-icono">
              📅
            </div>

            <h3>Mis turnos</h3>

            <p>
              Consultá tus turnos reservados,
              las fechas y los profesionales
              asignados.
            </p>

            <button
              type="button"
              className="portal-paciente-boton"
              onClick={() =>
                navigate("/portal-paciente/mis-turnos")
              }
            >
              Ver mis turnos
            </button>

          </article>

          {/* SOLICITAR TURNO */}

          <article className="portal-paciente-card">

            <div className="portal-paciente-icono">
              ➕
            </div>

            <h3>Solicitar nuevo turno</h3>

            <p>
              Seleccioná una especialidad,
              un médico y un horario disponible
              para tu consulta.
            </p>

            <button
              type="button"
              className="portal-paciente-boton"
              onClick={() =>
                navigate("/portal-paciente/nuevo-turno")
              }
            >
              Sacar turno
            </button>

          </article>

        </section>

      </main>

    </div>
  );
}

export default PortalPaciente;
