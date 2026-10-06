import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Medicos from "./pages/Medicos";
import Turnos from "./pages/Turnos";
import Agenda from "./pages/Agenda";
import HistoriaClinica from "./pages/HistoriaClinica";
import Coberturas from "./pages/Coberturas";
import Usuarios from "./pages/Usuarios";
import Recepcion from "./pages/Recepcion";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import PortalPaciente from "./pages/PortalPaciente";
import MisTurnosPaciente from "./pages/MisTurnosPaciente";
import SolicitarTurnoPaciente from "./pages/SolicitarTurnoPaciente";
import RecuperarPassword from './pages/RecuperarPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        {/* Ruta pública del Login (fuera del MainLayout para que no muestre la barra lateral) */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta pública del Registro */}
        <Route path="/registro" element={<Registro />} />

        {/* Rutas protegidas que usan el MainLayout (con barra lateral y menú) */}
        <Route element={<MainLayout />}>
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
          <Route path="/usuarios" element={<Usuarios />} />
        </Route>

        {/* Al entrar a la raíz del sitio, redirige al Login */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Cualquier ruta que no exista redirige al login */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
        <Route path="/portal-paciente" element={<PortalPaciente />} />

        <Route path="/portal-paciente/mis-turnos" element={<MisTurnosPaciente />} />
        <Route path="/portal-paciente/nuevo-turno" element={<SolicitarTurnoPaciente />} />  
      </Routes>
    </BrowserRouter>
  );
}

export default App;