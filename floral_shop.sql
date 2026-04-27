-- MySQL dump compatible version
-- Database: floral_shop (Full Data Dump)
-- ------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Create Database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `floral_shop` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `floral_shop`;

-- Table structure for table `admin_users`
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `admin_users` WRITE;
INSERT INTO `admin_users` VALUES (1,'admin@florabelle.rw','$2b$12$ao1nw77rMbVGMGAFJPgXS.NPysBVfHUoKRj8Hccp9DZSSkhckYQ86','2026-04-11 22:40:08');
UNLOCK TABLES;

-- Table structure for table `categories`
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) NOT NULL,
  `name` varchar(150) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `emoji` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `categories` WRITE;
INSERT INTO `categories` VALUES (1,'love','Love & Romance','/assets/products/roses-pastel.jpg','❤️','2026-04-04 12:51:56','2026-04-04 12:51:56'),(2,'birthday','Birthday','/assets/products/birthday-cake.jpg','🎂','2026-04-04 12:51:56','2026-04-04 12:51:56'),(3,'wedding','Wedding','/assets/products/wedding.jpg','💒','2026-04-04 12:51:56','2026-04-04 12:51:56'),(4,'sympathy','Sympathy','/assets/products/roses-pastel.jpg','🕊️','2026-04-04 12:51:56','2026-04-04 12:51:56'),(5,'congratulations','Congratulations','/assets/products/garden-tribute.jpg','🎉','2026-04-04 12:51:56','2026-04-04 12:51:56'),(6,'everyday','Everyday','/assets/products/lily-everyday.jpg','🌸','2026-04-04 12:51:56','2026-04-04 12:51:56'),(7,'liquor','Liquor & Wine','/assets/products/red-wine.jpg','🍷','2026-04-04 12:51:56','2026-04-04 12:51:56'),(8,'jewelry','Jewelry','/assets/products/gold-necklace.jpg','💎','2026-04-04 12:51:56','2026-04-04 12:51:56'),(9,'stuffed-toys','Stuffed Toys','/assets/products/teddy-bear.jpg','🧸','2026-04-04 12:51:56','2026-04-04 12:51:56'),(10,'cupcakes','Cupcakes','/assets/products/cupcakes-rose.jpg','🧁','2026-04-04 12:51:56','2026-04-04 12:51:56'),(11,'cakes','Cakes','/assets/products/cake-birthday.jpg','🎂','2026-04-04 12:51:56','2026-04-04 12:51:56');
UNLOCK TABLES;

-- Table structure for table `customers`
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(64) DEFAULT NULL,
  `first_order_at` datetime DEFAULT NULL,
  `last_order_at` datetime DEFAULT NULL,
  `order_count` int NOT NULL DEFAULT '0',
  `total_spent` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customers_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `customers` WRITE;
INSERT INTO `customers` VALUES (1,'nadegee11@gmail.com','Nadege','0789999999','2026-04-04 03:08:08','2026-04-04 03:08:08',1,37000.00),(2,'nadege33@gmail.com','Nadege','07866666','2026-04-04 03:09:14','2026-04-04 03:09:14',1,95000.00),(3,'mugisha1@gmail.com','Mugisha','0788888','2026-04-11 13:22:56','2026-04-11 13:22:56',1,34000.00),(4,'irakoze1@gmail.com','Irakoze','0788888888','2026-04-13 01:18:34','2026-04-13 01:18:37',2,190000.00);
UNLOCK TABLES;

-- Table structure for table `newsletter_subscribers`
DROP TABLE IF EXISTS `newsletter_subscribers`;
CREATE TABLE `newsletter_subscribers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `source` varchar(100) DEFAULT 'homepage',
  `status` enum('active','unsubscribed','bounced') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `newsletter_subscribers` WRITE;
INSERT INTO `newsletter_subscribers` VALUES (1,'ishimwe@gmail.com','homepage','active','2026-03-24 12:12:57','2026-03-24 12:12:57'),(2,'karabonadege9996@gmail.com','homepage','active','2026-03-27 12:58:08','2026-03-27 12:58:08');
UNLOCK TABLES;

-- Table structure for table `orders`
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(150) NOT NULL,
  `customer_email` varchar(150) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `recipient_name` varchar(150) NOT NULL,
  `recipient_phone` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL DEFAULT 'Kigali',
  `delivery_date` date NOT NULL,
  `delivery_time_slot` enum('morning','afternoon','evening') NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `delivery_fee` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'RWF',
  `payment_method` varchar(32) NOT NULL,
  `payment_status` varchar(64) NOT NULL DEFAULT 'pending',
  `status` enum('pending','confirmed','preparing','out_for_delivery','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `orders` WRITE;
INSERT INTO `orders` VALUES (1,'Nadege','nadegee11@gmail.com','0789999999','Diamant','078666666666','Kamonyi','Kamonyi','2026-04-04','morning',35000.00,2000.00,37000.00,'RWF','momo','pending','pending','2026-04-04 13:08:08','2026-04-04 13:08:08'),(2,'Nadege','nadege33@gmail.com','07866666','Diamant','078888888','Kamonyi','Kamonyi','2026-04-05','morning',95000.00,0.00,95000.00,'RWF','momo','pending','pending','2026-04-04 13:09:14','2026-04-04 13:09:14'),(3,'Mugisha','mugisha1@gmail.com','0788888','Ineza ','0789999','Kamonyi','Kigali','2026-04-24','morning',32000.00,2000.00,34000.00,'RWF','card','paid','pending','2026-04-11 23:22:56','2026-04-11 23:24:17'),(4,'Irakoze','irakoze1@gmail.com','0788888888','Lysa','07666','Kamonyi','Kigali','2026-04-13','morning',95000.00,0.00,95000.00,'RWF','card','paid','delivered','2026-04-13 11:18:34','2026-04-13 11:22:16'),(5,'Irakoze','irakoze1@gmail.com','0788888888','Lysa','07666','Kamonyi','Kigali','2026-04-13','morning',95000.00,0.00,95000.00,'RWF','card','awaiting_payment','pending','2026-04-13 11:18:37','2026-04-13 11:18:37');
UNLOCK TABLES;

-- Table structure for table `products`
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `flower_type` varchar(100) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `review_count` int DEFAULT '0',
  `in_stock` tinyint(1) DEFAULT '1',
  `badge` varchar(50) DEFAULT NULL,
  `short_description` varchar(255) DEFAULT NULL,
  `description` text,
  `main_image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `products` WRITE;
INSERT INTO `products` VALUES (1,1,'Red Rose Romance Bouquet','red-rose-romance-bouquet',35000.00,45000.00,'Roses',4.90,156,1,'Best Seller','24 premium long-stem red roses, hand-tied with satin ribbon.','Express your deepest love with our signature bouquet of 24 premium long-stem red roses.','/assets/products/red-roses.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(2,2,'Sunshine Sunflower Arrangement','sunshine-sunflower-arrangement',28000.00,NULL,'Sunflowers',4.70,89,1,'Popular','Bright sunflowers to light up any birthday celebration.','A vibrant arrangement of fresh sunflowers.','/assets/products/sunflowers.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(3,3,'Elegant White Lily Cascade','elegant-white-lily-cascade',48000.00,58000.00,'Lilies',4.80,67,1,'Premium','Stunning white lilies for weddings.','An exquisite cascade of pure white Oriental lilies.','/assets/products/white-lily.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(4,4,'Peaceful Garden Tribute','peaceful-garden-tribute',42000.00,NULL,'Mixed Bouquet',4.90,43,1,NULL,'A gentle arrangement for remembrance.','A serene and thoughtful arrangement of white roses.','/assets/products/garden-tribute.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(5,2,'Pink Paradise Mixed Bouquet','pink-paradise-mixed-bouquet',32000.00,40000.00,'Mixed Bouquet',4.60,112,1,'Sale','A vibrant mix of pink roses.','Celebrate in style with this mixed bouquet.','/assets/products/pink-mixed.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(6,5,'Purple Orchid Elegance','purple-orchid-elegance',55000.00,NULL,'Orchids',4.80,54,1,'Luxury','Exotic purple orchids in a ceramic vase.','A stunning display of Phalaenopsis orchids.','/assets/products/orchid.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(7,6,'Pastel Tulip Dream','pastel-tulip-dream',30000.00,NULL,'Tulips',4.50,78,1,NULL,'Soft pastel tulips wrapped in kraft paper.','A charming bouquet of fresh pastel tulips.','/assets/products/roses-pastel.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(8,1,'Romantic Rose & Lily Duo','romantic-rose-lily-duo',45000.00,55000.00,'Mixed Bouquet',4.70,91,1,'Sale','Roses and lilies together in a romantic arrangement.','The perfect combination of passion and purity.','/assets/products/lily-everyday.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(9,6,'Bright Carnation Burst','bright-carnation-burst',18000.00,NULL,'Carnations',4.30,65,1,NULL,'Colorful carnations for a cheerful vibe.','A budget-friendly bunch of mixed carnations.','/assets/products/birthday-cake.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(10,3,'Grand Wedding Centerpiece','grand-wedding-centerpiece',85000.00,100000.00,'Mixed Bouquet',4.90,34,1,'Premium','Luxurious centerpiece for your special day.','A grand floral centerpiece featuring white roses.','/assets/products/wedding.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(11,5,'Blue Hydrangea Cloud','blue-hydrangea-cloud',38000.00,NULL,'Hydrangeas',4.60,47,0,NULL,'Dreamy blue hydrangeas in a glass vase.','A cloud-like arrangement of beautiful hydrangeas.','/assets/products/hydrangea.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(12,1,'Classic Red Rose Box','classic-red-rose-box',50000.00,NULL,'Roses',4.80,128,1,'New','Roses in a luxury hat box.','Premium red roses elegantly arranged.','/assets/products/rose-box.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(13,7,'Moët & Chandon Brut Imperial','mot-chandon-brut-imperial',65000.00,NULL,'Champagne',4.90,42,1,'Premium','Iconic French champagne.','Bright fruitiness and a seductive palate.','/assets/products/champagne.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(14,7,'Amarula Cream Liqueur','amarula-cream-liqueur',22000.00,NULL,'Cream Liqueur',4.50,67,1,NULL,'Smooth African cream liqueur.','Crafted from the exotic marula fruit.','/assets/products/amarula.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(15,7,'Johnnie Walker Black Label','johnnie-walker-black-label',48000.00,55000.00,'Whisky',4.70,53,1,'Sale','Iconic blended Scotch whisky.','A masterful blend of whiskies aged at least 12 years.','/assets/products/whisky.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(16,7,'Cape Mentelle Cabernet Sauvignon','cape-mentelle-cabernet-sauvignon',35000.00,NULL,'Red Wine',4.60,29,1,NULL,'Full-bodied red wine.','Distinguished Cabernet Sauvignon from Australia.','/assets/products/red-wine.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(17,8,'Gold Heart Pendant Necklace','gold-heart-pendant-necklace',45000.00,NULL,'Necklace',4.80,84,1,'Best Seller','18k gold-plated heart pendant.','A timeless gold heart pendant necklace.','/assets/products/gold-necklace.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(18,8,'Pearl Drop Earrings','pearl-drop-earrings',28000.00,NULL,'Earrings',4.70,61,1,NULL,'Freshwater pearl earrings.','Elegant freshwater pearl drop earrings.','/assets/products/pearl-earrings.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(19,8,'Rose Gold Crystal Bracelet','rose-gold-crystal-bracelet',32000.00,40000.00,'Bracelet',4.60,39,1,'Sale','Sparkling crystal bracelet.','A stunning rose gold bracelet with crystals.','/assets/products/bracelet.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(20,9,'Classic Red Teddy Bear','classic-red-teddy-bear',18000.00,NULL,'Teddy Bear',4.80,132,1,'Best Seller','Soft, cuddly teddy bear.','This adorable plush teddy bear is perfect.','/assets/products/teddy-bear.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(21,9,'Giant Pink Bunny Plush','giant-pink-bunny-plush',25000.00,NULL,'Plush Animal',4.60,47,1,'New','Adorable giant pink bunny.','Oversized pink bunny plush is impossibly soft.','/assets/products/bunny-plush.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(22,9,'Love Bear with Heart Pillow','love-bear-with-heart-pillow',22000.00,NULL,'Teddy Bear',4.70,88,1,'Popular','Plush bear holding an \'I Love You\' cushion.','Say \'I Love You\' with this charming teddy bear.','/assets/products/love-bear.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(23,10,'Rose Frosting Chocolate Cupcakes','rose-frosting-chocolate-cupcakes',15000.00,NULL,'Cupcakes',4.80,76,1,'Best Seller','Rich chocolate cupcakes with pink frosting.','Indulge in our handcrafted chocolate cupcakes.','/assets/products/cupcakes-rose.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(24,10,'Assorted Celebration Cupcakes','assorted-celebration-cupcakes',18000.00,NULL,'Cupcakes',4.60,54,1,'Popular','Colorful assorted cupcakes.','A delightful box of assorted gourmet cupcakes.','/assets/products/cupcakes-assorted.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(25,10,'Red Velvet Love Cupcakes','red-velvet-love-cupcakes',16000.00,NULL,'Cupcakes',4.90,93,1,'New','Classic red velvet cupcakes.','Signature red velvet cupcakes feature moist cake.','/assets/products/cupcakes-redvelvet.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(26,11,'Elegant Floral Wedding Cake','elegant-floral-wedding-cake',95000.00,NULL,'Wedding Cake',4.90,28,1,'Premium','Two-tier wedding cake with fresh flowers.','A stunning two-tier wedding cake.','/assets/products/cake-wedding.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(27,11,'Birthday Celebration Cake','birthday-celebration-cake',35000.00,NULL,'Birthday Cake',4.70,112,1,'Popular','Festive birthday cake with sprinkles.','Make birthdays extra special with our cake.','/assets/products/cake-birthday.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56'),(28,11,'Dark Chocolate Berry Cake','dark-chocolate-berry-cake',42000.00,50000.00,'Chocolate Cake',4.80,67,1,'Sale','Rich chocolate cake with fresh berries.','An irresistible dark chocolate layer cake.','/assets/products/cake-chocolate.jpg','2026-04-04 12:51:56','2026-04-04 12:51:56');
UNLOCK TABLES;

-- Table structure for table `order_items`
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name_snapshot` varchar(200) NOT NULL,
  `size_label` varchar(100) DEFAULT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `custom_message` varchar(255) DEFAULT NULL,
  `image_url` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_items_order` (`order_id`),
  KEY `fk_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `order_items` WRITE;
INSERT INTO `order_items` VALUES (1,1,27,'Birthday Celebration Cake','Small (serves 8)',35000.00,1,NULL,'/assets/products/cake-birthday.jpg'),(2,2,26,'Elegant Floral Wedding Cake','2-Tier (serves 30)',95000.00,1,NULL,'/assets/products/cake-wedding.jpg'),(3,3,19,'Rose Gold Crystal Bracelet','Standard (17cm)',32000.00,1,NULL,'/assets/products/bracelet.jpg'),(4,4,26,'Elegant Floral Wedding Cake','2-Tier (serves 30)',95000.00,1,NULL,'/assets/products/cake-wedding.jpg'),(5,5,26,'Elegant Floral Wedding Cake','2-Tier (serves 30)',95000.00,1,NULL,'/assets/products/cake-wedding.jpg');
UNLOCK TABLES;

-- Table structure for table `product_images`
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `position` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_product_images_product` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `product_images` WRITE;
INSERT INTO `product_images` VALUES (1,1,'/assets/products/red-roses.jpg',0),(2,1,'/assets/products/roses-pastel.jpg',1),(3,1,'/assets/products/pink-mixed.jpg',2),(4,2,'/assets/products/sunflowers.jpg',0),(5,2,'/assets/products/hydrangea.jpg',1),(6,3,'/assets/products/white-lily.jpg',0),(7,3,'/assets/products/lily-everyday.jpg',1),(8,4,'/assets/products/garden-tribute.jpg',0),(9,5,'/assets/products/pink-mixed.jpg',0),(10,5,'/assets/products/roses-pastel.jpg',1),(11,6,'/assets/products/orchid.jpg',0),(12,7,'/assets/products/roses-pastel.jpg',0),(13,8,'/assets/products/lily-everyday.jpg',0),(14,8,'/assets/products/red-roses.jpg',1),(15,9,'/assets/products/birthday-cake.jpg',0),(16,10,'/assets/products/wedding.jpg',0),(17,11,'/assets/products/hydrangea.jpg',0),(18,12,'/assets/products/rose-box.jpg',0),(19,13,'/assets/products/champagne.jpg',0),(20,14,'/assets/products/amarula.jpg',0),(21,15,'/assets/products/whisky.jpg',0),(22,16,'/assets/products/red-wine.jpg',0),(23,17,'/assets/products/gold-necklace.jpg',0),(24,18,'/assets/products/pearl-earrings.jpg',0),(25,19,'/assets/products/bracelet.jpg',0),(26,20,'/assets/products/teddy-bear.jpg',0),(27,21,'/assets/products/bunny-plush.jpg',0),(28,22,'/assets/products/love-bear.jpg',0),(29,23,'/assets/products/cupcakes-rose.jpg',0),(30,24,'/assets/products/cupcakes-assorted.jpg',0),(31,25,'/assets/products/cupcakes-redvelvet.jpg',0),(32,26,'/assets/products/cake-wedding.jpg',0),(33,27,'/assets/products/cake-birthday.jpg',0),(34,28,'/assets/products/cake-chocolate.jpg',0);
UNLOCK TABLES;

-- Table structure for table `product_sizes`
DROP TABLE IF EXISTS `product_sizes`;
CREATE TABLE `product_sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `label` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_product_sizes_product` (`product_id`),
  CONSTRAINT `fk_product_sizes_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `product_sizes` WRITE;
INSERT INTO `product_sizes` VALUES (1,1,'Small (12 roses)',25000.00),(2,1,'Medium (24 roses)',35000.00),(3,1,'Large (50 roses)',65000.00),(4,2,'Small (5 stems)',18000.00),(5,2,'Medium (10 stems)',28000.00),(6,2,'Large (15 stems)',42000.00),(7,3,'Small',35000.00),(8,3,'Medium',48000.00),(9,3,'Large',72000.00),(10,4,'Standard',42000.00),(11,4,'Deluxe',65000.00),(12,5,'Small',22000.00),(13,5,'Medium',32000.00),(14,5,'Large',50000.00),(15,6,'Single Stem',35000.00),(16,6,'Double Stem',55000.00),(17,6,'Triple Stem',80000.00),(18,7,'Small (10 tulips)',20000.00),(19,7,'Medium (20 tulips)',30000.00),(20,7,'Large (30 tulips)',45000.00),(21,8,'Standard',45000.00),(22,8,'Premium',68000.00),(23,9,'Small',12000.00),(24,9,'Medium',18000.00),(25,9,'Large',28000.00),(26,10,'Standard',85000.00),(27,10,'Grand',120000.00),(28,11,'Small',28000.00),(29,11,'Medium',38000.00),(30,11,'Large',55000.00),(31,12,'Petite (12 roses)',35000.00),(32,12,'Classic (25 roses)',50000.00),(33,12,'Grand (50 roses)',90000.00),(34,13,'375ml',38000.00),(35,13,'750ml',65000.00),(36,13,'Magnum (1.5L)',120000.00),(37,14,'375ml',14000.00),(38,14,'750ml',22000.00),(39,15,'750ml',48000.00),(40,15,'1L',62000.00),(41,16,'750ml',35000.00),(42,17,'16-inch chain',42000.00),(43,17,'18-inch chain',45000.00),(44,17,'20-inch chain',48000.00),(45,18,'Standard',28000.00),(46,19,'Standard (17cm)',32000.00),(47,19,'Large (19cm)',34000.00),(48,20,'Small (20cm)',12000.00),(49,20,'Medium (30cm)',18000.00),(50,20,'Large (50cm)',35000.00),(51,21,'Medium (35cm)',25000.00),(52,21,'Giant (60cm)',45000.00),(53,22,'Standard (25cm)',22000.00),(54,22,'Large (40cm)',38000.00),(55,23,'Box of 4',10000.00),(56,23,'Box of 6',15000.00),(57,23,'Box of 12',28000.00),(58,24,'Box of 6',18000.00),(59,24,'Box of 12',32000.00),(60,25,'Box of 4',12000.00),(61,25,'Box of 6',16000.00),(62,25,'Box of 12',30000.00),(63,26,'2-Tier (serves 30)',95000.00),(64,26,'3-Tier (serves 60)',150000.00),(65,27,'Small (serves 8)',25000.00),(66,27,'Medium (serves 16)',35000.00),(67,27,'Large (serves 24)',50000.00),(68,28,'Small (serves 8)',30000.00),(69,28,'Medium (serves 16)',42000.00),(70,28,'Large (serves 24)',60000.00);
UNLOCK TABLES;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;