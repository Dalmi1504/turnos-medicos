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

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            SECRETARÍA
        ========================= */}
        <Route element={<MainLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/pacientes"
            element={<Pacientes />}
          />

          <Route
            path="/medicos"
            element={<Medicos />}
          />

          <Route
            path="/turnos"
            element={<Turnos />}
          />

          <Route
            path="/agenda"
            element={<Agenda />}
          />

          <Route
            path="/recepcion"
            element={<Recepcion />}
          />

          <Route
            path="/historia-clinica"
            element={<HistoriaClinica />}
          />

          <Route
            path="/coberturas"
            element={<Coberturas />}
          />

          <Route
            path="/usuarios"
            element={<Usuarios />}
          />

          {/* =========================
              ADMINISTRADOR
          ========================= */}

          <Route
            path="/admin/bloqueos-agenda"
            element={<BloqueosAgenda />}
          />

          <Route
            path="/admin/gestion-medicos"
            element={<GestionMedicos />}
          />

        </Route>

        {/* =========================
            MÉDICO
        ========================= */}
        <Route element={<MedicoLayout />}>

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

        {/* =========================
            INICIO
        ========================= */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* =========================
            RUTA NO ENCONTRADA
        ========================= */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;