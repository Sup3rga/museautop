CREATE TABLE `manager` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `mail` varchar(255) NOT NULL,
  `code` text NOT NULL,
  `nickname` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_man_mentor` (`created_by`),
  CONSTRAINT `fk_man_mentor` FOREIGN KEY (`created_by`) REFERENCES `manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
insert into `manager` (`active`, `code`, `created_at`, `created_by`, `firstname`, `id`, `lastname`, `mail`, `nickname`, `phone`) values (1, 'd033e22ae348aeb5660fc2140aec35850c4da997', '2026-03-06 19:52:18', NULL, 'Admin', 1, 'Admin', 'admin@museautop.com', 'admin', '+509 1234 2345');
insert into `manager` (`active`, `code`, `created_at`, `created_by`, `firstname`, `id`, `lastname`, `mail`, `nickname`, `phone`) values (1, 'd033e22ae348aeb5660fc2140aec35850c4da997', '2026-04-02 16:20:20', 1, 'Herve', 2, 'Geffrard', 'blacka.kers@gmail.com', 'Blacka.kers', '509 4628 8896');
