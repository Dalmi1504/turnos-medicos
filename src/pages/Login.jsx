
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

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

      // Determinar la pantalla según el rol.
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

      // Guardar la sesión para la navegación.
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

  return (
    <main
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        backgroundColor: "#fff",
      }}
    >
      <h1>Iniciar sesión</h1>
      <p>Sistema de gestión médica UCBA</p>

      <form onSubmit={manejarLogin}>
        <label htmlFor="email">
          Correo electrónico
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            marginBottom: "15px",
          }}
        />

        <label htmlFor="password">
          Contraseña
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            marginBottom: "15px",
          }}
        />

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      {/* RECUPERAR CONTRASEÑA */}
      <p
        style={{
          marginTop: "20px",
          textAlign: "center",
        }}
      >
        <Link to="/recuperar-password">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>

      {/* REGISTRO DE PACIENTES */}
      <p
        style={{
          marginTop: "15px",
          textAlign: "center",
        }}
      >
        ¿Sos paciente y todavía no tenés cuenta?{" "}
        <Link to="/registro">
          Registrate acá
        </Link>
      </p>
    </main>
  );
}

export default Login;
