CREATE TABLE `subscriber` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mail` varchar(255) NOT NULL,
  `contact` int(11) NOT NULL,
  `news` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `branch` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_branch_mail` (`branch`,`mail`),
  CONSTRAINT `fk_branch_subscribe` FOREIGN KEY (`branch`) REFERENCES `branch` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;