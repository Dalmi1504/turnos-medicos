import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [estadisticas, setEstadisticas] = useState({
    medicos: 0,
    pacientes: 0,
    turnos: 0,
    coberturas: 0
  });

  // Cargar datos reales desde FastAPI para las estadísticas
  const obtenerEstadisticas = async () => {
    try {
      const [resMedicos, resPacientes, resTurnos, resCoberturas] = await Promise.all([
        fetch('http://127.0.0.1:8000/medicos'),
        fetch('http://127.0.0.1:8000/pacientes'),
        fetch('http://127.0.0.1:8000/turnos'),
        fetch('http://127.0.0.1:8000/coberturas').catch(() => ({ ok: false }))
      ]);

      const medicosData = resMedicos.ok ? await resMedicos.json() : [];
      const pacientesData = resPacientes.ok ? await resPacientes.json() : [];
      const turnosData = resTurnos.ok ? await resTurnos.json() : [];
      const coberturasData = resCoberturas.ok ? await resCoberturas.json() : [];

      setEstadisticas({
        medicos: medicosData.filter(m => m.activo !== false).length,
        pacientes: pacientesData.filter(p => p.activo !== false).length,
        turnos: turnosData.length,
        coberturas: coberturasData.filter(c => c.activo !== false).length
      });
    } catch (error) {
      console.error('Error al cargar las estadísticas:', error);
    }
  };

  useEffect(() => {
    obtenerEstadisticas();
  }, []);

  return (
    <section style={{ padding: '24px', fontFamily: 'Arial, sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', margin: '0 0 8px 0', color: '#2c3e50' }}>Dashboard</h1>
        <p style={{ color: '#6c757d', margin: '0', fontSize: '14px' }}>Bienvenida al sistema de gestión médica de UCBA.</p>
      </div>

      {/* Tarjetas de Estadísticas Rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Tarjeta Médicos */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #007BFF' }}>
          <span style={{ fontSize: '13px', color: '#6c757d', fontWeight: 'bold', textTransform: 'uppercase' }}>Médicos Activos</span>
          <h2 style={{ fontSize: '32px', margin: '8px 0 0 0', color: '#2c3e50' }}>{estadisticas.medicos}</h2>
        </div>

        {/* Tarjeta Pacientes */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #28a745' }}>
          <span style={{ fontSize: '13px', color: '#6c757d', fontWeight: 'bold', textTransform: 'uppercase' }}>Pacientes Registrados</span>
          <h2 style={{ fontSize: '32px', margin: '8px 0 0 0', color: '#2c3e50' }}>{estadisticas.pacientes}</h2>
        </div>

        {/* Tarjeta Turnos */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #ffc107' }}>
          <span style={{ fontSize: '13px', color: '#6c757d', fontWeight: 'bold', textTransform: 'uppercase' }}>Turnos Totales</span>
          <h2 style={{ fontSize: '32px', margin: '8px 0 0 0', color: '#2c3e50' }}>{estadisticas.turnos}</h2>
        </div>

        {/* Tarjeta Coberturas */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #17a2b8' }}>
          <span style={{ fontSize: '13px', color: '#6c757d', fontWeight: 'bold', textTransform: 'uppercase' }}>Coberturas / Planes</span>
          <h2 style={{ fontSize: '32px', margin: '8px 0 0 0', color: '#2c3e50' }}>{estadisticas.coberturas}</h2>
        </div>

      </div>

      {/* Panel de Bienvenida / Acceso rápido */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#333' }}>Panel de Control Principal</h2>
        <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', margin: '0' }}>
          Utiliza el menú lateral para navegar entre la gestión de médicos, coberturas, registro de pacientes y la asignación de turnos de la clínica. Los datos mostrados arriba se actualizan automáticamente desde la base de datos.
        </p>
      </div>
    </section>
  );
}

export default Dashboard;