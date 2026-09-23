import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Registro() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const navigate = useNavigate();

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, nombre, apellido, dni, telefono }),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        setExito('¡Registro exitoso! Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.detail || 'Ocurrió un error al registrarse');
      }
    } catch (err) {
      console.error('Error de red:', err);
      setError('No se pudo conectar con el servidor');
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <h2>Registro de Paciente</h2>
      <form onSubmit={manejarRegistro}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Nombre:</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Apellido:</label>
          <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>DNI:</label>
          <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Teléfono:</label>
          <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Usuario:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Correo electrónico:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Contraseña:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '15px' }}>{error}</p>}
        {exito && <p style={{ color: 'green', fontSize: '14px', marginBottom: '15px' }}>{exito}</p>}

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Registrarse
        </button>
      </form>

      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </div>
  );
}

export default Registro;