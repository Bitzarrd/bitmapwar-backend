/*
 Navicat Premium Data Transfer

 Source Server         : bitmap_test
 Source Server Type    : MySQL
 Source Server Version : 50743 (5.7.43-log)
 Source Host           : 34.225.3.60:3306
 Source Schema         : bitmap_test

 Target Server Type    : MySQL
 Target Server Version : 50743 (5.7.43-log)
 File Encoding         : 65001

 Date: 27/02/2024 17:03:54
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
  `land` bigint(20) NOT NULL DEFAULT '0',
  `total_profit` varchar(255) NOT NULL DEFAULT '0',
  `jackpot` varchar(255) NOT NULL DEFAULT '0',
  `jackpot_bw` varchar(255) NOT NULL DEFAULT '0',
  `total_purchase_virus` bigint(20) NOT NULL DEFAULT '0',
  `public_key` varchar(255) NOT NULL DEFAULT '',
  `merlin_address` varchar(255) NOT NULL DEFAULT '',
  `points` int(11) GENERATED ALWAYS AS ((`land` + (`total_purchase_virus` * 10000))) VIRTUAL NOT NULL,
  PRIMARY KEY (`address`),
  UNIQUE KEY `user_public_key` (`public_key`),
  UNIQUE KEY `user_merlin_address` (`merlin_address`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
