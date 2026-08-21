import { useEffect, useState } from "react";

import "../styles/pacientes.css";


function Pacientes() {

  const [busqueda, setBusqueda] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [errores, setErrores] = useState({});

  const [dniEditando, setDniEditando] = useState(null);

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  const [pacientes, setPacientes] = useState([]);


  // -----------------------------------------
  // COBERTURAS
  // Relacionamos el ID de MySQL con el nombre
  // que mostramos en el frontend
  // -----------------------------------------

  const nombresCobertura = {
    1: "OSDE",
    2: "Swiss Medical",
    3: "Galeno",
    4: "PAMI",
    5: "Particular",
  };


  const idsCobertura = {
    OSDE: 1,
    "Swiss Medical": 2,
    Galeno: 3,
    PAMI: 4,
    Particular: 5,
  };


  // -----------------------------------------
  // TRAER PACIENTES DESDE FASTAPI
  // -----------------------------------------

  const cargarPacientes = async () => {

    try {

      const respuesta = await fetch(
        "http://127.0.0.1:8000/pacientes"
      );


      if (!respuesta.ok) {

        throw new Error(
          "No se pudieron obtener los pacientes."
        );

      }


      const datos = await respuesta.json();


      const pacientesAdaptados = datos.map((paciente) => ({

        ...paciente,

        cobertura:
          nombresCobertura[paciente.id_cobertura] || "Particular",

        numeroAfiliado:
          paciente.numero_credencial || "",

        estado:
          paciente.activo ? "Activo" : "Inactivo",

      }));


      setPacientes(pacientesAdaptados);

    } catch (error) {

      console.error(
        "Error al obtener pacientes:",
        error
      );

    }

  };


  // -----------------------------------------
  // AL ABRIR LA PANTALLA, HACEMOS EL GET
  // -----------------------------------------

  useEffect(() => {

    cargarPacientes();

  }, []);


  // -----------------------------------------
  // DATOS DEL FORMULARIO
  // -----------------------------------------

  const [nuevoPaciente, setNuevoPaciente] = useState({

    dni: "",

    nombre: "",

    apellido: "",

    telefono: "",

    cobertura: "",

    numeroAfiliado: "",

    estado: "Activo",

  });


  // -----------------------------------------
  // NORMALIZAR TEXTO PARA LA BÚSQUEDA
  // -----------------------------------------

  const normalizarTexto = (texto) => {

    return String(texto || "")

      .normalize("NFD")

      .replace(/[\u0300-\u036f]/g, "")

      .toLowerCase();

  };


  // -----------------------------------------
  // FILTRAR PACIENTES
  // -----------------------------------------

  const pacientesFiltrados = pacientes.filter((paciente) => {

    const textoBusqueda = normalizarTexto(busqueda);

    const nombreCompleto =
      `${paciente.nombre} ${paciente.apellido}`;


    return (

      normalizarTexto(nombreCompleto).includes(textoBusqueda) ||

      String(paciente.dni || "").includes(textoBusqueda) ||

      normalizarTexto(paciente.cobertura).includes(textoBusqueda) ||

      normalizarTexto(paciente.numeroAfiliado).includes(textoBusqueda)

    );

  });


  // -----------------------------------------
  // MANEJAR CAMBIOS DEL FORMULARIO
  // -----------------------------------------

  const manejarCambio = (evento) => {

    const { name, value } = evento.target;


    // DNI: solamente números
    if (
      name === "dni" &&
      !/^\d*$/.test(value)
    ) {

      return;

    }


    // Nombre y apellido: solamente letras
    if (

      (name === "nombre" || name === "apellido") &&

      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)

    ) {

      return;

    }


    // Teléfono
    if (

      name === "telefono" &&

      !/^[0-9+\-\s()]*$/.test(value)

    ) {

      return;

    }


    // Número de afiliado
    if (

      name === "numeroAfiliado" &&

      !/^[a-zA-Z0-9\-\s]*$/.test(value)

    ) {

      return;

    }


    setNuevoPaciente({

      ...nuevoPaciente,

      [name]: value,

    });


    setErrores({

      ...errores,

      [name]: "",

    });

  };


  // -----------------------------------------
  // VALIDACIONES
  // -----------------------------------------

  const validarFormulario = () => {

    const nuevosErrores = {};


    // DNI
    if (!nuevoPaciente.dni.trim()) {

      nuevosErrores.dni =
        "El DNI es obligatorio.";

    } else if (!/^\d{7,8}$/.test(nuevoPaciente.dni)) {

      nuevosErrores.dni =
        "El DNI debe tener 7 u 8 dígitos.";

    } else {

      const dniDuplicado = pacientes.some(

        (paciente) =>

          String(paciente.dni) === nuevoPaciente.dni &&

          String(paciente.dni) !== String(dniEditando)

      );


      if (dniDuplicado) {

        nuevosErrores.dni =
          "Ya existe un paciente con ese DNI.";

      }

    }


    // Nombre
    if (!nuevoPaciente.nombre.trim()) {

      nuevosErrores.nombre =
        "El nombre es obligatorio.";

    }


    // Apellido
    if (!nuevoPaciente.apellido.trim()) {

      nuevosErrores.apellido =
        "El apellido es obligatorio.";

    }


    // Teléfono
    if (!nuevoPaciente.telefono.trim()) {

      nuevosErrores.telefono =
        "El teléfono es obligatorio.";

    } else if (

      !/^[0-9+\-\s()]{8,20}$/.test(
        nuevoPaciente.telefono
      )

    ) {

      nuevosErrores.telefono =
        "Ingresá un teléfono válido.";

    }


    // Cobertura
    if (!nuevoPaciente.cobertura.trim()) {

      nuevosErrores.cobertura =
        "La cobertura es obligatoria.";

    }


    // Número de afiliado
    if (

      nuevoPaciente.cobertura !== "Particular" &&

      !nuevoPaciente.numeroAfiliado.trim()

    ) {

      nuevosErrores.numeroAfiliado =
        "El número de afiliado es obligatorio.";

    }


    setErrores(nuevosErrores);


    return Object.keys(nuevosErrores).length === 0;

  };


  // -----------------------------------------
  // ABRIR FORMULARIO NUEVO PACIENTE
  // -----------------------------------------

  const abrirNuevoPaciente = () => {

    setDniEditando(null);


    setNuevoPaciente({

      dni: "",

      nombre: "",

      apellido: "",

      telefono: "",

      cobertura: "",

      numeroAfiliado: "",

      estado: "Activo",

    });


    setErrores({});

    setMostrarFormulario(true);

  };


  // -----------------------------------------
  // EDITAR PACIENTE
  // Por ahora la edición sigue siendo local.
  // Después podemos conectar un PUT.
  // -----------------------------------------

  const editarPaciente = (paciente) => {

    setDniEditando(String(paciente.dni));


    setNuevoPaciente({

      dni: String(paciente.dni || ""),

      nombre: paciente.nombre || "",

      apellido: paciente.apellido || "",

      telefono: paciente.telefono || "",

      cobertura: paciente.cobertura || "",

      numeroAfiliado: paciente.numeroAfiliado || "",

      estado: paciente.estado || "Activo",

    });


    setErrores({});

    setMostrarFormulario(true);

  };


  // -----------------------------------------
  // GUARDAR PACIENTE
  // NUEVO PACIENTE = POST A FASTAPI
  // -----------------------------------------

  const guardarPaciente = async (evento) => {

    evento.preventDefault();


    if (!validarFormulario()) {

      return;

    }


    // Si estamos editando, por ahora
    // mantenemos la edición local.
    if (dniEditando) {

      const pacientesActualizados = pacientes.map(
        (paciente) =>

          String(paciente.dni) === String(dniEditando)

            ? {
                ...paciente,
                ...nuevoPaciente,
              }

            : paciente

      );


      setPacientes(pacientesActualizados);

      cerrarFormulario();

      return;

    }


    // Objeto que vamos a enviar a FastAPI
    const pacienteParaEnviar = {

      dni: nuevoPaciente.dni,

      nombre: nuevoPaciente.nombre,

      apellido: nuevoPaciente.apellido,

      telefono: nuevoPaciente.telefono,

      id_cobertura:
        idsCobertura[nuevoPaciente.cobertura] || null,

      numero_credencial:
        nuevoPaciente.numeroAfiliado || null,

      activo:
        nuevoPaciente.estado === "Activo",

    };


    try {

      // POST A FASTAPI
      const respuesta = await fetch(
        "http://127.0.0.1:8000/pacientes",
        {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify(pacienteParaEnviar),

        }
      );


      // Si FastAPI devuelve un error
      if (!respuesta.ok) {

        const error = await respuesta.json();


        throw new Error(
          error.detail ||
          "Error al guardar el paciente."
        );

      }


      // Leemos la respuesta de FastAPI
      const resultado = await respuesta.json();


      console.log(
        "Paciente creado:",
        resultado
      );


      // Volvemos a pedir los pacientes
      // para actualizar la tabla
      await cargarPacientes();


      // Cerramos el formulario
      cerrarFormulario();


    } catch (error) {

      console.error(
        "Error al guardar paciente:",
        error
      );


      alert(error.message);

    }

  };


  // -----------------------------------------
  // CERRAR FORMULARIO
  // -----------------------------------------

  const cerrarFormulario = () => {

    setMostrarFormulario(false);

    setDniEditando(null);


    setNuevoPaciente({

      dni: "",

      nombre: "",

      apellido: "",

      telefono: "",

      cobertura: "",

      numeroAfiliado: "",

      estado: "Activo",

    });


    setErrores({});

  };


  // -----------------------------------------
  // VER PACIENTE
  // -----------------------------------------

  const verPaciente = (paciente) => {

    setPacienteSeleccionado(paciente);

  };


  const cerrarDetalle = () => {

    setPacienteSeleccionado(null);

  };


  // =========================================
  // INTERFAZ
  // =========================================

  return (

    <section className="pacientes-page">


      <div className="page-header">

        <div>

          <h1>Pacientes</h1>

          <p>
            Gestión de pacientes de UCBA.
          </p>

        </div>


        <button

          className="btn-primary"

          type="button"

          onClick={abrirNuevoPaciente}

        >

          + Nuevo paciente

        </button>

      </div>


      {/* FORMULARIO */}

      {mostrarFormulario && (

        <form

          className="paciente-form"

          onSubmit={guardarPaciente}

        >

          <div className="form-header">

            <h2>

              {dniEditando
                ? "Editar paciente"
                : "Nuevo paciente"}

            </h2>


            <button

              type="button"

              className="btn-cerrar"

              onClick={cerrarFormulario}

            >

              ×

            </button>

          </div>


          <div className="form-grid">


            {/* DNI */}

            <div className="form-group">

              <label htmlFor="dni">
                DNI
              </label>


              <input

                id="dni"

                name="dni"

                type="text"

                inputMode="numeric"

                maxLength="8"

                value={nuevoPaciente.dni}

                onChange={manejarCambio}

              />


              {errores.dni && (

                <span className="error-message">

                  {errores.dni}

                </span>

              )}

            </div>


            {/* NOMBRE */}

            <div className="form-group">

              <label htmlFor="nombre">
                Nombre
              </label>


              <input

                id="nombre"

                name="nombre"

                type="text"

                value={nuevoPaciente.nombre}

                onChange={manejarCambio}

              />


              {errores.nombre && (

                <span className="error-message">

                  {errores.nombre}

                </span>

              )}

            </div>


            {/* APELLIDO */}

            <div className="form-group">

              <label htmlFor="apellido">
                Apellido
              </label>


              <input

                id="apellido"

                name="apellido"

                type="text"

                value={nuevoPaciente.apellido}

                onChange={manejarCambio}

              />


              {errores.apellido && (

                <span className="error-message">

                  {errores.apellido}

                </span>

              )}

            </div>


            {/* TELÉFONO */}

            <div className="form-group">

              <label htmlFor="telefono">
                Teléfono
              </label>


              <input

                id="telefono"

                name="telefono"

                type="text"

                value={nuevoPaciente.telefono}

                onChange={manejarCambio}

              />


              {errores.telefono && (

                <span className="error-message">

                  {errores.telefono}

                </span>

              )}

            </div>


            {/* COBERTURA */}

            <div className="form-group">

              <label htmlFor="cobertura">
                Cobertura
              </label>


              <select

                id="cobertura"

                name="cobertura"

                value={nuevoPaciente.cobertura}

                onChange={manejarCambio}

              >

                <option value="">
                  Seleccionar cobertura
                </option>

                <option value="OSDE">
                  OSDE
                </option>

                <option value="Swiss Medical">
                  Swiss Medical
                </option>

                <option value="Galeno">
                  Galeno
                </option>

                <option value="PAMI">
                  PAMI
                </option>

                <option value="Particular">
                  Particular
                </option>

              </select>


              {errores.cobertura && (

                <span className="error-message">

                  {errores.cobertura}

                </span>

              )}

            </div>


            {/* NÚMERO DE AFILIADO */}

            <div className="form-group">

              <label htmlFor="numeroAfiliado">

                Número de afiliado

              </label>


              <input

                id="numeroAfiliado"

                name="numeroAfiliado"

                type="text"

                value={nuevoPaciente.numeroAfiliado}

                onChange={manejarCambio}

                placeholder="Ej: 123456789"

                disabled={
                  nuevoPaciente.cobertura === "Particular"
                }

              />


              {errores.numeroAfiliado && (

                <span className="error-message">

                  {errores.numeroAfiliado}

                </span>

              )}

            </div>


            {/* ESTADO */}

            <div className="form-group">

              <label htmlFor="estado">
                Estado
              </label>


              <select

                id="estado"

                name="estado"

                value={nuevoPaciente.estado}

                onChange={manejarCambio}

              >

                <option value="Activo">
                  Activo
                </option>

                <option value="Inactivo">
                  Inactivo
                </option>

              </select>

            </div>

          </div>


          <div className="form-actions">

            <button

              type="button"

              className="btn-secondary"

              onClick={cerrarFormulario}

            >

              Cancelar

            </button>


            <button

              type="submit"

              className="btn-primary"

            >

              {dniEditando
                ? "Guardar cambios"
                : "Guardar paciente"}

            </button>

          </div>

        </form>

      )}


      {/* BUSCADOR */}

      <div className="search-container">

        <input

          className="search-input"

          type="text"

          placeholder="Buscar por nombre, apellido, DNI, cobertura o afiliado..."

          value={busqueda}

          onChange={(evento) =>
            setBusqueda(evento.target.value)
          }

        />

      </div>


      {/* TABLA */}

      <div className="table-container">

        <table className="pacientes-table">

          <thead>

            <tr>

              <th>DNI</th>

              <th>Paciente</th>

              <th>Teléfono</th>

              <th>Cobertura</th>

              <th>N.º afiliado</th>

              <th>Estado</th>

              <th>Acciones</th>

            </tr>

          </thead>


          <tbody>

            {pacientesFiltrados.map(
              (paciente) => (

                <tr key={paciente.id_paciente || paciente.dni}>

                  <td>
                    {paciente.dni}
                  </td>


                  <td>

                    {paciente.nombre}{" "}
                    {paciente.apellido}

                  </td>


                  <td>
                    {paciente.telefono}
                  </td>


                  <td>
                    {paciente.cobertura}
                  </td>


                  <td>

                    {paciente.numeroAfiliado || "-"}

                  </td>


                  <td>
                    {paciente.estado}
                  </td>


                  <td>

                    <button

                      type="button"

                      className="btn-action"

                      onClick={() =>
                        verPaciente(paciente)
                      }

                    >

                      Ver

                    </button>


                    <button

                      type="button"

                      className="btn-action"

                      onClick={() =>
                        editarPaciente(paciente)
                      }

                    >

                      Editar

                    </button>

                  </td>

                </tr>

              )
            )}


            {pacientesFiltrados.length === 0 && (

              <tr>

                <td colSpan="7">

                  No se encontraron pacientes.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* MODAL VER PACIENTE */}

      {pacienteSeleccionado && (

        <div className="modal-overlay">

          <div className="paciente-modal">


            <div className="modal-header">

              <div>

                <h2>
                  Datos del paciente
                </h2>


                <p>

                  {pacienteSeleccionado.nombre}{" "}

                  {pacienteSeleccionado.apellido}

                </p>

              </div>


              <button

                type="button"

                className="btn-cerrar"

                onClick={cerrarDetalle}

              >

                ×

              </button>

            </div>


            <div className="detalle-grid">


              <div className="detalle-item">

                <span>DNI</span>

                <strong>

                  {pacienteSeleccionado.dni}

                </strong>

              </div>


              <div className="detalle-item">

                <span>Nombre</span>

                <strong>

                  {pacienteSeleccionado.nombre}

                </strong>

              </div>


              <div className="detalle-item">

                <span>Apellido</span>

                <strong>

                  {pacienteSeleccionado.apellido}

                </strong>

              </div>


              <div className="detalle-item">

                <span>Teléfono</span>

                <strong>

                  {pacienteSeleccionado.telefono}

                </strong>

              </div>


              <div className="detalle-item">

                <span>Cobertura</span>

                <strong>

                  {pacienteSeleccionado.cobertura}

                </strong>

              </div>


              <div className="detalle-item">

                <span>
                  Número de afiliado
                </span>

                <strong>

                  {pacienteSeleccionado.numeroAfiliado || "-"}

                </strong>

              </div>


              <div className="detalle-item">

                <span>Estado</span>

                <strong>

                  {pacienteSeleccionado.estado}

                </strong>

              </div>

            </div>


            <div className="modal-actions">

              <button

                type="button"

                className="btn-secondary"

                onClick={cerrarDetalle}

              >

                Cerrar

              </button>


              <button

                type="button"

                className="btn-primary"

                onClick={() => {

                  cerrarDetalle();

                  editarPaciente(
                    pacienteSeleccionado
                  );

                }}

              >

                Editar paciente

              </button>

            </div>

          </div>

        </div>

      )}

    </section>

  );

}


export default Pacientes;