from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector


# -----------------------------------
# CREAR LA APLICACIÓN FASTAPI
# -----------------------------------

app = FastAPI()


# -----------------------------------
# CORS
# Permite que nuestro frontend React
# se comunique con FastAPI
# -----------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------
# CONEXIÓN A MYSQL
# -----------------------------------

def conectar_db():
    conexion = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="clinica"
    )
    return conexion


# -----------------------------------
# MODELO PARA CREAR UN PACIENTE
# -----------------------------------

class PacienteNuevo(BaseModel):
    dni: str
    nombre: str
    apellido: str
    telefono: str
    id_cobertura: Optional[int] = None
    numero_credencial: Optional[str] = None
    activo: bool = True


# -----------------------------------
# ENDPOINT PRINCIPAL
# -----------------------------------

@app.get("/")
def inicio():
    return {
        "mensaje": "API del sistema de turnos funcionando"
    }


# -----------------------------------
# GET PACIENTES
# -----------------------------------

@app.get("/pacientes")
def obtener_pacientes():
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id_paciente,
            nombre,
            apellido,
            dni,
            fecha_nacimiento,
            telefono,
            email,
            id_cobertura,
            plan,
            numero_credencial,
            bloqueado,
            motivo_bloqueo,
            activo
        FROM paciente
    """)

    pacientes = cursor.fetchall()
    cursor.close()
    conexion.close()

    return pacientes


# -----------------------------------
# POST PACIENTES
# -----------------------------------

@app.post("/pacientes")
def crear_paciente(paciente: PacienteNuevo):
    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        cursor.execute("""
            INSERT INTO paciente (
                dni,
                nombre,
                apellido,
                telefono,
                id_cobertura,
                numero_credencial,
                activo
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            paciente.dni,
            paciente.nombre,
            paciente.apellido,
            paciente.telefono,
            paciente.id_cobertura,
            paciente.numero_credencial,
            paciente.activo
        ))

        conexion.commit()
        id_nuevo = cursor.lastrowid

        return {
            "mensaje": "Paciente creado correctamente",
            "id_paciente": id_nuevo
        }

    except mysql.connector.IntegrityError:
        conexion.rollback()
        raise HTTPException(
            status_code=400,
            detail="Ya existe un paciente con ese DNI"
        )

    finally:
        cursor.close()
        conexion.close()


# -----------------------------------
# MODELOS PARA MÉDICOS
# -----------------------------------

class MedicoNuevo(BaseModel):
    nombre: str
    apellido: str
    especialidad: str
    matricula: str
    telefono: Optional[str] = None
    email: Optional[str] = None
    activo: bool = True


class MedicoActualizar(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    especialidad: Optional[str] = None
    matricula: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    activo: Optional[bool] = None


# -----------------------------------
# GET MÉDICOS
# -----------------------------------

@app.get("/medicos")
def obtener_medicos():
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id_medico,
            nombre,
            apellido,
            especialidad,
            matricula,
            telefono,
            email,
            activo
        FROM medico
    """)

    medicos = cursor.fetchall()
    cursor.close()
    conexion.close()

    return medicos


# -----------------------------------
# POST MÉDICOS
# -----------------------------------

@app.post("/medicos")
def crear_medico(medico: MedicoNuevo):
    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        cursor.execute("""
            INSERT INTO medico (
                nombre,
                apellido,
                especialidad,
                matricula,
                telefono,
                email,
                activo
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            medico.nombre,
            medico.apellido,
            medico.especialidad,
            medico.matricula,
            medico.telefono,
            medico.email,
            medico.activo
        ))

        conexion.commit()
        id_nuevo = cursor.lastrowid

        return {
            "mensaje": "Médico creado correctamente",
            "id_medico": id_nuevo
        }

    except mysql.connector.IntegrityError:
        conexion.rollback()
        raise HTTPException(
            status_code=400,
            detail="Ya existe un médico registrado con esa matrícula"
        )

    finally:
        cursor.close()
        conexion.close()


# -----------------------------------
# PUT MÉDICOS
# -----------------------------------

@app.put("/medicos/{id_medico}")
def actualizar_medico(id_medico: int, medico: MedicoActualizar):
    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        cursor.execute("""
            UPDATE medico 
            SET nombre = COALESCE(%s, nombre),
                apellido = COALESCE(%s, apellido),
                especialidad = COALESCE(%s, especialidad),
                matricula = COALESCE(%s, matricula),
                telefono = COALESCE(%s, telefono),
                email = COALESCE(%s, email),
                activo = COALESCE(%s, activo)
            WHERE id_medico = %s
        """, (
            medico.nombre,
            medico.apellido,
            medico.especialidad,
            medico.matricula,
            medico.telefono,
            medico.email,
            medico.activo,
            id_medico
        ))

        conexion.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Médico no encontrado")

        return {"mensaje": "Médico actualizado correctamente"}

    except mysql.connector.IntegrityError:
        conexion.rollback()
        raise HTTPException(
            status_code=400,
            detail="La matrícula ya está registrada por otro médico"
        )

    finally:
        cursor.close()
        conexion.close()


# -----------------------------------
# DELETE MÉDICOS
# -----------------------------------

@app.delete("/medicos/{id_medico}")
def eliminar_medico(id_medico: int):
    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        cursor.execute("UPDATE medico SET activo = FALSE WHERE id_medico = %s", (id_medico,))
        conexion.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Médico no encontrado")

        return {"mensaje": "Médico eliminado correctamente"}

    finally:
        cursor.close()
        conexion.close()


# -----------------------------------
# MODELOS PARA COBERTURAS
# -----------------------------------

class CoberturaNueva(BaseModel):
    nombre: str
    plan: str
    activo: bool = True


class CoberturaActualizar(BaseModel):
    nombre: Optional[str] = None
    plan: Optional[str] = None
    activo: Optional[bool] = None


# -----------------------------------
# GET COBERTURAS
# -----------------------------------

@app.get("/coberturas")
def obtener_coberturas():
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id_cobertura,
            nombre,
            plan,
            activo
        FROM cobertura
    """)

    coberturas = cursor.fetchall()
    cursor.close()
    conexion.close()

    return coberturas


# -----------------------------------
# POST COBERTURAS
# -----------------------------------

@app.post("/coberturas")
def crear_cobertura(cobertura: CoberturaNueva):
    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        cursor.execute("""
            INSERT INTO cobertura (nombre, plan, activo)
            VALUES (%s, %s, %s)
        """, (cobertura.nombre, cobertura.plan, cobertura.activo))

        conexion.commit()
        id_nuevo = cursor.lastrowid

        return {
            "mensaje": "Cobertura creada correctamente",
            "id_cobertura": id_nuevo
        }
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conexion.close()


# -----------------------------------
# PUT COBERTURAS
# -----------------------------------

@app.put("/coberturas/{id_cobertura}")
def actualizar_cobertura(id_cobertura: int, cobertura: CoberturaActualizar):
    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        cursor.execute("""
            UPDATE cobertura 
            SET nombre = COALESCE(%s, nombre),
                plan = COALESCE(%s, plan),
                activo = COALESCE(%s, activo)
            WHERE id_cobertura = %s
        """, (cobertura.nombre, cobertura.plan, cobertura.activo, id_cobertura))

        conexion.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cobertura no encontrada")

        return {"mensaje": "Cobertura actualizada correctamente"}
    finally:
        cursor.close()
        conexion.close()


# -----------------------------------
# DELETE COBERTURAS
# -----------------------------------

@app.delete("/coberturas/{id_cobertura}")
def eliminar_cobertura(id_cobertura: int):
    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        cursor.execute("UPDATE cobertura SET activo = FALSE WHERE id_cobertura = %s", (id_cobertura,))
        conexion.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cobertura no encontrada")

        return {"mensaje": "Cobertura eliminada correctamente"}
    finally:
        cursor.close()
        conexion.close()


# -----------------------------------
# GET TURNOS (GENERAL)
# -----------------------------------

@app.get("/turnos")
def obtener_turnos():
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            t.id_turno,
            t.fecha,
            t.hora,
            t.motivo_consulta,
            t.id_estado,
            p.id_paciente,
            p.nombre AS paciente_nombre,
            p.apellido AS paciente_apellido,
            m.id_medico,
            m.nombre AS medico_nombre,
            m.apellido AS medico_apellido,
            m.especialidad
        FROM turno t
        JOIN paciente p ON t.id_paciente = p.id_paciente
        JOIN medico m ON t.id_medico = m.id_medico
    """)

    turnos = cursor.fetchall()
    cursor.close()
    conexion.close()

    return turnos


# -----------------------------------
# LOGIN DE USUARIOS
# -----------------------------------

class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/api/login")
def login_usuario(datos: LoginRequest):
    conexion = conectar_db()
    if not conexion:
        raise HTTPException(status_code=500, detail="No se pudo conectar a la base de datos")
    
    cursor = conexion.cursor(dictionary=True)
    try:
        query_user = "SELECT * FROM usuario WHERE username = %s AND password_hash = %s AND activo = TRUE"
        cursor.execute(query_user, (datos.username, datos.password))
        usuario = cursor.fetchone()
        
        if not usuario:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
            
        query_roles = """
            SELECT r.descripcion 
            FROM usuario_rol ur
            JOIN rol r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = %s
        """
        cursor.execute(query_roles, (usuario["id_usuario"],))
        roles_encontrados = cursor.fetchall()
        lista_roles = [r["descripcion"] for r in roles_encontrados]
        
        # Buscamos el id_paciente asociado mediante el email
        query_paciente = "SELECT id_paciente FROM paciente WHERE email = %s"
        cursor.execute(query_paciente, (usuario["email"],))
        paciente_data = cursor.fetchone()
        id_paciente = paciente_data["id_paciente"] if paciente_data else usuario["id_usuario"]

        return {
            "mensaje": "Login exitoso",
            "usuario": {
                "id_usuario": usuario["id_usuario"],
                "id_paciente": id_paciente,
                "username": usuario["username"],
                "email": usuario["email"],
                "roles": lista_roles
            }
        }
            
    finally:
        cursor.close()
        conexion.close()


# -----------------------------------
# REGISTRO DE USUARIOS
# -----------------------------------

class RegistroRequest(BaseModel):
    username: str
    email: str
    password: str
    nombre: str
    apellido: str
    dni: str
    telefono: Optional[str] = ""

@app.post("/api/registro")
def registrar_paciente(datos: RegistroRequest):
    conexion = conectar_db()
    if not conexion:
        raise HTTPException(status_code=500, detail="No se pudo conectar a la base de datos")
    
    cursor = conexion.cursor()
    try:
        # 1. Insertamos el nuevo usuario
        query_usuario = """
            INSERT INTO usuario (username, email, password_hash, activo)
            VALUES (%s, %s, %s, TRUE)
        """
        cursor.execute(query_usuario, (datos.username, datos.email, datos.password))
        id_nuevo_usuario = cursor.lastrowid

        # 2. Creamos su perfil en la tabla paciente
        query_paciente = """
            INSERT INTO paciente (nombre, apellido, dni, telefono, email, activo)
            VALUES (%s, %s, %s, %s, %s, TRUE)
        """
        cursor.execute(query_paciente, (datos.nombre, datos.apellido, datos.dni, datos.telefono, datos.email))
        id_nuevo_paciente = cursor.lastrowid

        # 3. Buscamos el id del rol 'Paciente'
        cursor.execute("SELECT id_rol FROM rol WHERE descripcion = 'Paciente'")
        rol_paciente = cursor.fetchone()

        if not rol_paciente:
            raise HTTPException(status_code=500, detail="El rol 'Paciente' no está configurado en la base de datos")
        
        id_rol_paciente = rol_paciente[0]

        # 4. Asociamos el usuario con el rol en usuario_rol
        query_usuario_rol = """
            INSERT INTO usuario_rol (id_usuario, id_rol)
            VALUES (%s, %s)
        """
        cursor.execute(query_usuario_rol, (id_nuevo_usuario, id_rol_paciente))
        
        conexion.commit()
        return {"mensaje": "Usuario y perfil de paciente registrados exitosamente", "id_paciente": id_nuevo_paciente}

    except mysql.connector.IntegrityError:
        conexion.rollback()
        raise HTTPException(status_code=400, detail="El DNI, nombre de usuario o email ya se encuentran registrados")
    finally:
        cursor.close()
        conexion.close()


# -----------------------------------
# ENDPOINTS PARA EL PORTAL DE PACIENTES (TURNOS)
# -----------------------------------

class TurnoPacienteRequest(BaseModel):
    id_paciente: int
    id_medico: int
    fecha: str
    hora: str
    motivo_consulta: Optional[str] = ""

@app.post("/api/turnos")
def solicitar_turno_paciente(datos: TurnoPacienteRequest):
    conexion = conectar_db()
    if not conexion:
        raise HTTPException(status_code=500, detail="No se pudo conectar a la base de datos")
    
    cursor = conexion.cursor()
    try:
        query = """
            INSERT INTO turno (id_paciente, id_medico, fecha, hora, motivo_consulta, id_estado)
            VALUES (%s, %s, %s, %s, %s, 1)
        """
        cursor.execute(query, (
            datos.id_paciente, 
            datos.id_medico, 
            datos.fecha, 
            datos.hora, 
            datos.motivo_consulta
        ))
        conexion.commit()
        return {"mensaje": "Turno solicitado con éxito"}
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conexion.close()

@app.get("/api/turnos/usuario/{id_paciente}")
def obtener_turnos_usuario(id_paciente: int):
    conexion = conectar_db()
    if not conexion:
        raise HTTPException(status_code=500, detail="No se pudo conectar a la base de datos")
    
    cursor = conexion.cursor(dictionary=True)
    try:
        query = "SELECT * FROM turno WHERE id_paciente = %s"
        cursor.execute(query, (id_paciente,))
        turnos = cursor.fetchall()
        return turnos
    finally:
        cursor.close()
        conexion.close()