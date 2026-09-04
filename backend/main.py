from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import mysql.connector


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


# =========================================================
# INICIO
# =========================================================

@app.get("/")
def inicio():
    return {
        "mensaje": "API del sistema de turnos funcionando"
    }


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
# MÉDICOS
# =========================================================

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
            activo
        FROM medico
        WHERE activo = 1
        ORDER BY apellido, nombre
    """)

    medicos = cursor.fetchall()

    cursor.close()
    conexion.close()

    return medicos


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


@app.put("/turnos/{id_turno}")
def modificar_turno(
    id_turno: int,
    turno: TurnoNuevo
):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    try:

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