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

 Date: 11/03/2024 18:30:38
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_historical_benefit
-- ----------------------------
DROP TABLE IF EXISTS `user_historical_benefit`;
CREATE TABLE `user_historical_benefit` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `owner` varchar(255) NOT NULL,
  `create_time` int(10) NOT NULL,
  `team` varchar(255) NOT NULL,
  `init_virus` int(10) NOT NULL,
  `profit` varchar(255) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
