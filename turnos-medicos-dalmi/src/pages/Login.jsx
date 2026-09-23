import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rolSeleccionado, setRolSeleccionado] = useState('Paciente');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        const rolesUsuario = data.usuario.roles;
        
        if (rolesUsuario.includes(rolSeleccionado)) {
          localStorage.setItem('usuario', JSON.stringify({ ...data.usuario, rolActivo: rolSeleccionado }));
          
          if (rolSeleccionado === 'Paciente') {
            navigate('/portal-paciente');
          } else if (rolSeleccionado === 'Médico') {
            navigate('/medicos');
          } else {
            navigate('/dashboard');
          }
        } else {
          setError(`Este usuario no tiene el rol de ${rolSeleccionado} asignado.`);
        }
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      console.error('Error de red:', err);
      setError('No se pudo conectar con el servidor');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={manejarSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Ingresar como:</label>
          <select 
            value={rolSeleccionado} 
            onChange={(e) => setRolSeleccionado(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="Paciente">Paciente (Sacar turnos)</option>
            <option value="Médico">Médico</option>
            <option value="Secretaria">Secretaria</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Usuario:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

        {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '15px' }}>{error}</p>}
        
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Entrar
        </button>
      </form>

      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
        ¿No tienes cuenta? <Link to="/registro">Regístrate como paciente</Link>
      </p>
    </div>
  );
}

export default Login;