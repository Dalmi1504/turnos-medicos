-- UCBA - Estructura de base de datos (sin registros)
-- Exportacion depurada para repositorio publico.
-- No incluye pacientes, historias clinicas, usuarios ni hashes.
CREATE DATABASE IF NOT EXISTS `clinica` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `clinica`;

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `agenda_medica`;
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

DROP TABLE IF EXISTS `bloqueo_agenda`;
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

DROP TABLE IF EXISTS `cobertura_medica`;
CREATE TABLE `cobertura_medica` (
  `id_cobertura` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('Obra Social','Prepaga','Particular') COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_cobertura`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `estado_turno`;
CREATE TABLE `estado_turno` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `uq_estado_turno_descripcion` (`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `evolucion`;
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

DROP TABLE IF EXISTS `historia_clinica`;
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

DROP TABLE IF EXISTS `insumo`;
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

DROP TABLE IF EXISTS `lote_insumo`;
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

DROP TABLE IF EXISTS `medico`;
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

DROP TABLE IF EXISTS `movimiento_stock`;
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

DROP TABLE IF EXISTS `paciente`;
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

DROP TABLE IF EXISTS `recuperacion_cuenta`;
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

DROP TABLE IF EXISTS `rol`;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `descripcion` enum('Médico','Paciente','Secretaria','Administrador') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uq_rol_descripcion` (`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `turno`;
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

DROP TABLE IF EXISTS `usuario`;
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

DROP TABLE IF EXISTS `usuario_rol`;
CREATE TABLE `usuario_rol` (
  `id_usuario` int NOT NULL,
  `id_rol` int NOT NULL,
  PRIMARY KEY (`id_usuario`,`id_rol`),
  KEY `fk_usuario_rol_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usuario_rol_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
