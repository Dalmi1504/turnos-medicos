import React, { useState, useEffect } from 'react';

function Coberturas() {
  const [coberturas, setCoberturas] = useState([]);
  const [nuevaCobertura, setNuevaCobertura] = useState({
    nombre: '',
    plan: ''
  });
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const obtenerCoberturas = async () => {
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/coberturas');
      const datos = await respuesta.json();
      setCoberturas(datos.filter(c => c.activo !== false));
    } catch (error) {
      console.error('Error al cargar las coberturas:', error);
    }
  };

  useEffect(() => {
    obtenerCoberturas();
  }, []);

  const handleChange = (e) => {
    setNuevaCobertura({
      ...nuevaCobertura,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editandoId 
        ? `http://127.0.0.1:8000/coberturas/${editandoId}` 
        : 'http://127.0.0.1:8000/coberturas';
      
      const method = editandoId ? 'PUT' : 'POST';

      const respuesta = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaCobertura)
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        setMensaje(editandoId ? '¡Cobertura actualizada con éxito!' : '¡Cobertura registrada con éxito!');
        setNuevaCobertura({ nombre: '', plan: '' });
        setEditandoId(null);
        obtenerCoberturas();
      } else {
        setMensaje(resultado.detail || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error de conexión con el servidor');
    }
  };

  const iniciarEdicion = (cob) => {
    setEditandoId(cob.id_cobertura);
    setNuevaCobertura({
      nombre: cob.nombre,
      plan: cob.plan
    });
    setMensaje('');
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNuevaCobertura({ nombre: '', plan: '' });
    setMensaje('');
  };

  const eliminarCobertura = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cobertura?')) return;

    try {
      const respuesta = await fetch(`http://127.0.0.1:8000/coberturas/${id}`, {
        method: 'DELETE'
      });

      if (respuesta.ok) {
        setMensaje('¡Cobertura eliminada correctamente!');
        obtenerCoberturas();
      } else {
        const resultado = await respuesta.json();
        setMensaje(resultado.detail || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error de conexión con el servidor');
    }
  };

  return (
    <section style={{ padding: '24px', fontFamily: 'Arial, sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', margin: '0 0 8px 0', color: '#2c3e50' }}>Gestión de Coberturas</h1>
        <p style={{ color: '#6c757d', margin: '0', fontSize: '14px' }}>Administra las obras sociales, prepagas y sus respectivos planes médicos.</p>
      </div>

      {/* Formulario de Registro / Edición */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 16px 0', color: '#333' }}>{editandoId ? 'Editar Cobertura' : 'Registrar Nueva Cobertura'}</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Obra Social / Prepaga</label>
              <input type="text" name="nombre" placeholder="Ej: OSDE, Swiss Medical" value={nuevaCobertura.nombre} onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Plan</label>
              <input type="text" name="plan" placeholder="Ej: 210, 400, PMO" value={nuevaCobertura.plan} onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: editandoId ? '#28a745' : '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
              {editandoId ? 'Actualizar Cobertura' : 'Guardar Cobertura'}
            </button>
            {editandoId && (
              <button type="button" onClick={cancelarEdicion} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                Cancelar
              </button>
            )}
            {mensaje && <span style={{ fontSize: '14px', fontWeight: '500', color: mensaje.includes('éxito') || mensaje.includes('correctamente') ? '#28a745' : '#dc3545' }}>{mensaje}</span>}
          </div>
        </form>
      </div>

      {/* Listado de Coberturas */}
      <h2 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#333' }}>Listado de Coberturas</h2>
      <div style={{ overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
              <th style={{ padding: '12px 16px' }}>Obra Social / Prepaga</th>
              <th style={{ padding: '12px 16px' }}>Plan</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {coberturas.length > 0 ? (
              coberturas.map((cob, index) => (
                <tr key={cob.id_cobertura} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500', color: '#212529' }}>{cob.nombre}</td>
                  <td style={{ padding: '12px 16px', color: '#495057' }}>{cob.plan}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => iniciarEdicion(cob)} style={{ backgroundColor: '#ffc107', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', color: '#212529', fontSize: '13px' }}>
                        Editar
                      </button>
                      <button onClick={() => eliminarCobertura(cob.id_cobertura)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px' }}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: '#6c757d' }}>No hay coberturas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Coberturas;