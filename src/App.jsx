
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// LAYOUTS
import MainLayout from "./layouts/MainLayout";
import MedicoLayout from "./layouts/MedicoLayout";

// SECRETARÍA
import Dashboard from "./pages/secretaria/Dashboard";
import Pacientes from "./pages/secretaria/Pacientes";
import Medicos from "./pages/secretaria/Medicos";
import Turnos from "./pages/secretaria/Turnos";
import Agenda from "./pages/secretaria/Agenda";
import HistoriaClinica from "./pages/secretaria/HistoriaClinica";
import Coberturas from "./pages/secretaria/Coberturas";
import Usuarios from "./pages/Usuarios";
import Recepcion from "./pages/secretaria/Recepcion";

// MÉDICO
import DashboardMedico from "./pages/medico/DashboardMedico";
import AgendaMedico from "./pages/medico/AgendaMedico";
import HistoriaClinicaMedico from "./pages/medico/HistoriaClinicaMedico";

// ADMINISTRADOR
import BloqueosAgenda from "./pages/admin/BloqueosAgenda";
import GestionMedicos from "./pages/admin/GestionMedicos";

// LOGIN
import Login from "./pages/Login";

// PACIENTE - ARCHIVOS DE MAGGIE
import Registro from "./pages/Registro";
import PortalPaciente from "./pages/PortalPaciente";
import MisTurnosPaciente from "./pages/MisTurnosPaciente";
import SolicitarTurnoPaciente from "./pages/SolicitarTurnoPaciente";
import RecuperarPassword from "./pages/RecuperarPassword";

// =============================================
// OBTENER USUARIO GUARDADO
// =============================================

function obtenerUsuario() {
  try {
    return JSON.parse(localStorage.getItem("usuario"));
  } catch {
    return null;
  }
}

// =============================================
// ELEGIR PANTALLA SEGÚN ROL
// =============================================

function rutaInicial(usuario) {
  if (!usuario) return "/login";

  const roles = usuario.roles || [];

  if (roles.includes("Administrador")) {
    return "/dashboard";
  }

  if (roles.includes("Secretaria")) {
    return "/dashboard";
  }

  if (roles.includes("Médico")) {
    return "/medico/dashboard";
  }

  // NUEVO: PACIENTE
  if (roles.includes("Paciente")) {
    return "/portal-paciente";
  }

  return "/login";
}

// =============================================
// PROTEGER RUTAS POR ROL
// =============================================

function RutaProtegida({ rolesPermitidos, children }) {
  const usuario = obtenerUsuario();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const roles = usuario.roles || [];

  const autorizado = rolesPermitidos.some(
    (rol) => roles.includes(rol)
  );

  if (!autorizado) {
    return (
      <Navigate
        to={rutaInicial(usuario)}
        replace
      />
    );
  }

  return children;
}

// =============================================
// REDIRECCIÓN INICIAL
// =============================================

function Inicio() {
  const usuario = obtenerUsuario();

  return (
    <Navigate
      to={rutaInicial(usuario)}
      replace
    />
  );
}

// =============================================
// APLICACIÓN
// =============================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* REGISTRO PÚBLICO DE PACIENTES */}
        <Route path="/registro" element={<Registro />} />

        {/* RECUPERACIÓN DE CONTRASEÑA */}
        <Route
          path="/recuperar-password"
          element={<RecuperarPassword />}
        />

        {/* SECRETARÍA Y ADMINISTRACIÓN */}
        <Route
          element={
            <RutaProtegida
              rolesPermitidos={["Secretaria", "Administrador"]}
            >
              <MainLayout />
            </RutaProtegida>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/medicos" element={<Medicos />} />
          <Route path="/turnos" element={<Turnos />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/recepcion" element={<Recepcion />} />
          <Route
            path="/historia-clinica"
            element={<HistoriaClinica />}
          />
          <Route path="/coberturas" element={<Coberturas />} />

          {/* SOLO ADMINISTRADOR */}
          <Route
            path="/usuarios"
            element={
              <RutaProtegida rolesPermitidos={["Administrador"]}>
                <Usuarios />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/bloqueos-agenda"
            element={
              <RutaProtegida rolesPermitidos={["Administrador"]}>
                <BloqueosAgenda />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/gestion-medicos"
            element={
              <RutaProtegida rolesPermitidos={["Administrador"]}>
                <GestionMedicos />
              </RutaProtegida>
            }
          />
        </Route>

        {/* MÉDICO */}
        <Route
          element={
            <RutaProtegida rolesPermitidos={["Médico"]}>
              <MedicoLayout />
            </RutaProtegida>
          }
        >
          <Route
            path="/medico/dashboard"
            element={<DashboardMedico />}
          />

          <Route
            path="/medico/agenda"
            element={<AgendaMedico />}
          />

          <Route
            path="/medico/historia-clinica"
            element={<HistoriaClinicaMedico />}
          />
        </Route>

        {/* PACIENTE */}
        <Route
          path="/portal-paciente"
          element={
            <RutaProtegida rolesPermitidos={["Paciente"]}>
              <PortalPaciente />
            </RutaProtegida>
          }
        />

        <Route
          path="/portal-paciente/mis-turnos"
          element={
            <RutaProtegida rolesPermitidos={["Paciente"]}>
              <MisTurnosPaciente />
            </RutaProtegida>
          }
        />

        <Route
          path="/portal-paciente/nuevo-turno"
          element={
            <RutaProtegida rolesPermitidos={["Paciente"]}>
              <SolicitarTurnoPaciente />
            </RutaProtegida>
          }
        />

        {/* INICIO */}
        <Route path="/" element={<Inicio />} />

        {/* RUTA DESCONOCIDA */}
        <Route path="*" element={<Inicio />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
