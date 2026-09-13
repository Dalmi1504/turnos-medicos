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