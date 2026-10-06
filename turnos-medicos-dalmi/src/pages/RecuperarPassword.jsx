import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarRecuperacion = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (nuevaPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/recuperar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, dni, nueva_password: nuevaPassword }),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        setMensaje('¡Contraseña restablecida con éxito! Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(data.detail || 'Ocurrió un error al restablecer la contraseña.');
      }
    } catch (err) {
      console.error('Error de red:', err);
      setError('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <h2>Recuperar Contraseña</h2>
      <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
        Ingresa tu correo electrónico y tu DNI para verificar tu identidad y cambiar tu contraseña.
      </p>

      <form onSubmit={manejarRecuperacion}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Correo electrónico:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>DNI:</label>
          <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Nueva Contraseña:</label>
          <input type="password" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '15px' }}>{error}</p>}
        {mensaje && <p style={{ color: 'green', fontSize: '14px', marginBottom: '15px' }}>{mensaje}</p>}

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Actualizar Contraseña
        </button>
      </form>

      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
        <Link to="/login">← Volver al Login</Link>
      </p>
    </div>
  );
}

export default RecuperarPassword;