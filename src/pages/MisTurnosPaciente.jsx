
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MisTurnosPaciente() {
  const navigate = useNavigate();

  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const obtenerTurnos = async () => {
      try {
        const token = localStorage.getItem('access_token');

        if (!token) {
          setError('No se encontró la sesión. Iniciá sesión nuevamente.');
          return;
        }

        const respuesta = await fetch(
          'http://127.0.0.1:8000/api/paciente/mis-turnos',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json'
            }
          }
        );

        if (!respuesta.ok) {
          throw new Error(
            'No se pudieron cargar los turnos. Verificá tu sesión.'
          );
        }

        const data = await respuesta.json();
        setTurnos(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error('Error al cargar turnos:', err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerTurnos();
  }, []);

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '40px auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #ddd',
          paddingBottom: '15px',
          marginBottom: '20px'
        }}
      >
        <h2>Mis Turnos Reservados</h2>

        <button
          onClick={() => navigate('/portal-paciente')}
          style={{
            padding: '8px 15px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Volver al Portal
        </button>
      </div>

      <div
        style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: '#fff'
        }}
      >
        {cargando ? (
          <p>Cargando turnos...</p>
        ) : error ? (
          <p style={{ color: '#dc3545' }}>{error}</p>
        ) : turnos.length === 0 ? (
          <p style={{ color: '#666' }}>
            No tienes turnos registrados en este momento.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {turnos.map((t) => (
              <li
                key={t.id_turno}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #eee',
                  marginBottom: '10px',
                  background: '#f9f9f9',
                  borderRadius: '6px'
                }}
              >
                <p>
                  <strong>Fecha:</strong> {t.fecha}
                  {' | '}
                  <strong>Hora:</strong> {t.hora}
                </p>

                <p>
                  <strong>Médico:</strong> {t.medico}
                </p>

                <p>
                  <strong>Motivo de consulta:</strong>{' '}
                  {t.motivo_consulta || 'Sin observaciones'}
                </p>

                <p>
                  <strong>Estado:</strong>{' '}
                  <span
                    style={{
                      color: '#28a745',
                      fontWeight: 'bold'
                    }}
                  >
                    {t.estado}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MisTurnosPaciente;
