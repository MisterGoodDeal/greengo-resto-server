-- MySQL dump 10.13  Distrib 8.0.28, for macos11 (x86_64)
--
-- Host: 82.165.49.9    Database: serial_laucher
-- ------------------------------------------------------
-- Server version	8.0.25-0ubuntu0.20.04.1

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
-- Table structure for table `FavortiteLunchPlaces`
--

DROP TABLE IF EXISTS `FavortiteLunchPlaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `FavortiteLunchPlaces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fk_user` int NOT NULL,
  `fk_lunch_place` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_flp_idx` (`fk_user`),
  KEY `fk_lp_flp_idx` (`fk_lunch_place`),
  CONSTRAINT `fk_lp_flp` FOREIGN KEY (`fk_lunch_place`) REFERENCES `LunchPlaces` (`id`),
  CONSTRAINT `fk_user_flp` FOREIGN KEY (`fk_user`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FavortiteLunchPlaces`
--

LOCK TABLES `FavortiteLunchPlaces` WRITE;
/*!40000 ALTER TABLE `FavortiteLunchPlaces` DISABLE KEYS */;
/*!40000 ALTER TABLE `FavortiteLunchPlaces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LunchCountrySpeciality`
--

DROP TABLE IF EXISTS `LunchCountrySpeciality`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `LunchCountrySpeciality` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LunchCountrySpeciality`
--

LOCK TABLES `LunchCountrySpeciality` WRITE;
/*!40000 ALTER TABLE `LunchCountrySpeciality` DISABLE KEYS */;
/*!40000 ALTER TABLE `LunchCountrySpeciality` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LunchGroups`
--

DROP TABLE IF EXISTS `LunchGroups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `LunchGroups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `image` text NOT NULL,
  `group_key` varchar(45) DEFAULT NULL,
  `fk_user` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_launch_groups_idx` (`fk_user`),
  CONSTRAINT `fk_user_launch_groups` FOREIGN KEY (`fk_user`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LunchGroups`
--

LOCK TABLES `LunchGroups` WRITE;
/*!40000 ALTER TABLE `LunchGroups` DISABLE KEYS */;
/*!40000 ALTER TABLE `LunchGroups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LunchPlaces`
--

DROP TABLE IF EXISTS `LunchPlaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `LunchPlaces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fk_lunch_group` int NOT NULL,
  `fk_user` int NOT NULL,
  `fk_country_speciality` int NOT NULL,
  `lat` float NOT NULL,
  `lng` float NOT NULL,
  `name` varchar(255) NOT NULL,
  `rating` float NOT NULL,
  `price_range` int NOT NULL,
  `can_bring_reusable_contents` tinyint NOT NULL,
  `image` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_lg_lp_idx` (`fk_lunch_group`),
  KEY `fk_user_lp_idx` (`fk_user`),
  KEY `fk_cs_lp_idx` (`fk_country_speciality`),
  CONSTRAINT `fk_cs_lp` FOREIGN KEY (`fk_country_speciality`) REFERENCES `LunchCountrySpeciality` (`id`),
  CONSTRAINT `fk_lg_lp` FOREIGN KEY (`fk_lunch_group`) REFERENCES `LunchGroups` (`id`),
  CONSTRAINT `fk_user_lp` FOREIGN KEY (`fk_user`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LunchPlaces`
--

LOCK TABLES `LunchPlaces` WRITE;
/*!40000 ALTER TABLE `LunchPlaces` DISABLE KEYS */;
/*!40000 ALTER TABLE `LunchPlaces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LunchPlacesComments`
--

DROP TABLE IF EXISTS `LunchPlacesComments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `LunchPlacesComments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fk_user` int NOT NULL,
  `fk_lunch_place` int NOT NULL,
  `comment` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_user_lpc_idx` (`fk_user`),
  KEY `fk_lp_lpc_idx` (`fk_lunch_place`),
  CONSTRAINT `fk_lp_lpc` FOREIGN KEY (`fk_lunch_place`) REFERENCES `LunchPlaces` (`id`),
  CONSTRAINT `fk_user_lpc` FOREIGN KEY (`fk_user`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LunchPlacesComments`
--

LOCK TABLES `LunchPlacesComments` WRITE;
/*!40000 ALTER TABLE `LunchPlacesComments` DISABLE KEYS */;
/*!40000 ALTER TABLE `LunchPlacesComments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(45) NOT NULL,
  `lastname` varchar(45) NOT NULL,
  `email` text NOT NULL,
  `password` text NOT NULL,
  `profile_picture` text NOT NULL,
  `oauth_service` varchar(45) DEFAULT NULL,
  `oauth_service_id` varchar(255) DEFAULT NULL,
  `token` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'Milan','Camus','mcamus@condorcet93.fr','$2b$10$YZlKrsTue981vnY86Z23j.0AniSc3Mb5b5wpjBWCMH7LHugmoRc3e','https://i.imgur.com/3QHNYVz.jpg',NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZmlyc3RuYW1lIjoiTWlsYW4iLCJsYXN0bmFtZSI6IkNhbXVzIiwiZW1haWwiOiJtY2FtdXNAY29uZG9yY2V0OTMuZnIiLCJwcm9maWxlX3BpY3R1cmUiOiJodHRwczovL2kuaW1ndXIuY29tLzNRSE5ZVnouanBnIiwiaWF0IjoxNjUxNTk0MzA5LCJleHAiOjE2NTkzNzAzMDl9.5taUHtSkAgS1HOdv3f6FCM7OKsPhnh3tmArLC0s9AOk','2022-04-24 12:59:24','2022-04-24 12:59:24',NULL),(3,'Milan','Camus','mcamus@test.fr','$2b$10$EirT76TgwSEj9xk9SgzjGuu6tb4hCJ39BI3KQr3eopbL7s4zH49/2','https://i.imgur.com/XbOiJiK.jpg','ios','12345','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZmlyc3RuYW1lIjoiTWlsYW4iLCJsYXN0bmFtZSI6IkNhbXVzIiwiZW1haWwiOiJtY2FtdXNAdGVzdC5mciIsInByb2ZpbGVfcGljdHVyZSI6Imh0dHBzOi8vaS5pbWd1ci5jb20vWGJPaUppSy5qcGciLCJpYXQiOjE2NTA4MTQzMjUsImV4cCI6MTY1ODU5MDMyNX0.hJ5Gj9eT7M2zpgqbnbsQuy-V4HRO3l5RnRlTOGITR2k','2022-04-24 15:20:27','2022-04-24 15:20:27',NULL);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UsersLauchGroupsAssoc`
--

DROP TABLE IF EXISTS `UsersLauchGroupsAssoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `UsersLauchGroupsAssoc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fk_user` int NOT NULL,
  `fk_lunch_group` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_users_lga_idx` (`fk_user`),
  KEY `fk_lauch_groups_lga_idx` (`fk_lunch_group`),
  CONSTRAINT `fk_lauch_groups_lga` FOREIGN KEY (`fk_lunch_group`) REFERENCES `LunchGroups` (`id`),
  CONSTRAINT `fk_users_lga` FOREIGN KEY (`fk_user`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UsersLauchGroupsAssoc`
--

LOCK TABLES `UsersLauchGroupsAssoc` WRITE;
/*!40000 ALTER TABLE `UsersLauchGroupsAssoc` DISABLE KEYS */;
/*!40000 ALTER TABLE `UsersLauchGroupsAssoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UsersVisitCount`
--

DROP TABLE IF EXISTS `UsersVisitCount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `UsersVisitCount` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fk_user` int NOT NULL,
  `fk_lunch_place` int NOT NULL,
  `count` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_uvc_idx` (`fk_user`),
  KEY `fk_lp_uvc_idx` (`fk_lunch_place`),
  CONSTRAINT `fk_lp_uvc` FOREIGN KEY (`fk_lunch_place`) REFERENCES `LunchPlaces` (`id`),
  CONSTRAINT `fk_user_uvc` FOREIGN KEY (`fk_user`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UsersVisitCount`
--

LOCK TABLES `UsersVisitCount` WRITE;
/*!40000 ALTER TABLE `UsersVisitCount` DISABLE KEYS */;
/*!40000 ALTER TABLE `UsersVisitCount` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-05-31 18:58:24
