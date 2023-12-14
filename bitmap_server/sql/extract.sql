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

 Date: 14/12/2023 16:39:00
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for extract
-- ----------------------------
DROP TABLE IF EXISTS `extract`;
CREATE TABLE `extract` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `address` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL,
  `txid` varchar(255) NOT NULL DEFAULT '',
  `status` int(11) NOT NULL DEFAULT '0',
  `create_time` int(11) NOT NULL,
  `signature` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
