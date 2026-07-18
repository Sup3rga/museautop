CREATE TABLE `articles_pictures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `img` int(11) NOT NULL,
  `article` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_art_img` (`img`),
  KEY `fk_art_id` (`article`),
  CONSTRAINT `fk_art_id` FOREIGN KEY (`article`) REFERENCES `articles` (`id`),
  CONSTRAINT `fk_art_img` FOREIGN KEY (`img`) REFERENCES `pictures` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;insert into `articles_pictures` (`article`, `id`, `img`) values (5, 2, 4);
insert into `articles_pictures` (`article`, `id`, `img`) values (4, 3, 5);
insert into `articles_pictures` (`article`, `id`, `img`) values (3, 4, 6);
