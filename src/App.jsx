import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// LAYOUTS
import MainLayout from "./layouts/MainLayout";
import MedicoLayout from "./layouts/MedicoLayout";

// SECRETARÍA
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Medicos from "./pages/Medicos";
import Turnos from "./pages/Turnos";
import Agenda from "./pages/Agenda";
import HistoriaClinica from "./pages/HistoriaClinica";
import Coberturas from "./pages/Coberturas";
import Usuarios from "./pages/Usuarios";
import Recepcion from "./pages/Recepcion";

// MÉDICO
import DashboardMedico from "./pages/medico/DashboardMedico";
import AgendaMedico from "./pages/medico/AgendaMedico";
import HistoriaClinicaMedico from "./pages/medico/HistoriaClinicaMedico";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            SECRETARÍA
        ========================= */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

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