from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
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

from datetime import datetime

# -----------------------------------
# MODELO PARA CREAR UN TURNO
# -----------------------------------

class TurnoNuevo(BaseModel):
    id_paciente: int
    id_medico: int
    fecha_hora: datetime
    observaciones: Optional[str] = None


# -----------------------------------
# GET TURNOS
# -----------------------------------

@app.get("/turnos")
def obtener_turnos():
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            t.id_turno,
            t.fecha_hora,
            t.estado,
            t.observaciones,
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
# POST TURNOS (Con validación de superposición)
# -----------------------------------

@app.post("/turnos")
def crear_turno(turno: TurnoNuevo):
    conexion = conectar_db()
    cursor = conexion.cursor()

    try:
        # Validar si el médico ya tiene un turno exactamente a la misma hora
        cursor.execute("""
            SELECT id_turno FROM turno 
            WHERE id_medico = %s AND fecha_hora = %s AND estado != 'Cancelado'
        """, (turno.id_medico, turno.fecha_hora))

        turno_existente = cursor.fetchone()

        if turno_existente:
            raise HTTPException(
                status_code=400, 
                detail="El médico ya tiene un turno asignado en ese horario."
            )

        # Insertar el nuevo turno
        cursor.execute("""
            INSERT INTO turno (id_paciente, id_medico, fecha_hora, observaciones, estado)
            VALUES (%s, %s, %s, %s, 'Pendiente')
        """, (
            turno.id_paciente,
            turno.id_medico,
            turno.fecha_hora,
            turno.observaciones
        ))

        conexion.commit()
        id_nuevo = cursor.lastrowid

        return {
            "mensaje": "Turno creado correctamente",
            "id_turno": id_nuevo
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conexion.close()