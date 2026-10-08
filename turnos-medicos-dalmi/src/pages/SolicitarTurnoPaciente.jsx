import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SolicitarTurnoPaciente() {
  const navigate = useNavigate();
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario')) || {};
  
  const [medicos, setMedicos] = useState([]);
  const [idMedico, setIdMedico] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/medicos')
      .then(res => res.json())
      .then(data => setMedicos(data))
      .catch(err => console.error('Error al cargar médicos:', err));
  }, []);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_paciente: usuarioGuardado.id_paciente,
          id_medico: parseInt(idMedico),
          fecha: fecha,
          hora: hora,
          motivo_consulta: motivo
        }),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        setMensaje('¡Turno solicitado con éxito!');
        setTimeout(() => navigate('/portal-paciente/mis-turnos'), 1500);
      } else {
        setError(data.detail || 'Error al solicitar el turno');
      }
    } catch (err) {
      console.error('Error de red:', err);
      setError('No se pudo conectar con el servidor');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '15px', marginBottom: '20px' }}>
        <h2>Solicitar Nuevo Turno Médico</h2>
        <button onClick={() => navigate('/portal-paciente')} style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          ← Volver al Portal
        </button>
      </div>

      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }}>
        <form onSubmit={manejarSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Seleccionar Médico:</label>
            <select 
              value={idMedico} 
              onChange={(e) => setIdMedico(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            >
              <option value="">-- Seleccione un médico --</option>
              {medicos.map((m) => (
                <option key={m.id_medico} value={m.id_medico}>
                  Dr./Dra. {m.apellido}, {m.nombre} ({m.especialidad})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Fecha:</label>
            <input 
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Hora:</label>
            <input 
              type="time" 
              value={hora} 
              onChange={(e) => setHora(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Motivo de consulta:</label>
            <textarea 
              value={motivo} 
              onChange={(e) => setMotivo(e.target.value)} 
              placeholder="Describa brevemente el motivo..."
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', height: '80px' }}
            />
          </div>

          {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
          {mensaje && <p style={{ color: 'green', fontWeight: 'bold', marginBottom: '15px' }}>{mensaje}</p>}

          <button type="submit" style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Confirmar Reserva
          </button>
        </form>
      </div>
    </div>
  );
}

export default SolicitarTurnoPaciente;