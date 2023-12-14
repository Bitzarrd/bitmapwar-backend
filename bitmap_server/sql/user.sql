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

 Date: 14/12/2023 16:39:28
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `address` varchar(255) NOT NULL,
  `profit` varchar(255) NOT NULL DEFAULT '0',
  `virus` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
