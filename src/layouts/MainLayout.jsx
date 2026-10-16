
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../styles/layout.css";

function MainLayout() {
  const navigate = useNavigate();

  // Obtener el usuario que inició sesión
  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem("usuario"));
  } catch {
    usuario = null;
  }

  const roles = usuario?.roles || [];

  const esAdministrador = roles.includes("Administrador");

  const nombreUsuario =
    usuario?.username || "Usuario";

  const rolVisible = esAdministrador
    ? "Administrador"
    : "Secretaria";

  // Cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("access_token");

    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>UCBA</h1>
          <p>Unidad de Columna de Buenos Aires</p>
        </div>

        <nav className="sidebar-nav">

          {/* SECRETARÍA Y ADMINISTRACIÓN */}

          <NavLink className="sidebar-link" to="/dashboard">
            Dashboard
          </NavLink>

          <NavLink className="sidebar-link" to="/pacientes">
            Pacientes
          </NavLink>

          <NavLink className="sidebar-link" to="/medicos">
            Médicos
          </NavLink>

          <NavLink className="sidebar-link" to="/turnos">
            Turnos
          </NavLink>

          <NavLink className="sidebar-link" to="/agenda">
            Agenda
          </NavLink>

          <NavLink className="sidebar-link" to="/recepcion">
            Recepción
          </NavLink>

          <NavLink
            className="sidebar-link"
            to="/historia-clinica"
          >
            Historia clínica
          </NavLink>

          <NavLink className="sidebar-link" to="/coberturas">
            Coberturas
          </NavLink>

          {/* SOLO ADMINISTRADOR */}

          {esAdministrador && (
            <>
              <div className="sidebar-section-title">
                ADMINISTRACIÓN
              </div>

              <NavLink
                className="sidebar-link"
                to="/admin/gestion-medicos"
              >
                Gestión de médicos
              </NavLink>

              <NavLink
                className="sidebar-link"
                to="/admin/bloqueos-agenda"
              >
                Bloqueos de agenda
              </NavLink>

              <NavLink
                className="sidebar-link"
                to="/usuarios"
              >
                Usuarios
              </NavLink>
            </>
          )}

        </nav>

        {/* CERRAR SESIÓN */}

        <button
          type="button"
          onClick={cerrarSesion}
          className="sidebar-link"
          style={{
            marginTop: "24px",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
            background: "transparent",
            border: "none",
            color: "inherit",
            padding: "12px 16px",
          }}
        >
          Cerrar sesión
        </button>

      </aside>

      <div className="main-container">
        <header className="header">
          <div className="header-title">
            <h2>Sistema de gestión médica</h2>
            <p>Unidad de Columna de Buenos Aires</p>
          </div>

          <div className="header-user">
            <strong>{nombreUsuario}</strong>
            <span>{rolVisible}</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
