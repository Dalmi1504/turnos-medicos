-- UCBA: base de demostración. Registros de usuarios y recuperación excluidos.
-- Los usuarios deben crearse de forma local con contraseñas nuevas.
CREATE DATABASE IF NOT EXISTS `clinica` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `clinica`;

-- MySQL dump 10.13  Distrib 8.0.46, for macos15 (arm64)
--
-- Host: localhost    Database: clinica
-- ------------------------------------------------------
-- Server version	9.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- GTID state at the beginning of the backup 
--


--
-- Table structure for table `agenda_medica`
--

DROP TABLE IF EXISTS `agenda_medica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agenda_medica` (
  `id_agenda` int NOT NULL AUTO_INCREMENT,
  `id_medico` int NOT NULL,
  `dia_semana` enum('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `duracion_turno` int NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_agenda`),
  KEY `fk_agenda_medico` (`id_medico`),
  CONSTRAINT `fk_agenda_medico` FOREIGN KEY (`id_medico`) REFERENCES `medico` (`id_medico`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agenda_medica`
--

LOCK TABLES `agenda_medica` WRITE;
/*!40000 ALTER TABLE `agenda_medica` DISABLE KEYS */;
INSERT INTO `agenda_medica` VALUES (1,1,'Martes','08:00:00','14:00:00',30,1),(2,1,'Jueves','08:00:00','14:00:00',30,1),(3,2,'Lunes','08:00:00','14:00:00',30,1),(4,2,'Miércoles','08:00:00','14:00:00',30,1),(5,3,'Martes','08:00:00','14:00:00',30,1),(6,3,'Viernes','08:00:00','14:00:00',30,1),(7,4,'Miércoles','08:00:00','14:00:00',30,1),(8,4,'Jueves','08:00:00','14:00:00',30,1);
/*!40000 ALTER TABLE `agenda_medica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bloqueo_agenda`
--

DROP TABLE IF EXISTS `bloqueo_agenda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bloqueo_agenda` (
  `id_bloqueo` int NOT NULL AUTO_INCREMENT,
  `id_medico` int NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dia_completo` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_bloqueo`),
  KEY `fk_bloqueo_medico` (`id_medico`),
  CONSTRAINT `fk_bloqueo_medico` FOREIGN KEY (`id_medico`) REFERENCES `medico` (`id_medico`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bloqueo_agenda`
--

LOCK TABLES `bloqueo_agenda` WRITE;
/*!40000 ALTER TABLE `bloqueo_agenda` DISABLE KEYS */;
INSERT INTO `bloqueo_agenda` VALUES (1,1,'2026-11-17','10:00:00','11:00:00','Reunión de equipo','2026-11-13 14:33:20',0),(2,2,'2026-11-16',NULL,NULL,'Capacitación profesional','2026-11-13 14:33:20',1),(3,4,'2026-11-19','12:00:00','13:00:00','Actividad institucional','2026-11-13 14:33:20',0),(5,2,'2026-11-11','10:00:00','13:30:00','prueba','2026-11-13 19:05:43',0);
/*!40000 ALTER TABLE `bloqueo_agenda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cobertura_medica`
--

DROP TABLE IF EXISTS `cobertura_medica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cobertura_medica` (
  `id_cobertura` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('Obra Social','Prepaga','Particular') COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_cobertura`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cobertura_medica`
--

LOCK TABLES `cobertura_medica` WRITE;
/*!40000 ALTER TABLE `cobertura_medica` DISABLE KEYS */;
INSERT INTO `cobertura_medica` VALUES (1,'OSDE','Prepaga',1),(2,'Swiss Medical','Prepaga',1),(3,'Galeno','Prepaga',1),(4,'PAMI','Obra Social',1),(5,'Particular','Particular',1),(6,'IOMA','Obra Social',1),(7,'Unión Personal','Obra Social',1);
/*!40000 ALTER TABLE `cobertura_medica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_turno`
--

DROP TABLE IF EXISTS `estado_turno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_turno` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `uq_estado_turno_descripcion` (`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_turno`
--

LOCK TABLES `estado_turno` WRITE;
/*!40000 ALTER TABLE `estado_turno` DISABLE KEYS */;
INSERT INTO `estado_turno` VALUES (1,'Asignado'),(5,'Atendido'),(6,'Ausente'),(3,'Cancelado'),(2,'Confirmado'),(4,'Reprogramado');
/*!40000 ALTER TABLE `estado_turno` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evolucion`
--

DROP TABLE IF EXISTS `evolucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evolucion` (
  `id_evolucion` int NOT NULL AUTO_INCREMENT,
  `id_hc` int NOT NULL,
  `id_medico` int NOT NULL,
  `id_turno` int DEFAULT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `diagnostico` text COLLATE utf8mb4_unicode_ci,
  `tratamiento` text COLLATE utf8mb4_unicode_ci,
  `indicaciones` text COLLATE utf8mb4_unicode_ci,
  `ruta_archivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_evolucion`),
  KEY `fk_evolucion_historia` (`id_hc`),
  KEY `fk_evolucion_medico` (`id_medico`),
  KEY `fk_evolucion_turno` (`id_turno`),
  CONSTRAINT `fk_evolucion_historia` FOREIGN KEY (`id_hc`) REFERENCES `historia_clinica` (`id_hc`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_evolucion_medico` FOREIGN KEY (`id_medico`) REFERENCES `medico` (`id_medico`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_evolucion_turno` FOREIGN KEY (`id_turno`) REFERENCES `turno` (`id_turno`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evolucion`
--

LOCK TABLES `evolucion` WRITE;
/*!40000 ALTER TABLE `evolucion` DISABLE KEYS */;
INSERT INTO `evolucion` VALUES (1,18,1,1,'2026-10-20 08:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(2,35,1,2,'2026-10-20 09:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(3,52,1,3,'2026-10-20 11:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(4,3,3,6,'2026-10-20 09:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(5,37,2,8,'2026-10-21 13:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(6,54,4,9,'2026-10-21 08:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(7,5,1,12,'2026-10-22 09:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(8,22,1,13,'2026-10-22 11:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(9,56,4,15,'2026-10-22 10:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(10,7,3,18,'2026-10-23 10:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(11,24,3,19,'2026-10-23 11:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(12,41,3,20,'2026-10-23 12:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(13,9,3,24,'2026-10-27 08:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(14,26,3,25,'2026-10-27 09:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(15,43,3,26,'2026-10-27 10:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(16,60,3,27,'2026-10-27 13:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(17,11,4,30,'2026-10-28 09:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(18,28,1,31,'2026-10-29 09:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(19,45,4,32,'2026-10-29 09:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(20,13,3,36,'2026-10-30 08:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(21,30,3,37,'2026-10-30 09:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(22,47,3,38,'2026-10-30 10:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(23,32,2,43,'2026-11-04 13:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(24,49,4,44,'2026-11-04 09:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(25,17,1,48,'2026-11-05 11:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(26,51,4,50,'2026-11-05 09:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(27,2,3,53,'2026-11-06 08:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(28,19,3,54,'2026-11-06 11:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(29,36,3,55,'2026-11-06 12:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(30,4,1,59,'2026-11-10 08:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(31,21,1,60,'2026-11-10 10:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(32,38,1,61,'2026-11-10 11:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(33,55,3,62,'2026-11-10 10:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(34,6,3,65,'2026-11-10 13:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(35,23,2,66,'2026-11-11 10:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(36,40,2,67,'2026-11-11 11:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(37,57,2,68,'2026-11-11 12:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(38,8,4,71,'2026-11-11 10:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(39,25,4,72,'2026-11-11 11:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(40,42,4,73,'2026-11-11 12:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(41,59,4,74,'2026-11-11 13:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(42,27,4,78,'2026-11-12 12:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(43,44,4,79,'2026-11-12 13:00:00','Consulta de control simulada. Evaluación clínica sin signos de alarma.','Dolor musculoesquelético en seguimiento','Manejo conservador y reevaluación','Continuar controles según evolución',NULL),(44,48,1,NULL,'2026-11-13 15:13:54','evolución de prueba','prueba','aprobar','ninguna',NULL),(45,48,4,NULL,'2026-11-13 15:45:05','prueba 2','prueba','ninguno','ninguno',NULL),(46,61,1,NULL,'2026-11-13 19:12:18','fff','ggg','gg','gfgf',NULL);
/*!40000 ALTER TABLE `evolucion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historia_clinica`
--

DROP TABLE IF EXISTS `historia_clinica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historia_clinica` (
  `id_hc` int NOT NULL AUTO_INCREMENT,
  `id_paciente` int NOT NULL,
  `antecedentes` text COLLATE utf8mb4_unicode_ci,
  `alergias` text COLLATE utf8mb4_unicode_ci,
  `observaciones_generales` text COLLATE utf8mb4_unicode_ci,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_hc`),
  UNIQUE KEY `uq_historia_paciente` (`id_paciente`),
  CONSTRAINT `fk_historia_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historia_clinica`
--

LOCK TABLES `historia_clinica` WRITE;
/*!40000 ALTER TABLE `historia_clinica` DISABLE KEYS */;
INSERT INTO `historia_clinica` VALUES (1,1,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(2,2,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(3,3,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(4,4,'Sin antecedentes relevantes informados','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(5,5,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(6,6,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(7,7,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(8,8,'Sin antecedentes relevantes informados','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(9,9,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(10,10,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(11,11,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(12,12,'Antecedente de dolor lumbar recurrente','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(13,13,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(14,14,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(15,15,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(16,16,'Sin antecedentes relevantes informados','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(17,17,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(18,18,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(19,19,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(20,20,'Sin antecedentes relevantes informados','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(21,21,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(22,22,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(23,23,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(24,24,'Antecedente de dolor lumbar recurrente','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(25,25,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(26,26,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(27,27,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(28,28,'Sin antecedentes relevantes informados','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(29,29,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(30,30,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(31,31,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(32,32,'Sin antecedentes relevantes informados','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(33,33,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(34,34,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(35,35,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(36,36,'Antecedente de dolor lumbar recurrente','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(37,37,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(38,38,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(39,39,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(40,40,'Sin antecedentes relevantes informados','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(41,41,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(42,42,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(43,43,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(44,44,'Sin antecedentes relevantes informados','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(45,45,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(46,46,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(47,47,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(48,48,'Antecedente de dolor lumbar recurrente','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(49,49,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(50,50,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(51,51,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(52,52,'Sin antecedentes relevantes informados','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(53,53,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(54,54,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(55,55,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(56,56,'Sin antecedentes relevantes informados','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(57,57,'Antecedente de dolor lumbar recurrente','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(58,58,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(59,59,'Sin antecedentes relevantes informados','Sin alergias conocidas','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(60,60,'Antecedente de dolor lumbar recurrente','Alergia medicamentosa referida (dato ficticio)','Historia clínica simulada para demostración','2026-11-13 14:33:20'),(61,76,'sss','ddd','fff','2026-11-13 19:11:54');
/*!40000 ALTER TABLE `historia_clinica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insumo`
--

DROP TABLE IF EXISTS `insumo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insumo` (
  `id_insumo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock_minimo` int NOT NULL DEFAULT '0',
  `stock_actual` int NOT NULL DEFAULT '0',
  `proveedor` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_insumo`),
  UNIQUE KEY `uq_insumo_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insumo`
--

LOCK TABLES `insumo` WRITE;
/*!40000 ALTER TABLE `insumo` DISABLE KEYS */;
/*!40000 ALTER TABLE `insumo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lote_insumo`
--

DROP TABLE IF EXISTS `lote_insumo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lote_insumo` (
  `id_lote` int NOT NULL AUTO_INCREMENT,
  `id_insumo` int NOT NULL,
  `nro_lote` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `cantidad_disponible` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_lote`),
  UNIQUE KEY `uq_lote_insumo` (`id_insumo`,`nro_lote`),
  CONSTRAINT `fk_lote_insumo` FOREIGN KEY (`id_insumo`) REFERENCES `insumo` (`id_insumo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lote_insumo`
--

LOCK TABLES `lote_insumo` WRITE;
/*!40000 ALTER TABLE `lote_insumo` DISABLE KEYS */;
/*!40000 ALTER TABLE `lote_insumo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medico`
--

DROP TABLE IF EXISTS `medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medico` (
  `id_medico` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `especialidad` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matricula` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_medico`),
  UNIQUE KEY `uq_medico_matricula` (`matricula`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medico`
--

LOCK TABLES `medico` WRITE;
/*!40000 ALTER TABLE `medico` DISABLE KEYS */;
INSERT INTO `medico` VALUES (1,'Santiago','Menéndez','Traumatología de columna','MN-104582','1100000101','santiago.menendez@example.com',1),(2,'Lucía','Fernández','Traumatología de rodilla','MN-112734','1100000102','lucia.fernandez@example.com',1),(3,'Martín','Salvatierra','Traumatología de hombro','MN-120361','1100000103','martin.salvatierra@example.com',1),(4,'Valentina','Ríos','Traumatología general','MN-131920','1100000104','valentina.rios@example.com',1);
/*!40000 ALTER TABLE `medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_stock`
--

DROP TABLE IF EXISTS `movimiento_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_stock` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `id_insumo` int NOT NULL,
  `id_lote` int DEFAULT NULL,
  `tipo` enum('Entrada','Salida','Ajuste') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `observacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `fk_movimiento_insumo` (`id_insumo`),
  KEY `fk_movimiento_lote` (`id_lote`),
  CONSTRAINT `fk_movimiento_insumo` FOREIGN KEY (`id_insumo`) REFERENCES `insumo` (`id_insumo`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_movimiento_lote` FOREIGN KEY (`id_lote`) REFERENCES `lote_insumo` (`id_lote`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_stock`
--

LOCK TABLES `movimiento_stock` WRITE;
/*!40000 ALTER TABLE `movimiento_stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimiento_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paciente`
--

DROP TABLE IF EXISTS `paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paciente` (
  `id_paciente` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dni` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_documento` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DNI argentino',
  `fecha_nacimiento` date DEFAULT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_cobertura` int DEFAULT NULL,
  `plan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_credencial` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bloqueado` tinyint(1) NOT NULL DEFAULT '0',
  `motivo_bloqueo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_alta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_paciente`),
  UNIQUE KEY `uq_paciente_dni` (`dni`),
  KEY `fk_paciente_cobertura` (`id_cobertura`),
  CONSTRAINT `fk_paciente_cobertura` FOREIGN KEY (`id_cobertura`) REFERENCES `cobertura_medica` (`id_cobertura`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paciente`
--

LOCK TABLES `paciente` WRITE;
/*!40000 ALTER TABLE `paciente` DISABLE KEYS */;
INSERT INTO `paciente` VALUES (1,'Nicolás','Díaz','80000001','DNI argentino','1952-08-12','1100000001','paciente001@example.com',2,'Plan estándar','DEMO000001',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(2,'Florencia','Vega','80000002','DNI argentino','1953-03-23','1100000002','paciente002@example.com',3,'Plan estándar','DEMO000002',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(3,'Agustín','Sánchez','80000003','DNI argentino','1954-10-07','1100000003','paciente003@example.com',4,NULL,'DEMO000003',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(4,'Julieta','Herrera','80000004','DNI argentino','1955-05-18','1100000004','paciente004@example.com',5,NULL,NULL,0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(5,'Bruno','Martínez','80000005','DNI argentino','1956-12-02','1100000005','paciente005@example.com',6,'Plan estándar','DEMO000005',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(6,'Valeria','Acosta','80000006','DNI argentino','1957-07-13','1100000006','paciente006@example.com',7,'Plan estándar','DEMO000006',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(7,'Ignacio','Fernández','80000007','DNI argentino','1958-02-24','1100000007','paciente007@example.com',1,'Plan 210','DEMO000007',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(8,'Paula','Álvarez','80000008','DNI argentino','1959-09-08','1100000008','paciente008@example.com',2,'Plan estándar','DEMO000008',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(9,'Tomás','Rodríguez','80000009','DNI argentino','1960-04-19','1100000009','paciente009@example.com',3,'Plan estándar','DEMO000009',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(10,'Luciana','Torres','80000010','DNI argentino','1961-11-03','1100000010','paciente010@example.com',4,NULL,'DEMO000010',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(11,'Facundo','Morales','80000011','DNI argentino','1962-06-14','1100000011','paciente011@example.com',5,NULL,NULL,0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(12,'Mariana','Romero','80000012','DNI argentino','1963-01-25','1100000012','paciente012@example.com',6,'Plan estándar','DEMO000012',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(13,'Matías','Castro','80000013','DNI argentino','1964-08-09','1100000013','paciente013@example.com',7,'Plan estándar','DEMO000013',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(14,'Milagros','García','80000014','DNI argentino','1965-03-20','1100000014','paciente014@example.com',1,'Plan 210','DEMO000014',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(15,'Federico','Medina','80000015','DNI argentino','1966-10-04','1100000015','paciente015@example.com',2,'Plan estándar','DEMO000015',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(16,'Carolina','López','80000016','DNI argentino','1967-05-15','1100000016','paciente016@example.com',3,'Plan estándar','DEMO000016',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(17,'Sebastián','Suárez','80000017','DNI argentino','1968-12-26','1100000017','paciente017@example.com',4,NULL,'DEMO000017',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(18,'Sofía','Pérez','80000018','DNI argentino','1969-07-10','1100000018','paciente018@example.com',5,NULL,NULL,1,'Bloqueo administrativo de demostración',1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(19,'Emiliano','Ruiz','80000019','DNI argentino','1970-02-21','1100000019','paciente019@example.com',6,'Plan estándar','DEMO000019',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(20,'Camila','Rodríguez','80000020','DNI argentino','1971-09-05','1100000020','paciente020@example.com',7,'Plan estándar','DEMO000020',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(21,'Nicolás','Torres','80000021','DNI argentino','1972-04-16','1100000021','paciente021@example.com',1,'Plan 210','DEMO000021',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(22,'Florencia','Morales','80000022','DNI argentino','1973-11-27','1100000022','paciente022@example.com',2,'Plan estándar','DEMO000022',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(23,'Agustín','Romero','80000023','DNI argentino','1974-06-11','1100000023','paciente023@example.com',3,'Plan estándar','DEMO000023',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(24,'Julieta','Castro','80000024','DNI argentino','1975-01-22','1100000024','paciente024@example.com',4,NULL,'DEMO000024',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(25,'Bruno','García','80000025','DNI argentino','1976-08-06','1100000025','paciente025@example.com',5,NULL,NULL,0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(26,'Valeria','Medina','80000026','DNI argentino','1977-03-17','1100000026','paciente026@example.com',6,'Plan estándar','DEMO000026',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(27,'Ignacio','López','80000027','DNI argentino','1978-10-01','1100000027','paciente027@example.com',7,'Plan estándar','DEMO000027',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(28,'Paula','Suárez','80000028','DNI argentino','1979-05-12','1100000028','paciente028@example.com',1,'Plan 210','DEMO000028',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(29,'Tomás','Pérez','80000029','DNI argentino','1980-12-23','1100000029','paciente029@example.com',2,'Plan estándar','DEMO000029',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(30,'Luciana','Ruiz','80000030','DNI argentino','1981-07-07','1100000030','paciente030@example.com',3,'Plan estándar','DEMO000030',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(31,'Facundo','González','80000031','DNI argentino','1982-02-18','1100000031','paciente031@example.com',4,NULL,'DEMO000031',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(32,'Mariana','Díaz','80000032','DNI argentino','1983-09-02','1100000032','paciente032@example.com',5,NULL,NULL,0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(33,'Matías','Vega','80000033','DNI argentino','1984-04-13','1100000033','paciente033@example.com',6,'Plan estándar','DEMO000033',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(34,'Milagros','Sánchez','80000034','DNI argentino','1985-11-24','1100000034','paciente034@example.com',7,'Plan estándar','DEMO000034',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(35,'Federico','Herrera','80000035','DNI argentino','1986-06-08','1100000035','paciente035@example.com',1,'Plan 210','DEMO000035',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(36,'Carolina','Martínez','80000036','DNI argentino','1987-01-19','1100000036','paciente036@example.com',2,'Plan estándar','DEMO000036',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(37,'Sebastián','Acosta','80000037','DNI argentino','1988-08-03','1100000037','paciente037@example.com',3,'Plan estándar','DEMO000037',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(38,'Sofía','Fernández','80000038','DNI argentino','1989-03-14','1100000038','paciente038@example.com',4,NULL,'DEMO000038',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(39,'Emiliano','Álvarez','80000039','DNI argentino','1990-10-25','1100000039','paciente039@example.com',5,NULL,NULL,0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(40,'Camila','Pérez','80000040','DNI argentino','1991-05-09','1100000040','paciente040@example.com',6,'Plan estándar','DEMO000040',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(41,'Nicolás','Ruiz','80000041','DNI argentino','1992-12-20','1100000041','paciente041@example.com',7,'Plan estándar','DEMO000041',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(42,'Florencia','González','80000042','DNI argentino','1993-07-04','1100000042','paciente042@example.com',1,'Plan 210','DEMO000042',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(43,'Agustín','Díaz','80000043','DNI argentino','1994-02-15','1100000043','paciente043@example.com',2,'Plan estándar','DEMO000043',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(44,'Julieta','Vega','80000044','DNI argentino','1995-09-26','1100000044','paciente044@example.com',3,'Plan estándar','DEMO000044',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(45,'Bruno','Sánchez','80000045','DNI argentino','1996-04-10','1100000045','paciente045@example.com',4,NULL,'DEMO000045',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(46,'Valeria','Herrera','80000046','DNI argentino','1997-11-21','1100000046','paciente046@example.com',5,NULL,NULL,0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(47,'Ignacio','Martínez','80000047','DNI argentino','1998-06-05','1100000047','paciente047@example.com',6,'Plan estándar','DEMO000047',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(48,'Paula','Acosta','80000048','DNI argentino','1951-01-16','1100000048','paciente048@example.com',7,'Plan estándar','DEMO000048',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(49,'Tomás','Fernández','80000049','DNI argentino','1952-08-27','1100000049','paciente049@example.com',1,'Plan 210','DEMO000049',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(50,'Luciana','Álvarez','80000050','DNI argentino','1953-03-11','1100000050','paciente050@example.com',2,'Plan estándar','DEMO000050',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(51,'Facundo','Rodríguez','80000051','DNI argentino','1954-10-22','1100000051','paciente051@example.com',3,'Plan estándar','DEMO000051',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(52,'Mariana','Torres','80000052','DNI argentino','1955-05-06','1100000052','paciente052@example.com',4,NULL,'DEMO000052',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(53,'Matías','Morales','80000053','DNI argentino','1956-12-17','1100000053','paciente053@example.com',5,NULL,NULL,0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(54,'Milagros','Romero','80000054','DNI argentino','1957-07-01','1100000054','paciente054@example.com',6,'Plan estándar','DEMO000054',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(55,'Federico','Castro','80000055','DNI argentino','1958-02-12','1100000055','paciente055@example.com',7,'Plan estándar','DEMO000055',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(56,'Carolina','García','80000056','DNI argentino','1959-09-23','1100000056','paciente056@example.com',1,'Plan 210','DEMO000056',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(57,'Sebastián','Medina','80000057','DNI argentino','1960-04-07','1100000057','paciente057@example.com',2,'Plan estándar','DEMO000057',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(58,'Sofía','López','80000058','DNI argentino','1961-11-18','1100000058','paciente058@example.com',3,'Plan estándar','DEMO000058',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(59,'Emiliano','Suárez','80000059','DNI argentino','1962-06-02','1100000059','paciente059@example.com',4,NULL,'DEMO000059',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(60,'Camila','Fernández','80000060','DNI argentino','1963-01-13','1100000060','paciente060@example.com',5,NULL,NULL,0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(61,'Nicolás','Álvarez','80000061','DNI argentino','1964-08-24','1100000061','paciente061@example.com',6,'Plan estándar','DEMO000061',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(62,'Florencia','Rodríguez','80000062','DNI argentino','1965-03-08','1100000062','paciente062@example.com',7,'Plan estándar','DEMO000062',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(63,'Agustín','Torres','80000063','DNI argentino','1966-10-19','1100000063','paciente063@example.com',1,'Plan 210','DEMO000063',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(64,'Julieta','Morales','80000064','DNI argentino','1967-05-03','1100000064','paciente064@example.com',2,'Plan estándar','DEMO000064',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(65,'Bruno','Romero','80000065','DNI argentino','1968-12-14','1100000065','paciente065@example.com',3,'Plan estándar','DEMO000065',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(66,'Valeria','Castro','80000066','DNI argentino','1969-07-25','1100000066','paciente066@example.com',4,NULL,'DEMO000066',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(67,'Ignacio','García','80000067','DNI argentino','1970-02-09','1100000067','paciente067@example.com',5,NULL,NULL,0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(68,'Paula','Medina','80000068','DNI argentino','1971-09-20','1100000068','paciente068@example.com',6,'Plan estándar','DEMO000068',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(69,'Tomás','López','80000069','DNI argentino','1972-04-04','1100000069','paciente069@example.com',7,'Plan estándar','DEMO000069',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(70,'Luciana','Suárez','80000070','DNI argentino','1973-11-15','1100000070','paciente070@example.com',1,'Plan 210','DEMO000070',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(71,'Facundo','Pérez','80000071','DNI argentino','1974-06-26','1100000071','paciente071@example.com',2,'Plan estándar','DEMO000071',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(72,'Mariana','Ruiz','80000072','DNI argentino','1975-01-10','1100000072','paciente072@example.com',3,'Plan estándar','DEMO000072',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(73,'Matías','González','80000073','DNI argentino','1976-08-21','1100000073','paciente073@example.com',4,NULL,'DEMO000073',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(74,'Milagros','Díaz','80000074','DNI argentino','1977-03-05','1100000074','paciente074@example.com',5,NULL,NULL,0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(75,'Federico','Vega','80000075','DNI argentino','1978-10-16','1100000075','paciente075@example.com',6,'Plan estándar','DEMO000075',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(76,'Carolina','Sánchez','80000076','DNI argentino','1979-05-27','1100000076','paciente076@example.com',7,'Plan estándar','DEMO000076',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(77,'Sebastián','Herrera','80000077','DNI argentino','1980-12-11','1100000077','paciente077@example.com',1,'Plan 210','DEMO000077',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(78,'Sofía','Martínez','80000078','DNI argentino','1981-07-22','1100000078','paciente078@example.com',2,'Plan estándar','DEMO000078',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(79,'Emiliano','Acosta','80000079','DNI argentino','1982-02-06','1100000079','paciente079@example.com',3,'Plan estándar','DEMO000079',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(80,'Camila','López','80000080','DNI argentino','1983-09-17','1100000080','paciente080@example.com',4,NULL,'DEMO000080',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(81,'Nicolás','Suárez','80000081','DNI argentino','1984-04-01','1100000081','paciente081@example.com',5,NULL,NULL,0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(82,'Florencia','Pérez','80000082','DNI argentino','1985-11-12','1100000082','paciente082@example.com',6,'Plan estándar','DEMO000082',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(83,'Agustín','Ruiz','80000083','DNI argentino','1986-06-23','1100000083','paciente083@example.com',7,'Plan estándar','DEMO000083',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(84,'Julieta','González','80000084','DNI argentino','1987-01-07','1100000084','paciente084@example.com',1,'Plan 210','DEMO000084',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(85,'Bruno','Díaz','80000085','DNI argentino','1988-08-18','1100000085','paciente085@example.com',2,'Plan estándar','DEMO000085',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(86,'Valeria','Vega','80000086','DNI argentino','1989-03-02','1100000086','paciente086@example.com',3,'Plan estándar','DEMO000086',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(87,'Ignacio','Sánchez','80000087','DNI argentino','1990-10-13','1100000087','paciente087@example.com',4,NULL,'DEMO000087',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(88,'Paula','Herrera','80000088','DNI argentino','1991-05-24','1100000088','paciente088@example.com',5,NULL,NULL,0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(89,'Tomás','Martínez','80000089','DNI argentino','1992-12-08','1100000089','paciente089@example.com',6,'Plan estándar','DEMO000089',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(90,'Luciana','Acosta','80000090','DNI argentino','1993-07-19','1100000090','paciente090@example.com',7,'Plan estándar','DEMO000090',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(91,'Facundo','Fernández','80000091','DNI argentino','1994-02-03','1100000091','paciente091@example.com',1,'Plan 210','DEMO000091',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(92,'Mariana','Álvarez','80000092','DNI argentino','1995-09-14','1100000092','paciente092@example.com',2,'Plan estándar','DEMO000092',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(93,'Matías','Rodríguez','80000093','DNI argentino','1996-04-25','1100000093','paciente093@example.com',3,'Plan estándar','DEMO000093',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(94,'Milagros','Torres','80000094','DNI argentino','1997-11-09','1100000094','paciente094@example.com',4,NULL,'DEMO000094',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(95,'Federico','Morales','80000095','DNI argentino','1998-06-20','1100000095','paciente095@example.com',5,NULL,NULL,0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(96,'Carolina','Romero','80000096','DNI argentino','1951-01-04','1100000096','paciente096@example.com',6,'Plan estándar','DEMO000096',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(97,'Sebastián','Castro','80000097','DNI argentino','1952-08-15','1100000097','paciente097@example.com',7,'Plan estándar','DEMO000097',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(98,'Sofía','García','80000098','DNI argentino','1953-03-26','1100000098','paciente098@example.com',1,'Plan 210','DEMO000098',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(99,'Emiliano','Medina','80000099','DNI argentino','1954-10-10','1100000099','paciente099@example.com',2,'Plan estándar','DEMO000099',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20'),(100,'Camila','Martínez','80000100','DNI argentino','1955-05-21','1100000100','paciente100@example.com',3,'Plan estándar','DEMO000100',0,NULL,1,'2026-11-13 14:33:20','2026-11-13 14:33:20');
/*!40000 ALTER TABLE `paciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recuperacion_cuenta`
--

DROP TABLE IF EXISTS `recuperacion_cuenta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recuperacion_cuenta` (
  `id_recuperacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `token_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_recuperacion` enum('PASSWORD','EMAIL','VERIFICAR_RESPALDO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` datetime NOT NULL,
  `fecha_uso` datetime DEFAULT NULL,
  `email_pendiente` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_recuperacion`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `fk_recuperacion_usuario` (`id_usuario`),
  CONSTRAINT `fk_recuperacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recuperacion_cuenta`
--

LOCK TABLES `recuperacion_cuenta` WRITE;
/*!40000 ALTER TABLE `recuperacion_cuenta` DISABLE KEYS */;
/*!40000 ALTER TABLE `recuperacion_cuenta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `descripcion` enum('Médico','Paciente','Secretaria','Administrador') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uq_rol_descripcion` (`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Médico'),(2,'Paciente'),(3,'Secretaria'),(4,'Administrador');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turno`
--

DROP TABLE IF EXISTS `turno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turno` (
  `id_turno` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `motivo_consulta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_turno` enum('Programado','Demanda espontánea') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Programado',
  `id_paciente` int NOT NULL,
  `id_medico` int NOT NULL,
  `id_estado` int NOT NULL,
  `hora_llegada` datetime DEFAULT NULL,
  `estado_recepcion` enum('Pendiente','En espera','En consulta','Finalizado','Ausente') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  `observaciones` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `hora_inicio_consulta` datetime DEFAULT NULL,
  PRIMARY KEY (`id_turno`),
  UNIQUE KEY `uq_turno_medico_fecha_hora` (`id_medico`,`fecha`,`hora`),
  KEY `fk_turno_paciente` (`id_paciente`),
  KEY `fk_turno_estado` (`id_estado`),
  CONSTRAINT `fk_turno_estado` FOREIGN KEY (`id_estado`) REFERENCES `estado_turno` (`id_estado`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_turno_medico` FOREIGN KEY (`id_medico`) REFERENCES `medico` (`id_medico`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_turno_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=165 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turno`
--

LOCK TABLES `turno` WRITE;
/*!40000 ALTER TABLE `turno` DISABLE KEYS */;
INSERT INTO `turno` VALUES (1,'2026-10-20','08:00:00','Control de columna lumbar','Programado',18,1,5,'2026-10-20 08:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-20 08:10:00'),(2,'2026-10-20','09:00:00','Dolor cervical','Programado',35,1,5,'2026-10-20 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-20 09:10:00'),(3,'2026-10-20','11:00:00','Evaluación de rodilla','Programado',52,1,5,'2026-10-20 11:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-20 11:10:00'),(4,'2026-10-20','12:00:00','Dolor de hombro','Programado',69,1,5,'2026-10-20 12:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-20 12:10:00'),(5,'2026-10-20','13:00:00','Control postoperatorio','Programado',86,1,5,'2026-10-20 13:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-20 13:10:00'),(6,'2026-10-20','09:00:00','Consulta traumatológica','Programado',3,3,5,'2026-10-20 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-20 09:10:00'),(7,'2026-10-21','09:00:00','Seguimiento por lumbalgia','Programado',20,2,6,'2026-10-21 09:00:00','Ausente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(8,'2026-10-21','13:00:00','Dolor lumbar persistente','Programado',37,2,5,'2026-10-21 13:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-21 13:10:00'),(9,'2026-10-21','08:00:00','Control de columna lumbar','Programado',54,4,5,'2026-10-21 08:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-21 08:10:00'),(10,'2026-10-21','10:00:00','Dolor cervical','Programado',71,4,5,'2026-10-21 10:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-21 10:10:00'),(11,'2026-10-21','13:00:00','Evaluación de rodilla','Programado',88,4,5,'2026-10-21 13:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-21 13:10:00'),(12,'2026-10-22','09:00:00','Dolor de hombro','Programado',5,1,5,'2026-10-22 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-22 09:10:00'),(13,'2026-10-22','11:00:00','Control postoperatorio','Programado',22,1,5,'2026-10-22 11:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-22 11:10:00'),(14,'2026-10-22','12:00:00','Consulta traumatológica','Programado',39,1,6,'2026-10-22 12:00:00','Ausente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(15,'2026-10-22','10:00:00','Seguimiento por lumbalgia','Programado',56,4,5,'2026-10-22 10:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-22 10:10:00'),(16,'2026-10-22','13:00:00','Dolor lumbar persistente','Programado',73,4,5,'2026-10-22 13:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-22 13:10:00'),(17,'2026-10-23','09:00:00','Control de columna lumbar','Programado',90,3,5,'2026-10-23 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-23 09:10:00'),(18,'2026-10-23','10:00:00','Dolor cervical','Programado',7,3,5,'2026-10-23 10:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-23 10:10:00'),(19,'2026-10-23','11:00:00','Evaluación de rodilla','Programado',24,3,5,'2026-10-23 11:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-23 11:10:00'),(20,'2026-10-23','12:00:00','Dolor de hombro','Programado',41,3,5,'2026-10-23 12:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-23 12:10:00'),(21,'2026-10-23','13:00:00','Control postoperatorio','Programado',58,3,6,'2026-10-23 13:00:00','Ausente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(22,'2026-10-26','09:00:00','Consulta traumatológica','Programado',75,2,5,'2026-10-26 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-26 09:10:00'),(23,'2026-10-26','12:00:00','Seguimiento por lumbalgia','Programado',92,2,5,'2026-10-26 12:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-26 12:10:00'),(24,'2026-10-27','08:00:00','Dolor lumbar persistente','Programado',9,3,5,'2026-10-27 08:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-27 08:10:00'),(25,'2026-10-27','09:00:00','Control de columna lumbar','Programado',26,3,5,'2026-10-27 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-27 09:10:00'),(26,'2026-10-27','10:00:00','Dolor cervical','Programado',43,3,5,'2026-10-27 10:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-27 10:10:00'),(27,'2026-10-27','13:00:00','Evaluación de rodilla','Programado',60,3,5,'2026-10-27 13:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-27 13:10:00'),(28,'2026-10-28','11:00:00','Dolor de hombro','Programado',77,2,6,'2026-10-28 11:00:00','Ausente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(29,'2026-10-28','12:00:00','Control postoperatorio','Programado',94,2,5,'2026-10-28 12:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-28 12:10:00'),(30,'2026-10-28','09:00:00','Consulta traumatológica','Programado',11,4,5,'2026-10-28 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-28 09:10:00'),(31,'2026-10-29','09:00:00','Seguimiento por lumbalgia','Programado',28,1,5,'2026-10-29 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-29 09:10:00'),(32,'2026-10-29','09:00:00','Dolor lumbar persistente','Programado',45,4,5,'2026-10-29 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-29 09:10:00'),(33,'2026-10-29','10:00:00','Control de columna lumbar','Programado',62,4,5,'2026-10-29 10:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-29 10:10:00'),(34,'2026-10-29','11:00:00','Dolor cervical','Programado',79,4,5,'2026-10-29 11:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-29 11:10:00'),(35,'2026-10-29','12:00:00','Evaluación de rodilla','Programado',96,4,6,'2026-10-29 12:00:00','Ausente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(36,'2026-10-30','08:00:00','Dolor de hombro','Programado',13,3,5,'2026-10-30 08:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-30 08:10:00'),(37,'2026-10-30','09:00:00','Control postoperatorio','Programado',30,3,5,'2026-10-30 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-30 09:10:00'),(38,'2026-10-30','10:00:00','Consulta traumatológica','Programado',47,3,5,'2026-10-30 10:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-30 10:10:00'),(39,'2026-10-30','11:00:00','Seguimiento por lumbalgia','Programado',64,3,5,'2026-10-30 11:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-10-30 11:10:00'),(40,'2026-11-02','09:00:00','Dolor lumbar persistente','Programado',81,2,5,'2026-11-02 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-02 09:10:00'),(41,'2026-11-02','12:00:00','Control de columna lumbar','Programado',98,2,5,'2026-11-02 12:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-02 12:10:00'),(42,'2026-11-04','10:00:00','Dolor cervical','Programado',15,2,6,'2026-11-04 10:00:00','Ausente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(43,'2026-11-04','13:00:00','Evaluación de rodilla','Programado',32,2,5,'2026-11-04 13:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-04 13:10:00'),(44,'2026-11-04','09:00:00','Dolor de hombro','Programado',49,4,5,'2026-11-04 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-04 09:10:00'),(45,'2026-11-04','11:00:00','Control postoperatorio','Programado',66,4,5,'2026-11-04 11:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-04 11:10:00'),(46,'2026-11-05','09:00:00','Consulta traumatológica','Programado',83,1,5,'2026-11-05 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-05 09:10:00'),(47,'2026-11-05','10:00:00','Seguimiento por lumbalgia','Programado',100,1,5,'2026-11-05 10:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-05 10:10:00'),(48,'2026-11-05','11:00:00','Dolor lumbar persistente','Programado',17,1,5,'2026-11-05 11:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-05 11:10:00'),(49,'2026-11-05','12:00:00','Control de columna lumbar','Programado',34,1,6,'2026-11-05 12:00:00','Ausente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(50,'2026-11-05','09:00:00','Dolor cervical','Programado',51,4,5,'2026-11-05 09:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-05 09:10:00'),(51,'2026-11-05','11:00:00','Evaluación de rodilla','Programado',68,4,5,'2026-11-05 11:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-05 11:10:00'),(52,'2026-11-05','12:00:00','Dolor de hombro','Programado',85,4,5,'2026-11-05 12:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-05 12:10:00'),(53,'2026-11-06','08:00:00','Control postoperatorio','Programado',2,3,5,'2026-11-06 08:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-06 08:10:00'),(54,'2026-11-06','11:00:00','Consulta traumatológica','Programado',19,3,5,'2026-11-06 11:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-06 11:10:00'),(55,'2026-11-06','12:00:00','Seguimiento por lumbalgia','Programado',36,3,5,'2026-11-06 12:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-06 12:10:00'),(56,'2026-11-09','09:00:00','Dolor lumbar persistente','Programado',53,2,6,'2026-11-09 09:00:00','Ausente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(57,'2026-11-09','10:00:00','Control de columna lumbar','Programado',70,2,5,'2026-11-09 10:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-09 10:10:00'),(58,'2026-11-09','13:00:00','Dolor cervical','Programado',87,2,5,'2026-11-09 13:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-09 13:10:00'),(59,'2026-11-10','08:00:00','Evaluación de rodilla','Programado',4,1,5,'2026-11-10 08:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-10 08:10:00'),(60,'2026-11-10','10:00:00','Dolor de hombro','Programado',21,1,5,'2026-11-10 10:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-10 10:10:00'),(61,'2026-11-10','11:00:00','Control postoperatorio','Programado',38,1,5,'2026-11-10 11:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-10 11:10:00'),(62,'2026-11-10','10:00:00','Consulta traumatológica','Programado',55,3,5,'2026-11-10 10:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-10 10:10:00'),(63,'2026-11-10','11:00:00','Seguimiento por lumbalgia','Programado',72,3,6,'2026-11-10 11:00:00','Ausente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(64,'2026-11-10','12:00:00','Dolor lumbar persistente','Programado',89,3,5,'2026-11-10 12:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-10 12:10:00'),(65,'2026-11-10','13:00:00','Control de columna lumbar','Programado',6,3,5,'2026-11-10 13:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-10 13:10:00'),(66,'2026-11-11','10:00:00','Dolor cervical','Programado',23,2,5,'2026-11-11 10:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-11 10:10:00'),(67,'2026-11-11','11:00:00','Evaluación de rodilla','Programado',40,2,5,'2026-11-11 11:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-11 11:10:00'),(68,'2026-11-11','12:00:00','Dolor de hombro','Programado',57,2,5,'2026-11-11 12:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-11 12:10:00'),(69,'2026-11-11','08:00:00','Control postoperatorio','Programado',74,4,5,'2026-11-11 08:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-11 08:10:00'),(70,'2026-11-11','09:00:00','Consulta traumatológica','Programado',91,4,6,'2026-11-11 09:00:00','Ausente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(71,'2026-11-11','10:00:00','Seguimiento por lumbalgia','Programado',8,4,5,'2026-11-11 10:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-11 10:10:00'),(72,'2026-11-11','11:00:00','Dolor lumbar persistente','Programado',25,4,5,'2026-11-11 11:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-11 11:10:00'),(73,'2026-11-11','12:00:00','Control de columna lumbar','Programado',42,4,5,'2026-11-11 12:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-11 12:10:00'),(74,'2026-11-11','13:00:00','Dolor cervical','Programado',59,4,5,'2026-11-11 13:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-11 13:10:00'),(75,'2026-11-12','08:00:00','Evaluación de rodilla','Programado',76,1,5,'2026-11-12 08:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-12 08:10:00'),(76,'2026-11-12','13:00:00','Dolor de hombro','Programado',93,1,5,'2026-11-12 13:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-12 13:10:00'),(77,'2026-11-12','09:00:00','Control postoperatorio','Programado',10,4,6,'2026-11-12 09:00:00','Ausente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(78,'2026-11-12','12:00:00','Consulta traumatológica','Programado',27,4,5,'2026-11-12 12:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-12 12:10:00'),(79,'2026-11-12','13:00:00','Seguimiento por lumbalgia','Programado',44,4,5,'2026-11-12 13:00:00','Finalizado',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20','2026-11-12 13:10:00'),(80,'2026-11-17','12:00:00','Dolor lumbar persistente','Programado',61,1,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(81,'2026-11-17','10:00:00','Control de columna lumbar','Programado',78,3,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(82,'2026-11-17','11:00:00','Dolor cervical','Programado',95,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(83,'2026-11-18','08:00:00','Evaluación de rodilla','Programado',12,2,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(84,'2026-11-18','09:00:00','Dolor de hombro','Programado',29,2,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(85,'2026-11-18','10:00:00','Control postoperatorio','Programado',46,2,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(86,'2026-11-18','08:00:00','Consulta traumatológica','Programado',63,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(87,'2026-11-18','10:00:00','Seguimiento por lumbalgia','Programado',80,4,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(88,'2026-11-19','08:00:00','Dolor lumbar persistente','Programado',97,1,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(89,'2026-11-19','08:00:00','Control de columna lumbar','Programado',14,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(90,'2026-11-19','09:00:00','Dolor cervical','Programado',31,4,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(91,'2026-11-19','10:00:00','Evaluación de rodilla','Programado',48,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(92,'2026-11-19','11:00:00','Dolor de hombro','Programado',65,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(93,'2026-11-19','13:00:00','Control postoperatorio','Programado',82,4,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(94,'2026-11-20','08:00:00','Consulta traumatológica','Programado',99,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(95,'2026-11-20','10:00:00','Seguimiento por lumbalgia','Programado',16,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(96,'2026-11-23','08:00:00','Dolor lumbar persistente','Programado',33,2,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(97,'2026-11-23','12:00:00','Control de columna lumbar','Programado',50,2,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(98,'2026-11-24','09:00:00','Dolor cervical','Programado',67,1,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(99,'2026-11-24','11:00:00','Evaluación de rodilla','Programado',84,1,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(100,'2026-11-24','12:00:00','Dolor de hombro','Programado',1,1,3,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 19:18:54',NULL),(101,'2026-11-24','13:00:00','Control postoperatorio','Programado',18,1,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(102,'2026-11-24','08:00:00','Consulta traumatológica','Programado',35,3,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(103,'2026-11-24','09:00:00','Seguimiento por lumbalgia','Programado',52,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(104,'2026-11-24','11:00:00','Dolor lumbar persistente','Programado',69,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(105,'2026-11-24','12:00:00','Control de columna lumbar','Programado',86,3,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(106,'2026-11-25','08:00:00','Dolor cervical','Programado',3,2,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(107,'2026-11-25','09:00:00','Evaluación de rodilla','Programado',20,2,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(108,'2026-11-25','11:00:00','Dolor de hombro','Programado',37,2,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(109,'2026-11-25','08:00:00','Control postoperatorio','Programado',54,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(110,'2026-11-25','10:00:00','Consulta traumatológica','Programado',71,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(111,'2026-11-25','11:00:00','Seguimiento por lumbalgia','Programado',88,4,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(112,'2026-11-26','09:00:00','Dolor lumbar persistente','Programado',5,1,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(113,'2026-11-26','10:00:00','Control de columna lumbar','Programado',22,1,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(114,'2026-11-26','11:00:00','Dolor cervical','Programado',39,1,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(115,'2026-11-26','12:00:00','Evaluación de rodilla','Programado',56,1,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(116,'2026-11-26','10:00:00','Dolor de hombro','Programado',73,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(117,'2026-11-26','11:00:00','Control postoperatorio','Programado',90,4,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(118,'2026-11-26','12:00:00','Consulta traumatológica','Programado',7,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(119,'2026-11-26','13:00:00','Seguimiento por lumbalgia','Programado',24,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(120,'2026-11-27','12:00:00','Dolor lumbar persistente','Programado',41,3,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(121,'2026-11-27','13:00:00','Control de columna lumbar','Programado',58,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(122,'2026-12-01','11:00:00','Dolor cervical','Programado',75,1,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(123,'2026-12-01','12:00:00','Evaluación de rodilla','Programado',92,1,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(124,'2026-12-01','09:00:00','Dolor de hombro','Programado',9,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(125,'2026-12-01','11:00:00','Control postoperatorio','Programado',26,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(126,'2026-12-01','12:00:00','Consulta traumatológica','Programado',43,3,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(127,'2026-12-02','09:00:00','Seguimiento por lumbalgia','Programado',60,2,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(128,'2026-12-02','10:00:00','Dolor lumbar persistente','Programado',77,2,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(129,'2026-12-02','12:00:00','Control de columna lumbar','Programado',94,2,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(130,'2026-12-02','10:00:00','Dolor cervical','Programado',11,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(131,'2026-12-02','12:00:00','Evaluación de rodilla','Programado',28,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(132,'2026-12-03','10:00:00','Dolor de hombro','Programado',45,1,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(133,'2026-12-03','12:00:00','Control postoperatorio','Programado',62,1,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(134,'2026-12-03','08:00:00','Consulta traumatológica','Programado',79,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(135,'2026-12-03','09:00:00','Seguimiento por lumbalgia','Programado',96,4,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(136,'2026-12-03','11:00:00','Dolor lumbar persistente','Programado',13,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(137,'2026-12-03','13:00:00','Control de columna lumbar','Programado',30,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(138,'2026-12-04','09:00:00','Dolor cervical','Programado',47,3,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(139,'2026-12-04','10:00:00','Evaluación de rodilla','Programado',64,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(140,'2026-12-04','11:00:00','Dolor de hombro','Programado',81,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(141,'2026-12-04','12:00:00','Control postoperatorio','Programado',98,3,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(142,'2026-12-04','13:00:00','Consulta traumatológica','Programado',15,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(143,'2026-12-07','08:00:00','Seguimiento por lumbalgia','Programado',32,2,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(144,'2026-12-07','09:00:00','Dolor lumbar persistente','Programado',49,2,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(145,'2026-12-07','12:00:00','Control de columna lumbar','Programado',66,2,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(146,'2026-12-07','13:00:00','Dolor cervical','Programado',83,2,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(147,'2026-12-08','09:00:00','Evaluación de rodilla','Programado',100,1,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(148,'2026-12-08','10:00:00','Dolor de hombro','Programado',17,1,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(149,'2026-12-08','11:00:00','Control postoperatorio','Programado',34,1,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(150,'2026-12-08','13:00:00','Consulta traumatológica','Programado',51,1,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(151,'2026-12-08','08:00:00','Seguimiento por lumbalgia','Programado',68,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(152,'2026-12-08','10:00:00','Dolor lumbar persistente','Programado',85,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(153,'2026-12-09','08:00:00','Control de columna lumbar','Programado',2,2,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(154,'2026-12-09','09:00:00','Dolor cervical','Programado',19,2,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(155,'2026-12-10','09:00:00','Evaluación de rodilla','Programado',36,1,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(156,'2026-12-10','11:00:00','Dolor de hombro','Programado',53,1,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(157,'2026-12-10','12:00:00','Control postoperatorio','Programado',70,1,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(158,'2026-12-10','08:00:00','Consulta traumatológica','Programado',87,4,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(159,'2026-12-10','13:00:00','Seguimiento por lumbalgia','Programado',4,4,2,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(160,'2026-12-11','12:00:00','Dolor lumbar persistente','Programado',21,3,1,NULL,'Pendiente',NULL,'2026-11-13 14:33:20','2026-11-13 14:33:20',NULL),(161,'2026-11-13','13:00:00','Primera consulta','Programado',21,3,1,'2026-11-13 14:53:34','Finalizado',NULL,'2026-11-13 14:44:49','2026-11-13 14:53:46','2026-11-13 14:53:43'),(162,'2026-11-17','09:00:00','Primera consulta','Programado',1,1,1,NULL,'Pendiente',NULL,'2026-11-13 19:20:08','2026-11-13 19:20:08',NULL),(163,'2026-11-13','09:00:00','Primera consulta','Programado',1,3,1,'2026-11-13 19:21:31','En consulta',NULL,'2026-11-13 19:20:57','2026-11-13 19:21:53','2026-11-13 19:21:53');
/*!40000 ALTER TABLE `turno` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_paciente` int DEFAULT NULL,
  `id_medico` int DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `ultimo_acceso` datetime DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `email_respaldo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_respaldo_verificado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_verificacion_respaldo` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_username` (`username`),
  UNIQUE KEY `uq_usuario_email` (`email`),
  UNIQUE KEY `uq_usuario_paciente` (`id_paciente`),
  UNIQUE KEY `uq_usuario_medico` (`id_medico`),
  CONSTRAINT `fk_usuario_medico` FOREIGN KEY (`id_medico`) REFERENCES `medico` (`id_medico`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_usuario_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_rol`
--

DROP TABLE IF EXISTS `usuario_rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_rol` (
  `id_usuario` int NOT NULL,
  `id_rol` int NOT NULL,
  PRIMARY KEY (`id_usuario`,`id_rol`),
  KEY `fk_usuario_rol_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usuario_rol_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_rol`
--

LOCK TABLES `usuario_rol` WRITE;
/*!40000 ALTER TABLE `usuario_rol` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario_rol` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-21 21:39:03
