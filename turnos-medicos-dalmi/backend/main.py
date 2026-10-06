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
# LOGIN DE USUARIOS (Con Email y Contraseña)
# -----------------------------------

class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/api/login")
def login_usuario(datos: LoginRequest):
    conexion = conectar_db()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error interno del servidor")
    
    cursor = conexion.cursor(dictionary=True)
    try:
        # Buscamos al usuario por email
        query_user = "SELECT * FROM usuario WHERE email = %s AND activo = TRUE"
        cursor.execute(query_user, (datos.email,))
        usuario = cursor.fetchone()
        
        # Mensaje genérico tanto si el usuario no existe como si la contraseña falla
        if not usuario or not verificar_password(datos.password, usuario["password_hash"]):
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
            
        # Resto de la lógica de roles y sesión...
        query_roles = """
            SELECT r.descripcion 
            FROM usuario_rol ur
            JOIN rol r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = %s
        """
        cursor.execute(query_roles, (usuario["id_usuario"],))
        roles_encontrados = cursor.fetchall()
        lista_roles = [r["descripcion"] for r in roles_encontrados]
        
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
def registrar_paciente(datos: RegistroRequest): # O el modelo que uses para registrar
    conexion = conectar_db()
    if not conexion:
        raise HTTPException(status_code=500, detail="No se pudo conectar a la base de datos")
    
    cursor = conexion.cursor(dictionary=True)
    try:
        # Verificamos si el correo ya existe
        cursor.execute("SELECT id_usuario FROM usuario WHERE email = %s", (datos.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")
        
        # Hasheamos la contraseña de forma segura
        password_hashed = encriptar_password(datos.password)
        
        # Usamos el email automáticamente como username para cumplir con la base de datos
        username_automatico = datos.email
        
        # 1. Insertar en la tabla usuario
        query_usuario = "INSERT INTO usuario (username, email, password_hash, activo) VALUES (%s, %s, %s, TRUE)"
        cursor.execute(query_usuario, (username_automatico, datos.email, password_hashed))
        id_usuario_nuevo = cursor.lastrowid
        
        # 2. Insertar en la tabla paciente
        query_paciente = """
            INSERT INTO paciente (nombre, apellido, dni, telefono, email) 
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query_paciente, (datos.nombre, datos.apellido, datos.dni, datos.telefono, datos.email))
        id_paciente_nuevo = cursor.lastrowid
        
        # 3. Asignar el rol de 'Paciente' (asumiendo id_rol 2 o buscando el rol Paciente)
        cursor.execute("SELECT id_rol FROM rol WHERE descripcion = 'Paciente'")
        rol_paciente = cursor.fetchone()
        id_rol = rol_paciente["id_rol"] if rol_paciente else 2
        
        query_rol = "INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (%s, %s)"
        cursor.execute(query_rol, (id_usuario_nuevo, id_rol))
        
        conexion.commit()
        return {"mensaje": "Paciente registrado exitosamente"}
        
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=400, detail=str(e))
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

class RecuperarPasswordRequest(BaseModel):
    email: str
    dni: str
    nueva_password: str

@app.post("/api/recuperar-password")
def recuperar_password(datos: RecuperarPasswordRequest):
    conexion = conectar_db()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    cursor = conexion.cursor(dictionary=True)
    try:
        # Verificamos que el email pertenezca a un paciente con ese DNI
        query_verificar = "SELECT * FROM paciente WHERE email = %s AND dni = %s"
        cursor.execute(query_verificar, (datos.email, datos.dni))
        paciente = cursor.fetchone()
        
        if not paciente:
            raise HTTPException(status_code=404, detail="Los datos no coinciden con ningún paciente registrado")
        
        # Encriptamos la nueva contraseña
        nuevo_hash = encriptar_password(datos.nueva_password)
        
        # Actualizamos la contraseña en la tabla usuario
        query_update = "UPDATE usuario SET password_hash = %s WHERE email = %s"
        cursor.execute(query_update, (nuevo_hash, datos.email))
        conexion.commit()
        
        return {"mensaje": "Contraseña actualizada exitosamente"}
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conexion.close()