from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import mysql.connector
import bcrypt
from datetime import datetime, timedelta, timezone
import os
import jwt
from dotenv import load_dotenv
from pathlib import Path

# =========================================================
# CONFIGURACIÓN DE SEGURIDAD JWT 9-10
# =========================================================

load_dotenv(Path(__file__).resolve().parent / ".env")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not JWT_SECRET_KEY:
    raise RuntimeError("Falta configurar JWT_SECRET_KEY en el archivo .env")

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60
seguridad_jwt = HTTPBearer(auto_error=False)

def crear_token(usuario):
    fecha_expiracion = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_EXPIRATION_MINUTES
    )

    datos_token = {
        "sub": str(usuario["id_usuario"]),
        "exp": fecha_expiracion
    }

    token = jwt.encode(
        datos_token,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    return token

def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(seguridad_jwt)
):
    # Comprobar que se haya enviado un token
    if credenciales is None:
        raise HTTPException(
            status_code=401,
            detail="Debés iniciar sesión"
        )

    # Verificar la firma y la fecha de vencimiento
    try:
        datos_token = jwt.decode(
            credenciales.credentials,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        id_usuario = int(datos_token["sub"])

    except (jwt.InvalidTokenError, ValueError, KeyError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Sesión inválida o vencida"
        )

    # Buscar el usuario en MySQL
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT id_usuario, username, email,
                   id_paciente, id_medico
            FROM usuario
            WHERE id_usuario = %s AND activo = 1
        """, (id_usuario,))

        usuario = cursor.fetchone()

        if not usuario:
            raise HTTPException(
                status_code=401,
                detail="Usuario inexistente o inactivo"
            )

        # Consultar los roles actuales
        cursor.execute("""
            SELECT r.descripcion
            FROM usuario_rol ur
            INNER JOIN rol r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = %s
        """, (id_usuario,))

        usuario["roles"] = [
            fila["descripcion"]
            for fila in cursor.fetchall()
        ]

        return usuario

    finally:
        cursor.close()
        conexion.close()

def verificar_roles(*roles_permitidos):

    def comprobar_permisos(
        usuario=Depends(obtener_usuario_actual)
    ):
        roles_usuario = usuario.get("roles", [])

        if not any(
            rol in roles_permitidos
            for rol in roles_usuario
        ):
            raise HTTPException(
                status_code=403,
                detail="No tenés permisos para realizar esta operación"
            )

        return usuario

    return comprobar_permisos



# =========================================================
# CONFIGURACIÓN DE FASTAPI
# =========================================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/mi-sesion")
def consultar_mi_sesion(
    usuario=Depends(obtener_usuario_actual)
):
    return {
        "mensaje": "Sesión válida",
        "usuario": usuario
    }

@app.get("/api/prueba-medico")
def prueba_permiso_medico(
    usuario=Depends(verificar_roles("Médico"))
):
    return {
        "mensaje": "Acceso permitido para médicos",
        "usuario": usuario["username"],
        "id_medico": usuario["id_medico"]
    }
# =========================================================
# CONEXIÓN A MYSQL
# =========================================================

def conectar_db():
    conexion = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="clinica"
    )

    return conexion


# =========================================================
# MODELOS
# =========================================================

class LoginRequest(BaseModel):
    email: str
    password: str

class PacienteNuevo(BaseModel):
    dni: str
    nombre: str
    apellido: str
    telefono: str
    id_cobertura: Optional[int] = None
    numero_credencial: Optional[str] = None
    activo: bool = True


class TurnoNuevo(BaseModel):
    fecha: str
    hora: str
    motivo_consulta: str
    id_paciente: int
    id_medico: int
    estado: str
    observaciones: Optional[str] = None


class RecepcionUpdate(BaseModel):
    estado_recepcion: str


class HistoriaClinicaNueva(BaseModel):
    id_paciente: int
    antecedentes: Optional[str] = None
    alergias: Optional[str] = None
    observaciones_generales: Optional[str] = None


class EvolucionNueva(BaseModel):
    id_hc: int
    id_medico: int
    id_turno: Optional[int] = None
    descripcion: str
    diagnostico: Optional[str] = None
    tratamiento: Optional[str] = None
    indicaciones: Optional[str] = None
    ruta_archivo: Optional[str] = None

#maggie medicos
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

class MedicoConUsuarioNuevo(BaseModel):
    nombre: str
    apellido: str
    especialidad: str
    matricula: str
    telefono: Optional[str] = None
    email: str

    username: str
    password: str

    activo: bool = True    
#aca termina medico maggie    
#coberturas
class CoberturaNueva(BaseModel):
    nombre: str
    tipo: str
    activo: bool = True


class CoberturaActualizar(BaseModel):
    nombre: Optional[str] = None
    tipo: Optional[str] = None
    activo: Optional[bool] = None

class BloqueoAgendaNuevo(BaseModel):
    id_medico: int
    fecha: str
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    motivo: str
    dia_completo: bool = False

class AgendaMedicaNueva(BaseModel):
    id_medico: int
    dia_semana: str
    hora_inicio: str
    hora_fin: str
    duracion_turno: int
    activo: bool = True


# =========================================================
# LOGIN DE USUARIOS
# =========================================================

@app.post("/api/login")
def login_usuario(datos: LoginRequest):
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        # Buscar usuario activo por correo electrónico
        cursor.execute("""
            SELECT id_usuario, username, email, password,
                   id_paciente, id_medico
            FROM usuario
            WHERE email = %s AND activo = 1
        """, (datos.email,))

        usuario = cursor.fetchone()

        # Comprobar la contraseña usando bcrypt
        password_valida = False

        if usuario:
            try:
                password_valida = bcrypt.checkpw(
                    datos.password.encode("utf-8"),
                    usuario["password"].encode("utf-8")
                )
            except (ValueError, TypeError):
                password_valida = False

        if not password_valida:
            raise HTTPException(
                status_code=401,
                detail="Correo o contraseña incorrectos"
            )

        # Obtener los roles asignados al usuario
        cursor.execute("""
            SELECT r.descripcion
            FROM usuario_rol ur
            INNER JOIN rol r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = %s
        """, (usuario["id_usuario"],))

        roles = [fila["descripcion"] for fila in cursor.fetchall()]

        # Generar token JWT para el usuario autenticado
        token = crear_token(usuario)

        # Devolver el token y los datos del usuario
        return {
            "access_token": token,
            "token_type": "bearer",
            "mensaje": "Credenciales verificadas",
            "usuario": {
                "id_usuario": usuario["id_usuario"],
                "username": usuario["username"],
                "email": usuario["email"],
                "id_paciente": usuario["id_paciente"],
                "id_medico": usuario["id_medico"],
                "roles": roles
            }
        }

    finally:
        cursor.close()
        conexion.close()

# =========================================================
# PACIENTES
# =========================================================

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


@app.put("/pacientes/{id_paciente}")
def modificar_paciente(
    id_paciente: int,
    paciente: PacienteNuevo
):

    conexion = conectar_db()
    cursor = conexion.cursor()

    try:

        cursor.execute("""
            UPDATE paciente
            SET
                dni = %s,
                nombre = %s,
                apellido = %s,
                telefono = %s,
                id_cobertura = %s,
                numero_credencial = %s,
                activo = %s
            WHERE id_paciente = %s
        """, (
            paciente.dni,
            paciente.nombre,
            paciente.apellido,
            paciente.telefono,
            paciente.id_cobertura,
            paciente.numero_credencial,
            paciente.activo,
            id_paciente
        ))

        if cursor.rowcount == 0:

            raise HTTPException(
                status_code=404,
                detail="Paciente no encontrado"
            )

        conexion.commit()

        return {
            "mensaje": "Paciente modificado correctamente"
        }

    except mysql.connector.IntegrityError:

        conexion.rollback()

        raise HTTPException(
            status_code=400,
            detail="Ya existe otro paciente con ese DNI"
        )

    finally:

        cursor.close()
        conexion.close()


@app.put("/pacientes/{id_paciente}/inactivar")
def inactivar_paciente(id_paciente: int):

    conexion = conectar_db()
    cursor = conexion.cursor()

    try:

        cursor.execute("""
            UPDATE paciente
            SET activo = 0
            WHERE id_paciente = %s
        """, (
            id_paciente,
        ))

        if cursor.rowcount == 0:

            raise HTTPException(
                status_code=404,
                detail="Paciente no encontrado"
            )

        conexion.commit()

        return {
            "mensaje": "Paciente inactivado correctamente"
        }

    finally:

        cursor.close()
        conexion.close()


# =========================================================
# MÉDICOS con adaptacion maggie
# =========================================================

@app.get("/medicos")
def obtener_medicos():

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
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
            ORDER BY apellido, nombre
        """)

        medicos = cursor.fetchall()

        return medicos

    finally:
        cursor.close()
        conexion.close()


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

        return {
            "mensaje": "Médico creado correctamente",
            "id_medico": cursor.lastrowid
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


@app.put("/medicos/{id_medico}")
def actualizar_medico(
    id_medico: int,
    medico: MedicoActualizar
):

    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        cursor.execute("""
            UPDATE medico
            SET
                nombre = COALESCE(%s, nombre),
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

        if cursor.rowcount == 0:
            cursor.execute("""
                SELECT id_medico
                FROM medico
                WHERE id_medico = %s
            """, (id_medico,))

            existe = cursor.fetchone()

            if not existe:
                raise HTTPException(
                    status_code=404,
                    detail="Médico no encontrado"
                )

        conexion.commit()

        return {
            "mensaje": "Médico actualizado correctamente"
        }

    except HTTPException:

        conexion.rollback()
        raise

    except mysql.connector.IntegrityError:

        conexion.rollback()

        raise HTTPException(
            status_code=400,
            detail="La matrícula ya está registrada por otro médico"
        )

    finally:
        cursor.close()
        conexion.close()


@app.delete("/medicos/{id_medico}")
def eliminar_medico(id_medico: int):

    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        cursor.execute("""
            UPDATE medico
            SET activo = FALSE
            WHERE id_medico = %s
        """, (
            id_medico,
        ))

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Médico no encontrado"
            )

        conexion.commit()

        return {
            "mensaje": "Médico eliminado correctamente"
        }

    finally:
        cursor.close()
        conexion.close()

# =========================================================
# ADMINISTRACIÓN - ALTA DE MÉDICO CON USUARIO 4/10 
# =========================================================

@app.post("/admin/medicos")
def crear_medico_con_usuario(datos: MedicoConUsuarioNuevo):
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        # Hashear la contraseña antes de guardarla
        password_hash = bcrypt.hashpw(
            datos.password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        # 1. Crear el médico
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
            datos.nombre,
            datos.apellido,
            datos.especialidad,
            datos.matricula,
            datos.telefono,
            datos.email,
            datos.activo
        ))

        id_medico = cursor.lastrowid

        # 2. Crear el usuario asociado al médico
        cursor.execute("""
            INSERT INTO usuario (
                username,
                password,
                email,
                id_medico,
                activo
            )
            VALUES (%s, %s, %s, %s, %s)
        """, (
            datos.username,
            password_hash,
            datos.email,
            id_medico,
            datos.activo
        ))

        id_usuario = cursor.lastrowid

        # 3. Buscar el rol Médico
        cursor.execute("""
            SELECT id_rol
            FROM rol
            WHERE descripcion = %s
        """, ("Médico",))

        rol_medico = cursor.fetchone()

        if not rol_medico:
            raise HTTPException(
                status_code=500,
                detail="No está configurado el rol Médico"
            )

        # 4. Asignar el rol Médico al usuario
        cursor.execute("""
            INSERT INTO usuario_rol (
                id_usuario,
                id_rol
            )
            VALUES (%s, %s)
        """, (
            id_usuario,
            rol_medico["id_rol"]
        ))

        # Si salió TODO bien, recién acá guardamos
        conexion.commit()

        return {
            "mensaje": "Médico y usuario creados correctamente",
            "id_medico": id_medico,
            "id_usuario": id_usuario
        }

    except HTTPException:
        conexion.rollback()
        raise

    except mysql.connector.IntegrityError:
        conexion.rollback()
        raise HTTPException(
            status_code=400,
            detail="La matrícula, el nombre de usuario o el email ya están registrados"
        )

    except mysql.connector.Error:
        conexion.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al crear el médico y su usuario"
        )

    finally:
        cursor.close()
        conexion.close()        
# =========================================================
# COBERTURAS
# =========================================================

@app.get("/coberturas")
def obtener_coberturas():

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                id_cobertura,
                nombre,
                tipo,
                activo
            FROM cobertura_medica
            ORDER BY nombre
        """)

        coberturas = cursor.fetchall()

        return coberturas

    finally:
        cursor.close()
        conexion.close()


@app.post("/coberturas")
def crear_cobertura(cobertura: CoberturaNueva):

    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        cursor.execute("""
            INSERT INTO cobertura_medica (
                nombre,
                tipo,
                activo
            )
            VALUES (%s, %s, %s)
        """, (
            cobertura.nombre,
            cobertura.tipo,
            cobertura.activo
        ))

        conexion.commit()

        return {
            "mensaje": "Cobertura creada correctamente",
            "id_cobertura": cursor.lastrowid
        }

    except mysql.connector.Error as error:

        conexion.rollback()

        raise HTTPException(
            status_code=400,
            detail=f"Error al crear la cobertura: {error}"
        )

    finally:
        cursor.close()
        conexion.close()


@app.put("/coberturas/{id_cobertura}")
def actualizar_cobertura(
    id_cobertura: int,
    cobertura: CoberturaActualizar
):

    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        cursor.execute("""
            UPDATE cobertura_medica
            SET
                nombre = COALESCE(%s, nombre),
                tipo = COALESCE(%s, tipo),
                activo = COALESCE(%s, activo)
            WHERE id_cobertura = %s
        """, (
            cobertura.nombre,
            cobertura.tipo,
            cobertura.activo,
            id_cobertura
        ))

        if cursor.rowcount == 0:

            cursor.execute("""
                SELECT id_cobertura
                FROM cobertura_medica
                WHERE id_cobertura = %s
            """, (
                id_cobertura,
            ))

            existe = cursor.fetchone()

            if not existe:
                raise HTTPException(
                    status_code=404,
                    detail="Cobertura no encontrada"
                )

        conexion.commit()

        return {
            "mensaje": "Cobertura actualizada correctamente"
        }

    except HTTPException:

        conexion.rollback()
        raise

    except mysql.connector.Error as error:

        conexion.rollback()

        raise HTTPException(
            status_code=400,
            detail=f"Error al actualizar la cobertura: {error}"
        )

    finally:
        cursor.close()
        conexion.close()


@app.delete("/coberturas/{id_cobertura}")
def eliminar_cobertura(id_cobertura: int):

    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        cursor.execute("""
            UPDATE cobertura_medica
            SET activo = FALSE
            WHERE id_cobertura = %s
        """, (
            id_cobertura,
        ))

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Cobertura no encontrada"
            )

        conexion.commit()

        return {
            "mensaje": "Cobertura eliminada correctamente"
        }

    finally:
        cursor.close()
        conexion.close()
# =========================================================
# ESTADOS DE TURNO
# =========================================================

@app.get("/estados-turno")
def obtener_estados_turno():

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id_estado,
            descripcion
        FROM estado_turno
        ORDER BY id_estado
    """)

    estados = cursor.fetchall()

    cursor.close()
    conexion.close()

    return estados


# =========================================================
# TURNOS
# =========================================================
# =========================================================
# HORARIOS DISPONIBLES
# =========================================================

@app.get("/horarios-disponibles")
def obtener_horarios_disponibles(
    id_medico: int,
    fecha: str
):
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        # =====================================================
        # 1. VALIDAR LA FECHA
        # =====================================================

        try:
            fecha_obj = datetime.strptime(
                fecha,
                "%Y-%m-%d"
            )
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="La fecha debe tener formato YYYY-MM-DD"
            )

        # =====================================================
        # 2. OBTENER EL DÍA DE LA SEMANA
        # =====================================================

        dias_semana = [
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
            "Domingo"
        ]

        dia_semana = dias_semana[fecha_obj.weekday()]

        # =====================================================
        # 3. BUSCAR LA AGENDA HABITUAL DEL MÉDICO
        # =====================================================

        cursor.execute("""
            SELECT
                hora_inicio,
                hora_fin,
                duracion_turno
            FROM agenda_medica
            WHERE id_medico = %s
              AND dia_semana = %s
              AND activo = 1
            LIMIT 1
        """, (
            id_medico,
            dia_semana
        ))

        agenda = cursor.fetchone()

        # Si el médico no atiende ese día,
        # simplemente no hay horarios disponibles.
        if not agenda:
            return {
                "id_medico": id_medico,
                "fecha": fecha,
                "dia_semana": dia_semana,
                "horarios": []
            }

        # =====================================================
        # 4. GENERAR TODOS LOS HORARIOS POSIBLES
        # =====================================================

        hora_inicio = datetime.strptime(
            str(agenda["hora_inicio"]),
            "%H:%M:%S"
        )

        hora_fin = datetime.strptime(
            str(agenda["hora_fin"]),
            "%H:%M:%S"
        )

        duracion = agenda["duracion_turno"]

        horarios = []

        hora_actual = hora_inicio

        while hora_actual + timedelta(minutes=duracion) <= hora_fin:
            horarios.append(
                hora_actual.strftime("%H:%M")
            )

            hora_actual += timedelta(
                minutes=duracion
            )

        # =====================================================
        # 5. OBTENER TURNOS YA OCUPADOS
        # =====================================================

        cursor.execute("""
            SELECT
                TIME_FORMAT(hora, '%H:%i') AS hora
            FROM turno
            WHERE id_medico = %s
              AND fecha = %s
        """, (
            id_medico,
            fecha
        ))

        turnos_ocupados = cursor.fetchall()

        horas_ocupadas = {
            turno["hora"]
            for turno in turnos_ocupados
        }

        # =====================================================
        # 6. OBTENER BLOQUEOS DE ESE DÍA
        # =====================================================

        cursor.execute("""
            SELECT
                dia_completo,
                TIME_FORMAT(hora_inicio, '%H:%i') AS hora_inicio,
                TIME_FORMAT(hora_fin, '%H:%i') AS hora_fin
            FROM bloqueo_agenda
            WHERE id_medico = %s
              AND fecha = %s
        """, (
            id_medico,
            fecha
        ))

        bloqueos = cursor.fetchall()

        # =====================================================
        # 7. SI HAY BLOQUEO DE DÍA COMPLETO
        # =====================================================

        for bloqueo in bloqueos:
            if bloqueo["dia_completo"]:
                return {
                    "id_medico": id_medico,
                    "fecha": fecha,
                    "dia_semana": dia_semana,
                    "horarios": []
                }

        # =====================================================
        # 8. QUITAR HORARIOS OCUPADOS Y BLOQUEADOS
        # =====================================================

        horarios_disponibles = []

        for hora in horarios:

            # Si ya existe un turno en esa hora
            if hora in horas_ocupadas:
                continue

            bloqueado = False

            for bloqueo in bloqueos:
                hora_inicio_bloqueo = bloqueo["hora_inicio"]
                hora_fin_bloqueo = bloqueo["hora_fin"]

                if (
                    hora_inicio_bloqueo
                    and hora_fin_bloqueo
                    and hora >= hora_inicio_bloqueo
                    and hora < hora_fin_bloqueo
                ):
                    bloqueado = True
                    break

            if not bloqueado:
                horarios_disponibles.append(hora)

        # =====================================================
        # 9. DEVOLVER DISPONIBILIDAD
        # =====================================================

        return {
            "id_medico": id_medico,
            "fecha": fecha,
            "dia_semana": dia_semana,
            "duracion_turno": duracion,
            "horarios": horarios_disponibles
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener horarios disponibles: {error}"
        )

    finally:
        cursor.close()
        conexion.close()


@app.get("/turnos")
def obtener_turnos():

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            t.id_turno,
            t.fecha,

            TIME_FORMAT(
                t.hora,
                '%H:%i'
            ) AS hora,

            t.motivo_consulta,
            t.tipo_turno,

            t.id_paciente,

            CONCAT(
                p.nombre,
                ' ',
                p.apellido
            ) AS paciente,

            t.id_medico,

            CONCAT(
                m.nombre,
                ' ',
                m.apellido
            ) AS medico,

            t.id_estado,
            e.descripcion AS estado,

            t.hora_llegada,
            t.hora_inicio_consulta,
            t.estado_recepcion,
            t.observaciones

        FROM turno t

        INNER JOIN paciente p
            ON t.id_paciente = p.id_paciente

        INNER JOIN medico m
            ON t.id_medico = m.id_medico

        INNER JOIN estado_turno e
            ON t.id_estado = e.id_estado

        ORDER BY
            t.fecha,
            t.hora
    """)

    turnos = cursor.fetchall()

    cursor.close()
    conexion.close()

    return turnos


@app.post("/turnos")
def crear_turno(turno: TurnoNuevo):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:

        # =====================================================
        # 1. VERIFICICAR QUE EXISTA EL ESTADO
        # =====================================================

        cursor.execute("""
            SELECT id_estado
            FROM estado_turno
            WHERE descripcion = %s
        """, (
            turno.estado,
        ))

        estado = cursor.fetchone()

        if not estado:
            raise HTTPException(
                status_code=400,
                detail="El estado del turno no existe"
            )


        # =====================================================
        # 2. VERIFICAR QUE NO EXISTA OTRO TURNO
        # =====================================================

        cursor.execute("""
            SELECT id_turno
            FROM turno
            WHERE id_medico = %s
              AND fecha = %s
              AND hora = %s
        """, (
            turno.id_medico,
            turno.fecha,
            turno.hora
        ))

        turno_existente = cursor.fetchone()

        if turno_existente:
            raise HTTPException(
                status_code=400,
                detail=(
                    "El médico ya tiene un turno "
                    "en esa fecha y hora"
                )
            )


        # =====================================================
        # 3. VERIFICAR SI LA AGENDA ESTÁ BLOQUEADA
        # =====================================================

        cursor.execute("""
            SELECT
                id_bloqueo,
                motivo
            FROM bloqueo_agenda
            WHERE id_medico = %s
              AND fecha = %s
              AND (
                    dia_completo = TRUE
                    OR (
                        dia_completo = FALSE
                        AND %s >= hora_inicio
                        AND %s < hora_fin
                    )
                  )
            LIMIT 1
        """, (
            turno.id_medico,
            turno.fecha,
            turno.hora,
            turno.hora
        ))

        bloqueo = cursor.fetchone()

        if bloqueo:
            raise HTTPException(
                status_code=400,
                detail=(
                    "La agenda del médico está bloqueada "
                    "para esa fecha y horario"
                )
            )


        # =====================================================
        # 4. CREAR EL TURNO
        # =====================================================

        cursor.execute("""
            INSERT INTO turno (
                fecha,
                hora,
                motivo_consulta,
                tipo_turno,
                id_paciente,
                id_medico,
                id_estado,
                observaciones
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """, (
            turno.fecha,
            turno.hora,
            turno.motivo_consulta,
            "Programado",
            turno.id_paciente,
            turno.id_medico,
            estado["id_estado"],
            turno.observaciones
        ))

        conexion.commit()

        id_nuevo = cursor.lastrowid

        return {
            "mensaje": "Turno creado correctamente",
            "id_turno": id_nuevo
        }

    except HTTPException:

        conexion.rollback()
        raise

    except mysql.connector.Error as error:

        conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Error al crear el turno: {error}"
        )

    finally:

        cursor.close()
        conexion.close()


# =========================================================
# PORTAL PACIENTE - SOLICITAR TURNO
# =========================================================

class TurnoPacienteNuevo(BaseModel):
    id_medico: int
    fecha: str
    hora: str
    motivo_consulta: str


@app.get("/api/paciente/mis-turnos")
def obtener_mis_turnos(
    usuario=Depends(verificar_roles("Paciente"))
):
    id_paciente = usuario.get("id_paciente")

    if not id_paciente:
        raise HTTPException(
            status_code=403,
            detail="El usuario no tiene un paciente asociado"
        )

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                t.id_turno,
                DATE_FORMAT(t.fecha, '%Y-%m-%d') AS fecha,
                TIME_FORMAT(t.hora, '%H:%i') AS hora,
                t.motivo_consulta,
                CONCAT(m.nombre, ' ', m.apellido) AS medico,
                e.descripcion AS estado
            FROM turno t
            INNER JOIN medico m
                ON t.id_medico = m.id_medico
            INNER JOIN estado_turno e
                ON t.id_estado = e.id_estado
            WHERE t.id_paciente = %s
            ORDER BY t.fecha DESC, t.hora DESC
        """, (id_paciente,))

        return cursor.fetchall()

    finally:
        cursor.close()
        conexion.close()


@app.post("/api/paciente/turnos", status_code=201)
def solicitar_turno_paciente(
    datos: TurnoPacienteNuevo,
    usuario=Depends(verificar_roles("Paciente"))
):
    id_paciente = usuario.get("id_paciente")

    if not id_paciente:
        raise HTTPException(
            status_code=403,
            detail="El usuario no tiene un paciente asociado"
        )

    # Validar fecha y hora
    try:
        fecha_turno = datetime.strptime(
            datos.fecha, "%Y-%m-%d"
        ).date()

        hora_turno = datetime.strptime(
            datos.hora, "%H:%M"
        ).time()

    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Fecha u hora inválida"
        )

    if datetime.combine(fecha_turno, hora_turno) <= datetime.now():
        raise HTTPException(
            status_code=400,
            detail="No podés reservar turnos en el pasado"
        )

    if not datos.motivo_consulta.strip():
        raise HTTPException(
            status_code=400,
            detail="Ingresá el motivo de consulta"
        )

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        # Bloquear el registro del médico durante la reserva
        cursor.execute("""
            SELECT id_medico
            FROM medico
            WHERE id_medico = %s AND activo = 1
            FOR UPDATE
        """, (datos.id_medico,))

        if not cursor.fetchone():
            raise HTTPException(
                status_code=404,
                detail="Médico no disponible"
            )

        # Verificar que el paciente esté activo
        cursor.execute("""
            SELECT id_paciente
            FROM paciente
            WHERE id_paciente = %s AND activo = 1
        """, (id_paciente,))

        if not cursor.fetchone():
            raise HTTPException(
                status_code=403,
                detail="Paciente inexistente o inactivo"
            )

        dias_semana = [
            "Lunes", "Martes", "Miércoles",
            "Jueves", "Viernes", "Sábado", "Domingo"
        ]

        dia = dias_semana[fecha_turno.weekday()]

        # Consultar agenda del médico
        cursor.execute("""
            SELECT hora_inicio, hora_fin, duracion_turno
            FROM agenda_medica
            WHERE id_medico = %s
              AND dia_semana = %s
              AND activo = 1
            LIMIT 1
        """, (datos.id_medico, dia))

        agenda = cursor.fetchone()

        if not agenda:
            raise HTTPException(
                status_code=400,
                detail="El médico no atiende ese día"
            )

        # MySQL puede devolver los horarios como timedelta
        def convertir_hora(valor):
            if isinstance(valor, timedelta):
                return (datetime.min + valor).time()
            if isinstance(valor, str):
                return datetime.strptime(valor, "%H:%M:%S").time()
            return valor

        inicio = datetime.combine(
            fecha_turno,
            convertir_hora(agenda["hora_inicio"])
        )

        fin = datetime.combine(
            fecha_turno,
            convertir_hora(agenda["hora_fin"])
        )

        duracion = timedelta(
            minutes=int(agenda["duracion_turno"])
        )

        if duracion.total_seconds() <= 0:
            raise HTTPException(
                status_code=500,
                detail="Duración de agenda inválida"
            )

        horarios_validos = []
        actual = inicio

        while actual + duracion <= fin:
            horarios_validos.append(actual.time())
            actual += duracion

        if hora_turno not in horarios_validos:
            raise HTTPException(
                status_code=400,
                detail="El horario no pertenece a la agenda médica"
            )

        # Comprobar que el horario no esté ocupado
        cursor.execute("""
            SELECT id_turno
            FROM turno
            WHERE id_medico = %s
              AND fecha = %s
              AND hora = %s
            LIMIT 1
        """, (
            datos.id_medico,
            datos.fecha,
            datos.hora
        ))

        if cursor.fetchone():
            raise HTTPException(
                status_code=409,
                detail="Ese horario ya está ocupado"
            )

        # Comprobar bloqueos de agenda
        cursor.execute("""
            SELECT id_bloqueo
            FROM bloqueo_agenda
            WHERE id_medico = %s
              AND fecha = %s
              AND (
                  dia_completo = TRUE
                  OR (
                      hora_inicio <= %s
                      AND hora_fin > %s
                  )
              )
            LIMIT 1
        """, (
            datos.id_medico,
            datos.fecha,
            datos.hora,
            datos.hora
        ))

        if cursor.fetchone():
            raise HTTPException(
                status_code=409,
                detail="El horario está bloqueado"
            )

        # Estado inicial del turno
        cursor.execute("""
            SELECT id_estado
            FROM estado_turno
            WHERE descripcion = 'Asignado'
            LIMIT 1
        """)

        estado = cursor.fetchone()

        if not estado:
            raise HTTPException(
                status_code=500,
                detail="No existe el estado Asignado"
            )

        # Guardar el turno
        cursor.execute("""
            INSERT INTO turno (
                fecha,
                hora,
                motivo_consulta,
                tipo_turno,
                id_paciente,
                id_medico,
                id_estado
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            datos.fecha,
            datos.hora,
            datos.motivo_consulta.strip(),
            "Programado",
            id_paciente,
            datos.id_medico,
            estado["id_estado"]
        ))

        id_turno = cursor.lastrowid
        conexion.commit()

        return {
            "mensaje": "Turno reservado correctamente",
            "id_turno": id_turno,
            "estado": "Asignado"
        }

    except HTTPException:
        conexion.rollback()
        raise

    except mysql.connector.Error:
        conexion.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al guardar el turno"
        )

    finally:
        cursor.close()
        conexion.close()


@app.put("/turnos/{id_turno}")
def modificar_turno(
    id_turno: int,
    turno: TurnoNuevo
):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:

        # =====================================================
        # 1. VERIFICAR QUE EXISTA EL ESTADO
        # =====================================================

        cursor.execute("""
            SELECT id_estado
            FROM estado_turno
            WHERE descripcion = %s
        """, (
            turno.estado,
        ))

        estado = cursor.fetchone()

        if not estado:
            raise HTTPException(
                status_code=400,
                detail="El estado del turno no existe"
            )


        # =====================================================
        # 2. VERIFICAR QUE NO EXISTA OTRO TURNO
        # =====================================================

        cursor.execute("""
            SELECT id_turno
            FROM turno
            WHERE id_medico = %s
              AND fecha = %s
              AND hora = %s
              AND id_turno <> %s
        """, (
            turno.id_medico,
            turno.fecha,
            turno.hora,
            id_turno
        ))

        turno_existente = cursor.fetchone()

        if turno_existente:
            raise HTTPException(
                status_code=400,
                detail=(
                    "El médico ya tiene un turno "
                    "en esa fecha y hora"
                )
            )


        # =====================================================
        # 3. VERIFICAR SI LA AGENDA ESTÁ BLOQUEADA
        # =====================================================

        cursor.execute("""
            SELECT
                id_bloqueo,
                motivo
            FROM bloqueo_agenda
            WHERE id_medico = %s
              AND fecha = %s
              AND (
                    dia_completo = TRUE
                    OR (
                        dia_completo = FALSE
                        AND %s >= hora_inicio
                        AND %s < hora_fin
                    )
                  )
            LIMIT 1
        """, (
            turno.id_medico,
            turno.fecha,
            turno.hora,
            turno.hora
        ))

        bloqueo = cursor.fetchone()

        if bloqueo:
            raise HTTPException(
                status_code=400,
                detail=(
                    "La agenda del médico está bloqueada "
                    "para esa fecha y horario"
                )
            )


        # =====================================================
        # 4. MODIFICAR EL TURNO
        # =====================================================

        cursor.execute("""
            UPDATE turno
            SET
                fecha = %s,
                hora = %s,
                motivo_consulta = %s,
                tipo_turno = %s,
                id_paciente = %s,
                id_medico = %s,
                id_estado = %s,
                observaciones = %s
            WHERE id_turno = %s
        """, (
            turno.fecha,
            turno.hora,
            turno.motivo_consulta,
            "Programado",
            turno.id_paciente,
            turno.id_medico,
            estado["id_estado"],
            turno.observaciones,
            id_turno
        ))


        # =====================================================
        # 5. VERIFICAR QUE EL TURNO EXISTA
        # =====================================================

        if cursor.rowcount == 0:

            cursor.execute("""
                SELECT id_turno
                FROM turno
                WHERE id_turno = %s
            """, (
                id_turno,
            ))

            existe = cursor.fetchone()

            if not existe:
                raise HTTPException(
                    status_code=404,
                    detail="Turno no encontrado"
                )


        conexion.commit()

        return {
            "mensaje": "Turno modificado correctamente"
        }


    except HTTPException:

        conexion.rollback()
        raise


    except mysql.connector.Error as error:

        conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Error al modificar el turno: {error}"
        )


    finally:

        cursor.close()
        conexion.close()

# =========================================================
# RECEPCIÓN
# =========================================================

@app.put("/turnos/{id_turno}/recepcion")
def actualizar_recepcion(
    id_turno: int,
    datos: RecepcionUpdate
):

    conexion = conectar_db()
    cursor = conexion.cursor()

    try:

        estados_validos = [
            "Pendiente",
            "En espera",
            "En consulta",
            "Finalizado",
            "Ausente"
        ]

        if datos.estado_recepcion not in estados_validos:

            raise HTTPException(
                status_code=400,
                detail="Estado de recepción inválido"
            )


        # PACIENTE LLEGA:
        # empieza el tiempo de espera

        if datos.estado_recepcion == "En espera":

            cursor.execute("""
                UPDATE turno
                SET
                    estado_recepcion = %s,
                    hora_llegada = NOW(),
                    hora_inicio_consulta = NULL
                WHERE id_turno = %s
            """, (
                datos.estado_recepcion,
                id_turno
            ))


        # EMPIEZA LA CONSULTA:
        # se guarda la hora para congelar el reloj

        elif datos.estado_recepcion == "En consulta":

            cursor.execute("""
                UPDATE turno
                SET
                    estado_recepcion = %s,
                    hora_inicio_consulta = NOW()
                WHERE id_turno = %s
            """, (
                datos.estado_recepcion,
                id_turno
            ))


        # FINALIZADO, AUSENTE O PENDIENTE

        else:

            cursor.execute("""
                UPDATE turno
                SET estado_recepcion = %s
                WHERE id_turno = %s
            """, (
                datos.estado_recepcion,
                id_turno
            ))


        if cursor.rowcount == 0:

            raise HTTPException(
                status_code=404,
                detail="Turno no encontrado"
            )


        conexion.commit()

        return {
            "mensaje":
                "Estado de recepción actualizado correctamente"
        }

    finally:

        cursor.close()
        conexion.close()

# =========================================================
# HISTORIA CLÍNICA
# =========================================================


@app.get("/historias-clinicas")
def obtener_historias_clinicas():

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT
                hc.id_hc,
                hc.id_paciente,
                p.nombre,
                p.apellido,
                p.dni,
                hc.antecedentes,
                hc.alergias,
                hc.observaciones_generales,
                hc.fecha_creacion
            FROM historia_clinica hc
            INNER JOIN paciente p
                ON hc.id_paciente = p.id_paciente
            ORDER BY p.apellido, p.nombre
        """)

        historias = cursor.fetchall()

        return historias

    finally:

        cursor.close()
        conexion.close()


@app.get("/historias-clinicas/paciente/{id_paciente}")
def obtener_historia_clinica_paciente(
    id_paciente: int
):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT
                hc.id_hc,
                hc.id_paciente,

                p.nombre,
                p.apellido,
                p.dni,
                p.fecha_nacimiento,
                p.telefono,
                p.email,
                p.id_cobertura,
                p.plan,
                p.numero_credencial,

                hc.antecedentes,
                hc.alergias,
                hc.observaciones_generales,
                hc.fecha_creacion

            FROM historia_clinica hc

            INNER JOIN paciente p
                ON hc.id_paciente = p.id_paciente

            WHERE hc.id_paciente = %s
        """, (
            id_paciente,
        ))

        historia = cursor.fetchone()

        if not historia:

            raise HTTPException(
                status_code=404,
                detail="El paciente no tiene historia clínica"
            )

        return historia

    finally:

        cursor.close()
        conexion.close()


@app.post("/historias-clinicas")
def crear_historia_clinica(
    historia: HistoriaClinicaNueva
):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT id_paciente
            FROM paciente
            WHERE id_paciente = %s
        """, (
            historia.id_paciente,
        ))

        paciente = cursor.fetchone()

        if not paciente:

            raise HTTPException(
                status_code=404,
                detail="Paciente no encontrado"
            )


        cursor.execute("""
            SELECT id_hc
            FROM historia_clinica
            WHERE id_paciente = %s
        """, (
            historia.id_paciente,
        ))

        historia_existente = cursor.fetchone()

        if historia_existente:

            raise HTTPException(
                status_code=400,
                detail="El paciente ya tiene una historia clínica"
            )


        cursor.execute("""
            INSERT INTO historia_clinica (
                id_paciente,
                antecedentes,
                alergias,
                observaciones_generales
            )
            VALUES (%s, %s, %s, %s)
        """, (
            historia.id_paciente,
            historia.antecedentes,
            historia.alergias,
            historia.observaciones_generales
        ))

        conexion.commit()

        return {
            "mensaje":
                "Historia clínica creada correctamente",
            "id_hc":
                cursor.lastrowid
        }

    except HTTPException:

        conexion.rollback()
        raise

    except mysql.connector.Error as error:

        conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Error al crear la historia clínica: {error}"
        )

    finally:

        cursor.close()
        conexion.close()


@app.put("/historias-clinicas/{id_hc}")
def modificar_historia_clinica(
    id_hc: int,
    historia: HistoriaClinicaNueva
):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:

        cursor.execute("""
            UPDATE historia_clinica
            SET
                antecedentes = %s,
                alergias = %s,
                observaciones_generales = %s
            WHERE id_hc = %s
        """, (
            historia.antecedentes,
            historia.alergias,
            historia.observaciones_generales,
            id_hc
        ))

        if cursor.rowcount == 0:

            cursor.execute("""
                SELECT id_hc
                FROM historia_clinica
                WHERE id_hc = %s
            """, (
                id_hc,
            ))

            existe = cursor.fetchone()

            if not existe:

                raise HTTPException(
                    status_code=404,
                    detail="Historia clínica no encontrada"
                )

        conexion.commit()

        return {
            "mensaje":
                "Historia clínica modificada correctamente"
        }

    except HTTPException:

        conexion.rollback()
        raise

    except mysql.connector.Error as error:

        conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Error al modificar la historia clínica: {error}"
        )

    finally:

        cursor.close()
        conexion.close()


@app.get("/historias-clinicas/{id_hc}/evoluciones")
def obtener_evoluciones(
    id_hc: int
):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT
                e.id_evolucion,
                e.id_hc,
                e.id_medico,
                e.id_turno,
                e.fecha_hora,
                e.descripcion,
                e.diagnostico,
                e.tratamiento,
                e.indicaciones,
                e.ruta_archivo,

                CONCAT(
                    m.nombre,
                    ' ',
                    m.apellido
                ) AS medico

            FROM evolucion e

            INNER JOIN medico m
                ON e.id_medico = m.id_medico

            WHERE e.id_hc = %s

            ORDER BY e.fecha_hora DESC
        """, (
            id_hc,
        ))

        evoluciones = cursor.fetchall()

        return evoluciones

    finally:

        cursor.close()
        conexion.close()        

# =========================================================
# EVOLUCIONES
# =========================================================


@app.post("/evoluciones")
def crear_evolucion(
    evolucion: EvolucionNueva
):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:

        # Verificar que exista la historia clínica
        cursor.execute("""
            SELECT id_hc
            FROM historia_clinica
            WHERE id_hc = %s
        """, (
            evolucion.id_hc,
        ))

        historia = cursor.fetchone()

        if not historia:

            raise HTTPException(
                status_code=404,
                detail="Historia clínica no encontrada"
            )


        # Verificar que exista el médico
        cursor.execute("""
            SELECT id_medico
            FROM medico
            WHERE id_medico = %s
        """, (
            evolucion.id_medico,
        ))

        medico = cursor.fetchone()

        if not medico:

            raise HTTPException(
                status_code=404,
                detail="Médico no encontrado"
            )


        # Si se envió un turno, verificar que exista
        if evolucion.id_turno is not None:

            cursor.execute("""
                SELECT id_turno
                FROM turno
                WHERE id_turno = %s
            """, (
                evolucion.id_turno,
            ))

            turno = cursor.fetchone()

            if not turno:

                raise HTTPException(
                    status_code=404,
                    detail="Turno no encontrado"
                )


        # Crear la evolución
        cursor.execute("""
            INSERT INTO evolucion (
                id_hc,
                id_medico,
                id_turno,
                descripcion,
                diagnostico,
                tratamiento,
                indicaciones,
                ruta_archivo
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """, (
            evolucion.id_hc,
            evolucion.id_medico,
            evolucion.id_turno,
            evolucion.descripcion,
            evolucion.diagnostico,
            evolucion.tratamiento,
            evolucion.indicaciones,
            evolucion.ruta_archivo
        ))

        conexion.commit()

        id_nueva_evolucion = cursor.lastrowid

        return {
            "mensaje": "Evolución creada correctamente",
            "id_evolucion": id_nueva_evolucion
        }

    except HTTPException:

        conexion.rollback()
        raise

    except mysql.connector.Error as error:

        conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Error al crear la evolución: {error}"
        )

    finally:

        cursor.close()
        conexion.close()        

# =========================================================
# BLOQUEO DE AGENDA
# =========================================================


@app.get("/bloqueos-agenda")
def obtener_bloqueos_agenda():

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                b.id_bloqueo,
                b.id_medico,
                CONCAT(m.nombre, ' ', m.apellido) AS medico,
                b.fecha,
                TIME_FORMAT(b.hora_inicio, '%H:%i') AS hora_inicio,
                TIME_FORMAT(b.hora_fin, '%H:%i') AS hora_fin,
                b.motivo,
                b.dia_completo,
                b.fecha_creacion
            FROM bloqueo_agenda b
            INNER JOIN medico m
                ON b.id_medico = m.id_medico
            ORDER BY b.fecha, b.hora_inicio
        """)

        return cursor.fetchall()

    finally:
        cursor.close()
        conexion.close()


@app.post("/bloqueos-agenda")
def crear_bloqueo_agenda(bloqueo: BloqueoAgendaNuevo):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        # Verificar que exista el médico
        cursor.execute("""
            SELECT id_medico
            FROM medico
            WHERE id_medico = %s
        """, (bloqueo.id_medico,))

        medico = cursor.fetchone()

        if not medico:
            raise HTTPException(
                status_code=404,
                detail="Médico no encontrado"
            )

        # Si NO es día completo, necesitamos horario
        if not bloqueo.dia_completo:
            if not bloqueo.hora_inicio or not bloqueo.hora_fin:
                raise HTTPException(
                    status_code=400,
                    detail="Debe indicar hora de inicio y hora de fin"
                )

            if bloqueo.hora_inicio >= bloqueo.hora_fin:
                raise HTTPException(
                    status_code=400,
                    detail="La hora de inicio debe ser anterior a la hora de fin"
                )

        cursor.execute("""
            INSERT INTO bloqueo_agenda (
                id_medico,
                fecha,
                hora_inicio,
                hora_fin,
                motivo,
                dia_completo
            )
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            bloqueo.id_medico,
            bloqueo.fecha,
            None if bloqueo.dia_completo else bloqueo.hora_inicio,
            None if bloqueo.dia_completo else bloqueo.hora_fin,
            bloqueo.motivo,
            bloqueo.dia_completo
        ))

        conexion.commit()

        return {
            "mensaje": "Agenda bloqueada correctamente",
            "id_bloqueo": cursor.lastrowid
        }

    except HTTPException:
        conexion.rollback()
        raise

    except mysql.connector.Error as error:
        conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Error al bloquear la agenda: {error}"
        )

    finally:
        cursor.close()
        conexion.close()


@app.delete("/bloqueos-agenda/{id_bloqueo}")
def eliminar_bloqueo_agenda(id_bloqueo: int):

    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        cursor.execute("""
            DELETE FROM bloqueo_agenda
            WHERE id_bloqueo = %s
        """, (id_bloqueo,))

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Bloqueo no encontrado"
            )

        conexion.commit()

        return {
            "mensaje": "Bloqueo de agenda eliminado correctamente"
        }

    except HTTPException:
        conexion.rollback()
        raise

    finally:
        cursor.close()
        conexion.close()  

# =====================================================
# AGENDAS MÉDICAS
# =====================================================

@app.get("/agendas-medicas")
def listar_agendas_medicas():
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                a.id_agenda,
                a.id_medico,
                CONCAT(m.nombre, ' ', m.apellido) AS medico,
                a.dia_semana,
                TIME_FORMAT(a.hora_inicio, '%H:%i') AS hora_inicio,
                TIME_FORMAT(a.hora_fin, '%H:%i') AS hora_fin,
                a.duracion_turno,
                a.activo
            FROM agenda_medica a
            INNER JOIN medico m
                ON a.id_medico = m.id_medico
            WHERE a.activo = 1
            ORDER BY
                a.id_medico,
                FIELD(
                    a.dia_semana,
                    'Lunes',
                    'Martes',
                    'Miércoles',
                    'Jueves',
                    'Viernes',
                    'Sábado',
                    'Domingo'
                )
        """)

        agendas = cursor.fetchall()

        return agendas

    finally:
        cursor.close()
        conexion.close()  

# =====================================================
# CREAR AGENDA MÉDICA
# =====================================================

@app.post("/agendas-medicas")
def crear_agenda_medica(agenda: AgendaMedicaNueva):
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        # Verificar que el médico exista y esté activo
        cursor.execute(
            """
            SELECT id_medico
            FROM medico
            WHERE id_medico = %s
              AND activo = 1
            """,
            (agenda.id_medico,)
        )

        medico = cursor.fetchone()

        if not medico:
            raise HTTPException(
                status_code=404,
                detail="El médico no existe o está inactivo"
            )

        # Validar día
        dias_validos = [
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
            "Domingo"
        ]

        if agenda.dia_semana not in dias_validos:
            raise HTTPException(
                status_code=400,
                detail="El día de la semana no es válido"
            )

        # Validar horarios
        if agenda.hora_inicio >= agenda.hora_fin:
            raise HTTPException(
                status_code=400,
                detail="La hora de inicio debe ser anterior a la hora de fin"
            )

        # Validar duración
        if agenda.duracion_turno <= 0:
            raise HTTPException(
                status_code=400,
                detail="La duración del turno debe ser mayor a 0 minutos"
            )

        # Evitar dos agendas activas para el mismo médico y día
        cursor.execute(
            """
            SELECT id_agenda
            FROM agenda_medica
            WHERE id_medico = %s
              AND dia_semana = %s
              AND activo = 1
            """,
            (
                agenda.id_medico,
                agenda.dia_semana
            )
        )

        existente = cursor.fetchone()

        if existente:
            raise HTTPException(
                status_code=400,
                detail="El médico ya tiene una agenda configurada para ese día"
            )

        # Crear agenda
        cursor.execute(
            """
            INSERT INTO agenda_medica
            (
                id_medico,
                dia_semana,
                hora_inicio,
                hora_fin,
                duracion_turno,
                activo
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                agenda.id_medico,
                agenda.dia_semana,
                agenda.hora_inicio,
                agenda.hora_fin,
                agenda.duracion_turno,
                agenda.activo
            )
        )

        conexion.commit()

        return {
            "mensaje": "Agenda médica creada correctamente",
            "id_agenda": cursor.lastrowid
        }

    except HTTPException:
        conexion.rollback()
        raise

    except Exception as e:
        conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        cursor.close()
        conexion.close()


# =====================================================
# MODIFICAR AGENDA MÉDICA
# =====================================================

@app.put("/agendas-medicas/{id_agenda}")
def modificar_agenda_medica(
    id_agenda: int,
    agenda: AgendaMedicaNueva
):
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        # Verificar que la agenda exista
        cursor.execute(
            """
            SELECT id_agenda
            FROM agenda_medica
            WHERE id_agenda = %s
            """,
            (id_agenda,)
        )

        existente = cursor.fetchone()

        if not existente:
            raise HTTPException(
                status_code=404,
                detail="La agenda médica no existe"
            )

        # Verificar médico
        cursor.execute(
            """
            SELECT id_medico
            FROM medico
            WHERE id_medico = %s
              AND activo = 1
            """,
            (agenda.id_medico,)
        )

        medico = cursor.fetchone()

        if not medico:
            raise HTTPException(
                status_code=404,
                detail="El médico no existe o está inactivo"
            )

        # Validar día
        dias_validos = [
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
            "Domingo"
        ]

        if agenda.dia_semana not in dias_validos:
            raise HTTPException(
                status_code=400,
                detail="El día de la semana no es válido"
            )

        # Validar horarios
        if agenda.hora_inicio >= agenda.hora_fin:
            raise HTTPException(
                status_code=400,
                detail="La hora de inicio debe ser anterior a la hora de fin"
            )

        # Validar duración
        if agenda.duracion_turno <= 0:
            raise HTTPException(
                status_code=400,
                detail="La duración del turno debe ser mayor a 0 minutos"
            )

        # Evitar duplicados
        cursor.execute(
            """
            SELECT id_agenda
            FROM agenda_medica
            WHERE id_medico = %s
              AND dia_semana = %s
              AND activo = 1
              AND id_agenda <> %s
            """,
            (
                agenda.id_medico,
                agenda.dia_semana,
                id_agenda
            )
        )

        duplicada = cursor.fetchone()

        if duplicada:
            raise HTTPException(
                status_code=400,
                detail="El médico ya tiene otra agenda activa para ese día"
            )

        # Actualizar
        cursor.execute(
            """
            UPDATE agenda_medica
            SET
                id_medico = %s,
                dia_semana = %s,
                hora_inicio = %s,
                hora_fin = %s,
                duracion_turno = %s,
                activo = %s
            WHERE id_agenda = %s
            """,
            (
                agenda.id_medico,
                agenda.dia_semana,
                agenda.hora_inicio,
                agenda.hora_fin,
                agenda.duracion_turno,
                agenda.activo,
                id_agenda
            )
        )

        conexion.commit()

        return {
            "mensaje": "Agenda médica actualizada correctamente"
        }

    except HTTPException:
        conexion.rollback()
        raise

    except Exception as e:
        conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        cursor.close()
        conexion.close()


# =====================================================
# DESACTIVAR AGENDA MÉDICA
# =====================================================

@app.delete("/agendas-medicas/{id_agenda}")
def desactivar_agenda_medica(id_agenda: int):
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        # Verificar que exista
        cursor.execute(
            """
            SELECT id_agenda
            FROM agenda_medica
            WHERE id_agenda = %s
            """,
            (id_agenda,)
        )

        agenda = cursor.fetchone()

        if not agenda:
            raise HTTPException(
                status_code=404,
                detail="La agenda médica no existe"
            )

        # Baja lógica
        cursor.execute(
            """
            UPDATE agenda_medica
            SET activo = 0
            WHERE id_agenda = %s
            """,
            (id_agenda,)
        )

        conexion.commit()

        return {
            "mensaje": "Agenda médica desactivada correctamente"
        }

    except HTTPException:
        conexion.rollback()
        raise

    except Exception as e:
        conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        cursor.close()
        conexion.close()        


# =========================================================
# REGISTRO PÚBLICO DE PACIENTES - INTEGRACIÓN MAGGIE
# =========================================================

class RegistroPacienteRequest(BaseModel):
    email: str
    password: str
    nombre: str
    apellido: str
    dni: str
    telefono: Optional[str] = ""


@app.post("/api/registro")
def registrar_paciente(datos: RegistroPacienteRequest):

    email = datos.email.strip().lower()
    nombre = datos.nombre.strip()
    apellido = datos.apellido.strip()
    dni = datos.dni.strip()
    telefono = (datos.telefono or "").strip()

    if not email or "@" not in email:
        raise HTTPException(
            status_code=400,
            detail="Ingresá un correo electrónico válido"
        )

    if len(email) > 50:
        raise HTTPException(
            status_code=400,
            detail="El correo es demasiado largo para usarlo como usuario"
        )

    if not nombre or not apellido or not dni:
        raise HTTPException(
            status_code=400,
            detail="Completá nombre, apellido y DNI"
        )

    if len(datos.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="La contraseña debe tener al menos 6 caracteres"
        )

    if len(datos.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="La contraseña es demasiado larga"
        )

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:
        # 1. Verificar que el correo no esté registrado
        cursor.execute(
            "SELECT id_usuario FROM usuario WHERE email = %s",
            (email,)
        )

        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="El correo electrónico ya está registrado"
            )

        # 2. Verificar que el DNI no exista
        cursor.execute(
            "SELECT id_paciente FROM paciente WHERE dni = %s",
            (dni,)
        )

        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="El DNI ya está registrado. Consultá con recepción."
            )

        # 3. Buscar el rol Paciente
        cursor.execute(
            "SELECT id_rol FROM rol WHERE descripcion = %s",
            ("Paciente",)
        )

        rol = cursor.fetchone()

        if not rol:
            raise HTTPException(
                status_code=500,
                detail="No está configurado el rol Paciente"
            )

        # 4. Crear el paciente
        cursor.execute("""
            INSERT INTO paciente (
                nombre,
                apellido,
                dni,
                telefono,
                email,
                activo
            )
            VALUES (%s, %s, %s, %s, %s, 1)
        """, (
            nombre,
            apellido,
            dni,
            telefono,
            email
        ))

        id_paciente = cursor.lastrowid

        # 5. Encriptar la contraseña
        password_hash = bcrypt.hashpw(
            datos.password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        # 6. Crear usuario asociado al paciente
        cursor.execute("""
            INSERT INTO usuario (
                username,
                password,
                email,
                id_paciente,
                activo
            )
            VALUES (%s, %s, %s, %s, 1)
        """, (
            email,
            password_hash,
            email,
            id_paciente
        ))

        id_usuario = cursor.lastrowid

        # 7. Asignar únicamente el rol Paciente
        cursor.execute("""
            INSERT INTO usuario_rol (
                id_usuario,
                id_rol
            )
            VALUES (%s, %s)
        """, (
            id_usuario,
            rol["id_rol"]
        ))

        # 8. Guardar todo junto
        conexion.commit()

        return {
            "mensaje": "Paciente registrado correctamente",
            "id_usuario": id_usuario,
            "id_paciente": id_paciente
        }

    except HTTPException:
        conexion.rollback()
        raise

    except mysql.connector.IntegrityError:
        conexion.rollback()
        raise HTTPException(
            status_code=400,
            detail="El correo, usuario o DNI ya está registrado"
        )

    except mysql.connector.Error:
        conexion.rollback()
        raise HTTPException(
            status_code=500,
            detail="No se pudo completar el registro"
        )

    finally:
        cursor.close()
        conexion.close()
