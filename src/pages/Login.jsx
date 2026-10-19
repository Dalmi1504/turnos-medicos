
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // INICIAR SESIÓN
  // ==========================================

  const manejarLogin = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          data.detail || "Correo o contraseña incorrectos"
        );
      }

      const usuario = data.usuario;

      if (!usuario || !Array.isArray(usuario.roles)) {
        throw new Error("Respuesta de login inválida");
      }

      if (!data.access_token) {
        throw new Error("No se recibió el token de sesión");
      }

      // ==========================================
      // REDIRECCIÓN SEGÚN EL ROL
      // ==========================================

      let destino;

      if (
        usuario.roles.includes("Administrador") ||
        usuario.roles.includes("Secretaria")
      ) {
        destino = "/dashboard";
      } else if (usuario.roles.includes("Médico")) {
        destino = "/medico/dashboard";
      } else if (usuario.roles.includes("Paciente")) {
        destino = "/portal-paciente";
      } else {
        throw new Error("El usuario no tiene un rol válido.");
      }

      // ==========================================
      // GUARDAR SESIÓN
      // ==========================================

      localStorage.setItem(
        "usuario",
        JSON.stringify(usuario)
      );

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      navigate(destino, { replace: true });

    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div className="login-contenedor">

      <main className="login-card">

        <div className="login-encabezado">
          <h1>Iniciar sesión</h1>
          <p>Sistema de gestión médica UCBA</p>
        </div>

        <form
          className="login-formulario"
          onSubmit={manejarLogin}
        >

          {/* CORREO ELECTRÓNICO */}

          <div className="login-campo">
            <label htmlFor="email">
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="ejemplo@correo.com"
              autoComplete="email"
              required
            />
          </div>

          {/* CONTRASEÑA */}

          <div className="login-campo">
            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Ingresá tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>

          {/* ERROR DE AUTENTICACIÓN */}

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          {/* BOTÓN INGRESAR */}

          <button
            type="submit"
            className="login-boton"
            disabled={cargando}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>

        </form>

        {/* RECUPERAR CONTRASEÑA */}

        <div className="login-recuperar">
          <Link to="/recuperar-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* REGISTRO DE PACIENTES */}

        <div className="login-registro">
          <p>
            ¿Sos paciente y todavía no tenés cuenta?
          </p>

          <Link to="/registro">
            Registrate acá
          </Link>
        </div>

      </main>

    </div>
  );
}

export default Login;
