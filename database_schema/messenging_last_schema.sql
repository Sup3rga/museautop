CREATE TABLE `messenging` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `client` int(11) NOT NULL,
  `message` text NOT NULL,
  `post_on` datetime NOT NULL,
  `read_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sub_cli_mess` (`client`),
  KEY `fk_man_mess` (`read_by`),
  CONSTRAINT `fk_man_mess` FOREIGN KEY (`read_by`) REFERENCES `manager` (`id`),
  CONSTRAINT `fk_sub_cli_mess` FOREIGN KEY (`client`) REFERENCES `subscriber` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;