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
    allow_origins=["http://localhost:5173"],
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
        password="741456Dsacxz",
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
# Trae los pacientes desde MySQL
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
# Guarda un paciente nuevo en MySQL
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


        # Confirma el INSERT en MySQL
        conexion.commit()


        # Obtiene el ID que MySQL le asignó
        # al nuevo paciente
        id_nuevo = cursor.lastrowid


        return {

            "mensaje": "Paciente creado correctamente",

            "id_paciente": id_nuevo

        }


    except mysql.connector.IntegrityError:

        # Si ocurre un error, deshacemos
        # la operación
        conexion.rollback()


        raise HTTPException(
            status_code=400,
            detail="Ya existe un paciente con ese DNI"
        )


    finally:

        cursor.close()

        conexion.close()