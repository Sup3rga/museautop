CREATE TABLE `mailing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client` int(11) NOT NULL,
  `object` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `created_at` datetime NOT NULL,
  `post_on` datetime NOT NULL,
  `posted_by` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_subs_cli` (`client`),
  KEY `fk_man_mail` (`posted_by`),
  CONSTRAINT `fk_man_mail` FOREIGN KEY (`posted_by`) REFERENCES `manager` (`id`),
  CONSTRAINT `fk_subs_cli` FOREIGN KEY (`client`) REFERENCES `subscriber` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;