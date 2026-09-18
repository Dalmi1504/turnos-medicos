import { NavLink, Outlet } from "react-router-dom";

function MedicoLayout() {
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
          <strong>Laura Gomez</strong>
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