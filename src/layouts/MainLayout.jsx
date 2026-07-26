import { NavLink, Outlet } from "react-router-dom";
import "../styles/layout.css";

function MainLayout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>UCBA</h1>
          <p>Unidad de Columna de Buenos Aires</p>
        </div>

        <nav className="sidebar-nav">
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

          <NavLink className="sidebar-link" to="/historia-clinica">
            Historia clínica
          </NavLink>

          <NavLink className="sidebar-link" to="/coberturas">
            Coberturas
          </NavLink>

          <NavLink className="sidebar-link" to="/usuarios">
            Usuarios
          </NavLink>
        </nav>
      </aside>

      <div className="main-container">
        <header className="header">
          <div className="header-title">
            <h2>Sistema de gestión médica</h2>
            <p>Unidad de Columna de Buenos Aires</p>
          </div>

          <div className="header-user">
            <strong>Dalma Lening</strong>
            <span>Secretaria</span>
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