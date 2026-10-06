import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        // Guardamos los datos del usuario en el localStorage
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        // Redirigimos según los roles del usuario
        if (data.usuario.roles.includes('Paciente')) {
          navigate('/portal-paciente');
        } else if (data.usuario.roles.includes('Administrador') || data.usuario.roles.includes('Recepcion')) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } else {
        // Mensaje genérico de seguridad para evitar revelar si el correo existe o no
        setError(data.detail || 'Correo o contraseña incorrectos');
      }
    } catch (err) {
      console.error('Error de red:', err);
      setError('No se pudo conectar con el servidor');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      
      {/* Logo de la clínica */}
      <img 
  src="/logo.png?v=1" 
  alt="Logo de la Clínica" 
  style={{ width: '120px', height: 'auto', marginBottom: '15px' }} 
/>
      <h2 style={{ marginBottom: '20px' }}>Iniciar Sesión</h2>

      <form onSubmit={manejarLogin} style={{ textAlign: 'left' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Correo electrónico:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
          />
        </div>

        {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Ingresar
        </button>
      </form>

      <p style={{ marginTop: '15px', fontSize: '13px' }}>
        <Link to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
      </p>

      <p style={{ marginTop: '10px', fontSize: '14px' }}>
        ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
      </p>
    </div>
  );
}

export default Login;