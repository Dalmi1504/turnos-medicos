
import { NavLink, Outlet, Navigate } from "react-router-dom";

function MedicoLayout() {
  // Recuperamos el usuario guardado al iniciar sesión
  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem("usuario"));
  } catch {
    usuario = null;
  }

  // Comprobación provisoria del frontend
  if (!usuario || !usuario.roles?.includes("Médico")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Clínica UCBA</h2>
          <p>Portal médico</p>
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

        <div className="sidebar-user">
          <strong>{usuario.username}</strong>
          <span>Médico</span>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MedicoLayout;
