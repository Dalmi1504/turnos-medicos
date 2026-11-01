
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function RestablecerPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [completado, setCompletado] = useState(false);

  const manejarRestablecimiento = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!token) {
      setError('El enlace de recuperación no es válido.');
      return;
    }

    if (nuevaPassword.length < 12) {
      setError('La contraseña debe tener al menos 12 caracteres.');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(
        'http://127.0.0.1:8000/api/restablecer-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            nueva_password: nuevaPassword,
          }),
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : 'No se pudo restablecer la contraseña.'
        );
      }

      setMensaje('¡Contraseña actualizada correctamente! Ya podés iniciar sesión.');
      setCompletado(true);
      setNuevaPassword('');
      setConfirmarPassword('');
    } catch (err) {
      setError(err.message || 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '60px auto',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: '#fff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2>Crear nueva contraseña</h2>

      {!token && (
        <p style={{ color: 'red' }} role="alert">
          El enlace no contiene un token válido.
          Solicitá uno nuevo desde la recuperación de contraseña.
        </p>
      )}

      {token && !completado && (
        <form onSubmit={manejarRestablecimiento}>
          <p style={{ fontSize: '13px', color: '#666' }}>
            Ingresá una contraseña nueva de al menos 12 caracteres.
          </p>

          <label htmlFor="nueva-password">Nueva contraseña</label>
          <input
            id="nueva-password"
            type="password"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            autoComplete="new-password"
            minLength={12}
            required
            disabled={cargando}
            style={{
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px',
              margin: '6px 0 15px',
            }}
          />

          <label htmlFor="confirmar-password">Confirmar contraseña</label>
          <input
            id="confirmar-password"
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            autoComplete="new-password"
            minLength={12}
            required
            disabled={cargando}
            style={{
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px',
              margin: '6px 0 15px',
            }}
          />

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%',
              padding: '10px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: cargando ? 'not-allowed' : 'pointer',
            }}
          >
            {cargando ? 'Actualizando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      )}

      {error && (
        <p style={{ color: 'red', fontSize: '14px' }} role="alert">
          {error}
        </p>
      )}

      {mensaje && (
        <p style={{ color: 'green', fontSize: '14px' }} role="status">
          {mensaje}
        </p>
      )}

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link to={completado ? '/login' : '/recuperar-password'}>
          {completado ? 'Ir a iniciar sesión' : 'Solicitar otro enlace'}
        </Link>
      </p>
    </div>
  );
}

export default RestablecerPassword;
