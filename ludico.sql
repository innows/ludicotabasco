/*
 Navicat Premium Data Transfer

 Source Server         : ludico
 Source Server Type    : MySQL
 Source Server Version : 110809 (11.8.9-MariaDB-log)
 Source Host           : 31.97.208.87:3306
 Source Schema         : u375222933_bdcms

 Target Server Type    : MySQL
 Target Server Version : 110809 (11.8.9-MariaDB-log)
 File Encoding         : 65001

 Date: 27/10/2026 16:32:48
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for administradores
-- ----------------------------
DROP TABLE IF EXISTS `administradores`;
CREATE TABLE `administradores`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `rol` int NULL DEFAULT NULL COMMENT '1 admin/ 2 editor',
  `ultimo_login` datetime NULL DEFAULT NULL,
  `estado` tinyint(1) NULL DEFAULT 1,
  `fecha_creacion` datetime NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  INDEX `idx_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of administradores
-- ----------------------------
INSERT INTO `administradores` VALUES (1, 'admin', '$2y$10$zocSQiPey/ONoG.mtMBBLOCPNDfNa7Y5kwykt7DbkX4v5C4dwBWEa', 'Innows', 'innows.vhsa@gmail.com', 1, '2026-10-16 10:21:40', 1, '2026-05-10 13:13:04');
INSERT INTO `administradores` VALUES (4, 'sysadmin_6acae9cb05c33', '$2y$10$6.TeibA8e6rZiFQiG9rvUupSvValPgSZOmUWd10Kz6oMVSF3fQnGK', 'rosario', 'sysadmin@mecasur.com.mx', 2, NULL, 1, '2026-10-10 19:43:39');

-- ----------------------------
-- Table structure for cat_estado_cotizacion
-- ----------------------------
DROP TABLE IF EXISTS `cat_estado_cotizacion`;
CREATE TABLE `cat_estado_cotizacion`  (
  `Estado_Cotizacion_ID` int NOT NULL AUTO_INCREMENT,
  `Estado` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Activo` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`Estado_Cotizacion_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of cat_estado_cotizacion
-- ----------------------------
INSERT INTO `cat_estado_cotizacion` VALUES (1, 'Solicitado', 1);
INSERT INTO `cat_estado_cotizacion` VALUES (2, 'Enviado', 1);
INSERT INTO `cat_estado_cotizacion` VALUES (3, 'Autorizado', 1);
INSERT INTO `cat_estado_cotizacion` VALUES (4, 'Pagado', 1);
INSERT INTO `cat_estado_cotizacion` VALUES (5, 'Cancelado', 1);
INSERT INTO `cat_estado_cotizacion` VALUES (6, 'No Aceptado', 1);
INSERT INTO `cat_estado_cotizacion` VALUES (7, 'Aceptado', 1);

-- ----------------------------
-- Table structure for cat_estatus_recibos
-- ----------------------------
DROP TABLE IF EXISTS `cat_estatus_recibos`;
CREATE TABLE `cat_estatus_recibos`  (
  `Estatus_ID` int NOT NULL AUTO_INCREMENT,
  `Estatus_Recibo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`Estatus_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of cat_estatus_recibos
-- ----------------------------
INSERT INTO `cat_estatus_recibos` VALUES (1, 'Parcial');
INSERT INTO `cat_estatus_recibos` VALUES (2, 'Pagado');

-- ----------------------------
-- Table structure for cat_validez_oferta
-- ----------------------------
DROP TABLE IF EXISTS `cat_validez_oferta`;
CREATE TABLE `cat_validez_oferta`  (
  `Validez_ID` int NOT NULL AUTO_INCREMENT,
  `Dias_Validez` int NULL DEFAULT NULL,
  `Activo` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`Validez_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = FIXED;

-- ----------------------------
-- Records of cat_validez_oferta
-- ----------------------------
INSERT INTO `cat_validez_oferta` VALUES (1, 5, 1);
INSERT INTO `cat_validez_oferta` VALUES (2, 7, 1);
INSERT INTO `cat_validez_oferta` VALUES (3, 30, 1);
INSERT INTO `cat_validez_oferta` VALUES (4, 60, 1);
INSERT INTO `cat_validez_oferta` VALUES (5, 90, 1);

-- ----------------------------
-- Table structure for categorias
-- ----------------------------
DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `orden` int NULL DEFAULT 0,
  `estado` tinyint(1) NULL DEFAULT 1,
  `fecha_creacion` datetime NULL DEFAULT current_timestamp,
  `fecha_actualizacion` datetime NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `slug`(`slug` ASC) USING BTREE,
  INDEX `idx_slug`(`slug` ASC) USING BTREE,
  INDEX `idx_estado`(`estado` ASC) USING BTREE,
  INDEX `idx_orden`(`orden` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of categorias
-- ----------------------------
INSERT INTO `categorias` VALUES (17, 'Juegos Infantiles', 'juegos-infantiles', 'Equipamiento infantil para parques, escuelas, desarrollos habitacionales, hoteles y espacios recreativos.', 'juegos-infantiles-para-parques.webp', 1, 1, '2026-10-13 14:17:23', '2026-10-13 21:24:33');
INSERT INTO `categorias` VALUES (18, 'Equipos de Gimnasio', 'equipos-de-gimnasio', 'Equipamiento deportivo para parques, unidades deportivas, desarrollos urbanos, hoteles y proyectos institucionales.', 'categoria_6ace968b12cef9.38135767.jpg', 2, 1, '2026-10-13 14:37:31', '2026-10-13 21:24:34');
INSERT INTO `categorias` VALUES (19, 'Superficies', 'superficies', 'Superficies especializadas para áreas infantiles, deportivas y recreativas, diseñadas para complementar tus proyectos.', 'categoria_6ace981020e411.36466455.jpg', 3, 1, '2026-10-13 14:44:00', '2026-10-13 21:24:35');
INSERT INTO `categorias` VALUES (20, 'Mobiliario', 'mobiliario', 'Bancas, mesas, botes de basura, estaciones y soluciones de mobiliario para parques, plazas y espacios urbanos.', 'categoria_6ace9995a7d0f5.62679432.png', 4, 1, '2026-10-13 14:50:29', '2026-10-13 21:24:36');

-- ----------------------------
-- Table structure for clientes
-- ----------------------------
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes`  (
  `Cliente_ID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Telefono` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Empresa` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Domicilio_Empresa` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Fecha_Creacion` datetime NULL DEFAULT NULL,
  `Activo` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`Cliente_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of clientes
-- ----------------------------
INSERT INTO `clientes` VALUES (1, 'Cliente Generico', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `clientes` VALUES (2, 'Rosario Sancez', NULL, NULL, NULL, NULL, '2026-06-03 17:24:56', 1);
INSERT INTO `clientes` VALUES (3, 'José Manuel', NULL, NULL, NULL, NULL, '2026-06-03 21:22:45', 1);
INSERT INTO `clientes` VALUES (4, 'ROBERTO GONZALEZ G.', NULL, NULL, NULL, NULL, '2026-06-10 12:39:12', 1);
INSERT INTO `clientes` VALUES (5, 'Marco Antonio', NULL, NULL, NULL, NULL, '2026-06-24 10:34:13', 1);
INSERT INTO `clientes` VALUES (6, 'Maurico Alejandro', NULL, NULL, NULL, NULL, '2026-07-01 10:59:26', 1);
INSERT INTO `clientes` VALUES (7, 'MAYRA', NULL, NULL, NULL, NULL, '2026-07-13 17:47:57', 1);
INSERT INTO `clientes` VALUES (8, 'RODRIGO VILLAFUERTE', NULL, NULL, NULL, NULL, '2026-07-15 17:36:02', 1);
INSERT INTO `clientes` VALUES (9, 'Gerardo Rodriguez', NULL, NULL, NULL, NULL, '2026-07-21 16:44:40', 1);

-- ----------------------------
-- Table structure for configuracion
-- ----------------------------
DROP TABLE IF EXISTS `configuracion`;
CREATE TABLE `configuracion`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_sitio` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `telefono_ventas` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `whatsapp` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `no_whatsapp` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `direccion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `horario` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `facebook` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `twitter` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `instagram` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tiktok` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `google_maps` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `favicon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp,
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of configuracion
-- ----------------------------
INSERT INTO `configuracion` VALUES (1, 'Ludico', 'Nos dedicamos a la venta e instalación de cámaras de seguridad, así como en la comercialización e implementación de software', 'ludicoficial@gmail.com', '993 400 8804', '993 400 8804', 'https://wa.link/e9bs6p', '9611349000', '', '', 'https://www.facebook.com/profile.php?id=61581634570933', '', 'https://www.instagram.com/ludicoficial2025', 'https://www.tiktok.com/@ludico.tabasco.mo', '', 'public/img/logo.png', '', '2026-05-10 12:57:37', '2026-10-13 13:50:37');

-- ----------------------------
-- Table structure for cotizacion_partidas
-- ----------------------------
DROP TABLE IF EXISTS `cotizacion_partidas`;
CREATE TABLE `cotizacion_partidas`  (
  `Detalle_Cotizacion` int NOT NULL AUTO_INCREMENT,
  `Cotizacion_ID` int NULL DEFAULT NULL,
  `Producto_ID` int NULL DEFAULT NULL,
  `Cantidad` int NULL DEFAULT NULL,
  `Precio_Unitario` double NULL DEFAULT NULL,
  `Total` double NULL DEFAULT NULL,
  `Tipo_Partida` tinyint(1) NULL DEFAULT 0 COMMENT '0 es Producto / 1 es Servicio',
  `Activo` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`Detalle_Cotizacion`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 114 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = FIXED;

-- ----------------------------
-- Records of cotizacion_partidas
-- ----------------------------
INSERT INTO `cotizacion_partidas` VALUES (1, 1, 192, 1, 3785.79, 3785.79, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (2, 1, 157, 9, 941.36, 8472.24, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (3, 1, 191, 1, 3907.52, 3907.52, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (4, 1, 32, 4, 90, 360, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (5, 1, 37, 5, 35, 175, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (6, 1, 59, 1, 1250, 1250, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (7, 1, 38, 9, 75, 675, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (8, 1, 56, 5, 14, 70, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (9, 1, 126, 80, 9, 720, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (10, 1, 124, 65, 7, 455, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (11, 1, 6, 1, 5500, 5500, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (12, 1, 9, 18, 31, 558, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (13, 2, 144, 1, 1820.59, 1820.59, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (14, 2, 157, 8, 941.36, 7530.88, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (15, 2, 1, 1, 2720, 2720, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (16, 2, 38, 8, 75, 600, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (17, 2, 56, 4, 14, 56, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (18, 2, 32, 8, 90, 720, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (19, 2, 59, 1, 1250, 1250, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (20, 3, 145, 1, 1216.97, 1216.97, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (21, 3, 158, 8, 600, 4800, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (22, 3, 1, 1, 2720, 2720, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (23, 3, 32, 8, 90, 720, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (24, 3, 38, 8, 75, 600, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (25, 3, 56, 4, 14, 56, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (26, 3, 59, 1, 1250, 1250, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (27, 4, 168, 1, 3677.2, 3677.2, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (28, 4, 32, 1, 90, 90, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (29, 4, 2, 1, 1164.57, 1164.57, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (30, 4, 56, 4, 14, 56, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (31, 4, 53, 1, 85, 85, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (32, 4, 58, 1, 160, 160, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (33, 4, 6, 1, 3000, 3000, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (34, 5, 168, 1, 3677.2, 3677.2, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (35, 5, 2, 1, 1164.57, 1164.57, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (36, 5, 32, 1, 90, 90, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (37, 5, 56, 4, 14, 56, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (38, 5, 53, 1, 85, 85, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (39, 5, 58, 1, 160, 160, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (40, 5, 6, 1, 3000, 3000, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (41, 6, 205, 1, 4480.6, 4480.6, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (42, 6, 206, 8, 1354.77, 10838.16, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (43, 6, 59, 1, 1250, 1250, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (44, 6, 38, 8, 75, 600, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (45, 6, 32, 4, 90, 360, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (46, 6, 37, 4, 35, 140, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (47, 6, 56, 4, 14, 56, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (48, 6, 126, 200, 9, 1800, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (49, 6, 191, 1, 3907.52, 3907.52, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (50, 6, 6, 1, 6000, 6000, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (51, 7, 158, 3, 600, 1800, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (52, 7, 142, 1, 836, 836, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (53, 7, 2, 1, 1164.57, 1164.57, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (54, 7, 38, 3, 75, 225, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (55, 7, 56, 3, 14, 42, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (56, 7, 53, 1, 85, 85, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (57, 7, 58, 1, 160, 160, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (58, 7, 179, 1, 505, 505, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (59, 7, 6, 1, 2500, 2500, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (60, 7, 32, 3, 90, 270, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (61, 8, 207, 1, 550, 550, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (62, 8, 89, 1, 560, 560, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (63, 8, 125, 25, 7, 175, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (64, 8, 6, 1, 1500, 1500, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (65, 9, 187, 1, 3500, 3500, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (66, 9, 68, 1, 500, 500, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (67, 10, 158, 2, 600, 1200, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (68, 10, 142, 1, 836, 836, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (69, 10, 2, 1, 1299.08, 1299.08, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (70, 10, 53, 1, 65, 65, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (71, 10, 58, 1, 160, 160, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (72, 10, 56, 2, 14, 28, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (73, 10, 38, 2, 75, 150, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (74, 10, 32, 2, 90, 180, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (75, 10, 126, 36, 9, 324, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (76, 11, 161, 2, 536, 1072, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (77, 11, 146, 1, 1062.06, 1062.06, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (78, 11, 32, 2, 90, 180, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (79, 11, 106, 4, 6, 24, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (80, 11, 2, 1, 1299.08, 1299.08, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (81, 11, 126, 36, 9, 324, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (82, 11, 6, 1, 1200, 1200, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (83, 10, 6, 1, 1200, 1200, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (84, 12, 162, 2, 1284.92, 2569.84, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (85, 12, 126, 36, 9, 324, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (86, 12, 56, 2, 14, 28, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (87, 12, 103, 2, 386.2, 772.4, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (88, 12, 6, 1, 1200, 1200, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (89, 12, 32, 2, 90, 180, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (90, 13, 82, 1, 360, 360, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (91, 13, 125, 18, 7, 126, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (92, 13, 106, 2, 6, 12, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (93, 13, 6, 1, 450, 450, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (94, 14, 19, 1, 3368, 3368, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (95, 14, 16, 1, 1800, 1800, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (96, 14, 6, 1, 850, 850, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (97, 15, 146, 1, 1062.06, 1062.06, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (98, 15, 161, 2, 536, 1072, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (99, 15, 32, 2, 90, 180, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (100, 15, 179, 1, 505, 505, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (101, 15, 106, 6, 6, 36, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (102, 15, 6, 0, 1200, 0, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (103, 16, 158, 2, 600, 1200, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (104, 16, 142, 1, 836, 836, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (105, 16, 56, 2, 14, 28, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (106, 16, 58, 1, 160, 160, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (107, 16, 53, 1, 85, 85, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (108, 16, 32, 2, 90, 180, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (109, 16, 179, 1, 505, 505, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (110, 16, 106, 2, 6, 12, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (111, 16, 38, 2, 75, 150, 0, 1);
INSERT INTO `cotizacion_partidas` VALUES (112, 16, 6, 0, 1200, 0, 1, 1);
INSERT INTO `cotizacion_partidas` VALUES (113, 14, 16, 1, 900, 900, 1, 1);

-- ----------------------------
-- Table structure for cotizaciones
-- ----------------------------
DROP TABLE IF EXISTS `cotizaciones`;
CREATE TABLE `cotizaciones`  (
  `Cotizacion_ID` int NOT NULL AUTO_INCREMENT,
  `Cliente_ID` int NULL DEFAULT NULL,
  `Fecha_Cotizacion` datetime NULL DEFAULT NULL,
  `Observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `Total_Venta` double NULL DEFAULT NULL,
  `Tipo_Venta` tinyint(1) NULL DEFAULT NULL COMMENT '0 contado / 1 credito',
  `Dias_Credito` int NULL DEFAULT NULL COMMENT 'numero de dias',
  `Aplica_IVA` tinyint NULL DEFAULT NULL COMMENT '0 no / 1 si',
  `Porcentaje_Descuento` int NULL DEFAULT NULL,
  `Total_Descuento` float NULL DEFAULT NULL,
  `Vigencia` int NULL DEFAULT NULL,
  `Porc_Requerido` int NULL DEFAULT NULL,
  `Folio` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'WEB si es de la página, SP si es del administrador',
  `Estado_Cotizacion` tinyint(1) NULL DEFAULT 1,
  `Usuario_ID_Creo` int NULL DEFAULT NULL,
  `Usuario_ID_Autorizo` int NULL DEFAULT NULL,
  `Usuario_ID_Edito` int NULL DEFAULT NULL,
  `Activo` tinyint(1) NULL DEFAULT 1,
  `Fecha_Actualizacion` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Cotizacion_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of cotizaciones
-- ----------------------------
INSERT INTO `cotizaciones` VALUES (1, 4, '2026-06-10 12:39:12', 'Se realizará la instalación y puesta en marcha de un sistema de videovigilancia compuesto por 9 cámaras tipo bala marca Dahua. Los trabajos incluyen la fijación de cámaras y cajas de conexión, instalación de canaletas y tendido de cableado, así como la centralización de las conexiones en el área de monitoreo. También se llevará a cabo la instalación y configuración del grabador con su disco duro, la fuente de poder y el monitor para visualización. Finalmente, se realizará la programación de las cámaras en el DVR y la configuración del acceso remoto en teléfono celular para su monitoreo.', 25928.55, 0, 0, 0, 0, 0, 3, 50, 'SP', 6, 1, 1, NULL, 1, '2026-06-24 10:40:05');
INSERT INTO `cotizaciones` VALUES (2, 1, '2026-06-11 18:10:10', 'Venta de equipos de sistemas de seguridad, ofreciendo soluciones tecnológicas para la protección de hogares y negocios, con productos de alta calidad y rendimiento confiable', 14697.47, 0, 0, 0, 0, 0, 3, 50, 'SP', 6, 1, 1, NULL, 1, '2026-06-11 19:51:39');
INSERT INTO `cotizaciones` VALUES (3, 1, '2026-06-11 18:16:15', 'Venta de equipos de sistemas de seguridad, ofreciendo soluciones tecnológicas para la protección de hogares y negocios, con productos de alta calidad y rendimiento confiable', 11362.97, 0, 0, 0, 0, 0, 3, 50, 'SP', 6, 1, 1, NULL, 1, '2026-06-13 10:39:20');
INSERT INTO `cotizaciones` VALUES (4, 1, '2026-06-11 20:44:38', '', 8232.77, -1, 0, 0, 0, 0, 1, 0, 'SP', 5, 1, 1, NULL, 1, '2026-06-11 20:45:29');
INSERT INTO `cotizaciones` VALUES (5, 1, '2026-06-11 20:52:04', 'Se realizará la instalación de 4 cámaras de videovigilancia marca Dahua, incluyendo el tendido y fijación del cableado y cajas de conexiones, así como la colocación y configuración del disco duro en el grabador. Se programará el sistema y las cámaras para su correcto funcionamiento, y en caso de contar con conexión a Internet, se realizará la conexión a la red para acceso remoto. Adicionalmente, se configurará la visualización de las cámaras en el televisor del cliente para el monitoreo en tiempo real.', 8232.77, 0, 0, 0, 0, 0, 3, 50, 'SP', 6, 1, 1, NULL, 1, '2026-06-13 10:39:45');
INSERT INTO `cotizaciones` VALUES (6, 1, '2026-06-12 12:55:12', 'Se realizará la instalación de un sistema de videovigilancia compuesto por 8 cámaras marca Hikvision, incluyendo la fijación de las cámaras y sus cajas de conexión, el tendido y conexión del cableado, así como la instalación del DVR grabador y su disco duro para almacenamiento de video. Posteriormente, se conectará y configurará el monitor o televisor para la visualización de las cámaras y se realizarán las pruebas de funcionamiento correspondientes. En caso de contar con servicio de Internet, se configurará el acceso remoto en el teléfono celular del usuario para la visualización del sistema desde la aplicación de Hikvision.', 29432.28, 0, 0, 0, 0, 0, 3, 75, 'SP', 6, 1, 1, NULL, 1, '2026-06-14 14:25:19');
INSERT INTO `cotizaciones` VALUES (7, 1, '2026-06-14 14:21:18', 'Se instalarán 3 cámaras de la marca Dahua en las ubicaciones que el cliente determine. Posteriormente, se colocarán y fijarán las cajas de conexión correspondientes para garantizar una instalación segura y ordenada. Una vez realizado esto, se procederá con el tendido y fijación de todo el cableado necesario para la interconexión del sistema. Después, se instalará el disco duro en el DVR para el almacenamiento de las grabaciones. Finalmente, se llevará a cabo la configuración del DVR y de las cámaras, verificando su correcto funcionamiento y asegurando que el sistema quede completamente operativo.', 7587.57, 0, 0, 0, 0, 0, 7, 50, 'SP', 6, 1, 1, NULL, 1, '2026-06-20 14:28:56');
INSERT INTO `cotizaciones` VALUES (8, 5, '2026-06-24 10:34:13', 'Se realizará la instalación y configuración de una red de datos a partir del servicio de internet Starlink Gen 2, integrando un adaptador Ethernet RJ45 para habilitar la conectividad cableada. El proyecto contempla la conexión de un switch de red para la distribución de la señal, el tendido y terminación de cableado estructurado hacia un repetidor o punto de acceso para ampliar la cobertura inalámbrica, así como la configuración de un router para la administración y optimización de la red. Se llevarán a cabo pruebas de conectividad, verificación de funcionamiento y ajustes necesarios para garantizar una conexión estable, segura y con el mejor rendimiento posible en todos los dispositivos conectados. El servicio incluye la instalación, configuración, puesta en marcha y validación operativa de los equipos de red involucrados.', 2785, 0, 0, 0, 0, 0, 7, 0, 'SP', 4, 1, 1, 1, 1, '2026-06-30 15:29:49');
INSERT INTO `cotizaciones` VALUES (9, 6, '2026-07-01 10:59:26', 'Se venderá únicamente CPU, MONITOR, BASE Y LECTOR QR.', 4000, 1, 2, 0, 0, 0, 7, 50, 'SP', 7, 1, 1, NULL, 1, '2026-07-01 11:01:45');
INSERT INTO `cotizaciones` VALUES (10, 7, '2026-07-13 17:47:57', 'Se realizará la instalación de 2 cámaras de seguridad marca Dahua, cuya ubicación será definida por el cliente antes de la instalación. El servicio incluye la fijación de las cámaras con sus respectivas cajas de conexión, el grapado y aseguramiento del cableado para una instalación ordenada y segura, así como la configuración de las cámaras en el DVR para garantizar su correcto funcionamiento. En caso de que el cliente cuente con servicio de internet, también se configurará el acceso remoto en su dispositivo móvil para que pueda visualizar las cámaras en tiempo real desde cualquier lugar.', 5442.08, 0, 0, 0, 0, 0, 7, 50, 'SP', 3, 1, 1, 1, 1, '2026-07-13 17:54:35');
INSERT INTO `cotizaciones` VALUES (11, 7, '2026-07-13 17:54:05', '-Se realizará la instalación de 2 cámaras de seguridad marca Tiandy, cuya ubicación será definida por el cliente antes de la instalación. El servicio incluye la fijación de las cámaras con sus respectivas cajas de conexión, el grapado y aseguramiento del cableado para una instalación ordenada y segura, así como la configuración de las cámaras en el NVR para garantizar su correcto funcionamiento. En caso de que el cliente cuente con servicio de internet, también se configurará el acceso remoto en su dispositivo móvil para que pueda visualizar las cámaras en tiempo real desde cualquier lugar.', 5161.14, 0, 0, 0, 0, 0, 7, 50, 'SP', 3, 1, 1, 1, 1, '2026-07-13 17:55:50');
INSERT INTO `cotizaciones` VALUES (12, 7, '2026-07-13 18:05:32', 'Se realizará la instalación de cámaras Wi-Fi marca Tiandy en los puntos indicados por el cliente. El servicio incluye la fijación de las cámaras, la instalación de sus respectivas cajas de conexión y la alimentación eléctrica necesaria para su funcionamiento. Asimismo, se realizará la configuración y vinculación de las cámaras con el dispositivo móvil del cliente para que pueda visualizar las imágenes de forma remota a través de la aplicación correspondiente.', 5074.24, 0, 0, 0, 0, 0, 7, 50, 'SP', 3, 1, 1, NULL, 1, '2026-07-13 18:05:47');
INSERT INTO `cotizaciones` VALUES (13, 8, '2026-07-15 17:36:03', 'Se instalará un router de la marca TP-Link para extender la cobertura de la red Wi-Fi. Se realizará el tendido del cableado en la habitación del cliente, asegurándolo mediante grapas para una instalación ordenada y segura. Finalmente, se llevará a cabo la configuración del equipo para garantizar su correcto funcionamiento y la ampliación de la cobertura de la red inalámbrica.', 948, 0, 0, 0, 0, 0, 3, 50, 'SP', 6, 1, 1, NULL, 1, '2026-07-19 10:25:53');
INSERT INTO `cotizaciones` VALUES (14, 5, '2026-07-16 12:37:40', 'Se realizará el reemplazo del disco duro mecánico por una unidad de estado sólido (SSD) con capacidad de 960 GB. Posteriormente, se instalará el sistema operativo junto con los controladores necesarios para el correcto funcionamiento del equipo.\n\nUna vez concluida la instalación, se efectuará la limpieza física correspondiente del equipo. Finalmente, se instalará el sistema de punto de venta Eleventa y se configurará Microsoft Office con licencia permanente.', 6572.1, 0, 0, 0, 5, 345.9, 3, 50, 'SP', 7, 1, 1, 1, 1, '2026-07-22 16:40:24');
INSERT INTO `cotizaciones` VALUES (15, 9, '2026-07-21 16:44:41', '-\n							Se instalarán dos cámaras marca Tiandy, incluyendo la fijación de las cámaras, sus cajas de conexiones y el tendido del cableado, el cual será sujetado con grapas. Al finalizar la instalación, se realizará la programación de las cámaras en el NVR. Si el cliente cuenta con un punto de Internet cercano, se realizará la conexión sin costo adicional; en caso de que sea necesario instalar cableado adicional por no existir un punto de red cercano, dicho trabajo tendrá un costo extra.', 2855.06, 0, 0, 0, 0, 0, 7, 50, 'SP', 3, 1, 1, 1, 1, '2026-07-21 16:52:15');
INSERT INTO `cotizaciones` VALUES (16, 9, '2026-07-21 16:59:36', 'Se instalarán dos cámaras marca Dahua, incluyendo la fijación de las cámaras, sus cajas de conexiones y el tendido del cableado, el cual será sujetado con grapas. Al finalizar la instalación, se realizará la programación de las cámaras en el DVR. Si el cliente cuenta con un punto de Internet cercano, se realizará la conexión sin costo adicional; en caso de que sea necesario instalar cableado adicional por no existir un punto de red cercano, dicho trabajo tendrá un costo extra.', 3156, 0, 0, 0, 0, 0, 7, 50, 'SP', 3, 1, 1, 1, 1, '2026-07-21 17:01:31');

-- ----------------------------
-- Table structure for galeriaPortafolio
-- ----------------------------
DROP TABLE IF EXISTS `galeriaPortafolio`;
CREATE TABLE `galeriaPortafolio`  (
  `Galeria_ID` int NOT NULL AUTO_INCREMENT,
  `Portafolio_ID` int NULL DEFAULT NULL,
  `Imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Activo` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`Galeria_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 41 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of galeriaPortafolio
-- ----------------------------
INSERT INTO `galeriaPortafolio` VALUES (1, 2, 'portafolio_6a07d9753d0648.43211793.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (2, 2, 'portafolio_6a07d97527ef63.09466298.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (3, 2, 'portafolio_6a07d97532a116.57499227.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (4, 7, 'portafolio_6a0a91b5dd7308.11115498.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (5, 7, 'portafolio_6a0a91b65d4c83.25706487.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (6, 7, 'portafolio_6a0a91b6c853c4.02099950.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (7, 8, 'portafolio_6a0a93408e5659.74336801.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (8, 8, 'portafolio_6a0a9340ba62f0.51895750.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (9, 8, 'portafolio_6a0a9340e83e69.70086119.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (10, 2, 'portafolio_6a0b6fab3fe369.90728623.jpg', 0);
INSERT INTO `galeriaPortafolio` VALUES (11, 2, 'portafolio_6a0b6facc9bd11.38165591.jpg', 0);
INSERT INTO `galeriaPortafolio` VALUES (12, 2, 'portafolio_6a0b719f761340.73075575.jpg', 0);
INSERT INTO `galeriaPortafolio` VALUES (13, 2, 'portafolio_6a0b7e7c51b940.17737168.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (14, 9, 'portafolio_6a0b84af1f9e07.26535520.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (15, 9, 'portafolio_6a0b84af298643.43201085.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (16, 9, 'portafolio_6a0b84af3c8401.07344602.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (17, 9, 'portafolio_6a0b84af4d1435.39494133.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (18, 9, 'portafolio_6a0b84af5de672.32441530.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (19, 10, 'portafolio_6a11fb2bb2a5e0.90031190.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (20, 10, 'portafolio_6a11fb2bb93bd6.82945372.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (21, 10, 'portafolio_6a11fb2bbf8ff2.47924607.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (22, 10, 'portafolio_6a11fb2bc82eb5.91541262.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (23, 10, 'portafolio_6a11fb2bce6ba0.90296789.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (24, 11, 'portafolio_6a17a2b33ba814.40383958.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (25, 11, 'portafolio_6a17a2b33fddd4.48112636.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (26, 11, 'portafolio_6a17a2b3439118.10689017.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (27, 11, 'portafolio_6a17a2b347cd04.72485615.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (28, 11, 'portafolio_6a17a2b34c0701.97210115.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (29, 11, 'portafolio_6a17a2b3502a12.07495974.jpg', 0);
INSERT INTO `galeriaPortafolio` VALUES (30, 11, 'portafolio_6a17a2b35433a4.46767091.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (31, 12, 'portafolio_6a21c5821ca635.40796069.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (32, 12, 'portafolio_6a21c5822372b7.96584405.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (33, 12, 'portafolio_6a21c5822a16d8.05408542.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (34, 12, 'portafolio_6a21c582309766.36743725.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (35, 12, 'portafolio_6a21c58236d9f6.63527996.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (36, 12, 'portafolio_6a21c5823d7712.50659766.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (37, 13, 'portafolio_6a25ca59df38b9.93896218.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (38, 13, 'portafolio_6a25ca59e62a34.12948905.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (39, 13, 'portafolio_6a25ca59eb7b42.89330791.jpg', 1);
INSERT INTO `galeriaPortafolio` VALUES (40, 13, 'portafolio_6a25ca59f0a037.99501258.jpg', 1);

-- ----------------------------
-- Table structure for galeriaProductos
-- ----------------------------
DROP TABLE IF EXISTS `galeriaProductos`;
CREATE TABLE `galeriaProductos`  (
  `Galeria_ID` int NOT NULL AUTO_INCREMENT,
  `Producto_ID` int NULL DEFAULT NULL,
  `Img_Galeria` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Activo` tinyint(1) NULL DEFAULT NULL,
  PRIMARY KEY (`Galeria_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of galeriaProductos
-- ----------------------------
INSERT INTO `galeriaProductos` VALUES (1, 1, 'productos_6acfed75c332e8.31117975.jpg', 1);
INSERT INTO `galeriaProductos` VALUES (2, 1, 'productos_6acfedb6a71cd7.22296563.jpg', 1);
INSERT INTO `galeriaProductos` VALUES (3, 1, 'productos_6acfedb8737ac1.13235717.jpg', 1);

-- ----------------------------
-- Table structure for mensajes_contacto
-- ----------------------------
DROP TABLE IF EXISTS `mensajes_contacto`;
CREATE TABLE `mensajes_contacto`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `asunto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `mensaje` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `leido` enum('0','1') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '0',
  `fecha_creacion` datetime NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_leido`(`leido` ASC) USING BTREE,
  INDEX `idx_fecha`(`fecha_creacion` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of mensajes_contacto
-- ----------------------------
INSERT INTO `mensajes_contacto` VALUES (1, 'Juan Pérez', 'juan@ejemplo.com', 'Consulta sobre productos', 'Hola, me gustaría saber más sobre sus productos de electrónica. ¿Tienen garantía extendida?', '127.0.0.1', '0', '2026-04-28 14:41:31');

-- ----------------------------
-- Table structure for metodo_de_pagos
-- ----------------------------
DROP TABLE IF EXISTS `metodo_de_pagos`;
CREATE TABLE `metodo_de_pagos`  (
  `MetodoPago_ID` int NOT NULL AUTO_INCREMENT,
  `MetodoPago` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Activo` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`MetodoPago_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of metodo_de_pagos
-- ----------------------------
INSERT INTO `metodo_de_pagos` VALUES (1, 'Efectivo', 1);
INSERT INTO `metodo_de_pagos` VALUES (2, 'Tarjeta ', 1);
INSERT INTO `metodo_de_pagos` VALUES (3, 'SPEI', 1);
INSERT INTO `metodo_de_pagos` VALUES (4, 'Cheque', 1);

-- ----------------------------
-- Table structure for paginas
-- ----------------------------
DROP TABLE IF EXISTS `paginas`;
CREATE TABLE `paginas`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `contenido` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `meta_titulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `meta_descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `estado` enum('activo','inactivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'activo',
  `fecha_creacion` datetime NULL DEFAULT current_timestamp,
  `fecha_actualizacion` datetime NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `slug`(`slug` ASC) USING BTREE,
  INDEX `idx_slug`(`slug` ASC) USING BTREE,
  INDEX `idx_estado`(`estado` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of paginas
-- ----------------------------
INSERT INTO `paginas` VALUES (1, 'Quiénes Somos', 'quienes-somos', '<p>Somos una empresa dedicada a ofrecer los mejores productos a nuestros clientes.</p>', NULL, NULL, 'activo', '2026-04-28 14:41:31', '2026-04-28 14:41:31');
INSERT INTO `paginas` VALUES (2, 'Términos y Condiciones', 'terminos', '<p>Términos y condiciones de uso del sitio web.</p>', NULL, NULL, 'activo', '2026-04-28 14:41:31', '2026-04-28 14:41:31');
INSERT INTO `paginas` VALUES (3, 'Política de Privacidad', 'privacidad', '<p>Política de privacidad y protección de datos.</p>', NULL, NULL, 'activo', '2026-04-28 14:41:31', '2026-04-28 14:41:31');

-- ----------------------------
-- Table structure for portafolio
-- ----------------------------
DROP TABLE IF EXISTS `portafolio`;
CREATE TABLE `portafolio`  (
  `Portafolio_ID` int NOT NULL AUTO_INCREMENT,
  `img_portafolio` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Titulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `Fecha_Servicio` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Nombre_Cliente` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Activo` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`Portafolio_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of portafolio
-- ----------------------------
INSERT INTO `portafolio` VALUES (1, 'portafolio_69fe332b135cb4.60689256.jpg', 'EJEMPLO 2', 'Este es un ejemplo para ver como se visualiza en la pagina web', NULL, NULL, 0);
INSERT INTO `portafolio` VALUES (2, 'portafolio_6a0b822687cdc1.60560093.jpg', 'Instalación de cámaras', 'Se realizó la instalación y configuración de un sistema de videovigilancia en una tienda de abarrotes, integrado por 4 cámaras de seguridad marca Dahua y su respectivo grabador de video (DVR), garantizando una correcta cobertura y monitoreo de las áreas requeridas por el cliente.  Asimismo, se llevó a cabo la instalación del monitor para la visualización en tiempo real de las cámaras, conforme a las especificaciones y necesidades solicitadas. El trabajo incluyó la colocación y conexión del equipo, organización del cableado, pruebas de funcionamiento y verificación del correcto desempeño del sistema de seguridad.', '22 Enero 2026', 'Abarrotes monterrey', 1);
INSERT INTO `portafolio` VALUES (3, 'portafolio_6a07d97527ef63.09466298.jpg', 'Instalación de cámaras', 'Se realizó la instalación y configuración de un sistema de videovigilancia en una tienda de abarrotes, integrado por 4 cámaras de seguridad marca Dahua y su respectivo grabador de video (DVR), garantizando una correcta cobertura y monitoreo de las áreas requeridas por el cliente.  Asimismo, se llevó a cabo la instalación del monitor para la visualización en tiempo real de las cámaras, conforme a las especificaciones y necesidades solicitadas. El trabajo incluyó la colocación y conexión del equipo, organización del cableado, pruebas de funcionamiento y verificación del correcto desempeño del sistema de seguridad.', NULL, NULL, 0);
INSERT INTO `portafolio` VALUES (4, 'portafolio_6a07d97532a116.57499227.jpg', 'Instalación de cámaras', '', NULL, NULL, 0);
INSERT INTO `portafolio` VALUES (5, 'portafolio_6a07d9753d0648.43211793.jpg', '.', '', NULL, NULL, 0);
INSERT INTO `portafolio` VALUES (6, 'portafolio_6a07d97547d667.12873416.jpg', 'Instalación de cámaras', 'Se realizó la instalación y configuración de un sistema de videovigilancia en una tienda de abarrotes, integrado por 4 cámaras de seguridad marca Dahua y su respectivo grabador de video (DVR), garantizando una correcta cobertura y monitoreo de las áreas requeridas por el cliente.  Asimismo, se llevó a cabo la instalación del monitor para la visualización en tiempo real de las cámaras, conforme a las especificaciones y necesidades solicitadas. El trabajo incluyó la colocación y conexión del equipo, organización del cableado, pruebas de funcionamiento y verificación del correcto desempeño del sistema de seguridad.', NULL, NULL, 0);
INSERT INTO `portafolio` VALUES (7, NULL, 'prueba', 'hijjjmjk', '22 junio 2026', 'abarrotes monterrey', 0);
INSERT INTO `portafolio` VALUES (8, 'portafolio_6a0a93408e5659.74336801.jpg', 'prueba', 'hijjjmjk', '22 junio 2026', 'abarrotes monterrey2', 0);
INSERT INTO `portafolio` VALUES (9, 'portafolio_6a0b84e65cd149.75705071.jpg', 'Instalación De Cámaras', 'Se realizó la instalación y configuración de un sistema de videovigilancia residencial compuesto por 3 cámaras tipo Bullet y 1 cámara PTZ 360° de la marca Dahua Technology, integradas a un grabador de video (DVR) para monitoreo y almacenamiento continuo.  El proyecto incluyó la adecuación de una instalación existente que inicialmente solo contaba con monitor de visualización, realizando la implementación completa del sistema de seguridad, conexión de equipos, configuración de grabación y optimización de cobertura para vigilancia perimetral y monitoreo remoto del domicilio familiar.', '30 Enero 2026', 'Casa / Residencial', 1);
INSERT INTO `portafolio` VALUES (10, 'portafolio_6a11fb6c3d45e2.76900957.jpg', 'Instalación De Cámaras', 'Se realizó la instalación y configuración de un sistema de videovigilancia compuesto por dos cámaras de seguridad, incluyendo el cableado correspondiente y la instalación de su respectivo disco duro. Posteriormente, se llevó a cabo la programación y configuración del DVR para su correcto funcionamiento.  Se instaló una cámara tipo bala y una cámara PT de 2MP Full Color con audio integrado, ambas colocadas estratégicamente en la bodega indicada por el cliente, de acuerdo con sus requerimientos de monitoreo y seguridad.  Asimismo, el DVR fue instalado en un domicilio distinto, conforme a las indicaciones proporcionadas por el cliente. Adicionalmente, se realizó la instalación y conexión del repetidor de internet, la fuente de poder y el DVR, garantizando una correcta transmisión, monitoreo y almacenamiento de las grabaciones del sistema de seguridad.', '22 de mayo 2026', 'Casa / Bodega', 1);
INSERT INTO `portafolio` VALUES (11, 'portafolio_6a17a2df148403.52079331.jpg', 'Instalación De Cámaras', 'Se realizó una instalación de equipos de videovigilancia de la marca Tiandy, colocando 5 cámaras en puntos estratégicos para permitir al cliente la supervisión y monitoreo de las áreas deseadas.  Asimismo, se instaló un disco duro en el NVR para el almacenamiento de grabaciones, y se realizó la fijación adecuada de las cámaras y del cableado correspondiente para garantizar una instalación segura y ordenada.  La tecnología de Tiandy permite que el mismo NVR suministre energía a las cámaras mediante tecnología PoE (Power over Ethernet), evitando la necesidad de fuentes de alimentación adicionales y optimizando la instalación del sistema.', '27/05/26', 'Casa / Habitación', 1);
INSERT INTO `portafolio` VALUES (12, 'portafolio_6a21c593471634.94362886.jpg', 'Instalación De Cámaras', 'Se realizó la instalación de un sistema de videovigilancia en una casa habitación. Se fijaron a muro cuatro cámaras de seguridad de la marca Dahua, colocando su respectivo cableado, el cual fue sujetado mediante grapas para asegurar una instalación ordenada y segura.  Asimismo, se efectuó la configuración del sistema y la instalación del disco duro en el DVR de la marca Dahua, verificando el correcto funcionamiento de las cámaras, la grabación de video y el acceso al equipo.  Resultado: La instalación y configuración se realizaron satisfactoriamente, obteniendo un funcionamiento correcto del sistema y una calidad de imagen adecuada.', '04/06/26', 'Casa / Habitación', 1);
INSERT INTO `portafolio` VALUES (13, 'portafolio_6a25ca66a67311.46707019.jpg', 'Instalación De Punto De Venta', 'Instalación y configuración de tres terminales de punto de venta utilizando Eleventa en modalidad MultiCaja. Se estableció un servidor central para la administración de productos e inventario, conectando las demás estaciones mediante red local para mantener la información sincronizada y optimizar la operación del negocio.', '08/11/2025', 'CPU / Monitor', 1);

-- ----------------------------
-- Table structure for productos
-- ----------------------------
DROP TABLE IF EXISTS `productos`;
CREATE TABLE `productos`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `precio` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `precio_anterior` decimal(10, 2) NULL DEFAULT NULL,
  `categoria_id` int NULL DEFAULT NULL,
  `subcategoria_id` int NULL DEFAULT NULL,
  `imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `stock` int NULL DEFAULT 0,
  `destacado` tinyint(1) NULL DEFAULT 1,
  `informacion_adicional` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `estado` tinyint(1) NULL DEFAULT 1,
  `meta_titulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `meta_descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `fecha_creacion` datetime NULL DEFAULT current_timestamp,
  `fecha_actualizacion` datetime NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `slug`(`slug` ASC) USING BTREE,
  INDEX `idx_slug`(`slug` ASC) USING BTREE,
  INDEX `idx_categoria`(`categoria_id` ASC) USING BTREE,
  INDEX `idx_estado`(`estado` ASC) USING BTREE,
  INDEX `idx_destacado`(`destacado` ASC) USING BTREE,
  INDEX `idx_precio`(`precio` ASC) USING BTREE,
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of productos
-- ----------------------------
INSERT INTO `productos` VALUES (1, 'Juego Verona', 'juego-verona', 'Escalera de acceso\r\nTrepadero espiral\r\n3 Paneles temáticos\r\nTubo comunicador con burbuja\r\nBajada de olas alt. 0.90 m', 0.00, NULL, 17, 0, 'EOS-PR-01-02-700x451.webp', 'EOS-PR-01-02', 0, 0, '', 1, NULL, NULL, '2026-10-13 14:57:07', '2026-10-16 16:30:37');
INSERT INTO `productos` VALUES (2, 'CIRCUITO 8', 'circuito-8', 'MEDIDAS: Largo: 210cm, Ancho: 73cm,  Alto: 44cm.\r\nMATERIAL: Tubo de acero galvanizado cedula 4, 3, 1/1, 1/4, Plastico de ingenieria nylamid.\r\n-Cables metálicos de inoxidables recubiertos de naylon.\r\n-Herrajes y conectores de aluminio con casquillos de cobre crimpados que soportan mas de 1 tonelada\r\nACABADO: Pintura electrostática ideal para exterior', 0.00, NULL, 18, 2, NULL, 'CIRC', 0, 0, '', 1, NULL, NULL, '2026-10-16 10:26:56', '2026-10-16 10:30:01');

-- ----------------------------
-- Table structure for recibos
-- ----------------------------
DROP TABLE IF EXISTS `recibos`;
CREATE TABLE `recibos`  (
  `Recibo_ID` int NOT NULL AUTO_INCREMENT,
  `Cotizacion_ID` int NULL DEFAULT NULL,
  `Cliente_ID` int NOT NULL,
  `Estatus_ID` int NOT NULL DEFAULT 1,
  `Folio` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'SP',
  `Usuario_ID` int NOT NULL,
  `Total_original` double(12, 2) NOT NULL,
  `Saldo_pendiente` double(12, 2) NOT NULL,
  `Aplica_IVA` tinyint NULL DEFAULT NULL,
  `Fecha_emision` datetime NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Recibo_ID`) USING BTREE,
  INDEX `idx_cliente_recibo`(`Cliente_ID` ASC) USING BTREE,
  INDEX `idx_saldo_recibo`(`Saldo_pendiente` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of recibos
-- ----------------------------
INSERT INTO `recibos` VALUES (1, 8, 5, 2, 'SP', 1, 2785.00, 0.00, 0, '2026-06-30 15:49:42');
INSERT INTO `recibos` VALUES (2, 9, 6, 1, 'SP', 1, 4000.00, 2000.00, 0, '2026-07-01 11:29:51');
INSERT INTO `recibos` VALUES (3, 14, 5, 1, 'SP', 1, 6918.00, 4918.00, 0, '2026-07-22 16:40:24');

-- ----------------------------
-- Table structure for recibos_detalles
-- ----------------------------
DROP TABLE IF EXISTS `recibos_detalles`;
CREATE TABLE `recibos_detalles`  (
  `ReciboD_ID` int NOT NULL AUTO_INCREMENT,
  `Recibo_ID` int NOT NULL,
  `Producto_ID` int NOT NULL,
  `Cantidad` int NOT NULL DEFAULT 1,
  `Precio_Unitario` decimal(12, 2) NOT NULL,
  `Subtotal` decimal(12, 2) NOT NULL,
  `Tipo_Partida` tinyint(1) NULL DEFAULT NULL COMMENT '0 es Producto / 1 es Servicio',
  PRIMARY KEY (`ReciboD_ID`) USING BTREE,
  INDEX `Recibo_ID`(`Recibo_ID` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of recibos_detalles
-- ----------------------------
INSERT INTO `recibos_detalles` VALUES (1, 1, 207, 1, 550.00, 550.00, 0);
INSERT INTO `recibos_detalles` VALUES (2, 1, 89, 1, 560.00, 560.00, 0);
INSERT INTO `recibos_detalles` VALUES (3, 1, 125, 25, 7.00, 175.00, 0);
INSERT INTO `recibos_detalles` VALUES (4, 1, 6, 1, 1500.00, 1500.00, 1);
INSERT INTO `recibos_detalles` VALUES (5, 2, 187, 1, 3500.00, 3500.00, 0);
INSERT INTO `recibos_detalles` VALUES (6, 2, 68, 1, 500.00, 500.00, 0);
INSERT INTO `recibos_detalles` VALUES (7, 3, 19, 1, 3368.00, 3368.00, 0);
INSERT INTO `recibos_detalles` VALUES (8, 3, 16, 1, 1800.00, 1800.00, 0);
INSERT INTO `recibos_detalles` VALUES (9, 3, 6, 1, 850.00, 850.00, 1);
INSERT INTO `recibos_detalles` VALUES (10, 3, 16, 1, 900.00, 900.00, 1);

-- ----------------------------
-- Table structure for recibos_pagos
-- ----------------------------
DROP TABLE IF EXISTS `recibos_pagos`;
CREATE TABLE `recibos_pagos`  (
  `ReciboP_ID` int NOT NULL AUTO_INCREMENT,
  `Recibo_ID` int NOT NULL,
  `Monto_Pagado` decimal(12, 2) NOT NULL,
  `Saldo_Pendiente` decimal(10, 2) NULL DEFAULT NULL,
  `Fecha_Pago` datetime NOT NULL DEFAULT current_timestamp,
  `MetodoPago_ID` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Nota_Recibo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Usuario_ID` int NOT NULL,
  PRIMARY KEY (`ReciboP_ID`) USING BTREE,
  INDEX `Recibo_ID`(`Recibo_ID` ASC) USING BTREE,
  INDEX `idx_fecha_pago`(`Fecha_Pago` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of recibos_pagos
-- ----------------------------
INSERT INTO `recibos_pagos` VALUES (1, 1, 2785.00, 0.00, '2026-06-30 15:29:49', '1', 'PAGÓ AL TERMINAR EL TRABAJO', 1);
INSERT INTO `recibos_pagos` VALUES (2, 2, 2000.00, 2000.00, '2026-07-01 11:01:45', '1', 'ANTICIPO DE EQUIPO DE PUNTO DE VENTA, EL RESTO PAGARÁ EN EL TRANSCURSO DEL MES DE AGOSTO ', 1);
INSERT INTO `recibos_pagos` VALUES (3, 3, 2000.00, 4918.00, '2026-07-22 16:40:24', '1', 'RECIBIMOS DOS MAQUINAS DE LA MARCA HP.\n1.-REQUIERE PROGRAMA ELEVENT.\n2.-REQUIERE CAMBIO DE DISCO Y PROGRAMA ELEVENTA.', 1);

-- ----------------------------
-- Table structure for servicios
-- ----------------------------
DROP TABLE IF EXISTS `servicios`;
CREATE TABLE `servicios`  (
  `Servicio_ID` int NOT NULL AUTO_INCREMENT,
  `Nombre_Servicio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `Precio_Unitario` float NULL DEFAULT NULL,
  `Activo` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`Servicio_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of servicios
-- ----------------------------
INSERT INTO `servicios` VALUES (2, 'instalacion en computadora', 750, 1);
INSERT INTO `servicios` VALUES (3, 'dvr', NULL, 1);
INSERT INTO `servicios` VALUES (4, 'Instalacion en DVR', NULL, 1);
INSERT INTO `servicios` VALUES (5, 'INSTALACION', NULL, 1);
INSERT INTO `servicios` VALUES (6, 'MANO DE OBRA', NULL, 1);
INSERT INTO `servicios` VALUES (7, 'INSTALACIO', NULL, 1);
INSERT INTO `servicios` VALUES (8, 'SERVICIO', NULL, 1);
INSERT INTO `servicios` VALUES (9, 'CANALETAS', NULL, 1);

-- ----------------------------
-- Table structure for servicios_productos
-- ----------------------------
DROP TABLE IF EXISTS `servicios_productos`;
CREATE TABLE `servicios_productos`  (
  `ServProducto_ID` int NOT NULL AUTO_INCREMENT,
  `Producto_ID` int NULL DEFAULT NULL,
  `Servicio_ID` int NULL DEFAULT NULL,
  `Activo` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`ServProducto_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = FIXED;

-- ----------------------------
-- Records of servicios_productos
-- ----------------------------
INSERT INTO `servicios_productos` VALUES (1, 1, 4, 1);
INSERT INTO `servicios_productos` VALUES (2, 163, 5, 1);
INSERT INTO `servicios_productos` VALUES (3, 155, 5, 1);

-- ----------------------------
-- Table structure for sesiones
-- ----------------------------
DROP TABLE IF EXISTS `sesiones`;
CREATE TABLE `sesiones`  (
  `id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `datos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `tiempo` int NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_tiempo`(`tiempo` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sesiones
-- ----------------------------

-- ----------------------------
-- Table structure for subcategorias
-- ----------------------------
DROP TABLE IF EXISTS `subcategorias`;
CREATE TABLE `subcategorias`  (
  `Subcategoria_ID` int NOT NULL AUTO_INCREMENT,
  `Subcategoria` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `slug_subcategoria` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `estado` tinyint NULL DEFAULT 1,
  PRIMARY KEY (`Subcategoria_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of subcategorias
-- ----------------------------
INSERT INTO `subcategorias` VALUES (1, 'Kioskos', 'kioskos', 'subcategoria_6acb080a8dd843.75572567.png', 1);
INSERT INTO `subcategorias` VALUES (2, 'Circuitos', 'circuitos', 'subcategoria_6ad24fc30708a5.52192556.jpg', 1);

-- ----------------------------
-- Table structure for tbl_banner
-- ----------------------------
DROP TABLE IF EXISTS `tbl_banner`;
CREATE TABLE `tbl_banner`  (
  `Banner_ID` int NOT NULL AUTO_INCREMENT,
  `Titulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Subtitulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Titulo_Boton` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Url_Boton` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Activo` tinyint NULL DEFAULT 1,
  PRIMARY KEY (`Banner_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of tbl_banner
-- ----------------------------
INSERT INTO `tbl_banner` VALUES (1, 'Soluciones inteligentes', '', '', '', 'banner_6a134ba073f2f6.37152967.png', 1);
INSERT INTO `tbl_banner` VALUES (2, 'Conectividad, rendimiento y soporte', NULL, 'Busco un punto de venta', 'whatsapp://send?phone=9932369500', 'banner-2.webp', 1);

-- ----------------------------
-- Table structure for tbl_logosBussines
-- ----------------------------
DROP TABLE IF EXISTS `tbl_logosBussines`;
CREATE TABLE `tbl_logosBussines`  (
  `Cliente_ID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `Logo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `Estado` tinyint(1) NULL DEFAULT NULL,
  PRIMARY KEY (`Cliente_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tbl_logosBussines
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
