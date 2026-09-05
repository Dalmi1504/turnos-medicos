import React, { useState, useEffect } from 'react';

function Medicos() {
  const [medicos, setMedicos] = useState([]);
  const [nuevoMedico, setNuevoMedico] = useState({
    nombre: '',
    apellido: '',
    especialidad: '',
    matricula: '',
    telefono: '',
    email: ''
  });
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');

  // Cargar médicos al iniciar el componente
  const obtenerMedicos = async () => {
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/medicos');
      const datos = await respuesta.json();
      setMedicos(datos.filter(med => med.activo !== false));
    } catch (error) {
      console.error('Error al cargar los médicos:', error);
    }
  };

  useEffect(() => {
    obtenerMedicos();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setNuevoMedico({
      ...nuevoMedico,
      [e.target.name]: e.target.value
    });
  };

  // Enviar el formulario (Crear o Actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editandoId 
        ? `http://127.0.0.1:8000/medicos/${editandoId}` 
        : 'http://127.0.0.1:8000/medicos';
      
      const method = editandoId ? 'PUT' : 'POST';

      const respuesta = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoMedico)
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        setMensaje(editandoId ? '¡Médico actualizado con éxito!' : '¡Médico registrado con éxito!');
        setNuevoMedico({
          nombre: '',
          apellido: '',
          especialidad: '',
          matricula: '',
          telefono: '',
          email: ''
        });
        setEditandoId(null);
        obtenerMedicos();
      } else {
        setMensaje(resultado.detail || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error de conexión con el servidor');
    }
  };

  // Cargar datos en el formulario para editar
  const iniciarEdicion = (med) => {
    setEditandoId(med.id_medico);
    setNuevoMedico({
      nombre: med.nombre,
      apellido: med.apellido,
      especialidad: med.especialidad,
      matricula: med.matricula,
      telefono: med.telefono || '',
      email: med.email || ''
    });
    setMensaje('');
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setEditandoId(null);
    setNuevoMedico({
      nombre: '',
      apellido: '',
      especialidad: '',
      matricula: '',
      telefono: '',
      email: ''
    });
    setMensaje('');
  };

  // Eliminar (Dar de baja lógica) un médico
  const eliminarMedico = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este médico?')) return;

    try {
      const respuesta = await fetch(`http://127.0.0.1:8000/medicos/${id}`, {
        method: 'DELETE'
      });

      if (respuesta.ok) {
        setMensaje('¡Médico eliminado correctamente!');
        obtenerMedicos();
      } else {
        const resultado = await respuesta.json();
        setMensaje(resultado.detail || 'Error al eliminar el médico');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error de conexión con el servidor');
    }
  };

  return (
    <section style={{ padding: '24px', fontFamily: 'Arial, sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', margin: '0 0 8px 0', color: '#2c3e50' }}>Gestión de Médicos</h1>
        <p style={{ color: '#6c757d', margin: '0', fontSize: '14px' }}>Aquí puedes registrar, consultar, editar y dar de baja a los profesionales médicos de la clínica.</p>
      </div>

      {/* Formulario de Registro / Edición en Tarjeta con Grilla */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 16px 0', color: '#333' }}>{editandoId ? 'Editar Médico' : 'Registrar Nuevo Médico'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Nombre</label>
              <input type="text" name="nombre" placeholder="Ej: Juan" value={nuevoMedico.nombre} onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Apellido</label>
              <input type="text" name="apellido" placeholder="Ej: Pérez" value={nuevoMedico.apellido} onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Especialidad</label>
              <input type="text" name="especialidad" placeholder="Ej: Cardiología" value={nuevoMedico.especialidad} onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Matrícula</label>
              <input type="text" name="matricula" placeholder="Ej: MN 123456" value={nuevoMedico.matricula} onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Teléfono</label>
              <input type="text" name="telefono" placeholder="Ej: 1122334455" value={nuevoMedico.telefono} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Correo Electrónico</label>
              <input type="email" name="email" placeholder="Ej: juan@clinica.com" value={nuevoMedico.email} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: editandoId ? '#28a745' : '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
              {editandoId ? 'Actualizar Médico' : 'Guardar Médico'}
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

      {/* Listado de Médicos */}
      <h2 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#333' }}>Listado de Médicos</h2>
      <div style={{ overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
              <th style={{ padding: '12px 16px' }}>Nombre y Apellido</th>
              <th style={{ padding: '12px 16px' }}>Especialidad</th>
              <th style={{ padding: '12px 16px' }}>Matrícula</th>
              <th style={{ padding: '12px 16px' }}>Teléfono</th>
              <th style={{ padding: '12px 16px' }}>Email</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medicos.length > 0 ? (
              medicos.map((med, index) => (
                <tr key={med.id_medico} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500', color: '#212529' }}>{med.nombre} {med.apellido}</td>
                  <td style={{ padding: '12px 16px', color: '#495057' }}>{med.especialidad}</td>
                  <td style={{ padding: '12px 16px', color: '#495057' }}>{med.matricula}</td>
                  <td style={{ padding: '12px 16px', color: '#495057' }}>{med.telefono || '-'}</td>
                  <td style={{ padding: '12px 16px', color: '#495057' }}>{med.email || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => iniciarEdicion(med)} style={{ backgroundColor: '#ffc107', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', color: '#212529', fontSize: '13px' }}>
                        Editar
                      </button>
                      <button onClick={() => eliminarMedico(med.id_medico)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px' }}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#6c757d' }}>No hay médicos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Medicos;