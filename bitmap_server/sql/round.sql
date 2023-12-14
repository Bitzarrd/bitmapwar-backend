/*
 Navicat Premium Data Transfer

 Source Server         : bitmap
 Source Server Type    : MySQL
 Source Server Version : 50743 (5.7.43-log)
 Source Host           : 34.225.3.60:3306
 Source Schema         : bitmap

 Target Server Type    : MySQL
 Target Server Version : 50743 (5.7.43-log)
 File Encoding         : 65001

 Date: 14/12/2023 16:39:18
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for round
-- ----------------------------
DROP TABLE IF EXISTS `round`;
CREATE TABLE `round` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `end_time` int(11) NOT NULL,
  `rank` json NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
