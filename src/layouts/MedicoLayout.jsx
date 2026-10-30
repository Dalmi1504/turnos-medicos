
import {
  NavLink,
  Outlet,
  Navigate,
  useNavigate
} from "react-router-dom";

import "../styles/layout.css";
import "../styles/medicoLayout.css";

function MedicoLayout() {
  const navigate = useNavigate();

  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem("usuario"));
  } catch {
    usuario = null;
  }

  if (!usuario || !usuario.roles?.includes("Médico")) {
    return <Navigate to="/login" replace />;
  }

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");

    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refresh_token");

    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout medico-layout">

      {/* MENÚ LATERAL */}
      <aside className="sidebar medico-sidebar">

        <div className="sidebar-logo">
          <h1>UCBA</h1>
          <p>Unidad de Columna de Buenos Aires</p>
        </div>

        <nav className="sidebar-nav">

          <NavLink
            to="/medico/dashboard"
            className="sidebar-link"
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/medico/agenda"
            className="sidebar-link"
          >
            Mi agenda
          </NavLink>

          <NavLink
            to="/medico/historia-clinica"
            className="sidebar-link"
          >
            Historia clínica
          </NavLink>

        </nav>

        {/* CERRAR SESIÓN */}
        <button
          type="button"
          className="sidebar-link medico-cerrar-sesion"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>

      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="main-container medico-main">

        {/* ENCABEZADO BLANCO */}
        <header className="header">

          <div className="header-title">
            <h2>Sistema de gestión médica</h2>
            <p>Unidad de Columna de Buenos Aires</p>
          </div>

          <div className="header-user">
            <strong>{usuario.username || "Médico"}</strong>
            <span>Médico</span>
          </div>

        </header>

        {/* CONTENIDO */}
        <main className="page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MedicoLayout;
