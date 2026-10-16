import React from 'react';
import { useNavigate } from 'react-router-dom';

function PortalPaciente() {
  const navigate = useNavigate();
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario')) || {};

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '15px', marginBottom: '20px' }}>
        <h2>Portal del Paciente - Bienvenid@, {usuarioGuardado.username || 'Paciente'}</h2>
        <button 
          onClick={cerrarSesion} 
          style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cerrar Sesión
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
          <h3>📅 Mis Turnos</h3>
          <p>Aquí podrás consultar los turnos que tienes reservados con los médicos.</p>
          <button 
            onClick={() => navigate('/portal-paciente/mis-turnos')}
            style={{ padding: '10px 15px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Ver mis turnos
          </button>
        </div>

        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
          <h3>➕ Solicitar Nuevo Turno</h3>
          <p>Selecciona especialidad, médico y horario disponible para tu consulta.</p>
          <button 
            onClick={() => navigate('/portal-paciente/nuevo-turno')}
            style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Sacar Turno
          </button>
        </div>
      </div>
    </div>
  );
}

export default PortalPaciente;